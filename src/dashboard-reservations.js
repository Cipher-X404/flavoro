/**
 * Reservation management surfaces for the dashboards.
 *
 *  - Admin: reservation ledger, table assignment, service/kitchen statuses,
 *    availability + table configuration, blocked dates/slots, demo data tools.
 *  - Customer: upcoming and past bookings, meal selections, history,
 *    notifications, modify / repeat / cancel actions.
 *
 * Both panels read and write through `data/reservations.js`.
 */

import './reservations.css'
import {
  formatDateCompact,
  formatDateLong,
  formatTime12,
  relativeTimeLabel,
  todayISO,
  WEEKDAY_LONG,
} from './data/datetime.js'
import {
  KITCHEN_STATUS,
  KITCHEN_STATUS_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  assignTable,
  cancelReservation,
  deleteReservation,
  getAdminStats,
  getReservationDetails,
  getReservationMealOrder,
  getUpcomingReservations,
  listReservations,
  repeatReservation,
  saveAvailabilitySettings,
  setKitchenStatus,
  setPaymentStatus,
  setReservationStatus,
  toggleBlockedDate,
  toggleBlockedSlot,
  updateTableConfig,
  addTable,
  deleteTable,
} from './data/reservations.js'

import { zoneOptions } from './data/availability.js'
import {
  clearAllData,
  deleteSeededRecords,
  exportSnapshot,
  getReservations,
  getSettings,
  getTables,
  importSnapshot,
  resetAllData,
} from './data/store.js'
import {
  getCurrentCustomer,
  getCustomerReservations,
  getCustomerStats,
} from './data/customers.js'
import {
  markAllNotificationsRead,
  markNotificationRead,
  getDashboardNotifications,
  getUnreadCount,
} from './data/notifications.js'

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])

