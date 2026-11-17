"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const IMAGE_URLS = [
  "https://cdn.21st.dev/assets/mirror/49/496b84975083e207d6b9adf6898f417d9e66250a5fa0b324db7d69c24081e665.webp",
  "https://cdn.21st.dev/assets/mirror/56/565902d9502c3c50a98cd8dc1447754d865c370597acbf789e44e061abc98e02.webp",
  "https://cdn.21st.dev/assets/mirror/37/37149990d5ddbf0ad349dcffff6917efb95d450ff176bc7b911420a8bbce968d.webp",
  "https://cdn.21st.dev/assets/mirror/4f/4f0af24dd1f4e5f89e5b5ae1f10b711e837c279ebf1daea092a3376a4bfb4400.webp",
  "https://cdn.21st.dev/assets/mirror/95/9579da7038028c3ef96b8cca6a887ddb406851f37caa13a85627ce72975f16f0.webp",
  "https://cdn.21st.dev/assets/mirror/4b/4bd8b7ff2db5fb0d805712b372dcf2820752b709b377db8ac073f65abf7591f8.webp",
  "https://cdn.21st.dev/assets/mirror/d0/d0c716fa9bb2a2cbf7dda8f41ffdcda0aa12a5c1db1951ed093935e51377bdb0.webp",
  "https://cdn.21st.dev/assets/mirror/d1/d1c14c08413e7d35bc090bfe4ea560c88314c9899a10fb4a1791ce3a76d6a71e.webp",
  "https://cdn.21st.dev/assets/mirror/94/9409bb00df0c1bbb30e4e782f33b06232f39f39c9a5c4cf3e830853316be6e77.webp",
  "https://cdn.21st.dev/assets/mirror/bf/bf54bb945a1a7d3c154146a499bbb895b0c59d48e913c2377e380aa11ee5a5c2.webp",
  "https://cdn.21st.dev/assets/mirror/1f/1f2db3e1105e8a09b30a319647a614bfc0a6858e56a54e6a156ff0eeeb0984a7.webp",
  "https://cdn.21st.dev/assets/mirror/74/74388f29a6841a42a35929cea6e1acff8a748a69294ea03dfe78b61e74e2fa4c.webp",
];

const TOTAL = IMAGE_URLS.length;
const Z_FAR = -2400;
const Z_NEAR = 780;
const RANGE = Z_NEAR - Z_FAR;
const DURATION = 16;
const FADE_IN = 0.06;
const FADE_OUT = 0.04;

const css = `
.endless-root,
.endless-root *,
.endless-root *::before,
.endless-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.endless-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000000;
  color: #ffffff;
  font-family: inherit;
  user-select: none;
  pointer-events: none;
}

.endless-root .endless-scene {
  position: absolute;
  inset: 0;
  -webkit-perspective: 1100px;
  perspective: 1100px;
  -webkit-perspective-origin: 50% 50%;
  perspective-origin: 50% 50%;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.endless-root .endless-world {
  position: absolute;
  inset: 0;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.endless-root .endless-plane {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: #000000;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
}

.endless-root .endless-plane img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.endless-root .endless-title {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 50;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-family: inherit;
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  line-height: 1;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .endless-root .endless-title {
    font-size: 1.375rem;
  }
}

@media (min-width: 1200px) {
  .endless-root .endless-title {
    font-size: 1.875rem;
  }
}

.endless-root .endless-footer {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transform: translateX(-50%);
  color: #707070;
}

@media (min-width: 768px) {
  .endless-root .endless-footer {
    bottom: 2rem;
  }
}

.endless-root .endless-globe {
  display: block;
  flex-shrink: 0;
}

.endless-root .endless-caption {
  color: #707070;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
}

/* iOS WebKit flattens nested 3D when an ancestor uses overflow: hidden. */
@supports (-webkit-touch-callout: none) {
  .endless-root {
    overflow: visible;
    -webkit-clip-path: inset(0);
    clip-path: inset(0);
  }
}
`;

function opacityForProgress(progress: number) {
  if (progress < FADE_IN) return Math.max(0, progress / FADE_IN);
  if (progress > 1 - FADE_OUT) return Math.max(0, (1 - progress) / FADE_OUT);
  return 1;
}

function getLayout() {
  const width = window.innerWidth;
  const planeW = width < 768 ? Math.min(width * 0.26, 200) : Math.min(width * 0.26, 440);
  return {
    planeW,
    planeH: planeW * (4 / 3),
    offsetX: width * 0.33,
    angle: 24,
  };
}

export default function Endless() {
  const worldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;

    const planes = Array.from(world.querySelectorAll<HTMLElement>(".endless-plane"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tweens: gsap.core.Tween[] = [];

    gsap.ticker.lagSmoothing(0);
    gsap.set(world, { force3D: true });

    const applyLayout = () => {
      const { planeW, planeH, offsetX, angle } = getLayout();
      planes.forEach((plane, index) => {
        const isLeft = index % 2 === 0;
        plane.style.width = `${planeW}px`;
        plane.style.height = `${planeH}px`;
        gsap.set(plane, {
          xPercent: -50,
          yPercent: -50,
          x: isLeft ? -offsetX : offsetX,
          y: 0,
          rotationY: isLeft ? angle : -angle,
          force3D: true,
        });
      });
    };

    applyLayout();

    planes.forEach((plane, index) => {
      const img = plane.querySelector("img") as HTMLImageElement;
      const startProgress = index / TOTAL;

      gsap.set(plane, { z: Z_FAR + startProgress * RANGE });
      img.style.opacity = String(opacityForProgress(startProgress));
      plane.style.zIndex = String(Math.round(startProgress * 1000));

      if (reduceMotion) return;

      const tween = gsap.fromTo(
        plane,
        { z: Z_FAR },
        {
          z: Z_NEAR,
          duration: DURATION,
          ease: "none",
          repeat: -1,
          immediateRender: false,
          onUpdate() {
            const progress = this.progress();
            img.style.opacity = String(opacityForProgress(progress));
            plane.style.zIndex = String(Math.round(progress * 1000));
          },
        },
      );

      tween.progress(startProgress);
      tweens.push(tween);
    });

    window.addEventListener("resize", applyLayout);

    return () => {
      window.removeEventListener("resize", applyLayout);
      tweens.forEach((tween) => tween.kill());
      gsap.killTweensOf(planes);
    };
  }, []);

  return (
    <section className="endless-root" aria-label="Endless 3D image corridor">
      <style>{css}</style>
      <div className="endless-scene">
        <div className="endless-world" ref={worldRef}>
          {IMAGE_URLS.map((url) => (
            <div className="endless-plane" key={url}>
              <img src={url} alt="" loading="eager" decoding="async" />
            </div>
          ))}
        </div>
      </div>
      <div className="endless-title-wrap">
        <span className="endless-eyebrow">A Visual Chronicle</span>
        <h1 className="endless-title">Life Around Our Hearth</h1>
        <p className="endless-subline">Morning prep at dawn, wine poured at dusk, and laughter echoing late into the night.</p>
      </div>
      <div className="endless-footer">
        <svg
          className="endless-globe"
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
        <p className="endless-caption">Flavoro Restaurant · Hayes Valley, San Francisco</p>
      </div>
    </section>
  );
}
export { Endless as Component };
