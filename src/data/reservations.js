/**
 * Reservation business logic.
 *
 * Owns the lifecycle of a booking: creation, modification, cancellation,
 * repeat visits, table assignment, service + kitchen statuses, simulated
 * payments, history and the in-app notifications generated along the way.
 *
 * The module is deliberately UI-free so it can be unit-tested and later wired
 * to a real API/database.
 */

import {
  createId,
  createReference,
  nowISO,
  safeMultiline,
  safeText,
} from './storage.js'
import {
  getMealOrders,
  getMenuItems,
  getNotifications,
  getPayments,
  getReservationHistory,
  getReservations,
  getSettings,
  getTables,
  saveMealOrders,
  saveNotifications,
  savePayments,
  saveReservationHistory,
  saveReservations,
  saveSettings,
  saveTables,
} from './store.js'
import {
  evaluateAvailability,
  findTable,
  generateSlotTimes,
  getFirstAvailableSlot,
  getOccupiedWindows,
  getServiceWindow,
  getZone,
  isActiveReservation,
  validatePartySize,
  validateZoneForParty,
  zoneName,
} from './availability.js'
import {
  addDays,
  isPastDateTime,
  isValidISODate,
  timeToMinutes,
  todayISO,
} from './datetime.js'
import {
  CUSTOMER_TYPE,
  getCustomerById,
  getCustomerByEmail,
  isValidEmail,
  normalizeEmail,
  upsertCustomer,
} from './customers.js'
import { AUDIENCE, createNotification, listNotifications } from './notifications.js'

export const RESERVATION_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  seated: 'seated',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no_show',
}

export const RESERVATION_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
}

export const KITCHEN_STATUS = {
  queued: 'queued',
  preparing: 'preparing',
  ready: 'ready',
  served: 'served',
}

export const KITCHEN_STATUS_LABELS = {
  queued: 'Queued',
  preparing: 'In the kitchen',
  ready: 'Ready to serve',
  served: 'Served',
}

export const PAYMENT_STATUS = {
  not_required: 'not_required',
  simulated_due: 'simulated_due',
  simulated_paid: 'simulated_paid',
  waived: 'waived',
}

export const PAYMENT_STATUS_LABELS = {
  not_required: 'No deposit required',
  simulated_due: 'Simulated deposit due',
  simulated_paid: 'Simulated deposit marked paid',
  waived: 'Simulated deposit waived',
}

export const OCCASIONS = ['', 'Birthday', 'Anniversary', 'Date night', 'Business dinner', 'Celebration', 'Other']

export class ReservationError extends Error {
  constructor(message, { code = 'reservation_error', reasons = [], alternatives = [], details = {} } = {}) {
    super(message)
    this.name = 'ReservationError'
    this.code = code
    this.reasons = reasons
    this.alternatives = alternatives
    this.details = details
  }
}

/* -------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------- */

function withReservationError(fn) {
  try {
    return fn()
  } catch (error) {
    if (error instanceof ReservationError) throw error
    throw new ReservationError('Something went wrong. Please check the details and try again.', {
      code: 'unexpected',
      reasons: [error?.message || 'Unknown error'],
    })
  }
}

export function normalizeMenuSelection(items) {
  const catalogue = getMenuItems()
  const map = new Map()
  const entries = Array.isArray(items)
    ? items
    : Object.entries(items || {}).map(([menuItemId, qty]) => ({ menuItemId, qty }))

  for (const entry of entries) {
    const menuItemId = safeText(entry?.menuItemId || entry?.id, 80)
    const quantity = Math.trunc(Number(entry?.qty ?? entry?.quantity ?? 0))
    if (!menuItemId || !Number.isFinite(quantity) || quantity <= 0) continue
    const dish = catalogue.find((item) => item.id === menuItemId)
    if (!dish) continue
    const qty = Math.min(20, Math.max(1, quantity))
    const notes = safeText(entry?.notes, 140)
    const existing = map.get(menuItemId)
    if (existing) {
      existing.qty = Math.min(20, existing.qty + qty)
      if (notes && !existing.notes.includes(notes)) {
        existing.notes = existing.notes ? `${existing.notes} · ${notes}` : notes
      }
    } else {
      map.set(menuItemId, {
        menuItemId,
        name: dish.name,
        category: dish.category,
        price: Number(dish.price) || 0,
        qty,
        notes,
      })
    }
  }

  const normalized = [...map.values()]
  const subtotal = normalized.reduce((sum, item) => sum + item.price * item.qty, 0)
  const itemCount = normalized.reduce((sum, item) => sum + item.qty, 0)
  return { items: normalized, subtotal, itemCount }
}

function deriveExperience(items) {
  if (!items.length) return 'Table reservation · choose at the table'
  if (items.length === 1) return items[0].name
  return `À la carte table reservation · ${items.reduce((sum, item) => sum + item.qty, 0)} dishes`
}

function buildPaymentState(settings, partySize) {
  const perGuest = Math.max(0, Number(settings.depositPerGuest) || 0)
  const amount = Math.round(perGuest * Number(partySize) * 100) / 100
  if (!amount) {
    return {
      required: false,
      status: PAYMENT_STATUS.not_required,
      amount: 0,
      currency: settings.currency || 'USD',
      simulated: true,
      label: 'No deposit required for this booking',
      updatedAt: nowISO(),
    }
  }
  return {
    required: true,
    status: PAYMENT_STATUS.simulated_due,
    amount,
    currency: settings.currency || 'USD',
    simulated: true,
    label: `Simulated deposit — $${amount.toFixed(2)}. No real payment is taken.`,
    updatedAt: nowISO(),
  }
}

function recordHistory(reservationId, { action, actor = 'system', summary = '', changes = {}, fromStatus = null, toStatus = null }) {
  const history = getReservationHistory()
  const entry = {
    id: createId('hist'),
    reservationId,
    action,
    actor,
    summary: safeText(summary, 300),
    changes,
    fromStatus,
    toStatus,
    createdAt: nowISO(),
  }
  saveReservationHistory([entry, ...history].slice(0, 1000))
  return entry
}

function guestAudience(reservation) {
  return reservation.guestType === CUSTOMER_TYPE.registered ? AUDIENCE.customer : AUDIENCE.guest
}

function notifyGuest(reservation, { type, title, message, dedupeKey }) {
  return createNotification({
    audience: guestAudience(reservation),
    customerId: reservation.customerId,
    reservationId: reservation.id,
    type,
    title,
    message,
    dedupeKey,
  })
}

