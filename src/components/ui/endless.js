import { gsap } from 'gsap'

// Local only. These previously alternated with six images hosted on
// cdn.21st.dev, all of which now 404 — half the corridor was empty planes.
export const ENDLESS_IMAGE_URLS = [
  '/images/hero-pasta.jpg',
  '/images/restaurant-interior.jpg',
  '/images/cocktails.jpg',
  '/images/private-dining.jpg',
  '/images/chef-team.jpg',
  '/images/dessert.jpg',
  '/images/editorial/hearth-coals.jpg',
  '/images/editorial/dining-room.jpg',
  '/images/market-fish.jpg',
  '/images/editorial/bartender.jpg',
  '/images/garden-salad.jpg',
  '/images/breakfast.jpg',
]

const TOTAL = ENDLESS_IMAGE_URLS.length
const Z_FAR = -2400
const Z_NEAR = 780
const RANGE = Z_NEAR - Z_FAR
const DURATION = 16
const FADE_IN = 0.06
const FADE_OUT = 0.04

function opacityForProgress(progress) {
  if (progress < FADE_IN) return Math.max(0, progress / FADE_IN)
  if (progress > 1 - FADE_OUT) return Math.max(0, (1 - progress) / FADE_OUT)
  return 1
}

function getLayout() {
  const width = window.innerWidth
  const planeW = width < 768 ? Math.min(width * 0.28, 220) : Math.min(width * 0.26, 440)
  return {
    planeW,
    planeH: planeW * (4 / 3),
    offsetX: width * 0.33,
    angle: 24,
  }
}

/**
 * Renders the HTML markup for the Endless 3D corridor section
 */
export function renderEndlessSection(options = {}) {
  const title = options.title || 'Life around our hearth.'
  const eyebrow = options.eyebrow || 'A VISUAL CHRONICLE'
  const subline = options.subline || 'Morning prep at dawn, wine poured at dusk, and laughter echoing late into the night.'
  const caption = options.caption || 'Flavoro Restaurant · Hayes Valley, San Francisco'

  const planesHtml = ENDLESS_IMAGE_URLS.map(
    (url, index) => `
      <div class="endless-plane" data-index="${index}">
        <img src="${url}" alt="Flavoro atmosphere visual ${index + 1}" loading="lazy" decoding="async">
      </div>
    `
  ).join('')

  return `
    <section class="endless-root" aria-label="Endless 3D image corridor">
      <div class="endless-scene">
        <div class="endless-world">
          ${planesHtml}
        </div>
      </div>

      <div class="endless-title-wrap">
        <span class="endless-eyebrow">${eyebrow}</span>
        <h1 class="endless-title">${title}</h1>
        <p class="endless-subline">${subline}</p>
      </div>

      <div class="endless-footer">
        <svg
          class="endless-globe"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          height="24"
          width="24"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            strokeWidth="1"
            d="M23 12c0 -6.075 -4.925 -11 -11 -11m11 11c0 6.075 -4.925 11 -11 11m11 -11c0 2.21 -4.925 4 -11 4S1 14.21 1 12M12 1C5.925 1 1 5.925 1 12M12 1c2.761 0 5 4.925 5 11s-2.239 11 -5 11m0 -22C9.239 1 7 5.925 7 12s2.239 11 5 11M1 12c0 6.075 4.925 11 11 11"
          />
        </svg>
        <p class="endless-caption">${caption}</p>
      </div>
    </section>
  `
}

/**
 * Initializes the 3D GSAP perspective timeline for the Endless Corridor
 */
export function initEndlessCorridor(rootSelector = '.endless-root') {
  const root = typeof rootSelector === 'string' ? document.querySelector(rootSelector) : rootSelector
  if (!root) return () => {}

  const world = root.querySelector('.endless-world')
  if (!world) return () => {}

  const planes = Array.from(world.querySelectorAll('.endless-plane'))
  if (!planes.length) return () => {}

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tweens = []

  gsap.ticker.lagSmoothing(0)
  gsap.set(world, { force3D: true })

  const applyLayout = () => {
    const { planeW, planeH, offsetX, angle } = getLayout()
    planes.forEach((plane, index) => {
      const isLeft = index % 2 === 0
      plane.style.width = `${planeW}px`
      plane.style.height = `${planeH}px`
      gsap.set(plane, {
        xPercent: -50,
        yPercent: -50,
        x: isLeft ? -offsetX : offsetX,
        y: 0,
        rotationY: isLeft ? angle : -angle,
        force3D: true,
      })
    })
  }

  applyLayout()

  planes.forEach((plane, index) => {
    const img = plane.querySelector('img')
    const startProgress = index / TOTAL

    gsap.set(plane, { z: Z_FAR + startProgress * RANGE })
    if (img) img.style.opacity = String(opacityForProgress(startProgress))
    plane.style.zIndex = String(Math.round(startProgress * 1000))

    if (reduceMotion) return

    const tween = gsap.fromTo(
      plane,
      { z: Z_FAR },
      {
        z: Z_NEAR,
        duration: DURATION,
        ease: 'none',
        repeat: -1,
        immediateRender: false,
        onUpdate() {
          const progress = this.progress()
          if (img) img.style.opacity = String(opacityForProgress(progress))
          plane.style.zIndex = String(Math.round(progress * 1000))
        },
      }
    )

    tween.progress(startProgress)
    tweens.push(tween)
  })

  const handleResize = () => {
    applyLayout()
  }

  window.addEventListener('resize', handleResize)

  return () => {
    window.removeEventListener('resize', handleResize)
    tweens.forEach((tween) => tween.kill())
    gsap.killTweensOf(planes)
  }
}
