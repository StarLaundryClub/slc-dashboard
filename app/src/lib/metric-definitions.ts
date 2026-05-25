export type Aggregation = 'sum' | 'recompute' | 'none'
export type MetricFormat = 'currency' | 'number' | 'percent' | 'lbs' | 'days'

export interface MetricDef {
  label: string
  format: MetricFormat
  aggregation: Aggregation // how to combine for Global rollup
  isRatio?: boolean
}

export const METRIC_DEFS: Record<string, MetricDef> = {
  total_revenue:           { label: 'Total Revenue',           format: 'currency', aggregation: 'sum' },
  ff_revenue:              { label: 'F&F Revenue',             format: 'currency', aggregation: 'sum' },
  cents_revenue:           { label: 'Cents Revenue',           format: 'currency', aggregation: 'sum' },
  huebsch_revenue:         { label: 'Huebsch Revenue',         format: 'currency', aggregation: 'sum' },
  vending_revenue:         { label: 'Vending Machine Revenue', format: 'currency', aggregation: 'sum' },
  dry_cleaning_revenue:    { label: 'Dry Cleaning Revenue',    format: 'currency', aggregation: 'sum' },
  shirt_laundry_revenue:   { label: 'Shirt Laundry Revenue',   format: 'currency', aggregation: 'sum' },
  tailoring_revenue:       { label: 'Tailoring Revenue',       format: 'currency', aggregation: 'sum' },
  comforter_revenue:       { label: 'Comforter Revenue',       format: 'currency', aggregation: 'sum' },
  delivery_revenue:        { label: 'Delivery Revenue',        format: 'currency', aggregation: 'sum' },
  commercial_revenue:      { label: 'Commercial Revenue',      format: 'currency', aggregation: 'sum' },
  commercial_orders:       { label: 'Commercial Orders',       format: 'number',   aggregation: 'sum' },
  new_customers:           { label: 'New Customers',           format: 'number',   aggregation: 'sum' },
  repeat_customers:        { label: 'Repeat Customers',        format: 'number',   aggregation: 'sum' },
  delivery_orders:         { label: 'Delivery Orders',         format: 'number',   aggregation: 'sum' },
  instore_orders:          { label: 'In-Store Orders',         format: 'number',   aggregation: 'sum' },
  total_orders:            { label: 'Total Orders',            format: 'number',   aggregation: 'sum' },
  comforters:              { label: 'Comforters',              format: 'number',   aggregation: 'sum' },
  ff_weight_lbs:           { label: 'F&F Weight (lbs)',        format: 'lbs',      aggregation: 'sum' },
  washer_cycles:           { label: 'Washer Cycles',           format: 'number',   aggregation: 'sum' },
  dryer_cycles:            { label: 'Dryer Cycles',            format: 'number',   aggregation: 'sum' },
  ss_shift1_cash:          { label: 'Self-Svc 1st Shift',      format: 'currency', aggregation: 'sum' },
  ss_shift2_cash:          { label: 'Self-Svc 2nd Shift',      format: 'currency', aggregation: 'sum' },
  membership_new:          { label: 'New Members',             format: 'number',   aggregation: 'sum' },
  membership_cancelled:    { label: 'Cancelled Members',       format: 'number',   aggregation: 'sum' },
  ar_balance_due:          { label: 'AR Balance Due',          format: 'currency', aggregation: 'none',      isRatio: true },
  avg_days_between_orders: { label: 'Avg Days Between Orders', format: 'days',     aggregation: 'recompute', isRatio: true },
  avg_turns_per_day:       { label: 'Avg Turns/Day',           format: 'number',   aggregation: 'recompute', isRatio: true },
  repeat_rate_pct:         { label: 'Repeat Rate %',           format: 'percent',  aggregation: 'recompute', isRatio: true },
  ss_pct_of_total:         { label: 'Self-Svc % of Total',     format: 'percent',  aggregation: 'recompute', isRatio: true },
  delivery_pct_of_orders:  { label: 'Delivery % of Orders',    format: 'percent',  aggregation: 'recompute', isRatio: true },
}

export function fmt(value: number | null | undefined, format: MetricFormat): string {
  if (value == null) return '—'
  switch (format) {
    case 'currency': return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    case 'percent':  return value.toFixed(1) + '%'
    case 'lbs':      return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' lbs'
    case 'days':     return value.toFixed(1)
    default:         return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
}