function notifyAdmin(reservation, { type, title, message, dedupeKey }) {
  return createNotification({
    audience: AUDIENCE.admin,
    customerId: reservation.customerId,
    reservationId: reservation.id,
    type,
    title,
    message,
    dedupeKey,
  })
}

function writePaymentRecord(reservation, actor = 'system') {
  if (!reservation.payment?.required && reservation.payment?.status === PAYMENT_STATUS.not_required) return
  const payments = getPayments()
  const existingIndex = payments.findIndex((payment) => payment.reservationId === reservation.id)
  const record = {
    id: existingIndex >= 0 ? payments[existingIndex].id : createId('pay'),
    reservationId: reservation.id,
    customerId: reservation.customerId,
    amount: reservation.payment.amount,
    currency: reservation.payment.currency,
    status: reservation.payment.status,
    simulated: true,
    method: 'simulated-card',
    note: 'Prototype only — no charge was made and no payment provider was contacted.',
    actor,
    createdAt: existingIndex >= 0 ? payments[existingIndex].createdAt : nowISO(),
    updatedAt: nowISO(),
  }
  if (existingIndex >= 0) payments.splice(existingIndex, 1, record)
  else payments.unshift(record)
  savePayments(payments)
}

function removePaymentRecord(reservationId) {
  savePayments(getPayments().filter((payment) => payment.reservationId !== reservationId))
}

function upsertMealOrder(reservation, items, subtotal, itemCount, status = 'confirmed') {
  const orders = getMealOrders()
  const index = orders.findIndex((order) => order.reservationId === reservation.id)
  const existing = index >= 0 ? orders[index] : null
  if (!items.length) {
    if (index >= 0) {
      orders.splice(index, 1)
      saveMealOrders(orders)
    }
    return null
  }
  const order = {
    id: existing?.id || createId('ord'),
    reservationId: reservation.id,
    customerId: reservation.customerId,
    items,
    subtotal,
    itemCount,
    status,
    createdAt: existing?.createdAt || nowISO(),
    updatedAt: nowISO(),
  }
  if (index >= 0) orders.splice(index, 1, order)
  else orders.unshift(order)
  saveMealOrders(orders)
  return order
}

function kitchenToOrderStatus(kitchenStatus) {
  return {
    queued: 'confirmed',
    preparing: 'preparing',
    ready: 'ready',
    served: 'served',
  }[kitchenStatus] || 'confirmed'
}

/* -------------------------------------------------------------------------
   Create
   ------------------------------------------------------------------------- */

/**
 * Create a reservation.
 *
 * Idempotency: pass a stable `clientRequestId` (kept in the UI for the whole
 * checkout) and repeated submits return the original booking instead of
 * creating a duplicate. A short-window duplicate check adds extra safety.
 */
export function createReservation(input = {}, { actor = 'guest' } = {}) {
  return withReservationError(() => {
    const settings = getSettings()
    if (!settings.allowGuestBookings && actor === 'guest') {
      throw new ReservationError('Guest bookings are currently disabled.', { code: 'guests_disabled' })
    }
    const clientRequestId = safeText(input.clientRequestId, 80)
    const reservations = getReservations()
    if (clientRequestId) {
      const existing = reservations.find((reservation) => reservation.clientRequestId === clientRequestId)
      if (existing) return { ok: true, duplicate: true, reservation: existing }
    }

    const guestName = safeText(input.guest?.name ?? input.name, 120)
    const guestEmail = normalizeEmail(input.guest?.email ?? input.email)
    const guestPhone = safeText(input.guest?.phone ?? input.phone, 40)
    const partySize = Math.trunc(Number(input.partySize))
    const date = safeText(input.date, 10)
    const time = safeText(input.time, 5)
    const zoneId = safeText(input.zoneId, 20) || 'any'
    const notes = safeMultiline(input.notes, 400)
    const dietary = safeMultiline(input.dietary, 240)
    const occasion = OCCASIONS.includes(safeText(input.occasion, 40)) ? safeText(input.occasion, 40) : ''
    const guestType = guestName && input.guest?.type === CUSTOMER_TYPE.registered ? CUSTOMER_TYPE.registered : (input.guestType === 'registered' ? CUSTOMER_TYPE.registered : CUSTOMER_TYPE.guest)

    const problems = []
    if (!guestName) problems.push('Enter the name for the reservation.')
    if (!isValidEmail(guestEmail)) problems.push('Enter a valid email address.')
    if (!isValidISODate(date)) problems.push('Choose a valid date.')
    const partyError = validatePartySize(partySize, settings)
    if (partyError) problems.push(partyError)
    const zoneError = validateZoneForParty(zoneId, partySize)
    if (zoneError) problems.push(zoneError)
    if (!time || timeToMinutes(time) === null) problems.push('Choose a sitting time.')
    if (problems.length) throw new ReservationError(problems[0], { code: 'invalid_input', reasons: problems })

    if (date < todayISO()) throw new ReservationError('That date has already passed.', { code: 'past_date' })
    if (isPastDateTime(date, time)) throw new ReservationError('That sitting time has already passed.', { code: 'past_time' })

    const availability = evaluateAvailability({
      date,
      time,
      partySize,
      zoneId,
      settings,
    })
    if (!availability.ok) {
      throw new ReservationError(availability.reasons[0] || 'That table is no longer available.', {
        code: 'unavailable',
        reasons: availability.reasons,
        alternatives: availability.alternatives,
      })
    }

    // Extra guard against rapid double submits without a clientRequestId.
    // Repeat visits and deliberate admin bookings are exempt.
    const checkNearDuplicate = !input.repeatedFrom && input.source !== 'repeat' && actor !== 'admin'
    const nearDuplicate = !checkNearDuplicate ? null : reservations.find((reservation) => {
      if (reservation.status === RESERVATION_STATUS.cancelled) return false
      if (normalizeEmail(reservation.guest?.email) !== guestEmail) return false
      if (reservation.date !== date || reservation.time !== time) return false
      if (Number(reservation.partySize) !== partySize) return false
      return Date.now() - new Date(reservation.createdAt).getTime() < 60_000
    })
    if (nearDuplicate) return { ok: true, duplicate: true, reservation: nearDuplicate }

    const customer =
      (input.customerId ? getCustomerById(input.customerId) : null) ||
      getCustomerByEmail(guestEmail) ||
      upsertCustomer({
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        type: guestType,
        notes: input.customerNotes,
      })

    // Keep the registered flag once a customer has signed in at least once.
    const effectiveGuestType = customer.type === CUSTOMER_TYPE.registered ? CUSTOMER_TYPE.registered : guestType
    const table = availability.table
    const selection = normalizeMenuSelection(input.items)
    const reference = createReference('FLV')
    const timestamp = nowISO()

    const reservation = {
      id: createId('rsv'),
      reference,
      customerId: customer.id,
      guestType: effectiveGuestType,
      guest: {
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
      },
      date,
      time,
      partySize,
      zoneId,
      zoneName: table?.zone || zoneName(zoneId),
      tableId: table?.id || null,
      tableName: table?.name || 'To be assigned',
      experience: deriveExperience(selection.items),
      occasion,
      notes,
      dietary,
      status: settings.autoConfirm ? RESERVATION_STATUS.confirmed : RESERVATION_STATUS.pending,
      kitchenStatus: KITCHEN_STATUS.queued,
      source: safeText(input.source, 30) || (actor === 'admin' ? 'admin' : 'website'),
      repeatedFrom: input.repeatedFrom || null,
      seeded: false,
      durationMinutes: Number(settings.reservationDurationMinutes),
      turnoverBufferMinutes: Number(settings.turnoverBufferMinutes),
      payment: buildPaymentState(settings, partySize),
      clientRequestId,
      createdAt: timestamp,
      updatedAt: timestamp,
      cancelledAt: null,
      cancellationReason: '',
      seatedAt: null,
      completedAt: null,
    }

    saveReservations([reservation, ...reservations])
    const mealOrder = upsertMealOrder(reservation, selection.items, selection.subtotal, selection.itemCount, 'confirmed')
    if (reservation.payment.required) writePaymentRecord(reservation, actor)

    recordHistory(reservation.id, {
      action: 'created',
      actor,
      summary: `Reservation ${reservation.reference} created for ${partySize} guests at ${time}.`,
      changes: {
        date,
        time,
        partySize,
        zoneId,
        tableId: reservation.tableId,
        itemCount: selection.itemCount,
      },
      toStatus: reservation.status,
    })

    const confirmed = reservation.status === RESERVATION_STATUS.confirmed
    notifyGuest(reservation, {
      type: confirmed ? 'reservation_confirmed' : 'reservation_created',
      title: confirmed ? 'Your table is confirmed' : 'Your reservation request is in',
      message: `${reservation.reference} · ${date} at ${time} · ${partySize} guests · ${reservation.zoneName}. ${
        confirmed ? 'We look forward to hosting you.' : 'Our team will confirm shortly.'
      }`,
      dedupeKey: `guest-created-${reservation.id}`,
    })
    notifyAdmin(reservation, {
      type: 'reservation_created',
      title: `${confirmed ? 'New' : 'Pending'} reservation · ${guestName}`,
      message: `${partySize} guests · ${date} ${time} · ${reservation.zoneName} · ${reservation.tableName}. Reference ${reservation.reference}.`,
      dedupeKey: `admin-created-${reservation.id}`,
    })

    return {
      ok: true,
      duplicate: false,
      reservation,
      mealOrder,
      notifications: listNotifications({ reservationId: reservation.id, limit: 20 }),
    }
  })
}

