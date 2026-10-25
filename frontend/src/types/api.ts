// Mirrors backend/app/models.py. Timestamps are ISO 8601 UTC strings; dates are YYYY-MM-DD.

export type Horizon = number | 'cutoff'

export interface Point {
  time: string
  forecast_mw: number | null
  actual_mw: number | null
  publish_time: string | null
}

export interface ForecastSummary {
  peak_mw: number
  min_mw: number
  avg_mw: number
  total_mwh: number
}

export interface ForecastResponse {
  date: string
  cutoff_utc: string
  forecast_as_of_min: string
  forecast_as_of_max: string
  points: Point[]
  summary: ForecastSummary
}

export interface ExtremeError {
  time: string
  error_mw: number
}

export interface Metrics {
  mae: number
  rmse: number
  bias: number
  mape: number | null
  p90_abs_error: number
  worst_over: ExtremeError | null
  worst_under: ExtremeError | null
  n_points: number
}

export interface HourError {
  hour: number
  mae: number
  bias: number
}

export interface HistogramBin {
  bin_start: number
  bin_end: number
  count: number
}

export interface HorizonError {
  horizon: number
  mae: number
  rmse: number
}

export interface AccuracyResponse {
  start: string
  end: string
  horizon: Horizon
  metrics: Metrics
  by_hour: HourError[]
  histogram: HistogramBin[]
  by_horizon: HorizonError[]
}

export interface TimeseriesResponse {
  start: string
  end: string
  horizon: Horizon
  points: Point[]
}

export interface MetaResponse {
  data_start: string
  data_end: string
  default_cutoff_rule: string
  horizons: number[]
  ingested_at: string
  row_counts: { actuals: number; forecasts: number }
}

export interface ForecastQuery {
  date: string
  cutoff?: string
}

export interface RangeQuery {
  start: string
  end: string
  horizon: Horizon
}
