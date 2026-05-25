import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { metricValues, detailLists, dimensionValues } from '../drizzle/schema'
import { sql } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!))

// ─── helpers ────────────────────────────────────────────────────────────────

type MV = typeof metricValues.$inferInsert
type DL = typeof detailLists.$inferInsert
type DV = typeof dimensionValues.$inferInsert

function mv(
  location: string,
  periodLabel: string,
  metricKey: string,
  value: number | null,
  opts: { isPartial?: boolean; daysComplete?: number; daysInMonth?: number; isRatio?: boolean; grain?: string } = {}
): MV {
  return {
    location,
    periodGrain: opts.grain ?? 'month',
    periodLabel,
    metricKey,
    value: value != null ? String(value) : null,
    isPartial: opts.isPartial ?? false,
    daysComplete: opts.daysComplete,
    daysInMonth: opts.daysInMonth,
    isRatio: opts.isRatio ?? false,
  }
}

function zipMetrics(
  location: string,
  labels: string[],
  metricKey: string,
  values: (number | null)[],
  opts: { isRatio?: boolean; partialIdx?: number; partialDays?: number } = {}
): MV[] {
  return labels.map((label, i) => {
    const isPartial = opts.partialIdx != null && i === opts.partialIdx
    return mv(location, label, metricKey, values[i], {
      isPartial,
      daysComplete: isPartial ? opts.partialDays : undefined,
      daysInMonth: isPartial ? 31 : undefined,
      isRatio: opts.isRatio,
    })
  })
}

// ─── OREM ────────────────────────────────────────────────────────────────────

const ORE = 'orem'
const oreMonths = ["Mar 2025","Apr 2025","May 2025","Jun 2025","Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026*"]
const orePartial = { partialIdx: 14, partialDays: 18 }

const oreMetrics: MV[] = [
  ...zipMetrics(ORE, oreMonths, 'total_revenue',     [34433.81,31304.73,36803.16,34194.13,34138.01,33754.05,32191.48,35399.77,37663.98,37173.28,37431.84,33253.9,41915.7,38849.37,24031.44], orePartial),
  ...zipMetrics(ORE, oreMonths, 'ff_revenue',         [2662.75,3398.97,5789.77,4589.07,5300.43,3572.59,3145.06,3688.51,5034.97,4810.35,4243.9,3545.6,4491.96,5034.95,2759.38], orePartial),
  ...zipMetrics(ORE, oreMonths, 'cents_revenue',      [8885.76,7977.28,9076.15,9319.36,8151.25,9715.2,8677.5,9663.25,9994.5,9500.25,9596.61,9873.46,12731.82,12327.69,8870.18], orePartial),
  ...zipMetrics(ORE, oreMonths, 'huebsch_revenue',    [22094.06,19092.37,20761.99,19081.11,19645.45,19520.39,19378.24,21031.0,21528.97,21783.25,22651.47,18734.9,23144.71,19489.25,11281.0], orePartial),
  ...zipMetrics(ORE, oreMonths, 'vending_revenue',    [610.75,570.5,638.75,547.25,643.75,679.0,755.5,677.5,703.5,584.75,624.5,607.0,812.0,642.0,521.5], orePartial),
  ...zipMetrics(ORE, oreMonths, 'comforter_revenue',  [0,0,0,240.58,40.98,62.47,88.96,0,91.26,202.38,46.48,97.5,115.75,380.75,233.0], orePartial),
  ...zipMetrics(ORE, oreMonths, 'delivery_revenue',   [1981.85,1785.27,2943.24,3680.15,4018.07,3089.01,2777.06,3377.37,4169.38,3670.34,3111.9,2952.4,4455.02,3955.74,2596.91], orePartial),
  ...zipMetrics(ORE, oreMonths, 'commercial_revenue', [1552.01,1031.9,2236.3,2297.73,2713.59,2135.93,2124.77,2743.09,3914.98,3834.34,3091.02,2765.33,4072.19,3406.84,2144.75], orePartial),
  ...zipMetrics(ORE, oreMonths, 'commercial_orders',  [25,17,30,35,42,37,33,39,45,52,43,41,49,45,30], orePartial),
  ...zipMetrics(ORE, oreMonths, 'new_customers',      [12,26,12,20,18,8,13,4,9,7,8,6,15,25,8], orePartial),
  ...zipMetrics(ORE, oreMonths, 'repeat_customers',   [0,4,9,11,7,5,4,3,6,10,7,10,16,29,22], orePartial),
  ...zipMetrics(ORE, oreMonths, 'delivery_orders',    [36,25,37,48,53,45,42,45,47,47,43,44,57,54,36], orePartial),
  ...zipMetrics(ORE, oreMonths, 'instore_orders',     [20,52,47,39,35,23,15,13,25,34,28,18,20,49,16], orePartial),
  ...zipMetrics(ORE, oreMonths, 'ff_weight_lbs',      [1711.5,2239.1,3752.1,3187.3,3924.0,2655.0,2366.7,2750.6,3589.0,3493.1,3081.1,2564.7,2993.1,3330.8,1708.9], orePartial),
  ...zipMetrics(ORE, oreMonths, 'comforters',         [0,0,0,8,2,3,4,0,4,7,3,5,6,20,12], orePartial),
  ...zipMetrics(ORE, oreMonths, 'ar_balance_due',     [0,0,0,30,0,0,0,0,0,0,0,239.02,204.98,375.12,131.84], { ...orePartial, isRatio: true }),
  ...zipMetrics(ORE, oreMonths, 'avg_days_between_orders', [0,9.6,6.9,56,66.7,101.7,51.5,365.7,115.5,77.2,131.2,125.4,44.8,51.2,22.4], { ...orePartial, isRatio: true }),
  ...zipMetrics(ORE, oreMonths, 'washer_cycles',      [2983,2699,2929,2876,2831,2914,2748,2960,3112,3017,3070,2694,2871,3056,1955], orePartial),
  ...zipMetrics(ORE, oreMonths, 'dryer_cycles',       [3100,2799,3041,2871,2859,2924,2806,2963,3157,3159,3261,2822,3025,3122,1877], orePartial),
  ...zipMetrics(ORE, oreMonths, 'avg_turns_per_day',  [2.5,2.4,2.5,2.5,2.4,2.5,2.4,2.5,2.7,2.6,2.6,2.5,2.8,2.7,2.9], { ...orePartial, isRatio: true }),
]

