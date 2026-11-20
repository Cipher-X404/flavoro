/**
 * Small, dependency-free date helpers for the reservation prototype.
 * All dates are handled as local-time ISO calendar strings (`YYYY-MM-DD`)
 * and times as 24-hour strings (`HH:MM`). This keeps the JSON layer portable
 * and avoids the UTC drift that `Date#toISOString()` introduces.
 */

const pad = (value) => String(value).padStart(2, '0')

export function todayISO(reference = new Date()) {
  return `${reference.getFullYear()}-${pad(reference.getMonth() + 1)}-${pad(reference.getDate())}`
}

export function toISODate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  return todayISO(date)
}

export function parseISODate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''))
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export function isValidISODate(iso) {
  const parsed = parseISODate(iso)
  return Boolean(parsed) && toISODate(parsed) === iso
}

export function addDays(iso, amount) {
  const date = parseISODate(iso)
  if (!date) return ''
  date.setDate(date.getDate() + Number(amount || 0))
  return toISODate(date)
}

export function daysBetween(startISO, endISO) {
  const start = parseISODate(startISO)
  const end = parseISODate(endISO)
  if (!start || !end) return 0
  return Math.round((end - start) / 86400000)
}

export function weekdayIndex(iso) {
  const date = parseISODate(iso)
  return date ? date.getDay() : -1
}

export const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatDateLong(iso) {
  const date = parseISODate(iso)
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(iso) {
  const date = parseISODate(iso)
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateCompact(iso) {
  const date = parseISODate(iso)
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function timeToMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time || '').trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes) {
  const value = ((Number(totalMinutes) % 1440) + 1440) % 1440
  return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`
}

export function formatTime12(time) {
  const minutes = timeToMinutes(time)
  if (minutes === null) return '—'
  const hours24 = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${pad(mins)} ${suffix}`
}

export function formatDuration(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0))
  if (value < 60) return `${value} min`
  const hours = Math.floor(value / 60)
  const rest = value % 60
  return rest ? `${hours}h ${rest}m` : `${hours}h`
}

/** Absolute timestamp for a local date + time pair. */
export function toTimestamp(iso, time = '00:00') {
  const date = parseISODate(iso)
  const minutes = timeToMinutes(time)
  if (!date || minutes === null) return null
  date.setMinutes(minutes)
  return date.getTime()
}

export function isPastDateTime(iso, time, reference = new Date()) {
  const stamp = toTimestamp(iso, time)
  return stamp === null ? true : stamp < reference.getTime()
}

export function relativeTimeLabel(timestamp, reference = Date.now()) {
  const diff = Math.round((reference - Number(timestamp || 0)) / 1000)
  if (!Number.isFinite(diff)) return 'just now'
  if (diff < 45) return 'just now'
  if (diff < 3600) return `${Math.max(1, Math.round(diff / 60))}m ago`
  if (diff < 86400) return `${Math.max(1, Math.round(diff / 3600))}h ago`
  if (diff < 604800) return `${Math.max(1, Math.round(diff / 86400))}d ago`
  return new Date(Number(timestamp)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
