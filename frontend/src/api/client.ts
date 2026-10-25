import type {
  AccuracyResponse,
  ForecastQuery,
  ForecastResponse,
  MetaResponse,
  RangeQuery,
  TimeseriesResponse,
} from '../types/api'

// Relative in every environment; Vite proxies /api locally, Vercel routes it in production.
const API_BASE = '/api'

/** An error response from the API, carrying its `detail` message. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Params = Record<string, string | number | undefined>

async function request<T>(path: string, params: Params = {}): Promise<T> {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value))
  }
  const query = search.toString()
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}${query ? `?${query}` : ''}`)
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const detail =
      body !== null && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string'
        ? body.detail
        : `Request failed (${response.status})`
    throw new ApiError(response.status, detail)
  }
  return (await response.json()) as T
}

export const getMeta = () => request<MetaResponse>('/meta')

export const getForecast = (q: ForecastQuery) =>
  request<ForecastResponse>('/forecast', { date: q.date, cutoff: q.cutoff })

export const getAccuracy = (q: RangeQuery) =>
  request<AccuracyResponse>('/accuracy', { start: q.start, end: q.end, horizon: q.horizon })

export const getTimeseries = (q: RangeQuery) =>
  request<TimeseriesResponse>('/timeseries', { start: q.start, end: q.end, horizon: q.horizon })
