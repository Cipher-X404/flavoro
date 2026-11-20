/**
 * Journal page behaviour — “The Reading Room”.
 *
 * The index is a bookcase: eight cloth spines stand on a shelf and the book
 * above them opens to whichever one is chosen. The spread is a tabpanel, the
 * spines are tabs with roving focus, and every dispatch is *also* linked in the
 * plain chronological index below, so the page reads fine with no JavaScript,
 * no pointer, and no taste for theatre.
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

export function initJournalPage() {
  const cleanups = []
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const listen = (target, type, handler, options) => {
    if (!target) return
    target.addEventListener(type, handler, options)
    cleanups.push(() => target.removeEventListener(type, handler, options))
  }

  const posts = readIssue()
  const spines = [...document.querySelectorAll('.jr-spine')]
  const spread = document.getElementById('jr-spread')
  const shelf = document.querySelector('[data-jr-shelf]')

  /* -------------------------------------------------- the book + the shelf */

  if (posts.length && spread && spines.length) {
    const field = (name) => spread.querySelector(`[data-jr="${name}"]`)
    const leftMedia = spread.querySelector('.jr-page-media')
    const rightPage = spread.querySelector('.jr-page--right')
    const rightBits = spread.querySelectorAll(
      '.jr-cat, .jr-post-title, .jr-sub, .jr-byline, .jr-read',
    )

    const paint = (post) => {
      const set = (name, value) => {
        const node = field(name)
        if (node) node.textContent = value
      }
      const image = field('image')
      if (image) {
        image.setAttribute('src', post.image)
        image.setAttribute('alt', post.caption)
      }
      set('volume', `Volume ${post.volume}`)
      set('caption', post.caption)
      set('category', post.category)
      set('date', post.date)
      set('title', post.title)
      set('subtitle', post.subtitle)
      set('author', post.author)
      set('role', post.role)
      set('time', post.readTime)
      const link = field('link')
      if (link) link.setAttribute('href', post.url)
    }

    let current = 0

    const select = (index, { animate = true, focus = false } = {}) => {
      const post = posts[index]
      if (!post) return
      current = index
      spines.forEach((spine, i) => {
        const active = i === index
        spine.setAttribute('aria-selected', String(active))
        spine.tabIndex = active ? 0 : -1
      })
      spread.setAttribute('aria-labelledby', `jr-spine-${index}`)
      paint(post)

      if (focus) {
        spines[index].focus({ preventScroll: true })
      }
      // Only nudge the shelf when the chosen book is actually out of view.
      const spine = spines[index]
      if (shelf && spine && typeof shelf.scrollTo === 'function') {
        const left = spine.offsetLeft
        const right = left + spine.offsetWidth
        if (left < shelf.scrollLeft || right > shelf.scrollLeft + shelf.clientWidth) {
          shelf.scrollTo({
            left: Math.max(0, left - 24),
            behavior: reduce ? 'auto' : 'smooth',
          })
        }
      }

      if (!animate || reduce) return
      const image = leftMedia?.querySelector('img')
      if (image) {
        gsap.fromTo(
          image,
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out', overwrite: true },
        )
      }
      gsap.fromTo(
        rightPage,
        { clipPath: 'inset(0 0 0 100%)' },
        { clipPath: 'inset(0 0 0 0%)', duration: 0.75, ease: 'power3.inOut', overwrite: true },
      )
      gsap.fromTo(
        rightBits,
        { y: 12, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.16,
          ease: 'power2.out',
          overwrite: true,
        },
      )
    }

    const step = (from, delta) => (from + delta + posts.length) % posts.length

    spines.forEach((spine, index) => {
      listen(spine, 'click', () => select(index))
      listen(spine, 'keydown', (event) => {
        const moves = {
          ArrowRight: () => step(index, 1),
          ArrowDown: () => step(index, 1),
          ArrowLeft: () => step(index, -1),
          ArrowUp: () => step(index, -1),
          Home: () => 0,
          End: () => posts.length - 1,
        }
        const move = moves[event.key]
        if (!move) return
        event.preventDefault()
        select(move(), { focus: true })
      })
    })

    // The spread itself is focusable, so arrows work once focus lands there.
    listen(spread, 'keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const next =
        event.key === 'ArrowRight'
          ? step(current, 1)
          : event.key === 'ArrowLeft'
            ? step(current, -1)
            : event.key === 'Home'
              ? 0
              : posts.length - 1
      select(next, { focus: true })
    })

    select(0, { animate: false })

    if (!reduce) {
      gsap.fromTo(
        spread,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: spread, start: 'top 88%', once: true },
        },
      )
      gsap.fromTo(
        spines,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.045,
          ease: 'power3.out',
          scrollTrigger: { trigger: shelf, start: 'top 92%', once: true },
        },
      )
    }
  }

  /* ------------------------------------------------------------- the cover */

  const cover = document.querySelector('[data-jr-drift]')
  if (cover && !reduce) {
    gsap.to(cover, {
      yPercent: 9,
      ease: 'none',
      scrollTrigger: {
        trigger: '.jr-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }

  /* ------------------------------------------------------------ the letter */

  const form = document.getElementById('journal-newsletter-form')
  if (form) {
    const input = form.querySelector('input[type="email"]')
    const note = document.querySelector('[data-jr-note]')
    const button = form.querySelector('.jr-submit')
    const noteDefault = note ? note.textContent : ''

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
        form.querySelector('input')?.setAttribute('disabled', 'disabled')
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

    if (input && isSubscribed(input.value)) {
      if (note) {
        note.dataset.state = 'ok'
        note.textContent = 'You are already on the list — the next letter is yours.'
      }
    }
  }

  /* -------------------------------------------------------------- teardown */

  cleanups.push(() => {
    ScrollTrigger.getAll().forEach((trigger) => {
      const node = trigger.trigger
      if (node && (node.closest?.('.jr-room') || node.classList?.contains('jr-hero'))) trigger.kill()
    })
  })

  return () => cleanups.forEach((fn) => fn())
}
