/**
 * Availability engine.
 *
 * Pure, synchronous calculations over the locally stored restaurant settings,
 * tables and reservations. Nothing here reads the DOM.
 *
 * IMPORTANT PROTOTYPE LIMITATION: localStorage is per-browser. Two devices can
 * both "book" the last table. This engine makes the demo internally coherent
 * inside one browser; it is not a global inventory system.
 */

import {
  addDays,
  formatDateCompact,
  formatTime12,
  isPastDateTime,
  minutesToTime,
  parseISODate,
  timeToMinutes,
  todayISO,
  weekdayIndex,
  WEEKDAY_LONG,
} from './datetime.js'
import { ZONES } from './seed.js'
import { getReservations, getSettings, getTables } from './store.js'

export { ZONES }

export const ACTIVE_RESERVATION_STATUSES = ['pending', 'confirmed', 'seated', 'completed']
export const ZONE_ANY = 'any'

export function isActiveReservation(reservation) {
  return Boolean(reservation) && ACTIVE_RESERVATION_STATUSES.includes(reservation.status)
}

export function getZone(zoneId) {
  return ZONES.find((zone) => zone.id === zoneId) || null
}

export function zoneName(zoneId) {
  if (zoneId === ZONE_ANY) return 'Best available table'
  return getZone(zoneId)?.name || 'Dining room'
}

export function zoneOptions() {
  return [...ZONES]
}

export function getServiceWindow(dateISO, settings = getSettings()) {
  const hours = settings.openingHours?.[weekdayIndex(dateISO)]
  if (!hours || !hours.open || !hours.close) return null
  const open = timeToMinutes(hours.open)
  const close = timeToMinutes(hours.close)
  if (open === null || close === null || close <= open) return null
  return { open, close, openTime: hours.open, closeTime: hours.close }
}

function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA
}

/** Occupied table windows for a given date (minutes from midnight). */
export function getOccupiedWindows(dateISO, { excludeReservationId = null, settings = getSettings() } = {}) {
  return getReservations()
    .filter((reservation) => reservation.date === dateISO)
    .filter((reservation) => isActiveReservation(reservation))
    .filter((reservation) => reservation.id !== excludeReservationId)
    .map((reservation) => {
      const start = timeToMinutes(reservation.time)
      const duration = Number(reservation.durationMinutes) || settings.reservationDurationMinutes
      const buffer = Number.isFinite(Number(reservation.turnoverBufferMinutes))
        ? Number(reservation.turnoverBufferMinutes)
        : settings.turnoverBufferMinutes
      return {
        reservationId: reservation.id,
        reference: reservation.reference,
        tableId: reservation.tableId,
        start,
        end: start === null ? null : start + duration + buffer,
        status: reservation.status,
      }
    })
    .filter((window) => window.start !== null && window.end !== null)
}

export function getBookableTables({ zoneId = ZONE_ANY, partySize = 2, settings = getSettings() } = {}) {
  const size = Number(partySize) || 1
  return getTables()
    .filter((table) => table.reservable !== false)
    .filter((table) => table.status !== 'out_of_service')
    .filter((table) => Number(table.seats) >= size)
    .filter((table) => Number(table.minSeats || 1) <= size)
    .filter((table) => zoneId === ZONE_ANY || table.zoneId === zoneId)
    // Don't seat a party of two in the eight-seat private alcove when other
    // rooms can host them; the zone's own minimum still applies.
    .filter((table) => {
      if (zoneId !== ZONE_ANY) return true
      if (table.zoneId !== 'private') return true
      return size >= Number(table.minSeats || 6)
    })
    .filter((table) => {
      const zone = getZone(table.zoneId)
      if (!zone) return true
      return size >= Number(zone.minPartySize || 1) && size <= Number(zone.maxPartySize || 99)
    })
    .sort((a, b) => Number(a.seats) - Number(b.seats))
}

export function validatePartySize(partySize, settings = getSettings()) {
  const size = Number(partySize)
  if (!Number.isInteger(size) || size < Number(settings.minPartySize) || size > Number(settings.maxPartySize)) {
    return `Party size must be between ${settings.minPartySize} and ${settings.maxPartySize} guests.`
  }
  return ''
}