/* -------------------------------------------------------------------------
   Update / modify
   ------------------------------------------------------------------------- */

function diffChanges(before, after, fields) {
  const changes = {}
  for (const field of fields) {
    const oldValue = field.includes('.') ? field.split('.').reduce((acc, key) => acc?.[key], before) : before[field]
    const newValue = field.includes('.') ? field.split('.').reduce((acc, key) => acc?.[key], after) : after[field]
    if (String(oldValue ?? '') !== String(newValue ?? '')) changes[field] = { from: oldValue ?? null, to: newValue ?? null }
  }
  return changes
}

const SCHEDULE_FIELDS = ['date', 'time', 'partySize', 'zoneId', 'tableId']

/**
 * Modify an existing reservation. Re-runs availability checks whenever the
 * date, time, party size, zone or table changes and automatically re-assigns a
 * suitable table if needed.
 */
export function updateReservation(reservationId, patch = {}, { actor = 'customer' } = {}) {
  return withReservationError(() => {
    const reservations = getReservations()
    const index = reservations.findIndex((reservation) => reservation.id === reservationId)
    if (index < 0) throw new ReservationError('Reservation not found.', { code: 'not_found' })
    const existing = reservations[index]
    if (existing.status === RESERVATION_STATUS.cancelled) {
      throw new ReservationError('This reservation has been cancelled and can no longer be modified.', {
        code: 'cancelled',
      })
    }
    if (existing.status === RESERVATION_STATUS.completed) {
      throw new ReservationError('This visit is complete. Book a new table instead.', { code: 'completed' })
    }

    const settings = getSettings()
    const next = { ...existing, guest: { ...existing.guest } }
    let scheduleChanged = false

    if (patch.date !== undefined) {
      const date = safeText(patch.date, 10)
      if (!isValidISODate(date)) throw new ReservationError('Choose a valid date.', { code: 'invalid_date' })
      if (date !== existing.date) {
        next.date = date
        scheduleChanged = true
      }
    }
    if (patch.time !== undefined) {
      const time = safeText(patch.time, 5)
      if (timeToMinutes(time) === null) throw new ReservationError('Choose a valid sitting time.', { code: 'invalid_time' })
      if (time !== existing.time) {
        next.time = time
        scheduleChanged = true
      }
    }
    if (patch.partySize !== undefined) {
      const partySize = Math.trunc(Number(patch.partySize))
      const error = validatePartySize(partySize, settings)
      if (error) throw new ReservationError(error, { code: 'invalid_party' })
      if (partySize !== existing.partySize) {
        next.partySize = partySize
        scheduleChanged = true
      }
    }
    if (patch.zoneId !== undefined) {
      const zoneId = safeText(patch.zoneId, 20) || 'any'
      const error = validateZoneForParty(zoneId, next.partySize)
      if (error) throw new ReservationError(error, { code: 'invalid_zone' })
      if (zoneId !== existing.zoneId) {
        next.zoneId = zoneId
        scheduleChanged = true
      }
    }
    if (patch.guest) {
      if (patch.guest.name !== undefined) next.guest.name = safeText(patch.guest.name, 120) || next.guest.name
      if (patch.guest.email !== undefined) {
        const email = normalizeEmail(patch.guest.email)
        if (!isValidEmail(email)) throw new ReservationError('Enter a valid email address.', { code: 'invalid_email' })
        next.guest.email = email
      }
      if (patch.guest.phone !== undefined) next.guest.phone = safeText(patch.guest.phone, 40)
    }
    if (patch.occasion !== undefined) next.occasion = OCCASIONS.includes(safeText(patch.occasion, 40)) ? safeText(patch.occasion, 40) : ''
    if (patch.notes !== undefined) next.notes = safeMultiline(patch.notes, 400)
    if (patch.dietary !== undefined) next.dietary = safeMultiline(patch.dietary, 240)

    // If the contact email changes, keep the booking attached to the right
    // customer record so each dashboard sees the correct history.
    if (normalizeEmail(next.guest.email) !== normalizeEmail(existing.guest.email)) {
      const linked = getCustomerByEmail(next.guest.email)
      if (linked) {
        next.customerId = linked.id
        next.guestType = linked.type === CUSTOMER_TYPE.registered ? CUSTOMER_TYPE.registered : CUSTOMER_TYPE.guest
      } else {
        const created = upsertCustomer({
          name: next.guest.name,
          email: next.guest.email,
          phone: next.guest.phone,
          type: existing.guestType === CUSTOMER_TYPE.registered ? CUSTOMER_TYPE.guest : existing.guestType,
        })
        next.customerId = created.id
        next.guestType = created.type
      }
    }

    if (next.date < todayISO()) throw new ReservationError('That date has already passed.', { code: 'past_date' })
    if (isPastDateTime(next.date, next.time)) throw new ReservationError('That sitting time has already passed.', { code: 'past_time' })

    const requestedTableId = patch.tableId !== undefined ? safeText(patch.tableId, 20) : null
    if (requestedTableId !== null && requestedTableId !== existing.tableId) scheduleChanged = true

    if (scheduleChanged) {
      const availability = evaluateAvailability({
        date: next.date,
        time: next.time,
        partySize: next.partySize,
        zoneId: next.zoneId,
        excludeReservationId: reservationId,
        settings,
      })
      if (!availability.ok) {
        throw new ReservationError(availability.reasons[0] || 'That table is no longer available.', {
          code: 'unavailable',
          reasons: availability.reasons,
          alternatives: availability.alternatives,
        })
      }

      let table = availability.table
      if (requestedTableId) {
        const explicit = getTables().find((item) => item.id === requestedTableId)
        if (!explicit) throw new ReservationError('That table does not exist.', { code: 'invalid_table' })
        const suitable = assertTableSuitable(explicit, next.partySize)
        if (!suitable.ok) throw new ReservationError(suitable.reason, { code: 'table_unsuitable' })
        const conflict = assertTableFree(explicit, next.date, next.time, reservationId, settings)
        if (!conflict.ok) throw new ReservationError(conflict.reason, { code: 'table_conflict' })
        table = explicit
      } else if (
        existing.tableId &&
        ['date', 'time'].every((field) => patch[field] === undefined || patch[field] === existing[field]) &&
        existing.zoneId === next.zoneId
      ) {
        const retained = getTables().find((item) => item.id === existing.tableId)
        table = retained && Number(retained.seats) >= Number(next.partySize) ? retained : availability.table
      }
      next.tableId = table?.id || null
      next.tableName = table?.name || 'To be assigned'
      next.zoneName = table?.zone || zoneName(next.zoneId)
      next.durationMinutes = Number(settings.reservationDurationMinutes)
      next.turnoverBufferMinutes = Number(settings.turnoverBufferMinutes)
    }

    const selection = patch.items !== undefined ? normalizeMenuSelection(patch.items) : null
    if (selection) next.experience = deriveExperience(selection.items)
    next.updatedAt = nowISO()

    reservations.splice(index, 1, next)
    saveReservations(reservations)

    if (selection) {
      upsertMealOrder(next, selection.items, selection.subtotal, selection.itemCount, kitchenToOrderStatus(next.kitchenStatus))
    }

    const changes = diffChanges(existing, next, [
      'date',
      'time',
      'partySize',
      'zoneId',
      'zoneName',
      'tableId',
      'tableName',
      'occasion',
      'notes',
      'dietary',
      'guest.name',
      'guest.email',
      'guest.phone',
    ])
    if (selection) {
      const previous = getMealOrders().find((order) => order.reservationId === reservationId)
      changes.menu = { from: existing.experience, to: next.experience }
      if (previous) changes.itemCount = { from: null, to: selection.itemCount }
    }

    recordHistory(reservationId, {
      action: 'updated',
      actor,
      summary: `Reservation updated${scheduleChanged ? ` — ${next.date} at ${next.time}` : ''}.`,
      changes,
      fromStatus: existing.status,
      toStatus: next.status,
    })

    notifyGuest(next, {
      type: 'reservation_updated',
      title: 'Your reservation was updated',
      message: `${next.reference} · ${next.date} at ${next.time} · ${next.partySize} guests · ${next.zoneName}. If this was not you, contact us right away.`,
      dedupeKey: `guest-updated-${next.id}-${next.updatedAt}`,
    })
    notifyAdmin(next, {
      type: 'reservation_updated',
      title: 'Reservation updated',
      message: `${next.guest.name} · ${next.date} ${next.time} · ${next.partySize} guests. ${Object.keys(changes).length} field(s) changed.`,
      dedupeKey: `admin-updated-${next.id}-${next.updatedAt}`,
    })

    return { ok: true, reservation: next, changes }
  })
}

