import { requireLocationAccess } from '@/lib/access'
import { getMetrics, getDetails, getDimensions, buildMetricMap, series, monthLabels } from '@/lib/queries'
import DashboardShell from '@/components/DashboardShell'
import OremCharts from './OremCharts'

export default async function OremPage() {
  await requireLocationAccess('orem')

  const [metrics, details, dims] = await Promise.all([
    getMetrics('orem'),
    getDetails('orem'),
    getDimensions('orem'),
  ])

  const map = buildMetricMap(metrics)
  const labels = monthLabels(metrics)
  const partial = metrics.find(r => r.isPartial)
  const lastLabel = labels[labels.length - 1]
  const prevLabel = labels[labels.length - 2]

  const m = (key: string) => (lbl: string) => parseFloat(map[lbl]?.[key] as any) || 0
  const s = (key: string) => series(map, labels, key).map(v => v ?? null)

  // Top customers
  const topMonthCustomers = details.filter(d => d.listType === 'top_customers_month' && d.periodLabel === lastLabel).sort((a,b) => a.rank - b.rank)
  const topAllCustomers   = details.filter(d => d.listType === 'top_customers_alltime').sort((a,b) => a.rank - b.rank)
  const topProducts       = details.filter(d => d.listType === 'top_products_alltime').sort((a,b) => a.rank - b.rank)
  const svcBreakdown      = details.filter(d => d.listType === 'service_breakdown' && d.periodLabel === lastLabel).sort((a,b) => a.rank - b.rank)

  // Machine size data
  const sizeCycles = ['30lb','40lb','60lb','80lb','100lb'].map(size => ({
    size,
    data: dims.filter(d => d.dimensionType === 'washer_size_cycles' && d.dimensionKey === size)
              .sort((a,b) => labels.indexOf(a.periodLabel) - labels.indexOf(b.periodLabel))
              .map(d => parseFloat(d.value!)),
  }))
  const sizeTpd = ['30lb','40lb','60lb','80lb','100lb'].map(size => ({
    size,
    data: dims.filter(d => d.dimensionType === 'washer_size_tpd' && d.dimensionKey === size)
              .sort((a,b) => labels.indexOf(a.periodLabel) - labels.indexOf(b.periodLabel))
              .map(d => parseFloat(d.value!)),
  }))

  const snapData = {
    prev: {
      label: prevLabel,
      totalRev: m('total_revenue')(prevLabel),
      totalOrders: (m('delivery_orders')(prevLabel) + m('instore_orders')(prevLabel)),
      newCust: m('new_customers')(prevLabel),
      ffRev: m('ff_revenue')(prevLabel),
      ffWt: m('ff_weight_lbs')(prevLabel),
      deliveries: m('delivery_orders')(prevLabel),
      repeat: m('repeat_customers')(prevLabel),
      centsRev: m('cents_revenue')(prevLabel),
      comf: m('comforters')(prevLabel),
      ar: m('ar_balance_due')(prevLabel),
      avgDays: m('avg_days_between_orders')(prevLabel),
      huebsch: m('huebsch_revenue')(prevLabel),
      vending: m('vending_revenue')(prevLabel),
    },
    curr: {
      label: lastLabel,
      daysComplete: partial?.daysComplete,
      totalRev: m('total_revenue')(lastLabel),
      totalOrders: (m('delivery_orders')(lastLabel) + m('instore_orders')(lastLabel)),
      newCust: m('new_customers')(lastLabel),
      ffRev: m('ff_revenue')(lastLabel),
      ffWt: m('ff_weight_lbs')(lastLabel),
      deliveries: m('delivery_orders')(lastLabel),
      repeat: m('repeat_customers')(lastLabel),
      centsRev: m('cents_revenue')(lastLabel),
      comf: m('comforters')(lastLabel),
      ar: m('ar_balance_due')(lastLabel),
      avgDays: m('avg_days_between_orders')(lastLabel),
      huebsch: m('huebsch_revenue')(lastLabel),
      vending: m('vending_revenue')(lastLabel),
    },
  }

  return (
    <DashboardShell title="Star Laundry Club — Orem" subtitle="KPI Operational Dashboard" lastUpdated={lastLabel}>
      <OremCharts
        labels={labels}
        snapData={snapData}
        series={{
          totR: s('total_revenue'),
          ffR: s('ff_revenue'),
          ssR: s('cents_revenue'),
          huebR: s('huebsch_revenue'),
          vendR: s('vending_revenue'),
          comfRevR: s('comforter_revenue'),
          dsRevR: s('delivery_revenue'),
          commRevR: s('commercial_revenue'),
          commOrdR: s('commercial_orders'),
          newC: s('new_customers'),
          repC: s('repeat_customers'),
          dsC: s('delivery_orders'),
          sC: s('instore_orders'),
          ffW: s('ff_weight_lbs'),
          comf: s('comforters'),
          arV: s('ar_balance_due'),
          avgD: s('avg_days_between_orders'),
          mWC: s('washer_cycles'),
          mDC: s('dryer_cycles'),
          mTPD: s('avg_turns_per_day'),
        }}
        topMonthCustomers={topMonthCustomers}
        topAllCustomers={topAllCustomers}
        topProducts={topProducts}
        svcBreakdown={svcBreakdown}
        sizeCycles={sizeCycles}
        sizeTpd={sizeTpd}
      />
    </DashboardShell>
  )
}