const oreDimensions: DV[] = [
  // washer cycles by size
  ...["Mar 2025","Apr 2025","May 2025","Jun 2025","Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026*"].flatMap((lbl, i) => [
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_cycles', dimensionKey: '30lb', value: String([341,326,388,371,346,394,352,360,374,336,372,315,317,334,225][i]), isRatio: false },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_cycles', dimensionKey: '40lb', value: String([1134,1094,1136,1172,1164,1208,1181,1205,1299,1196,1182,1062,1161,1238,857][i]), isRatio: false },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_cycles', dimensionKey: '60lb', value: String([753,612,650,647,627,637,576,655,689,703,722,613,633,658,409][i]), isRatio: false },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_cycles', dimensionKey: '80lb', value: String([363,329,384,351,350,330,315,374,408,416,415,359,385,423,217][i]), isRatio: false },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_cycles', dimensionKey: '100lb', value: String([392,338,371,335,344,345,324,366,342,366,379,345,375,403,247][i]), isRatio: false },
    // turns per day by size (ratio)
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_tpd', dimensionKey: '30lb', value: String([5.5,5.4,6.3,6.2,5.6,6.4,5.9,5.8,6.2,5.4,6.0,5.6,5.9,5.6,6.3][i]), isRatio: true },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_tpd', dimensionKey: '40lb', value: String([2.6,2.6,2.6,2.8,2.7,2.8,2.8,2.8,3.1,2.8,2.7,2.7,3.1,2.9,3.4][i]), isRatio: true },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_tpd', dimensionKey: '60lb', value: String([2.0,1.7,1.7,1.8,1.7,1.7,1.6,1.8,1.9,1.9,1.9,1.8,2.0,1.8,1.9][i]), isRatio: true },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_tpd', dimensionKey: '80lb', value: String([2.0,1.8,2.1,2.0,1.9,1.8,1.8,2.0,2.3,2.2,2.2,2.1,2.4,2.4,2.0][i]), isRatio: true },
    { location: ORE, periodLabel: lbl, dimensionType: 'washer_size_tpd', dimensionKey: '100lb', value: String([3.2,2.8,3.0,2.8,2.8,2.8,2.7,3.0,2.9,3.0,3.1,3.1,3.5,3.4,3.4][i]), isRatio: true },
  ]),
]

