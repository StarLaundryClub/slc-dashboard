// @ts-nocheck
'use client'
import { Bar } from 'react-chartjs-2'
import { C, gridOpts, tickOpts, legendOpts, dlSeg, dlH } from './ChartWrapper'

interface Props {
  labels: string[]
  datasets: { label: string; data: (number | null)[]; color: string }[]
  totalLine?: (number | null)[]
  height?: number
}

export default function RevenueStackedChart({ labels, datasets, totalLine, height = 220 }: Props) {
  const ds: any[] = datasets.map(d => ({
    type: 'bar' as const,
    label: d.label,
    data: d.data,
    backgroundColor: d.color,
    stack: 's',
    datalabels: dlSeg,
  }))
  if (totalLine) {
    ds.push({
      type: 'line' as const,
      label: 'Total Revenue',
      data: totalLine,
      borderColor: C.amber,
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: C.amber,
      borderWidth: 2,
      yAxisID: 'y',
      datalabels: { display: true, align: 'top' as const, color: C.amber, font: { size: 9, weight: '600' as const }, formatter: (v: number) => v > 0 ? '$' + Math.round(v / 1000) + 'k' : '' },
    })
  }
  return (
    <div style={{ height }}>
      <Bar
        data={{ labels, datasets: ds }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: legendOpts, datalabels: dlH },
          scales: {
            x: { grid: gridOpts, ticks: tickOpts, stacked: true },
            y: { grid: gridOpts, ticks: tickOpts, stacked: true },
          },
          layout: { padding: { top: 20 } },
        }}
      />
    </div>
  )
}
