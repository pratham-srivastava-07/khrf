import type { Horizon, MetaResponse } from '../types/api'
import { clampDate, isDate } from '../lib/time'
import { useSearchParamState } from './useSearchParamState'

export interface AccuracyParams {
  start: string
  end: string
  horizon: Horizon
  /** ISO time of the point to highlight in the time series, if any. */
  focus: string | null
}

function parseHorizon(raw: string | null, horizons: number[]): Horizon {
  const hours = Number(raw)
  return raw !== null && horizons.includes(hours) ? hours : 'cutoff'
}

/** Accuracy filters, read from and written to the URL (?start=&end=&horizon=&focus=). */
export function useAccuracyParams(meta: MetaResponse) {
  const [search, update] = useSearchParamState()

  const rawStart = search.get('start')
  const rawEnd = search.get('end')
  const start = isDate(rawStart) ? clampDate(rawStart, meta.data_start, meta.data_end) : meta.data_start
  let end = isDate(rawEnd) ? clampDate(rawEnd, meta.data_start, meta.data_end) : meta.data_end
  if (end < start) end = start

  const params: AccuracyParams = {
    start,
    end,
    horizon: parseHorizon(search.get('horizon'), meta.horizons),
    focus: search.get('focus'),
  }

  return {
    params,
    // Changing the selection clears the highlight, which may fall outside it.
    setRange: (nextStart: string, nextEnd: string) => update({ start: nextStart, end: nextEnd, focus: null }),
    setHorizon: (horizon: Horizon) => update({ horizon: horizon === 'cutoff' ? null : String(horizon), focus: null }),
    setFocus: (time: string | null) => update({ focus: time }),
  }
}
