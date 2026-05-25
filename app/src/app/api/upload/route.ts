import { NextRequest, NextResponse } from 'next/server'
import { getApiUserAccess } from '@/lib/access'
import Papa from 'papaparse'
import { db } from '@/lib/db'
import { metricValues, detailLists, dimensionValues, uploadLog } from '../../../../drizzle/schema'
import { sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const access = await getApiUserAccess()
  if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (access.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const userId = access.userId

  const form = await req.formData()
  const location    = form.get('location') as string
  const templateType = form.get('templateType') as string
  const file        = form.get('file') as File | null
  if (!file || !location || !templateType) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const text = await file.text()
  const { data, errors } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  if (errors.length) return NextResponse.json({ error: errors[0].message }, { status: 400 })

  let rowCount = 0

  if (templateType === 'metrics') {
    const rows = data.map(row => ({
      location,
      periodGrain: 'month',
      periodLabel: row.period_label,
      metricKey: row.metric_key,
      value: row.value || null,
      isPartial: row.is_partial === 'true' || row.is_partial === '1',
      daysComplete: row.days_complete ? parseInt(row.days_complete) : undefined,
      daysInMonth: row.days_in_month ? parseInt(row.days_in_month) : undefined,
      isRatio: row.is_ratio === 'true' || row.is_ratio === '1',
    }))
    for (let i = 0; i < rows.length; i += 100) {
      await db.insert(metricValues).values(rows.slice(i, i+100)).onConflictDoUpdate({
        target: [metricValues.location, metricValues.periodGrain, metricValues.periodLabel, metricValues.metricKey],
        set: { value: sql`excluded.value`, isPartial: sql`excluded.is_partial`, daysComplete: sql`excluded.days_complete`, daysInMonth: sql`excluded.days_in_month`, isRatio: sql`excluded.is_ratio` },
      })
    }
    rowCount = rows.length

  } else if (templateType === 'customers') {
    const rows = data.map(row => ({
      location,
      periodLabel: row.period_label,
      listType: row.list_type,
      rank: parseInt(row.rank),
      name: row.name || null,
      value: row.value || null,
      secondaryValue: row.secondary_value || null,
    }))
    await db.insert(detailLists).values(rows).onConflictDoUpdate({
      target: [detailLists.location, detailLists.periodLabel, detailLists.listType, detailLists.rank],
      set: { name: sql`excluded.name`, value: sql`excluded.value`, secondaryValue: sql`excluded.secondary_value` },
    })
    rowCount = rows.length

  } else if (templateType === 'dimensions') {
    const rows = data.map(row => ({
      location,
      periodLabel: row.period_label,
      dimensionType: row.dimension_type,
      dimensionKey: row.dimension_key,
      value: row.value || null,
      isRatio: row.is_ratio === 'true' || row.is_ratio === '1',
    }))
    await db.insert(dimensionValues).values(rows).onConflictDoUpdate({
      target: [dimensionValues.location, dimensionValues.periodLabel, dimensionValues.dimensionType, dimensionValues.dimensionKey],
      set: { value: sql`excluded.value`, isRatio: sql`excluded.is_ratio` },
    })
    rowCount = rows.length
  }

  await db.insert(uploadLog).values({ location, templateType, uploadedBy: userId, rowCount })

  return NextResponse.json({ ok: true, rowCount })
}
