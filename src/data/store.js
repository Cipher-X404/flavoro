/**
 * Central data-access layer (repository) for the reservation prototype.
 *
 * All reads/writes of persisted application data flow through this module.
 * UI modules never touch localStorage directly; they call the domain services
 * in `reservations.js`, `availability.js`, `customers.js` and
 * `notifications.js`, which in turn use this repository.
 *
 * Replacing the localStorage backend with a REST client later means
 * re-implementing the exported functions here (or swapping `storage.js`),
 * without changing the screens.
 */

import {
  STORAGE_NAMESPACE,
  createId,
  emitChange,
  isPlainObject,
  nowISO,
  readJSON,
  removeRaw,
  subscribe,
  writeJSON,
} from './storage.js'
import { COLLECTIONS, SCHEMA_VERSION, buildSeedData, defaultSettings } from './seed.js'

export const META_KEY = `${STORAGE_NAMESPACE}meta`
export const collectionKey = (name) => `${STORAGE_NAMESPACE}${name}`

const CHANGE_LABELS = {
  restaurantSettings: 'settings',
  menuItems: 'menuItems',
  tables: 'tables',
  customers: 'customers',
  reservations: 'reservations',
  mealOrders: 'mealOrders',
  reservationHistory: 'reservationHistory',
  notifications: 'notifications',
  payments: 'payments',
}

function assertCollection(name) {
  if (!COLLECTIONS.includes(name)) throw new Error(`Unknown data collection: ${name}`)
}

function readMeta() {
  return readJSON(META_KEY, null)
}

/**
 * Write the first-run snapshot once per browser. Safe to call on every import.
 * If a collection is missing later (partial clear, older snapshot), it is
 * restored from the seed without clobbering existing records.
 */
export function ensureSeeded() {
  const meta = readMeta()
  const needsFullSeed = !meta || !meta.version
  if (needsFullSeed) {
    const snapshot = buildSeedData()
    COLLECTIONS.forEach((name) => {
      if (readJSON(collectionKey(name), null) === null) {
        writeJSON(collectionKey(name), snapshot[name])
      }
    },
    )
    // Preserve menu edits made through the earlier prototype namespace.
    const legacyMenu = readJSON('flavoro.demo.menu.v1', null)
    if (Array.isArray(legacyMenu) && legacyMenu.length) {
      writeJSON(collectionKey('menuItems'), legacyMenu)
    }
    writeJSON(META_KEY, {
      version: SCHEMA_VERSION,
      seededAt: nowISO(),
      collectionVersion: SCHEMA_VERSION,
    })
    emitChange('seed', { seeded: true })
    return true
  }

  // Repair missing collections after a partial reset.
  let repaired = false
  const snapshot = buildSeedData()
  COLLECTIONS.forEach((name) => {
    if (readJSON(collectionKey(name), null) === null) {
      writeJSON(collectionKey(name), snapshot[name])
      repaired = true
    }
  })
  if (repaired) emitChange('seed', { repaired: true })
  return repaired
}

export function getMeta() {
  ensureSeeded()
  return readMeta() || { version: SCHEMA_VERSION }
}

export function getCollection(name) {
  assertCollection(name)
  ensureSeeded()
  const value = readJSON(collectionKey(name), null)
  if (value !== null) return value
  const seeded = buildSeedData()[name]
  writeJSON(collectionKey(name), seeded)
  return seeded
}

export function setCollection(name, value) {
  assertCollection(name)
  const written = writeJSON(collectionKey(name), value)
  if (written) emitChange(CHANGE_LABELS[name] || name, { value })
  return written
}

export function updateCollection(name, updater) {
  const current = getCollection(name)
  const next = typeof updater === 'function' ? updater(current) : updater
  setCollection(name, next)
  return next
}

export function resetCollection(name) {
  assertCollection(name)
  const seeded = buildSeedData()[name]
  setCollection(name, seeded)
  return seeded
}

/** Restaurant-level availability + booking configuration (singleton). */
export function getSettings() {
  const stored = getCollection('restaurantSettings')
  const merged = { ...structuredClone(defaultSettings), ...(isPlainObject(stored) ? stored : {}) }
  if (!isPlainObject(merged.openingHours)) merged.openingHours = structuredClone(defaultSettings.openingHours)
  if (!Array.isArray(merged.blockedDates)) merged.blockedDates = []
  if (!Array.isArray(merged.blockedSlots)) merged.blockedSlots = []
  return merged
}

export function saveSettings(patch) {
  const current = getSettings()
  const next = {
    ...current,
    ...(isPlainObject(patch) ? patch : {}),
    updatedAt: nowISO(),
  }
  setCollection('restaurantSettings', next)
  return next
}

/** Menu catalogue — shared by the marketing menu and reservation pre-orders. */
export function getMenuItems() {
  const value = getCollection('menuItems')
  return Array.isArray(value) ? value : []
}

export function saveMenuItems(value) {
  return setCollection('menuItems', Array.isArray(value) ? value : [])
}

export function getTables() {
  const value = getCollection('tables')
  return Array.isArray(value) ? value : []
}

export function saveTables(value) {
  return setCollection('tables', Array.isArray(value) ? value : [])
}