function assertTableSuitable(table, partySize) {
  if (table.reservable === false) {
    return { ok: false, reason: `${table.name} is marked as not bookable. Enable it in the floor settings first.` }
  }
  if (table.status === 'out_of_service') {
    return { ok: false, reason: `${table.name} is out of service.` }
  }
  if (Number(table.seats) < Number(partySize)) {
    return { ok: false, reason: `${table.name} seats ${table.seats}; the party has ${partySize} guests.` }
  }
  if (Number(table.minSeats || 1) > Number(partySize)) {
    return {
      ok: false,
      reason: `${table.name} is reserved for parties of ${table.minSeats} or more. Choose a smaller table or add guests.`,
    }
  }
  return { ok: true }
}

function assertTableFree(table, date, time, excludeReservationId, settings = getSettings()) {
  const start = timeToMinutes(time)
  const end = start + Number(settings.reservationDurationMinutes) + Number(settings.turnoverBufferMinutes)
  const clash = getOccupiedWindows(date, { excludeReservationId, settings }).find(
    (window) => window.tableId === table.id && start < window.end && window.start < end,
  )
  if (clash) return { ok: false, reason: `${table.name} is already booked for that sitting.` }
  return { ok: true }
}

/* -------------------------------------------------------------------------
   Cancel / delete / repeat
   ------------------------------------------------------------------------- */