const oreDetailLists: DL[] = [
  // top customers current month (May 2026*)
  { location: ORE, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 1, name: 'Jenessa Smith',     value: '768.94' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 2, name: 'Truxton McSpadden', value: '658.49' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 3, name: 'Fatima Doucoure',   value: '265.74' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 4, name: 'Leah Henley',       value: '218.88' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 5, name: 'Martin Chavez',     value: '113.94' },
  // top customers all-time
  { location: ORE, periodLabel: 'all-time', listType: 'top_customers_alltime', rank: 1, name: 'Truxton McSpadden', value: '11119.15' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_customers_alltime', rank: 2, name: 'Leah Henley',       value: '5923.73' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_customers_alltime', rank: 3, name: 'Jenessa Smith',     value: '5512.18' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_customers_alltime', rank: 4, name: 'David Toomey',      value: '2566.41' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_customers_alltime', rank: 5, name: 'Trista Doxey',      value: '2365.12' },
  // top 5 cents products
  { location: ORE, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 1, name: '$7 Cash Special',                            value: '33654.28' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 2, name: 'Dryer 45 LB',                               value: '33406.45' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 3, name: '$2.50 Detergent/Softener/DryerSheets',       value: '29204.71' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 4, name: 'Hot Water 30/40/60',                         value: '26050.86' },
  { location: ORE, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 5, name: '$9 Cash Special',                            value: '24418.61' },
  // service breakdown (May 2026* MTD)
  { location: ORE, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 1, name: 'In-Store F&F',    value: '162.47' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 2, name: 'Delivery F&F',   value: '2596.91' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 3, name: 'Cents Revenue',  value: '8870.18' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 4, name: 'Huebsch',        value: '11281.0' },
  { location: ORE, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 5, name: 'Vending Machine',value: '521.5' },
]

// ─── BRIGHTON ─────────────────────────────────────────────────────────────────

const BRI = 'brighton'
const briMonths = ["Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026*"]
const briPartial = { partialIdx: 8, partialDays: 15 }

const briMetrics: MV[] = [
  ...zipMetrics(BRI, briMonths, 'total_revenue',           [21717.68,19624.53,18735.31,13046.78,14010.82,15197.37,17927.53,17185.55,8086.88], briPartial),
  ...zipMetrics(BRI, briMonths, 'dry_cleaning_revenue',    [9016.95,8329.0,7938.0,4392.0,4806.0,5895.0,5494.0,7195.0,3086.0], briPartial),
  ...zipMetrics(BRI, briMonths, 'ff_revenue',              [3644.0,2652.8,2590.9,1592.8,2219.7,2137.4,4523.5,3321.5,2066.2], briPartial),
  ...zipMetrics(BRI, briMonths, 'tailoring_revenue',       [822.0,1201.0,1284.0,523.0,115.0,1185.5,922.0,1095.0,736.0], briPartial),
  ...zipMetrics(BRI, briMonths, 'cents_revenue',           [7653.0,6792.0,6337.0,5616.0,6154.0,5177.0,6056.0,5494.0,2332.0], briPartial),
  ...zipMetrics(BRI, briMonths, 'delivery_revenue',        [1140.83,888.81,1426.04,1188.69,1459.1,2314.47,4338.69,1777.95,1766.03], briPartial),
  ...zipMetrics(BRI, briMonths, 'new_customers',           [197,162,157,95,93,109,101,139,69], briPartial),
  ...zipMetrics(BRI, briMonths, 'instore_orders',          [232,225,220,140,137,185,182,233,114], briPartial),
  ...zipMetrics(BRI, briMonths, 'delivery_orders',         [12,11,21,19,24,32,40,24,17], briPartial),
  ...zipMetrics(BRI, briMonths, 'ff_weight_lbs',           [1404.0,1043.0,1122.0,658.0,848.0,806.0,1995.0,1339.0,806.0], briPartial),
  ...zipMetrics(BRI, briMonths, 'ss_shift1_cash',          [2712.0,2541.0,1637.0,1619.0,1948.0,581.0,824.0,1550.0,0.0], briPartial),
  ...zipMetrics(BRI, briMonths, 'ss_shift2_cash',          [4941.0,4251.0,4700.0,3997.0,4206.0,4596.0,5232.0,3944.0,2332.0], briPartial),
  ...zipMetrics(BRI, briMonths, 'ar_balance_due',          [56.1,25.5,403.4,603.76,967.39,194.52,647.19,990.34,1094.6], { ...briPartial, isRatio: true }),
  ...zipMetrics(BRI, briMonths, 'comforters',              [null,null,null,null,null,7,8,6,5], briPartial),
  ...zipMetrics(BRI, briMonths, 'comforter_revenue',       [null,null,null,null,null,133.0,152.0,114.0,95.0], briPartial),
  ...zipMetrics(BRI, briMonths, 'membership_new',          [null,null,null,null,2,2,0,0,0], briPartial),
  ...zipMetrics(BRI, briMonths, 'membership_cancelled',    [null,null,null,null,1,0,0,0,0], briPartial),
  ...zipMetrics(BRI, briMonths, 'repeat_rate_pct',         [4.4,7.0,12.1,12.0,19.4,30.6,42.9,40.2,45.2], { ...briPartial, isRatio: true }),
  ...zipMetrics(BRI, briMonths, 'avg_days_between_orders', [18.0,21.3,25.2,33.9,57.5,57.1,66.7,72.3,59.2], { ...briPartial, isRatio: true }),
]

