/**
 * Contact page behaviour — “The Front Door”.
 *
 * Three jobs:
 *  1. Keep the live service signal honest (house clock, not the visitor's).
 *  2. Run the switchboard: six lines, one card, roving keyboard focus.
 *  3. Make the concierge desk actually work — validate, persist, notify, and
 *     hand the guest a reference they can quote.
 *
 * The concierge *markup* is owned by the page and never rewritten here; this
 * module only reads it, marks fields, and writes feedback into it.
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getServiceStatus } from './data/contact.js'
import { SWITCHBOARD } from './data/contact.js'
import { lastInquiry, saveInquiry, validateInquiry } from './data/inquiries.js'

const FIELD_TARGETS = {
  name: '#contact-name',
  email: '#contact-email',
  phone: '#contact-phone',
  message: '#contact-message',
  date: '#contact-date',
}

export function initContactPage() {
  const cleanups = []
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const listen = (target, type, handler, options) => {
    if (!target) return
    target.addEventListener(type, handler, options)
    cleanups.push(() => target.removeEventListener(type, handler, options))
  }

  /* ---------------------------------------------------------------- status */

  const live = document.querySelector('.ct-live')
  const label = document.querySelector('[data-ct-label]')
  const detail = document.querySelector('[data-ct-detail]')
  const clocks24 = [...document.querySelectorAll('[data-ct-clock]:not([data-ct-clock="12h"])')]
  const clocks12 = [...document.querySelectorAll('[data-ct-clock="12h"]')]
  const openWord = document.querySelector('[data-ct-openword]')
  const weekFoot = document.querySelector('[data-ct-footer-state]')

  const paintStatus = () => {
    const status = getServiceStatus()
    if (live) live.dataset.ctState = status.open ? 'open' : 'closed'
    if (label) label.textContent = `${status.label} · ${status.short}`
    if (detail) detail.textContent = status.detail
    clocks24.forEach((clock) => {
      clock.textContent = status.moment.clock
    })
    clocks12.forEach((clock) => {
      clock.textContent = status.moment.clock12
    })
    if (openWord) openWord.textContent = status.open ? 'waiting' : 'resting'
    if (weekFoot) {
      weekFoot.textContent = `${status.open ? 'Serving now' : 'Closed'} · ${status.short} · Pacific time`
    }
  }

  paintStatus()
  const clockTimer = window.setInterval(paintStatus, 30_000)
  cleanups.push(() => window.clearInterval(clockTimer))
  listen(document, 'visibilitychange', () => {
    if (!document.hidden) paintStatus()
  })

  /* ----------------------------------------------------------- switchboard */

  const lines = [...document.querySelectorAll('.ct-line')]
  const card = document.querySelector('[data-ct-card]')

  if (lines.length && card) {
    const field = (name) => card.querySelector(`[data-ct-field="${name}"]`)
    const formTrigger = card.querySelector('[data-ct-topic]')

    const selectLine = (index, { animate = true, focus = false } = {}) => {
      const line = SWITCHBOARD[index]
      if (!line) return
      lines.forEach((button, i) => {
        const active = i === index
        button.classList.toggle('is-active', active)
        button.setAttribute('aria-selected', String(active))
        button.tabIndex = active ? 0 : -1
      })
      card.setAttribute('aria-labelledby', `ct-line-${line.id}`)
      const set = (name, value) => {
        const node = field(name)
        if (node) node.textContent = value
      }
      set('line', `Line ${line.line}`)
      set('hours', line.hours)
      set('name', line.name)
      set('person', line.person)
      set('role', line.role)
      set('copy', line.copy)
      set('phone', line.phone)
      set('email', line.email)
      const bullets = field('bullets')
      if (bullets) {
        bullets.replaceChildren(
          ...line.bullets.map((item) => {
            const li = document.createElement('li')
            li.textContent = item
            return li
          }),
        )
      }
      const phone = field('phoneHref')
      if (phone) phone.setAttribute('href', line.phoneHref)
      const mail = field('mailHref')
      if (mail) mail.setAttribute('href', `mailto:${line.email}`)
      if (formTrigger) formTrigger.dataset.ctTopic = line.topic

      if (animate && !reduce) {
        gsap.fromTo(
          card.querySelectorAll('.ct-card-name, .ct-card-person, .ct-card-copy, .ct-card-bullets li, .ct-card-kicker'),
          { y: 9, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.42, stagger: 0.025, ease: 'power2.out', overwrite: true },
        )
      }
      if (focus) lines[index].focus({ preventScroll: true })
    }

    lines.forEach((button, index) => {
      listen(button, 'click', () => selectLine(index))
      listen(button, 'keydown', (event) => {
        const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']
        if (!keys.includes(event.key)) return
        event.preventDefault()
        let next = index
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % lines.length
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + lines.length) % lines.length
        if (event.key === 'Home') next = 0
        if (event.key === 'End') next = lines.length - 1
        selectLine(next, { focus: true })
      })
    })

    selectLine(0, { animate: false })

    /* the “rather write it down?” bridge into the concierge desk */
    if (formTrigger) {
      listen(formTrigger, 'click', () => {
        const form = document.getElementById('contact-inquiry-form')
        if (!form) return
        const pill = document.querySelector(
          `#inquiry-pills .type-pill[data-type="${formTrigger.dataset.ctTopic}"]`,
        )
        pill?.click()
        form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
        window.setTimeout(() => {
          document.getElementById('contact-name')?.focus({ preventScroll: true })
        }, reduce ? 0 : 520)
      })
    }
  }

  /* ------------------------------------------------------------- the route */

  const planRoute = document.querySelector('.ct-plan-route')
  if (planRoute && !reduce) {
    gsap.set(planRoute, { strokeDashoffset: 1 })
    gsap.to(planRoute, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.ct-arrive',
        start: 'top 72%',
        end: 'bottom 72%',
        scrub: 0.6,
      },
    })
  }

  document.querySelectorAll('.ct-route-step').forEach((step, index) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 84%',
      once: true,
      onEnter: () => {
        if (reduce) {
          step.classList.add('is-lit')
          return
        }
        gsap.fromTo(
          step,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, delay: index * 0.04, ease: 'power3.out' },
        )
        window.setTimeout(() => step.classList.add('is-lit'), 120)
      },
    })
  })

  /* ------------------------------------------------------ the concierge desk */

  const form = document.getElementById('contact-inquiry-form')
  if (form) {
    const topicPills = [...document.querySelectorAll('#inquiry-pills .type-pill')]
    const capsules = [...document.querySelectorAll('.apple-capsule')]
    const hiddenTopic = document.getElementById('hidden-inquiry-type')
    const hiddenParty = document.getElementById('hidden-party-size')
    const submitBtn = form.querySelector('#btn-submit-inquiry')
    const toast = document.getElementById('inquiry-success-toast')
    const footer = form.querySelector('.apple-form-footer')

    // The toast is the only confirmation a screen reader gets — announce it.
    if (toast) {
      toast.setAttribute('role', 'status')
      toast.setAttribute('aria-live', 'polite')
    }

    topicPills.forEach((pill) => {
      listen(pill, 'click', () => {
        topicPills.forEach((item) => {
          item.classList.remove('is-active')
          item.setAttribute('aria-checked', 'false')
        })
        pill.classList.add('is-active')
        pill.setAttribute('aria-checked', 'true')
        if (hiddenTopic) hiddenTopic.value = pill.dataset.type
      })
    })

    capsules.forEach((capsule) => {
      listen(capsule, 'click', () => {
        capsules.forEach((item) => {
          item.classList.remove('is-active')
          item.setAttribute('aria-checked', 'false')
        })
        capsule.classList.add('is-active')
        capsule.setAttribute('aria-checked', 'true')
        if (hiddenParty) hiddenParty.value = capsule.dataset.size
      })
    })

    // A returning guest should not retype their name and address.
    const previous = lastInquiry()
    if (previous) {
      const nameField = document.getElementById('contact-name')
      const emailField = document.getElementById('contact-email')
      const phoneField = document.getElementById('contact-phone')
      const fresh = Date.now() - new Date(previous.createdAt).getTime() < 1000 * 60 * 60 * 24 * 45
      if (fresh) {
        if (nameField && !nameField.value) nameField.value = previous.name
        if (emailField && !emailField.value) emailField.value = previous.email
        if (phoneField && !phoneField.value) phoneField.value = previous.phone
      }
    }

    const clearErrors = () => {
      form.querySelectorAll('.is-invalid').forEach((node) => node.classList.remove('is-invalid'))
      form.querySelectorAll('[aria-invalid="true"]').forEach((node) => node.removeAttribute('aria-invalid'))
      footer?.querySelector('.ct-form-error')?.remove()
    }

    const showErrors = (errors) => {
      clearErrors()
      const list = []
      Object.entries(errors).forEach(([key, message]) => {
        list.push(message)
        const target = FIELD_TARGETS[key] ? form.querySelector(FIELD_TARGETS[key]) : null
        if (!target) return
        target.setAttribute('aria-invalid', 'true')
        const wrapper = target.closest('.apple-input-box')
        ;(wrapper || target).classList.add('is-invalid')
      })
      if (!list.length || !footer) return
      const panel = document.createElement('p')
      panel.className = 'ct-form-error'
      panel.setAttribute('role', 'alert')
      panel.innerHTML = `<strong>Almost there.</strong><ul>${list.map((item) => `<li>${item}</li>`).join('')}</ul>`
      footer.prepend(panel)
      gsap.fromTo(panel, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
      const firstInvalid = form.querySelector('[aria-invalid="true"]')
      firstInvalid?.focus({ preventScroll: false })
    }

    const readForm = () => ({
      name: document.getElementById('contact-name')?.value.trim() ?? '',
      email: document.getElementById('contact-email')?.value.trim() ?? '',
      phone: document.getElementById('contact-phone')?.value.trim() ?? '',
      date: document.getElementById('contact-date')?.value ?? '',
      window: document.getElementById('contact-time-window')?.value ?? '',
      message: document.getElementById('contact-message')?.value.trim() ?? '',
      topic: hiddenTopic?.value || 'table-assistance',
      partySize: hiddenParty?.value || '1-2',
    })

    let submitting = false
    listen(form, 'submit', (event) => {
      event.preventDefault()
      if (submitting) return
      const values = readForm()
      const { ok, errors } = validateInquiry(values)
      if (!ok) {
        showErrors(errors)
        return
      }
      clearErrors()
      submitting = true

      let record
      try {
        record = saveInquiry(values)
      } catch (error) {
        submitting = false
        showErrors(error.fields || { message: 'Something went wrong saving that. Please call us.' })
        return
      }

      const original = submitBtn ? submitBtn.innerHTML : ''
      if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.innerHTML = `<span>Logged · ${record.reference}</span>`
      }

      if (toast) {
        const title = toast.querySelector('.toast-title')
        const body = toast.querySelector('.toast-body')
        if (title) title.textContent = `Request logged · ${record.reference}`
        if (body) {
          body.textContent = `${record.name.split(' ')[0]}, your note is on the ${record.topicLabel.toLowerCase()} desk. Elena’s team answers within four service hours — quote ${record.reference} if you call sooner.`
        }
        toast.hidden = false
        gsap.fromTo(
          toast,
          { opacity: 0, y: -18, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)' },
        )
        window.setTimeout(() => {
          gsap.to(toast, {
            opacity: 0,
            y: -12,
            duration: 0.5,
            onComplete: () => {
              toast.hidden = true
              gsap.set(toast, { clearProps: 'opacity,transform' })
            },
          })
        }, 11_000)
      }

      form.reset()
      topicPills[0]?.click()
      capsules[0]?.click()
      window.setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.innerHTML = original
        }
        submitting = false
      }, 2400)
      ScrollTrigger.refresh()
    })
  }

  /* ------------------------------------------------------------- teardown */

  cleanups.push(() => {
    ScrollTrigger.getAll().forEach((trigger) => {
      const node = trigger.trigger
      if (node && (node.closest?.('.ct-arrive') || node.classList?.contains('ct-route-step'))) trigger.kill()
    })
    gsap.killTweensOf('.ct-plan-route')
  })

  return () => cleanups.forEach((fn) => fn())
}
