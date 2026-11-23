/**
 * Journal behaviour.
 *
 * Two pages share this module.
 *
 * The index is an issue: a cover that belongs to the newest dispatch, a
 * contents page of every dispatch, a shelf of four strands, and a letter.
 * Filtering, the strand accordion and the newsletter all work without GSAP.
 *
 * A dispatch page is a feature: a sticky table of contents that tracks the
 * reader's position, a copy-link button, and a gentle drift on the cover
 * photograph. Everything degrades to a plain, readable article.
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isSubscribed, subscribeToDispatch } from './data/inquiries.js'

const readIssue = () => {
  const node = document.querySelector('.jr-issue-data')
  if (!node) return []
  try {
    const parsed = JSON.parse(node.textContent || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* -------------------------------------------------------------------------
   the letter — shared by the index and, historically, the reading room
   ------------------------------------------------------------------------- */
function initLetter(cleanups) {
  const form = document.getElementById('journal-newsletter-form')
  if (!form) return

  const input = form.querySelector('input[type="email"]')
  const note = document.querySelector('[data-jr-note]')
  const button = form.querySelector('.jrn-form-submit, .jr-submit')
  const noteDefault = note ? note.textContent : ''
  const listen = (target, type, handler) => {
    if (!target) return
    target.addEventListener(type, handler)
    cleanups.push(() => target.removeEventListener(type, handler))
  }

  listen(form, 'submit', (event) => {
    event.preventDefault()
    const email = input ? input.value.trim() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      if (note) {
        note.dataset.state = 'error'
        note.textContent = 'That address does not look complete — check it and try again.'
      }
      input?.focus()
      return
    }
    try {
      const { already } = subscribeToDispatch(email)
      if (note) {
        note.dataset.state = 'ok'
        note.textContent = already
          ? 'You are already on the list — the next letter is yours.'
          : `Done. The next letter goes to ${email}.`
      }
      if (button) {
        const label = button.querySelector('span')
        if (label) label.textContent = 'On the list'
        button.disabled = true
      }
      input?.setAttribute('disabled', 'disabled')
    } catch {
      if (note) {
        note.dataset.state = 'error'
        note.textContent = 'We could not save that just now. Try again in a moment.'
      }
    }
  })

  listen(input, 'input', () => {
    if (note && note.dataset.state === 'error') {
      note.dataset.state = ''
      note.textContent = noteDefault
    }
  })

  if (input && isSubscribed(input.value) && note) {
    note.dataset.state = 'ok'
    note.textContent = 'You are already on the list — the next letter is yours.'
  }
}

/* -------------------------------------------------------------------------
   the index
   ------------------------------------------------------------------------- */
function initIndex(cleanups) {
  const listen = (target, type, handler) => {
    if (!target) return
    target.addEventListener(type, handler)
    cleanups.push(() => target.removeEventListener(type, handler))
  }

  /* 01 · filtering by strand. Rows keep their printed order; the empty state
     only appears if a strand has no dispatches at all. */
  const filters = [...document.querySelectorAll('[data-jrn-filter]')]
  const rows = [...document.querySelectorAll('[data-jrn-row]')]
  const empty = document.querySelector('[data-jrn-empty]')

  if (filters.length && rows.length) {
    const rowSection = (row) => {
      const cat = row.querySelector('.jrn-row-cat')?.textContent.trim().toLowerCase() || ''
      return cat.split(' ')[0]
    }

    const applyFilter = (value) => {
      filters.forEach((button) => {
        const active = button.dataset.jrnFilter === value
        button.classList.toggle('is-active', active)
        button.setAttribute('aria-pressed', String(active))
      })
      let shown = 0
      rows.forEach((row) => {
        const visible = value === 'all' || rowSection(row) === value
        row.hidden = !visible
        if (visible) shown += 1
      })
      if (empty) empty.hidden = shown > 0
      // Rows animate in as a short stagger so filtering reads as a movement,
      // not a page replacement.
      if (!prefersReducedMotion() && shown) {
        gsap.fromTo(
          rows.filter((row) => !row.hidden),
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.035, ease: 'power2.out', overwrite: true },
        )
      }
    }

    filters.forEach((button) => {
      listen(button, 'click', () => applyFilter(button.dataset.jrnFilter || 'all'))
    })
  }

  /* 02 · the strands open one at a time, like turning to a section of a book */
  const strands = [...document.querySelectorAll('[data-jrn-strand]')]
  strands.forEach((strand) => {
    const toggle = strand.querySelector('[data-jrn-strand-toggle]')
    if (!toggle) return
    listen(toggle, 'click', () => {
      const open = strand.dataset.jrnOpen === 'true'
      strands.forEach((other) => {
        const otherToggle = other.querySelector('[data-jrn-strand-toggle]')
        if (other === strand) {
          other.dataset.jrnOpen = String(!open)
          otherToggle?.setAttribute('aria-expanded', String(!open))
        } else {
          other.dataset.jrnOpen = 'false'
          otherToggle?.setAttribute('aria-expanded', 'false')
        }
      })
    })
  })

  /* the cover photograph drifts a little as the headline rises */
  const cover = document.querySelector('[data-jrn-drift]')
  if (cover && !prefersReducedMotion()) {
    gsap.to(cover, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.jrn-cover', start: 'top top', end: 'bottom top', scrub: true },
    })
  }
}

/* -------------------------------------------------------------------------
   a dispatch
   ------------------------------------------------------------------------- */
function initDispatch(cleanups) {
  const listen = (target, type, handler) => {
    if (!target) return
    target.addEventListener(type, handler)
    cleanups.push(() => target.removeEventListener(type, handler))
  }

  const cover = document.querySelector('[data-art-drift]')
  if (cover && !prefersReducedMotion()) {
    gsap.to(cover, {
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: '.art-hero', start: 'top top', end: 'bottom top', scrub: true },
    })
  }

  /* the table of contents marks where the reader actually is */
  const links = [...document.querySelectorAll('.art-toc a')]
  const targets = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)

  if (targets.length && 'IntersectionObserver' in window) {
    const mark = (id) => {
      links.forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`
        link.classList.toggle('is-current', active)
        if (active) link.setAttribute('aria-current', 'true')
        else link.removeAttribute('aria-current')
      })
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible?.target?.id) mark(visible.target.id)
      },
      { rootMargin: '-110px 0px -55% 0px', threshold: 0 },
    )
    targets.forEach((target) => observer.observe(target))
    cleanups.push(() => observer.disconnect())
  }

  /* copy link — the one piece of sharing that needs no third party */
  const copy = document.querySelector('[data-art-copy]')
  if (copy) {
    const label = copy.textContent
    listen(copy, 'click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href)
        copy.textContent = 'Link copied'
      } catch {
        copy.textContent = 'Copy failed'
      }
      window.setTimeout(() => { copy.textContent = label }, 2200)
    })
  }
}

export function initJournalPage() {
  const cleanups = []
  const page = document.body.dataset.page || ''
  const isDispatch = page.startsWith('journal-')

  if (isDispatch) initDispatch(cleanups)
  else initIndex(cleanups)

  initLetter(cleanups)

  cleanups.push(() => {
    ScrollTrigger.getAll().forEach((trigger) => {
      const node = trigger.trigger
      if (node && (node.closest?.('.jrn') || node.closest?.('.art'))) trigger.kill()
    })
  })

  return () => cleanups.forEach((fn) => fn())
}
