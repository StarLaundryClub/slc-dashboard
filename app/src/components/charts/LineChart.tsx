// @ts-nocheck
'use client'
import { Line } from 'react-chartjs-2'
import { C, gridOpts, tickOpts, dlL } from './ChartWrapper'

interface Props {
  labels: string[]
  data: (number | null)[]
  color?: string
  fill?: boolean
  datalabels?: any
  yFormat?: (v: number) => string
  height?: number
}

export default function LineChart({ labels, data, color = C.tealBright, fill = false, datalabels = dlL, yFormat, height = 180 }: Props) {
  return (
    <div style={{ height }}>
      <Line
        data={{ labels, datasets: [{ data, borderColor: color, backgroundColor: color + '33', tension: 0.4, fill, pointRadius: 4, pointBackgroundColor: color, datalabels }] }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, datalabels },
          scales: {
            x: { grid: gridOpts, ticks: tickOpts },
            y: { grid: gridOpts, ticks: { ...tickOpts, ...(yFormat ? { callback: yFormat as any } : {}) } },
          },
          layout: { padding: { top: 20 } },
        }}
      />
    </div>
  )
}
