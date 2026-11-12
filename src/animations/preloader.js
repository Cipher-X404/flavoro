/**
 * Flavoro Signature Preloader & Kinetic Culinary Text Sequence
 * - Fullscreen minimalist monochrome canvas + DOM layout
 * - High-speed kinetic culinary text sequence centered in viewport
 * - Bottom-left thin progress bar tracking asset readiness
 * - Bottom-right vertical looping "loading" status indicator
 * - Unique Radiant Culinary Hearth Star (Ember Spark) canvas expansion reveal
 */

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

/**
 * Draws the unique Radiant Culinary Hearth Star (Ember Spark) emblem on canvas
 */
function drawHearthStar(ctx, cx, cy, size, lineWidth) {
  const n = size
  const ctrl = n * 0.16
  const diagSize = n * 0.52
  const diagCtrl = diagSize * 0.16

  ctx.save()
  ctx.fillStyle = '#12100e'
  ctx.strokeStyle = '#12100e'
  ctx.lineWidth = Math.max(lineWidth / 2, 2)
  ctx.lineJoin = 'miter'
  ctx.lineCap = 'round'

  // 1. Diagonal radiant sparks (ember flare points at 45 deg)
  const dX = diagSize * Math.SQRT1_2
  const dY = diagSize * Math.SQRT1_2
  const cX = diagCtrl * Math.SQRT1_2
  const cY = diagCtrl * Math.SQRT1_2

  ctx.beginPath()
  ctx.moveTo(cx + dX, cy - dY)
  ctx.quadraticCurveTo(cx + cX, cy, cx + dX, cy + dY)
  ctx.quadraticCurveTo(cx, cy + cY, cx - dX, cy + dY)
  ctx.quadraticCurveTo(cx - cX, cy, cx - dX, cy - dY)
  ctx.quadraticCurveTo(cx, cy - cY, cx + dX, cy - dY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 2. Primary 4-pointed cardinal flame star (North, East, South, West)
  ctx.beginPath()
  ctx.moveTo(cx, cy - n)
  ctx.quadraticCurveTo(cx + ctrl, cy - ctrl, cx + n, cy)
  ctx.quadraticCurveTo(cx + ctrl, cy + ctrl, cx, cy + n)
  ctx.quadraticCurveTo(cx - ctrl, cy + ctrl, cx - n, cy)
  ctx.quadraticCurveTo(cx - ctrl, cy - ctrl, cx, cy - n)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 3. Central glowing hearth core (small circular eye)
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(n * 0.1, 3), 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function initPreloader(options = {}) {
  const {
    words = FLAVORO_WORDS,
    minDuration = 1800,
    maxDuration = 4000,
    onReveal = null,
    onComplete = null,
  } = options

  // Clean up any existing instance
  const existing = document.getElementById('flavoro-preloader')
  if (existing) existing.remove()

  const html = `
    <div class="flavoro-preloader" id="flavoro-preloader" aria-hidden="true">
      <div class="loader-canvas-wrap">
        <canvas class="loader-canvas"></canvas>
      </div>
      <div class="loader-ui">
        <div class="loader-bar js-stagger">
          <div class="loader-bar-progress js-progress"></div>
        </div>
        <span class="loader-loading js-stagger">
          <span class="loader-loading-text js-loop">loading</span>
        </span>
      </div>
      <div class="loader-type js-type">
        <div class="loader-type-inner">
          <span class="loader-words js-words">${words[0] || 'flavor'}</span>
        </div>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML('afterbegin', html)

  const root = document.getElementById('flavoro-preloader')
  const canvas = root.querySelector('.loader-canvas')
  const ctx = canvas.getContext('2d')
  const progressEl = root.querySelector('.js-progress')
  const typeEl = root.querySelector('.js-type')
  const wordsEl = root.querySelector('.js-words')
  const staggerEls = root.querySelectorAll('.js-stagger')
  const loopEl = root.querySelector('.js-loop')

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const isDesktop = window.innerWidth >= 768
  const baseSize = isDesktop ? 160 : 80
  const baseLineWidth = isDesktop ? 225 : 112

  const vars = {
    size: baseSize,
    lineWidth: baseLineWidth,
  }

  const tween = {
    size: baseSize,
    lineWidth: baseLineWidth,
    logoAlpha: 1, // 1 = white mask covers emblem, 0 = emblem fully revealed
  }

  let rafId = null
  let globalProgress = 0
  let currentProgress = 0
  let loadedProgress = 0
  let isOutroStarted = false
  let isDestroyed = false

  function resizeCanvas() {
    if (isDestroyed) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas, { passive: true })

  // Infinite sliding loop for bottom-right "loading" text
  const loopTl = gsap.timeline({ repeat: -1, paused: prefersReducedMotion })
  loopTl
    .to(loopEl, { yPercent: -105, duration: 0.65, ease: 'power2.inOut' }, 1)
    .set(loopEl, { yPercent: 105 })
    .to(loopEl, { yPercent: 0, duration: 0.65, ease: 'power2.out' }, 2.5)

  // RAF loop: updates text sequence and canvas graphic
  function updateFrame() {
    if (isDestroyed) return

    const w = window.innerWidth
    const h = window.innerHeight

    ctx.clearRect(0, 0, w, h)

    // Draw the unique Radiant Culinary Hearth Star in center
    const cx = w / 2
    const cy = h / 2
    drawHearthStar(ctx, cx, cy, tween.size, tween.lineWidth)

    // White cover mask (fades out during outro to reveal hearth emblem)
    if (tween.logoAlpha > 0.001) {
      ctx.save()
      ctx.globalAlpha = tween.logoAlpha
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }

    // Advance word sequence progress
    if (!isOutroStarted) {
      globalProgress += 0.008
      if (globalProgress >= 1) globalProgress = 0

      const wordIdx = Math.floor(globalProgress * (words.length - 1))
      const word = words[wordIdx] || words[0]
      if (wordsEl.textContent !== word) {
        wordsEl.textContent = word
      }

      // Smooth progress bar update
      if (currentProgress < loadedProgress) {
        currentProgress += 0.015
        if (currentProgress > loadedProgress) currentProgress = loadedProgress
      }

      progressEl.style.transform = `scaleX(${currentProgress})`

      // If load is complete and bar reached 100%, trigger outro
      if (currentProgress >= 0.99 && loadedProgress >= 1) {
        triggerOutro()
      }
    }

    rafId = requestAnimationFrame(updateFrame)
  }

  rafId = requestAnimationFrame(updateFrame)

  // In animation (stagger in bar and loading, fade in center word)
  gsap.timeline()
    .to(staggerEls, { autoAlpha: 1, duration: 0.4, ease: 'none', stagger: 0.1 }, 0)
    .to(typeEl, { autoAlpha: 1, duration: 0.4, ease: 'none' }, 0.15)

  // Track readiness
  const startTime = performance.now()

  function evaluateReadiness() {
    const elapsed = performance.now() - startTime
    const timeProgress = Math.min(elapsed / minDuration, 1)

    const images = Array.from(document.querySelectorAll('img')).slice(0, 8)
    const loadedImages = images.filter(img => img.complete).length
    const imgRatio = images.length ? loadedImages / images.length : 1

    if (timeProgress >= 1 && (document.readyState === 'complete' || imgRatio >= 0.8)) {
      loadedProgress = 1
    } else {
      loadedProgress = Math.min(timeProgress * 0.75 + imgRatio * 0.25, 0.96)
    }
  }

  const checkInterval = setInterval(evaluateReadiness, 50)

  const timeoutId = setTimeout(() => {
    loadedProgress = 1
  }, maxDuration)

  // Outro transition
  function triggerOutro() {
    if (isOutroStarted || isDestroyed) return
    isOutroStarted = true
    clearInterval(checkInterval)
    clearTimeout(timeoutId)

    const w = window.innerWidth
    const h = window.innerHeight
    const maxDim = Math.max(w, h)
    const scaleFactor = Math.round((maxDim + 120) / vars.size)

    if (prefersReducedMotion) {
      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.out',
        onStart: () => onReveal?.(),
        onComplete: destroy,
      })
      return
    }

    const outroTl = gsap.timeline({
      onComplete: destroy,
    })

    // 1. Staggered fade out of progress bar and loading text
    outroTl.to(staggerEls, {
      autoAlpha: 0,
      duration: 0.4,
      ease: 'none',
      stagger: 0.05,
    }, 0)

    // 2. Center culinary word fades out
    outroTl.to(typeEl, {
      autoAlpha: 0,
      duration: 0.4,
      ease: 'none',
    }, 0.2)

    // 3. Canvas white mask fades out, revealing the unique hearth star
    outroTl.to(tween, {
      logoAlpha: 0,
      duration: 0.4,
      ease: 'none',
    }, 0.5)

    // 4. Hearth star massively scales out to blanket the viewport
    outroTl.to(tween, {
      size: vars.size * scaleFactor,
      lineWidth: vars.lineWidth * scaleFactor,
      duration: 0.65,
      ease: 'quint.inOut',
      onStart: () => {
        onReveal?.()
      },
    }, 1.0)

    // 5. Container fades out, unveiling the site
    outroTl.to(root, {
      autoAlpha: 0,
      duration: 0.3,
      ease: 'none',
    }, 1.5)

    loopTl.kill()
  }

  function destroy() {
    if (isDestroyed) return
    isDestroyed = true
    clearInterval(checkInterval)
    clearTimeout(timeoutId)
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resizeCanvas)
    loopTl.kill()
    root.remove()
    onComplete?.()
  }

  return {
    triggerOutro,
    destroy,
  }
}
