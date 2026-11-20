#!/usr/bin/env node
/**
 * Headless verification of the reservation data layer.
 *
 * Runs entirely in Node against the same modules the browser uses; the
 * storage adapter falls back to an in-memory map when `localStorage` is absent.
 *
 *   npm run verify:reservations
 *
 * This covers the business rules (availability, duplicate protection, menu
 * orders, cancellation, repeat visits, statuses, table assignment, payments,
 * blocked dates, configuration and test-record deletion). Visual workflows are
 * documented in `docs/reservations.md`.
 */

import assert from 'node:assert/strict'
import * as store from '../src/data/store.js'
import * as availability from '../src/data/availability.js'
import * as reservations from '../src/data/reservations.js'
import { addDays, timeToMinutes, todayISO, weekdayIndex, WEEKDAY_LONG } from '../src/data/datetime.js'
import { readRaw } from '../src/data/storage.js'

let checks = 0
const check = (label, fn) => {
  try {
    fn()
    checks += 1
    console.log(`  ✓ ${label}`)
  } catch (error) {
    console.error(`  ✗ ${label}`)
    throw error
  }
}

const section = (title) => console.log(`\n${title}`)

console.log('Flavoro reservation prototype — data verification\n')

/* ---------------------------------------------------------------------- */
section('Seed & collections')

store.ensureSeeded()

check('all collections exist', () => {
  for (const collection of store.collections) {
    const value = store.getCollection(collection)
    assert.ok(value !== null && value !== undefined, `${collection} missing`)
    const raw = readRaw(store.collectionKey(collection))
    assert.ok(raw, `${collection} not persisted as JSON`)
    JSON.parse(raw)
  }
})

check('seed contains tables, settings and demo reservations', () => {
  assert.ok(store.getTables().length >= 8)
  assert.ok(Object.keys(store.getSettings().openingHours).length === 7)
  assert.ok(store.getReservations().length >= 1)
  assert.ok(store.getMenuItems().length > 10)
})

check('seeded bookings span more than one customer', () => {
  const ids = new Set(store.getReservations().map((reservation) => reservation.customerId))
  assert.ok(ids.size >= 2)
})

/* ---------------------------------------------------------------------- */
section('Availability engine')

const settings = store.getSettings()
const start = addDays(todayISO(), 1)
const calendar = availability.getAvailabilityCalendar({ partySize: 2, zoneId: 'hearth', days: 14, startDate: start })
const firstAvailable = calendar.find((day) => day.available)

check('produces an open date within two weeks', () => {
  assert.ok(firstAvailable, 'no available date found')
})

check('closed weekdays have no slots', () => {
  const closedDate = calendar.find((day) => !day.open)
  if (closedDate) {
    const day = availability.getSlotsForDate(closedDate.date, { partySize: 2 })
    assert.equal(day.slots.length, 0)
    assert.ok(day.reason)
  }
})

const slotDay = availability.getSlotsForDate(firstAvailable.date, { partySize: 2, zoneId: 'hearth' })
const slot = slotDay.slots.find((item) => item.available)

check('sittings respect interval, duration and last seating', () => {
  assert.ok(slotDay.slots.length > 0)
  const window = availability.getServiceWindow(firstAvailable.date)
  assert.ok(window)
  const last = slotDay.slots.at(-1)
  assert.ok(last.time >= window.openTime)
  assert.ok(window.close - Number(settings.lastSeatingOffsetMinutes) >= window.open)
})

check('zone validation rejects parties outside the room range', () => {
  const privateError = availability.validateZoneForParty('private', 2)
  assert.ok(privateError.includes('6+'))
  const mainError = availability.validateZoneForParty('main', 9)
  assert.ok(mainError.length > 0)
})

check('party size limits are enforced', () => {
  assert.ok(availability.validatePartySize(0).length > 0)
  assert.ok(availability.validatePartySize(settings.maxPartySize + 1).length > 0)
  assert.equal(availability.validatePartySize(2), '')
})

check('a table can be found for an open slot', () => {
  const table = availability.findTable({
    dateISO: firstAvailable.date,
    time: slot.time,
    partySize: 2,
    zoneId: 'hearth',
  })
  assert.ok(table)
  assert.ok(table.seats >= 2)
})

/* ---------------------------------------------------------------------- */
section('Guest booking & duplicate protection')

