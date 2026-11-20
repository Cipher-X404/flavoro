/**
 * Public reservation experience: six-step booking wizard, guest lookup,
 * modification, cancellation and repeat visits.
 *
 * This module is intentionally UI-only. Availability math lives in
 * `data/availability.js`; booking rules in `data/reservations.js`; persistence
 * in `data/store.js`. Swap those for an API later and this screen still works.
 */

import './reservations.css'
import { initializeIcons } from './icons.js'
import {
  addDays,
  formatDateCompact,
  formatDateLong,
  formatTime12,
  todayISO,
} from './data/datetime.js'
import {
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  KITCHEN_STATUS_LABELS,
  cancelReservation,
  createReservation,
  getReservation,
  getReservationDetails,
  getReservationMealOrder,
  getReservationNotifications,
  lookupReservation,
  repeatReservation,
  updateReservation,
} from './data/reservations.js'
import {
  evaluateAvailability,
  getAvailabilityCalendar,
  getFirstAvailableSlot,
  getSlotsForDate,
  getZone,
  zoneOptions,
} from './data/availability.js'
import { getMenuItems, getSettings } from './data/store.js'
import {
  ensureCurrentCustomer,
  getCurrentCustomer,
  getCustomerReservations,
  getSessionIdentity,
  isAdminSession,
  normalizeEmail,
} from './data/customers.js'
import { isRememberedConfirmation, rememberConfirmation } from './data/confirmation-session.js'
import { markNotificationRead } from './data/notifications.js'

const STEPS = [
  { n: 1, label: 'Party & date' },
  { n: 2, label: 'Sitting time' },
  { n: 3, label: 'Pre-order' },
  { n: 4, label: 'Your details' },
  { n: 5, label: 'Review' },
  { n: 6, label: 'Confirmed' },
]

const MENU_TABS = [
  { id: 'dinner', label: 'Evening' },
  { id: 'lunch', label: 'Midday' },
  { id: 'breakfast', label: 'Morning' },
  { id: 'drinks', label: 'Cellar & drinks' },
  { id: 'all', label: 'Everything' },
]

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

function createRequestId() {
  try {
    return `req_${crypto.randomUUID()}`
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }
}

function emptyDraft() {
  return {
    partySize: 2,
    zoneId: 'main',
    date: '',
    time: '',
    items: {},
    itemNotes: {},
    name: '',
    email: '',
    phone: '',
    occasion: '',
    notes: '',
    dietary: '',
    guestType: 'guest',
  }
}