export function cancelReservation(reservationId, { actor = 'customer', reason = '' } = {}) {
  return withReservationError(() => {
    const reservations = getReservations()
    const index = reservations.findIndex((reservation) => reservation.id === reservationId)
    if (index < 0) throw new ReservationError('Reservation not found.', { code: 'not_found' })
    const existing = reservations[index]
    if (existing.status === RESERVATION_STATUS.cancelled) {
      return { ok: true, alreadyCancelled: true, reservation: existing }
    }
    const timestamp = nowISO()
    const next = {
      ...existing,
      status: RESERVATION_STATUS.cancelled,
      cancelledAt: timestamp,
      cancellationReason: safeText(reason, 240),
      updatedAt: timestamp,
      payment: existing.payment?.required
        ? { ...existing.payment, status: PAYMENT_STATUS.waived, updatedAt: timestamp }
        : existing.payment,
    }
    reservations.splice(index, 1, next)
    saveReservations(reservations)

    const orders = getMealOrders().map((order) =>
      order.reservationId === reservationId ? { ...order, status: 'cancelled', updatedAt: timestamp } : order,
    )
    saveMealOrders(orders)
    if (existing.payment?.required) writePaymentRecord(next, actor)

    recordHistory(reservationId, {
      action: 'cancelled',
      actor,
      summary: `Reservation cancelled${reason ? ` — ${safeText(reason, 160)}` : ''}.`,
      changes: {},
      fromStatus: existing.status,
      toStatus: next.status,
    })
    notifyGuest(next, {
      type: 'reservation_cancelled',
      title: 'Reservation cancelled',
      message: `${next.reference} on ${next.date} at ${next.time} has been cancelled. The table is now available again.`,
      dedupeKey: `guest-cancelled-${next.id}-${timestamp}`,
    })
    notifyAdmin(next, {
      type: 'reservation_cancelled',
      title: 'Reservation cancelled',
      message: `${next.guest.name} · ${next.date} ${next.time} · ${next.partySize} guests.`,
      dedupeKey: `admin-cancelled-${next.id}-${timestamp}`,
    })

    return { ok: true, reservation: next }
  })
}

/** Hard delete for test/demo records (admin only). Cancelling keeps history. */
export function deleteReservation(reservationId, { actor = 'admin' } = {}) {
  const reservations = getReservations()
  const existing = reservations.find((reservation) => reservation.id === reservationId)
  if (!existing) throw new ReservationError('Reservation not found.', { code: 'not_found' })
  saveReservations(reservations.filter((reservation) => reservation.id !== reservationId))
  saveMealOrders(getMealOrders().filter((order) => order.reservationId !== reservationId))
  saveNotifications(getNotifications().filter((notification) => notification.reservationId !== reservationId))
  removePaymentRecord(reservationId)
  recordHistory(reservationId, {
    action: 'deleted',
    actor,
    summary: `Test/demo reservation ${existing.reference} permanently deleted.`,
    changes: { deleted: { from: existing.reference, to: null } },
    fromStatus: existing.status,
    toStatus: null,
  })
  return { ok: true, deleted: existing.id }
}

/**
 * Repeat a previous booking. Always creates a NEW reservation record; the
 * original is never overwritten.
 */
export function repeatReservation(sourceReservationId, overrides = {}, { actor = 'customer' } = {}) {
  const source = getReservation(sourceReservationId)
  if (!source) throw new ReservationError('The original reservation could not be found.', { code: 'not_found' })
  const settings = getSettings()
  let date = overrides.date
  let time = overrides.time
  if (!date || !time) {
    const slot = getFirstAvailableSlot({
      partySize: overrides.partySize || source.partySize,
      zoneId: overrides.zoneId || source.zoneId,
      startDate: addDays(todayISO(), 1),
      settings,
    })
    if (!slot) {
      throw new ReservationError('No tables are open for a repeat visit in the next 30 days.', { code: 'no_slots' })
    }
    date = date || slot.date
    time = time || slot.time
  }
  const order = getMealOrders().find((item) => item.reservationId === source.id)
  const items = overrides.items ?? order?.items?.map((item) => ({ menuItemId: item.menuItemId, qty: item.qty, notes: item.notes })) ?? []
  return createReservation(
    {
      guest: overrides.guest || source.guest,
      guestType: source.guestType,
      customerId: source.customerId,
      date,
      time,
      partySize: overrides.partySize || source.partySize,
      zoneId: overrides.zoneId || source.zoneId,
      items,
      occasion: overrides.occasion ?? source.occasion,
      notes: overrides.notes ?? source.notes,
      dietary: overrides.dietary ?? source.dietary,
      clientRequestId: createId('repeat'),
      source: 'repeat',
      repeatedFrom: source.id,
    },
    { actor },
  )
}

/* -------------------------------------------------------------------------
   Statuses, tables, payments
   ------------------------------------------------------------------------- */

export function setReservationStatus(reservationId, status, { actor = 'admin', note = '' } = {}) {
  return withReservationError(() => {
    if (!Object.values(RESERVATION_STATUS).includes(status)) {
      throw new ReservationError('Unknown reservation status.', { code: 'invalid_status' })
    }
    const reservations = getReservations()
    const index = reservations.findIndex((reservation) => reservation.id === reservationId)
    if (index < 0) throw new ReservationError('Reservation not found.', { code: 'not_found' })
    const existing = reservations[index]
    if (existing.status === status) return { ok: true, unchanged: true, reservation: existing }

    const timestamp = nowISO()
    const next = {
      ...existing,
      status,
      updatedAt: timestamp,
      seatedAt: status === RESERVATION_STATUS.seated ? existing.seatedAt || timestamp : status === RESERVATION_STATUS.confirmed ? null : existing.seatedAt,
      completedAt: status === RESERVATION_STATUS.completed ? timestamp : null,
      cancelledAt: status === RESERVATION_STATUS.cancelled ? timestamp : null,
      cancellationReason: status === RESERVATION_STATUS.cancelled ? existing.cancellationReason || safeText(note, 240) : '',
    }
    if (status === RESERVATION_STATUS.completed) next.kitchenStatus = KITCHEN_STATUS.served
    reservations.splice(index, 1, next)
    saveReservations(reservations)

    if (status === RESERVATION_STATUS.cancelled || status === RESERVATION_STATUS.completed) {
      saveMealOrders(
        getMealOrders().map((order) =>
          order.reservationId === reservationId
            ? { ...order, status: status === RESERVATION_STATUS.cancelled ? 'cancelled' : 'served', updatedAt: timestamp }
            : order,
        ),
      )
    }

    recordHistory(reservationId, {
      action: status === RESERVATION_STATUS.cancelled ? 'cancelled' : 'status_changed',
      actor,
      summary: `Status changed from ${existing.status} to ${status}.${note ? ` ${safeText(note, 160)}` : ''}`,
      changes: { status: { from: existing.status, to: status } },
      fromStatus: existing.status,
      toStatus: status,
    })

    notifyGuest(next, {
      type: status === RESERVATION_STATUS.cancelled ? 'reservation_cancelled' : 'status_changed',
      title:
        status === RESERVATION_STATUS.confirmed
          ? 'Your table is confirmed'
          : status === RESERVATION_STATUS.seated
            ? 'Welcome — your table is ready'
            : status === RESERVATION_STATUS.completed
              ? 'Thank you for dining with us'
              : status === RESERVATION_STATUS.cancelled
                ? 'Reservation cancelled'
                : 'Reservation status updated',
      message: `${next.reference} · ${next.date} at ${next.time}. Status: ${RESERVATION_STATUS_LABELS[status]}.`,
      dedupeKey: `guest-status-${next.id}-${status}-${timestamp}`,
    })

    return { ok: true, reservation: next }
  })
}

