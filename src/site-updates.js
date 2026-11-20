import { getSettings, getUpdate, hasSavedSettings } from './dashboard-data.js'

/**
 * The home page ships with its own hero copy. The dashboard's hero fields only
 * take over when an admin has actually saved them — otherwise every visitor
 * would be shown the placeholder words that ship with the settings form.
 */
export function applyLocalSettings() {
  if (!hasSavedSettings()) return
  const title = document.querySelector('.hm-hero .hero-title')
  if (!title) return

  const settings = getSettings()
  const headline = (settings.headline || '').trim()
  const accent = (settings.accent || '').trim()
  if (!headline && !accent) return

  const line = (text, className) => {
    const span = document.createElement('span')
    span.className = className
    span.textContent = text
    return span
  }

  title.replaceChildren(
    line(headline + ' ', 'hm-hero-line'),
    line(accent, 'hm-hero-line hm-hero-line--last'),
  )
}

export function showLocalUpdate() {
  const update = getUpdate()
  if (!update?.enabled || !update.id || !update.title || !update.message) return
  try { if (localStorage.getItem('flavoro.dismissed.update') === update.id) return } catch {}
  const prior = document.activeElement
  const overlay = document.createElement('div')
  overlay.className = 'site-update-overlay'
  overlay.innerHTML = `<section class="site-update-card" role="dialog" aria-modal="true" aria-labelledby="update-title" aria-describedby="update-message"><button type="button" class="site-update-close" aria-label="Close update">×</button><div class="site-update-ornament" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="21"/><path d="M24 6v36M6 24h36M11 11l26 26M37 11L11 37"/></svg></div><span class="site-update-eyebrow"></span><h2 id="update-title"></h2><p id="update-message"></p><a class="site-update-link" hidden></a><button type="button" class="site-update-dismiss">Continue to Flavoro</button></section>`
  overlay.querySelector('.site-update-eyebrow').textContent = update.eyebrow || 'A NOTE FROM FLAVORO'
  overlay.querySelector('#update-title').textContent = update.title
  overlay.querySelector('#update-message').textContent = update.message
  const link = overlay.querySelector('.site-update-link')
  if (update.buttonLabel && typeof update.buttonUrl === 'string' && update.buttonUrl.startsWith('/') && !update.buttonUrl.startsWith('//')) { link.href = update.buttonUrl; link.textContent = update.buttonLabel + ' ↗'; link.hidden = false }
  const close = () => { try { localStorage.setItem('flavoro.dismissed.update', update.id) } catch {} overlay.remove(); document.body.classList.remove('update-open'); prior?.focus?.() }
  overlay.querySelector('.site-update-close').addEventListener('click', close)
  overlay.querySelector('.site-update-dismiss').addEventListener('click', close)
  link.addEventListener('click', () => { try { localStorage.setItem('flavoro.dismissed.update', update.id) } catch {} })
  overlay.addEventListener('click', e => { if (e.target === overlay) close() })
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') close()
    if (e.key === 'Tab') { const buttons = [...overlay.querySelectorAll('button, a:not([hidden])')]; if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons.at(-1).focus() } else if (!e.shiftKey && document.activeElement === buttons.at(-1)) { e.preventDefault(); buttons[0].focus() } }
  })
  document.body.append(overlay); document.body.classList.add('update-open'); overlay.querySelector('.site-update-close').focus()
}