const money = (value) => `$${Number(value || 0).toFixed(2)}`
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`

const STATUS_OPTIONS = [
  RESERVATION_STATUS.pending,
  RESERVATION_STATUS.confirmed,
  RESERVATION_STATUS.seated,
  RESERVATION_STATUS.completed,
  RESERVATION_STATUS.cancelled,
  RESERVATION_STATUS.no_show,
]

const KITCHEN_OPTIONS = [
  KITCHEN_STATUS.queued,
  KITCHEN_STATUS.preparing,
  KITCHEN_STATUS.ready,
  KITCHEN_STATUS.served,
]

let adminTab = 'bookings'
let adminFilters = { date: '', status: 'all', query: '', scope: 'upcoming' }
let expandedReservation = null
let customerExpanded = null

export function setAdminReservationsTab(tab) {
  adminTab = tab === 'availability' ? 'availability' : 'bookings'
}

export function getAdminReservationBadge() {
  return getAdminStats().upcoming
}

/* =========================================================================
   ADMIN PANEL
   ========================================================================= */

export function renderAdminReservationsPanel() {
  const stats = getAdminStats()
  return `
    <div class="dash-view-header ios-spring-enter">
      <div class="view-title-group">
        <div class="ios-capsule-badge">${icon('calendar-days')} RESERVATION LEDGER</div>
        <h1>The <em>booked floor.</em></h1>
        <p>Every table request in this browser: confirm, seat, assign tables, move courses and release capacity.</p>
      </div>
      <div class="view-header-actions">
        <button type="button" class="ios-action-btn primary" data-rsv-admin-tab="bookings">${icon('clipboard-list')}<span>Bookings</span></button>
        <button type="button" class="ios-action-btn secondary" data-rsv-admin-tab="availability">${icon('sliders-horizontal')}<span>Availability</span></button>
      </div>
    </div>

    <div class="kpi-grid rsv-dash-stats ios-spring-enter">
      ${[
        ['TODAY', stats.todayBookings, `${stats.todayCovers} covers booked`, 'calendar-days', 'amber'],
        ['UPCOMING', stats.upcoming, `${stats.confirmed} confirmed`, 'users', 'green'],
        ['PENDING', stats.pending, 'Awaiting confirmation', 'clock', 'orange'],
        ['KITCHEN', stats.kitchenQueue, 'Pre-orders in queue', 'flame', 'purple'],
      ]
        .map(
          ([label, value, sub, ic, tone]) => `
            <div class="ios-card kpi-card">
              <div class="kpi-head">
                <span class="kpi-label">${label}</span>
                <div class="kpi-icon-bubble ${tone}">${icon(ic)}</div>
              </div>
              <div class="kpi-main"><span class="kpi-number">${value}</span></div>
              <span class="kpi-subtext">${sub}</span>
            </div>
          `,
        )
        .join('')}
    </div>

    <div class="rsv-dash-tabs" role="tablist" aria-label="Reservation management">
      <button type="button" role="tab" class="rsv-dash-tab ${adminTab === 'bookings' ? 'is-active' : ''}" aria-selected="${adminTab === 'bookings'}" data-rsv-admin-tab="bookings">${icon('clipboard-list')} Bookings</button>
      <button type="button" role="tab" class="rsv-dash-tab ${adminTab === 'availability' ? 'is-active' : ''}" aria-selected="${adminTab === 'availability'}" data-rsv-admin-tab="availability">${icon('sliders-horizontal')} Floor &amp; availability</button>
    </div>

    ${adminTab === 'bookings' ? renderAdminBookings(stats) : renderAdminAvailability()}
  `
}

function renderAdminBookings(stats) {
  const today = todayISO()
  let list = listReservations({
    query: adminFilters.query,
    status: adminFilters.status,
    date: adminFilters.date,
    sort: 'schedule',
  })
  if (adminFilters.scope === 'past' || adminFilters.scope === 'all') {
    list = list.reverse()
  }
  if (adminFilters.scope === 'upcoming') {
    list = list.filter(
      (reservation) =>
        reservation.date >= today &&
        ![RESERVATION_STATUS.cancelled, RESERVATION_STATUS.completed, RESERVATION_STATUS.no_show].includes(reservation.status),
    )
  } else if (adminFilters.scope === 'today') {
    list = list.filter((reservation) => reservation.date === today)
  } else if (adminFilters.scope === 'past') {
    list = list.filter(
      (reservation) =>
        reservation.date < today ||
        [RESERVATION_STATUS.cancelled, RESERVATION_STATUS.completed, RESERVATION_STATUS.no_show].includes(reservation.status),
    )
  }

  return `
    <div class="ios-card rsv-dash-controls ios-spring-enter">
      <div class="rsv-dash-scopes" role="group" aria-label="Booking scope">
        ${[
          ['upcoming', 'Upcoming'],
          ['today', 'Today'],
          ['past', 'Past & cancelled'],
          ['all', `All (${getReservations().length})`],
        ]
          .map(
            ([id, label]) =>
              `<button type="button" class="rsv-scope-btn ${adminFilters.scope === id ? 'is-active' : ''}" data-rsv-admin-scope="${id}">${label}</button>`,
          )
          .join('')}
      </div>
      <div class="rsv-dash-filters">
        <label class="rsv-dash-input">${icon('search')}
          <input type="search" placeholder="Name, reference, email, table…" value="${esc(adminFilters.query)}" data-rsv-admin-search>
        </label>
        <label class="rsv-dash-input">Status
          <select data-rsv-admin-status>
            <option value="all" ${adminFilters.status === 'all' ? 'selected' : ''}>All statuses</option>
            ${STATUS_OPTIONS.map((status) => `<option value="${status}" ${adminFilters.status === status ? 'selected' : ''}>${RESERVATION_STATUS_LABELS[status]}</option>`).join('')}
          </select>
        </label>
        <label class="rsv-dash-input">Date
          <input type="date" value="${esc(adminFilters.date)}" data-rsv-admin-date>
        </label>
        <button type="button" class="ios-action-btn secondary" data-rsv-admin-clear>${icon('x')}<span>Clear</span></button>
      </div>
    </div>

    ${
      list.length
        ? `<div class="rsv-dash-ledger ios-spring-enter">${list.map(renderAdminReservation).join('')}</div>`
        : `<div class="ios-card rsv-dash-empty ios-spring-enter">
            ${icon('calendar-days')}
            <h3>No reservations in this view</h3>
            <p>Adjust the filters, or create a booking from the public reservation page to see it here.</p>
            <a class="ios-action-btn primary" href="/pages/reservations.html" target="_blank" rel="noopener"><span>Open booking page</span> ${icon('arrow-up-right')}</a>
          </div>`
    }

    <div class="rsv-dash-footer-note">
      <span>${icon('shield-check')} ${stats.cancelled} cancelled · ${stats.tablesAvailable} tables on the floor</span>
      <div class="rsv-dash-tools">
        <button type="button" class="rsv-link-btn" data-rsv-admin-export>${icon('arrow-up-right')} Export JSON</button>
        <label class="rsv-link-btn rsv-file-label">${icon('plus')} Import JSON<input type="file" accept="application/json" data-rsv-admin-import hidden></label>
        <button type="button" class="rsv-link-btn" data-rsv-admin-delete-test>${icon('trash-2')} Delete demo records</button>
        <button type="button" class="rsv-link-btn" data-rsv-admin-reset>${icon('refresh-cw')} Reset demo data</button>
      </div>
    </div>
  `
}

function renderAdminReservation(reservation) {
  const order = getReservationMealOrder(reservation.id)
  const details = expandedReservation === reservation.id ? getReservationDetails(reservation.id) : null
  const tables = getTables()
  const paymentRequired = reservation.payment?.required
  return `
    <article class="rsv-dash-card ${expandedReservation === reservation.id ? 'is-expanded' : ''}">
      <div class="rsv-dash-card-head">
        <div class="rsv-dash-guest">
          <span class="rsv-status-pill status-${esc(reservation.status)}">${esc(RESERVATION_STATUS_LABELS[reservation.status] || reservation.status)}</span>
          <b>${esc(reservation.guest.name)}</b>
          <span>${esc(reservation.guest.email)}${reservation.guest.phone ? ` · ${esc(reservation.guest.phone)}` : ''} <em>${reservation.guestType === 'registered' ? 'Registered' : 'Guest'}</em></span>
        </div>
        <div class="rsv-dash-schedule">
          <b>${formatDateCompact(reservation.date)} · ${formatTime12(reservation.time)}</b>
          <span>${reservation.partySize} guests · ${esc(reservation.zoneName)} · ${esc(reservation.tableName || 'No table')}</span>
          <small>${esc(reservation.reference)} · booked ${relativeTimeLabel(new Date(reservation.createdAt).getTime())}</small>
        </div>
        <div class="rsv-dash-flags">
          <span class="rsv-kitchen-chip kitchen-${esc(reservation.kitchenStatus)}">${icon('flame')} ${esc(KITCHEN_STATUS_LABELS[reservation.kitchenStatus] || 'Queued')}</span>
          ${order?.itemCount ? `<span class="rsv-order-chip">${icon('utensils')} ${order.itemCount} pre-ordered</span>` : ''}
          ${paymentRequired ? `<span class="rsv-order-chip">${icon('dollar-sign')} ${esc(PAYMENT_STATUS_LABELS[reservation.payment.status] || 'Simulated deposit')}</span>` : ''}
        </div>
      </div>

      <div class="rsv-dash-controls-row">
        <label>Service status
          <select data-rsv-row-status="${reservation.id}">
            ${STATUS_OPTIONS.map((status) => `<option value="${status}" ${reservation.status === status ? 'selected' : ''}>${RESERVATION_STATUS_LABELS[status]}</option>`).join('')}
          </select>
        </label>
        <label>Assigned table
          <select data-rsv-row-table="${reservation.id}">
            <option value="">Unassigned</option>
            ${tables
              .map(
                (table) => `<option value="${table.id}" ${reservation.tableId === table.id ? 'selected' : ''} ${Number(table.seats) < reservation.partySize ? 'disabled' : ''}>${esc(table.name)} · ${esc(table.zone)} · ${table.seats} seats</option>`,
              )
              .join('')}
          </select>
        </label>
        <label>Meal prep
          <select data-rsv-row-kitchen="${reservation.id}">
            ${KITCHEN_OPTIONS.map((status) => `<option value="${status}" ${reservation.kitchenStatus === status ? 'selected' : ''}>${KITCHEN_STATUS_LABELS[status]}</option>`).join('')}
          </select>
        </label>
        ${paymentRequired
          ? `<label>Simulated payment
              <select data-rsv-row-payment="${reservation.id}">
                ${[PAYMENT_STATUS.simulated_due, PAYMENT_STATUS.simulated_paid, PAYMENT_STATUS.waived]
                  .map((status) => `<option value="${status}" ${reservation.payment.status === status ? 'selected' : ''}>${PAYMENT_STATUS_LABELS[status]}</option>`)
                  .join('')}
              </select>
            </label>`
          : ''}
        <div class="rsv-dash-row-actions">
          <button type="button" class="rsv-dash-icon-btn" data-rsv-admin-expand="${reservation.id}" aria-expanded="${expandedReservation === reservation.id}">${icon('chevron-down')} <span>${expandedReservation === reservation.id ? 'Hide' : 'Details'}</span></button>
          ${reservation.status !== RESERVATION_STATUS.cancelled ? `<button type="button" class="rsv-dash-icon-btn danger" data-rsv-admin-cancel="${reservation.id}">${icon('ban')} <span>Cancel</span></button>` : ''}
          <button type="button" class="rsv-dash-icon-btn danger" data-rsv-admin-delete="${reservation.id}" title="Permanently delete this record">${icon('trash-2')}</button>
        </div>
      </div>

      ${
        details
          ? `<div class="rsv-dash-expanded">
              <div class="rsv-dash-expanded-grid">
                <section>
                  <h4>${icon('utensils')} Pre-order</h4>
                  ${details.mealOrder?.items?.length
                    ? `<ul class="rsv-dash-menu">${details.mealOrder.items
                        .map((item) => `<li><span>${esc(item.name)} <small>×${item.qty}${item.notes ? ` · ${esc(item.notes)}` : ''}</small></span><span>${money(item.price * item.qty)}</span></li>`)
                        .join('')}</ul><div class="rsv-dash-total"><span>Subtotal</span><b>${money(details.mealOrder.subtotal)}</b></div>`
                    : `<p class="rsv-muted">No pre-order — ordering at the table.</p>`}
                  ${reservation.occasion || reservation.dietary || reservation.notes
                    ? `<div class="rsv-dash-requests">
                        ${reservation.occasion ? `<p><b>Occasion:</b> ${esc(reservation.occasion)}</p>` : ''}
                        ${reservation.dietary ? `<p><b>Dietary:</b> ${esc(reservation.dietary)}</p>` : ''}
                        ${reservation.notes ? `<p><b>Notes:</b> ${esc(reservation.notes)}</p>` : ''}
                      </div>`
                    : ''}
                </section>
                <section>
                  <h4>${icon('clock')} History</h4>
                  <ol class="rsv-dash-timeline">
                    ${(details.history || [])
                      .slice(0, 8)
                      .map(
                        (entry) => `<li><span></span><div><b>${esc(entry.summary || entry.action)}</b><small>${relativeTimeLabel(new Date(entry.createdAt).getTime())} · ${esc(entry.actor)}</small></div></li>`,
                      )
                      .join('') || '<li class="rsv-muted">No history yet.</li>'}
                  </ol>
                </section>
                <section>
                  <h4>${icon('bell')} In-app notifications</h4>
                  <ul class="rsv-dash-notifs">
                    ${(details.notifications || [])
                      .filter((notification) => notification.audience === 'admin')
                      .slice(0, 5)
                      .map(
                        (notification) => `<li class="${notification.read ? 'is-read' : ''}"><div><b>${esc(notification.title)}</b><p>${esc(notification.message)}</p><small>${esc(notification.audience)} · simulated</small></div></li>`,
                      )
                      .join('') || '<li class="rsv-muted">No notifications generated.</li>'}
                  </ul>
                </section>
              </div>
              <div class="rsv-dash-expanded-foot">
                <span>${icon('shield-check')} Payment: ${esc(reservation.payment?.label || 'not required')}</span>
                <a class="rsv-link-btn" href="/pages/reservation-confirmation.html?id=${encodeURIComponent(reservation.id)}&code=${encodeURIComponent(reservation.reference)}" target="_blank" rel="noopener">Guest confirmation view ${icon('arrow-up-right')}</a>
                <button type="button" class="rsv-link-btn" data-rsv-admin-repeat="${reservation.id}">${icon('rotate-ccw')} Repeat booking</button>
              </div>
            </div>`
          : ''
      }
    </article>
  `
}

/* -------------------------------------------------------------------------
   Admin: floor + availability configuration
   ------------------------------------------------------------------------- */

function renderAdminAvailability() {
  const settings = getSettings()
  const tables = getTables()
  const blockedDates = settings.blockedDates || []
  const blockedSlots = settings.blockedSlots || []
  return `
    <div class="rsv-dash-availability ios-spring-enter">
      <form class="ios-card rsv-dash-form" data-rsv-availability-form>
        <div class="rsv-dash-section-head">
          <div>
            <span class="card-kicker">BOOKING RULES</span>
            <h3>Service &amp; availability</h3>
            <p>These values drive the public availability engine immediately.</p>
          </div>
          <button type="submit" class="ios-action-btn primary">${icon('check')}<span>Save rules</span></button>
        </div>

        <div class="rsv-dash-hours">
          ${WEEKDAY_LONG.map((day, index) => {
            const hours = settings.openingHours?.[index]
            return `
              <div class="rsv-dash-hour-row">
                <b>${day}</b>
                <label class="rsv-dash-check"><input type="checkbox" name="closed_${index}" ${hours ? '' : 'checked'} data-rsv-day-closed="${index}"> Closed</label>
                <input type="time" name="open_${index}" value="${hours?.open || '17:30'}" ${hours ? '' : 'disabled'} data-rsv-day-open="${index}" aria-label="${day} opening time">
                <span>to</span>
                <input type="time" name="close_${index}" value="${hours?.close || '22:00'}" ${hours ? '' : 'disabled'} data-rsv-day-close="${index}" aria-label="${day} closing time">
              </div>
            `
          }).join('')}
        </div>

        <div class="rsv-dash-form-grid">
          ${[
            ['slotIntervalMinutes', 'Sitting interval (min)', settings.slotIntervalMinutes, 10, 120],
            ['reservationDurationMinutes', 'Table duration (min)', settings.reservationDurationMinutes, 30, 240],
            ['turnoverBufferMinutes', 'Turnover buffer (min)', settings.turnoverBufferMinutes, 0, 90],
            ['lastSeatingOffsetMinutes', 'Last seating before close (min)', settings.lastSeatingOffsetMinutes, 0, 240],
            ['leadTimeHours', 'Minimum lead time (hours)', settings.leadTimeHours, 0, 168],
            ['advanceBookingDays', 'Booking horizon (days)', settings.advanceBookingDays, 1, 365],
            ['minPartySize', 'Minimum party size', settings.minPartySize, 1, 20],
            ['maxPartySize', 'Maximum party size', settings.maxPartySize, 1, 40],
            ['depositPerGuest', 'Simulated deposit per guest ($)', settings.depositPerGuest, 0, 500],
          ]
            .map(
              ([name, label, value, min, max]) => `
                <label class="rsv-dash-field">${label}
                  <input type="number" name="${name}" value="${Number(value)}" min="${min}" max="${max}" step="${name === 'depositPerGuest' ? '1' : '1'}" required>
                </label>
              `,
            )
            .join('')}
        </div>

        <div class="rsv-dash-toggle-row">
          <label class="rsv-dash-check"><input type="checkbox" name="autoConfirm" ${settings.autoConfirm ? 'checked' : ''}> Confirm bookings automatically</label>
          <label class="rsv-dash-check"><input type="checkbox" name="allowGuestBookings" ${settings.allowGuestBookings ? 'checked' : ''}> Allow guest bookings</label>
          <label class="rsv-dash-check"><input type="checkbox" name="notificationsEnabled" ${settings.notificationsEnabled ? 'checked' : ''}> Generate in-app notifications</label>
        </div>

        <label class="rsv-dash-field">Guest note shown at checkout
          <textarea name="notesForGuests" rows="2" maxlength="400">${esc(settings.notesForGuests || '')}</textarea>
        </label>

        <p class="rsv-dash-warning">${icon('info')} Availability is simulated per browser. localStorage cannot prevent two devices booking the same table.</p>
      </form>

      <div class="rsv-dash-two-col">
        <form class="ios-card rsv-dash-form" data-rsv-block-date-form>
          <div class="rsv-dash-section-head">
            <div><span class="card-kicker">CLOSURES</span><h3>Blocked dates</h3></div>
          </div>
          <div class="rsv-dash-inline-form">
            <input type="date" name="date" min="${todayISO()}" required aria-label="Blocked date">
            <input type="text" name="reason" maxlength="120" placeholder="Reason (private event…)" aria-label="Reason for closure">
            <button type="submit" class="ios-action-btn primary">${icon('plus')}<span>Block</span></button>
          </div>
          <ul class="rsv-dash-block-list">
            ${blockedDates.length
              ? blockedDates
                  .map(
                    (entry) => {
                      const date = typeof entry === 'string' ? entry : entry.date
                      const reason = typeof entry === 'string' ? 'Closed' : entry.reason
                      return `<li><div><b>${formatDateLong(date)}</b><span>${esc(reason || 'Closed')}</span></div><button type="button" class="rsv-dash-icon-btn danger" data-rsv-unblock-date="${esc(date)}" aria-label="Unblock ${esc(date)}">${icon('x')}</button></li>`
                    },
                  )
                  .join('')
              : `<li class="rsv-muted">No blocked dates. Every open day follows the weekly hours.</li>`}
          </ul>
        </form>

        <form class="ios-card rsv-dash-form" data-rsv-block-slot-form>
          <div class="rsv-dash-section-head">
            <div><span class="card-kicker">SITTINGS</span><h3>Blocked time slots</h3></div>
          </div>
          <div class="rsv-dash-inline-form">
            <input type="date" name="date" min="${todayISO()}" required aria-label="Date for blocked sitting">
            <input type="time" name="time" required value="19:30" aria-label="Sitting time">
            <input type="text" name="reason" maxlength="120" placeholder="Reason" aria-label="Reason for blocked sitting">
            <button type="submit" class="ios-action-btn primary">${icon('plus')}<span>Block</span></button>
          </div>
          <ul class="rsv-dash-block-list">
            ${blockedSlots.length
              ? blockedSlots
                  .map(
                    (entry) => `<li><div><b>${formatDateCompact(entry.date)} · ${formatTime12(entry.time)}</b><span>${esc(entry.reason || 'Blocked')}</span></div><button type="button" class="rsv-dash-icon-btn danger" data-rsv-unblock-slot="${esc(entry.date)}|${esc(entry.time)}" aria-label="Unblock sitting">${icon('x')}</button></li>`,
                  )
                  .join('')
              : `<li class="rsv-muted">No individual sittings blocked.</li>`}
          </ul>
        </form>
      </div>

      <div class="ios-card rsv-dash-form">
        <div class="rsv-dash-section-head">
          <div>
            <span class="card-kicker">THE FLOOR</span>
            <h3>Tables &amp; capacity</h3>
            <p>Capacity changes feed availability and table assignment instantly.</p>
          </div>
          <button type="button" class="ios-action-btn secondary" data-rsv-add-table>${icon('plus')}<span>Add table</span></button>
        </div>
        <div class="rsv-dash-table-grid">
          ${tables
            .map(
              (table) => `
                <div class="rsv-dash-table-card" data-table-row="${table.id}">
                  <div class="rsv-dash-table-head">
                    <b>${esc(table.name)}</b>
                    <span>${esc(table.zone)}</span>
                  </div>
                  <label class="rsv-dash-field">Name<input type="text" name="name" value="${esc(table.name)}" maxlength="60"></label>
                  <label class="rsv-dash-field">Zone
                    <select name="zoneId">
                      ${zoneOptions().map((zone) => `<option value="${zone.id}" ${table.zoneId === zone.id ? 'selected' : ''}>${esc(zone.name)}</option>`).join('')}
                    </select>
                  </label>
                  <div class="rsv-dash-field-row">
                    <label class="rsv-dash-field">Seats<input type="number" name="seats" value="${Number(table.seats)}" min="1" max="40" required></label>
                    <label class="rsv-dash-field">Min<input type="number" name="minSeats" value="${Number(table.minSeats || 1)}" min="1" max="40" required></label>
                  </div>
                  <label class="rsv-dash-field">Floor status
                    <select name="status">
                      ${['open', 'reserved', 'seated', 'plating', 'clearing', 'out_of_service']
                        .map((status) => `<option value="${status}" ${table.status === status ? 'selected' : ''}>${status.replace('_', ' ')}</option>`)
                        .join('')}
                    </select>
                  </label>
                  <label class="rsv-dash-check"><input type="checkbox" name="reservable" ${table.reservable !== false ? 'checked' : ''}> Bookable online</label>
                  <div class="rsv-dash-table-actions">
                    <button type="button" class="ios-action-btn primary" data-rsv-save-table="${table.id}">${icon('check')}<span>Save</span></button>
                    <button type="button" class="rsv-dash-icon-btn danger" data-rsv-delete-table="${table.id}" aria-label="Delete ${esc(table.name)}">${icon('trash-2')}</button>
                  </div>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>

      <div class="ios-card rsv-dash-form">
        <div class="rsv-dash-section-head">
          <div><span class="card-kicker">DEMO DATA</span><h3>Prototype controls</h3><p>All reservation data lives in this browser. Resetting here keeps the Menu Studio catalogue intact.</p></div>
        </div>
        <div class="rsv-dash-tools">
          <button type="button" class="ios-action-btn secondary" data-rsv-admin-export>${icon('arrow-up-right')}<span>Export JSON</span></button>
          <label class="ios-action-btn secondary rsv-file-label">${icon('plus')}<span>Import JSON</span><input type="file" accept="application/json" data-rsv-admin-import hidden></label>
          <button type="button" class="ios-action-btn secondary" data-rsv-admin-delete-test>${icon('trash-2')}<span>Delete demo records</span></button>
          <button type="button" class="ios-action-btn secondary" data-rsv-admin-reset>${icon('refresh-cw')}<span>Reset demo data</span></button>
          <button type="button" class="ios-action-btn secondary" data-rsv-admin-clear-all>${icon('ban')}<span>Clear all local data</span></button>
        </div>
      </div>
    </div>
  `
}

/* -------------------------------------------------------------------------
   Admin binding
   ------------------------------------------------------------------------- */

export function bindAdminReservations(root, { show, toast }) {
  if (!root.querySelector('[data-rsv-admin-tab]')) return

  root.querySelectorAll('[data-rsv-admin-tab]').forEach((button) => {
    button.onclick = () => {
      setAdminReservationsTab(button.dataset.rsvAdminTab)
      show('reservations')
    }
  })

  root.querySelectorAll('[data-rsv-admin-scope]').forEach((button) => {
    button.onclick = () => {
      adminFilters.scope = button.dataset.rsvAdminScope
      show('reservations')
    }
  })

  root.querySelector('[data-rsv-admin-status]')?.addEventListener('change', (event) => {
    adminFilters.status = event.target.value
    show('reservations')
  })
  root.querySelector('[data-rsv-admin-date]')?.addEventListener('change', (event) => {
    adminFilters.date = event.target.value
    show('reservations')
  })
  const search = root.querySelector('[data-rsv-admin-search]')
  if (search) {
    let timer
    search.addEventListener('input', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        adminFilters.query = search.value.trim()
        show('reservations')
        const next = root.querySelector('[data-rsv-admin-search]')
        if (next) {
          next.focus()
          next.setSelectionRange(next.value.length, next.value.length)
        }
      }, 280)
    })
  }

  root.querySelector('[data-rsv-admin-clear]')?.addEventListener('click', () => {
    adminFilters = { date: '', status: 'all', query: '', scope: 'upcoming' }
    show('reservations')
  })

  root.querySelectorAll('[data-rsv-admin-expand]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.rsvAdminExpand
      expandedReservation = expandedReservation === id ? null : id
      show('reservations')
    }
  })

  root.querySelectorAll('[data-rsv-row-status]').forEach((select) => {
    select.onchange = () => {
      try {
        const result = setReservationStatus(select.dataset.rsvRowStatus, select.value, { actor: 'admin' })
        toast(`Status: ${RESERVATION_STATUS_LABELS[result.reservation.status]}.`, 'success')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not update the status.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-row-table]').forEach((select) => {
    select.onchange = () => {
      if (!select.value) return
      try {
        const result = assignTable(select.dataset.rsvRowTable, select.value, { actor: 'admin' })
        toast(`${result.reservation.tableName} assigned.`, 'success')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not assign that table.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-row-kitchen]').forEach((select) => {
    select.onchange = () => {
      try {
        setKitchenStatus(select.dataset.rsvRowKitchen, select.value, { actor: 'admin' })
        toast(`Kitchen: ${KITCHEN_STATUS_LABELS[select.value]}.`, 'flame')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not update meal prep.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-row-payment]').forEach((select) => {
    select.onchange = () => {
      try {
        setPaymentStatus(select.dataset.rsvRowPayment, select.value, { actor: 'admin' })
        toast('Simulated payment state updated. No real charge was made.', 'success')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not update payment state.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-admin-cancel]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.rsvAdminCancel
      if (!window.confirm('Cancel this reservation? The table will be released immediately.')) return
      try {
        cancelReservation(id, { actor: 'admin', reason: 'Cancelled by admin in the prototype' })
        toast('Reservation cancelled; availability updated.', 'success')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not cancel.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-admin-delete]').forEach((button) => {
    button.onclick = () => {
      if (!window.confirm('Permanently delete this reservation record? Use this for test records only.')) return
      try {
        deleteReservation(button.dataset.rsvAdminDelete, { actor: 'admin' })
        toast('Reservation record deleted.', 'info')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not delete.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-admin-repeat]').forEach((button) => {
    button.onclick = () => {
      try {
        const result = repeatReservation(button.dataset.rsvAdminRepeat, {}, { actor: 'admin' })
        toast(`Repeat booking ${result.reservation.reference} created.`, 'success')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'No repeat date available.', 'info')
      }
    }
  })

  // Availability configuration
  root.querySelectorAll('[data-rsv-day-closed]').forEach((checkbox) => {
    checkbox.onchange = () => {
      const day = checkbox.dataset.rsvDayClosed
      const open = root.querySelector(`[data-rsv-day-open="${day}"]`)
      const close = root.querySelector(`[data-rsv-day-close="${day}"]`)
      if (open) open.disabled = checkbox.checked
      if (close) close.disabled = checkbox.checked
    }
  })

  root.querySelector('[data-rsv-availability-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.currentTarget
    try {
      const openingHours = {}
      WEEKDAY_LONG.forEach((day, index) => {
        const closed = form.elements[`closed_${index}`]?.checked
        openingHours[index] = closed
          ? null
          : {
              open: form.elements[`open_${index}`]?.value || '17:30',
              close: form.elements[`close_${index}`]?.value || '22:00',
            }
      })
      const numeric = [
        'slotIntervalMinutes',
        'reservationDurationMinutes',
        'turnoverBufferMinutes',
        'lastSeatingOffsetMinutes',
        'leadTimeHours',
        'advanceBookingDays',
        'minPartySize',
        'maxPartySize',
        'depositPerGuest',
      ]
      const patch = { openingHours }
      numeric.forEach((key) => {
        if (form.elements[key]) patch[key] = Number(form.elements[key].value)
      })
      patch.autoConfirm = Boolean(form.elements.autoConfirm?.checked)
      patch.allowGuestBookings = Boolean(form.elements.allowGuestBookings?.checked)
      patch.notificationsEnabled = Boolean(form.elements.notificationsEnabled?.checked)
      patch.notesForGuests = form.elements.notesForGuests?.value || ''
      saveAvailabilitySettings(patch)
      toast('Availability rules saved. The booking page now reflects them.', 'success')
      show('reservations')
    } catch (error) {
      toast(error?.message || 'Could not save these rules.', 'info')
    }
  })

  root.querySelector('[data-rsv-block-date-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.currentTarget
    try {
      toggleBlockedDate(form.elements.date.value, form.elements.reason.value, true)
      toast('Date blocked — online availability updated.', 'success')
      show('reservations')
    } catch (error) {
      toast(error?.message || 'Could not block that date.', 'info')
    }
  })

  root.querySelector('[data-rsv-block-slot-form]')?.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.currentTarget
    try {
      toggleBlockedSlot(form.elements.date.value, form.elements.time.value, form.elements.reason.value, true)
      toast('Sitting blocked for that date.', 'success')
      show('reservations')
    } catch (error) {
      toast(error?.message || 'Could not block that sitting.', 'info')
    }
  })

  root.querySelectorAll('[data-rsv-unblock-date]').forEach((button) => {
    button.onclick = () => {
      toggleBlockedDate(button.dataset.rsvUnblockDate, '', false)
      toast('Date unblocked.', 'success')
      show('reservations')
    }
  })

  root.querySelectorAll('[data-rsv-unblock-slot]').forEach((button) => {
    button.onclick = () => {
      const [date, time] = String(button.dataset.rsvUnblockSlot).split('|')
      toggleBlockedSlot(date, time, '', false)
      toast('Sitting unblocked.', 'success')
      show('reservations')
    }
  })

  root.querySelectorAll('[data-rsv-save-table]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.rsvSaveTable
      const row = root.querySelector(`[data-table-row="${id}"]`)
      if (!row) return
      try {
        updateTableConfig(id, {
          name: row.querySelector('[name="name"]').value,
          zoneId: row.querySelector('[name="zoneId"]').value,
          seats: Number(row.querySelector('[name="seats"]').value),
          minSeats: Number(row.querySelector('[name="minSeats"]').value),
          status: row.querySelector('[name="status"]').value,
          reservable: row.querySelector('[name="reservable"]').checked,
        })
        toast('Table configuration saved.', 'success')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not save the table.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-delete-table]').forEach((button) => {
    button.onclick = () => {
      if (!window.confirm('Remove this table from the floor? Active bookings must be reassigned first.')) return
      try {
        deleteTable(button.dataset.rsvDeleteTable)
        toast('Table removed.', 'info')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'Could not remove the table.', 'info')
      }
    }
  })

  root.querySelector('[data-rsv-add-table]')?.addEventListener('click', () => {
    const zoneId = window.prompt('Zone for the new table: main, hearth, terrace or private', 'main')
    if (!zoneId) return
    const seats = Number(window.prompt('How many seats?', '2'))
    if (!Number.isFinite(seats) || seats < 1) {
      toast('Enter a valid number of seats.', 'info')
      return
    }
    try {
      addTable({ zoneId, seats })
      toast('Table added to the floor.', 'success')
      show('reservations')
    } catch (error) {
      toast(error?.message || 'Could not add the table.', 'info')
    }
  })

  // Demo data tools
  root.querySelectorAll('[data-rsv-admin-export]').forEach((button) => {
    button.onclick = () => {
      const snapshot = exportSnapshot()
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `flavoro-reservations-${todayISO()}.json`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast('Reservation data exported as JSON.', 'success')
    }
  })

  root.querySelectorAll('[data-rsv-admin-import]').forEach((input) => {
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const snapshot = JSON.parse(await file.text())
        importSnapshot(snapshot)
        toast('Snapshot imported into this browser.', 'success')
        show('reservations')
      } catch (error) {
        toast(error?.message || 'That file could not be imported.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-admin-delete-test]').forEach((button) => {
    button.onclick = () => {
      if (!window.confirm('Delete only the seeded demonstration reservations and customers? Real prototype bookings are kept.')) return
      const count = deleteSeededRecords()
      toast(`${count} demo reservation(s) removed.`, 'success')
      show('reservations')
    }
  })

  root.querySelectorAll('[data-rsv-admin-reset]').forEach((button) => {
    button.onclick = () => {
      if (!window.confirm('Reset reservation data to the seeded demo snapshot? This replaces current bookings, tables and settings, but keeps Menu Studio edits.')) return
      resetAllData()
      toast('Demo data reset.', 'success')
      show('reservations')
    }
  })

  root.querySelectorAll('[data-rsv-admin-clear-all]').forEach((button) => {
    button.onclick = () => {
      if (!window.confirm('Clear every reservation-system key from localStorage except the menu catalogue? The demo will reseed on reload.')) return
      clearAllData()
      toast('Local data cleared. Reloading…', 'info')
      setTimeout(() => location.reload(), 700)
    }
  })
}

/* =========================================================================
   CUSTOMER PANEL
   ========================================================================= */

export function renderCustomerReservationsPanel() {
  const customer = getCurrentCustomer()
  if (!customer) {
    return `
      <div class="dash-view-header ios-spring-enter">
        <div class="view-title-group">
          <div class="ios-capsule-badge">${icon('calendar-days')} RESERVATIONS &amp; HISTORY</div>
          <h1>Evenings at <em>Flavoro.</em></h1>
          <p>Sign in with the local demo account to keep bookings, menus and visit history together.</p>
        </div>
        <div class="view-header-actions">
          <a class="ios-action-btn primary" href="/pages/reservations.html"><span>Book a table</span> ${icon('arrow-up-right')}</a>
        </div>
      </div>
      <div class="ios-card rsv-dash-empty ios-spring-enter">
        ${icon('user-round')}
        <h3>No guest account in this session</h3>
        <p>Guest reservations still work and can be managed with a booking reference. Sign in or create a local account to see every visit here.</p>
        <div class="rsv-dash-empty-actions">
          <a class="ios-action-btn primary" href="/pages/login.html"><span>Sign in</span></a>
          <a class="ios-action-btn secondary" href="/pages/signup.html"><span>Create account</span></a>
        </div>
      </div>
    `
  }

  const reservations = getCustomerReservations(customer.id)
  const stats = getCustomerStats(customer.id)
  const upcoming = reservations
    .filter((reservation) => ['pending', 'confirmed', 'seated'].includes(reservation.status) && reservation.date >= todayISO())
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  const past = reservations
    .filter((reservation) => !upcoming.includes(reservation))
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
  const notifications = getDashboardNotifications('user', { customerId: customer.id, limit: 8 })
  const unread = notifications.filter((notification) => !notification.read).length

  return `
    <div class="dash-view-header ios-spring-enter">
      <div class="view-title-group">
        <div class="ios-capsule-badge">${icon('calendar-days')} RESERVATIONS &amp; HISTORY</div>
        <h1>Evenings at <em>Flavoro.</em></h1>
        <p>Upcoming tables, pre-orders, visit history and notifications for ${esc(customer.name)}.</p>
      </div>
      <div class="view-header-actions">
        <a class="ios-action-btn primary" href="/pages/reservations.html">${icon('plus')}<span>Book a table</span></a>
        <a class="ios-action-btn secondary" href="/pages/reservations.html#book">${icon('search')}<span>Find a booking</span></a>
      </div>
    </div>

    <div class="kpi-grid rsv-dash-stats ios-spring-enter">
      ${[
        ['UPCOMING', stats.upcoming, stats.nextVisit ? formatDateCompact(stats.nextVisit) : 'No table booked', 'calendar-days'],
        ['VISITS', stats.completed, `${stats.covers} covers enjoyed`, 'users'],
        ['BOOKINGS', stats.totalBookings, `${stats.cancelled} cancelled`, 'clipboard-list'],
        ['NOTIFICATIONS', unread, unread ? 'Unread in-app updates' : 'All caught up', 'bell'],
      ]
        .map(
          ([label, value, sub, ic]) => `
            <div class="ios-card kpi-card">
              <div class="kpi-head"><span class="kpi-label">${label}</span><div class="kpi-icon-bubble amber">${icon(ic)}</div></div>
              <div class="kpi-main"><span class="kpi-number">${value}</span></div>
              <span class="kpi-subtext">${esc(sub)}</span>
            </div>
          `,
        )
        .join('')}
    </div>

    <div class="rsv-dash-customer-grid ios-spring-enter">
      <section class="rsv-dash-block">
        <div class="rsv-dash-section-head">
          <div><span class="card-kicker">UPCOMING</span><h3>Your table</h3></div>
        </div>
        ${upcoming.length ? upcoming.map(renderCustomerCard).join('') : `<div class="rsv-dash-empty small">${icon('calendar-days')}<h3>No upcoming table</h3><p>Choose an evening and we will hold the table in this browser.</p><a class="ios-action-btn primary" href="/pages/reservations.html"><span>Book a table</span></a></div>`}
      </section>

      <aside class="rsv-dash-block">
        <div class="rsv-dash-section-head">
          <div><span class="card-kicker">IN-APP UPDATES</span><h3>Notifications</h3></div>
          ${unread ? `<button type="button" class="rsv-link-btn" data-rsv-customer-read-all>Mark all read</button>` : ''}
        </div>
        ${notifications.length
          ? `<ul class="rsv-dash-notifs">${notifications
              .map(
                (notification) => `<li class="${notification.read ? 'is-read' : ''}"><div><b>${esc(notification.title)}</b><p>${esc(notification.message)}</p><small>${relativeTimeLabel(new Date(notification.createdAt).getTime())} · in-app · simulated</small></div>${notification.read ? '' : `<button type="button" class="rsv-link-btn" data-rsv-customer-read="${notification.id}">Read</button>`}</li>`,
              )
              .join('')}</ul>`
          : `<p class="rsv-muted">No notifications yet. Confirming a table creates in-app updates only — no email or SMS is sent.</p>`}
      </aside>
    </div>

    <section class="rsv-dash-block rsv-dash-history ios-spring-enter">
      <div class="rsv-dash-section-head">
        <div><span class="card-kicker">HISTORY</span><h3>Past visits &amp; cancelled tables</h3><p>Repeat any evening as a brand-new reservation — previous records are never overwritten.</p></div>
      </div>
      ${past.length
        ? `<div class="rsv-dash-history-list">${past.map(renderCustomerHistoryRow).join('')}</div>`
        : `<p class="rsv-muted">No previous visits yet. Your first evening will appear here.</p>`}
    </section>
  `
}

function renderCustomerCard(reservation) {
  const order = getReservationMealOrder(reservation.id)
  const details = customerExpanded === reservation.id ? getReservationDetails(reservation.id) : null
  const canModify = ['pending', 'confirmed'].includes(reservation.status)
  return `
    <article class="rsv-dash-card is-customer ${customerExpanded === reservation.id ? 'is-expanded' : ''}">
      <div class="rsv-dash-card-head">
        <div class="rsv-dash-guest">
          <span class="rsv-status-pill status-${esc(reservation.status)}">${esc(RESERVATION_STATUS_LABELS[reservation.status] || reservation.status)}</span>
          <b>${formatDateLong(reservation.date)}</b>
          <span>${formatTime12(reservation.time)} · ${reservation.partySize} guests · ${esc(reservation.zoneName)}</span>
        </div>
        <div class="rsv-dash-schedule">
          <b>${esc(reservation.tableName || 'Table to be assigned')}</b>
          <span>${esc(reservation.experience)}</span>
          <small>${esc(reservation.reference)}</small>
        </div>
        <div class="rsv-dash-flags">
          <span class="rsv-kitchen-chip kitchen-${esc(reservation.kitchenStatus)}">${icon('flame')} ${esc(KITCHEN_STATUS_LABELS[reservation.kitchenStatus] || 'Queued')}</span>
          ${order?.itemCount ? `<span class="rsv-order-chip">${icon('utensils')} ${order.itemCount} pre-ordered · ${money(order.subtotal)}</span>` : ''}
        </div>
      </div>

      ${reservation.notes || reservation.dietary || reservation.occasion
        ? `<p class="rsv-dash-note">${icon('info')} ${esc([reservation.occasion, reservation.dietary, reservation.notes].filter(Boolean).join(' · '))}</p>`
        : ''}

      <div class="rsv-dash-customer-actions">
        ${canModify ? `<a class="ios-action-btn secondary" href="/pages/reservations.html?manage=${encodeURIComponent(reservation.id)}">${icon('pencil')}<span>Modify</span></a>` : ''}
        <a class="ios-action-btn secondary" href="/pages/reservations.html?repeat=${encodeURIComponent(reservation.id)}">${icon('rotate-ccw')}<span>Book again</span></a>
        <button type="button" class="ios-action-btn secondary" data-rsv-customer-expand="${reservation.id}">${icon('chevron-down')}<span>${customerExpanded === reservation.id ? 'Hide' : 'Menu & details'}</span></button>
        ${canModify ? `<button type="button" class="rsv-dash-icon-btn danger" data-rsv-customer-cancel="${reservation.id}">${icon('ban')}<span>Cancel</span></button>` : ''}
        <a class="rsv-link-btn" href="/pages/reservation-confirmation.html?id=${encodeURIComponent(reservation.id)}&code=${encodeURIComponent(reservation.reference)}">Confirmation ${icon('arrow-up-right')}</a>
      </div>

      ${details
        ? `<div class="rsv-dash-expanded">
            <div class="rsv-dash-expanded-grid">
              <section>
                <h4>${icon('utensils')} Pre-order</h4>
                ${details.mealOrder?.items?.length
                  ? `<ul class="rsv-dash-menu">${details.mealOrder.items.map((item) => `<li><span>${esc(item.name)} <small>×${item.qty}${item.notes ? ` · ${esc(item.notes)}` : ''}</small></span><span>${money(item.price * item.qty)}</span></li>`).join('')}</ul><div class="rsv-dash-total"><span>Subtotal</span><b>${money(details.mealOrder.subtotal)}</b></div>`
                  : `<p class="rsv-muted">No pre-order — ordering at the table.</p>`}
              </section>
              <section>
                <h4>${icon('clock')} Booking history</h4>
                <ol class="rsv-dash-timeline">${(details.history || []).slice(0, 6).map((entry) => `<li><span></span><div><b>${esc(entry.summary || entry.action)}</b><small>${relativeTimeLabel(new Date(entry.createdAt).getTime())}</small></div></li>`).join('')}</ol>
              </section>
              <section>
                <h4>${icon('shield-check')} Payment (simulated)</h4>
                <p class="rsv-muted">${esc(reservation.payment?.label || 'No deposit required.')}</p>
                <h4>${icon('bell')} Updates</h4>
                <ul class="rsv-dash-notifs">${(details.notifications || []).filter((notification) => notification.audience !== 'admin').slice(0, 4).map((notification) => `<li class="${notification.read ? 'is-read' : ''}"><div><b>${esc(notification.title)}</b><p>${esc(notification.message)}</p></div></li>`).join('') || '<li class="rsv-muted">No updates yet.</li>'}</ul>
              </section>
            </div>
          </div>`
        : ''}
    </article>
  `
}

function renderCustomerHistoryRow(reservation) {
  return `
    <div class="rsv-dash-history-row">
      <span class="rsv-status-pill status-${esc(reservation.status)}">${esc(RESERVATION_STATUS_LABELS[reservation.status] || reservation.status)}</span>
      <div><b>${formatDateCompact(reservation.date)} · ${formatTime12(reservation.time)}</b><span>${reservation.partySize} guests · ${esc(reservation.zoneName)} · ${esc(reservation.reference)}</span></div>
      <div class="rsv-dash-history-actions">
        <a class="rsv-link-btn" href="/pages/reservations.html?repeat=${encodeURIComponent(reservation.id)}">${icon('rotate-ccw')} Book again</a>
      </div>
    </div>
  `
}

export function bindCustomerReservations(root, { show, toast }) {
  if (!root.querySelector('[data-rsv-customer-expand]') && !root.querySelector('[data-rsv-customer-read]') && !root.querySelector('[data-rsv-customer-read-all]') && !root.querySelector('[data-rsv-customer-cancel]')) return
  const customer = getCurrentCustomer()

  root.querySelectorAll('[data-rsv-customer-expand]').forEach((button) => {
    button.onclick = () => {
      const id = button.dataset.rsvCustomerExpand
      customerExpanded = customerExpanded === id ? null : id
      show('activity')
    }
  })

  root.querySelectorAll('[data-rsv-customer-cancel]').forEach((button) => {
    button.onclick = () => {
      if (!window.confirm('Cancel this reservation and release the table?')) return
      try {
        cancelReservation(button.dataset.rsvCustomerCancel, { actor: 'customer', reason: 'Cancelled from the guest dashboard' })
        toast('Reservation cancelled. The table is available again.', 'success')
        show('activity')
      } catch (error) {
        toast(error?.message || 'Could not cancel this booking.', 'info')
      }
    }
  })

  root.querySelectorAll('[data-rsv-customer-read]').forEach((button) => {
    button.onclick = () => {
      markNotificationRead(button.dataset.rsvCustomerRead)
      show('activity')
    }
  })

  root.querySelector('[data-rsv-customer-read-all]')?.addEventListener('click', () => {
    if (!customer) return
    markAllNotificationsRead({ audience: 'customer', customerId: customer.id })
    markAllNotificationsRead({ audience: 'guest', customerId: customer.id })
    toast('All in-app notifications marked read.', 'success')
    show('activity')
  })
}

/* =========================================================================
   Overview + notification drawer helpers used by dashboard.js
   ========================================================================= */

export function getNextCustomerReservationView() {
  const customer = getCurrentCustomer()
  if (!customer) return null
  const [next] = getUpcomingReservations({ customerId: customer.id, limit: 1 })
  if (!next) return null
  return {
    id: next.id,
    reference: next.reference,
    date: formatDateLong(next.date),
    shortDate: formatDateCompact(next.date),
    time: formatTime12(next.time),
    guests: next.partySize,
    zone: next.zoneName,
    status: RESERVATION_STATUS_LABELS[next.status] || next.status,
    statusKey: next.status,
    experience: next.experience,
    notes: [next.occasion, next.dietary, next.notes].filter(Boolean).join(' · ') || 'No special requests recorded.',
    tableName: next.tableName,
  }
}

export function getCustomerBookingCount() {
  const customer = getCurrentCustomer()
  if (!customer) return 0
  return getCustomerStats(customer.id).upcoming
}

export function renderNotificationFeed(role) {
  const customer = role === 'admin' ? null : getCurrentCustomer()
  const notifications = getDashboardNotifications(role, { customerId: customer?.id, limit: 18 })
  if (!notifications.length) {
    return {
      html: `<div class="rsv-drawer-empty">${icon('bell')}<p>No in-app notifications yet.</p><small>Confirmations and status changes will appear here. Nothing is sent by email or SMS.</small></div>`,
      unread: 0,
    }
  }
  return {
    html: `
      <div class="rsv-drawer-head">
        <span>${notifications.length} in-app update${notifications.length === 1 ? '' : 's'}</span>
        <button type="button" class="rsv-link-btn" data-drawer-mark-read>Mark all read</button>
      </div>
      ${notifications
        .map(
          (notification) => `
            <button type="button" class="drawer-feed-item rsv-drawer-item ${notification.read ? 'is-read' : ''}" data-drawer-notification="${notification.id}">
              <div class="feed-icon-wrap"><i data-lucide="${esc(notification.icon || 'bell')}"></i></div>
              <div class="feed-copy">
                <p><b>${esc(notification.title)}</b> ${esc(notification.message)}</p>
                <span class="feed-time">${relativeTimeLabel(new Date(notification.createdAt).getTime())} · ${esc(notification.audience)} · simulated</span>
              </div>
              ${notification.read ? '' : '<span class="rsv-drawer-dot" aria-label="Unread"></span>'}
            </button>
          `,
        )
        .join('')}
    `,
    unread: getUnreadCount({ audience: role === 'admin' ? 'admin' : 'customer', customerId: customer?.id }) +
      (role === 'admin' ? 0 : getUnreadCount({ audience: 'guest', customerId: customer?.id })),
  }
}

export function markDrawerNotificationRead(notificationId) {
  markNotificationRead(notificationId)
}

export function markDrawerAllRead(role) {
  const customer = role === 'admin' ? null : getCurrentCustomer()
  if (role === 'admin') markAllNotificationsRead({ audience: 'admin' })
  else {
    markAllNotificationsRead({ audience: 'customer', customerId: customer?.id })
    markAllNotificationsRead({ audience: 'guest', customerId: customer?.id })
  }
}
