// Shared Recharts styling. Colors reference the CSS tokens in index.css.

export const COLORS = {
  forecast: 'var(--color-forecast)',
  actual: 'var(--color-actual)',
  over: 'var(--color-over)',
  under: 'var(--color-under)',
  grid: 'var(--color-line)',
  axis: 'var(--color-ink-muted)',
  focus: 'var(--color-alert)',
} as const

export const ACTUAL_DASH = '5 4'

export const axisProps = {
  stroke: COLORS.grid,
  tick: { fill: COLORS.axis, fontSize: 12 },
  tickLine: false,
} as const

const mw = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
export const formatAxisMw = (value: number) => mw.format(value)
