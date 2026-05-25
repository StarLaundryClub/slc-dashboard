// @ts-nocheck
'use client'
import { useEffect } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { registerCharts, C, gridOpts, tickOpts, legendOpts, dlH } from '@/components/charts/ChartWrapper'
import type { DetailRow } from '@/lib/queries'

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt$ = (v: number) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 })
const fmtK = (v: number) => '$' + Math.round(v / 1000) + 'k'

const dlBar = {
  anchor: 'end' as const, align: 'end' as const, offset: 2, clip: false,
  color: '#CBD5E1', font: { size: 9, weight: 700 },
}
const dlBarInside = {
  anchor: 'center' as const, align: 'center' as const,
  color: '#fff', font: { size: 9, weight: 700 }, clip: false,
}
const dlLine = {
  anchor: 'end' as const, align: 'top' as const, offset: 4,
  color: '#CBD5E1', font: { size: 9, weight: 700 }, clip: false,
}
const insideDL = {
  anchor: 'end' as const, align: 'end' as const, offset: 2, clip: false,
  color: '#CBD5E1', font: { size: 8, weight: 700 },
  formatter: (v: number) => v > 0 ? fmtK(v) : '',
}

// ── card helpers ──────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 12,
}
const sectionLabel: React.CSSProperties = {
  fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
  color: 'var(--teal-mid)', marginBottom: 7,
}
const chartTitle: React.CSSProperties = {
  fontSize: 10, color: 'var(--gray)', marginBottom: 6, fontWeight: 600,
}
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10,
}
const grid3: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10,
}

// ── types ────────────────────────────────────────────────────────────────────
interface SnapCurr {
  label: string
  daysComplete?: number | null
  totalRev: number
  centsRev: number
  fascardRev: number
  totalOrders: number
  dcRev: number
  shirtRev: number
  ffRev: number
  deliveryRev: number
  repeatRate: number
  ffWeight: number
  tailRev: number
  comfU: number
  newCust: number
}
interface SnapPrev {
  label: string
  totalRev: number
  centsRev: number
  fascardRev: number
  totalOrders: number
  dcRev: number
  shirtRev: number
  ffRev: number
  deliveryRev: number
  repeatRate: number
  ffWeight: number
}

interface Props {
  labels: string[]
  weekLabels: string[]
  snapData: { prev: SnapPrev; curr: SnapCurr }
  series: {
    dcR: (number | null)[]
    shirtR: (number | null)[]
    ffR: (number | null)[]
    tailR: (number | null)[]
    comfR: (number | null)[]
    centsR: (number | null)[]
    totR: (number | null)[]
    ordN: (number | null)[]
    newC: (number | null)[]
    repPct: (number | null)[]
    comfU: (number | null)[]
    dsR: (number | null)[]
    dsN: (number | null)[]
    ffW: (number | null)[]
  }
  weekSeries: { rev: (number | null)[]; ords: (number | null)[] }
  fascardLabels: string[]
  fascardSeries: number[][]
  fascardLabelsDisplay: string[]
  topCustomers: DetailRow[]
  svcBreakdown: DetailRow[]
  paymentMethods: DetailRow[]
}

