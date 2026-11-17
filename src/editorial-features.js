import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initEditorialFeatures() {
  const page = document.body.dataset.page

  // 1. Blog Page Category Filtering
  if (page === 'blog') {
    const pills = document.querySelectorAll('#journal-category-pills .category-pill')
    const cards = document.querySelectorAll('.journal-posts-grid .journal-post-card')

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('is-active'))
        pill.classList.add('is-active')

        const filter = pill.dataset.journalFilter

        cards.forEach((card) => {
          const cardCat = card.dataset.category
          const shouldShow = filter === 'all' || cardCat === filter

          if (shouldShow) {
            card.style.display = 'flex'
            gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' })
          } else {
            card.style.display = 'none'
          }
        })

        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
    })
  }

  // 2. Contact Page Interactive Form & Inquiries
  if (page === 'contact') {
    const typePills = document.querySelectorAll('#inquiry-pills .type-pill')
    const hiddenTypeInput = document.getElementById('hidden-inquiry-type')
    const partyCapsules = document.querySelectorAll('.apple-capsule')
    const hiddenPartyInput = document.getElementById('hidden-party-size')
    const form = document.getElementById('contact-inquiry-form')
    const toast = document.getElementById('inquiry-success-toast')

    typePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        typePills.forEach((p) => {
          p.classList.remove('is-active')
          p.setAttribute('aria-checked', 'false')
        })
        pill.classList.add('is-active')
        pill.setAttribute('aria-checked', 'true')
        if (hiddenTypeInput) {
          hiddenTypeInput.value = pill.dataset.type
        }
      })
    })

    partyCapsules.forEach((capsule) => {
      capsule.addEventListener('click', () => {
        partyCapsules.forEach((c) => {
          c.classList.remove('is-active')
          c.setAttribute('aria-checked', 'false')
        })
        capsule.classList.add('is-active')
        capsule.setAttribute('aria-checked', 'true')
        if (hiddenPartyInput) {
          hiddenPartyInput.value = capsule.dataset.size
        }
      })
    })

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        if (!form.checkValidity()) {
          form.reportValidity()
          return
        }

        const submitBtn = form.querySelector('#btn-submit-inquiry')
        if (submitBtn) {
          submitBtn.disabled = true
          submitBtn.innerHTML = `<span>Sending request…</span>`
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false
            submitBtn.innerHTML = `<span>Request Sent Successfully</span>`
          }
          if (toast) {
            toast.hidden = false
            gsap.fromTo(
              toast,
              { opacity: 0, y: -20, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }
            )
          }
          form.reset()
          typePills[0]?.click()
          partyCapsules[0]?.click()
        }, 550)
      })
    }
  }

  // 3. Apple Continuous Scroll Reveal Animations (About & Contact Pages)
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

    requestAnimationFrame(() => ScrollTrigger.refresh())
  }
}
