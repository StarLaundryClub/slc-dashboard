// @ts-nocheck
'use client'
import { Doughnut } from 'react-chartjs-2'
import { C } from './ChartWrapper'

interface Props {
  labels: string[]
  data: number[]
  colors?: string[]
  height?: number
}

const DEFAULT_COLORS = [C.teal, C.tealBright, C.amber, C.tealMid, C.gray, C.purple, C.pink, C.blue]

export default function DoughnutChart({ labels, data, colors = DEFAULT_COLORS, height = 180 }: Props) {
  return (
    <div style={{ height }}>
      <Doughnut
        data={{ labels, datasets: [{ data, backgroundColor: colors, borderColor: '#22262f', borderWidth: 2 }] }}
        options={{
          responsive: true, maintainAspectRatio: false,
          cutout: '55%',
          plugins: {
            legend: { position: 'right' as const, labels: { boxWidth: 8, padding: 5, font: { size: 10 }, color: C.gray } },
            datalabels: {
              color: C.white, font: { size: 9, weight: '600' as const },
              formatter: (v: number, ctx: any) => {
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0)
                const pct = Math.round(v / total * 100)
                return pct >= 10 ? pct + '%' : ''
              },
            },
          },
        }}
      />
    </div>
  )
}
