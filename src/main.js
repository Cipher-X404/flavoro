import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initSmoothScroll } from './animations/smooth-scroll.js'
import { initSiteAnimations } from './animations/site-animations.js'
import { initHomeStory } from './animations/home-story.js'
import { initHomeHero } from './home-hero.js'
import { initPreloader, FLAVORO_WORDS } from './animations/preloader.js'
import { initializeIcons } from './icons.js'
import { renderPage } from './pages.js'
import { applyLocalSettings, showLocalUpdate } from './site-updates.js'
import { initEndlessCorridor } from './components/ui/endless.js'
import { initTeamLanyardRail } from './components/ui/team-lanyard-rail.js'
import { initRoadMapGallery } from './components/ui/road-map-gallery.js'
import { articleSchema, breadcrumbSchema, restaurantSchema } from './components/site-meta.js'
import { getOpeningHours } from './data/contact.js'

gsap.registerPlugin(ScrollTrigger)

let teardownSmoothScroll
let teardownAnimations
let teardownPreloader
let teardownEndless
let teardownHome
let teardownHomeHero
let teardownContact
let teardownMaps
let teardownJournal

/**
 * Structured data is injected at runtime rather than pasted into thirty
 * hand-written <head> blocks, so the address, the hours and the canonical URL
 * exist in exactly one place. Crawlers that execute JavaScript — which the
 * major ones now do — read this; the static og: tags cover the rest.
 */
function injectStructuredData(page, resolvedPage) {
  const scripts = []
  const crumbs = [{ name: 'Home', url: '/' }]

  if (page !== 'home' && page !== 'dispatch' && !page.startsWith('journal-')) {
    const label = (document.title.split('—')[0] || '').trim() || page
    crumbs.push({ name: label, url: location.pathname })
  }

  // The restaurant entity belongs on the pages a guest might land on first.
  if (['home', 'about', 'contact', 'visit', 'menu', 'reservations'].includes(page)) {
    scripts.push(restaurantSchema({ hours: getOpeningHours(), url: location.pathname }))
  }

  // Journal pages get an Article on top of the restaurant, so a shared
  // dispatch renders as a real article rather than a generic page.
  const isJournal = page === 'dispatch' || page.startsWith('journal-')
  if (isJournal) {
    const title = document.querySelector('.art-title')?.textContent?.trim()
    const standfirst = document.querySelector('.art-standfirst')?.textContent?.trim()
    const image = document.querySelector('.art-hero img')?.getAttribute('src') || document.querySelector('.art-cover img')?.getAttribute('src')
    const author =
      document.querySelector('.art-author-name')?.textContent?.trim() ||
      document.querySelector('.art-byline a, .art-byline span')?.textContent?.trim()
    if (title) {
      // A published date is optional on a dispatch; an invalid one would throw
      // before any structured data is written.
      const filed = document.querySelector('.art-facts')?.textContent || ''
      const match = filed.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/)
      const parsed = match ? new Date(match[1]) : null
      const datePublished = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : undefined

      scripts.push(articleSchema({
        title,
        description: standfirst || document.querySelector('meta[name="description"]')?.content || '',
        image: image && image.startsWith('/') ? image : undefined,
        url: location.pathname + location.search,
        datePublished,
        author,
        section: document.querySelector('.art-kicker')?.textContent?.trim(),
      }))
      crumbs.push({ name: title, url: location.pathname + location.search })
      crumbs.splice(1, 0, { name: 'Journal', url: '/pages/blog.html' })
    }
  }

  if (crumbs.length > 1) scripts.push(breadcrumbSchema(crumbs))

  // Re-rendering the same page must not stack duplicates, so clear first —
  // clearing inside the loop would delete the node just appended.
  document.head.querySelectorAll('script[data-generated="site-meta"]').forEach((old) => old.remove())

  for (const script of scripts) {
    const holder = document.createElement('div')
    holder.innerHTML = script.trim()
    const node = holder.firstElementChild
    if (!node || node.tagName !== 'SCRIPT') continue
    node.dataset.generated = 'site-meta'
    document.head.appendChild(node)
  }
}

