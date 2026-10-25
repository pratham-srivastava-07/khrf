import type { ForecastResponse } from '../../types/api'
import { formatGw, formatGwh, formatTime } from '../../lib/format'
import { MetricCard } from '../ui/MetricCard'
import { Skeleton } from '../ui/Skeleton'

const GRID = 'grid grid-cols-2 gap-4 lg:grid-cols-4'

function timeOf(forecast: ForecastResponse, mw: number): string | undefined {
  const point = forecast.points.find((p) => p.forecast_mw === mw)
  return point ? formatTime(point.time) : undefined
}

export function SummaryCards({ forecast }: { forecast: ForecastResponse }) {
  const { summary } = forecast
  const peakAt = timeOf(forecast, summary.peak_mw)
  const minAt = timeOf(forecast, summary.min_mw)
  return (
    <div className={GRID}>
      <MetricCard label="Peak" value={formatGw(summary.peak_mw)} unit="GW" hint={peakAt && `at ${peakAt}`} />
      <MetricCard label="Minimum" value={formatGw(summary.min_mw)} unit="GW" hint={minAt && `at ${minAt}`} />
      <MetricCard label="Average" value={formatGw(summary.avg_mw)} unit="GW" />
      <MetricCard label="Total expected" value={formatGwh(summary.total_mwh)} unit="GWh" hint="Energy over the day" />
    </div>
  )
}

export function SummaryCardsSkeleton() {
  return (
    <div className={GRID}>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[104px]" />
      ))}
    </div>
  )
}