function initReservationFeatures() {
  const root = document.querySelector('#reservation-wizard-root')
  if (!root) return

  const lookupRoot = document.querySelector('#reservation-lookup-root')
  const identity = getSessionIdentity()
  if (identity.registered) ensureCurrentCustomer()

  const state = {
    step: 1,
    mode: 'create',
    sourceId: null,
    requestId: createRequestId(),
    draft: emptyDraft(),
    items: {},
    result: null,
    error: '',
    errorReasons: [],
    alternatives: [],
    submitting: false,
    maxStep: 1,
    menuFilter: 'dinner',
    lookup: { reference: '', email: '', error: '', result: null },
    isRepeat: false,
    manageNotice: '',
    registeredSession: Boolean(identity.registered),
  }

  const settings = getSettings()
  const customer = identity.registered ? getCurrentCustomer() : null

  if (identity.registered) {
    state.draft.name = customer?.name || identity.name || ''
    state.draft.email = customer?.email || identity.email || ''
    state.draft.phone = customer?.phone || identity.phone || ''
    state.draft.guestType = 'registered'
  }

  applyUrlPrefill(state, settings)
  applyDefaultAvailability(state, settings)

  function refreshIcons() {
    initializeIcons()
  }

  function render({ focusTitle = false } = {}) {
    root.innerHTML = renderShell(state, settings)
    if (lookupRoot) lookupRoot.innerHTML = renderLookup(state, identity)
    refreshIcons()
    if (focusTitle) {
      requestAnimationFrame(() => {
        const title = root.querySelector('[data-rsv-title]')
        title?.focus({ preventScroll: false })
      })
    }
  }

  function renderAll() {
    render({ focusTitle: true })
  }

  function goTo(step) {
    state.step = Math.min(6, Math.max(1, step))
    state.maxStep = Math.max(state.maxStep, state.step)
    state.error = ''
    state.errorReasons = []
    renderAll()
  }

  function next() {
    const error = validateStep(state, settings)
    if (error) {
      state.error = error
      renderAll()
      return
    }
    state.error = ''
    if (state.step === 5) {
      submit()
      return
    }
    goTo(state.step + 1)
  }

  function back() {
    if (state.step <= 1) return
    state.error = ''
    state.step -= 1
    renderAll()
  }

  function chooseDate(date) {
    if (!date) return
    const probe = getSlotsForDate(date, {
      partySize: state.draft.partySize,
      zoneId: state.draft.zoneId,
      excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
    })
    if (!probe.open || !probe.availableCount) {
      state.error = probe.reason || 'No tables are open on that date. Try another evening.'
      renderAll()
      return
    }
    state.draft.date = date
    const day = probe
    if (state.draft.time) {
      const stillOpen = day.slots.find((slot) => slot.time === state.draft.time && slot.available)
      if (!stillOpen) state.draft.time = ''
    }
    state.error = ''
    renderAll()
  }

  function chooseTime(time) {
    state.draft.time = time
    state.error = ''
    renderAll()
  }

  function setParty(partySize) {
    state.draft.partySize = Number(partySize)
    if (state.draft.time) {
      const day = getSlotsForDate(state.draft.date, {
        partySize: state.draft.partySize,
        zoneId: state.draft.zoneId,
        excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
      })
      if (!day.slots.some((slot) => slot.time === state.draft.time && slot.available)) state.draft.time = ''
    }
    state.error = ''
    renderAll()
  }

  function setZone(zoneId) {
    const zone = getZone(zoneId)
    if (!zone) return
    if (state.draft.partySize < zone.minPartySize || state.draft.partySize > zone.maxPartySize) {
      state.error = `${zone.name} seats ${zone.minPartySize}–${zone.maxPartySize} guests. Choose a different party size or room.`
      renderAll()
      return
    }
    state.draft.zoneId = zoneId
    if (state.draft.time) {
      const day = getSlotsForDate(state.draft.date, {
        partySize: state.draft.partySize,
        zoneId: state.draft.zoneId,
        excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
      })
      if (!day.slots.some((slot) => slot.time === state.draft.time && slot.available)) state.draft.time = ''
    }
    state.error = ''
    renderAll()
  }

  function changeItemQty(menuItemId, delta) {
    const current = Number(state.draft.items[menuItemId] || 0)
    const nextQty = Math.max(0, Math.min(20, current + Number(delta)))
    if (nextQty <= 0) {
      delete state.draft.items[menuItemId]
      delete state.draft.itemNotes[menuItemId]
    } else {
      state.draft.items[menuItemId] = nextQty
    }
    renderAll()
  }

  function clearMenu() {
    state.draft.items = {}
    state.draft.itemNotes = {}
    renderAll()
  }

  function syncDraftFromField(field, value) {
    if (field === 'name') state.draft.name = value
    if (field === 'email') state.draft.email = value
    if (field === 'phone') state.draft.phone = value
    if (field === 'occasion') state.draft.occasion = value
    if (field === 'notes') state.draft.notes = value
    if (field === 'dietary') state.draft.dietary = value
    if (field === 'guestType') state.draft.guestType = value
    if (field === 'itemNote') {
      const [id, note] = value.split('||')
      if (id) state.draft.itemNotes[id] = note
    }
  }

  async function submit() {
    if (state.submitting) return
    const error = validateStep(state, settings)
    if (error) {
      state.error = error
      renderAll()
      return
    }
    state.submitting = true
    state.error = ''
    state.errorReasons = []
    state.alternatives = []
    render()

    const items = buildItemPayload(state)
    const guest = {
      name: state.draft.name.trim(),
      email: state.draft.email.trim(),
      phone: state.draft.phone.trim(),
      type: state.draft.guestType === 'registered' ? 'registered' : 'guest',
    }

    try {
      let reservation
      const wasModify = state.mode === 'modify'
      if (wasModify) {
        const result = updateReservation(
          state.sourceId,
          {
            date: state.draft.date,
            time: state.draft.time,
            partySize: state.draft.partySize,
            zoneId: state.draft.zoneId,
            guest,
            occasion: state.draft.occasion,
            notes: state.draft.notes,
            dietary: state.draft.dietary,
            items,
          },
          { actor: identity.registered ? 'customer' : 'guest' },
        )
        reservation = result.reservation
      } else {
        const result = createReservation(
          {
            guest,
            guestType: state.draft.guestType,
            customerId: identity.registered ? customer?.id : undefined,
            date: state.draft.date,
            time: state.draft.time,
            partySize: state.draft.partySize,
            zoneId: state.draft.zoneId,
            items,
            occasion: state.draft.occasion,
            notes: state.draft.notes,
            dietary: state.draft.dietary,
            clientRequestId: state.requestId,
            source: state.sourceId ? 'repeat' : 'website',
            repeatedFrom: state.sourceId || null,
          },
          { actor: identity.registered ? 'customer' : 'guest' },
        )
        reservation = result.reservation
        state.isRepeat = Boolean(state.sourceId)
      }
      state.result = reservation
      rememberConfirmation(reservation.id)
      state.wasUpdate = wasModify
      state.mode = 'created'
      state.step = 6
      state.maxStep = 6
      state.submitting = false
      showToast(
        state.isRepeat ? 'New repeat visit created.' : 'Reservation saved in this browser.',
        'success',
      )
      renderAll()
      if (lookupRoot) lookupRoot.innerHTML = renderLookup(state, identity)
      refreshIcons()
    } catch (errorCaught) {
      state.error = errorCaught?.message || 'The reservation could not be saved.'
      state.errorReasons = errorCaught?.reasons || []
      state.alternatives = errorCaught?.alternatives || []
      state.submitting = false
      renderAll()
      const alert = root.querySelector('[data-rsv-alert]')
      alert?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function markRead(notificationId) {
    markNotificationRead(notificationId)
    renderAll()
  }

  function autoRepeat() {
    if (!state.result || state.submitting) return
    state.submitting = true
    try {
      const result = repeatReservation(state.result.id, {}, { actor: identity.registered ? 'customer' : 'guest' })
      state.result = result.reservation
      rememberConfirmation(result.reservation.id)
      state.isRepeat = true
      state.wasUpdate = false
      state.step = 6
      showToast('Repeat visit created as a new booking. The original is untouched.', 'success')
    } catch (error) {
      state.error = error?.message || 'No repeat date is available.'
      showToast(state.error, 'error')
    } finally {
      state.submitting = false
      renderAll()
    }
  }

  function bookAnother() {
    const previous = state.result
    const details = previous ? getReservationDetails(previous.id) : null
    const newDraft = emptyDraft()
    if (previous) {
      newDraft.partySize = previous.partySize
      newDraft.zoneId = previous.zoneId
      newDraft.name = previous.guest.name
      newDraft.email = previous.guest.email
      newDraft.phone = previous.guest.phone
      newDraft.guestType = previous.guestType
    }
    if (details?.mealOrder?.items?.length) {
      details.mealOrder.items.forEach((item) => {
        newDraft.items[item.menuItemId] = item.qty
        if (item.notes) newDraft.itemNotes[item.menuItemId] = item.notes
      })
    }
    state.draft = newDraft
    state.requestId = createRequestId()
    state.result = null
    state.step = 1
    state.mode = 'create'
    state.sourceId = null
    state.isRepeat = false
    state.wasUpdate = false
    state.error = ''
    state.maxStep = 1
    applyDefaultAvailability(state, settings)
    renderAll()
    scrollToRoot(root)
  }

  function loadForManage(reservation) {
    if (!reservation) return
    if (!canAccessReservation(reservation, identity)) {
      state.lookup.error = 'This booking belongs to a different account in this browser.'
      renderAll()
      return
    }
    state.mode = 'modify'
    state.sourceId = reservation.id
    state.result = null
    state.requestId = createRequestId()
    state.draft = draftFromReservation(reservation)
    state.step = 1
    state.maxStep = 1
    state.error = ''
    state.manageNotice = canModifyStatus(reservation.status)
      ? `Modifying ${reservation.reference} — changes replace the stored booking.`
      : `This booking is ${RESERVATION_STATUS_LABELS[reservation.status].toLowerCase()} and cannot be changed. You can book a new visit instead.`
    state.lookup.result = null
    renderAll()
    scrollToRoot(root)
  }

  function cancelCurrent(reservation) {
    if (!reservation) return
    openConfirm({
      title: 'Cancel this reservation?',
      message: `Reference ${reservation.reference} · ${formatDateCompact(reservation.date)} at ${formatTime12(reservation.time)}. The table will be released immediately. This cannot be undone.`,
      confirmLabel: 'Cancel reservation',
      danger: true,
      onConfirm: () => {
        try {
          const result = cancelReservation(reservation.id, {
            actor: identity.registered ? 'customer' : 'guest',
            reason: 'Cancelled from the reservation page',
          })
          if (state.result?.id === reservation.id) state.result = result.reservation
          if (state.lookup.result?.id === reservation.id) state.lookup.result = result.reservation
          rememberConfirmation(result.reservation.id)
          showToast('Reservation cancelled and the table released.', 'success')
        } catch (error) {
          showToast(error?.message || 'Could not cancel the reservation.', 'error')
        }
        state.step = state.mode === 'modify' ? 1 : state.step
        renderAll()
      },
    })
  }

  function repeatFromLookup(reservation) {
    if (!reservation) return
    try {
      const result = repeatReservation(reservation.id, {}, { actor: identity.registered ? 'customer' : 'guest' })
      state.result = result.reservation
      rememberConfirmation(result.reservation.id)
      state.mode = 'created'
      state.step = 6
      state.maxStep = 6
      state.isRepeat = true
      state.wasUpdate = false
      state.lookup.result = null
      showToast('Repeat visit created as a new booking.', 'success')
      renderAll()
      scrollToRoot(root)
    } catch (error) {
      showToast(error?.message || 'No repeat date is available.', 'error')
    }
  }

  function handleLookupSubmit(form) {
    const data = new FormData(form)
    state.lookup.reference = String(data.get('reference') || '').trim()
    state.lookup.email = String(data.get('email') || '').trim()
    const result = lookupReservation({ reference: state.lookup.reference, email: state.lookup.email })
    if (!result.ok) {
      state.lookup.result = null
      state.lookup.error = result.reason
    } else {
      state.lookup.error = ''
      state.lookup.result = result.reservation
    }
    if (lookupRoot) lookupRoot.innerHTML = renderLookup(state, identity)
    refreshIcons()
  }

  /* -----------------------------------------------------------------------
     Event delegation
     ----------------------------------------------------------------------- */

  root.addEventListener('click', (event) => {
    const target = event.target.closest('[data-rsv-action]')
    if (!target) return
    const action = target.dataset.rsvAction
    if (action === 'next') {
      event.preventDefault()
      next()
    } else if (action === 'back') {
      event.preventDefault()
      back()
    } else if (action === 'step') {
      const step = Number(target.dataset.step)
      if (step >= 1 && step < state.step) goTo(step)
    } else if (action === 'party') {
      setParty(Number(target.dataset.party))
    } else if (action === 'zone') {
      setZone(target.dataset.zone)
    } else if (action === 'date') {
      chooseDate(target.dataset.date)
    } else if (action === 'time') {
      if (!target.disabled) chooseTime(target.dataset.time)
    } else if (action === 'menu-tab') {
      state.menuFilter = target.dataset.filter
      renderAll()
    } else if (action === 'dish-plus') {
      changeItemQty(target.dataset.dish, 1)
    } else if (action === 'dish-minus') {
      changeItemQty(target.dataset.dish, -1)
    } else if (action === 'clear-menu') {
      clearMenu()
    } else if (action === 'confirm') {
      submit()
    } else if (action === 'mark-read') {
      markRead(target.dataset.notification)
    } else if (action === 'auto-repeat') {
      autoRepeat()
    } else if (action === 'book-another') {
      bookAnother()
    } else if (action === 'manage-result') {
      const reservation = state.result ? getReservation(state.result.id) : null
      loadForManage(reservation)
    } else if (action === 'cancel-result') {
      const reservation = state.result ? getReservation(state.result.id) : null
      cancelCurrent(reservation)
    } else if (action === 'suggestion') {
      state.draft.date = target.dataset.date
      state.draft.time = target.dataset.time
      state.error = ''
      goTo(2)
    }
  })

  root.addEventListener('change', (event) => {
    const field = event.target.closest('[data-rsv-field]')
    if (field) {
      if (field.dataset.rsvField === 'itemNote') {
        const id = field.dataset.dish
        state.draft.itemNotes[id] = field.value
        return
      }
      if (field.dataset.rsvField === 'guestType') {
        if (field.value === 'registered' && !state.registeredSession) {
          showToast('Sign in first to book as a registered guest. Continuing as a guest.', 'info')
          state.draft.guestType = 'guest'
        } else {
          state.draft.guestType = field.value
        }
        renderAll()
        return
      }
      syncDraftFromField(field.dataset.rsvField, field.value)
      return
    }
    const datePicker = event.target.closest('[data-rsv-date-picker]')
    if (datePicker) {
      const value = datePicker.value
      if (value) chooseDate(value)
      return
    }
  })

  root.addEventListener('input', (event) => {
    const field = event.target.closest('[data-rsv-field]')
    if (!field) return
    if (field.dataset.rsvField === 'itemNote') {
      const id = field.dataset.dish
      state.draft.itemNotes[id] = field.value
      return
    }
    syncDraftFromField(field.dataset.rsvField, field.value)
  })

  root.addEventListener('submit', (event) => {
    event.preventDefault()
    const form = event.target.closest('[data-rsv-lookup-form]')
    if (form) handleLookupSubmit(form)
  })

  if (lookupRoot) {
    lookupRoot.addEventListener('click', (event) => {
      const target = event.target.closest('[data-rsv-action]')
      if (!target) return
      const action = target.dataset.rsvAction
      if (action === 'lookup-manage') {
        const reservation = getReservation(target.dataset.id)
        loadForManage(reservation)
      } else if (action === 'lookup-repeat') {
        repeatFromLookup(getReservation(target.dataset.id))
      } else if (action === 'lookup-cancel') {
        cancelCurrent(getReservation(target.dataset.id))
      } else if (action === 'clear-lookup') {
        state.lookup = { reference: '', email: '', error: '', result: null }
        lookupRoot.innerHTML = renderLookup(state, identity)
        refreshIcons()
      }
    })
    lookupRoot.addEventListener('submit', (event) => {
      event.preventDefault()
      const form = event.target.closest('[data-rsv-lookup-form]')
      if (form) handleLookupSubmit(form)
    })
  }

  render()
  refreshIcons()
}

/* -------------------------------------------------------------------------
   URL prefill + defaults
   ------------------------------------------------------------------------- */

function applyUrlPrefill(state, settings) {
  const params = new URLSearchParams(location.search)
  const identity = getSessionIdentity()
  const canOpenBooking = (reservation) =>
    Boolean(reservation) &&
    (isAdminSession() ||
      (identity.registered && identity.customer?.id === reservation.customerId) ||
      isRememberedConfirmation(reservation.id))
  const party = Number(params.get('party'))
  if (Number.isInteger(party) && party >= 1 && party <= settings.maxPartySize) state.draft.partySize = party
  const zone = params.get('zone')
  if (zone && getZone(zone)) state.draft.zoneId = zone
  const date = params.get('date')
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) state.draft.date = date

  const experience = params.get('experience')
  if (experience === 'tasting') state.draft.items = { 'tasting-7-course': state.draft.partySize }
  if (experience === 'feasting') state.draft.items = { 'hearthside-feast': state.draft.partySize }
  if (experience === 'alacarte') state.menuFilter = 'dinner'

  const itemName = params.get('item')
  if (itemName) {
    const dish = getMenuItems().find(
      (menuItem) => menuItem.name.toLowerCase() === itemName.toLowerCase(),
    )
    if (dish) {
      state.draft.items = { ...state.draft.items, [dish.id]: 1 }
      state.menuFilter = dish.category
    }
  }

  const manageId = params.get('manage')
  if (manageId) {
    const reservation = getReservation(manageId)
    if (reservation && canOpenBooking(reservation)) {
      state.mode = 'modify'
      state.sourceId = reservation.id
      state.draft = draftFromReservation(reservation)
      state.manageNotice = canModifyStatus(reservation.status)
        ? `Modifying ${reservation.reference} — changes replace the stored booking.`
        : `Reservation ${reservation.reference} is ${RESERVATION_STATUS_LABELS[reservation.status].toLowerCase()} and cannot be changed. You can repeat the visit instead.`
    } else if (reservation) {
      state.manageNotice = 'For privacy, open this booking from its confirmation page or sign in with the booking email to modify it.'
    } else {
      state.manageNotice = 'That reservation could not be found in this browser.'
    }
  }

  const repeatId = params.get('repeat')
  if (repeatId) {
    const reservation = getReservation(repeatId)
    if (reservation && canOpenBooking(reservation)) {
      state.mode = 'create'
      state.sourceId = reservation.id
      state.draft = draftFromReservation(reservation)
      state.draft.date = ''
      state.draft.time = ''
      state.manageNotice = `Repeating ${reservation.reference} — choose a new date and time. The original booking stays untouched.`
      state.isRepeat = true
    } else if (reservation) {
      state.manageNotice = 'For privacy, open this booking from its confirmation page or sign in with the booking email to repeat it.'
    }
  }
}

function applyDefaultAvailability(state, settings) {
  // Keep the stored schedule of a booking being modified, even if service
  // rules have since closed that date. Validation will explain the problem and
  // the guest can deliberately choose a new date rather than losing the old one.
  if (state.mode === 'modify' && state.draft.date && state.draft.time) return
  if (state.draft.date) {
    const day = getSlotsForDate(state.draft.date, {
      partySize: state.draft.partySize,
      zoneId: state.draft.zoneId,
      excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
    })
    if (!day.open) state.draft.date = ''
  }
  if (!state.draft.date) {
    const firstSlot = getFirstAvailableSlot({
      partySize: state.draft.partySize,
      zoneId: state.draft.zoneId,
      settings,
    })
    if (firstSlot) {
      state.draft.date = firstSlot.date
      if (!state.draft.time) state.draft.time = firstSlot.time
    } else {
      state.draft.date = todayISO()
    }
  }
  if (!state.draft.time) {
    const day = getSlotsForDate(state.draft.date, {
      partySize: state.draft.partySize,
      zoneId: state.draft.zoneId,
      excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
    })
    const openSlot = day.slots?.find((slot) => slot.available)
    if (openSlot) state.draft.time = openSlot.time
  }
  if (state.draft.time) {
    const check = evaluateAvailability({
      date: state.draft.date,
      time: state.draft.time,
      partySize: state.draft.partySize,
      zoneId: state.draft.zoneId,
      excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
    })
    if (!check.ok) state.draft.time = ''
  }
}

function draftFromReservation(reservation) {
  const order = getReservationMealOrder(reservation.id)
  const items = {}
  const itemNotes = {}
  ;(order?.items || []).forEach((item) => {
    items[item.menuItemId] = item.qty
    if (item.notes) itemNotes[item.menuItemId] = item.notes
  })
  return {
    partySize: reservation.partySize,
    zoneId: reservation.zoneId,
    date: reservation.date,
    time: reservation.time,
    items,
    itemNotes,
    name: reservation.guest?.name || '',
    email: reservation.guest?.email || '',
    phone: reservation.guest?.phone || '',
    occasion: reservation.occasion || '',
    notes: reservation.notes || '',
    dietary: reservation.dietary || '',
    guestType: reservation.guestType || 'guest',
  }
}

function buildItemPayload(state) {
  return Object.entries(state.draft.items)
    .filter(([, qty]) => Number(qty) > 0)
    .map(([menuItemId, qty]) => ({
      menuItemId,
      qty: Number(qty),
      notes: state.draft.itemNotes[menuItemId] || '',
    }))
}

function canAccessReservation(reservation, identity) {
  if (!reservation) return false
  if (!identity.registered) return true
  if (!identity.customer) return true
  return (
    reservation.customerId === identity.customer.id ||
    normalizeEmail(reservation.guest?.email) === normalizeEmail(identity.email)
  )
}

/* -------------------------------------------------------------------------
   Validation
   ------------------------------------------------------------------------- */

function validateStep(state, settings) {
  const { draft } = state
  if (state.step === 1) {
    if (draft.partySize < settings.minPartySize || draft.partySize > settings.maxPartySize) {
      return `Party size must be between ${settings.minPartySize} and ${settings.maxPartySize} guests.`
    }
    const zone = getZone(draft.zoneId)
    if (!zone) return 'Choose a seating area.'
    if (draft.partySize < zone.minPartySize) return `${zone.name} seats ${zone.minPartySize}+ guests.`
    if (draft.partySize > zone.maxPartySize) return `${zone.name} seats up to ${zone.maxPartySize} guests.`
    if (!draft.date) return 'Choose a date for your visit.'
    const day = getSlotsForDate(draft.date, {
      partySize: draft.partySize,
      zoneId: draft.zoneId,
      excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
    })
    if (!day.open) return day.reason || 'The restaurant is closed on that date.'
    if (!day.availableCount) return 'No tables are open for that date. Try another evening.'
    return ''
  }
  if (state.step === 2) {
    if (!draft.time) return 'Choose a sitting time.'
    const check = evaluateAvailability({
      date: draft.date,
      time: draft.time,
      partySize: draft.partySize,
      zoneId: draft.zoneId,
      excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
      settings,
    })
    if (!check.ok) return check.reasons[0] || 'That sitting is no longer available.'
    return ''
  }
  if (state.step === 4) {
    if (!draft.name.trim()) return 'Enter the name for the reservation.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email.trim())) {
      return 'Enter a valid email address so we can send the confirmation.'
    }
    if (draft.phone && draft.phone.replace(/[^\d]/g, '').length < 7) {
      return 'Enter a valid phone number, or leave it blank.'
    }
    return ''
  }
  if (state.step === 5) {
    const check = evaluateAvailability({
      date: draft.date,
      time: draft.time,
      partySize: draft.partySize,
      zoneId: draft.zoneId,
      excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
      settings,
    })
    if (!check.ok) return check.reasons[0] || 'That table was just taken. Choose another sitting.'
    return ''
  }
  return ''
}