const guestEmail = 'verify.guest@example.com'
const requestId = 'verify-request-1'
const created = reservations.createReservation({
  guest: { name: 'Verify Guest', email: guestEmail, phone: '+1 555 000 1111' },
  date: firstAvailable.date,
  time: slot.time,
  partySize: 2,
  zoneId: 'hearth',
  items: {
    'ember-prawns': 1,
    '12-hour-short-rib': 2,
    'midnight-fondant': 1,
  },
  occasion: 'Anniversary',
  notes: 'Verification booking',
  dietary: 'No shellfish',
  clientRequestId: requestId,
}, { actor: 'guest' })

check('creates a confirmed reservation with a reference and table', () => {
  assert.equal(created.ok, true)
  assert.equal(created.duplicate, false)
  assert.match(created.reservation.reference, /^FLV-[A-Z0-9]{6}$/)
  assert.equal(created.reservation.status, 'confirmed')
  assert.ok(created.reservation.tableId)
  assert.ok(created.reservation.payment.simulated)
})

check('meal selections and quantities are stored in a separate meal order', () => {
  const order = reservations.getReservationMealOrder(created.reservation.id)
  assert.ok(order)
  assert.equal(order.itemCount, 4)
  assert.equal(order.items.find((item) => item.menuItemId === '12-hour-short-rib').qty, 2)
  assert.equal(order.subtotal, 22 + 34 * 2 + 16)
})

check('repeated submission with the same client request id is idempotent', () => {
  const again = reservations.createReservation({
    guest: { name: 'Verify Guest', email: guestEmail },
    date: firstAvailable.date,
    time: slot.time,
    partySize: 2,
    zoneId: 'hearth',
    clientRequestId: requestId,
  })
  assert.equal(again.duplicate, true)
  assert.equal(again.reservation.id, created.reservation.id)
})

check('rapid accidental duplicate is rejected', () => {
  const near = reservations.createReservation({
    guest: { name: 'Verify Guest', email: guestEmail },
    date: firstAvailable.date,
    time: slot.time,
    partySize: 2,
    zoneId: 'hearth',
    clientRequestId: 'another-request',
  })
  assert.equal(near.duplicate, true)
})

check('over-capacity party is rejected', () => {
  assert.throws(
    () => reservations.createReservation({
      guest: { name: 'Big Party', email: 'big@example.com' },
      date: firstAvailable.date,
      time: slot.time,
      partySize: settings.maxPartySize + 2,
      zoneId: 'main',
    }),
    (error) => error.name === 'ReservationError',
  )
})

check('notifications are generated for guest and admin', () => {
  const notifications = reservations.getReservationNotifications(created.reservation.id)
  const audiences = notifications.map((notification) => notification.audience)
  assert.ok(audiences.includes('guest'))
  assert.ok(audiences.includes('admin'))
  assert.ok(notifications.every((notification) => notification.simulated === true))
})

/* ---------------------------------------------------------------------- */
section('Modification, cancellation & repeat visits')

check('modification updates party, table and menu selections', () => {
  const updated = reservations.updateReservation(created.reservation.id, {
    partySize: 4,
    items: { 'hearthside-feast': 4 },
    notes: 'Now four guests',
  })
  assert.equal(updated.reservation.partySize, 4)
  assert.equal(updated.reservation.notes, 'Now four guests')
  const order = reservations.getReservationMealOrder(created.reservation.id)
  assert.equal(order.itemCount, 4)
  assert.equal(order.items[0].menuItemId, 'hearthside-feast')
})

check('a modification may reuse the reservation\'s own table', () => {
  const originalTables = store.getTables()
  const own = reservations.createReservation({
    guest: { name: 'Self Exclusion', email: 'self.exclusion@example.com' },
    date: firstAvailable.date,
    time: slot.time,
    partySize: 2,
    zoneId: 'main',
    clientRequestId: 'self-exclusion-check',
  })
  assert.equal(own.ok, true)
  try {
    store.saveTables(
      originalTables.map((table) =>
        table.id === own.reservation.tableId ? table : { ...table, reservable: false },
      ),
    )
    const ownStart = timeToMinutes(own.reservation.time)
    const interval = Number(settings.slotIntervalMinutes)
    const day = availability.getSlotsForDate(firstAvailable.date, {
      partySize: 2,
      zoneId: 'main',
      excludeReservationId: own.reservation.id,
    })
    const moved = day.slots.find((item) => {
      const start = timeToMinutes(item.time)
      return item.time !== own.reservation.time && start < ownStart + interval + 90 + 15 && start + interval > ownStart
    })
    assert.ok(moved, 'expected an overlapping slot to move into')
    const updated = reservations.updateReservation(own.reservation.id, { time: moved.time })
    assert.equal(updated.reservation.time, moved.time)
  } finally {
    reservations.deleteReservation(own.reservation.id, { actor: 'admin' })
    store.saveTables(originalTables)
  }
})

