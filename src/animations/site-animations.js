export function initSiteAnimations({ gsap, ScrollTrigger, autoPlayHero = true } = {}) {
  const cleanups = []
  const header = document.querySelector('[data-header]')
  if (header) {
    const setHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40)
    setHeader()
    window.addEventListener('scroll', setHeader, { passive: true })
    cleanups.push(() => window.removeEventListener('scroll', setHeader))
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const noopCleanup = () => cleanups.forEach(fn => fn())
    noopCleanup.playHero = () => {}
    return noopCleanup
  }

  const heroTl = gsap.timeline({ paused: !autoPlayHero, defaults: { ease: 'power3.out' } })
  heroTl.from('.hero-bg, .page-hero-bg', { scale: 1.12, duration: 1.8 })
    .from('.hero-status-hud', { y: -20, opacity: 0, duration: .75 }, '-=1.3')
    .from('.hero-kicker-strip, .hero-kicker', { y: 24, opacity: 0, duration: .7 }, '-=1.05')
    .from('.split-title', { yPercent: 25, opacity: 0, duration: 1 }, '-=.65')
    .from('.hero-manifesto, .hero-content p, .page-hero-content p', { y: 22, opacity: 0, duration: .7 }, '-=.55')
    .from('.hero-actions > *', { y: 18, opacity: 0, stagger: .09, duration: .6 }, '-=.4')
    .from('.sensory-card', { x: 30, opacity: 0, stagger: .1, duration: .65 }, '-=.45')
    .from('.hero-dock-bar', { y: 20, opacity: 0, duration: .6 }, '-=.35')

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
  const mouseMove = (e) => { xTo(e.clientX); yTo(e.clientY); cursor.classList.add('visible') }
  window.addEventListener('mousemove', mouseMove)
  document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'))
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'))
  })

  const cleanup = () => {
    cleanups.forEach(fn => fn())
    window.removeEventListener('mousemove', mouseMove)
    cursor.remove()
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
  cleanup.playHero = () => heroTl.play()
  cleanup.heroTl = heroTl
  return cleanup
}
