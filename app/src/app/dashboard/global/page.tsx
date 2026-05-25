import { requireLocationAccess } from '@/lib/access'
import { getMetrics, buildMetricMap, series, monthLabels } from '@/lib/queries'
import DashboardShell from '@/components/DashboardShell'
import GlobalCharts from './GlobalCharts'

// Metrics that can be summed across locations
const SUMMABLE = new Set([
  'total_revenue','ff_revenue','cents_revenue','huebsch_revenue','vending_revenue',
  'dry_cleaning_revenue','shirt_laundry_revenue','tailoring_revenue','comforter_revenue',
  'delivery_revenue','commercial_revenue','commercial_orders','new_customers','repeat_customers',
  'delivery_orders','instore_orders','total_orders','comforters','ff_weight_lbs',
  'washer_cycles','dryer_cycles','ss_shift1_cash','ss_shift2_cash','membership_new','membership_cancelled',
])

export default async function GlobalPage() {
  await requireLocationAccess('global')

  const [brightonMetrics, nashuaMetrics, oemMetrics] = await Promise.all([
    getMetrics('brighton'),
    getMetrics('nashua'),
    getMetrics('orem'),
  ])

  // Build per-location maps
  const bMap = buildMetricMap(brightonMetrics)
  const nMap = buildMetricMap(nashuaMetrics)
  const oMap = buildMetricMap(oemMetrics)

  // Collect all unique month labels and sort
  const allRows = [...brightonMetrics, ...nashuaMetrics, ...oemMetrics]
  const labels = monthLabels(allRows)

  // Compute global sum for each summable metric at each label
  const globalMap: Record<string, Record<string, number | null>> = {}
  for (const lbl of labels) {
    globalMap[lbl] = {}
    for (const key of SUMMABLE) {
      const bv = bMap[lbl]?.[key] ?? null
      const nv = nMap[lbl]?.[key] ?? null
      const ov = oMap[lbl]?.[key] ?? null
      const vals = [bv, nv, ov].filter(v => v !== null) as number[]
      globalMap[lbl][key] = vals.length ? vals.reduce((a, b) => a + b, 0) : null
    }
    // Derived ratios
    const newC = (globalMap[lbl].new_customers ?? 0) + (globalMap[lbl].repeat_customers ?? 0)
    const repC = globalMap[lbl].repeat_customers ?? 0
    globalMap[lbl].repeat_rate_pct = newC + repC > 0 ? (repC / (newC + repC)) * 100 : null
    const totOrds = (globalMap[lbl].delivery_orders ?? 0) + (globalMap[lbl].instore_orders ?? 0)
    globalMap[lbl].delivery_pct_of_orders = totOrds > 0 ? ((globalMap[lbl].delivery_orders ?? 0) / totOrds) * 100 : null
    const totRev = globalMap[lbl].total_revenue ?? 0
    globalMap[lbl].ss_pct_of_total = totRev > 0 ? ((globalMap[lbl].cents_revenue ?? 0) / totRev) * 100 : null
  }

  // Per-location series for multi-line charts (use total_revenue)
  const bTotR  = series(bMap, labels, 'total_revenue')
  const nTotR  = series(nMap, labels, 'total_revenue')
  const oTotR  = series(oMap, labels, 'total_revenue')
  const cTotR  = series(globalMap, labels, 'total_revenue')

  const bWF    = series(bMap, labels, 'ff_revenue')
  const nWF    = series(nMap, labels, 'ff_revenue')
  const oWF    = series(oMap, labels, 'ff_revenue')
  const cWF    = series(globalMap, labels, 'ff_revenue')

  const bSS    = series(bMap, labels, 'cents_revenue')
  const nSS    = series(nMap, labels, 'cents_revenue')
  const oSS    = series(oMap, labels, 'cents_revenue')
  const cSS    = series(globalMap, labels, 'cents_revenue')

  const bNew   = series(bMap, labels, 'new_customers')
  const nNew   = series(nMap, labels, 'new_customers')
  const oNew   = series(oMap, labels, 'new_customers')
  const cNew   = series(globalMap, labels, 'new_customers')

  const bDel   = series(bMap, labels, 'delivery_orders')
  const nDel   = series(nMap, labels, 'delivery_orders')
  const oDel   = series(oMap, labels, 'delivery_orders')
  const cDel   = series(globalMap, labels, 'delivery_orders')

  const bComf  = series(bMap, labels, 'comforters')
  const nComf  = series(nMap, labels, 'comforters')
  const oComf  = series(oMap, labels, 'comforters')
  const cComf  = series(globalMap, labels, 'comforters')

  const bWFwt  = series(bMap, labels, 'ff_weight_lbs')
  const nWFwt  = series(nMap, labels, 'ff_weight_lbs')
  const oWFwt  = series(oMap, labels, 'ff_weight_lbs')
  const cWFwt  = series(globalMap, labels, 'ff_weight_lbs')

  const cRepeatPct = series(globalMap, labels, 'repeat_rate_pct')
  const cSSPct     = series(globalMap, labels, 'ss_pct_of_total')
  const cDelPct    = series(globalMap, labels, 'delivery_pct_of_orders')

  // Latest full month and MTD
  const allLabels = labels
  const lastLabel = allLabels[allLabels.length - 1]
  const prevLabel = allLabels[allLabels.length - 2]
  const isPartial = allLabels[allLabels.length - 1].includes('*')

  return (
    <DashboardShell title="Star Laundry Club — All Locations" subtitle="Global Overview Dashboard" lastUpdated={lastLabel}>
      <GlobalCharts
        labels={labels}
        lastLabel={lastLabel}
        prevLabel={prevLabel}
        globalMap={globalMap}
        bTotR={bTotR} nTotR={nTotR} oTotR={oTotR} cTotR={cTotR}
        bWF={bWF} nWF={nWF} oWF={oWF} cWF={cWF}
        bSS={bSS} nSS={nSS} oSS={oSS} cSS={cSS}
        bNew={bNew} nNew={nNew} oNew={oNew} cNew={cNew}
        bDel={bDel} nDel={nDel} oDel={oDel} cDel={cDel}
        bComf={bComf} nComf={nComf} oComf={oComf} cComf={cComf}
        bWFwt={bWFwt} nWFwt={nWFwt} oWFwt={oWFwt} cWFwt={cWFwt}
        cRepeatPct={cRepeatPct} cSSPct={cSSPct} cDelPct={cDelPct}
      />
    </DashboardShell>
  )
}
