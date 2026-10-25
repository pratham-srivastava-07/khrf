import type { Metrics } from '../../types/api'
import { formatDateTime, formatGw, formatSignedGw } from '../../lib/format'
import { MetricCard } from '../ui/MetricCard'
import { Skeleton } from '../ui/Skeleton'

const GRID = 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6'

interface MetricCardsProps {
  metrics: Metrics
  onFocus: (time: string) => void
}

export function MetricCards({ metrics, onFocus }: MetricCardsProps) {
  const { mae, rmse, bias, mape, p90_abs_error, worst_over, worst_under, n_points } = metrics
  return (
    <div className={GRID}>
      <MetricCard
        label="Average miss (MAE)"
        value={formatGw(mae)}
        unit="GW"
        hint={mape !== null ? `${Math.round(mape)}% of actual output` : `${n_points} hours`}
      />
      <MetricCard label="RMSE" value={formatGw(rmse)} unit="GW" hint="Weights large misses more" />
      <MetricCard
        label="Bias"
        value={formatSignedGw(bias)}
        unit="GW"
        tone={bias >= 0 ? 'over' : 'under'}
        hint={bias >= 0 ? 'Forecast ran high' : 'Forecast ran low'}
      />
      <MetricCard label="P90 miss" value={formatGw(p90_abs_error)} unit="GW" hint="90% of hours missed by less" />
      {worst_over ? (
        <MetricCard
          label="Worst over-forecast"
          value={formatSignedGw(worst_over.error_mw)}
          unit="GW"
          tone="over"
          hint={formatDateTime(worst_over.time)}
          onClick={() => onFocus(worst_over.time)}
          actionLabel="Show in chart"
        />
      ) : (
        <MetricCard label="Worst over-forecast" value="None" hint="Never over-forecast" />
      )}
      {worst_under ? (
        <MetricCard
          label="Worst under-forecast"
          value={formatSignedGw(worst_under.error_mw)}
          unit="GW"
          tone="under"
          hint={formatDateTime(worst_under.time)}
          onClick={() => onFocus(worst_under.time)}
          actionLabel="Show in chart"
        />
      ) : (
        <MetricCard label="Worst under-forecast" value="None" hint="Never under-forecast" />
      )}
    </div>
  )
}

export function MetricCardsSkeleton() {
  return (
    <div className={GRID}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-[112px]" />
      ))}
    </div>
  )
}