export function validateZoneForParty(zoneId, partySize) {
  if (zoneId === ZONE_ANY) return ''
  const zone = getZone(zoneId)
  if (!zone) return 'Choose a valid seating area.'
  const size = Number(partySize)
  if (size < Number(zone.minPartySize || 1)) return `${zone.name} seats ${zone.minPartySize}+ guests.`
  if (size > Number(zone.maxPartySize || 99)) return `${zone.name} seats up to ${zone.maxPartySize} guests.`
  return ''
}

/** First table that can host the party at the requested slot. */
export function findTable({
  dateISO,
  time,
  partySize,
  zoneId = ZONE_ANY,
  excludeReservationId = null,
  settings = getSettings(),
} = {}) {
  const start = timeToMinutes(time)
  if (start === null) return null
  const candidateEnd = start + Number(settings.reservationDurationMinutes) + Number(settings.turnoverBufferMinutes)
  const windows = getOccupiedWindows(dateISO, { excludeReservationId, settings })
  const candidates = getBookableTables({ zoneId, partySize, settings })
  for (const table of candidates) {
    const clash = windows.some(
      (window) => window.tableId === table.id && intervalsOverlap(start, candidateEnd, window.start, window.end),
    )
    if (!clash) return table
  }
  return null
}

export function isDateBlocked(dateISO, settings = getSettings()) {
  return (settings.blockedDates || []).some((entry) => (typeof entry === 'string' ? entry : entry?.date) === dateISO)
}

export function getBlockedDateInfo(dateISO, settings = getSettings()) {
  return (settings.blockedDates || []).find((entry) => (typeof entry === 'string' ? entry : entry?.date) === dateISO) || null
}

export function isSlotBlocked(dateISO, time, settings = getSettings()) {
  return (settings.blockedSlots || []).some(
    (entry) => entry?.date === dateISO && entry?.time === time,
  )
}

export function getBlockedSlotInfo(dateISO, time, settings = getSettings()) {
  return (settings.blockedSlots || []).find((entry) => entry?.date === dateISO && entry?.time === time) || null
}

export function generateSlotTimes(dateISO, settings = getSettings()) {
  const window = getServiceWindow(dateISO, settings)
  if (!window) return []
  const interval = Math.max(5, Number(settings.slotIntervalMinutes) || 30)
  const lastSeating = Math.max(
    window.open,
    window.close - Math.max(0, Number(settings.lastSeatingOffsetMinutes) || 0),
  )
  const times = []
  for (let minutes = window.open; minutes <= lastSeating; minutes += interval) {
    times.push(minutesToTime(minutes))
  }
  return times
}

export function withinBookingWindow(dateISO, settings = getSettings(), reference = new Date()) {
  const today = todayISO(reference)
  const maxDate = addDays(today, Math.max(1, Number(settings.advanceBookingDays) || 60))
  if (dateISO < today) return { ok: false, reason: 'That date has already passed.' }
  if (dateISO > maxDate) return { ok: false, reason: `Online booking opens ${settings.advanceBookingDays} days ahead.` }
  return { ok: true, reason: '' }
}

function leadTimeOk(dateISO, time, settings, reference) {
  const leadHours = Math.max(0, Number(settings.leadTimeHours) || 0)
  if (!leadHours) return !isPastDateTime(dateISO, time, reference)
  const stamp = new Date(`${dateISO}T${time}`)
  if (Number.isNaN(stamp.getTime())) return false
  return stamp.getTime() - reference.getTime() >= leadHours * 60 * 60 * 1000
}

/**
 * Every slot for a date with a per-slot availability verdict.
 * Reasons are human-readable so the UI can explain *why* a slot is closed.
 */