const briDetailLists: DL[] = [
  // top 5 products (with units as secondary_value)
  { location: BRI, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 1, name: 'Gain (Regular) 10oz',             value: '132.74', secondaryValue: '34' },
  { location: BRI, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 2, name: 'Coin Exchange',                    value: '329.34', secondaryValue: '30' },
  { location: BRI, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 3, name: 'Downy Fabrix Softener 10oz',       value: '104.18', secondaryValue: '29' },
  { location: BRI, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 4, name: 'Large Laundry Bag',                value: '175.68', secondaryValue: '17' },
  { location: BRI, periodLabel: 'all-time', listType: 'top_products_alltime', rank: 5, name: 'Bounce Dryer Sheets',              value: '30.31',  secondaryValue: '12' },
]

// ─── NASHUA ───────────────────────────────────────────────────────────────────

const NAS = 'nashua'
const nasMonths = ["Mar 2026","Apr 2026","May 2026*"]
const nasPartial = { partialIdx: 2, partialDays: 15 }

const nasMetrics: MV[] = [
  ...zipMetrics(NAS, nasMonths, 'total_revenue',          [31339.21,32891.62,14682.63], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'dry_cleaning_revenue',   [3688.03,4302.66,1091.01], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'shirt_laundry_revenue',  [2094.28,2969.82,1065.26], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'ff_revenue',             [2686.61,3146.92,1386.76], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'tailoring_revenue',      [128.05,190.92,97.39], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'comforter_revenue',      [290.43,640.86,98.72], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'cents_revenue',          [22063.95,21254.8,10690.05], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'total_orders',           [541,584,327], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'new_customers',          [233,220,148], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'repeat_rate_pct',        [36.1,40.0,29.1], { ...nasPartial, isRatio: true }),
  ...zipMetrics(NAS, nasMonths, 'comforters',             [19,37,9], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'delivery_revenue',       [471.3,0,84.0], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'delivery_orders',        [5,0,1], nasPartial),
  ...zipMetrics(NAS, nasMonths, 'ff_weight_lbs',          [1478,1758,869], nasPartial),
  // weekly series (May 2026* only)
  mv(NAS, 'May 1–7',    'total_revenue', 2404.93, { grain: 'week' }),
  mv(NAS, 'May 8–14',   'total_revenue', 1472.09, { grain: 'week' }),
  mv(NAS, 'May 15–21',  'total_revenue', 115.56,  { grain: 'week' }),
  mv(NAS, 'May 22–31',  'total_revenue', 0.0,     { grain: 'week' }),
  mv(NAS, 'May 1–7',    'total_orders',  166, { grain: 'week' }),
  mv(NAS, 'May 8–14',   'total_orders',  130, { grain: 'week' }),
  mv(NAS, 'May 15–21',  'total_orders',  31,  { grain: 'week' }),
  mv(NAS, 'May 22–31',  'total_orders',  0,   { grain: 'week' }),
]

