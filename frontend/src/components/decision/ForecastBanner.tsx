import type { ForecastResponse } from '../../types/api'
import { formatDateTime, formatUtc } from '../../lib/format'

function Time({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={formatUtc(iso)} className="font-semibold num">
      {formatDateTime(iso)}
    </time>
  )
}

/** States which forecast is shown and confirms it predates the cutoff. */
export function ForecastBanner({ forecast }: { forecast: ForecastResponse }) {
  const single = forecast.forecast_as_of_min === forecast.forecast_as_of_max
  return (
    <p className="rounded-card border-l-4 border-forecast bg-forecast-soft px-4 py-3 text-lead">
      Forecast as of{' '}
      {single ? (
        <Time iso={forecast.forecast_as_of_max} />
      ) : (
        <>
          <Time iso={forecast.forecast_as_of_min} /> – <Time iso={forecast.forecast_as_of_max} />
        </>
      )}
      . Decision made before <Time iso={forecast.cutoff_utc} />.{' '}
      <span className="text-body text-ink-muted">London time; hover a time for UTC.</span>
    </p>
  )
}
