import { getHeroFacts } from './data/contact.js'

/**
 * Two things on the home hero are alive: the state of the house (status line
 * and the plaque), and the last word of the headline, which turns over every
 * couple of seconds — flavor, fire, feast, warmth, hearth.
 *
 * The first word is rendered server-side (see `home()`), so nothing flashes on
 * load; this module only keeps it moving, and stops the moment the tab is put
 * away.
 */
const REFRESH_MS = 60_000
const HERO_WORDS = ['the fire dies.', 'you say so.', 'the last train.']
const WORD_MS = 2000
const WORD_EXIT_MS = 340

export function initHomeHero() {
  const hero = document.querySelector('.hm-hero')
  if (!hero) return undefined

  const slot = (name) => hero.querySelector(`[data-hm-${name}]`)
  const slots = {
    label: slot('label'),
    short: slot('short'),
    day: slot('day'),
    fire: slot('fire'),
    bar: slot('bar'),
  }

  const paint = () => {
    const facts = getHeroFacts()
    if (slots.label) slots.label.textContent = facts.label
    if (slots.short) slots.short.textContent = facts.short
    if (slots.day) slots.day.textContent = facts.day
    if (slots.fire) slots.fire.textContent = facts.fire
    if (slots.bar) slots.bar.textContent = facts.bar
    hero.dataset.hmOpen = facts.open ? 'open' : 'closed'
  }

  paint()

  /* --- the turning word ------------------------------------------------ */

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const cycle = hero.querySelector('[data-hm-cycle]')
  let wordIndex = 0
  let wordTimer = null
  let swapTimer = null

  const swapWord = () => {
    if (!cycle) return
    cycle.dataset.state = 'out'
    swapTimer = window.setTimeout(() => {
      wordIndex = (wordIndex + 1) % HERO_WORDS.length
      cycle.textContent = HERO_WORDS[wordIndex]
      cycle.dataset.state = 'in'
    }, WORD_EXIT_MS)
  }

  const startWords = () => {
    if (!cycle || reduceMotion || wordTimer) return
    wordTimer = window.setInterval(swapWord, WORD_MS)
  }

  const stopWords = () => {
    window.clearInterval(wordTimer)
    window.clearTimeout(swapTimer)
    wordTimer = null
  }

  startWords()

  const timer = window.setInterval(paint, REFRESH_MS)
  const onVisibility = () => {
    if (document.hidden) {
      stopWords()
      return
    }
    paint()
    startWords()
  }
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.clearInterval(timer)
    stopWords()
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