export default function NashuaCharts({
  labels, weekLabels, snapData, series: sr,
  weekSeries, fascardLabels, fascardSeries, fascardLabelsDisplay,
  topCustomers, svcBreakdown, paymentMethods,
}: Props) {
  useEffect(() => { registerCharts() }, [])

  const { prev, curr } = snapData

  // ── snapshot card ─────────────────────────────────────────────────────────
  function SnapCard({ data, isPartial }: { data: SnapPrev | SnapCurr; isPartial?: boolean }) {
    const dc = 'daysComplete' in data ? data.daysComplete : undefined
    const title = isPartial
      ? `${data.label} — Month to Date${dc ? ` (${dc} days)` : ''}`
      : `${data.label} — Full Month`
    return (
      <div style={{ ...card, padding: '10px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-bright)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          {title}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[
            { val: fmt$(data.totalRev),   lbl: isPartial ? 'Combined MTD' : 'Combined Rev' },
            { val: fmt$(data.centsRev),   lbl: isPartial ? 'Cents MTD' : 'Cents Collected' },
            { val: fmt$(data.fascardRev), lbl: isPartial ? 'Fascard MTD' : 'Fascard Revenue' },
            { val: String(data.totalOrders), lbl: 'Total Orders' },
            { val: fmt$(data.dcRev),      lbl: 'Dry Cleaning' },
            { val: fmt$(data.shirtRev),   lbl: 'Shirt Laundry' },
            { val: fmt$(data.ffRev),      lbl: 'Wash & Fold' },
            { val: fmt$(data.deliveryRev),lbl: 'Delivery Rev' },
            { val: data.repeatRate + '%', lbl: 'Repeat Rate' },
            { val: data.ffWeight.toLocaleString('en-US') + ' lbs', lbl: 'W&F Weight' },
          ].map(({ val, lbl }) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{val}</div>
              <div style={{ fontSize: 9, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 1 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── KPI card ──────────────────────────────────────────────────────────────
  function KpiCard({ val, label, sub, accent }: { val: string; label: string; sub?: string; accent?: string }) {
    return (
      <div style={{ ...card, textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: accent ? `2px solid ${accent}` : undefined }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent ? undefined : 'linear-gradient(90deg,var(--teal),var(--teal-bright))', display: accent ? 'none' : 'block' }} />
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{val}</div>
        <div style={{ fontSize: 9, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: 'var(--teal-mid)', marginTop: 2 }}>{sub}</div>}
      </div>
    )
  }

  const H = 200

  // Fascard stacked bar colors
  const fcColors = [C.teal, C.tealBright, C.tealMid, C.amber]
  const fcDL = { anchor: 'center' as const, align: 'center' as const, color: '#fff', font: { size: 8, weight: 700 }, formatter: (v: number) => v > 500 ? fmtK(v) : '' }

  return (
    <div>
      {/* Banner */}
      <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid var(--amber)', borderRadius: 6, padding: '6px 14px', color: 'var(--amber)', fontSize: 11, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>&#9888;</span>
        <span><strong>{curr.label}</strong> is a partial month ({curr.daysComplete ?? '—'} of 31 days complete). MTD figures are not annualised.</span>
      </div>

      {/* SNAPSHOTS */}
      <div style={sectionLabel}>Snapshot</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <SnapCard data={prev} />
        <SnapCard data={curr} isPartial />
      </div>

      {/* KPI GRID */}
      <div style={sectionLabel}>{curr.label} — KPI Breakdown</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
        <KpiCard val={fmt$(curr.totalRev)}   label="Combined Rev MTD" />
        <KpiCard val={fmt$(curr.centsRev)}   label="Cents Collected" />
        <KpiCard val={fmt$(curr.fascardRev)} label="Fascard Self-Svc" />
        <KpiCard val={fmt$(curr.dcRev)}      label="Dry Cleaning" />
        <KpiCard val={fmt$(curr.shirtRev)}   label="Shirt Laundry" />
        <KpiCard val={fmt$(curr.ffRev)}      label="Wash & Fold" />
        <KpiCard val={fmt$(curr.tailRev)}    label="Tailoring" />
        <KpiCard val={fmt$(curr.deliveryRev)} label="Delivery Revenue" />
        <KpiCard val={String(curr.comfU)}    label="Comforter Units" />
        <KpiCard val={curr.repeatRate + '%'} label="Repeat Rate" />
        <KpiCard val={String(curr.newCust)}  label="New Customers" />
      </div>

      {/* REVENUE BY TYPE */}
      <div style={sectionLabel}>Revenue by Service Type</div>

      {/* Combined Revenue stacked bar */}
      <div style={{ ...card, marginBottom: 10 }}>
        <div style={chartTitle}>Combined Revenue by Category — with Total Combined Line</div>
        <div style={{ height: 260 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: 'Dry Cleaning',       data: sr.dcR,    backgroundColor: C.teal,    borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Shirt Laundry',      data: sr.shirtR, backgroundColor: '#1aa88c', borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Wash & Fold',        data: sr.ffR,    backgroundColor: C.tealBright, borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Tailoring',          data: sr.tailR,  backgroundColor: C.purple,  borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Comforter',          data: sr.comfR,  backgroundColor: C.tealMid, borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Fascard (Self-Svc)', data: sr.centsR, backgroundColor: C.amber,   borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                {
                  type: 'line', label: 'Total Combined', data: sr.totR,
                  borderColor: C.white, backgroundColor: 'transparent',
                  borderWidth: 2.5, pointBackgroundColor: C.white, pointRadius: 6, tension: 0.3, order: -1,
                  datalabels: { anchor: 'end', align: 'top', offset: 8, clip: false, color: C.white, font: { size: 11, weight: '700' as const }, formatter: (v: number) => fmtK(v) + ' total' },
                } as any,
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              layout: { padding: { top: 40, right: 10 } },
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 9 }, color: C.gray } }, datalabels: dlH },
              scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + Math.round(v / 1000) + 'k' } } },
            }}
          />
        </div>
      </div>

      {/* Cents service revenue (same minus Fascard) */}
      <div style={{ ...card, marginBottom: 10 }}>
        <div style={chartTitle}>Cents Service Revenue Mix — with Total Cents Line</div>
        <div style={{ height: 240 }}>
          <Bar
            data={{
              labels,
              datasets: [
                { label: 'Dry Cleaning',  data: sr.dcR,    backgroundColor: C.teal,       borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Shirt Laundry', data: sr.shirtR, backgroundColor: '#1aa88c',    borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Wash & Fold',   data: sr.ffR,    backgroundColor: C.tealBright, borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Tailoring',     data: sr.tailR,  backgroundColor: C.purple,     borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                { label: 'Comforter',     data: sr.comfR,  backgroundColor: C.tealMid,    borderRadius: 3, borderSkipped: false, datalabels: insideDL } as any,
                {
                  type: 'line', label: 'Total Cents', data: sr.dcR.map((_, i) => {
                    const vals = [sr.dcR[i], sr.shirtR[i], sr.ffR[i], sr.tailR[i], sr.comfR[i]]
                    return vals.every(v => v === null) ? null : vals.reduce((a, v) => (a ?? 0) + (v ?? 0), 0 as number | null)
                  }),
                  borderColor: C.amber, backgroundColor: 'transparent',
                  borderWidth: 2.5, pointBackgroundColor: C.amber, pointRadius: 6, tension: 0.3, order: -1,
                  datalabels: { anchor: 'end', align: 'top', offset: 8, clip: false, color: C.amber, font: { size: 11, weight: '700' as const }, formatter: (v: number) => fmtK(v) },
                } as any,
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              layout: { padding: { top: 40, right: 10 } },
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 9 }, color: C.gray } }, datalabels: dlH },
              scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + Math.round(v / 1000) + 'k' } } },
            }}
          />
        </div>
      </div>

      {/* ORDERS + NEW CUSTOMERS + REPEAT */}
      <div style={sectionLabel}>Customer &amp; Order Trends</div>
      <div style={grid3}>
        <div style={card}>
          <div style={chartTitle}>Monthly Orders</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'Orders', data: sr.ordN, backgroundColor: C.teal, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => String(v) } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>New Customers</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'New Customers', data: sr.newC, backgroundColor: C.tealBright, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => String(v) } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Repeat Rate %</div>
          <div style={{ height: H }}>
            <Line
              data={{ labels, datasets: [{ label: 'Repeat Rate %', data: sr.repPct, borderColor: C.amber, backgroundColor: 'rgba(245,158,11,0.15)', tension: 0.3, fill: true, pointBackgroundColor: C.amber, pointRadius: 5, datalabels: { ...dlLine, color: C.amber, formatter: (v: number) => v + '%' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlLine }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => v + '%' } } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
      </div>

      {/* COMFORTER + TAILORING + DELIVERY */}
      <div style={sectionLabel}>Service Performance</div>
      <div style={grid3}>
        <div style={card}>
          <div style={chartTitle}>Comforter Units</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'Units', data: sr.comfU, backgroundColor: C.tealMid, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => v + ' units' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Comforter Revenue ($)</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'Revenue', data: sr.comfR, backgroundColor: C.teal, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => fmt$(v) } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + v.toLocaleString() } } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Tailoring Revenue ($)</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'Revenue', data: sr.tailR, backgroundColor: C.amber, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => v > 0 ? fmt$(v) : '' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + v.toLocaleString() } } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
      </div>

      {/* DELIVERY + W&F WEIGHT */}
      <div style={grid3}>
        <div style={card}>
          <div style={chartTitle}>Delivery Revenue ($)</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'Delivery Revenue', data: sr.dsR, backgroundColor: C.pink, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => v > 0 ? fmtK(v) : '' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + v.toLocaleString() } } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Delivery Orders</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'Delivery Orders', data: sr.dsN, backgroundColor: C.pink, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => v + ' orders' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>W&amp;F Weight (lbs)</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'W&F Lbs', data: sr.ffW, backgroundColor: C.amber, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number) => v > 0 ? v.toLocaleString('en-US') + ' lbs' : '' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
      </div>

      {/* WEEKLY CHARTS */}
      <div style={sectionLabel}>Weekly Breakdown — {curr.label}</div>
      <div style={grid2}>
        <div style={card}>
          <div style={chartTitle}>Weekly Revenue ($)</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels: weekLabels, datasets: [{ label: 'Revenue ($)', data: weekSeries.rev, backgroundColor: C.teal, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number | null) => v && v > 0 ? fmtK(v) : '' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + v.toLocaleString() } } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Weekly Orders</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels: weekLabels, datasets: [{ label: 'Orders', data: weekSeries.ords, backgroundColor: C.teal, borderRadius: 4, datalabels: { ...dlBar, formatter: (v: number | null) => v !== null ? String(v) : '' } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 24 } } }}
            />
          </div>
        </div>
      </div>

      {/* FASCARD 12-MONTH */}
      <div style={sectionLabel}>Fascard — 12-Month Breakdown</div>
      <div style={{ ...card, marginBottom: 10 }}>
        <div style={chartTitle}>Fascard Payment Methods — 12 Months (Stacked)</div>
        <div style={{ height: 240 }}>
          <Bar
            data={{
              labels: fascardLabels,
              datasets: fascardSeries.map((data, i) => ({
                label: fascardLabelsDisplay[i],
                data,
                backgroundColor: fcColors[i] ?? C.gray,
                stack: 'fc',
                datalabels: i < fascardSeries.length - 1 ? fcDL : {
                  ...fcDL,
                  anchor: 'end' as const, align: 'end' as const, color: '#CBD5E1',
                  formatter: (_: number, ctx: any) => {
                    const ds = ctx.chart.data.datasets
                    const idx = ctx.dataIndex
                    const total = (ds as any[]).reduce((s: number, d: any) => s + (d.data[idx] || 0), 0)
                    return fmtK(total)
                  },
                },
              })),
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              scales: {
                x: { stacked: true, grid: gridOpts, ticks: { ...tickOpts, font: { size: 9 } } },
                y: { stacked: true, grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + Math.round(v / 1000) + 'k' } },
              },
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 }, color: C.gray } }, datalabels: dlH },
              layout: { padding: { top: 20 } },
            }}
          />
        </div>
      </div>

      {/* CHARTS: Top Customers + Service Doughnut + Payment Doughnut */}
      <div style={sectionLabel}>Detailed Breakdowns — {curr.label}</div>
      <div style={grid3}>
        {/* Top 5 Customers horizontal bar */}
        <div style={card}>
          <div style={chartTitle}>Top 5 Customers — {curr.label}</div>
          <div style={{ height: 200 }}>
            <Bar
              data={{
                labels: topCustomers.map(c => {
                  const parts = (c.name ?? '').split(' ')
                  return parts.length >= 2 ? parts[0][0].toUpperCase() + '. ' + parts[parts.length - 1] : (c.name ?? '')
                }),
                datasets: [{
                  label: 'Revenue',
                  data: topCustomers.map(c => parseFloat(c.value ?? '0')),
                  backgroundColor: C.teal, borderRadius: 3,
                  datalabels: { anchor: 'end', align: 'end', offset: 4, clip: false, color: '#CBD5E1', font: { size: 9, weight: 700 }, formatter: (v: number) => '$' + v.toLocaleString('en-US') },
                }],
              }}
              options={{
                indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false,
                layout: { padding: { right: 70 } },
                scales: { x: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + v.toLocaleString() } }, y: { grid: gridOpts, ticks: tickOpts } },
                plugins: { legend: { display: false }, datalabels: dlH },
              }}
            />
          </div>
        </div>

        {/* Service breakdown doughnut */}
        <div style={card}>
          <div style={chartTitle}>Service Mix — {curr.label}</div>
          <div style={{ height: 200 }}>
            <Doughnut
              data={{
                labels: svcBreakdown.map(r => r.name ?? ''),
                datasets: [{ data: svcBreakdown.map(r => parseFloat(r.value ?? '0')), backgroundColor: [C.teal, C.tealBright, C.amber, C.tealMid, C.gray, C.purple, C.pink, C.blue], borderColor: '#22262f', borderWidth: 2 }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false, cutout: '55%',
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 8, padding: 5, font: { size: 10 }, color: C.gray } },
                  datalabels: {
                    color: C.white, font: { size: 9, weight: 700 },
                    formatter: (v: number, ctx: any) => {
                      const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + b, 0)
                      const pct = Math.round(v / total * 100)
                      return pct >= 10 ? pct + '%' : ''
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Payment methods doughnut */}
        <div style={card}>
          <div style={chartTitle}>Payment Methods — {curr.label}</div>
          <div style={{ height: 200 }}>
            <Doughnut
              data={{
                labels: paymentMethods.map(r => r.name ?? ''),
                datasets: [{ data: paymentMethods.map(r => parseFloat(r.value ?? '0')), backgroundColor: [C.teal, C.tealBright, C.amber, C.tealMid, C.gray], borderColor: '#22262f', borderWidth: 2 }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false, cutout: '55%',
                plugins: {
                  legend: { position: 'right', labels: { boxWidth: 8, padding: 5, font: { size: 10 }, color: C.gray } },
                  datalabels: {
                    color: C.white, font: { size: 9, weight: 700 },
                    formatter: (v: number, ctx: any) => {
                      const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + b, 0)
                      const pct = Math.round(v / total * 100)
                      return pct >= 10 ? pct + '%' : ''
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