export function setKitchenStatus(reservationId, kitchenStatus, { actor = 'admin' } = {}) {
  return withReservationError(() => {
    if (!Object.values(KITCHEN_STATUS).includes(kitchenStatus)) {
      throw new ReservationError('Unknown kitchen status.', { code: 'invalid_kitchen_status' })
    }
    const reservations = getReservations()
    const index = reservations.findIndex((reservation) => reservation.id === reservationId)
    if (index < 0) throw new ReservationError('Reservation not found.', { code: 'not_found' })
    const existing = reservations[index]
    if (existing.kitchenStatus === kitchenStatus) return { ok: true, unchanged: true, reservation: existing }

    const next = { ...existing, kitchenStatus, updatedAt: nowISO() }
    reservations.splice(index, 1, next)
    saveReservations(reservations)
    saveMealOrders(
      getMealOrders().map((order) =>
        order.reservationId === reservationId
          ? { ...order, status: kitchenToOrderStatus(kitchenStatus), updatedAt: next.updatedAt }
          : order,
      ),
    )
    recordHistory(reservationId, {
      action: 'kitchen_status',
      actor,
      summary: `Kitchen status: ${KITCHEN_STATUS_LABELS[kitchenStatus]}.`,
      changes: { kitchenStatus: { from: existing.kitchenStatus, to: kitchenStatus } },
      fromStatus: existing.status,
      toStatus: existing.status,
    })
    notifyGuest(next, {
      type: 'kitchen_status',
      title:
        kitchenStatus === KITCHEN_STATUS.preparing
          ? 'Your dishes are being prepared'
          : kitchenStatus === KITCHEN_STATUS.ready
            ? 'Your courses are ready'
            : kitchenStatus === KITCHEN_STATUS.served
              ? 'Courses served — enjoy'
              : 'Pre-order received by the kitchen',
      message: `${next.reference} · ${KITCHEN_STATUS_LABELS[kitchenStatus]}. Pre-orders are prepared ahead of your sitting.`,
      dedupeKey: `guest-kitchen-${next.id}-${kitchenStatus}-${next.updatedAt}`,
    })
    notifyAdmin(next, {
      type: 'kitchen_status',
      title: 'Kitchen queue updated',
      message: `${next.tableName} · ${next.guest.name} · ${KITCHEN_STATUS_LABELS[kitchenStatus]}.`,
      dedupeKey: `admin-kitchen-${next.id}-${kitchenStatus}-${next.updatedAt}`,
    })
    return { ok: true, reservation: next }
  })
}

export function assignTable(reservationId, tableId, { actor = 'admin' } = {}) {
  return withReservationError(() => {
    const reservations = getReservations()
    const index = reservations.findIndex((reservation) => reservation.id === reservationId)
    if (index < 0) throw new ReservationError('Reservation not found.', { code: 'not_found' })
    const existing = reservations[index]
    const table = getTables().find((item) => item.id === tableId)
    if (!table) throw new ReservationError('Choose a table.', { code: 'invalid_table' })
    const suitable = assertTableSuitable(table, existing.partySize)
    if (!suitable.ok) {
      throw new ReservationError(suitable.reason, {
        code: Number(table.seats) < Number(existing.partySize) ? 'table_too_small' : 'table_unsuitable',
      })
    }
    const free = assertTableFree(table, existing.date, existing.time, reservationId)
    if (!free.ok) throw new ReservationError(free.reason, { code: 'table_conflict' })

    const next = {
      ...existing,
      tableId: table.id,
      tableName: table.name,
      zoneId: table.zoneId,
      zoneName: table.zone,
      updatedAt: nowISO(),
    }
    reservations.splice(index, 1, next)
    saveReservations(reservations)
    recordHistory(reservationId, {
      action: 'table_assigned',
      actor,
      summary: `Table assigned: ${table.name} (${table.zone}).`,
      changes: { tableId: { from: existing.tableId, to: table.id } },
      fromStatus: existing.status,
      toStatus: existing.status,
    })
    notifyGuest(next, {
      type: 'table_assigned',
      title: 'Your table has been assigned',
      message: `${next.reference} · ${table.name} in the ${table.zone}.`,
      dedupeKey: `guest-table-${next.id}-${table.id}-${next.updatedAt}`,
    })
    return { ok: true, reservation: next }
  })
}