/* -------------------------------------------------------------------------
   Render: shell
   ------------------------------------------------------------------------- */

function renderShell(state, settings) {
  const inConfirmation = state.step === 6 && state.result
  return `
    <div class="rsv-shell ${inConfirmation ? 'is-confirmation' : ''}">
      <div class="rsv-workspace">
        ${renderProgress(state)}
        <div class="rsv-panel">
          ${state.manageNotice ? `<div class="rsv-notice"><i data-lucide="info"></i><span>${esc(state.manageNotice)}</span></div>` : ''}
          ${state.error ? renderAlert(state) : ''}
          ${inConfirmation ? renderConfirmation(state, settings) : renderStep(state, settings)}
        </div>
        ${inConfirmation ? '' : renderNav(state)}
      </div>
      ${inConfirmation ? '' : renderSummary(state, settings)}
    </div>
  `
}

function renderProgress(state) {
  return `
    <ol class="rsv-progress" aria-label="Booking progress">
      ${STEPS.map((step) => {
        const status =
          step.n === state.step ? 'is-current' : step.n < state.step ? 'is-complete' : ''
        const clickable = step.n < state.step && step.n < 6
        return `
          <li class="rsv-progress-item ${status}">
            <button
              type="button"
              class="rsv-progress-btn"
              ${clickable ? `data-rsv-action="step" data-step="${step.n}"` : 'disabled'}
              ${step.n === state.step ? 'aria-current="step"' : ''}
            >
              <span class="rsv-progress-num">${step.n < state.step ? '✓' : String(step.n).padStart(2, '0')}</span>
              <span class="rsv-progress-label">${step.label}</span>
            </button>
          </li>
        `
      }).join('')}
    </ol>
  `
}