check('assignment cannot exceed table capacity', () => {
  const small = store.getTables().find((table) => table.seats === 2)
  assert.throws(
    () => reservations.assignTable(created.reservation.id, small.id),
    (error) => error.code === 'table_too_small',
  )
})

check('cancellation releases availability and keeps the record', () => {
  const before = availability.getSlotsForDate(firstAvailable.date, { partySize: 4, zoneId: 'hearth' })
  const cancelled = reservations.cancelReservation(created.reservation.id, { reason: 'Verification cancellation' })
  assert.equal(cancelled.reservation.status, 'cancelled')
  assert.ok(cancelled.reservation.cancelledAt)
  const after = availability.getSlotsForDate(firstAvailable.date, { partySize: 4, zoneId: 'hearth' })
  const beforeFree = before.slots.find((item) => item.time === slot.time)?.tablesFree
  const afterFree = after.slots.find((item) => item.time === slot.time)?.tablesFree
  assert.ok(afterFree >= beforeFree)
  assert.ok(reservations.getReservation(created.reservation.id))
})

check('repeat booking creates a new record and leaves the original untouched', () => {
  const repeat = reservations.repeatReservation(created.reservation.id, {}, { actor: 'customer' })
  assert.notEqual(repeat.reservation.id, created.reservation.id)
  assert.equal(repeat.reservation.repeatedFrom, created.reservation.id)
  assert.equal(reservations.getReservation(created.reservation.id).status, 'cancelled')
  assert.equal(repeat.reservation.status, 'confirmed')
})

check('cancelled reservations can no longer be modified', () => {
  assert.throws(
    () => reservations.updateReservation(created.reservation.id, { partySize: 2 }),
    (error) => error.code === 'cancelled',
  )
})

/* ---------------------------------------------------------------------- */
section('Admin operations')

const repeatId = reservations.getUpcomingReservations({ limit: 1 })[0].id

check('service status changes persist with history', () => {
  reservations.setReservationStatus(repeatId, 'seated', { actor: 'admin' })
  const details = reservations.getReservationDetails(repeatId)
  assert.equal(details.reservation.status, 'seated')
  assert.ok(details.history.some((entry) => entry.action === 'status_changed'))
})

check('meal preparation status updates the meal order', () => {
  reservations.setKitchenStatus(repeatId, 'preparing', { actor: 'admin' })
  const details = reservations.getReservationDetails(repeatId)
  assert.equal(details.reservation.kitchenStatus, 'preparing')
  assert.equal(details.mealOrder.status, 'preparing')
})

check('simulated payment state can be changed without a real charge', () => {
  const updated = reservations.setPaymentStatus(repeatId, 'simulated_paid', { actor: 'admin' })
  assert.equal(updated.reservation.payment.status, 'simulated_paid')
  assert.equal(updated.reservation.payment.simulated, true)
  const payment = store.getPayments().find((item) => item.reservationId === repeatId)
  assert.ok(payment)
  assert.equal(payment.simulated, true)
  assert.match(payment.note, /no charge/i)
})

check('blocked dates remove availability and unblocking restores it', () => {
  const future = addDays(todayISO(), 5)
  reservations.toggleBlockedDate(future, 'Verification closure', true)
  const blocked = availability.getSlotsForDate(future, { partySize: 2 })
  assert.equal(blocked.open, false)
  reservations.toggleBlockedDate(future, '', false)
  const restored = availability.getSlotsForDate(future, { partySize: 2 })
  assert.equal(restored.open, availability.getServiceWindow(future) !== null)
})

check('blocked sittings are excluded individually', () => {
  const date = addDays(todayISO(), 6)
  const target = availability.generateSlotTimes(date)[1]
  if (target) {
    reservations.toggleBlockedSlot(date, target, 'Verification hold', true)
    const day = availability.getSlotsForDate(date, { partySize: 2, zoneId: 'any' })
    const slotResult = day.slots.find((item) => item.time === target)
    assert.equal(slotResult.available, false)
    reservations.toggleBlockedSlot(date, target, '', false)
  }
})

check('availability configuration validates ranges', () => {
  assert.throws(
    () => reservations.saveAvailabilitySettings({ reservationDurationMinutes: 5 }),
    (error) => error.code === 'invalid_settings',
  )
  const saved = reservations.saveAvailabilitySettings({ turnoverBufferMinutes: 20 })
  assert.equal(saved.turnoverBufferMinutes, 20)
  reservations.saveAvailabilitySettings({ turnoverBufferMinutes: settings.turnoverBufferMinutes })
})

