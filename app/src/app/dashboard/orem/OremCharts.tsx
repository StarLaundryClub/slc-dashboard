// @ts-nocheck
'use client'
import { useEffect } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { registerCharts, C, gridOpts, tickOpts, dlH, dlC, dlL, dlSeg } from '@/components/charts/ChartWrapper'

const SECTION = { fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--teal-mid)', marginBottom: 7, paddingLeft: 2 }
const CARD = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 12px 8px' }
const KPI_CARD = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 10px 8px', textAlign: 'center' as const, position: 'relative' as const, overflow: 'hidden' as const }
const GRID3 = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }
const GRID2 = { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 10 }
const GRID4 = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }

function $ (v: number) { return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 }) }
function chg(curr: number, prev: number) {
  if (!prev) return null
  const pct = ((curr - prev) / prev) * 100
  return { val: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%', cls: pct >= 0 ? '#1EE1DB' : C.neg }
}

interface SnapPeriod {
  label: string; daysComplete?: number | null; totalRev: number; totalOrders: number; newCust: number; ffRev: number; ffWt: number; deliveries: number; repeat: number; centsRev: number; comf: number; ar: number; avgDays: number; huebsch: number; vending: number;
}

interface Props {
  labels: string[]
  snapData: { prev: SnapPeriod; curr: SnapPeriod }
  series: Record<string, (number | null)[]>
  topMonthCustomers: { name: string | null; value: string | null }[]
  topAllCustomers: { name: string | null; value: string | null }[]
  topProducts: { name: string | null; value: string | null }[]
  svcBreakdown: { name: string | null; value: string | null }[]
  sizeCycles: { size: string; data: number[] }[]
  sizeTpd: { size: string; data: number[] }[]
}

function SnapCard({ period, compare }: { period: SnapPeriod; compare: SnapPeriod }) {
  const rows = [
    ['Total Revenue', $(period.totalRev), chg(period.totalRev, compare.totalRev)],
    ['Total Orders', period.totalOrders, chg(period.totalOrders, compare.totalOrders)],
    ['New Customers', period.newCust, chg(period.newCust, compare.newCust)],
    ['F&F Revenue', $(period.ffRev), chg(period.ffRev, compare.ffRev)],
    ['F&F Weight', period.ffWt.toFixed(0) + ' lbs', chg(period.ffWt, compare.ffWt)],
    ['Deliveries', period.deliveries, chg(period.deliveries, compare.deliveries)],
    ['Repeat Customers', period.repeat, chg(period.repeat, compare.repeat)],
    ['Cents Revenue', $(period.centsRev), chg(period.centsRev, compare.centsRev)],
    ['Comforters', period.comf, chg(period.comf, compare.comf)],
    ['AR Balance Due', $(period.ar), null],
    ['Avg Days/Order', period.avgDays.toFixed(1), null],
    ['Huebsch Rev', $(period.huebsch), chg(period.huebsch, compare.huebsch)],
    ['Vending Machine', $(period.vending), chg(period.vending, compare.vending)],
  ]
  return (
    <div style={{ ...CARD, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
      <div style={{ gridColumn: '1/-1', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--teal-bright)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
        {period.label}{period.daysComplete ? ` — MTD (${period.daysComplete} days)` : ' — Full Month'}
      </div>
      {rows.map(([lbl, val, c]: any) => (
        <div key={String(lbl)} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{val}</div>
          <div style={{ fontSize: 9, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 1 }}>{lbl}</div>
          {c && <span style={{ fontSize: 10, fontWeight: 600, color: c.cls }}>{c.val}</span>}
        </div>
      ))}
    </div>
  )
}

export default function OremCharts({ labels, snapData, series: s, topMonthCustomers, topAllCustomers, topProducts, svcBreakdown, sizeCycles, sizeTpd }: Props) {
  useEffect(() => { registerCharts() }, [])

  const sizeColors = [C.teal, C.tealBright, C.tealMid, C.amber, C.blue]
  const MTPD = snapData.curr.daysComplete ? (s.mWC[s.mWC.length-1] ?? 0) / snapData.curr.daysComplete : 0

  return (
    <div>
      {/* Banner */}
      {snapData.curr.daysComplete && (
        <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid var(--amber)', borderRadius: 6, padding: '6px 14px', color: 'var(--amber)', fontSize: 11, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ {snapData.curr.label.replace('*','')} is a partial month ({snapData.curr.daysComplete} of 31 days). Data is MTD only.
        </div>
      )}

      {/* Snapshot cards */}
      <div style={SECTION}>— Monthly Snapshot</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <SnapCard period={snapData.prev} compare={snapData.prev} />
        <SnapCard period={snapData.curr} compare={snapData.prev} />
      </div>

      {/* KPI Grid */}
      <div style={SECTION}>— {snapData.curr.label} KPI Breakdown</div>
      <div style={GRID4}>
        {[
          ['💰', $(snapData.curr.totalRev), 'Total Revenue'],
          ['🧺', $(snapData.curr.ffRev), 'F&F Revenue'],
          ['🪙', $(snapData.curr.centsRev), 'Cents Revenue'],
          ['👤', snapData.curr.newCust, 'New Customers'],
          ['🔁', snapData.curr.repeat, 'Repeat Customers'],
          ['🚚', snapData.curr.deliveries, 'Deliveries'],
          ['⚖️', snapData.curr.ffWt.toFixed(0) + ' lbs', 'F&F Weight'],
          ['🛏️', snapData.curr.comf, 'Comforters'],
          ['📋', $(snapData.curr.ar), 'AR Balance Due'],
          ['📅', snapData.curr.avgDays.toFixed(1), 'Avg Days/Order'],
          ['🏭', $(snapData.curr.huebsch), 'Huebsch Revenue'],
          ['🥤', $(snapData.curr.vending), 'Vending Machine'],
        ].map(([icon, val, lbl]) => (
          <div key={String(lbl)} style={KPI_CARD}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, var(--teal), var(--teal-bright))` }} />
            <span style={{ fontSize: 14 }}>{icon}</span>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, marginTop: 3 }}>{val}</div>
            <div style={{ fontSize: 9, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Machine KPIs */}
      <div style={SECTION}>— Machine Performance ({snapData.curr.label})</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
        {[
          ['🔵', s.mWC[s.mWC.length-1] ?? 0, 'Washer Cycles'],
          ['🟠', s.mDC[s.mDC.length-1] ?? 0, 'Dryer Cycles'],
          ['🟢', ((s.mWC[s.mWC.length-1] ?? 0) + (s.mDC[s.mDC.length-1] ?? 0)), 'Total Cycles'],
          ['⚡', (s.mTPD[s.mTPD.length-1] ?? 0).toFixed(1), 'Avg Turns/Day'],
        ].map(([icon, val, lbl]) => (
          <div key={String(lbl)} style={KPI_CARD}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, var(--teal), var(--teal-bright))` }} />
            <span style={{ fontSize: 14 }}>{icon}</span>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, marginTop: 3 }}>{val}</div>
            <div style={{ fontSize: 9, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div style={SECTION}>— Revenue Trends</div>
      <div style={{ ...CARD, marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Revenue Breakdown</div>
        <div style={{ height: 240 }}>
          <Bar data={{ labels, datasets: [
            { type: 'bar' as any, label: 'Fluff & Fold', data: s.ffR, backgroundColor: C.teal, stack: 's', datalabels: dlSeg },
            { type: 'bar' as any, label: 'Cents Revenue', data: s.ssR, backgroundColor: C.tealMid, stack: 's', datalabels: dlSeg },
            { type: 'bar' as any, label: 'Huebsch', data: s.huebR, backgroundColor: '#E91E63', stack: 's', datalabels: dlSeg },
            { type: 'bar' as any, label: 'Vending', data: s.vendR, backgroundColor: '#9C27B0', stack: 's', datalabels: dlSeg },
            { type: 'line' as any, label: 'Total Revenue', data: s.totR, borderColor: C.amber, backgroundColor: 'transparent', tension: 0.4, pointRadius: 5, pointBackgroundColor: C.amber, borderWidth: 2, yAxisID: 'y', datalabels: { display: true, align: 'top' as any, color: C.amber, font: { size: 9, weight: '600' as any }, formatter: (v: number) => v > 0 ? '$' + Math.round(v/1000) + 'k' : '' } },
          ]}} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts, stacked: true }, y: { grid: gridOpts, ticks: tickOpts, stacked: true } }, layout: { padding: { top: 20 } } }} />
        </div>
      </div>

      {/* Charts grid: customers, deliveries, repeat */}
      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>New Customers</div>
          <div style={{ height: 160 }}>
            <Line data={{ labels, datasets: [{ data: s.newC, borderColor: C.tealBright, backgroundColor: C.tealBright + '33', tension: 0.4, fill: true, pointRadius: 4, datalabels: dlL }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlL }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Deliveries vs In-Store</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [{ label: 'Delivery (DS)', data: s.dsC, backgroundColor: C.teal, datalabels: dlC }, { label: 'In-Store (S)', data: s.sC, backgroundColor: C.tealMid, datalabels: dlC }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlC }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Repeat Customers + Avg Days</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [
              { type: 'bar' as any, label: 'Repeat Customers', data: s.repC, backgroundColor: C.tealMid, yAxisID: 'y', datalabels: { display: true, align: 'end' as any, anchor: 'end' as any, color: C.white, font: { size: 9, weight: '600' as any }, formatter: (v: number) => v > 0 ? v : '' } },
              { type: 'line' as any, label: 'Avg Days', data: s.avgD, borderColor: C.amber, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, yAxisID: 'y1', datalabels: { display: true, align: 'top' as any, color: C.amber, font: { size: 9 }, formatter: (v: number) => v > 0 ? v + ' d' : '' } },
            ]}} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: { display: false } }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts, position: 'left' as any }, y1: { grid: { display: false }, ticks: { color: C.amber, font: { size: 10 }, callback: (v: any) => v + 'd' }, position: 'right' as any } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>

      {/* Revenue sub-charts */}
      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Delivery Revenue</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [{ data: s.dsRevR, backgroundColor: C.teal, datalabels: { display: true, align: 'end' as any, anchor: 'end' as any, color: C.white, font: { size: 9 }, formatter: (v: number) => v > 0 ? '$' + Math.round(v).toLocaleString() : '' } }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Commercial Revenue</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [{ data: s.commRevR, backgroundColor: C.blue, datalabels: dlC }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Commercial Orders</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [{ data: s.commOrdR, backgroundColor: C.blue, datalabels: dlC }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>

      {/* Service breakdown + top customers */}
      <div style={SECTION}>— Service & Customer Analysis</div>
      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Service Revenue Breakdown ({snapData.curr.label})</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels: svcBreakdown.map(d => d.name || ''), datasets: [{ data: svcBreakdown.map(d => parseFloat(d.value || '0')), backgroundColor: [C.teal, C.tealBright, C.tealMid, '#E91E63', '#9C27B0'], borderRadius: 4, datalabels: { display: true, align: 'end' as any, anchor: 'end' as any, color: C.white, font: { size: 10, weight: '600' as any }, formatter: (v: number) => v > 0 ? '$' + Math.round(v).toLocaleString() : '' } }] }} options={{ indexAxis: 'y' as any, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' }, beginAtZero: true }, y: { grid: { display: false }, ticks: tickOpts } }, layout: { padding: { right: 110 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Top Customers — Current Month</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels: topMonthCustomers.map(d => d.name || ''), datasets: [{ data: topMonthCustomers.map(d => parseFloat(d.value || '0')), backgroundColor: [C.teal, C.tealMid, C.tealBright + 'BB', C.amber + 'BB', C.blue], borderRadius: 4, datalabels: { display: true, align: 'end' as any, anchor: 'end' as any, color: C.white, font: { size: 9, weight: '600' as any }, formatter: (v: number) => '$' + Math.round(v).toLocaleString() } }] }} options={{ indexAxis: 'y' as any, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(1) + 'k' }, beginAtZero: true }, y: { grid: { display: false }, ticks: { ...tickOpts, font: { size: 9 } } } }, layout: { padding: { right: 100 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Top Customers — All Time</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels: topAllCustomers.map(d => d.name || ''), datasets: [{ data: topAllCustomers.map(d => parseFloat(d.value || '0')), backgroundColor: [C.teal, C.tealMid, C.tealBright + 'BB', C.amber + 'BB', C.blue], borderRadius: 4, datalabels: { display: true, align: 'end' as any, anchor: 'end' as any, color: C.white, font: { size: 9, weight: '600' as any }, formatter: (v: number) => '$' + Math.round(v).toLocaleString() } }] }} options={{ indexAxis: 'y' as any, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(1) + 'k' }, beginAtZero: true }, y: { grid: { display: false }, ticks: { ...tickOpts, font: { size: 9 } } } }, layout: { padding: { right: 100 } } }} />
          </div>
        </div>
      </div>

      {/* Top products + comforter + special services */}
      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Top 5 Cents Products — All Time</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels: topProducts.map(d => d.name || ''), datasets: [{ data: topProducts.map(d => parseFloat(d.value || '0')), backgroundColor: C.tealMid, borderRadius: 4, datalabels: { display: true, align: 'end' as any, anchor: 'end' as any, color: C.white, font: { size: 9, weight: '600' as any }, formatter: (v: number) => '$' + Math.round(v/1000) + 'k' } }] }} options={{ indexAxis: 'y' as any, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' }, beginAtZero: true }, y: { grid: { display: false }, ticks: { ...tickOpts, font: { size: 9 } } } }, layout: { padding: { right: 80 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Comforter Program</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [
              { type: 'bar' as any, label: 'Comforters', data: s.comf, backgroundColor: C.teal, yAxisID: 'y', datalabels: dlC },
              { type: 'line' as any, label: 'Revenue', data: s.comfRevR, borderColor: C.tealBright, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, yAxisID: 'y1', datalabels: { display: true, align: 'top' as any, color: C.tealBright, font: { size: 9 }, formatter: (v: number) => v > 0 ? '$' + v : '' } },
            ]}} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: { display: false } }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts, position: 'left' as any }, y1: { grid: { display: false }, ticks: { color: C.tealBright, font: { size: 10 }, callback: (v: any) => '$' + v }, position: 'right' as any } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Huebsch Revenue</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [{ data: s.huebR, backgroundColor: '#E91E63', datalabels: dlH }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>

      {/* W&F weight + AR + Avg days */}
      <div style={SECTION}>— Customer & Weight Metrics</div>
      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>F&F Weight (lbs)</div>
          <div style={{ height: 160 }}>
            <Bar data={{ labels, datasets: [{ data: s.ffW, backgroundColor: C.tealMid, datalabels: dlH }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>AR Balance Due</div>
          <div style={{ height: 160 }}>
            <Line data={{ labels, datasets: [{ data: s.arV, borderColor: C.neg, backgroundColor: C.neg + '33', tension: 0.4, fill: true, pointRadius: 4, datalabels: dlL }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlL }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + v } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Avg Days Between Orders</div>
          <div style={{ height: 160 }}>
            <Line data={{ labels, datasets: [{ data: s.avgD, borderColor: C.amber, backgroundColor: C.amber + '33', tension: 0.4, fill: true, pointRadius: 4, datalabels: { ...dlL, formatter: (v: number) => v > 0 ? v + 'd' : '' } }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlL }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => v + 'd' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>

      {/* Machine charts */}
      <div style={SECTION}>— Machine Performance</div>
      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Washer Cycles by Size</div>
          <div style={{ height: 180 }}>
            <Bar data={{ labels, datasets: sizeCycles.map((sc, i) => ({ type: 'bar' as any, label: sc.size, data: sc.data, backgroundColor: sizeColors[i], stack: 's', datalabels: dlH })) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts, stacked: true }, y: { grid: gridOpts, ticks: tickOpts, stacked: true } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Dryer Cycles</div>
          <div style={{ height: 180 }}>
            <Bar data={{ labels, datasets: [{ data: s.mDC, backgroundColor: C.amber, datalabels: dlH }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Avg Turns/Day by Size</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels, datasets: sizeTpd.map((sc, i) => ({ label: sc.size, data: sc.data, borderColor: sizeColors[i], backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, datalabels: dlH })) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>
    </div>
  )
}