function renderAlert(state) {
  return `
    <div class="rsv-alert" role="alert" data-rsv-alert>
      <i data-lucide="info"></i>
      <div>
        <strong>${esc(state.error)}</strong>
        ${state.errorReasons.length > 1 ? `<ul>${state.errorReasons.slice(1).map((reason) => `<li>${esc(reason)}</li>`).join('')}</ul>` : ''}
        ${
          state.alternatives?.length
            ? `<div class="rsv-alternatives"><span>Other sittings that are open:</span>${state.alternatives
                .map(
                  (alternative) =>
                    `<button type="button" class="rsv-chip" data-rsv-action="suggestion" data-date="${esc(alternative.date)}" data-time="${esc(alternative.time)}">${esc(alternative.label)}</button>`,
                )
                .join('')}</div>`
            : ''
        }
      </div>
    </div>
  `
}

function renderNav(state) {
  return `
    <div class="rsv-wizard-nav">
      <button type="button" class="rsv-btn rsv-btn-ghost" data-rsv-action="back" ${state.step === 1 ? 'disabled' : ''}>
        <i data-lucide="arrow-left"></i> Back
      </button>
      <span class="rsv-nav-step">Step ${state.step} of 5</span>
      <button type="button" class="rsv-btn rsv-btn-primary" data-rsv-action="${state.step === 5 ? 'confirm' : 'next'}" ${state.submitting ? 'disabled' : ''}>
        ${state.submitting ? 'Saving…' : state.step === 5 ? (state.mode === 'modify' ? 'Save changes' : 'Confirm reservation') : 'Continue'}
        <i data-lucide="${state.step === 5 ? 'check' : 'arrow-right'}"></i>
      </button>
    </div>
  `
}

/* -------------------------------------------------------------------------
   Render: steps
   ------------------------------------------------------------------------- */

function renderStep(state, settings) {
  if (state.step === 1) return renderPartyStep(state, settings)
  if (state.step === 2) return renderTimeStep(state, settings)
  if (state.step === 3) return renderMenuStep(state)
  if (state.step === 4) return renderDetailsStep(state, settings)
  return renderReviewStep(state, settings)
}

function renderStepHeader(step, kicker, title, lede) {
  return `
    <header class="rsv-step-head">
      <span class="rsv-kicker">Step ${step} of 5 · ${kicker}</span>
      <h2 tabindex="-1" data-rsv-title>${title}</h2>
      <p class="rsv-lede">${lede}</p>
    </header>
  `
}

function renderPartyStep(state, settings) {
  const { draft } = state
  const calendar = getAvailabilityCalendar({
    partySize: draft.partySize,
    zoneId: draft.zoneId,
    days: 14,
    startDate: todayISO(),
    settings,
  })
  const maxDate = addDays(todayISO(), settings.advanceBookingDays)
  return `
    ${renderStepHeader(1, 'The occasion', 'Who is joining, and <em>when?</em>', 'Choose your party size, the room you would like, and a date. Availability is calculated from the tables and bookings stored in this browser.')}

    <div class="rsv-field">
      <div class="rsv-field-head">
        <span class="rsv-label">Party size</span>
        <span class="rsv-hint-inline">Up to ${settings.maxPartySize} guests online</span>
      </div>
      <div class="rsv-party-row" role="group" aria-label="Party size">
        ${Array.from({ length: settings.maxPartySize }, (_, index) => index + 1)
          .map(
            (size) => `
              <button type="button" class="rsv-party-btn ${draft.partySize === size ? 'is-selected' : ''}"
                data-rsv-action="party" data-party="${size}" aria-pressed="${draft.partySize === size}">
                <b>${size}</b><span>${size === 1 ? 'guest' : 'guests'}</span>
              </button>
            `,
          )
          .join('')}
      </div>
      <p class="rsv-hint">For parties larger than ${settings.maxPartySize}, our private dining team can help — see the enquiry links below.</p>
    </div>

    <div class="rsv-field">
      <span class="rsv-label">Seating area</span>
      <div class="rsv-zone-grid">
        ${zoneOptions()
          .map((zone) => {
            const unavailable = draft.partySize < zone.minPartySize || draft.partySize > zone.maxPartySize
            return `
              <button type="button" class="rsv-zone-card ${draft.zoneId === zone.id ? 'is-selected' : ''} ${unavailable ? 'is-unavailable' : ''}"
                data-rsv-action="zone" data-zone="${zone.id}" aria-pressed="${draft.zoneId === zone.id}" ${unavailable ? 'aria-disabled="true"' : ''}>
                <span class="rsv-zone-icon"><i data-lucide="${zone.icon || 'utensils'}"></i></span>
                <span class="rsv-zone-copy">
                  <b>${esc(zone.name)}</b>
                  <span>${esc(zone.tagline)}</span>
                  <small>${zone.minPartySize}–${zone.maxPartySize} guests</small>
                </span>
                <span class="rsv-zone-check"><i data-lucide="${draft.zoneId === zone.id ? 'check-circle-2' : 'circle'}"></i></span>
              </button>
            `
          })
          .join('')}
      </div>
    </div>

    <div class="rsv-field">
      <div class="rsv-field-head">
        <span class="rsv-label">Date</span>
        <label class="rsv-date-picker-label">
          Another date
          <input type="date" class="rsv-date-input" data-rsv-date-picker
            min="${todayISO()}" max="${maxDate}" value="${esc(draft.date)}" aria-label="Choose another date">
        </label>
      </div>
      <div class="rsv-date-strip" role="group" aria-label="Available dates">
        ${calendar
          .map(
            (day) => `
              <button type="button" class="rsv-date-card ${draft.date === day.date ? 'is-selected' : ''} ${day.available ? '' : 'is-unavailable'} ${day.isToday ? 'is-today' : ''}"
                data-rsv-action="date" data-date="${day.date}" ${day.available ? '' : 'aria-disabled="true"'}
                title="${day.available ? `${day.slotsAvailable} sittings open` : esc(day.reason || 'No availability')}">
                <span>${day.isToday ? 'Today' : day.weekdayShort}</span>
                <b>${day.dayNumber}</b>
                <small>${day.monthShort}</small>
                <i class="rsv-date-state">${day.available ? `${day.slotsAvailable}` : '—'}</i>
              </button>
            `,
          )
          .join('')}
      </div>
      <p class="rsv-hint"><i data-lucide="info"></i> The number on each date is the count of open sittings for this party and room. Closed days and fully booked dates cannot be selected.</p>
    </div>
  `
}

