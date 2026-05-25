'use client'
import { useEffect } from 'react'
import { registerCharts } from './charts/ChartWrapper'

export default function ChartsInit() {
  useEffect(() => { registerCharts() }, [])
  return null
}
