'use client'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Filler, Legend, Tooltip, Title,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Filler, Legend, Tooltip, Title, ChartDataLabels,
)

// Kept for existing call sites; registration now happens at module load above.
export function registerCharts() {}

// Shared colour palette matching source HTML
export const C = {
  teal:       '#0A9278',
  tealBright: '#1EE1DB',
  tealMid:    '#57B3A8',
  white:      '#FFFFFF',
  gray:       '#9DA8B4',
  border:     '#353B47',
  amber:      '#F59E0B',
  neg:        '#FF6B6B',
  purple:     '#8B5CF6',
  blue:       '#6B7DD6',
  pink:       '#EC4899',
  green:      '#1aa88c',
}

export const gridOpts = { color: C.border, borderColor: C.border } as const
export const tickOpts = { color: C.gray, font: { size: 10 } } as const
export const legendOpts = { labels: { color: C.gray, font: { size: 10 } } }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dlH:   any = { display: false }
export const dlC:   any = { display: true, align: 'end', anchor: 'end', color: C.white, font: { size: 9, weight: 'bold' } }
export const dlL:   any = { display: true, align: 'top', color: C.white, font: { size: 9 } }
export const dlSeg: any = { display: true, align: 'center', anchor: 'center', color: C.white, font: { size: 8, weight: 'bold' }, formatter: (v: number) => v > 800 ? '$' + Math.round(v / 1000) + 'k' : '' }