function renderTimeStep(state, settings) {
  const { draft } = state
  const day = getSlotsForDate(draft.date, {
    partySize: draft.partySize,
    zoneId: draft.zoneId,
    excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
    settings,
  })
  const zone = getZone(draft.zoneId)
  const calendar = getAvailabilityCalendar({
    partySize: draft.partySize,
    zoneId: draft.zoneId,
    days: 10,
    startDate: todayISO(),
    settings,
  }).filter((item) => item.available && item.date !== draft.date)

  return `
    ${renderStepHeader(2, 'The sitting', 'Choose your <em>sitting time.</em>', `${formatDateLong(draft.date)} · ${esc(zone?.name || 'Dining room')} · ${draft.partySize} ${draft.partySize === 1 ? 'guest' : 'guests'}. ${day.open ? `Service runs ${formatTime12(day.hours.openTime)} – ${formatTime12(day.hours.closeTime)}.` : esc(day.reason || '')}`)}

    ${
      day.open && day.slots.length
        ? `
          <div class="rsv-field">
            <span class="rsv-label">Open sittings</span>
            <div class="rsv-slot-grid" role="group" aria-label="Available sitting times">
              ${day.slots
                .map(
                  (slot) => `
                    <button type="button" class="rsv-slot-btn ${draft.time === slot.time ? 'is-selected' : ''} ${slot.available ? '' : 'is-unavailable'}"
                      data-rsv-action="time" data-time="${slot.time}" ${slot.available ? '' : 'disabled'}
                      aria-pressed="${draft.time === slot.time}"
                      title="${slot.available ? `${slot.tablesFree} table(s) free` : esc(slot.reason)}">
                      <b>${slot.label}</b>
                      <span>${slot.available ? `${slot.tablesFree} table${slot.tablesFree === 1 ? '' : 's'} free` : esc(slot.reason)}</span>
                    </button>
                  `,
                )
                .join('')}
            </div>
            <p class="rsv-hint"><i data-lucide="clock"></i> Tables are held for ${settings.reservationDurationMinutes} minutes, with a ${settings.turnoverBufferMinutes}-minute reset between sittings. Availability is simulated in this browser only.</p>
          </div>
        `
        : `
          <div class="rsv-empty">
            <i data-lucide="calendar-days"></i>
            <h3>No sittings on this date</h3>
            <p>${esc(day.reason || 'Every table is already committed for this date.')}</p>
            ${calendar.length ? `<span class="rsv-label">Next open dates</span><div class="rsv-chip-row">${calendar
              .slice(0, 5)
              .map((item) => `<button type="button" class="rsv-chip" data-rsv-action="date" data-date="${item.date}">${esc(item.label)} · ${item.slotsAvailable} open</button>`)
              .join('')}</div>` : ''}
            <button type="button" class="rsv-btn rsv-btn-ghost" data-rsv-action="back"><i data-lucide="arrow-left"></i> Change the date</button>
          </div>
        `
    }
  `
}

function renderMenuStep(state) {
  const items = getMenuItems()
  const tab = state.menuFilter
  const visible = tab === 'all' ? items : items.filter((item) => item.category === tab)
  const selection = buildSelectionSummary(state)
  const categories = MENU_TABS.map(
    (entry) => `
      <button type="button" class="rsv-tab ${tab === entry.id ? 'is-active' : ''}" data-rsv-action="menu-tab" data-filter="${entry.id}">
        ${entry.label}
      </button>
    `,
  ).join('')

  return `
    ${renderStepHeader(3, 'The table', 'Pre-order from <em>the fire.</em>', 'Optional, but it lets the kitchen and sommelier prepare. Choose as many dishes as you like and adjust quantities — everything is attached to this reservation only.')}

    <div class="rsv-menu-toolbar">
      <div class="rsv-tabs" role="tablist" aria-label="Menu categories">${categories}</div>
      <span class="rsv-menu-count">${selection.itemCount} item${selection.itemCount === 1 ? '' : 's'} selected</span>
    </div>

    <div class="rsv-menu-grid">
      ${visible
        .map((dish) => {
          const qty = Number(state.draft.items[dish.id] || 0)
          return `
            <article class="rsv-dish ${qty ? 'is-selected' : ''}">
              <img src="${esc(dish.image)}" alt="${esc(dish.name)}" width="86" height="86" loading="lazy">
              <div class="rsv-dish-body">
                <div class="rsv-dish-top">
                  <h3>${esc(dish.name)}</h3>
                  <span class="rsv-dish-price">${money(dish.price)}</span>
                </div>
                <p>${esc(dish.description || '')}</p>
                <div class="rsv-dish-controls">
                  <div class="rsv-stepper" aria-label="Quantity for ${esc(dish.name)}">
                    <button type="button" data-rsv-action="dish-minus" data-dish="${dish.id}" aria-label="Remove one ${esc(dish.name)}" ${qty ? '' : 'disabled'}><i data-lucide="minus"></i></button>
                    <span aria-live="polite">${qty}</span>
                    <button type="button" data-rsv-action="dish-plus" data-dish="${dish.id}" aria-label="Add one ${esc(dish.name)}"><i data-lucide="plus"></i></button>
                  </div>
                  <span class="rsv-dish-cat">${esc(dish.categoryLabel || dish.category)}</span>
                </div>
                ${
                  qty
                    ? `<label class="rsv-item-note">Kitchen note <input type="text" maxlength="120" data-rsv-field="itemNote" data-dish="${dish.id}" value="${esc(state.draft.itemNotes[dish.id] || '')}" placeholder="e.g. no dairy, extra sauce"></label>`
                    : ''
                }
              </div>
            </article>
          `
        })
        .join('')}
    </div>

    <div class="rsv-tray">
      <div class="rsv-tray-head">
        <div>
          <span class="rsv-kicker">Attached to your table</span>
          <h3>Your pre-order</h3>
        </div>
        ${selection.itemCount ? `<button type="button" class="rsv-link-btn" data-rsv-action="clear-menu"><i data-lucide="trash-2"></i> Clear</button>` : ''}
      </div>
      ${
        selection.itemCount
          ? `<ul class="rsv-tray-list">${selection.items
              .map(
                (item) => `
                  <li>
                    <span>${esc(item.name)} <small>×${item.qty}${item.notes ? ` · ${esc(item.notes)}` : ''}</small></span>
                    <span>${money(item.price * item.qty)}</span>
                  </li>
                `,
              )
              .join('')}</ul>
            <div class="rsv-tray-total"><span>Pre-order subtotal</span><b>${money(selection.subtotal)}</b></div>
            <p class="rsv-hint">Menu prices are illustrative. This pre-order is not a paid order; it is sent to the kitchen with your reservation.</p>`
          : `<p class="rsv-tray-empty">No dishes yet. You can continue and order at the table — nothing is required here.</p>`
      }
    </div>
  `
}

