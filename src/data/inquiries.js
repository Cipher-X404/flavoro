/**
 * Concierge inquiries and dispatch subscriptions.
 *
 * These live beside the reservation collections but deliberately outside the
 * seeded snapshot: an inquiry is a real message a guest typed, so it is kept in
 * its own namespace and never reset by the demo-data tools. The shape mirrors
 * the reservation records (reference, status, timestamps) so the same admin
 * surfaces can read both.
 */

import {
  createReference,
  emitChange,
  nowISO,
  readJSON,
  safeMultiline,
  safeText,
  writeJSON,
} from './storage.js'
import { AUDIENCE, createNotification } from './notifications.js'

const INQUIRY_KEY = 'flavoro.data.v1.inquiries'
const DISPATCH_KEY = 'flavoro.data.v1.dispatch'
const MAX_INQUIRIES = 200

export const INQUIRY_TOPICS = {
  'table-assistance': 'Table & tonight',
  'private-event': 'Private salon or buyout',
  'cellar-tasting': 'Cellar & sommelier',
  'press-editorial': 'Press & editorial',
}

export const INQUIRY_STATUS = {
  new: 'Awaiting reply',
  answered: 'Answered',
  closed: 'Closed',
}

const read = (key) => {
  const value = readJSON(key, [])
  return Array.isArray(value) ? value : []
}

export function listInquiries() {
  return read(INQUIRY_KEY)
}

export function lastInquiry() {
  const all = listInquiries()
  return all.length ? all[0] : null
}

export function getInquiry(reference) {
  return listInquiries().find((item) => item.reference === reference) || null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Field-level validation. Returns `{ ok, errors }` where `errors` is keyed by
 * the form field name, so the UI can mark inputs without inventing messages.
 */
export function validateInquiry(input = {}, { now = new Date() } = {}) {
  const errors = {}
  const name = String(input.name ?? '').trim()
  const email = String(input.email ?? '').trim()
  const phone = String(input.phone ?? '').trim()
  const message = String(input.message ?? '').trim()
  const topic = String(input.topic ?? '')

  if (name.length < 2) errors.name = 'Please tell us who we are expecting.'
  if (!EMAIL.test(email)) errors.email = 'A working email address, so we can reply.'
  if (phone && phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'That number looks short. Include the area code, or leave it blank.'
  }
  if (message.length < 12) {
    errors.message = 'A sentence or two helps the kitchen plan. Twelve characters minimum.'
  }
  if (topic && !INQUIRY_TOPICS[topic]) errors.topic = 'Choose the team that should read this.'

  if (input.date) {
    const parsed = new Date(`${input.date}T12:00:00`)
    if (Number.isNaN(parsed.getTime())) {
      errors.date = 'That date could not be read.'
    } else {
      const today = new Date(now)
      today.setHours(0, 0, 0, 0)
      if (parsed < today) errors.date = 'That date has already passed.'
    }
  }

  return { ok: Object.keys(errors).length === 0, errors }
}

/** Store a validated inquiry, notify the front desk, and return the record. */
export function saveInquiry(input = {}) {
  const { ok, errors } = validateInquiry(input)
  if (!ok) {
    const error = new Error('Inquiry is incomplete')
    error.fields = errors
    throw error
  }

  const topic = INQUIRY_TOPICS[input.topic] ? input.topic : 'table-assistance'
  const record = {
    id: createReference('INQ'),
    reference: createReference('FQ'),
    topic,
    topicLabel: INQUIRY_TOPICS[topic],
    status: 'new',
    name: safeText(input.name, 80),
    email: safeText(input.email, 120),
    phone: safeText(input.phone, 40),
    partySize: safeText(input.partySize, 12),
    date: safeText(input.date, 12),
    window: safeText(input.window, 32),
    message: safeMultiline(input.message, 1200),
    createdAt: nowISO(),
    source: 'contact-page',
  }

  const all = listInquiries()
  writeJSON(INQUIRY_KEY, [record, ...all].slice(0, MAX_INQUIRIES))
  emitChange('inquiries', { reference: record.reference })

  try {
    createNotification({
      audience: AUDIENCE.admin,
      type: 'inquiry',
      title: `New concierge request · ${record.topicLabel}`,
      message: `${record.name} (${record.email}) — ${record.message.slice(0, 160)}`,
      dedupeKey: `inquiry:${record.reference}`,
    })
  } catch {
    // Notifications are a convenience; a failed write must not lose the inquiry.
  }

  return record
}

/* -------------------------------------------------------------------------
   Dispatch subscription (the journal letter)
   ------------------------------------------------------------------------- */

export function listDispatchSubscribers() {
  return read(DISPATCH_KEY)
}

export function isSubscribed(email) {
  const normalised = String(email ?? '').trim().toLowerCase()
  return listDispatchSubscribers().some((item) => item.email === normalised)
}

export function subscribeToDispatch(email) {
  const normalised = String(email ?? '').trim().toLowerCase()
  if (!EMAIL.test(normalised)) {
    const error = new Error('Enter a working email address')
    error.fields = { email: 'That address does not look complete.' }
    throw error
  }
  if (isSubscribed(normalised)) return { already: true, record: null }

  const record = {
    id: createReference('SUB'),
    email: normalised,
    createdAt: nowISO(),
    source: 'journal-page',
  }
  writeJSON(DISPATCH_KEY, [record, ...listDispatchSubscribers()].slice(0, 500))
  emitChange('dispatch', { email: normalised })
  return { already: false, record }
}
