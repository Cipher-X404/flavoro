export function initSiteAnimations({ gsap, ScrollTrigger, autoPlayHero = true } = {}) {
  const cleanups = []
  const page = document.body.dataset.page || 'home'
  const header = document.querySelector('[data-header]')
  if (header) {
    // Toggling a class only when the state actually flips keeps this off the
    // style-recalc path on every scroll frame. It is also coalesced into a
    // rAF, because `scroll` can fire several times before the next paint.
    let scrolled = null
    let queued = false
    const applyHeader = () => {
      queued = false
      const next = window.scrollY > 40
      if (next === scrolled) return
      scrolled = next
      header.classList.toggle('is-scrolled', next)
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(applyHeader)
    }
    scrolled = null
    applyHeader()
    window.addEventListener('scroll', onScroll, { passive: true })
    cleanups.push(() => window.removeEventListener('scroll', onScroll))
  }

  // Ambient CSS loops (embers, drifting spice, the marquee) run forever if
  // left alone. Pausing them once their section leaves the viewport keeps the
  // main thread and the compositor free for the content actually on screen;
  // this was the difference between a 16.7ms and a 66ms p95 scroll on the
  // about page. Play state is restored when the section comes back.
  const ambient = [...document.querySelectorAll('.fla-ember-field, .hm-spice-field, .fla-ribbon-track')]
  if (ambient.length && typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // One class drives the pause, so the cascade reaches the children
          // (which do not inherit `animation-play-state`) without inline
          // styles fighting the stylesheet.
          entry.target.classList.toggle('is-idle', !entry.isIntersecting)
        }
      },
      { rootMargin: '15% 0px' },
    )
    for (const el of ambient) io.observe(el)
    cleanups.push(() => io.disconnect())
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const noopCleanup = () => cleanups.forEach(fn => fn())
    noopCleanup.playHero = () => {}
    return noopCleanup
  }

  const shouldHoldForPreloader = page === 'home' && !autoPlayHero
  const heroTl = gsap.timeline({ paused: shouldHoldForPreloader, defaults: { ease: 'power3.out' } })
  // The home hero has its own choreography (see animations/home-story.js), so this
  // bundle only handles the interior page heroes.
  if (document.querySelector('.page-hero')) {
    // Only build this intro when the page actually has a page hero — otherwise GSAP
    // logs "target not found" warnings on pages that ship their own hero (the About
    // story, checkout, gallery, auth screens, …).
    heroTl.from('.page-hero-bg', { scale: 1.12, duration: 1.8 })
      .from('.page-hero .hero-kicker', { y: 24, opacity: 0, duration: .7 }, '-=1.05')
      .from('.page-hero .split-title', { yPercent: 25, opacity: 0, duration: 1 }, '-=.65')
      .from('.page-hero-content p', { y: 22, opacity: 0, duration: .7 }, '-=.55')
  }

  gsap.utils.toArray('[data-parallax]').forEach((section) => {
    const image = section.querySelector('.hero-bg, .page-hero-bg')
    if (image) gsap.to(image, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true } })
  })

  gsap.utils.toArray('.reveal').forEach((el) => gsap.from(el, {
    y: 50, opacity: 0, duration: .95, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 87%', once: true },
  }))
  gsap.utils.toArray('.reveal-card').forEach((el, i) => gsap.from(el, {
    y: 45, opacity: 0, rotate: i % 2 ? 1.2 : -1.2, duration: .85, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
  }))
  gsap.utils.toArray('.reveal-image').forEach((el) => {
    const image = el.querySelector('img')
    gsap.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'power4.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
    if (image) gsap.from(image, { scale: 1.18, duration: 1.5, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
  })

  document.querySelectorAll('.magnetic').forEach((el) => {
    const move = (event) => {
      const r = el.getBoundingClientRect()
      gsap.to(el, { x: (event.clientX - r.left - r.width / 2) * .18, y: (event.clientY - r.top - r.height / 2) * .18, duration: .3 })
    }
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1,.4)' })
    el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave)
    cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) })
  })

  const cursor = document.createElement('div')
  cursor.className = 'custom-cursor'
  cursor.innerHTML = '<span></span>'
  document.body.append(cursor)
  const xTo = gsap.quickTo(cursor, 'x', { duration: .25, ease: 'power3' })
  const yTo = gsap.quickTo(cursor, 'y', { duration: .25, ease: 'power3' })
  let cursorVisible = false
  const mouseMove = (e) => {
    xTo(e.clientX); yTo(e.clientY)
    if (!cursorVisible) { cursorVisible = true; cursor.classList.add('visible') }
  }
  window.addEventListener('mousemove', mouseMove, { passive: true })
  // One delegated listener, not one per control: the journal index alone has
  // several hundred focusable nodes, and this used to bind to all of them.
  const overControl = (e) => {
    const control = e.target instanceof Element ? e.target.closest('a, button, input, select, textarea') : null
    cursor.classList.toggle('hovering', Boolean(control))
  }
  document.addEventListener('pointerover', overControl, { passive: true })

  const cleanup = () => {
    cleanups.forEach(fn => fn())
    window.removeEventListener('mousemove', mouseMove)
    document.removeEventListener('pointerover', overControl)
    cursor.remove()
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
  cleanup.playHero = () => {
    if (heroTl) heroTl.play()
  }
  cleanup.heroTl = heroTl

  if (!shouldHoldForPreloader) {
    cleanup.playHero()
  }

  return cleanup
}