check('table capacity changes affect bookable tables', () => {
  const table = store.getTables().find((item) => item.zoneId === 'terrace' && item.seats > 2)
  const updated = reservations.updateTableConfig(table.id, { seats: 3 })
  assert.equal(updated.seats, 3)
  const smallTables = availability
    .getBookableTables({ partySize: 4, zoneId: 'terrace' })
    .map((item) => item.id)
  assert.ok(!smallTables.includes(table.id))
  reservations.updateTableConfig(table.id, { seats: table.seats })
})

check('admin stats stay coherent', () => {
  const stats = reservations.getAdminStats()
  assert.ok(stats.upcoming >= 1)
  assert.ok(stats.confirmed >= 0)
})

check('test records can be deleted hard', () => {
  const before = store.getReservations().length
  assert.ok(store.getNotifications().some((item) => item.reservationId === repeatId))
  const deleted = reservations.deleteReservation(repeatId, { actor: 'admin' })
  assert.equal(deleted.ok, true)
  assert.equal(store.getReservations().length, before - 1)
  assert.equal(reservations.getReservation(repeatId), null)
  assert.ok(!store.getNotifications().some((item) => item.reservationId === repeatId), 'notifications for the deleted record should be removed')
})

/* ---------------------------------------------------------------------- */
section('Serialization & demo tools')

check('snapshot export/import round-trips', () => {
  const snapshot = store.exportSnapshot()
  const count = store.getReservations().length
  store.resetAllData()
  assert.notEqual(store.getReservations().length, count)
  store.importSnapshot(snapshot)
  assert.equal(store.getReservations().length, count)
})

check('seeded demo records can be removed without touching real bookings', () => {
  // A real booking made under a seeded customer must keep its customer,
  // notification feed entries, meal order and simulated payment record.
  reservations.saveAvailabilitySettings({ depositPerGuest: 5 })
  const seededCustomer = store.getCustomers().find((customer) => customer.seeded)
  assert.ok(seededCustomer, 'expected a seeded customer to exist')
  const slot = availability.getFirstAvailableSlot({ partySize: 2, zoneId: 'main' })
  assert.ok(slot, 'expected an available slot for the real booking')
  const created = reservations.createReservation({
    guest: { name: seededCustomer.name, email: seededCustomer.email },
    date: slot.date,
    time: slot.time,
    partySize: 2,
    zoneId: 'main',
    items: [{ menuItemId: store.getMenuItems()[0].id, qty: 1 }],
  })
  const realId = created.reservation.id
  const notificationsBefore = store.getNotifications().filter((item) => item.reservationId === realId).length
  assert.ok(notificationsBefore >= 1, 'expected notifications for the real booking')
  assert.ok(store.getPayments().some((item) => item.reservationId === realId), 'expected a simulated payment')
  assert.ok(store.getMealOrders().some((item) => item.reservationId === realId), 'expected a meal order shell')

  const realBefore = store.getReservations().filter((reservation) => !reservation.seeded).length
  store.deleteSeededRecords()

  const realAfter = store.getReservations().filter((reservation) => !reservation.seeded).length
  assert.equal(realAfter, realBefore)
  assert.equal(store.getReservations().filter((reservation) => reservation.seeded).length, 0)
  assert.ok(store.getReservations().some((reservation) => reservation.id === realId), 'real booking survived')
  assert.ok(store.getCustomers().some((customer) => customer.id === created.reservation.customerId), 'referenced customer survived')
  assert.equal(store.getNotifications().filter((item) => item.reservationId === realId).length, notificationsBefore)
  assert.ok(store.getPayments().some((item) => item.reservationId === realId), 'simulated payment survived')
  assert.ok(store.getMealOrders().some((item) => item.reservationId === realId), 'meal order survived')
})

check('resetting reservation data preserves Menu Studio edits', () => {
  const original = store.getMenuItems()
  const edited = original.map((item, index) => (index === 0 ? { ...item, name: `${item.name} (verification)` } : item))
  store.saveMenuItems(edited)
  store.resetAllData()
  assert.equal(store.getMenuItems()[0].name, `${original[0].name} (verification)`)
  store.saveMenuItems(original)
})

check('keys are namespaced and versioned', () => {
  const meta = store.getMeta()
  assert.equal(meta.version, 1)
  assert.ok(store.collectionKey('reservations').startsWith('flavoro.data.v1.'))
})

console.log(`\nAll ${checks} checks passed.\n`)
