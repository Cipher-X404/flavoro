import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initEditorialFeatures() {
  const page = document.body.dataset.page

  // Continuous scroll reveals (About & Contact Pages)
  if (page === 'about' || page === 'contact') {
    // 3a. Text & Section Header Reveals that continue triggering as user scrolls
    const textReveals = document.querySelectorAll('.apple-reveal')
    textReveals.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    // 3b. Interactive Bento & Utility Cards Staggered Continuous Reveal
    const cardGroups = [
      document.querySelectorAll('.apple-bento-card'),
      document.querySelectorAll('.apple-person-card'),
      document.querySelectorAll('.apple-utility-card'),
      document.querySelectorAll('.apple-space-banner'),
      document.querySelectorAll('.apple-spec-box')
    ]

    cardGroups.forEach((group) => {
      if (!group.length) return
      group.forEach((card, idx) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 45, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: (idx % 4) * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        )
      })
    })

    // 3c. Hero Pedestal Museum Parallax Zoom on Continuous Scroll
    const pedestalImg = document.querySelector('.apple-pedestal-frame img')
    if (pedestalImg) {
      gsap.fromTo(
        pedestalImg,
        { scale: 0.92, opacity: 0.8 },
        {
          scale: 1,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.apple-hero-pedestal',
            start: 'top 85%',
            end: 'top 20%',
            scrub: 1.2
          }
        }
      )
    }

    // 3d. Space Showcase Images Continuous Parallax Scrub
    document.querySelectorAll('.space-banner-image img').forEach((img) => {
      gsap.to(img, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.apple-space-banner'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    })

    if (page === 'about') initFlavoroAbout()

    requestAnimationFrame(() => ScrollTrigger.refresh())
  }
}

/**
 * About-page choreography.
 *
 * A single continuous story: the hero assembles line by line, images drift at a
 * different speed to the type, chapters arrive as the page is read, and the
 * numbers count themselves into place. The team lanyard section is deliberately
 * left alone — it owns its own physics and interaction model.
 */
function initFlavoroAbout() {
  const page = document.querySelector('.fl-about')
  if (!page) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    gsap.set(page.querySelectorAll('.fla-load, .fla-reveal, .fla-reveal-clip'), { clearProps: 'all' })
    return
  }

  const hero = page.querySelector('.fla-hero')
  const heroTitle = page.querySelector('.fla-hero-title')

  if (hero && heroTitle) {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    intro
      .from(page.querySelector('.fla-hero-kicker'), { y: 16, opacity: 0, duration: 0.65 })
      .from(heroTitle.querySelectorAll('.fla-line-inner'), { yPercent: 118, duration: 1.05, stagger: 0.09 }, '-=0.32')
      .from(page.querySelector('.fla-hero-lede'), { y: 24, opacity: 0, duration: 0.8 }, '-=0.58')
      .from(page.querySelector('.fla-hero-actions'), { y: 22, opacity: 0, duration: 0.75 }, '-=0.62')
      .from(page.querySelector('.fla-hero-aside'), { y: 38, opacity: 0, duration: 0.95 }, '-=0.72')
      .from(page.querySelectorAll('.fla-hero-foot > *'), { y: 16, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.52')

    // The hero recedes as the next chapter takes over.
    const heroMain = hero.querySelector('.fla-hero-main')
    const heroBackdrop = hero.querySelector('.fla-hero-backdrop img')
    if (heroMain) gsap.to(heroMain, {
      yPercent: -7,
      opacity: 0.35,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    })
    if (heroBackdrop) gsap.to(heroBackdrop, {
      scale: 1.09,
      yPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    })
  }

  const revealItems = page.querySelectorAll('.fla-reveal')
  revealItems.forEach((el) => {
    gsap.from(el, {
      y: 34,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'transform',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    })
  })

  page.querySelectorAll('.fla-reveal-clip').forEach((el) => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.15,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    )
  })

  page.querySelectorAll('[data-fla-parallax]').forEach((img) => {
    const strength = Math.min(12, Math.max(2, Number(img.dataset.flaParallax) || 5))
    // The drift moves the picture by strength/2 percent of its own height in each
    // direction, so the image has to be over-scanned or a sliver of the frame's
    // background slides into view at the top/bottom edge. The scale scales with the
    // strength, which keeps every plate covered.
    const overscan = 1 + strength / 80
    gsap.fromTo(img,
      { yPercent: -strength / 2, scale: overscan },
      {
        yPercent: strength / 2,
        scale: overscan,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('figure, article, .fla-room-panel') || img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    )
  })

  page.querySelectorAll('.fla-count').forEach((el) => {
    const target = Number(el.dataset.count)
    if (!Number.isFinite(target)) return
    const counter = { value: 0 }
    gsap.to(counter, {
      value: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 94%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(counter.value)) },
    })
  })

  const finaleTitle = page.querySelector('.fla-finale-title')
  if (finaleTitle) {
    gsap.from(finaleTitle.querySelectorAll('.fla-line-inner'), {
      yPercent: 115,
      duration: 1.1,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: finaleTitle, start: 'top 86%', once: true },
    })
  }

  const roomPanels = page.querySelectorAll('.fla-room-panel')
  roomPanels.forEach((panel, index) => {
    // Opacity only: the CSS hover lift owns this element's transform.
    gsap.from(panel.querySelector('.fla-room-copy'), {
      opacity: 0,
      duration: 0.8,
      delay: 0.12 + index * 0.05,
      ease: 'power3.out',
      scrollTrigger: { trigger: panel, start: 'top 82%', once: true },
    })
  })

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
  requestAnimationFrame(() => ScrollTrigger.refresh())
}
