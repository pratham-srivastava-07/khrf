import type { Point } from '../types/api'

/** Chart row: numeric time for Recharts, values kept null where data is missing. */
export interface ChartDatum {
  t: number
  time: string
  /** The forecast at this exact time (null at :30, where WINDFOR has no value). */
  forecast: number | null
  actual: number | null
  publishTime: string | null
  /**
   * Value the forecast line passes through. Equals `forecast` on the hour; at :30 it is
   * the midpoint of the neighbouring hours so the line connects them, and null if either
   * neighbour is missing so real gaps stay visible.
   */
  forecastLine: number | null
  /** A forecast with no line segment on either side; drawn as a dot so it stays visible. */
  isolated: boolean
  /** [actual, forecastLine] where the forecast is above the actual, else null. */
  overBand: [number, number] | null
  /** [forecastLine, actual] where the forecast is below the actual, else null. */
  underBand: [number, number] | null
}

const HALF_HOUR = 30 * 60 * 1000

export function toChartData(points: Point[]): ChartDatum[] {
  const forecastAt = new Map<number, number>()
  for (const p of points) {
    if (p.forecast_mw !== null) forecastAt.set(Date.parse(p.time), p.forecast_mw)
  }

  const rows = points.map((p) => {
    const t = Date.parse(p.time)
    let line = p.forecast_mw
    if (line === null) {
      const before = forecastAt.get(t - HALF_HOUR)
      const after = forecastAt.get(t + HALF_HOUR)
      line = before !== undefined && after !== undefined ? (before + after) / 2 : null
    }
    const actual = p.actual_mw
    return {
      t,
      time: p.time,
      forecast: p.forecast_mw,
      actual,
      publishTime: p.publish_time,
      forecastLine: line,
      isolated: false,
      overBand: line !== null && actual !== null && line > actual ? ([actual, line] as [number, number]) : null,
      underBand: line !== null && actual !== null && line < actual ? ([line, actual] as [number, number]) : null,
    }
  })

  return rows.map((row, i) => ({
    ...row,
    isolated: row.forecast !== null && rows[i - 1]?.forecastLine == null && rows[i + 1]?.forecastLine == null,
  }))
}