function renderDetailsStep(state, settings) {
  const { draft } = state
  const registered = draft.guestType === 'registered'
  return `
    ${renderStepHeader(4, 'The details', 'How should we <em>reach you?</em>', 'These details identify the booking in this browser. No email or SMS is actually sent in the prototype — confirmations appear in the in-app notification drawer instead.')}

    <div class="rsv-identity-switch" role="group" aria-label="Booking type">
      <label class="rsv-identity-card ${!registered ? 'is-selected' : ''}">
        <input type="radio" name="rsv-guest-type" value="guest" data-rsv-field="guestType" ${!registered ? 'checked' : ''}>
        <span><i data-lucide="user"></i><b>Guest booking</b><small>No account needed. Keep your reference to manage the table.</small></span>
      </label>
      <label class="rsv-identity-card ${registered ? 'is-selected' : ''} ${state.mode === 'modify' || !state.registeredSession ? 'is-locked' : ''}">
        <input type="radio" name="rsv-guest-type" value="registered" data-rsv-field="guestType" ${registered ? 'checked' : ''} ${state.mode === 'modify' || !state.registeredSession ? 'disabled' : ''}>
        <span><i data-lucide="shield-check"></i><b>Registered guest</b><small>${state.registeredSession ? 'Linked to your signed-in account and customer dashboard.' : 'Sign in to keep visits in your private dashboard. You can still book as a guest.'}</small></span>
      </label>
    </div>

    <div class="rsv-form-grid">
      <label class="rsv-input-label">Full name
        <input type="text" name="name" maxlength="120" autocomplete="name" required data-rsv-field="name" value="${esc(draft.name)}" placeholder="Your full name">
      </label>
      <label class="rsv-input-label">Email address
        <input type="email" name="email" maxlength="120" autocomplete="email" required data-rsv-field="email" value="${esc(draft.email)}" placeholder="you@example.com">
      </label>
      <label class="rsv-input-label">Phone <span>(optional)</span>
        <input type="tel" name="phone" maxlength="40" autocomplete="tel" data-rsv-field="phone" value="${esc(draft.phone)}" placeholder="+1 555 000 0000">
      </label>
      <label class="rsv-input-label">Occasion
        <select name="occasion" data-rsv-field="occasion">
          ${['', 'Birthday', 'Anniversary', 'Date night', 'Business dinner', 'Celebration', 'Other']
            .map((option) => `<option value="${option}" ${draft.occasion === option ? 'selected' : ''}>${option || 'Just dinner'}</option>`)
            .join('')}
        </select>
      </label>
    </div>

    <label class="rsv-input-label">Allergies, dietary needs or a special request
      <textarea name="dietary" rows="2" maxlength="240" data-rsv-field="dietary" placeholder="Allergies, accessibility needs, high chair…">${esc(draft.dietary)}</textarea>
    </label>

    <label class="rsv-input-label">Notes for the team
      <textarea name="notes" rows="3" maxlength="400" data-rsv-field="notes" placeholder="Anniversary, seating preference, running late…">${esc(draft.notes)}</textarea>
    </label>

    <div class="rsv-inline-note">
      <i data-lucide="info"></i>
      <p>${settings.notesForGuests || 'Tables are held for 15 minutes past the reservation time.'} Prototype bookings are stored only in this browser; clearing site data removes them.</p>
    </div>
  `
}

function renderReviewStep(state, settings) {
  const { draft } = state
  const selection = buildSelectionSummary(state)
  const availability = evaluateAvailability({
    date: draft.date,
    time: draft.time,
    partySize: draft.partySize,
    zoneId: draft.zoneId,
    excludeReservationId: state.mode === 'modify' ? state.sourceId : null,
    settings,
  })
  const zone = getZone(draft.zoneId)
  const table = availability.table
  const payment = settings.depositPerGuest > 0
    ? {
        required: true,
        amount: settings.depositPerGuest * draft.partySize,
        label: 'simulated deposit due',
      }
    : { required: false, amount: 0, label: 'no deposit required' }

  return `
    ${renderStepHeader(5, 'The check', state.mode === 'modify' ? 'Review your <em>changes.</em>' : 'A moment to <em>check.</em>', 'Everything below is saved to this browser’s local data store when you confirm. Nothing is sent to a server.')}

    <div class="rsv-review-grid">
      <section class="rsv-review-card">
        <div class="rsv-review-head"><span><i data-lucide="user"></i> Guest</span><button type="button" class="rsv-link-btn" data-rsv-action="step" data-step="4">Edit</button></div>
        <strong>${esc(draft.name || 'Add your name')}</strong>
        <p>${esc(draft.email || 'Add your email')}${draft.phone ? ` · ${esc(draft.phone)}` : ''}</p>
        <span class="rsv-pill ${draft.guestType === 'registered' ? 'is-green' : ''}">${draft.guestType === 'registered' ? 'Registered guest · dashboard linked' : 'Guest booking · no account'}</span>
      </section>

      <section class="rsv-review-card">
        <div class="rsv-review-head"><span><i data-lucide="calendar-days"></i> Table</span><button type="button" class="rsv-link-btn" data-rsv-action="step" data-step="1">Edit</button></div>
        <strong>${formatDateLong(draft.date)}</strong>
        <p>${formatTime12(draft.time)} · ${draft.partySize} ${draft.partySize === 1 ? 'guest' : 'guests'} · ${esc(zone?.name || '')}</p>
        <span class="rsv-pill ${availability.ok ? 'is-green' : 'is-red'}">${availability.ok ? `Table held · ${esc(table?.name || 'auto-assigned')}` : 'Availability changed'}</span>
      </section>

      <section class="rsv-review-card rsv-review-wide">
        <div class="rsv-review-head"><span><i data-lucide="utensils"></i> Pre-order</span><button type="button" class="rsv-link-btn" data-rsv-action="step" data-step="3">Edit</button></div>
        ${
          selection.itemCount
            ? `<ul class="rsv-review-list">${selection.items
                .map(
                  (item) => `<li><span>${esc(item.name)} <small>×${item.qty}</small></span><span>${money(item.price * item.qty)}</span></li>`,
                )
                .join('')}</ul><div class="rsv-review-total"><span>Pre-order subtotal</span><b>${money(selection.subtotal)}</b></div>`
            : `<p class="rsv-muted">No pre-order — the table will order from the carte.</p>`
        }
      </section>

      ${
        draft.notes || draft.dietary || draft.occasion
          ? `<section class="rsv-review-card rsv-review-wide">
              <div class="rsv-review-head"><span><i data-lucide="info"></i> Requests</span><button type="button" class="rsv-link-btn" data-rsv-action="step" data-step="4">Edit</button></div>
              ${draft.occasion ? `<p><b>Occasion:</b> ${esc(draft.occasion)}</p>` : ''}
              ${draft.dietary ? `<p><b>Dietary:</b> ${esc(draft.dietary)}</p>` : ''}
              ${draft.notes ? `<p><b>Notes:</b> ${esc(draft.notes)}</p>` : ''}
            </section>`
          : ''
      }
    </div>

    ${
      !availability.ok
        ? `<div class="rsv-alert" role="alert" data-rsv-alert><i data-lucide="info"></i><div><strong>${esc(availability.reasons[0] || 'This table is no longer available.')}</strong>
            ${availability.alternatives?.length ? `<div class="rsv-alternatives"><span>Other open sittings:</span>${availability.alternatives
              .map((alternative) => `<button type="button" class="rsv-chip" data-rsv-action="suggestion" data-date="${alternative.date}" data-time="${alternative.time}">${esc(alternative.label)}</button>`)
              .join('')}</div>` : ''}
          </div></div>`
        : ''
    }

    <div class="rsv-simulation-grid">
      <div class="rsv-simulation-card">
        <i data-lucide="shield-check"></i>
        <div><b>In-app notifications only</b><p>Confirmation and status updates are written to the local notification drawer. No email, SMS or push message is sent.</p></div>
      </div>
      <div class="rsv-simulation-card">
        <i data-lucide="wine"></i>
        <div><b>${payment.required ? 'Simulated deposit' : 'No payment needed'}</b><p>${payment.required ? `${money(payment.amount)} “due” — a demonstration state only. No card is collected and no charge is made.` : 'Nothing is charged for this prototype reservation.'}</p></div>
      </div>
    </div>

    <div class="rsv-policy">
      <p><b>Cancellation.</b> You can cancel or modify this booking from this browser at any time; the table is released immediately. Real restaurants usually require ${settings.cancellationWindowHours} hours’ notice.</p>
      <p><b>Local-only availability.</b> localStorage cannot coordinate bookings across devices. In this prototype, availability is simulated within this browser’s stored data.</p>
    </div>
  `
}

