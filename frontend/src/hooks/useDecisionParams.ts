import type { MetaResponse } from '../types/api'
import { clampDate, isDate, isLocalDateTime, londonLocalToUtcIso } from '../lib/time'
import { useSearchParamState } from './useSearchParamState'

export interface DecisionParams {
  date: string
  /** Custom cutoff as London local 'YYYY-MM-DDTHH:mm', or null for the default rule. */
  cutoffLocal: string | null
  /** UTC ISO cutoff to send to the API, or undefined for the default rule. */
  cutoffUtc: string | undefined
  showActuals: boolean
}

/** Decision View filters, read from and written to the URL (?date=&cutoff=&actuals=). */
export function useDecisionParams(meta: MetaResponse) {
  const [search, update] = useSearchParamState()

  const rawDate = search.get('date')
  // Without a date, open the latest delivery day in the data.
  const date = isDate(rawDate) ? clampDate(rawDate, meta.data_start, meta.data_end) : meta.data_end
  const rawCutoff = search.get('cutoff')
  const cutoffLocal = isLocalDateTime(rawCutoff) ? rawCutoff : null

  const params: DecisionParams = {
    date,
    cutoffLocal,
    cutoffUtc: cutoffLocal ? londonLocalToUtcIso(cutoffLocal) : undefined,
    showActuals: search.get('actuals') !== '0',
  }

  return {
    params,
    // A new delivery day resets any custom cutoff, which belonged to the old day.
    setDate: (value: string) => update({ date: value, cutoff: null }),
    setCutoff: (local: string | null) => update({ cutoff: local }),
    setShowActuals: (show: boolean) => update({ actuals: show ? null : '0' }),
  }
}
