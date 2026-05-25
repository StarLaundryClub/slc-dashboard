// @ts-nocheck
'use client'
import { useEffect } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { registerCharts, C, gridOpts, tickOpts, dlH, dlL } from '@/components/charts/ChartWrapper'

const SECTION = { fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: 'var(--teal-mid)', marginBottom: 7, paddingLeft: 2 }
const CARD = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 12px 8px' }
const KPI_CARD = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', position: 'relative' as const, overflow: 'hidden' as const }
const GRID3 = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 10 }
const GRID4 = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }

function $(v: number | null) { return v != null ? '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—' }

interface Props {
  labels: string[]
  lastLabel: string
  prevLabel: string
  globalMap: Record<string, Record<string, number | null>>
  bTotR: (number|null)[] ; nTotR: (number|null)[] ; oTotR: (number|null)[] ; cTotR: (number|null)[]
  bWF:   (number|null)[] ; nWF:   (number|null)[] ; oWF:   (number|null)[] ; cWF:   (number|null)[]
  bSS:   (number|null)[] ; nSS:   (number|null)[] ; oSS:   (number|null)[] ; cSS:   (number|null)[]
  bNew:  (number|null)[] ; nNew:  (number|null)[] ; oNew:  (number|null)[] ; cNew:  (number|null)[]
  bDel:  (number|null)[] ; nDel:  (number|null)[] ; oDel:  (number|null)[] ; cDel:  (number|null)[]
  bComf: (number|null)[] ; nComf: (number|null)[] ; oComf: (number|null)[] ; cComf: (number|null)[]
  bWFwt: (number|null)[] ; nWFwt: (number|null)[] ; oWFwt: (number|null)[] ; cWFwt: (number|null)[]
  cRepeatPct: (number|null)[] ; cSSPct: (number|null)[] ; cDelPct: (number|null)[]
}

export default function GlobalCharts(p: Props) {
  useEffect(() => { registerCharts() }, [])

  const g = (key: string) => p.globalMap[p.lastLabel]?.[key] ?? null
  const gp = (key: string) => p.globalMap[p.prevLabel]?.[key] ?? null

  const locationDs = (bright: any, nash: any, orem: any, combined: any) => [
    { label: 'Brighton', data: bright, borderColor: C.teal,       backgroundColor: 'transparent', tension: 0.3, pointRadius: 3 },
    { label: 'Nashua',   data: nash,   borderColor: C.amber,      backgroundColor: 'transparent', tension: 0.3, pointRadius: 3 },
    { label: 'Orem',     data: orem,   borderColor: C.tealMid,    backgroundColor: 'transparent', tension: 0.3, pointRadius: 3 },
    { label: 'Combined', data: combined, borderColor: C.white,    backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, borderWidth: 2.5, datalabels: { ...dlL, formatter: (v: number) => v != null ? '$' + Math.round(v/1000) + 'k' : '' } },
  ]

  return (
    <div>
      {/* Scorecard */}
      <div style={SECTION}>— Scorecard ({p.lastLabel})</div>
      <div style={GRID4}>
        {[
          ['🌐', $(g('total_revenue')),      'Combined Revenue'],
          ['🏙️', $(p.globalMap[p.lastLabel]?.brighton_rev ?? p.bTotR[p.bTotR.length-1]), 'Brighton'],
          ['🏢', $(p.globalMap[p.lastLabel]?.nashua_rev   ?? p.nTotR[p.nTotR.length-1]), 'Nashua'],
          ['⛰️', $(p.globalMap[p.lastLabel]?.orem_rev     ?? p.oTotR[p.oTotR.length-1]), 'Orem'],
          ['⚖️', (g('ff_weight_lbs') ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' lbs', 'Total Weight'],
          ['🚚', String(g('delivery_orders') ?? 0), 'Total Deliveries'],
          ['🛏️', String(g('comforters') ?? 0), 'Total Comforters'],
          ['📊', (g('repeat_rate_pct') ?? 0).toFixed(1) + '%', 'Combined Repeat Rate'],
        ].map(([icon, val, lbl]) => (
          <div key={String(lbl)} style={KPI_CARD}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--teal), var(--teal-bright))' }} />
            <span style={{ fontSize: 14 }}>{icon}</span>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, marginTop: 3 }}>{val}</div>
            <div style={{ fontSize: 9, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Total Revenue per location */}
      <div style={SECTION}>— Total Revenue by Location</div>
      <div style={{ ...CARD, marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Revenue Trend — All Locations</div>
        <div style={{ height: 240 }}>
          <Line data={{ labels: p.labels, datasets: locationDs(p.bTotR, p.nTotR, p.oTotR, p.cTotR) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' } } }, layout: { padding: { top: 20 } } }} />
        </div>
      </div>

      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>W&F Revenue by Location</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: locationDs(p.bWF, p.nWF, p.oWF, p.cWF) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Self-Service Revenue by Location</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: locationDs(p.bSS, p.nSS, p.oSS, p.cSS) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => '$' + (v/1000).toFixed(0) + 'k' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Self-Service % of Total</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: [{ label: 'SS %', data: p.cSSPct, borderColor: C.tealBright, backgroundColor: C.tealBright + '22', tension: 0.4, fill: true, pointRadius: 3, datalabels: dlH }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => v.toFixed(0) + '%' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>

      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>New Customers by Location</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: locationDs(p.bNew, p.nNew, p.oNew, p.cNew) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Delivery Orders by Location</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: locationDs(p.bDel, p.nDel, p.oDel, p.cDel) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Delivery % of Orders</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: [{ label: 'Del %', data: p.cDelPct, borderColor: C.amber, backgroundColor: C.amber + '22', tension: 0.4, fill: true, pointRadius: 3, datalabels: dlH }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => v.toFixed(0) + '%' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>

      <div style={GRID3}>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Comforter Orders by Location</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: locationDs(p.bComf, p.nComf, p.oComf, p.cComf) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>W&F Weight by Location (lbs)</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: locationDs(p.bWFwt, p.nWFwt, p.oWFwt, p.cWFwt) }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: tickOpts } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
        <div style={CARD}>
          <div style={{ fontSize: 10, color: 'var(--teal-mid)', marginBottom: 6 }}>Combined Repeat Rate %</div>
          <div style={{ height: 180 }}>
            <Line data={{ labels: p.labels, datasets: [{ label: 'Repeat Rate', data: p.cRepeatPct, borderColor: C.tealBright, backgroundColor: C.tealBright + '22', tension: 0.4, fill: true, pointRadius: 3, datalabels: dlH }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: dlH }, scales: { x: { grid: gridOpts, ticks: tickOpts }, y: { grid: gridOpts, ticks: { ...tickOpts, callback: (v: any) => v.toFixed(0) + '%' } } }, layout: { padding: { top: 20 } } }} />
          </div>
        </div>
      </div>
    </div>
  )
}