export function setPaymentStatus(reservationId, status, { actor = 'admin' } = {}) {
  return withReservationError(() => {
    if (!Object.values(PAYMENT_STATUS).includes(status)) {
      throw new ReservationError('Unknown payment status.', { code: 'invalid_payment_status' })
    }
    const reservations = getReservations()
    const index = reservations.findIndex((reservation) => reservation.id === reservationId)
    if (index < 0) throw new ReservationError('Reservation not found.', { code: 'not_found' })
    const existing = reservations[index]
    const payment = {
      ...existing.payment,
      required: status !== PAYMENT_STATUS.not_required && status !== PAYMENT_STATUS.waived,
      status,
      simulated: true,
      updatedAt: nowISO(),
      label:
        status === PAYMENT_STATUS.simulated_paid
          ? `Simulated deposit marked paid — no real transaction occurred.`
          : status === PAYMENT_STATUS.waived
            ? 'Simulated deposit waived.'
            : 'Simulated deposit due. No real payment is collected.',
    }
    const next = { ...existing, payment, updatedAt: nowISO() }
    reservations.splice(index, 1, next)
    saveReservations(reservations)
    if (status === PAYMENT_STATUS.not_required) removePaymentRecord(reservationId)
    else writePaymentRecord(next, actor)
    recordHistory(reservationId, {
      action: 'payment_update',
      actor,
      summary: `Payment state set to ${PAYMENT_STATUS_LABELS[status]} (simulated).`,
      changes: { paymentStatus: { from: existing.payment?.status, to: status } },
      fromStatus: existing.status,
      toStatus: existing.status,
    })
    notifyGuest(next, {
      type: 'payment_update',
      title: 'Deposit status updated',
      message: `${next.reference} · ${PAYMENT_STATUS_LABELS[status]}. This is a simulated payment state for the prototype.`,
      dedupeKey: `guest-payment-${next.id}-${status}-${next.updatedAt}`,
    })
    return { ok: true, reservation: next }
  })
}

/* -------------------------------------------------------------------------
   Queries
   ------------------------------------------------------------------------- */

export function getReservation(reservationId) {
  return getReservations().find((reservation) => reservation.id === reservationId) || null
}

export function getReservationByReference(reference) {
  const normalized = safeText(reference, 40).toUpperCase()
  if (!normalized) return null
  return getReservations().find((reservation) => String(reservation.reference).toUpperCase() === normalized) || null
}

/** Guest-friendly lookup: reference + the email used to book. */
export function lookupReservation({ reference, email }) {
  const reservation = getReservationByReference(reference)
  if (!reservation) return { ok: false, reason: 'No reservation matches that reference.' }
  if (normalizeEmail(email) !== normalizeEmail(reservation.guest?.email)) {
    return { ok: false, reason: 'That email does not match the reservation.' }
  }
  return { ok: true, reservation }
}

