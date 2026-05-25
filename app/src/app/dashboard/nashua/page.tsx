import { requireLocationAccess } from '@/lib/access'
import { getMetrics, getDetails, getDimensions, buildMetricMap, series, monthLabels } from '@/lib/queries'
import DashboardShell from '@/components/DashboardShell'
import NashuaCharts from './NashuaCharts'

export default async function NashuaPage() {
  await requireLocationAccess('nashua')

  const [monthMetrics, weekMetrics, details, dims] = await Promise.all([
    getMetrics('nashua', 'month'),
    getMetrics('nashua', 'week'),
    getDetails('nashua'),
    getDimensions('nashua'),
  ])

  const map = buildMetricMap(monthMetrics)
  const labels = monthLabels(monthMetrics)
  const partial = monthMetrics.find(r => r.isPartial)
  const lastLabel = labels[labels.length - 1]   // May 2026*
  const prevLabel = labels[labels.length - 2]   // Apr 2026

  const m = (key: string) => (lbl: string): number => {
    const v = map[lbl]?.[key]
    return v != null ? parseFloat(v as any) : 0
  }
  const s = (key: string) => series(map, labels, key)

  // Weekly data (sorted)
  const weekMap = buildMetricMap(weekMetrics)
  const weekLabels = [...new Set(weekMetrics.map(r => r.periodLabel))].sort((a, b) => {
    // Sort by first number in label e.g. "May 1–7"
    const ai = parseInt(a.match(/\d+/)?.[0] ?? '0')
    const bi = parseInt(b.match(/\d+/)?.[0] ?? '0')
    return ai - bi
  })

  const ws = (key: string) => weekLabels.map(lbl => weekMap[lbl]?.[key] ?? null)

  // Snapshot data
  const snapData = {
    prev: {
      label: prevLabel,
      totalRev:      m('total_revenue')(prevLabel),
      centsRev:      m('cents_revenue')(prevLabel),
      fascardRev:    m('total_revenue')(prevLabel) - m('cents_revenue')(prevLabel),
      totalOrders:   m('total_orders')(prevLabel),
      dcRev:         m('dry_cleaning_revenue')(prevLabel),
      shirtRev:      m('shirt_laundry_revenue')(prevLabel),
      ffRev:         m('ff_revenue')(prevLabel),
      deliveryRev:   m('delivery_revenue')(prevLabel),
      repeatRate:    m('repeat_rate_pct')(prevLabel),
      ffWeight:      m('ff_weight_lbs')(prevLabel),
    },
    curr: {
      label:        lastLabel,
      daysComplete: partial?.daysComplete ?? null,
      totalRev:     m('total_revenue')(lastLabel),
      centsRev:     m('cents_revenue')(lastLabel),
      fascardRev:   m('total_revenue')(lastLabel) - m('cents_revenue')(lastLabel),
      totalOrders:  m('total_orders')(lastLabel),
      dcRev:        m('dry_cleaning_revenue')(lastLabel),
      shirtRev:     m('shirt_laundry_revenue')(lastLabel),
      ffRev:        m('ff_revenue')(lastLabel),
      deliveryRev:  m('delivery_revenue')(lastLabel),
      repeatRate:   m('repeat_rate_pct')(lastLabel),
      ffWeight:     m('ff_weight_lbs')(lastLabel),
      tailRev:      m('tailoring_revenue')(lastLabel),
      comfU:        m('comforters')(lastLabel),
      newCust:      m('new_customers')(lastLabel),
    },
  }

  // Fascard dimensions (12-month stacked bar)
  const fascardLabels = [...new Set(dims.filter(d => d.dimensionType === 'fascard_payment').map(d => d.periodLabel))]
    .sort((a, b) => {
      const months: Record<string, number> = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 }
      const [am, ay] = a.replace('*','').trim().split(' ')
      const [bm, by] = b.replace('*','').trim().split(' ')
      return (parseInt(ay)*100 + (months[am]||0)) - (parseInt(by)*100 + (months[bm]||0))
    })

  const fascardKeys = ['cc_starts', 'cash_to_kiosk', 'credit_at_machine', 'credit_via_internet']
  const fascardLabelsDisplay = ['CC Starts', 'Cash to Kiosk', 'Credit at Machine', 'Credit via Internet']
  const fascardSeries = fascardKeys.map(key =>
    fascardLabels.map(lbl => {
      const d = dims.find(r => r.dimensionType === 'fascard_payment' && r.dimensionKey === key && r.periodLabel === lbl)
      return d ? parseFloat(d.value!) : 0
    })
  )

  // Detail lists
  const topCustomers = details
    .filter(d => d.listType === 'top_customers_month' && d.periodLabel === lastLabel)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)

  const svcBreakdown = details
    .filter(d => d.listType === 'service_breakdown' && d.periodLabel === lastLabel)
    .sort((a, b) => a.rank - b.rank)

  const paymentMethods = details
    .filter(d => d.listType === 'payment_method' && d.periodLabel === lastLabel)
    .sort((a, b) => a.rank - b.rank)

  return (
    <DashboardShell
      title="Star Laundry Club — Nashua"
      subtitle="KPI Operational Dashboard"
      lastUpdated={lastLabel}
    >
      <NashuaCharts
        labels={labels}
        weekLabels={weekLabels}
        snapData={snapData}
        series={{
          dcR:     s('dry_cleaning_revenue'),
          shirtR:  s('shirt_laundry_revenue'),
          ffR:     s('ff_revenue'),
          tailR:   s('tailoring_revenue'),
          comfR:   s('comforter_revenue'),
          centsR:  s('cents_revenue'),
          totR:    s('total_revenue'),
          ordN:    s('total_orders'),
          newC:    s('new_customers'),
          repPct:  s('repeat_rate_pct'),
          comfU:   s('comforters'),
          dsR:     s('delivery_revenue'),
          dsN:     s('delivery_orders'),
          ffW:     s('ff_weight_lbs'),
        }}
        weekSeries={{
          rev:  ws('total_revenue'),
          ords: ws('total_orders'),
        }}
        fascardLabels={fascardLabels}
        fascardSeries={fascardSeries}
        fascardLabelsDisplay={fascardLabelsDisplay}
        topCustomers={topCustomers}
        svcBreakdown={svcBreakdown}
        paymentMethods={paymentMethods}
      />
    </DashboardShell>
  )
}