export function getCustomers() {
  const value = getCollection('customers')
  return Array.isArray(value) ? value : []
}

export function saveCustomers(value) {
  return setCollection('customers', Array.isArray(value) ? value : [])
}

export function getReservations() {
  const value = getCollection('reservations')
  return Array.isArray(value) ? value : []
}

export function saveReservations(value) {
  return setCollection('reservations', Array.isArray(value) ? value : [])
}

export function getMealOrders() {
  const value = getCollection('mealOrders')
  return Array.isArray(value) ? value : []
}

export function saveMealOrders(value) {
  return setCollection('mealOrders', Array.isArray(value) ? value : [])
}

export function getReservationHistory() {
  const value = getCollection('reservationHistory')
  return Array.isArray(value) ? value : []
}

export function saveReservationHistory(value) {
  return setCollection('reservationHistory', Array.isArray(value) ? value : [])
}

export function getNotifications() {
  const value = getCollection('notifications')
  return Array.isArray(value) ? value : []
}

export function saveNotifications(value) {
  return setCollection('notifications', Array.isArray(value) ? value : [])
}

export function getPayments() {
  const value = getCollection('payments')
  return Array.isArray(value) ? value : []
}

export function savePayments(value) {
  return setCollection('payments', Array.isArray(value) ? value : [])
}

export function nextId(prefix, collection) {
  if (!collection) return createId(prefix)
  const suffix = createId('x').split('_').pop()
  return `${prefix}_${suffix}`
}

/* -------------------------------------------------------------------------
   Demo utilities (used by the admin prototype tools)
   ------------------------------------------------------------------------- */

/** Reset every reservation-system collection back to its seeded snapshot. */
export function resetAllData() {
  const snapshot = buildSeedData()
  // The menu catalogue is edited in Menu Studio and is only borrowed by the
  // reservation flow; resetting reservation data must not wipe those edits.
  COLLECTIONS.forEach((name) => {
    if (name !== 'menuItems') writeJSON(collectionKey(name), snapshot[name])
  })
  writeJSON(META_KEY, { version: SCHEMA_VERSION, seededAt: nowISO(), collectionVersion: SCHEMA_VERSION })
  emitChange('reset', { all: true })
}

/** Remove only records flagged as demo/test data, keeping real prototype bookings. */
export function deleteSeededRecords() {
  const reservations = getReservations()
  const seededIds = new Set(reservations.filter((item) => item.seeded).map((item) => item.id))
  const seededCustomerIds = new Set(getCustomers().filter((item) => item.seeded).map((item) => item.id))
  const keptReservations = reservations.filter((item) => !item.seeded)
  const keptReservationIds = new Set(keptReservations.map((item) => item.id))
  // Keep a seeded customer if a real booking still points at it.
  const keptCustomerIds = new Set(getCustomers().filter((item) => !item.seeded).map((item) => item.id))
  keptReservations.forEach((item) => { if (item.customerId) keptCustomerIds.add(item.customerId) })

  saveReservations(keptReservations)
  saveMealOrders(getMealOrders().filter((item) => !seededIds.has(item.reservationId)))
  saveReservationHistory(getReservationHistory().filter((item) => !seededIds.has(item.reservationId)))
  savePayments(getPayments().filter((item) => !seededIds.has(item.reservationId)))
  // A notification belongs to the booking it references, even when the guest is
  // a seeded customer. Only customer-level seeded notes are removed with them.
  saveNotifications(
    getNotifications().filter((item) => {
      if (item.reservationId) return keptReservationIds.has(item.reservationId)
      if (item.customerId) return keptCustomerIds.has(item.customerId)
      return true
    }),
  )
  saveCustomers(getCustomers().filter((item) => keptCustomerIds.has(item.id)))
  emitChange('reservations', { clearedSeeded: true })
  return seededIds.size
}

/** Portable JSON export so the prototype data can be inspected or migrated. */
export function exportSnapshot() {
  const data = {}
  COLLECTIONS.forEach((name) => {
    data[name] = getCollection(name)
  })
  return {
    app: 'flavoro',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowISO(),
    data,
  }
}

/** Import a snapshot exported above. Validates shape before replacing data. */
export function importSnapshot(snapshot) {
  if (!isPlainObject(snapshot?.data)) throw new Error('This file does not contain a Flavoro data snapshot.')
  COLLECTIONS.forEach((name) => {
    const value = snapshot.data[name]
    if (value === undefined) return
    if (name === 'restaurantSettings') {
      if (!isPlainObject(value)) throw new Error('restaurantSettings must be an object.')
    } else if (!Array.isArray(value)) {
      throw new Error(`${name} must be an array.`)
    }
    writeJSON(collectionKey(name), value)
  })
  writeJSON(META_KEY, { version: SCHEMA_VERSION, seededAt: nowISO(), collectionVersion: SCHEMA_VERSION, importedAt: nowISO() })
  emitChange('import', {})
  return true
}

/** Clear the whole prototype namespace (used by "reset demo" buttons). */
export function clearAllData() {
  removeRaw(META_KEY)
  COLLECTIONS.forEach((name) => {
    if (name !== 'menuItems') removeRaw(collectionKey(name))
  })
  emitChange('reset', { all: true })
}

export { subscribe, COLLECTIONS as collections }