export function listReservations(filters = {}) {
  let list = getReservations().slice()
  if (filters.customerId) list = list.filter((reservation) => reservation.customerId === filters.customerId)
  if (filters.status && filters.status !== 'all') list = list.filter((reservation) => reservation.status === filters.status)
  if (filters.date) list = list.filter((reservation) => reservation.date === filters.date)
  if (filters.fromDate) list = list.filter((reservation) => reservation.date >= filters.fromDate)
  if (filters.toDate) list = list.filter((reservation) => reservation.date <= filters.toDate)
  if (filters.upcomingOnly) {
    const today = todayISO()
    list = list.filter(
      (reservation) =>
        reservation.date >= today &&
        [RESERVATION_STATUS.pending, RESERVATION_STATUS.confirmed, RESERVATION_STATUS.seated].includes(reservation.status),
    )
  }
  if (filters.query) {
    const query = safeText(filters.query, 80).toLowerCase()
    list = list.filter((reservation) =>
      [
        reservation.reference,
        reservation.guest?.name,
        reservation.guest?.email,
        reservation.guest?.phone,
        reservation.zoneName,
        reservation.tableName,
        reservation.experience,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    )
  }
  const sort = filters.sort || 'schedule'
  if (sort === 'schedule') {
    list.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  } else if (sort === 'recent') {
    list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  }
  return filters.limit ? list.slice(0, filters.limit) : list
}

export function getUpcomingReservations({ customerId = null, limit = 20 } = {}) {
  const today = todayISO()
  return listReservations({ customerId, upcomingOnly: true, sort: 'schedule' })
    .filter((reservation) => reservation.date >= today)
    .slice(0, limit)
}

export function getPastReservations({ customerId = null, limit = 20 } = {}) {
  const today = todayISO()
  return getReservations()
    .filter((reservation) => (customerId ? reservation.customerId === customerId : true))
    .filter(
      (reservation) =>
        reservation.date < today ||
        [RESERVATION_STATUS.completed, RESERVATION_STATUS.cancelled, RESERVATION_STATUS.no_show].includes(reservation.status),
    )
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    .slice(0, limit)
}

export function getReservationMealOrder(reservationId) {
  return getMealOrders().find((order) => order.reservationId === reservationId) || null
}

export function getReservationHistoryFor(reservationId) {
  return getReservationHistory()
    .filter((entry) => entry.reservationId === reservationId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
}

export function getReservationNotifications(reservationId) {
  return listNotifications({ reservationId, limit: 50 })
}

export function getReservationDetails(reservationId) {
  const reservation = getReservation(reservationId)
  if (!reservation) return null
  return {
    reservation,
    customer: getCustomerById(reservation.customerId),
    table: getTables().find((table) => table.id === reservation.tableId) || null,
    mealOrder: getReservationMealOrder(reservation.id),
    history: getReservationHistoryFor(reservation.id),
    notifications: getReservationNotifications(reservation.id),
    payment: getPayments().find((payment) => payment.reservationId === reservation.id) || null,
  }
}

export function getTodayReservations() {
  return listReservations({ date: todayISO(), sort: 'schedule' })
}

export function getAdminStats() {
  const today = todayISO()
  const todays = getTodayReservations()
  const reservations = getReservations()
  const upcoming = reservations.filter(
    (reservation) =>
      reservation.date >= today &&
      [RESERVATION_STATUS.pending, RESERVATION_STATUS.confirmed, RESERVATION_STATUS.seated].includes(reservation.status),
  )
  return {
    todayBookings: todays.length,
    todayCovers: todays
      .filter((reservation) => ![RESERVATION_STATUS.cancelled, RESERVATION_STATUS.no_show].includes(reservation.status))
      .reduce((sum, reservation) => sum + Number(reservation.partySize || 0), 0),
    upcoming: upcoming.length,
    pending: reservations.filter((reservation) => reservation.status === RESERVATION_STATUS.pending).length,
    confirmed: reservations.filter((reservation) => reservation.status === RESERVATION_STATUS.confirmed).length,
    cancelled: reservations.filter((reservation) => reservation.status === RESERVATION_STATUS.cancelled).length,
    kitchenQueue: reservations.filter(
      (reservation) =>
        [RESERVATION_STATUS.confirmed, RESERVATION_STATUS.seated].includes(reservation.status) &&
        [KITCHEN_STATUS.queued, KITCHEN_STATUS.preparing].includes(reservation.kitchenStatus),
    ).length,
    tablesAvailable: getTables().filter((table) => table.status !== 'out_of_service').length,
  }
}

/* -------------------------------------------------------------------------
   Availability configuration (admin)
   ------------------------------------------------------------------------- */

export function saveAvailabilitySettings(patch) {
  const current = getSettings()
  const next = { ...current, ...patch }
  const numericRules = [
    ['slotIntervalMinutes', 10, 120, 'Sitting interval'],
    ['reservationDurationMinutes', 30, 240, 'Reservation duration'],
    ['turnoverBufferMinutes', 0, 90, 'Turnover buffer'],
    ['lastSeatingOffsetMinutes', 0, 240, 'Last seating offset'],
    ['leadTimeHours', 0, 168, 'Lead time'],
    ['advanceBookingDays', 1, 365, 'Booking horizon'],
    ['minPartySize', 1, 20, 'Minimum party size'],
    ['maxPartySize', 1, 40, 'Maximum party size'],
    ['depositPerGuest', 0, 500, 'Simulated deposit'],
  ]
  for (const [key, min, max, label] of numericRules) {
    if (next[key] !== undefined) {
      const value = Number(next[key])
      if (!Number.isFinite(value) || value < min || value > max) {
        throw new ReservationError(`${label} must be between ${min} and ${max}.`, { code: 'invalid_settings' })
      }
      next[key] = value
    }
  }
  if (Number(next.minPartySize) > Number(next.maxPartySize)) {
    throw new ReservationError('Minimum party size cannot exceed the maximum.', { code: 'invalid_settings' })
  }
  if (next.openingHours) {
    for (const [day, hours] of Object.entries(next.openingHours)) {
      if (!hours) continue
      const open = timeToMinutes(hours.open)
      const close = timeToMinutes(hours.close)
      if (open === null || close === null || close <= open) {
        throw new ReservationError(`Opening hours for day ${day} are invalid.`, { code: 'invalid_hours' })
      }
    }
  }
  return saveSettings(next)
}

export function toggleBlockedDate(date, reason = 'Private event', blocked = true) {
  if (!isValidISODate(date)) throw new ReservationError('Choose a valid date.', { code: 'invalid_date' })
  const settings = getSettings()
  const existing = (settings.blockedDates || []).filter((entry) => (typeof entry === 'string' ? entry : entry.date) !== date)
  if (blocked) existing.push({ date, reason: safeText(reason, 120) || 'Closed' })
  return saveSettings({ blockedDates: existing })
}

export function toggleBlockedSlot(date, time, reason = 'Sitting blocked', blocked = true) {
  if (!isValidISODate(date) || timeToMinutes(time) === null) {
    throw new ReservationError('Choose a valid date and sitting.', { code: 'invalid_block' })
  }
  const settings = getSettings()
  if (blocked && !generateSlotTimes(date, settings).includes(time)) {
    throw new ReservationError('That time is not one of the generated sitting times for this date.', {
      code: 'invalid_block',
    })
  }
  const existing = (settings.blockedSlots || []).filter(
    (entry) => !(entry.date === date && entry.time === time),
  )
  if (blocked) existing.push({ date, time, reason: safeText(reason, 120) || 'Sitting blocked' })
  return saveSettings({ blockedSlots: existing })
}

export function updateTableConfig(tableId, patch = {}) {
  const tables = getTables()
  const index = tables.findIndex((table) => table.id === tableId)
  if (index < 0) throw new ReservationError('Table not found.', { code: 'not_found' })
  const existing = tables[index]
  const seats = patch.seats !== undefined ? Math.trunc(Number(patch.seats)) : Number(existing.seats)
  if (!Number.isFinite(seats) || seats < 1 || seats > 40) {
    throw new ReservationError('Table capacity must be between 1 and 40.', { code: 'invalid_table' })
  }
  const minSeats = patch.minSeats !== undefined ? Math.trunc(Number(patch.minSeats)) : Number(existing.minSeats || 1)
  if (!Number.isFinite(minSeats) || minSeats < 1 || minSeats > seats) {
    throw new ReservationError('Minimum seats must be between 1 and the table capacity.', { code: 'invalid_table' })
  }
  const zone = patch.zoneId ? getZone(patch.zoneId) : getZone(existing.zoneId)
  if (!zone) throw new ReservationError('Choose a valid seating zone.', { code: 'invalid_table' })
  const next = {
    ...existing,
    seats,
    minSeats,
    zoneId: zone.id,
    zone: zone.name,
    name: safeText(patch.name, 60) || existing.name,
    status: patch.status || existing.status,
    features: Array.isArray(patch.features) ? patch.features.map((item) => safeText(item, 40)).slice(0, 5) : existing.features,
    reservable: patch.reservable === undefined ? existing.reservable !== false : Boolean(patch.reservable),
    updatedAt: nowISO(),
  }
  tables.splice(index, 1, next)
  saveTables(tables)
  return next
}

export function addTable(patch = {}) {
  const tables = getTables()
  const zone = getZone(patch.zoneId || 'main')
  if (!zone) throw new ReservationError('Choose a valid seating zone.', { code: 'invalid_table' })
  const seats = Math.trunc(Number(patch.seats || 2))
  if (!Number.isFinite(seats) || seats < 1 || seats > 40) {
    throw new ReservationError('Table capacity must be between 1 and 40.', { code: 'invalid_table' })
  }
  const nextNumber = tables.length + 1
  const table = {
    id: createId('T').replace('T_', 'T'),
    name: safeText(patch.name, 60) || `Table ${String(nextNumber).padStart(2, '0')}`,
    zoneId: zone.id,
    zone: zone.name,
    seats,
    minSeats: Math.min(seats, Math.max(1, Math.trunc(Number(patch.minSeats) || 1))),
    status: 'open',
    features: [],
    reservable: true,
    createdAt: nowISO(),
  }
  saveTables([...tables, table])
  return table
}

export function deleteTable(tableId) {
  const tables = getTables()
  if (tables.length <= 1) throw new ReservationError('Keep at least one table on the floor.', { code: 'last_table' })
  if (getReservations().some((reservation) => reservation.tableId === tableId && isActiveReservation(reservation))) {
    throw new ReservationError('Reassign active bookings before removing this table.', { code: 'table_in_use' })
  }
  saveTables(tables.filter((table) => table.id !== tableId))
  return true
}

export function getAvailabilitySnapshot(dateISO) {
  const settings = getSettings()
  return {
    settings,
    blockedDate: (settings.blockedDates || []).find(
      (entry) => (typeof entry === 'string' ? entry : entry.date) === dateISO,
    ) || null,
    blockedSlots: (settings.blockedSlots || []).filter((entry) => entry.date === dateISO),
  }
}

export { getServiceWindow }
