export function initSmoothScroll({ Lenis, gsap, ScrollTrigger }) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const lenis = new Lenis()

  lenis.on('scroll', ScrollTrigger.update)

  const updateLenis = (time) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(updateLenis)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(updateLenis)
    lenis.destroy()
  }
}
