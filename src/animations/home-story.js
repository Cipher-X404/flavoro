import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Home choreography — “seven scenes at the hearth”.
 *
 * The stacking itself is CSS (each scene is sticky), so the page still reads
 * correctly with JavaScript switched off. GSAP adds the choreography on top:
 * the film assembles behind the preloader, every scene rises into its own
 * reveal, the sheet underneath recedes as the next one covers it, photographs
 * drift out of phase with the type, and the numbers count themselves in.
 *
 * Returns a teardown function that also exposes `playHero`, matching the shape
 * the preloader expects from the site animation bundle.
 */
export function initHomeStory() {
  const root = document.querySelector('.hm')
  if (!root) return () => {}

  const scenes = [...root.querySelectorAll('.hm-scene')]
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cleanups = []
  const animated = []

  const on = (target, type, handler, options) => {
    if (!target) return
    target.addEventListener(type, handler, options)
    cleanups.push(() => target.removeEventListener(type, handler, options))
  }

  const remember = (animation) => {
    animated.push(animation)
    return animation
  }

  /* ---------------------------------------------------------------------
     01 · the hero assembles behind the preloader
     ------------------------------------------------------------------- */
  const hero = root.querySelector('.hm-hero')
  let heroTl = null
  let heroPlayed = false

  if (hero && !reduce) {
    const title = hero.querySelector('.hero-title')
    const lines = title ? [...title.children] : []
    const rises = [...hero.querySelectorAll('.hm-rise')]
    const film = hero.querySelector('.hero-bg')
    const meta = hero.querySelector('.hm-hero-meta')

    heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })

    if (film) heroTl.from(film, { scale: 1.16, duration: 2.6, ease: 'power2.out' }, 0)
    heroTl.from(hero.querySelector('.hm-overline'), { y: 14, autoAlpha: 0, duration: 0.8 }, 0.15)

    // The headline wipes up from its own baseline — clip only, so the hand-set
    // rotation on the script line survives.
    if (lines.length) {
      heroTl.fromTo(
        lines,
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0% 0 0 0)', duration: 1.15, stagger: 0.1, ease: 'power3.out' },
        0.3,
      )
    }
    if (rises.length) heroTl.from(rises, { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.09 }, 0.7)
    if (meta) heroTl.from(meta, { autoAlpha: 0, duration: 0.8 }, 0.95)
  }

  const playHero = () => {
    if (heroPlayed || !heroTl) return
    heroPlayed = true
    heroTl.play()
  }

  // If the preloader never reports back, the film still assembles.
  if (heroTl) {
    const safety = window.setTimeout(playHero, 9000)
    cleanups.push(() => window.clearTimeout(safety))
  }

  /* ---------------------------------------------------------------------
     the sheet underneath recedes as the next one rises over it
     ------------------------------------------------------------------- */
  // The recede only makes sense while the scenes are stacked. Phones on their
  // side fall back to normal flow (see the 520px height query in the stylesheet)
  // and get none of it — the listener keeps the two in step on rotation.
  const stackedQuery = window.matchMedia('(min-height: 521px)')
  let coverTweens = []

  const buildCover = () => {
    if (reduce || coverTweens.length) return
    const lastPanel = root.querySelector('.hm-footer-panel')
    scenes.forEach((scene, index) => {
      const next = scenes[index + 1] || lastPanel
      if (!next) return
      coverTweens.push(remember(gsap.to(scene, {
        scale: 0.94,
        opacity: 0.42,
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
      })))
    })
  }

  const clearCover = () => {
    coverTweens.forEach((tween) => { tween.scrollTrigger?.kill(); tween.kill() })
    coverTweens = []
    gsap.set(scenes, { clearProps: 'transform,opacity' })
  }

  if (stackedQuery.matches) buildCover()
  if (typeof stackedQuery.addEventListener === 'function') {
    const onStackChange = (event) => { if (event.matches) buildCover(); else clearCover() }
    stackedQuery.addEventListener('change', onStackChange)
    cleanups.push(() => {
      stackedQuery.removeEventListener('change', onStackChange)
      clearCover()
    })
  }

  /* ---------------------------------------------------------------------
     each scene reveals itself as it comes up
     ------------------------------------------------------------------- */
  scenes.forEach((scene) => {
    const masks = scene.querySelectorAll('.hm-mask-in')
    const fades = scene.querySelectorAll('[data-hm-fade]')
    if (!masks.length && !fades.length) return

    if (reduce) {
      gsap.set([...masks, ...fades], { clearProps: 'all' })
      return
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: scene, start: 'top 62%', once: true },
    })
    if (masks.length) tl.fromTo(masks, { yPercent: 108 }, { yPercent: 0, duration: 1.05, stagger: 0.09 }, 0)
    if (fades.length) tl.from(fades, { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.09 }, 0.2)
    remember(tl)
  })

  /* ---------------------------------------------------------------------
     photographs drift out of phase with the type
     ------------------------------------------------------------------- */
  root.querySelectorAll('[data-hm-drift]').forEach((image) => {
    const scene = image.closest('.hm-scene')
    if (!scene || reduce) return
    const strength = Math.max(4, Math.min(16, Number(image.dataset.hmDrift) || 8))
    remember(gsap.fromTo(image,
      { yPercent: -strength / 2, scale: 1.08 },
      {
        yPercent: strength / 2,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: scene, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    ))
  })

  /* ---------------------------------------------------------------------
     the numbers count themselves in
     ------------------------------------------------------------------- */
  root.querySelectorAll('[data-hm-count]').forEach((el) => {
    const target = Number(el.dataset.hmCount)
    if (!Number.isFinite(target)) return
    if (reduce) { el.textContent = String(target); return }
    const counter = { value: 0 }
    el.textContent = '0'
    remember(gsap.to(counter, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(counter.value)) },
    }))
  })

  /* ---------------------------------------------------------------------
     the hearth line draws itself
     ------------------------------------------------------------------- */
  const flamePaths = [...root.querySelectorAll('.hm-flame path')]
  if (flamePaths.length && !reduce) {
    let measured = true
    flamePaths.forEach((path) => {
      const length = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 0
      if (!length) { measured = false; return }
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    })
    if (measured) {
      remember(gsap.to(flamePaths, {
        strokeDashoffset: 0,
        duration: 1.6,
        stagger: 0.22,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '.hm-fire', start: 'top 66%', once: true },
      }))
    }
  }

  /* ---------------------------------------------------------------------
     the roles ticker — an endless, seamless drift
     ------------------------------------------------------------------- */
  const ticker = root.querySelector('.hm-ticker-track')
  if (ticker && !reduce) {
    const loop = remember(gsap.to(ticker, { xPercent: -50, duration: 46, ease: 'none', repeat: -1 }))
    const slow = () => loop.timeScale(0.25)
    const normal = () => loop.timeScale(1)
    on(ticker.parentElement, 'pointerenter', slow)
    on(ticker.parentElement, 'pointerleave', normal)
  }

  /* ---------------------------------------------------------------------
     the photograph that follows the cursor across the menu
     ------------------------------------------------------------------- */
  const peekRows = [...root.querySelectorAll('[data-hm-peek]')]
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (peekRows.length && !reduce && canHover) {
    const peek = document.createElement('div')
    peek.className = 'hm-peek'
    peek.setAttribute('aria-hidden', 'true')
    peek.innerHTML = '<img alt="">'
    document.body.append(peek)
    cleanups.push(() => peek.remove())

    const peekImage = peek.querySelector('img')
    gsap.set(peek, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.82 })
    const moveX = gsap.quickTo(peek, 'x', { duration: 0.55, ease: 'power3' })
    const moveY = gsap.quickTo(peek, 'y', { duration: 0.55, ease: 'power3' })
    on(window, 'pointermove', (event) => { moveX(event.clientX); moveY(event.clientY) })

    peekRows.forEach((row) => {
      on(row, 'pointerenter', () => {
        peekImage.src = row.dataset.hmPeek
        gsap.to(peek, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
      })
      on(row, 'pointerleave', () => {
        gsap.to(peek, { autoAlpha: 0, scale: 0.86, duration: 0.35, ease: 'power2.in', overwrite: 'auto' })
      })
    })
  }

  /* ---------------------------------------------------------------------
     the rail — where you are in the book
     ------------------------------------------------------------------- */
  const rail = root.querySelector('.hm-rail')
  const railFill = rail ? rail.querySelector('.hm-rail-line i') : null
  const railItems = rail ? [...rail.querySelectorAll('li')] : []
  const panelCount = scenes.length + 1
  let activeScene = -1

  const syncRail = () => {
    const viewport = window.innerHeight || 1
    const y = window.pageYOffset || document.documentElement.scrollTop || 0
    const index = Math.max(0, Math.min(panelCount - 1, Math.round(y / viewport)))
    if (index !== activeScene) {
      activeScene = index
      railItems.forEach((item, i) => item.classList.toggle('is-active', i === index))
    }
    if (railFill) {
      const progress = Math.max(0, Math.min(1, y / Math.max(1, (panelCount - 1) * viewport)))
      gsap.set(railFill, { scaleY: progress })
    }
  }

  syncRail()
  on(window, 'scroll', syncRail, { passive: true })
  on(window, 'resize', syncRail)
  if (railFill) cleanups.push(() => gsap.set(railFill, { scaleY: 0 }))

  /* ---------------------------------------------------------------------
     keep the triggers honest once the photographs have decoded
     ------------------------------------------------------------------- */
  on(window, 'load', () => ScrollTrigger.refresh())
  cleanups.push(() => {
    animated.forEach((animation) => animation.kill())
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger && root.contains(trigger.trigger)) trigger.kill()
    })
  })

  const destroy = () => cleanups.forEach((fn) => fn())
  destroy.playHero = playHero
  return destroy
}
