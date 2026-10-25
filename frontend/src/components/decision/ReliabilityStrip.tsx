import { Link } from 'react-router-dom'
import type { MetaResponse } from '../../types/api'
import { useAccuracy } from '../../hooks/useAccuracy'
import { formatGw } from '../../lib/format'
import { Skeleton } from '../ui/Skeleton'

/** How far forecasts made at the decision cutoff have typically missed. */
export function ReliabilityStrip({ meta }: { meta: MetaResponse }) {
  const accuracy = useAccuracy({ start: meta.data_start, end: meta.data_end, horizon: 'cutoff' })

  if (accuracy.isPending) return <Skeleton className="h-14 w-full" />
  if (accuracy.isError) return null // Secondary info; the Accuracy tab shows the full error.

  const { p90_abs_error, bias } = accuracy.data.metrics
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-card">
      <p>
        Typical miss at this horizon:{' '}
        <span className="font-semibold num">±{formatGw(p90_abs_error)} GW</span>{' '}
        <span className="text-ink-muted">(P90).</span> Forecasts made at the cutoff ran{' '}
        <span className="font-semibold num">
          {formatGw(Math.abs(bias))} GW {bias >= 0 ? 'high' : 'low'}
        </span>{' '}
        on average in the data period.
      </p>
      <Link
        to="/dashboard/accuracy?horizon=cutoff"
        className="min-h-11 content-center rounded-lg px-3 font-medium text-forecast transition-colors duration-150 ease-out hover:bg-forecast-soft"
      >
        See accuracy details →
      </Link>
    </div>
  )
}