export function getSlotsForDate(
  dateISO,
  { partySize = 2, zoneId = ZONE_ANY, excludeReservationId = null, settings = getSettings(), reference = new Date() } = {},
) {
  const date = parseISODate(dateISO)
  if (!date) {
    return { date: dateISO, open: false, reason: 'Choose a valid date.', slots: [], hours: null }
  }
  const hours = getServiceWindow(dateISO, settings)
  if (!hours) {
    return {
      date: dateISO,
      open: false,
      reason: `${getSettingsDayName(dateISO)} is a closed day.`,
      slots: [],
      hours: null,
      weekday: WEEKDAY_LONG[weekdayIndex(dateISO)],
    }
  }
  const blockedDate = getBlockedDateInfo(dateISO, settings)
  if (blockedDate) {
    return {
      date: dateISO,
      open: false,
      reason: blockedDate.reason ? `Closed: ${blockedDate.reason}` : 'The restaurant is closed on this date.',
      slots: [],
      hours,
      blocked: true,
      weekday: WEEKDAY_LONG[weekdayIndex(dateISO)],
    }
  }
  const windowCheck = withinBookingWindow(dateISO, settings, reference)
  if (!windowCheck.ok) {
    return { date: dateISO, open: false, reason: windowCheck.reason, slots: [], hours, weekday: WEEKDAY_LONG[weekdayIndex(dateISO)] }
  }
  const partyError = validatePartySize(partySize, settings)
  const zoneError = validateZoneForParty(zoneId, partySize)
  const slotTimes = generateSlotTimes(dateISO, settings)
  const windows = getOccupiedWindows(dateISO, { excludeReservationId, settings })

  const slots = slotTimes.map((time) => {
    const start = timeToMinutes(time)
    const end = start + Number(settings.reservationDurationMinutes) + Number(settings.turnoverBufferMinutes)
    const blockedSlot = getBlockedSlotInfo(dateISO, time, settings)
    const lead = leadTimeOk(dateISO, time, settings, reference)
    const freeTables = getBookableTables({ zoneId, partySize, settings }).filter((table) => {
      return !windows.some((window) => window.tableId === table.id && intervalsOverlap(start, end, window.start, window.end))
    })
    let reason = ''
    if (partyError) reason = partyError
    else if (zoneError) reason = zoneError
    else if (blockedSlot) reason = blockedSlot.reason ? `Blocked: ${blockedSlot.reason}` : 'This sitting is blocked.'
    else if (!lead) reason = 'Too soon to book online.'
    else if (!freeTables.length) reason = 'Fully booked for this sitting.'
    return {
      time,
      label: formatTime12(time),
      available: !reason,
      reason,
      tablesFree: freeTables.length,
      seatsFree: freeTables.reduce((sum, table) => sum + Number(table.seats), 0),
      blocked: Boolean(blockedSlot),
    }
  })

  return {
    date: dateISO,
    open: true,
    hours,
    reason: '',
    slots,
    availableCount: slots.filter((slot) => slot.available).length,
    weekday: WEEKDAY_LONG[weekdayIndex(dateISO)],
  }
}

function getSettingsDayName(dateISO) {
  return WEEKDAY_LONG[weekdayIndex(dateISO)] || 'This day'
}

/** Strip/consult a date for the horizontal date picker. */
export function getAvailabilityCalendar({
  partySize = 2,
  zoneId = ZONE_ANY,
  days = 21,
  startDate = todayISO(),
  settings = getSettings(),
  reference = new Date(),
} = {}) {
  const list = []
  for (let index = 0; index < days; index += 1) {
    const date = addDays(startDate, index)
    const result = getSlotsForDate(date, { partySize, zoneId, settings, reference })
    list.push({
      date,
      weekdayShort: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: new Date(`${date}T12:00:00`).getDate(),
      monthShort: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short' }),
      label: formatDateCompact(date),
      isToday: date === todayISO(reference),
      open: result.open,
      reason: result.reason,
      slotsAvailable: result.availableCount || 0,
      available: Boolean(result.open && result.availableCount > 0),
    })
  }
  return list
}

export function getFirstAvailableSlot({
  partySize = 2,
  zoneId = ZONE_ANY,
  startDate = todayISO(),
  maxDays = 30,
  settings = getSettings(),
  reference = new Date(),
} = {}) {
  for (let index = 0; index < maxDays; index += 1) {
    const date = addDays(startDate, index)
    const result = getSlotsForDate(date, { partySize, zoneId, settings, reference })
    const slot = result.slots?.find((item) => item.available)
    if (slot) return { date, time: slot.time, label: formatTime12(slot.time), slot }
  }
  return null
}

