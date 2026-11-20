/**
 * Reservation status / confirmation page.
 *
 * Reads a reservation from the local data store (by id or reference + email)
 * and lets a guest review, modify, repeat or cancel it. All local-only.
 */

import './reservations.css'
import { initializeIcons } from './icons.js'
import { formatDateLong, formatTime12, relativeTimeLabel } from './data/datetime.js'
import {
  KITCHEN_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
  cancelReservation,
  getReservation,
  getReservationDetails,
  getReservationMealOrder,
  lookupReservation,
} from './data/reservations.js'
import { getSessionIdentity } from './data/customers.js'
import { isRememberedConfirmation, rememberConfirmation } from './data/confirmation-session.js'
import { isSignedIn } from './local-auth.js'

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])

const money = (value) => `$${Number(value || 0).toFixed(2)}`
const canModifyStatus = (status) => ['pending', 'confirmed', 'seated'].includes(status)

export function initReservationConfirmation() {
  const root = document.querySelector('#reservation-status-root')
  if (!root) return
  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const code = params.get('code')
  const identity = getSessionIdentity()
  const adminSession = isSignedIn('admin')
  // A bare id must never reveal booking details. It is only honoured for an
  // administrator session, the signed-in owner, or the booking just created in
  // this tab (one-time handoff written below).
  const canOpenById = (reservation) => {
    if (!reservation) return false
    if (adminSession) return true
    if (identity.registered && identity.customer && reservation.customerId === identity.customer.id) return true
    return isRememberedConfirmation(reservation.id)
  }

  let current = null
  if (id) {
    const candidate = getReservation(id)
    if (canOpenById(candidate)) current = candidate
  }
  let lookupError = ''
  let lookupReference = code || ''
  let lookupEmail = identity.registered ? identity.email : ''

  if (!current && code && identity.registered && identity.email) {
    const own = lookupReservation({ reference: code, email: identity.email })
    if (own.ok) current = own.reservation
  }

  function render() {
    // A reference in the URL only pre-fills the lookup form; the email must
    // still match before any booking details are shown.
    root.innerHTML = current
      ? renderStatus(current.id)
      : renderLookup(lookupError, lookupReference, lookupEmail)
    initializeIcons()

    root.querySelector('[data-status-lookup]')?.addEventListener('submit', (event) => {
      event.preventDefault()
      const form = event.currentTarget
      lookupReference = String(form.elements.reference.value || '')
      lookupEmail = String(form.elements.email.value || '')
      const result = lookupReservation({ reference: lookupReference, email: lookupEmail })
      if (!result.ok) {
        lookupError = result.reason
        render()
      } else {
        lookupError = ''
        current = result.reservation
        rememberConfirmation(current.id)
        render()
      }
    })

    root.querySelectorAll('[data-status-cancel]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!window.confirm('Cancel this reservation and release the table?')) return
        try {
          current = cancelReservation(button.dataset.statusCancel, {
            actor: identity.registered ? 'customer' : 'guest',
            reason: 'Cancelled from the confirmation page',
          }).reservation
          render()
        } catch (error) {
          window.alert(error?.message || 'Could not cancel the reservation.')
        }
      })
    })
  }

  function renderStatus(reservationId) {
    const details = getReservationDetails(reservationId)
    if (!details) return renderLookup('That reservation is no longer in this browser.', '', '')
    const reservation = details.reservation
    const order = details.mealOrder || getReservationMealOrder(reservation.id)
    const cancelled = reservation.status === 'cancelled'
    const modifyHref = `/pages/reservations.html?manage=${encodeURIComponent(reservation.id)}`
    const repeatHref = `/pages/reservations.html?repeat=${encodeURIComponent(reservation.id)}`
    return `
      <article class="rsv-status-card ${cancelled ? 'is-cancelled' : ''}">
        <div class="rsv-status-top">
          <div>
            <span class="rsv-kicker">Reservation status</span>
            <h2>${cancelled ? 'This table was <em>released.</em>' : 'Your evening, <em>confirmed.</em>'}</h2>
            <p class="rsv-muted">${reservation.guest.name} · booked in this browser ${relativeTimeLabel(new Date(reservation.createdAt).getTime())}</p>
          </div>
          <span class="rsv-status-pill status-${esc(reservation.status)}">${esc(RESERVATION_STATUS_LABELS[reservation.status] || reservation.status)}</span>
        </div>

        <div class="rsv-reference-block">
          <span>Reference</span><b>${esc(reservation.reference)}</b>
          <span class="rsv-mini-badge"><i data-lucide="shield-check"></i> Local prototype</span>
        </div>

        <div class="rsv-confirm-details">
          <div><i data-lucide="calendar-days"></i><span>Date</span><b>${formatDateLong(reservation.date)}</b></div>
          <div><i data-lucide="clock"></i><span>Time</span><b>${formatTime12(reservation.time)}</b></div>
          <div><i data-lucide="users"></i><span>Party</span><b>${reservation.partySize} guests</b></div>
          <div><i data-lucide="compass"></i><span>Room</span><b>${esc(reservation.zoneName)}</b></div>
          <div><i data-lucide="armchair"></i><span>Table</span><b>${esc(reservation.tableName || 'To be assigned')}</b></div>
          <div><i data-lucide="chef-hat"></i><span>Kitchen</span><b>${esc(KITCHEN_STATUS_LABELS[reservation.kitchenStatus] || 'Queued')}</b></div>
        </div>

        ${
          order?.items?.length
            ? `<section class="rsv-confirm-section">
                <h3><i data-lucide="utensils"></i> Pre-order</h3>
                <ul class="rsv-review-list">${order.items.map((item) => `<li><span>${esc(item.name)} <small>×${item.qty}${item.notes ? ` · ${esc(item.notes)}` : ''}</small></span><span>${money(item.price * item.qty)}</span></li>`).join('')}</ul>
                <div class="rsv-review-total"><span>Subtotal</span><b>${money(order.subtotal)}</b></div>
              </section>`
            : ''
        }

        ${
          reservation.notes || reservation.dietary || reservation.occasion
            ? `<section class="rsv-confirm-section">
                <h3><i data-lucide="info"></i> Requests on file</h3>
                ${reservation.occasion ? `<p class="rsv-muted"><b>Occasion:</b> ${esc(reservation.occasion)}</p>` : ''}
                ${reservation.dietary ? `<p class="rsv-muted"><b>Dietary:</b> ${esc(reservation.dietary)}</p>` : ''}
                ${reservation.notes ? `<p class="rsv-muted"><b>Notes:</b> ${esc(reservation.notes)}</p>` : ''}
              </section>`
            : ''
        }

        <section class="rsv-confirm-section">
          <h3><i data-lucide="shield-check"></i> Payment (simulated)</h3>
          <p class="rsv-muted">${esc(reservation.payment?.label || 'No deposit required for this booking.')}</p>
        </section>

        <section class="rsv-confirm-section">
          <h3><i data-lucide="bell"></i> In-app updates</h3>
          <ul class="rsv-notification-list">
            ${(details.notifications || [])
              .filter((notification) => notification.audience !== 'admin')
              .slice(0, 5)
              .map(
                (notification) => `<li class="${notification.read ? 'is-read' : ''}"><i data-lucide="${esc(notification.icon || 'bell')}"></i><div><b>${esc(notification.title)}</b><p>${esc(notification.message)}</p><small>in-app · simulated</small></div></li>`,
              )
              .join('') || '<li class="rsv-muted">No updates generated yet.</li>'}
          </ul>
        </section>

        <section class="rsv-confirm-section">
          <h3><i data-lucide="clock"></i> Booking history</h3>
          <ol class="rsv-dash-timeline">
            ${(details.history || [])
              .slice(0, 6)
              .map((entry) => `<li><span></span><div><b>${esc(entry.summary || entry.action)}</b><small>${relativeTimeLabel(new Date(entry.createdAt).getTime())} · ${esc(entry.actor)}</small></div></li>`)
              .join('') || '<li class="rsv-muted">No history yet.</li>'}
          </ol>
        </section>

        <div class="rsv-confirm-actions">
          ${canModifyStatus(reservation.status) ? `<a class="rsv-btn rsv-btn-primary" href="${modifyHref}"><i data-lucide="pencil"></i> Modify booking</a>` : ''}
          <a class="rsv-btn rsv-btn-ghost" href="${repeatHref}"><i data-lucide="rotate-ccw"></i> Book again</a>
          ${canModifyStatus(reservation.status) ? `<button type="button" class="rsv-btn rsv-btn-danger" data-status-cancel="${reservation.id}"><i data-lucide="ban"></i> Cancel booking</button>` : ''}
          <a class="rsv-btn rsv-btn-quiet" href="/pages/reservations.html#book">Back to reservations <i data-lucide="arrow-up-right"></i></a>
        </div>

        <p class="rsv-disclaimer"><i data-lucide="info"></i> This page reads the booking stored in this browser’s localStorage. It is not connected to a live restaurant system; no email or payment is involved.</p>
      </article>
    `
  }

  function renderLookup(error, reference, email) {
    return `
      <div class="rsv-status-lookup">
        <span class="rsv-kicker">Find your booking</span>
        <h2>Look up a <em>reservation.</em></h2>
        <p class="rsv-muted">Enter the booking reference and the email used to book. This works only in the browser where the reservation was made.</p>
        <form data-status-lookup class="rsv-status-form">
          <label>Booking reference
            <input type="text" name="reference" required maxlength="40" value="${esc(reference)}" placeholder="FLV-7K2M9Q" autocomplete="off">
          </label>
          <label>Email address
            <input type="email" name="email" required maxlength="120" value="${esc(email)}" placeholder="you@example.com" autocomplete="email">
          </label>
          <button type="submit" class="rsv-btn rsv-btn-primary"><i data-lucide="search"></i> Find booking</button>
        </form>
        ${error ? `<p class="rsv-lookup-error" role="alert">${esc(error)}</p>` : ''}
        <div class="rsv-status-fallback">
          <a class="rsv-btn rsv-btn-ghost" href="/pages/reservations.html#book">Book a new table <i data-lucide="arrow-up-right"></i></a>
          <a class="rsv-link-btn" href="/pages/user-dashboard.html">Open the guest dashboard <i data-lucide="arrow-up-right"></i></a>
        </div>
      </div>
    `
  }

  render()
}
