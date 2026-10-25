import type { AccuracyResponse } from '../../types/api'
import { formatDate, formatGw, formatHorizon } from '../../lib/format'

/** Plain-English buffer guidance from the P90 miss and the bias. */
export function BufferCallout({ accuracy }: { accuracy: AccuracyResponse }) {
  const { p90_abs_error, bias, n_points } = accuracy.metrics
  const direction = bias >= 0 ? 'high' : 'low'
  return (
    <aside className="rounded-card border-l-4 border-forecast bg-forecast-soft px-5 py-4">
      <p className="text-lead">
        90% of the time, the forecast made {formatHorizon(accuracy.horizon)} missed by less than{' '}
        <strong className="font-semibold num">{formatGw(p90_abs_error)} GW</strong>. On average it ran{' '}
        <strong className="font-semibold num">
          {formatGw(Math.abs(bias))} GW {direction}
        </strong>
        .
      </p>
      <p className="mt-1 text-ink-muted">
        Based on {n_points} hours from {formatDate(accuracy.start)} to {formatDate(accuracy.end)}. Use these two numbers to
        size the backup you buy against the forecast.
      </p>
    </aside>
  )
}