function initialize() {
  const page = document.body.dataset.page || 'home'
  // Dispatches published from the studio share one shell (`dispatch.html`)
  // and carry their slug in the query string, because their content lives in
  // the browser rather than in a file built at deploy time.
  const requestedSlug = page === 'dispatch' ? new URLSearchParams(location.search).get('slug') : null
  if (!document.querySelector('.page-wipe')) {
    // A hidden-by-default sheet used for the page-to-page hand-off. It is
    // clipped to nothing in CSS, so it can never tint the first paint.
    document.body.insertAdjacentHTML('afterbegin', `<div class="page-wipe" aria-hidden="true"></div>`)
  }
  const resolvedPage = page === 'dispatch' ? `journal-${requestedSlug || ''}` : page
  document.querySelector('#app').innerHTML = renderPage(resolvedPage)
  injectStructuredData(page, resolvedPage)
  if (page === 'home') applyLocalSettings()
  document.querySelectorAll('img:not(.hero-bg):not(.page-hero-bg):not([data-eager])').forEach(image => {
    image.loading = 'lazy'
    image.decoding = 'async'
  })
  initializeIcons()

  const heroVideo = document.querySelector('video.hero-bg')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const videoToggle = document.querySelector('[data-video-toggle]')
  let unlockVideo = () => {}
  if (heroVideo) {
    heroVideo.muted = true
    const syncVideoControl = () => {
      if (!videoToggle) return
      const paused = heroVideo.paused
      videoToggle.innerHTML = paused ? '▶ <span>PLAY FILM</span>' : 'Ⅱ <span>PAUSE FILM</span>'
      videoToggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video')
      videoToggle.setAttribute('aria-pressed', String(paused))
    }
    const startVideo = () => { if (!reduceMotion && heroVideo.paused) heroVideo.play().catch(() => {}) }
    heroVideo.addEventListener('play', syncVideoControl)
    heroVideo.addEventListener('pause', syncVideoControl)
    videoToggle?.addEventListener('click', () => { if (heroVideo.paused) heroVideo.play().catch(() => {}); else heroVideo.pause() })
    syncVideoControl()
    // The film is 2.9 MB and it is decoration, so it does not compete with
    // the first paint: wait for the page to go idle, then let it stream.
    // Until then the poster carries the frame — which is what was already
    // on screen for the first second anyway.
    const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 900))
    idle(() => {
      heroVideo.preload = 'auto'
      if (!reduceMotion) startVideo()
      else heroVideo.pause()
    }, { timeout: 2500 })
    unlockVideo = () => {
      heroVideo.preload = 'auto'
      if (!reduceMotion) startVideo()
    }
  }

  teardownSmoothScroll = initSmoothScroll({ Lenis, gsap, ScrollTrigger })
  teardownAnimations = initSiteAnimations({ gsap, ScrollTrigger, autoPlayHero: false })
  if (page === 'home') {
    // the live copy first: it must run even if the scroll choreography fails
    teardownHomeHero = initHomeHero()
    teardownHome = initHomeStory()
  }

  if (page === 'home') {
    teardownPreloader = initPreloader({
      words: FLAVORO_WORDS,
      onReveal: () => {
        teardownAnimations?.playHero?.()
        teardownHome?.playHero?.()
        unlockVideo()
      },
      onComplete: () => {
        ScrollTrigger.refresh()
        showLocalUpdate()
      }
    })

    // Developer / user utility for live previewing words or testing
    window.__restartPreloader = (customWords) => {
      teardownPreloader?.destroy?.()
      teardownPreloader = initPreloader({
        words: customWords || FLAVORO_WORDS,
        onReveal: () => teardownAnimations?.playHero?.(),
        onComplete: () => ScrollTrigger.refresh()
      })
    }
    window.__FLAVORO_WORDS = FLAVORO_WORDS
  }

  // The editorial menus support pointer, keyboard, and click/touch interaction.
  const megaItems = [...document.querySelectorAll('[data-mega-item]')]
  const setMega = (item, open) => {
    megaItems.forEach(other => {
      const isOpen = other === item && open
      other.classList.toggle('is-mega-open', isOpen)
      other.querySelector('[data-mega-toggle]')?.setAttribute('aria-expanded', String(isOpen))
    })
  }
  megaItems.forEach(item => {
    const toggle = item.querySelector('[data-mega-toggle]')
    item.addEventListener('mouseenter', () => setMega(item, true))
    item.addEventListener('mouseleave', () => setMega(item, false))
    item.addEventListener('focusout', event => { if (!item.contains(event.relatedTarget)) setMega(item, false) })
    toggle.addEventListener('click', () => setMega(item, !item.classList.contains('is-mega-open')))
    item.addEventListener('keydown', event => {
      if (event.key === 'Escape') { setMega(item, false); toggle.focus() }
    })
  })
  document.addEventListener('click', event => { if (!event.target.closest('[data-mega-item]')) setMega(null, false) })

  const menu = document.querySelector('[data-mobile-menu]')
  const menuToggle = document.querySelector('[data-menu-toggle]')
  // The sheet lives inside `.site-header`, which is a fixed, blurred stacking
  // context — fixed-position children of a backdrop-filtered element get
  // clamped to the header box. Lifting it to <body> lets it cover the whole
  // viewport, above every section, on every small screen.
  if (menu && menu.parentElement !== document.body) document.body.append(menu)
  const toggleMenu = (open) => {
    menu?.classList.toggle('is-open', open)
    document.body.classList.toggle('menu-open', open)
    menuToggle?.setAttribute('aria-expanded', String(open))
    if (open) {
      menu?.setAttribute('aria-hidden', 'false')
      menu?.querySelector('[data-menu-close]')?.focus()
    } else {
      menu?.setAttribute('aria-hidden', 'true')
      menuToggle?.focus()
    }
  }
  if (menu) menu.setAttribute('aria-hidden', 'true')
  document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => toggleMenu(true))
  document.querySelector('[data-menu-close]')?.addEventListener('click', () => toggleMenu(false))
  menu?.addEventListener('keydown', event => {
    if (event.key === 'Escape') toggleMenu(false)
    if (event.key === 'Tab') {
      const focusable = [...menu.querySelectorAll('a[href], button:not([disabled])')]
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
  })

  document.querySelectorAll('[data-demo-form]').forEach(form => form.addEventListener('submit', (event) => {
    event.preventDefault()
    const status = form.querySelector('[data-form-status]') || form.parentElement.querySelector('[data-form-status]')
    if (status) { status.setAttribute('role', 'status'); status.textContent = 'This is a preview. No information has been submitted.' }
  }))

  const modal = document.querySelector('[data-lightbox-modal]')
  let lightboxTrigger, lightboxIndex = 0
  const lightboxItems = [...document.querySelectorAll('[data-lightbox]')]
  const showLightboxImage = index => {
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length
    const button = lightboxItems[lightboxIndex]
    modal.querySelector('img').src = button.dataset.lightbox
    modal.querySelector('img').alt = button.querySelector('img')?.alt || 'Gallery image'
    modal.querySelector('[data-lightbox-count]').textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`
  }
  const closeLightbox = () => { modal?.classList.remove('is-open'); lightboxTrigger?.focus() }
  lightboxItems.forEach((button, index) => button.addEventListener('click', () => {
    lightboxTrigger = button
    showLightboxImage(index)
    modal.classList.add('is-open')
    modal.querySelector('.lightbox-close')?.focus()
  }))
  modal?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox)
  modal?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => showLightboxImage(lightboxIndex - 1))
  modal?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showLightboxImage(lightboxIndex + 1))
  modal?.addEventListener('click', event => { if (event.target === modal) closeLightbox() })
  modal?.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox()
    if (event.key === 'ArrowLeft') showLightboxImage(lightboxIndex - 1)
    if (event.key === 'ArrowRight') showLightboxImage(lightboxIndex + 1)
    if (event.key === 'Tab') {
      const buttons = [...modal.querySelectorAll('button')]
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus() }
      else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus() }
    }
  })

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const selector = link.getAttribute('href')
    if (!selector || selector === '#') return
    const target = document.querySelector(selector)
    if (target) { event.preventDefault(); if (menu?.classList.contains('is-open')) toggleMenu(false); target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }) }
  }))

  document.querySelectorAll('[data-menu-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.menuFilter
    document.querySelectorAll('[data-menu-filter]').forEach(item => item.classList.toggle('is-active', item === button))
    document.querySelectorAll('.menu-item').forEach(item => {
      const visible = filter === 'all' || item.dataset.diet.split(' ').includes(filter)
      item.classList.toggle('is-filtered-out', !visible)
    })
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }))

  document.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', event => {
    if (link.getAttribute('href') === '#') { event.preventDefault(); return }
    const url = new URL(link.href, window.location.href)
    const samePageAnchor = url.pathname === window.location.pathname && url.hash
    if (samePageAnchor || url.origin !== window.location.origin || link.target === '_blank' || event.metaKey || event.ctrlKey) return
    event.preventDefault()
    // Fade the room to the house ink instead of flooding the screen with the
    // ember colour. The sheet is only ever a hand-off, never a background.
    gsap.set('.page-wipe', { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' })
    gsap.to('.page-wipe', {
      clipPath: 'inset(0 0 0 0)',
      duration: .5,
      ease: 'power3.inOut',
      onComplete: () => { window.location.href = url.href },
    })
  }))

  if (page === 'login' || page === 'signup') import('./user-auth.js').then(({ initUserAuth }) => initUserAuth())

  if (page === 'checkout') import('./checkout.js').then(({ initCheckout }) => initCheckout())

  if (page === 'reservation-confirmation') {
    import('./reservation-confirmation.js').then(({ initReservationConfirmation }) => initReservationConfirmation())
  }

  if (page === 'menu') {
    import('./menu-features.js').then(({ initMenuFeatures }) => initMenuFeatures())
  } else if (page === 'reservations') {
    import('./reservation-features.js').then(({ initReservationFeatures }) => initReservationFeatures())
  } else if (page === 'blog' || page.startsWith('journal-') || page === 'dispatch') {
    import('./journal-page.js').then(({ initJournalPage }) => { teardownJournal = initJournalPage() })
  } else if (page === 'contact') {
    import('./editorial-features.js').then(({ initEditorialFeatures }) => initEditorialFeatures())
    import('./contact-page.js').then(({ initContactPage }) => { teardownContact = initContactPage() })
    teardownMaps = initRoadMapGallery()
  } else if (page === 'about') {
    import('./editorial-features.js').then(({ initEditorialFeatures }) => initEditorialFeatures())
    initTeamLanyardRail()
    initializeIcons()
  } else if (page === 'gallery') {
    teardownEndless = initEndlessCorridor()
  }

  requestAnimationFrame(() => ScrollTrigger.refresh())
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true })
else initialize()

if (import.meta.hot) import.meta.hot.dispose(() => {
  teardownHome?.()
  teardownHomeHero?.()
  teardownContact?.()
  teardownMaps?.()
  teardownMaps = undefined
  teardownJournal?.()
  teardownPreloader?.destroy?.()
  teardownAnimations?.()
  teardownSmoothScroll?.()
  teardownEndless?.()
})