/* -------------------------------------------------------------------------
   Render: confirmation
   ------------------------------------------------------------------------- */

function renderConfirmation(state, settings) {
  const reservation = getReservation(state.result.id) || state.result
  const details = getReservationDetails(reservation.id)
  const notifications = getReservationNotifications(reservation.id).filter(
    (notification) => notification.audience !== 'admin',
  )
  const cancelled = reservation.status === RESERVATION_STATUS.cancelled
  const order = details?.mealOrder || getReservationMealOrder(reservation.id)
  const payment = reservation.payment

  return `
    <div class="rsv-confirmation ${cancelled ? 'is-cancelled' : ''}">
      <div class="rsv-confirmation-mark">
        <i data-lucide="${cancelled ? 'x' : state.isRepeat ? 'rotate-ccw' : 'check'}"></i>
      </div>
      <span class="rsv-kicker">${cancelled ? 'Reservation cancelled' : state.wasUpdate ? 'Reservation updated' : state.isRepeat ? 'Repeat visit booked' : 'Reservation confirmed'}</span>
      <h2 tabindex="-1" data-rsv-title>${cancelled ? 'Your table has been <em>released.</em>' : 'Your table is <em>held.</em>'}</h2>
      <p class="rsv-lede">${cancelled ? 'The table is available again for other guests in this browser.' : `Saved in this browser’s local reservation data. Keep the reference below to manage this booking.`}</p>

      <div class="rsv-reference-block">
        <span>Booking reference</span>
        <b>${esc(reservation.reference)}</b>
        <span class="rsv-status-pill status-${esc(reservation.status)}">${esc(RESERVATION_STATUS_LABELS[reservation.status] || reservation.status)}</span>
      </div>

      <div class="rsv-confirm-details">
        <div><i data-lucide="calendar-days"></i><span>Date</span><b>${formatDateLong(reservation.date)}</b></div>
        <div><i data-lucide="clock"></i><span>Time</span><b>${formatTime12(reservation.time)}</b></div>
        <div><i data-lucide="users"></i><span>Party</span><b>${reservation.partySize} ${reservation.partySize === 1 ? 'guest' : 'guests'}</b></div>
        <div><i data-lucide="compass"></i><span>Room</span><b>${esc(reservation.zoneName)}</b></div>
        <div><i data-lucide="armchair"></i><span>Table</span><b>${esc(reservation.tableName || 'To be assigned')}</b></div>
        <div><i data-lucide="chef-hat"></i><span>Kitchen</span><b>${esc(KITCHEN_STATUS_LABELS[reservation.kitchenStatus] || 'Queued')}</b></div>
      </div>

      ${
        order?.items?.length
          ? `<section class="rsv-confirm-section">
              <h3><i data-lucide="utensils"></i> Pre-order attached</h3>
              <ul class="rsv-review-list">${order.items
                .map((item) => `<li><span>${esc(item.name)} <small>×${item.qty}${item.notes ? ` · ${esc(item.notes)}` : ''}</small></span><span>${money(item.price * item.qty)}</span></li>`)
                .join('')}</ul>
              <div class="rsv-review-total"><span>Pre-order subtotal</span><b>${money(order.subtotal)}</b></div>
            </section>`
          : ''
      }

      <section class="rsv-confirm-section">
        <h3><i data-lucide="shield-check"></i> Simulated payment</h3>
        <p class="rsv-muted">${esc(payment?.label || 'No deposit required.')} ${payment?.required ? 'No card details were collected and no money moved.' : ''}</p>
      </section>

      <section class="rsv-confirm-section">
        <h3><i data-lucide="bell"></i> In-app notifications generated</h3>
        <p class="rsv-muted">No email or SMS is sent. These messages live in the local notification drawer and in the dashboards.</p>
        <ul class="rsv-notification-list">
          ${notifications
            .map(
              (notification) => `
                <li class="${notification.read ? 'is-read' : ''}">
                  <i data-lucide="${esc(notification.icon || 'bell')}"></i>
                  <div><b>${esc(notification.title)}</b><p>${esc(notification.message)}</p><small>${esc(notification.audience)} · in-app · simulated</small></div>
                  ${notification.read ? '' : `<button type="button" class="rsv-link-btn" data-rsv-action="mark-read" data-notification="${notification.id}">Mark read</button>`}
                </li>
              `,
            )
            .join('')}
        </ul>
      </section>

      <div class="rsv-confirm-actions">
        ${cancelled ? '' : `<button type="button" class="rsv-btn rsv-btn-primary" data-rsv-action="auto-repeat"><i data-lucide="rotate-ccw"></i> Repeat next available evening</button>`}
        <button type="button" class="rsv-btn rsv-btn-ghost" data-rsv-action="book-another"><i data-lucide="plus"></i> Book another visit</button>
        ${cancelled ? '' : `<button type="button" class="rsv-btn rsv-btn-ghost" data-rsv-action="manage-result"><i data-lucide="pencil"></i> Modify this booking</button>`}
        ${cancelled ? '' : `<button type="button" class="rsv-btn rsv-btn-danger" data-rsv-action="cancel-result"><i data-lucide="ban"></i> Cancel</button>`}
        <a class="rsv-btn rsv-btn-quiet" href="/pages/reservation-confirmation.html?id=${encodeURIComponent(reservation.id)}&code=${encodeURIComponent(reservation.reference)}">Open confirmation page <i data-lucide="arrow-up-right"></i></a>
        <a class="rsv-btn rsv-btn-quiet" href="${(state.result?.guestType || state.draft.guestType) === 'registered' ? '/pages/user-dashboard.html' : '/pages/login.html'}">${(state.result?.guestType || state.draft.guestType) === 'registered' ? 'View my bookings' : 'Sign in to keep bookings'} <i data-lucide="arrow-up-right"></i></a>
      </div>

      <p class="rsv-disclaimer"><i data-lucide="info"></i> Prototype only. This reservation is stored in localStorage on this device. It is not a real restaurant booking and availability is not shared between browsers.</p>
    </div>
  `
}

/* -------------------------------------------------------------------------
   Render: summary sidebar + lookup
   ------------------------------------------------------------------------- */

function buildSelectionSummary(state) {
  const items = getMenuItems()
  const entries = Object.entries(state.draft.items)
    .filter(([, qty]) => Number(qty) > 0)
    .map(([id, qty]) => {
      const dish = items.find((item) => item.id === id)
      if (!dish) return null
      return {
        menuItemId: id,
        name: dish.name,
        price: Number(dish.price) || 0,
        qty: Number(qty),
        notes: state.draft.itemNotes[id] || '',
      }
    })
    .filter(Boolean)
  return {
    items: entries,
    itemCount: entries.reduce((sum, item) => sum + item.qty, 0),
    subtotal: entries.reduce((sum, item) => sum + item.price * item.qty, 0),
  }
}

