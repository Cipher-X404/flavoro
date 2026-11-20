/**
 * Customer account logic for the prototype.
 *
 * Roles are simulated:
 *  - guest     → no account; a customer record is created from booking details
 *  - customer  → signed in through the existing browser-only auth (`local-auth.js`)
 *  - admin     → signed in through the existing local admin preview
 *
 * These checks are convenience gates for the demo, NOT security boundaries.
 */

import { isSignedIn } from '../local-auth.js'
import { readJSON, safeText, createId, nowISO } from './storage.js'
import { getCustomers, getReservations, saveCustomers } from './store.js'
import { todayISO } from './datetime.js'

const PROFILE_KEY = 'flavoro.demo.profile.v1'

export const CUSTOMER_TYPE = { guest: 'guest', registered: 'registered' }

export function getProfileSnapshot() {
  const profile = readJSON(PROFILE_KEY, null)
  return profile && typeof profile === 'object' ? profile : null
}

export function isRegisteredSession() {
  try {
    return isSignedIn('user')
  } catch {
    return false
  }
}

export function isAdminSession() {
  try {
    return isSignedIn('admin')
  } catch {
    return false
  }
}

export function normalizeEmail(email) {
  return safeText(email, 120).toLowerCase()
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email))
}

export function listCustomers() {
  return getCustomers().slice().sort((a, b) => String(a.name).localeCompare(String(b.name)))
}

export function getCustomerById(customerId) {
  return getCustomers().find((customer) => customer.id === customerId) || null
}

export function getCustomerByEmail(email) {
  const normalized = normalizeEmail(email)
  if (!normalized) return null
  return getCustomers().find((customer) => normalizeEmail(customer.email) === normalized) || null
}

/**
 * Resolve the customer linked to the current browser session.
 * The local profile's email is the join key used by the existing auth flow.
 */
export function getCurrentCustomer() {
  const profile = getProfileSnapshot()
  if (!profile?.email) return null
  return getCustomerByEmail(profile.email)
}

export function getSessionIdentity() {
  const profile = getProfileSnapshot()
  const registered = isRegisteredSession()
  const customer = registered && profile?.email ? getCustomerByEmail(profile.email) : null
  return {
    role: registered ? 'customer' : 'guest',
    type: registered ? CUSTOMER_TYPE.registered : CUSTOMER_TYPE.guest,
    registered,
    name: safeText(profile?.name || customer?.name || '', 120),
    email: normalizeEmail(profile?.email || customer?.email || ''),
    phone: safeText(profile?.phone || customer?.phone || '', 40),
    profile,
    customer,
  }
}

/** Create or update the customer record for a booking. */
export function upsertCustomer({ name, email, phone = '', type = CUSTOMER_TYPE.guest, notes = '', seeded = false } = {}) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) throw new Error('An email address is required to save a customer.')
  const displayName = safeText(name, 120)
  const cleanPhone = safeText(phone, 40)
  const requestedType = type === CUSTOMER_TYPE.registered ? CUSTOMER_TYPE.registered : CUSTOMER_TYPE.guest
  const customers = getCustomers()
  const existingIndex = customers.findIndex((customer) => normalizeEmail(customer.email) === normalizedEmail)

  if (existingIndex >= 0) {
    const existing = customers[existingIndex]
    // Guests are promoted to registered when they sign in; never demoted.
    const nextType = existing.type === CUSTOMER_TYPE.registered ? CUSTOMER_TYPE.registered : requestedType
    const next = {
      ...existing,
      name: displayName || existing.name,
      phone: cleanPhone || existing.phone || '',
      notes: safeText(notes, 400) || existing.notes || '',
      type: nextType,
      updatedAt: nowISO(),
    }
    customers.splice(existingIndex, 1, next)
    saveCustomers(customers)
    return next
  }

  const customer = {
    id: createId('cus'),
    name: displayName || 'Guest',
    email: normalizedEmail,
    phone: cleanPhone,
    notes: safeText(notes, 400),
    type: requestedType,
    seeded: Boolean(seeded),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  customers.push(customer)
  saveCustomers(customers)
  return customer
}

/** Ensure the signed-in local profile has a matching customer record. */
export function ensureCurrentCustomer() {
  const identity = getSessionIdentity()
  if (!identity.registered || !identity.email) return identity.customer
  if (identity.customer) return identity.customer
  return upsertCustomer({
    name: identity.name || identity.email.split('@')[0],
    email: identity.email,
    phone: identity.phone,
    type: CUSTOMER_TYPE.registered,
  })
}

export function updateCustomer(customerId, patch = {}) {
  const customers = getCustomers()
  const index = customers.findIndex((customer) => customer.id === customerId)
  if (index < 0) throw new Error('Customer not found.')
  const existing = customers[index]
  const next = {
    ...existing,
    name: patch.name !== undefined ? safeText(patch.name, 120) || existing.name : existing.name,
    phone: patch.phone !== undefined ? safeText(patch.phone, 40) : existing.phone,
    notes: patch.notes !== undefined ? safeText(patch.notes, 400) : existing.notes,
    type: existing.type,
    updatedAt: nowISO(),
  }
  customers.splice(index, 1, next)
  saveCustomers(customers)
  return next
}

export function getCustomerReservations(customerId, { includeCancelled = true } = {}) {
  return getReservations()
    .filter((reservation) => reservation.customerId === customerId)
    .filter((reservation) => includeCancelled || reservation.status !== 'cancelled')
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
}

export function getCustomerStats(customerId) {
  const reservations = getCustomerReservations(customerId)
  const active = reservations.filter(
    (reservation) =>
      ['pending', 'confirmed', 'seated'].includes(reservation.status) &&
      reservation.date >= todayISO(),
  )
  const completed = reservations.filter((reservation) => reservation.status === 'completed')
  const cancelled = reservations.filter((reservation) => reservation.status === 'cancelled')
  const covers = completed.reduce((sum, reservation) => sum + Number(reservation.partySize || 0), 0)
  return {
    totalBookings: reservations.length,
    upcoming: active.length,
    completed: completed.length,
    cancelled: cancelled.length,
    covers,
    lastVisit: completed[0]?.date || null,
    nextVisit: active[0]?.date || null,
  }
}

/** All customers with light booking aggregates, for admin tooling. */
export function getCustomerDirectory() {
  return listCustomers().map((customer) => {
    const reservations = getCustomerReservations(customer.id)
    return {
      ...customer,
      reservationCount: reservations.length,
      lastBooking: reservations[0] || null,
    }
  })
}
