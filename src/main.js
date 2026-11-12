import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initSmoothScroll } from './animations/smooth-scroll.js'
import { initSiteAnimations } from './animations/site-animations.js'
import { initPreloader, FLAVORO_WORDS } from './animations/preloader.js'
import { initializeIcons } from './icons.js'
import { renderPage } from './pages.js'
import { applyLocalSettings, showLocalUpdate } from './site-updates.js'

gsap.registerPlugin(ScrollTrigger)

let teardownSmoothScroll
let teardownAnimations
let teardownPreloader

function initialize() {
  const page = document.body.dataset.page || 'home'
  if (!document.querySelector('.page-wipe')) {
    document.body.insertAdjacentHTML('afterbegin', `<div class="page-wipe" aria-hidden="true"></div>`)
  }
  document.querySelector('#app').innerHTML = renderPage(page)
  if (page === 'home') applyLocalSettings()
  document.querySelectorAll('img:not(.hero-bg):not(.page-hero-bg)').forEach(image => {
    image.loading = 'lazy'
    image.decoding = 'async'
  })
  initializeIcons()

  const heroVideo = document.querySelector('video.hero-bg')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const videoToggle = document.querySelector('[data-video-toggle]')
  if (heroVideo) {
    heroVideo.muted = true
    if (reduceMotion) heroVideo.pause()
    else heroVideo.play().catch(() => {})
    const syncVideoControl = () => {
      if (!videoToggle) return
      const paused = heroVideo.paused
      videoToggle.innerHTML = paused ? '▶ <span>PLAY FILM</span>' : 'Ⅱ <span>PAUSE FILM</span>'
      videoToggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video')
      videoToggle.setAttribute('aria-pressed', String(paused))
    }
    heroVideo.addEventListener('play', syncVideoControl)
    heroVideo.addEventListener('pause', syncVideoControl)
    videoToggle?.addEventListener('click', () => { if (heroVideo.paused) heroVideo.play().catch(() => {}); else heroVideo.pause() })
    syncVideoControl()
  }

  teardownSmoothScroll = initSmoothScroll({ Lenis, gsap, ScrollTrigger })
  teardownAnimations = initSiteAnimations({ gsap, ScrollTrigger, autoPlayHero: false })

  teardownPreloader = initPreloader({
    words: FLAVORO_WORDS,
    onReveal: () => {
      teardownAnimations?.playHero?.()
      if (!reduceMotion && !heroVideo?.paused) heroVideo?.play()?.catch?.(() => {})
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
  const toggleMenu = (open) => {
    menu?.classList.toggle('is-open', open)
    document.body.classList.toggle('menu-open', open)
    menuToggle?.setAttribute('aria-expanded', String(open))
    if (open) menu?.querySelector('[data-menu-close]')?.focus()
    else menuToggle?.focus()
  }
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
    gsap.to('.page-wipe', { scaleY: 1, transformOrigin: 'bottom', duration: .55, ease: 'power3.inOut', onComplete: () => { window.location.href = url.href } })
  }))

  if (page === 'login' || page === 'signup') import('./user-auth.js').then(({ initUserAuth }) => initUserAuth())

  if (page === 'checkout') import('./checkout.js').then(({ initCheckout }) => initCheckout())

  if (page === 'menu') {
    import('./menu-features.js').then(({ initMenuFeatures }) => initMenuFeatures())
  } else if (page === 'reservations') {
    import('./reservation-features.js').then(({ initReservationFeatures }) => initReservationFeatures())
  }

  requestAnimationFrame(() => ScrollTrigger.refresh())
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true })
else initialize()

if (import.meta.hot) import.meta.hot.dispose(() => {
  teardownPreloader?.destroy?.()
  teardownAnimations?.()
  teardownSmoothScroll?.()
})
