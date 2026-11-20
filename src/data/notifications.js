/**
 * In-app notification service.
 *
 * These are *simulated* notifications persisted in localStorage. No email,
 * SMS or push message is ever sent. A future integration can subscribe here
 * (see `delivery` metadata on every record) without touching the UI.
 */

import { createId, nowISO, safeText } from './storage.js'
import { getNotifications, getSettings, saveNotifications } from './store.js'

export const AUDIENCE = { admin: 'admin', customer: 'customer', guest: 'guest' }

const ICONS = {
  reservation_created: 'calendar-days',
  reservation_confirmed: 'check-circle-2',
  reservation_updated: 'pencil',
  reservation_cancelled: 'x',
  reservation_deleted: 'trash-2',
  status_changed: 'refresh-cw',
  kitchen_status: 'flame',
  table_assigned: 'users',
  payment_update: 'dollar-sign',
  repeat_booking: 'rotate-ccw',
  system: 'bell',
}

export function notificationIcon(type) {
  return ICONS[type] || 'bell'
}

export function listNotifications({ audience, customerId, reservationId, unreadOnly = false, limit = 50 } = {}) {
  let list = getNotifications()
  if (audience) list = list.filter((notification) => notification.audience === audience)
  if (customerId) list = list.filter((notification) => notification.customerId === customerId)
  if (reservationId) list = list.filter((notification) => notification.reservationId === reservationId)
  if (unreadOnly) list = list.filter((notification) => !notification.read)
  return list
    .slice()
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit)
}

export function getUnreadCount({ audience, customerId } = {}) {
  return listNotifications({ audience, customerId, unreadOnly: true, limit: 500 }).length
}

export function createNotification({
  audience = AUDIENCE.admin,
  customerId = null,
  reservationId = null,
  type = 'system',
  title,
  message,
  dedupeKey = '',
} = {}) {
  const settings = getSettings()
  if (settings.notificationsEnabled === false) return null
  const notifications = getNotifications()
  if (dedupeKey && notifications.some((item) => item.dedupeKey === dedupeKey)) {
    return notifications.find((item) => item.dedupeKey === dedupeKey)
  }
  const notification = {
    id: createId('notif'),
    audience,
    customerId,
    reservationId,
    type,
    title: safeText(title, 140) || 'Update',
    message: safeText(message, 500),
    icon: notificationIcon(type),
    read: false,
    simulated: true,
    channel: 'in-app',
    delivery: { email: false, sms: false, push: false, reason: 'Prototype: in-app only' },
    dedupeKey: safeText(dedupeKey, 120),
    createdAt: nowISO(),
  }
  saveNotifications([notification, ...notifications].slice(0, 400))
  return notification
}

export function markNotificationRead(notificationId) {
  const notifications = getNotifications()
  const index = notifications.findIndex((item) => item.id === notificationId)
  if (index < 0) return false
  notifications[index] = { ...notifications[index], read: true, readAt: nowISO() }
  saveNotifications(notifications)
  return true
}

export function markAllNotificationsRead({ audience, customerId } = {}) {
  const notifications = getNotifications().map((notification) => {
    const matchesAudience = !audience || notification.audience === audience
    const matchesCustomer = !customerId || notification.customerId === customerId
    if (matchesAudience && matchesCustomer && !notification.read) {
      return { ...notification, read: true, readAt: nowISO() }
    }
    return notification
  })
  saveNotifications(notifications)
}

export function clearReadNotifications({ audience, customerId } = {}) {
  const notifications = getNotifications().filter((notification) => {
    const matchesAudience = !audience || notification.audience === audience
    const matchesCustomer = !customerId || notification.customerId === customerId
    return !(matchesAudience && matchesCustomer && notification.read)
  })
  saveNotifications(notifications)
}

/** Notifications relevant to the signed-in dashboard role. */
export function getDashboardNotifications(role, { customerId = null, limit = 30 } = {}) {
  if (role === 'admin') {
    return listNotifications({ audience: AUDIENCE.admin, limit })
  }
  const customer = customerId ? listNotifications({ audience: AUDIENCE.customer, customerId, limit }) : []
  const guest = customerId ? listNotifications({ audience: AUDIENCE.guest, customerId, limit }) : []
  return [...customer, ...guest]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, limit)
}
