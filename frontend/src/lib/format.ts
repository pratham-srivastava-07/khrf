import { LONDON } from './time'

const number0 = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const number1 = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const londonTime = new Intl.DateTimeFormat('en-GB', { timeZone: LONDON, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const londonDateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: LONDON,
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const londonDay = new Intl.DateTimeFormat('en-GB', { timeZone: LONDON, day: 'numeric', month: 'short' })
const utcDateTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
const longDate = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export const formatMw = (mw: number) => `${number0.format(mw)} MW`
export const formatGw = (mw: number) => number1.format(mw / 1000)
export const formatSignedGw = (mw: number) => `${mw > 0 ? '+' : mw < 0 ? '−' : ''}${number1.format(Math.abs(mw) / 1000)}`
export const formatGwh = (mwh: number) => number1.format(mwh / 1000)

/** '08:30' in London time. */
export const formatTime = (iso: string | number) => londonTime.format(new Date(iso))
/** '14 Jan, 08:30' in London time. */
export const formatDateTime = (iso: string | number) => londonDateTime.format(new Date(iso))
/** '14 Jan' in London time. */
export const formatDay = (iso: string | number) => londonDay.format(new Date(iso))
/** '14 Jan, 08:30 UTC', for hover titles. */
export const formatUtc = (iso: string | number) => `${utcDateTime.format(new Date(iso))} UTC`
/** 'Thu, 15 Jan 2026' for a YYYY-MM-DD date. */
export const formatDate = (date: string) => longDate.format(new Date(`${date}T00:00:00Z`))

export const formatHorizon = (horizon: number | 'cutoff') =>
  horizon === 'cutoff' ? 'at decision cutoff' : `${horizon} hours ahead`