function renderSummary(state, settings) {
  const { draft } = state
  const selection = buildSelectionSummary(state)
  const zone = getZone(draft.zoneId)
  const day = draft.date
    ? getSlotsForDate(draft.date, { partySize: draft.partySize, zoneId: draft.zoneId })
    : null
  return `
    <aside class="rsv-summary" aria-label="Booking summary">
      <div class="rsv-summary-head">
        <span class="rsv-kicker">Your evening</span>
        <h3>${draft.partySize} ${draft.partySize === 1 ? 'guest' : 'guests'}<em>${draft.date ? formatDateCompact(draft.date) : 'Pick a date'}</em></h3>
      </div>
      <dl class="rsv-summary-list">
        <div><dt>Date</dt><dd>${draft.date ? formatDateLong(draft.date) : '—'}</dd></div>
        <div><dt>Time</dt><dd>${draft.time ? formatTime12(draft.time) : '—'}</dd></div>
        <div><dt>Room</dt><dd>${esc(zone?.name || '—')}</dd></div>
        <div><dt>Service</dt><dd>${day?.open ? `${formatTime12(day.hours.openTime)} – ${formatTime12(day.hours.closeTime)}` : esc(day?.reason || 'Closed')}</dd></div>
        <div><dt>Pre-order</dt><dd>${selection.itemCount ? `${selection.itemCount} item${selection.itemCount === 1 ? '' : 's'} · ${money(selection.subtotal)}` : 'At the table'}</dd></div>
      </dl>
      <div class="rsv-summary-badge-row">
        <span class="rsv-mini-badge"><i data-lucide="shield-check"></i> Local prototype</span>
        <span class="rsv-mini-badge"><i data-lucide="bell"></i> In-app only</span>
      </div>
      <p class="rsv-summary-note">Availability is calculated from ${settings.advanceBookingDays}-day booking horizon, ${settings.reservationDurationMinutes}-minute tables and a ${settings.turnoverBufferMinutes}-minute reset. It is stored per browser, not shared globally.</p>
      <div class="rsv-summary-identity">
        <i data-lucide="${state.draft.guestType === 'registered' ? 'shield-check' : 'user'}"></i>
        <span>${state.draft.guestType === 'registered' ? 'Booking as a registered guest' : 'Booking as a guest'}</span>
      </div>
      <a class="rsv-summary-help" href="/pages/contact.html">Need a hand? Contact the concierge <i data-lucide="arrow-up-right"></i></a>
    </aside>
  `
}

function renderLookup(state, identity) {
  const feedback = state.lookup.error
    ? `<p class="rsv-lookup-error" role="alert">${esc(state.lookup.error)}</p>`
    : ''
  const result = state.lookup.result
  const customer = identity.registered ? getCurrentCustomer() : null
  const myBookings = customer
    ? getCustomerReservations(customer.id)
        .filter((reservation) => ['pending', 'confirmed', 'seated'].includes(reservation.status) && reservation.date >= todayISO())
        .slice(0, 3)
    : []

  return `
    <section class="rsv-lookup">
      <div class="rsv-lookup-intro">
        <span class="rsv-kicker">Already booked?</span>
        <h2>Find or change <em>your table.</em></h2>
        <p>Enter the reference from your confirmation and the email used to book. Everything is looked up from this browser’s local data, so the booking must have been made here.</p>
        <form class="rsv-lookup-form" data-rsv-lookup-form novalidate>
          <label>Booking reference
            <input type="text" name="reference" required maxlength="40" placeholder="FLV-7K2M9Q" value="${esc(state.lookup.reference)}" autocomplete="off">
          </label>
          <label>Email address
            <input type="email" name="email" required maxlength="120" placeholder="you@example.com" value="${esc(state.lookup.email)}" autocomplete="email">
          </label>
          <button type="submit" class="rsv-btn rsv-btn-primary"><i data-lucide="search"></i> Find booking</button>
        </form>
        ${feedback}
      </div>

      ${
        result
          ? `<div class="rsv-lookup-result">
              <div class="rsv-lookup-result-head">
                <div>
                  <span class="rsv-status-pill status-${esc(result.status)}">${esc(RESERVATION_STATUS_LABELS[result.status] || result.status)}</span>
                  <b>${esc(result.reference)}</b>
                  <p>${esc(result.guest.name)} · ${formatDateCompact(result.date)} at ${formatTime12(result.time)} · ${result.partySize} guests · ${esc(result.zoneName)}</p>
                </div>
                <button type="button" class="rsv-link-btn" data-rsv-action="clear-lookup">Clear</button>
              </div>
              <div class="rsv-lookup-actions">
                ${canModifyStatus(result.status) ? `<button type="button" class="rsv-btn rsv-btn-primary" data-rsv-action="lookup-manage" data-id="${result.id}"><i data-lucide="pencil"></i> Review &amp; modify</button>` : `<span class="rsv-muted">This booking can no longer be modified.</span>`}
                <button type="button" class="rsv-btn rsv-btn-ghost" data-rsv-action="lookup-repeat" data-id="${result.id}"><i data-lucide="rotate-ccw"></i> Repeat visit</button>
                ${canModifyStatus(result.status) ? `<button type="button" class="rsv-btn rsv-btn-danger" data-rsv-action="lookup-cancel" data-id="${result.id}"><i data-lucide="ban"></i> Cancel</button>` : ''}
              </div>
            </div>`
          : ''
      }

      ${
        myBookings.length
          ? `<div class="rsv-my-bookings">
              <span class="rsv-label">Upcoming in your account</span>
              <ul>${myBookings
                .map(
                  (reservation) => `
                    <li>
                      <div><b>${formatDateCompact(reservation.date)} · ${formatTime12(reservation.time)}</b><span>${reservation.partySize} guests · ${esc(reservation.zoneName)} · ${esc(reservation.reference)}</span></div>
                      <div class="rsv-my-bookings-actions">
                        <button type="button" class="rsv-link-btn" data-rsv-action="lookup-manage" data-id="${reservation.id}">Modify</button>
                        <button type="button" class="rsv-link-btn" data-rsv-action="lookup-repeat" data-id="${reservation.id}">Repeat</button>
                      </div>
                    </li>
                  `,
                )
                .join('')}</ul>
              <a href="/pages/user-dashboard.html" class="rsv-link-btn">Open the guest dashboard <i data-lucide="arrow-up-right"></i></a>
            </div>`
          : ''
      }
    </section>
  `
}

/* -------------------------------------------------------------------------
   Confirm dialog + toast
   ------------------------------------------------------------------------- */

function openConfirm({ title, message, confirmLabel, danger = false, onConfirm }) {
  const overlay = document.createElement('div')
  overlay.className = 'rsv-dialog-backdrop'
  overlay.innerHTML = `
    <div class="rsv-dialog" role="dialog" aria-modal="true" aria-labelledby="rsv-dialog-title">
      <span class="rsv-dialog-mark ${danger ? 'is-danger' : ''}"><i data-lucide="${danger ? 'ban' : 'info'}"></i></span>
      <h2 id="rsv-dialog-title">${esc(title)}</h2>
      <p>${esc(message)}</p>
      <div class="rsv-dialog-actions">
        <button type="button" class="rsv-btn rsv-btn-ghost" data-dialog-cancel>Keep booking</button>
        <button type="button" class="rsv-btn ${danger ? 'rsv-btn-danger' : 'rsv-btn-primary'}" data-dialog-confirm>${esc(confirmLabel)}</button>
      </div>
    </div>
  `
  const previous = document.activeElement
  const close = () => {
    overlay.remove()
    document.body.classList.remove('rsv-modal-open')
    previous?.focus?.()
  }
  overlay.querySelector('[data-dialog-cancel]').addEventListener('click', close)
  overlay.querySelector('[data-dialog-confirm]').addEventListener('click', () => {
    close()
    onConfirm()
  })
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close()
  })
  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()
    if (event.key === 'Tab') {
      const buttons = [...overlay.querySelectorAll('button')]
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault()
        buttons.at(-1).focus()
      } else if (!event.shiftKey && document.activeElement === buttons.at(-1)) {
        event.preventDefault()
        buttons[0].focus()
      }
    }
  })
  document.body.append(overlay)
  document.body.classList.add('rsv-modal-open')
  initializeIcons()
  overlay.querySelector('[data-dialog-cancel]').focus()
}

function scrollToRoot(root) {
  if (typeof root?.scrollIntoView === 'function') {
    root.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function showToast(message, tone = 'info') {
  let host = document.querySelector('.rsv-toast-host')
  if (!host) {
    host = document.createElement('div')
    host.className = 'rsv-toast-host'
    document.body.append(host)
  }
  const toast = document.createElement('div')
  toast.className = `rsv-toast is-${tone}`
  toast.innerHTML = `<i data-lucide="${tone === 'error' ? 'info' : 'check-circle-2'}"></i><span>${esc(message)}</span>`
  host.append(toast)
  initializeIcons()
  setTimeout(() => {
    toast.classList.add('is-leaving')
    setTimeout(() => toast.remove(), 320)
  }, 4200)
}

export { initReservationFeatures }
