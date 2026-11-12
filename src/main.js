import './style.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { initSmoothScroll } from './animations/smooth-scroll.js'
import { initSiteAnimations } from './animations/site-animations.js'
import { initPreloader, FLAVORO_WORDS } from './animations/preloader.js'
import { initializeIcons } from './icons.js'
import { renderPage } from './pages.js'
import { initMenuFeatures } from './menu-features.js'
import { initReservationFeatures } from './reservation-features.js'

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
  document.querySelectorAll('img:not(.hero-bg):not(.page-hero-bg)').forEach(image => {
    image.loading = 'lazy'
    image.decoding = 'async'
  })
  initializeIcons()

  const heroVideo = document.querySelector('video.hero-bg')
  if (heroVideo) {
    heroVideo.muted = true
    heroVideo.play().catch(() => {})
  }

  teardownSmoothScroll = initSmoothScroll({ Lenis, gsap, ScrollTrigger })
  teardownAnimations = initSiteAnimations({ gsap, ScrollTrigger, autoPlayHero: false })

  teardownPreloader = initPreloader({
    words: FLAVORO_WORDS,
    onReveal: () => {
      teardownAnimations?.playHero?.()
      heroVideo?.play()?.catch?.(() => {})
    },
    onComplete: () => {
      ScrollTrigger.refresh()
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

  const menu = document.querySelector('[data-mobile-menu]')
  const toggleMenu = (open) => {
    menu?.classList.toggle('is-open', open)
    document.body.classList.toggle('menu-open', open)
  }
  document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => toggleMenu(true))
  document.querySelector('[data-menu-close]')?.addEventListener('click', () => toggleMenu(false))

  document.querySelectorAll('[data-demo-form]').forEach(form => form.addEventListener('submit', (event) => {
    event.preventDefault()
    const status = form.querySelector('[data-form-status]') || form.parentElement.querySelector('[data-form-status]')
    if (status) status.textContent = 'Thank you — your request has been received.'
    form.reset()
  }))

  const modal = document.querySelector('[data-lightbox-modal]')
  document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    modal.querySelector('img').src = button.dataset.lightbox
    modal.classList.add('is-open')
  }))
  modal?.querySelector('button')?.addEventListener('click', () => modal.classList.remove('is-open'))

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const selector = link.getAttribute('href')
    if (!selector || selector === '#') return
    const target = document.querySelector(selector)
    if (target) { event.preventDefault(); document.querySelector('[data-mobile-menu]')?.classList.remove('is-open'); target.scrollIntoView({ behavior: 'smooth' }) }
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

  if (page === 'menu') {
    initMenuFeatures()
  } else if (page === 'reservations') {
    initReservationFeatures()
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