/**
 * Full availability verdict for a requested booking.
 * Returns `{ ok, reasons, table, alternatives, zoneName }`.
 */
export function evaluateAvailability({
  date,
  time,
  partySize = 2,
  zoneId = ZONE_ANY,
  excludeReservationId = null,
  settings = getSettings(),
  reference = new Date(),
} = {}) {
  const reasons = []
  if (!date) reasons.push('Choose a date.')
  if (!time) reasons.push('Choose a time.')
  const partyError = validatePartySize(partySize, settings)
  if (partyError) reasons.push(partyError)
  const zoneError = validateZoneForParty(zoneId, partySize)
  if (zoneError) reasons.push(zoneError)

  if (reasons.length) return { ok: false, reasons, table: null, alternatives: [] }

  const day = getSlotsForDate(date, {
    partySize,
    zoneId,
    settings,
    reference,
    excludeReservationId,
  })
  if (!day.open) return { ok: false, reasons: [day.reason || 'The restaurant is closed.'], table: null, alternatives: [] }

  const slot = day.slots.find((item) => item.time === time)
  if (!slot) {
    return { ok: false, reasons: ['That time is not one of our sitting times.'], table: null, alternatives: [] }
  }
  if (!slot.available) {
    return {
      ok: false,
      reasons: [slot.reason || 'That sitting is not available.'],
      table: null,
      alternatives: collectAlternatives({ date, partySize, zoneId, settings, reference, excludeReservationId }),
    }
  }
  const table = findTable({ dateISO: date, time, partySize, zoneId, excludeReservationId, settings })
  if (!table) {
    return {
      ok: false,
      reasons: ['No table of that size is free at this sitting.'],
      table: null,
      alternatives: collectAlternatives({ date, partySize, zoneId, settings, reference, excludeReservationId }),
    }
  }
  return {
    ok: true,
    reasons: [],
    table,
    slot,
    zoneName: zoneName(zoneId),
    serviceWindow: day.hours,
    alternatives: [],
  }
}

function collectAlternatives({ date, partySize, zoneId, settings, reference, excludeReservationId }) {
  const alternatives = []
  for (let index = 0; index < 10 && alternatives.length < 4; index += 1) {
    const candidateDate = addDays(date, index)
    const day = getSlotsForDate(candidateDate, { partySize, zoneId, excludeReservationId, settings, reference })
    if (!day.open) continue
    for (const slot of day.slots) {
      if (!slot.available) continue
      alternatives.push({ date: candidateDate, time: slot.time, label: `${formatDateCompact(candidateDate)} · ${slot.label}` })
      if (alternatives.length >= 4) break
    }
  }
  return alternatives
}

/** Zone-by-zone capacity summary used on the booking screen. */
export function getZoneAvailability(dateISO, time, partySize, settings = getSettings()) {
  return ZONES.map((zone) => {
    const partyError = validateZoneForParty(zone.id, partySize)
    if (partyError) {
      return { ...zone, available: false, tablesFree: 0, reason: partyError }
    }
    if (!dateISO || !time) {
      return { ...zone, available: null, tablesFree: null, reason: 'Pick a date and time' }
    }
    const day = getSlotsForDate(dateISO, { partySize, zoneId: zone.id, settings })
    const slot = day.slots.find((item) => item.time === time)
    return {
      ...zone,
      available: Boolean(slot?.available),
      tablesFree: slot?.tablesFree || 0,
      reason: slot ? slot.reason : day.reason || 'Service closed',
    }
  })
}

/** Admin floor view for a single date: tables + their bookings. */
export function getFloorOverview(dateISO, settings = getSettings()) {
  const reservations = getReservations().filter(
    (reservation) => reservation.date === dateISO && isActiveReservation(reservation),
  )
  return getTables().map((table) => ({
    ...table,
    bookings: reservations
      .filter((reservation) => reservation.tableId === table.id)
      .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
  }))
}

export function describeServiceWindow(dateISO, settings = getSettings()) {
  const window = getServiceWindow(dateISO, settings)
  if (!window) return 'Closed'
  return `${formatTime12(window.openTime)} – ${formatTime12(window.closeTime)}`
}