const nasDimensions: DV[] = [
  // fascard payment breakdown (12 months Jun 2025 - May 2026)
  ...["Jun 2025","Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026"].flatMap((lbl, i) => [
    { location: NAS, periodLabel: lbl, dimensionType: 'fascard_payment', dimensionKey: 'cc_starts',         value: String([6783.65,5468.0,6255.5,6183.85,6602.05,6179.87,5878.9,5601.0,5424.45,6527.95,6510.8,3261.05][i]),    isRatio: false },
    { location: NAS, periodLabel: lbl, dimensionType: 'fascard_payment', dimensionKey: 'cash_to_kiosk',     value: String([9438.0,9483.0,9363.0,9712.0,10690.0,10169.0,8160.0,9148.0,8776.0,10186.0,8764.0,4554.0][i]),   isRatio: false },
    { location: NAS, periodLabel: lbl, dimensionType: 'fascard_payment', dimensionKey: 'credit_at_machine', value: String([4410.0,4315.0,4690.0,4170.0,4780.0,4670.0,4580.0,4490.0,4930.0,4920.0,5610.0,2600.0][i]),   isRatio: false },
    { location: NAS, periodLabel: lbl, dimensionType: 'fascard_payment', dimensionKey: 'credit_via_internet',value: String([265.0,460.0,430.0,410.0,560.0,390.0,620.0,530.0,470.0,430.0,370.0,275.0][i]),      isRatio: false },
  ]),
]

const nasDetailLists: DL[] = [
  // top 5 customers (May 2026*)
  { location: NAS, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 1, name: 'KARINA V.', value: '172.0' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 2, name: 'Eileen F.', value: '140.0' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 3, name: 'Luis S.',   value: '136.0' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 4, name: 'dylan g.',  value: '108.0' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'top_customers_month', rank: 5, name: 'BRIAN C.',  value: '92.0' },
  // service breakdown (May 2026*)
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 1, name: 'Dry Cleaning',  value: '1091.01' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 2, name: 'Wash & Fold',   value: '1386.76' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 3, name: 'Shirt Laundry', value: '1065.26' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 4, name: 'Comforter',     value: '98.72' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 5, name: 'Products',      value: '190.44' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 6, name: 'Specialty',     value: '23.0' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 7, name: 'Tailoring',     value: '97.39' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'service_breakdown', rank: 8, name: 'Other',         value: '40.0' },
  // payment methods (May 2026*)
  { location: NAS, periodLabel: 'May 2026*', listType: 'payment_method', rank: 1, name: 'Debit/Credit', value: '3160.0' },
  { location: NAS, periodLabel: 'May 2026*', listType: 'payment_method', rank: 2, name: 'Cash',         value: '788.5' },
]

// ─── UPSERT ───────────────────────────────────────────────────────────────────

async function upsertMetrics(rows: MV[]) {
  if (!rows.length) return
  // batch in groups of 100
  for (let i = 0; i < rows.length; i += 100) {
    await db.insert(metricValues).values(rows.slice(i, i + 100)).onConflictDoUpdate({
      target: [metricValues.location, metricValues.periodGrain, metricValues.periodLabel, metricValues.metricKey],
      set: {
        value: sql`excluded.value`,
        isPartial: sql`excluded.is_partial`,
        daysComplete: sql`excluded.days_complete`,
        daysInMonth: sql`excluded.days_in_month`,
        isRatio: sql`excluded.is_ratio`,
      },
    })
  }
}

async function upsertDetails(rows: DL[]) {
  if (!rows.length) return
  await db.insert(detailLists).values(rows).onConflictDoUpdate({
    target: [detailLists.location, detailLists.periodLabel, detailLists.listType, detailLists.rank],
    set: {
      name: sql`excluded.name`,
      value: sql`excluded.value`,
      secondaryValue: sql`excluded.secondary_value`,
    },
  })
}

async function upsertDimensions(rows: DV[]) {
  if (!rows.length) return
  await db.insert(dimensionValues).values(rows).onConflictDoUpdate({
    target: [dimensionValues.location, dimensionValues.periodLabel, dimensionValues.dimensionType, dimensionValues.dimensionKey],
    set: {
      value: sql`excluded.value`,
      isRatio: sql`excluded.is_ratio`,
    },
  })
}

async function main() {
  console.log('Seeding Orem...')
  await upsertMetrics(oreMetrics)
  await upsertDetails(oreDetailLists)
  await upsertDimensions(oreDimensions)

  console.log('Seeding Brighton...')
  await upsertMetrics(briMetrics)
  await upsertDetails(briDetailLists)

  console.log('Seeding Nashua...')
  await upsertMetrics(nasMetrics)
  await upsertDetails(nasDetailLists)
  await upsertDimensions(nasDimensions)

  const result = await db.execute(sql`
    SELECT 'metric_values' AS t, count(*) FROM metric_values
    UNION ALL SELECT 'detail_lists', count(*) FROM detail_lists
    UNION ALL SELECT 'dimension_values', count(*) FROM dimension_values
  `)
  console.log('Done! Row counts:', JSON.stringify(result.rows))
}

main().catch(console.error)
