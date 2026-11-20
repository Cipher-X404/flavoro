/**
 * Low-level persistence adapter.
 *
 * The only module in the app that touches `window.localStorage`. Everything
 * else talks to `store.js`, which means swapping this adapter for a real API
 * client later is a contained change.
 */

export const STORAGE_NAMESPACE = 'flavoro.data.v1.'
const EVENT_NAME = 'flavoro:data-changed'

function memoryFallback() {
  if (!globalThis.__flavoroMemoryStorage) {
    const map = new Map()
    globalThis.__flavoroMemoryStorage = {
      getItem: (key) => (map.has(key) ? map.get(key) : null),
      setItem: (key, value) => map.set(key, String(value)),
      removeItem: (key) => map.delete(key),
    }
  }
  return globalThis.__flavoroMemoryStorage
}

function backend() {
  try {
    const probe = '__flavoro_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    // Private modes / disabled storage: keep the demo usable for the tab session.
    return memoryFallback()
  }
}

export function storageAvailable() {
  return backend() === globalThis.localStorage
}

export function readRaw(key) {
  try {
    return backend().getItem(key)
  } catch {
    return null
  }
}

export function writeRaw(key, value) {
  try {
    backend().setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeRaw(key) {
  try {
    backend().removeItem(key)
  } catch {
    /* no-op */
  }
}

export function readJSON(key, fallback) {
  const raw = readRaw(key)
  if (raw === null || raw === undefined || raw === '') return fallback
  try {
    const parsed = JSON.parse(raw)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    return writeRaw(key, JSON.stringify(value))
  } catch {
    return false
  }
}

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

function randomToken(length = 8) {
  let output = ''
  try {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    for (const byte of bytes) output += ALPHABET[byte % ALPHABET.length]
  } catch {
    for (let i = 0; i < length; i += 1) output += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return output
}

/** Stable, readable, collision-resistant identifier. */
export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${randomToken(5)}`
}

/** Short human-friendly booking reference, e.g. FLV-7K2M9Q. */
export function createReference(prefix = 'FLV') {
  return `${prefix}-${randomToken(6).toUpperCase()}`
}

export function nowISO() {
  return new Date().toISOString()
}

export function emitChange(collection, detail = {}) {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, { detail: { collection, ...detail } }),
    )
  } catch {
    /* CustomEvent unavailable (very old browsers) */
  }
}

/**
 * Subscribe to local data mutations made by this tab, plus cross-tab changes.
 * Returns an unsubscribe function.
 */
export function subscribe(handler) {
  if (typeof window === 'undefined') return () => {}
  const onLocal = (event) => handler(event.detail || {})
  const onStorage = (event) => {
    if (!event.key || !event.key.startsWith(STORAGE_NAMESPACE)) return
    handler({ collection: event.key.slice(STORAGE_NAMESPACE.length), external: true, key: event.key })
  }
  window.addEventListener(EVENT_NAME, onLocal)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT_NAME, onLocal)
    window.removeEventListener('storage', onStorage)
  }
}

export function safeText(value, maxLength = 300) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function safeMultiline(value, maxLength = 600) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength)
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
