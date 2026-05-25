// @ts-nocheck
'use client'
import { Bar } from 'react-chartjs-2'
import { C, gridOpts, tickOpts, dlC } from './ChartWrapper'

interface Props {
  labels: string[]
  datasets: { label: string; data: (number | null)[]; color: string }[]
  horizontal?: boolean
  yFormat?: (v: number) => string
  xFormat?: (v: number) => string
  height?: number
  datalabels?: any
}

export default function BarChart({ labels, datasets, horizontal, yFormat, xFormat, height = 180, datalabels = dlC }: Props) {
  return (
    <div style={{ height }}>
      <Bar
        data={{ labels, datasets: datasets.map(d => ({ label: d.label, data: d.data, backgroundColor: d.color, borderRadius: 3, datalabels })) }}
        options={{
          indexAxis: horizontal ? 'y' as const : 'x' as const,
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: C.gray, font: { size: 10 } } }, datalabels },
          scales: {
            x: { grid: gridOpts, ticks: { ...tickOpts, ...(xFormat ? { callback: xFormat as any } : {}) } },
            y: { grid: gridOpts, ticks: { ...tickOpts, ...(yFormat ? { callback: yFormat as any } : {}) } },
          },
          layout: { padding: { top: 20 } },
        }}
      />
    </div>
  )
}
