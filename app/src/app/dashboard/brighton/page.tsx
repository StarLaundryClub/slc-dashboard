import { requireLocationAccess } from '@/lib/access'
import { getMetrics, getDetails, getDimensions, buildMetricMap, series, monthLabels } from '@/lib/queries'
import DashboardShell from '@/components/DashboardShell'
import BrightonCharts from './BrightonCharts'

export default async function BrightonPage() {
  await requireLocationAccess('brighton')

  const [metrics, details] = await Promise.all([
    getMetrics('brighton'),
    getDetails('brighton'),
  ])

  const map = buildMetricMap(metrics)
  const labels = monthLabels(metrics)
  const partial = metrics.find(r => r.isPartial)
  const lastLabel = labels[labels.length - 1]   // May 2026*
  const prevLabel = labels[labels.length - 2]   // Apr 2026

  const m = (key: string) => (lbl: string): number => {
    const v = map[lbl]?.[key]
    return v != null ? parseFloat(v as any) : 0
  }
  const s = (key: string) => series(map, labels, key)

  // Snapshot data
  const snapData = {
    prev: {
      label: prevLabel,
      totalRev:    m('total_revenue')(prevLabel),
      totalOrders: m('instore_orders')(prevLabel) + m('delivery_orders')(prevLabel),
      newCust:     m('new_customers')(prevLabel),
      dcRev:       m('dry_cleaning_revenue')(prevLabel),
      ffWeight:    m('ff_weight_lbs')(prevLabel),
      deliveries:  m('delivery_orders')(prevLabel),
      repeatRate:  m('repeat_rate_pct')(prevLabel),
      avgDays:     m('avg_days_between_orders')(prevLabel),
      ssCash:      m('ss_shift1_cash')(prevLabel) + m('ss_shift2_cash')(prevLabel),
      arBalance:   m('ar_balance_due')(prevLabel),
    },
    curr: {
      label:        lastLabel,
      daysComplete: partial?.daysComplete ?? null,
      totalRev:     m('total_revenue')(lastLabel),
      totalOrders:  m('instore_orders')(lastLabel) + m('delivery_orders')(lastLabel),
      newCust:      m('new_customers')(lastLabel),
      dcRev:        m('dry_cleaning_revenue')(lastLabel),
      ffWeight:     m('ff_weight_lbs')(lastLabel),
      deliveries:   m('delivery_orders')(lastLabel),
      repeatRate:   m('repeat_rate_pct')(lastLabel),
      avgDays:      m('avg_days_between_orders')(lastLabel),
      ssCash:       m('ss_shift1_cash')(lastLabel) + m('ss_shift2_cash')(lastLabel),
      arBalance:    m('ar_balance_due')(lastLabel),
    },
  }

  // Top products from details
  const topProducts = details
    .filter(d => d.listType === 'top_products_alltime')
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)

  // Service breakdown
  const svcBreakdown = details
    .filter(d => d.listType === 'service_breakdown' && d.periodLabel === prevLabel)
    .sort((a, b) => a.rank - b.rank)

  // Top customers month
  const topMonthCustomers = details
    .filter(d => d.listType === 'top_customers_month' && d.periodLabel === prevLabel)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)

  return (
    <DashboardShell
      title="Star Laundry Club — Brighton"
      subtitle="KPI Operational Dashboard"
      lastUpdated={lastLabel}
    >
      <BrightonCharts
        labels={labels}
        snapData={snapData}
        series={{
          dcR:        s('dry_cleaning_revenue'),
          ffR:        s('ff_revenue'),
          tailR:      s('tailoring_revenue'),
          ssR:        s('cents_revenue'),
          totR:       s('total_revenue'),
          newC:       s('new_customers'),
          sOrds:      s('instore_orders'),
          dsOrds:     s('delivery_orders'),
          dsR:        s('delivery_revenue'),
          ffW:        s('ff_weight_lbs'),
          shift1:     s('ss_shift1_cash'),
          shift2:     s('ss_shift2_cash'),
          arV:        s('ar_balance_due'),
          comfU:      s('comforters'),
          comfR:      s('comforter_revenue'),
          memNew:     s('membership_new'),
          memCan:     s('membership_cancelled'),
          repeatPct:  s('repeat_rate_pct'),
          avgD:       s('avg_days_between_orders'),
        }}
        topProducts={topProducts}
        svcBreakdown={svcBreakdown}
        topMonthCustomers={topMonthCustomers}
      />
    </DashboardShell>
  )
}
