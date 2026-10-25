// Date and time helpers. Dates are 'YYYY-MM-DD'; London local times are 'YYYY-MM-DDTHH:mm'.

export const LONDON = 'Europe/London'

const LOCAL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export const isDate = (value: string | null): value is string =>
  value !== null && DATE_RE.test(value) && !Number.isNaN(Date.parse(value))

export const isLocalDateTime = (value: string | null): value is string =>
  value !== null && LOCAL_RE.test(value)

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** Minutes London is ahead of UTC at the given instant (0 in winter, 60 in summer). */
function londonOffsetMinutes(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: LONDON,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(instant)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'))
  return Math.round((asUtc - instant.getTime()) / 60000)
}

/** London wall-clock time -> ISO 8601 UTC string (DST-safe). */
export function londonLocalToUtcIso(local: string): string {
  const [date, time] = local.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const wall = Date.UTC(y, m - 1, d, hh, mm)
  let utc = wall - londonOffsetMinutes(new Date(wall)) * 60000
  // Re-check near a DST change, where the first guess can land on the other side.
  utc = wall - londonOffsetMinutes(new Date(utc)) * 60000
  return new Date(utc).toISOString().replace('.000Z', 'Z')
}

/** Default decision cutoff for a delivery day: D-1 09:00 London. */
export const defaultCutoffLocal = (deliveryDate: string): string => `${addDays(deliveryDate, -1)}T09:00`

export const clampDate = (date: string, min: string, max: string): string =>
  date < min ? min : date > max ? max : date
