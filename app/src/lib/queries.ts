import { db } from './db'
import { metricValues, detailLists, dimensionValues } from '../../drizzle/schema'
import { eq, and, inArray } from 'drizzle-orm'

export type MetricRow = { periodLabel: string; metricKey: string; value: string | null; isPartial: boolean; daysComplete: number | null; daysInMonth: number | null }
export type DetailRow  = { periodLabel: string; listType: string; rank: number; name: string | null; value: string | null; secondaryValue: string | null }
export type DimRow     = { periodLabel: string; dimensionType: string; dimensionKey: string; value: string | null; isRatio: boolean }

export async function getMetrics(location: string, grain = 'month'): Promise<MetricRow[]> {
  return db.select({
    periodLabel: metricValues.periodLabel,
    metricKey: metricValues.metricKey,
    value: metricValues.value,
    isPartial: metricValues.isPartial,
    daysComplete: metricValues.daysComplete,
    daysInMonth: metricValues.daysInMonth,
  }).from(metricValues).where(and(
    eq(metricValues.location, location),
    eq(metricValues.periodGrain, grain),
  ))
}

export async function getDetails(location: string): Promise<DetailRow[]> {
  return db.select({
    periodLabel: detailLists.periodLabel,
    listType: detailLists.listType,
    rank: detailLists.rank,
    name: detailLists.name,
    value: detailLists.value,
    secondaryValue: detailLists.secondaryValue,
  }).from(detailLists).where(eq(detailLists.location, location))
}

export async function getDimensions(location: string): Promise<DimRow[]> {
  return db.select({
    periodLabel: dimensionValues.periodLabel,
    dimensionType: dimensionValues.dimensionType,
    dimensionKey: dimensionValues.dimensionKey,
    value: dimensionValues.value,
    isRatio: dimensionValues.isRatio,
  }).from(dimensionValues).where(eq(dimensionValues.location, location))
}

// Build a map: period → metricKey → number
export function buildMetricMap(rows: MetricRow[]): Record<string, Record<string, number | null>> {
  const map: Record<string, Record<string, number | null>> = {}
  for (const r of rows) {
    if (!map[r.periodLabel]) map[r.periodLabel] = {}
    map[r.periodLabel][r.metricKey] = r.value != null ? parseFloat(r.value) : null
  }
  return map
}

// Extract ordered series for a metric across sorted period labels
export function series(map: Record<string, Record<string, number | null>>, labels: string[], key: string): (number | null)[] {
  return labels.map(lbl => map[lbl]?.[key] ?? null)
}

// Get sorted unique month labels for a location's data
export function monthLabels(rows: MetricRow[]): string[] {
  const lbls = [...new Set(rows.filter(r => r.periodLabel.match(/\d{4}|\*$/)).map(r => r.periodLabel))]
  // rough sort by extracting year+month
  return lbls.sort((a, b) => labelToSortKey(a) - labelToSortKey(b))
}

function labelToSortKey(lbl: string): number {
  const months: Record<string, number> = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 }
  const clean = lbl.replace('*', '').trim()
  const [mon, yr] = clean.split(' ')
  return parseInt(yr || '2026') * 100 + (months[mon] || 0)
}
