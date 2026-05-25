// @ts-nocheck
'use client'
import { useEffect } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { registerCharts, C, gridOpts, tickOpts, legendOpts, dlH } from '@/components/charts/ChartWrapper'
import type { DetailRow } from '@/lib/queries'

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt$ = (v: number) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 })
const fmtK = (v: number) => '$' + (v / 1000).toFixed(1) + 'k'

const dlBar = {
  anchor: 'end' as const, align: 'end' as const, offset: 2, clip: false,
  color: '#CBD5E1', font: { size: 9, weight: 700 },
}
const dlBarInside = {
  anchor: 'center' as const, align: 'center' as const,
  color: '#FFFFFF', font: { size: 9, weight: 700 }, clip: false,
}
const dlLine = {
  anchor: 'end' as const, align: 'top' as const, offset: 4,
  color: '#CBD5E1', font: { size: 9, weight: 700 }, clip: false,
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
interface SnapPeriod {
  label: string
  totalRev: number
  totalOrders: number
  newCust: number
  dcRev: number
  ffWeight: number
  deliveries: number
  repeatRate: number
  avgDays: number
  ssCash: number
  arBalance: number
  daysComplete?: number | null
}

interface Props {
  labels: string[]
  snapData: { prev: SnapPeriod; curr: SnapPeriod & { daysComplete?: number | null } }
  series: {
    dcR: (number | null)[]
    ffR: (number | null)[]
    tailR: (number | null)[]
    ssR: (number | null)[]
    totR: (number | null)[]
    newC: (number | null)[]
    sOrds: (number | null)[]
    dsOrds: (number | null)[]
    dsR: (number | null)[]
    ffW: (number | null)[]
    shift1: (number | null)[]
    shift2: (number | null)[]
    arV: (number | null)[]
    comfU: (number | null)[]
    comfR: (number | null)[]
    memNew: (number | null)[]
    memCan: (number | null)[]
    repeatPct: (number | null)[]
    avgD: (number | null)[]
  }
  topProducts: DetailRow[]
  svcBreakdown: DetailRow[]
  topMonthCustomers: DetailRow[]
}

export default function BrightonCharts({ labels, snapData, series: sr, topProducts, svcBreakdown, topMonthCustomers }: Props) {
  useEffect(() => { registerCharts() }, [])

  const { prev, curr } = snapData

  // ── snapshot card component ───────────────────────────────────────────────
  function SnapCard({ data, isPartial }: { data: SnapPeriod; isPartial?: boolean }) {
    const title = isPartial
      ? `${data.label} — Month to Date${data.daysComplete ? ` (${data.daysComplete} days)` : ''}`
      : `${data.label} — Full Month`
    return (
      <div style={{ ...card, padding: '10px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-bright)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          {title}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[
            { val: fmt$(data.totalRev), lbl: isPartial ? 'MTD Revenue' : 'Total Revenue' },
            { val: String(data.totalOrders), lbl: 'Total Orders' },
            { val: String(data.newCust), lbl: 'New Customers' },
            { val: fmt$(data.dcRev), lbl: 'Dry Cleaning' },
            { val: data.ffWeight.toLocaleString('en-US') + ' lbs', lbl: 'W&F Weight' },
            { val: String(data.deliveries), lbl: 'Deliveries' },
            { val: data.repeatRate + '%', lbl: 'Repeat Rate' },
            { val: String(data.avgDays), lbl: 'Avg Days' },
            { val: fmt$(data.ssCash), lbl: 'Self-Service Cash' },
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

  // ── KPI card component ────────────────────────────────────────────────────
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

  // ── chart render ──────────────────────────────────────────────────────────
  const H = 200  // standard chart height

  return (
    <div>
      {/* Partial-month banner */}
      <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid var(--amber)', borderRadius: 6, padding: '6px 14px', color: 'var(--amber)', fontSize: 11, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>&#9888;</span>
        <span><strong>{curr.label}</strong> is a partial month ({curr.daysComplete ?? '—'} of 31 days complete). MTD figures are not yet annualised.</span>
      </div>

      {/* SNAPSHOT ROW */}
      <div style={sectionLabel}>Snapshot</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <SnapCard data={prev} />
        <SnapCard data={curr} isPartial />
      </div>

      {/* KPI GRID — May MTD */}
      <div style={sectionLabel}>{curr.label} — KPI Breakdown</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
        <KpiCard val={fmt$(curr.totalRev)}   label="Total Revenue" />
        <KpiCard val={fmt$(curr.dcRev)}      label="Dry Cleaning" />
        <KpiCard val={fmt$(curr.ffWeight > 0 ? curr.ffWeight : 0)} label="W&F Revenue" sub={`${curr.ffWeight.toLocaleString()} lbs`} />
        <KpiCard val={String(curr.newCust)}  label="New Customers" />
        <KpiCard val={fmt$(curr.deliveries)} label="Delivery Revenue" />
        <KpiCard val={fmt$(curr.ssCash)}     label="Self-Service Cash" accent="var(--amber)" />
      </div>

      {/* REVENUE BY SERVICE TYPE */}
      <div style={sectionLabel}>Revenue by Service Type</div>
      <div style={{ marginBottom: 10 }}>
        <div style={card}>
          <div style={chartTitle}>Monthly Revenue by Service Type — with Total Revenue Line</div>
          <div style={{ height: 220 }}>
            <Bar
              data={{
                labels,
                datasets: [
                  { type: 'bar', label: 'Dry Cleaning',  data: sr.dcR,   backgroundColor: C.teal,       borderRadius: 3, stack: 'rev', datalabels: { ...dlBarInside, formatter: (v: number) => v >= 500 ? fmtK(v) : '' } },
                  { type: 'bar', label: 'Wash & Fold',   data: sr.ffR,   backgroundColor: C.tealBright, borderRadius: 3, stack: 'rev', datalabels: { ...dlBarInside, formatter: (v: number) => v >= 500 ? fmtK(v) : '' } },
                  { type: 'bar', label: 'Tailoring',     data: sr.tailR, backgroundColor: C.amber,       borderRadius: 3, stack: 'rev', datalabels: { ...dlBarInside, formatter: (v: number) => v >= 500 ? fmtK(v) : '' } },
                  { type: 'bar', label: 'Self-Service',  data: sr.ssR,   backgroundColor: C.purple,      borderRadius: 3, stack: 'rev', datalabels: { ...dlBarInside, formatter: (v: number) => v >= 500 ? fmtK(v) : '' } },
                  {
                    type: 'line', label: 'Total Revenue', data: sr.totR,
                    borderColor: C.white, backgroundColor: 'transparent',
                    borderWidth: 2, pointBackgroundColor: C.white, pointRadius: 4, tension: 0.2,
                    datalabels: { anchor: 'end', align: 'top', offset: 5, color: C.white, font: { size: 9, weight: 700 }, formatter: (v: number) => v ? fmtK(v) : '' },
                  } as any,
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: legendOpts, datalabels: dlH },
                scales: {
                  x: { grid: gridOpts, ticks: tickOpts, stacked: true },
                  y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v / 1000).toFixed(0) + 'k' }, stacked: true },
                },
                layout: { padding: { top: 24 } },
              }}
            />
          </div>
        </div>
      </div>

      {/* NEW CUSTOMERS */}
      <div style={grid2}>
        <div style={card}>
          <div style={chartTitle}>New Customers</div>
          <div style={{ height: H }}>
            <Line
              data={{ labels, datasets: [{ label: 'New Customers', data: sr.newC, borderColor: C.tealBright, backgroundColor: 'rgba(30,225,219,0.1)', borderWidth: 2.5, pointBackgroundColor: C.tealBright, pointRadius: 4, tension: 0.3, fill: true, datalabels: { ...dlLine, formatter: (v: number) => String(v) } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlLine }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts, beginAtZero: true } }, layout: { padding: { top: 20 } } }}
            />
          </div>
        </div>

        {/* SELF-SERVICE */}
        <div style={card}>
          <div style={chartTitle}>Self-Service Monthly Cash — 1st Shift vs 2nd Shift</div>
          <div style={{ height: H }}>
            <Bar
              data={{
                labels,
                datasets: [
                  { label: '1st Shift (8am–2pm)', data: sr.shift1, backgroundColor: C.teal,       borderRadius: 3, stack: 'ss', datalabels: { ...dlBarInside, formatter: (v: number) => v != null && v >= 500 ? fmtK(v) : '' } },
                  { label: '2nd Shift (2pm–8pm)', data: sr.shift2, backgroundColor: C.tealBright, borderRadius: 3, stack: 'ss', datalabels: { ...dlBarInside, formatter: (v: number) => v != null && v >= 500 ? fmtK(v) : '' } },
                ],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: legendOpts, datalabels: dlH },
                scales: {
                  x: { grid: gridOpts, ticks: tickOpts, stacked: true },
                  y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v / 1000).toFixed(0) + 'k' }, stacked: true, beginAtZero: true },
                },
                layout: { padding: { top: 20 } },
              }}
            />
          </div>
        </div>
      </div>

      {/* AR BALANCE */}
      <div style={{ ...card, marginBottom: 10 }}>
        <div style={chartTitle}>AR — Balance Due by Month ($)</div>
        <div style={{ height: H }}>
          <Bar
            data={{ labels, datasets: [{ label: 'Balance Due ($)', data: sr.arV, backgroundColor: 'rgba(255,107,107,0.75)', borderColor: '#FF6B6B', borderWidth: 1.5, borderRadius: 3, datalabels: { ...dlBar, formatter: (v: number) => v > 0 ? fmt$(v) : '' } }] }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => fmt$(v) }, beginAtZero: true } }, layout: { padding: { top: 20 } } }}
          />
        </div>
      </div>

      {/* PERFORMANCE TRENDS */}
      <div style={sectionLabel}>Performance Trends</div>

      {/* Channel + Delivery Revenue */}
      <div style={grid2}>
        <div style={card}>
          <div style={chartTitle}>Delivery vs In-Store Orders</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [
                { label: 'In-Store (S)',  data: sr.sOrds,  backgroundColor: C.teal,       borderRadius: 3, datalabels: { ...dlBar, formatter: (v: number) => String(v) } },
                { label: 'Delivery (DS)', data: sr.dsOrds, backgroundColor: C.tealBright, borderRadius: 3, datalabels: { ...dlBar, formatter: (v: number) => String(v) } },
              ] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: legendOpts, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts, beginAtZero: true } }, layout: { padding: { top: 20 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Delivery Revenue — Month over Month ($)</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [
                { type: 'bar',  label: 'Delivery Revenue ($)', data: sr.dsR, backgroundColor: C.tealBright, borderRadius: 3, datalabels: { ...dlBar, formatter: (v: number) => v > 0 ? fmtK(v) : '' } },
                { type: 'line', label: 'Trend', data: sr.dsR, borderColor: C.white, backgroundColor: 'transparent', borderWidth: 1.5, pointBackgroundColor: C.white, pointRadius: 3, tension: 0.3, datalabels: { display: false } } as any,
              ] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v / 1000).toFixed(0) + 'k' }, beginAtZero: true } }, layout: { padding: { top: 20 } } }}
            />
          </div>
        </div>
      </div>

      {/* W&F Weight + Repeat Rate */}
      <div style={grid2}>
        <div style={card}>
          <div style={chartTitle}>W&F Weight (lbs)</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [{ label: 'W&F Weight (lbs)', data: sr.ffW, backgroundColor: C.tealMid, borderRadius: 3, datalabels: { ...dlBar, formatter: (v: number) => v.toLocaleString('en-US') } }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlBar }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => v.toLocaleString() + ' lbs' }, beginAtZero: true } }, layout: { padding: { top: 20 } } }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Repeat Customer Rate (%) &amp; Avg Days Between Orders</div>
          <div style={{ height: H }}>
            <Line
              data={{ labels, datasets: [
                {
                  label: 'Repeat Rate (%)', data: sr.repeatPct,
                  borderColor: C.tealBright, backgroundColor: 'rgba(30,225,219,0.1)',
                  borderWidth: 2.5, pointBackgroundColor: C.tealBright, pointRadius: 4, tension: 0.3, fill: true,
                  yAxisID: 'y', spanGaps: true,
                  datalabels: { ...dlLine, formatter: (v: number | null) => v === null ? '' : v + '%' },
                },
                {
                  label: 'Avg Days Between Orders', data: sr.avgD,
                  borderColor: C.amber, backgroundColor: 'transparent',
                  borderWidth: 2, borderDash: [5, 3], pointBackgroundColor: C.amber, pointRadius: 4, tension: 0.3, fill: false,
                  yAxisID: 'y2', spanGaps: false,
                  datalabels: { ...dlLine, color: C.amber, formatter: (v: number | null) => v === null ? '' : v + 'd' },
                } as any,
              ] }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: legendOpts, datalabels: dlH },
                scales: {
                  x: { grid: gridOpts, ticks: tickOpts },
                  y:  { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => v + '%' }, beginAtZero: true, position: 'left' },
                  y2: { grid: { display: false }, ticks: { ...tickOpts, callback: (v: any) => v + 'd' }, beginAtZero: true, position: 'right' },
                },
                layout: { padding: { top: 20 } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Comforter + Membership */}
      <div style={grid2}>
        <div style={card}>
          <div style={chartTitle}>Comforter Program — Orders &amp; Revenue</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [
                {
                  type: 'bar', label: 'Orders', data: sr.comfU, backgroundColor: C.teal, borderRadius: 3, yAxisID: 'y',
                  datalabels: { ...dlBar, formatter: (v: number | null) => v === null ? '' : String(v) },
                },
                {
                  type: 'line', label: 'Revenue ($)', data: sr.comfR,
                  borderColor: C.amber, backgroundColor: 'transparent',
                  borderWidth: 2, pointBackgroundColor: C.amber, pointRadius: 4, tension: 0.3,
                  yAxisID: 'y2', spanGaps: false,
                  datalabels: { ...dlLine, color: C.amber, formatter: (v: number | null) => v === null ? '' : fmt$(v) },
                } as any,
              ] }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: legendOpts, datalabels: dlH },
                scales: {
                  x: { grid: gridOpts, ticks: tickOpts },
                  y:  { grid: gridOpts, ticks: tickOpts, beginAtZero: true, position: 'left', title: { display: true, text: 'Orders', color: C.gray, font: { size: 10 } } },
                  y2: { grid: { display: false }, ticks: { ...tickOpts, callback: (v: any) => '$' + v }, beginAtZero: true, position: 'right', title: { display: true, text: 'Revenue', color: C.gray, font: { size: 10 } } },
                },
                layout: { padding: { top: 20 } },
              }}
            />
          </div>
        </div>
        <div style={card}>
          <div style={chartTitle}>Membership Program — New vs Cancelled</div>
          <div style={{ height: H }}>
            <Bar
              data={{ labels, datasets: [
                { label: 'New Memberships', data: sr.memNew, backgroundColor: C.tealBright, borderRadius: 3, datalabels: { ...dlBar, formatter: (v: number | null) => v === null ? '' : String(v) } },
                { label: 'Cancellations',   data: sr.memCan, backgroundColor: C.neg,        borderRadius: 3, datalabels: { ...dlBar, formatter: (v: number | null) => v === null ? '' : String(v) } },
              ] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: legendOpts, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts, beginAtZero: true } }, layout: { padding: { top: 20 } } }}
            />
          </div>
        </div>
      </div>

      {/* TOP 5 PRODUCTS */}
      <div style={{ ...card, marginBottom: 10 }}>
        <div style={chartTitle}>Top 5 Products Sold — Units &amp; Revenue (All Months Combined)</div>
        <div style={{ height: 220 }}>
          <Bar
            data={{
              labels: topProducts.map(p => p.name ?? ''),
              datasets: [
                {
                  type: 'bar', label: 'Units Sold',
                  data: topProducts.map(p => parseFloat(p.value ?? '0')),
                  backgroundColor: C.teal, borderRadius: 3, yAxisID: 'y',
                  datalabels: { ...dlBar, formatter: (v: number) => v + ' units' },
                },
                {
                  type: 'line', label: 'Revenue ($)',
                  data: topProducts.map(p => parseFloat(p.secondaryValue ?? '0')),
                  borderColor: C.amber, backgroundColor: 'transparent',
                  borderWidth: 2, pointBackgroundColor: C.amber, pointRadius: 5,
                  yAxisID: 'y2',
                  datalabels: { anchor: 'top', align: 'top', offset: 4, color: C.amber, font: { size: 9, weight: 700 }, formatter: (v: number) => '$' + v.toFixed(0) },
                } as any,
              ],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: legendOpts, datalabels: dlH },
              scales: {
                x: { grid: gridOpts, ticks: tickOpts },
                y:  { grid: gridOpts, ticks: tickOpts, beginAtZero: true, position: 'left',  title: { display: true, text: 'Units Sold', color: C.gray, font: { size: 10 } } },
                y2: { grid: { display: false }, ticks: { ...tickOpts, callback: (v: any) => '$' + v }, beginAtZero: true, position: 'right', title: { display: true, text: 'Revenue', color: C.gray, font: { size: 10 } } },
              },
              layout: { padding: { top: 24 } },
            }}
          />
        </div>
      </div>

      {/* DETAILED BREAKDOWNS */}
      <div style={sectionLabel}>Detailed Breakdowns</div>
      <div style={grid3}>
        {/* Service Breakdown */}
        <div style={card}>
          <div style={{ ...chartTitle, borderBottom: '1px solid var(--border)', paddingBottom: 5, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Service Breakdown — {prev.label}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {['Service', 'Orders', 'Revenue', 'Mix'].map(h => (
                  <th key={h} style={{ color: 'var(--teal-mid)', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, padding: '3px 4px 3px 0', borderBottom: '1px solid var(--border)', textAlign: h === 'Service' ? 'left' : 'right', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {svcBreakdown.map(row => (
                <tr key={row.rank}>
                  <td style={{ padding: '4px 4px 4px 0', borderBottom: '1px solid rgba(53,59,71,0.4)' }}>{row.name}</td>
                  <td style={{ padding: '4px 4px 4px 0', borderBottom: '1px solid rgba(53,59,71,0.4)', textAlign: 'right' }}>{row.secondaryValue ?? '—'}</td>
                  <td style={{ padding: '4px 4px 4px 0', borderBottom: '1px solid rgba(53,59,71,0.4)', textAlign: 'right' }}>{row.value ? '$' + parseFloat(row.value).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
                  <td style={{ padding: '4px 4px 4px 0', borderBottom: '1px solid rgba(53,59,71,0.4)', textAlign: 'right' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Customers */}
        <div style={card}>
          <div style={{ ...chartTitle, borderBottom: '1px solid var(--border)', paddingBottom: 5, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Top 5 Customers — {prev.label}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {['Customer', 'Ord.', 'Revenue'].map(h => (
                  <th key={h} style={{ color: 'var(--teal-mid)', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10, padding: '3px 4px 3px 0', borderBottom: '1px solid var(--border)', textAlign: h === 'Customer' ? 'left' : 'right', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topMonthCustomers.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '4px 4px 4px 0', borderBottom: '1px solid rgba(53,59,71,0.4)' }}>{i + 1}. {row.name}</td>
                  <td style={{ padding: '4px 4px 4px 0', borderBottom: '1px solid rgba(53,59,71,0.4)', textAlign: 'right' }}>{row.secondaryValue ?? '—'}</td>
                  <td style={{ padding: '4px 4px 4px 0', borderBottom: '1px solid rgba(53,59,71,0.4)', textAlign: 'right' }}>{row.value ? '$' + parseFloat(row.value).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Placeholder for 3rd column */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', fontSize: 11 }}>
          Brighton opened Sep 2025 — no commercial accounts yet.
        </div>
      </div>
    </div>
  )
}
