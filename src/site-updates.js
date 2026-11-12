import { getSettings, getUpdate } from './dashboard-data.js'

export function applyLocalSettings() {
  const spans = document.querySelectorAll('.home-hero .hero-title > span')
  if (spans.length !== 3) return
  const settings = getSettings()
  spans[0].textContent = settings.headline
  const words = settings.accent.trim().split(/\s+/)
  spans[1].replaceChildren()
  if (words.length > 1) spans[1].append(document.createTextNode(words.shift() + ' '))
  const em = document.createElement('em'); em.textContent = words.join(' '); spans[1].append(em)
  spans[2].textContent = settings.subline
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
