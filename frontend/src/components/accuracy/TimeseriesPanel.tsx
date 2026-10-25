import { forwardRef, useMemo } from 'react'
import type { AccuracyParams } from '../../hooks/useAccuracyParams'
import { useTimeseries } from '../../hooks/useTimeseries'
import { formatDate, formatDateTime, formatHorizon } from '../../lib/format'
import { ForecastActualChart } from '../charts/ForecastActualChart'
import { Card } from '../ui/Card'
import { QueryState } from '../ui/QueryState'
import { Skeleton } from '../ui/Skeleton'

// When a point is highlighted, show this much either side of it.
const FOCUS_WINDOW_MS = 24 * 60 * 60 * 1000

interface TimeseriesPanelProps {
  params: AccuracyParams
  onClearFocus: () => void
}

export const TimeseriesPanel = forwardRef<HTMLDivElement, TimeseriesPanelProps>(function TimeseriesPanel(
  { params, onClearFocus },
  ref,
) {
  const timeseries = useTimeseries({ start: params.start, end: params.end, horizon: params.horizon })
  const focusT = params.focus ? Date.parse(params.focus) : null

  const points = useMemo(() => {
    const all = timeseries.data?.points ?? []
    if (focusT === null) return all
    return all.filter((p) => Math.abs(Date.parse(p.time) - focusT) <= FOCUS_WINDOW_MS)
  }, [timeseries.data, focusT])

  return (
    <div ref={ref} className="scroll-mt-20">
      <Card
        title="Forecast vs actual"
        description={
          params.focus
            ? `24 hours either side of ${formatDateTime(params.focus)}, forecast made ${formatHorizon(params.horizon)}. Values in MW.`
            : `${formatDate(params.start)} to ${formatDate(params.end)}, forecast made ${formatHorizon(params.horizon)}. Values in MW.`
        }
        actions={
          params.focus && (
            <button
              type="button"
              onClick={onClearFocus}
              className="min-h-11 cursor-pointer rounded-lg px-3 font-medium text-forecast transition-colors duration-150 ease-out hover:bg-forecast-soft"
            >
              Show full range
            </button>
          )
        }
      >
        <QueryState
          query={timeseries}
          errorTitle="Couldn't load the time series"
          emptyMessage="No forecasts for this selection."
          skeleton={<Skeleton className="h-[400px] w-full" />}
        >
          {() => (
            <ForecastActualChart
              points={points}
              showActuals
              showErrorBands
              focus={params.focus}
              scale={params.focus ? 'window' : params.start === params.end ? 'day' : 'range'}
              summary={`Forecast and actual wind generation from ${formatDate(params.start)} to ${formatDate(params.end)}.`}
            />
          )}
        </QueryState>
      </Card>
    </div>
  )
})
