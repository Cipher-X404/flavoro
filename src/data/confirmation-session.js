/**
 * Short-lived, per-tab handoff for confirmation/manage links.
 *
 * A URL that carries only a reservation id must not expose booking details.
 * When a booking is created or successfully looked up in this tab, its id is
 * remembered here so the "confirmation page", "modify" and "book again" links
 * keep working without putting guest details in the URL.
 *
 * This is UI session state, not application data: nothing here is persisted to
 * localStorage or shared across tabs/devices.
 */

const KEY = 'flavoro.data.lastConfirmation.v1'

export function rememberConfirmation(reservationId) {
  if (!reservationId) return
  try {
    sessionStorage.setItem(KEY, String(reservationId))
  } catch {
    /* Private modes can block sessionStorage; the reference + email lookup still works. */
  }
}

export function isRememberedConfirmation(reservationId) {
  if (!reservationId) return false
  try {
    return sessionStorage.getItem(KEY) === String(reservationId)
  } catch {
    return false
  }
}
