import { gsap } from 'gsap'

export const FLAVORO_WORDS = [
  'flavor',
  'fire',
  'ember',
  'savor',
  'hearth',
  'spice',
  'smoke',
  'craft',
  'feast',
  'prime',
  'aroma',
  'gather',
  'roast',
  'tender',
  'table',
  'taste',
  'flame',
  'flavor',
  'fire',
  'savor',
]

// A hand-drawn cloche: stroke-dash animation keeps the illustration crisp at every size.
export function initPreloader({ words = FLAVORO_WORDS, minDuration = 1800, maxDuration = 4000, onReveal, onComplete } = {}) {
  document.getElementById('flavoro-preloader')?.remove()
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="flavoro-preloader" id="flavoro-preloader" aria-hidden="true">
      <div class="loader-ui"><div class="loader-bar js-stagger"><div class="loader-bar-progress js-progress"></div></div><span class="loader-loading js-stagger"><span class="loader-loading-text js-loop">loading</span></span></div>
      <div class="loader-type js-type"><div class="loader-type-inner"><span class="loader-words js-words"></span></div></div>
      <svg class="loader-cloche" viewBox="0 0 512 512" fill="none" aria-hidden="true">
        <g class="loader-drawing" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M80 365C86 263 160 207 256 207s170 56 176 158" />
          <path d="M56 379h400c-5 21-22 29-45 29H101c-23 0-40-8-45-29Z" />
          <path d="M142 433h228l-14 24H156z" />
          <path d="M225 207c2-23 14-36 31-36s29 13 31 36" />
          <path d="M163 173c22-20 25-33 4-45-21-13-19-28 3-48" />
          <path d="M256 150c22-20 25-33 4-45-21-13-19-28 3-48" />
          <path d="M349 173c22-20 25-33 4-45-21-13-19-28 3-48" />
        </g>
      </svg>
    </div>`)
  const root = document.getElementById('flavoro-preloader')
  const progress = root.querySelector('.js-progress')
  const word = root.querySelector('.js-words')
  const cloche = root.querySelector('.loader-cloche')
  const paths = [...root.querySelectorAll('.loader-drawing path')]
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  paths.forEach(path => { const length = path.getTotalLength(); gsap.set(path, { strokeDasharray: length, strokeDashoffset: length }) })
  word.textContent = words[0] || 'flavor'
  const intro = gsap.timeline().to(root.querySelectorAll('.js-stagger'), { autoAlpha: 1, duration: .4, stagger: .1 }).to(root.querySelector('.js-type'), { autoAlpha: 1, duration: .4 }, 0.15)
  const loop = gsap.timeline({ repeat: -1, paused: reduced }).to(root.querySelector('.js-loop'), { yPercent: -105, duration: .65 }, 1).set(root.querySelector('.js-loop'), { yPercent: 105 }).to(root.querySelector('.js-loop'), { yPercent: 0, duration: .65 }, 2.5)
  let raf, outro, destroyed = false, started = false, current = 0, loaded = 0
  const start = performance.now()
  function update() {
    if (destroyed) return
    if (!started) {
      const elapsed = performance.now() - start
      const images = [...document.querySelectorAll('img')].slice(0, 8)
      const ratio = images.length ? images.filter(img => img.complete).length / images.length : 1
      loaded = elapsed >= maxDuration || (elapsed >= minDuration && (document.readyState === 'complete' || ratio >= .8)) ? 1 : Math.min(elapsed / minDuration * .75 + ratio * .25, .96)
      current = Math.min(loaded, current + .015)
      progress.style.transform = `scaleX(${current})`
      word.textContent = words[Math.floor(elapsed / 95) % words.length] || 'flavor'
      if (current >= .99 && loaded === 1) triggerOutro()
    }
    raf = requestAnimationFrame(update)
  }
  raf = requestAnimationFrame(update)
  function triggerOutro() {
    if (started || destroyed) return
    started = true
    loop.kill()
    if (reduced) {
      onReveal?.()
      outro = gsap.to(root, { autoAlpha: 0, duration: .3, onComplete: destroy })
      return
    }
    outro = gsap.timeline({ onComplete: destroy })
      .to([root.querySelector('.js-type'), ...root.querySelectorAll('.js-stagger')], { autoAlpha: 0, duration: .35, stagger: .04 })
      .set(cloche, { autoAlpha: 1 })
      .to(paths, { strokeDashoffset: 0, duration: 1.05, stagger: .09, ease: 'power2.inOut' }, '-=.05')
      .to(cloche, { scale: 8, duration: 1.05, ease: 'power3.in', onStart: () => onReveal?.() }, '+=.1')
      .to(root, { autoAlpha: 0, duration: .55, ease: 'power2.inOut' }, '-=.55')
  }
  function destroy() {
    if (destroyed) return
    destroyed = true
    cancelAnimationFrame(raf)
    intro.kill(); loop.kill(); outro?.kill()
    root.remove()
    onComplete?.()
  }
  return { triggerOutro, destroy }
}
