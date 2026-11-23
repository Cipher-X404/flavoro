/* ===========================================================================
   Road Map Gallery
   ---------------------------------------------------------------------------
   A radial "how you get here" diagram for the contact page.

   The original brief was a React/shadcn metro-line gallery. This site is
   Vite + vanilla ESM + GSAP, so it is a plain component: `renderRoadMapGallery`
   returns markup, `initRoadMapGallery` returns a teardown. No React, no
   Tailwind, no TypeScript.

   The line is a *road*, not a railway. Each stop is a real junction near the
   room, and the room itself is deliberately the loudest thing on the diagram:
   a lit core with a soft ember halo, so the eye lands there before it reads a
   single label.

   Geometry: everything is laid out in a 1000 x 620 viewBox and positioned in
   polar coordinates from the house at (500, 300). Stops alternate above and
   below the road so labels never collide, and the road itself is a single
   smooth catmull-rom spline through the stops. Because the coordinates are
   computed rather than hand-placed, adding a junction to JUNCTIONS is enough
   to change the diagram.
   =========================================================================== */

const VIEW = { w: 1000, h: 620 }
const CORE = { x: 500, y: 300 }

/* The junctions, ordered as you would actually drive them: in from the
   freeway, along the big streets, then the last few turns down to the door.
   `angle` is degrees clockwise from east; `side` decides which way the label
   hangs off the road. */
export const JUNCTIONS = [
  {
    id: 'octavia',
    name: 'Octavia & Market',
    meta: 'From the freeway',
    note: 'Two blocks of on-ramp traffic, then the city goes quiet.',
    angle: 196,
    side: 'south',
    kind: 'gateway',
  },
  {
    id: 'van-ness',
    name: 'Van Ness & Fell',
    meta: 'Muni · 8 min walk',
    note: 'Civic Center or Van Ness. Leave the hill behind you.',
    angle: 232,
    side: 'south',
    kind: 'transit',
  },
  {
    id: 'franklin-oak',
    name: 'Franklin & Oak',
    meta: 'The last left',
    note: 'The block turns brick here. Look up for the lantern.',
    angle: 286,
    side: 'north',
    kind: 'turn',
  },
  {
    id: 'fell-gough',
    name: 'Fell & Gough',
    meta: 'Valet from 5 PM',
    note: 'Hand the keys over and walk the rest.',
    angle: 340,
    side: 'north',
    kind: 'turn',
  },
  {
    id: 'hayes-park',
    name: 'Hayes & Laguna',
    meta: 'Parkside',
    note: 'The greenest way in, past the plane trees.',
    angle: 26,
    side: 'north',
    kind: 'park',
  },
  {
    id: 'oak-divisadero',
    name: 'Oak & Divisadero',
    meta: 'South approach',
    note: 'Come up Oak and the ovens are downwind of you.',
    angle: 96,
    side: 'south',
    kind: 'turn',
  },
  {
    id: 'linden',
    name: 'Linden & Hayes',
    meta: 'Bike racks',
    note: 'Racks on Oak, a step-free door on Franklin.',
    angle: 146,
    side: 'south',
    kind: 'turn',
  },
]

export const ROAD_META = {
  title: 'The way in',
  eyebrow: 'GETTING HERE',
  lede: 'Seven junctions, one road, and a door that is lit from four thirty.',
  door: '742',
  doorNote: 'Emberwood Lane · Franklin & Fell',
  mapsLabel: 'Open in maps',
}

const RAD = Math.PI / 180
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const round = (n) => Math.round(n * 10) / 10

/* Stops sit on an ellipse rather than a circle so the road fills a landscape
   frame without the near and far stops bunching up. */
function polar(angleDeg, f) {
  const a = angleDeg * RAD
  return {
    x: CORE.x + Math.cos(a) * 344 * f,
    y: CORE.y + Math.sin(a) * 200 * f,
  }
}

/* Distances from home, used as the small trailing number on each stop. */
const MINUTES = {
  octavia: '6 min',
  'van-ness': '8 min',
  'franklin-oak': '2 min',
  'fell-gough': '3 min',
  'hayes-park': '5 min',
  'oak-divisadero': '7 min',
  linden: '4 min',
}

function nodeGeometry() {
  return JUNCTIONS.map((stop, i) => {
    const point = polar(stop.angle, 1)
    const labelAnchor = 'middle'
    const lift = stop.side === 'north' ? -38 : 52
    return {
      ...stop,
      index: i,
      x: point.x,
      y: point.y,
      labelX: clamp(point.x, 82, VIEW.w - 82),
      labelY: point.y + lift,
      anchor: labelAnchor,
      minutes: MINUTES[stop.id] || '',
      delay: round(0.18 + i * 0.09),
    }
  })
}

/* A closed catmull-rom through the stops, converted to cubic beziers. The road
   loops back on itself so the diagram reads as a ring of junctions, with the
   room at the centre of the ring. */
function roadPath(points) {
  const n = points.length
  if (n < 3) return ''
  const tension = 0.9
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1 = { x: p1.x + ((p2.x - p0.x) / 6) * tension, y: p1.y + ((p2.y - p0.y) / 6) * tension }
    const c2 = { x: p2.x - ((p3.x - p1.x) / 6) * tension, y: p2.y - ((p3.y - p1.y) / 6) * tension }
    d += ` C ${round(c1.x)} ${round(c1.y)}, ${round(c2.x)} ${round(c2.y)}, ${round(p2.x)} ${round(p2.y)}`
  }
  return `${d} Z`
}

function stopMarkup(stop) {
  const isNorth = stop.side === 'north'
  return `
      <g class="rmap-stop" data-stop="${stop.id}" style="--rmap-delay:${stop.delay}s">
        <circle class="rmap-stop-ring" cx="${round(stop.x)}" cy="${round(stop.y)}" r="9" />
        <circle class="rmap-stop-dot" cx="${round(stop.x)}" cy="${round(stop.y)}" r="3.4" />
        <line class="rmap-stop-leader" x1="${round(stop.x)}" y1="${round(stop.y + (isNorth ? -11 : 11))}"
          x2="${round(stop.x)}" y2="${round(stop.labelY + (isNorth ? 24 : -5))}" />
        <text class="rmap-stop-name" x="${round(stop.labelX)}" y="${round(stop.labelY)}"
          text-anchor="${stop.anchor}">${stop.name}</text>
        <text class="rmap-stop-meta" x="${round(stop.labelX)}" y="${round(stop.labelY + 19)}"
          text-anchor="${stop.anchor}">${stop.meta}</text>
      </g>`
}

export function renderRoadMapGallery(items = JUNCTIONS, options = {}) {
  const stops = items.length ? nodeGeometry.call(null) : []
  const meta = { ...ROAD_META, ...options }
  const path = roadPath(stops)

  return `
  <section class="rmap" data-rmap aria-labelledby="rmap-title">
    <div class="rmap-stage">
      <header class="rmap-head">
        <span class="rmap-eyebrow" aria-hidden="true">${meta.eyebrow}</span>
        <h3 class="rmap-title" id="rmap-title">${meta.title}</h3>
        <p class="rmap-lede">${meta.lede}</p>
      </header>

      <div class="rmap-frame">
        <svg class="rmap-svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" role="img"
          aria-labelledby="rmap-title rmap-desc" preserveAspectRatio="xMidYMid meet">
          <desc id="rmap-desc">A road ringing the neighbourhood. ${stops
            .map((s) => `${s.name} (${s.meta})`)
            .join('; ')}. Flavoro sits at the centre on Emberwood Lane, at Franklin and Fell.</desc>

          <defs>
            <radialGradient id="rmap-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ef8318" stop-opacity="0.42" />
              <stop offset="55%" stop-color="#ef8318" stop-opacity="0.14" />
              <stop offset="100%" stop-color="#ef8318" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="rmap-core-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fff3dd" stop-opacity="0.96" />
              <stop offset="100%" stop-color="#f3d3a4" stop-opacity="0.7" />
            </radialGradient>
            <pattern id="rmap-hatch" width="7" height="7" patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="7" stroke="#100c08" stroke-opacity="0.07" stroke-width="1.6" />
            </pattern>
          </defs>

          <clipPath id="rmap-clip">
            <ellipse cx="${CORE.x}" cy="${CORE.y}" rx="430" ry="258" />
          </clipPath>

          <!-- the district: a hatched, gridded ground plane so the ring reads as
               a neighbourhood rather than a bare ellipse -->
          <g class="rmap-ground" aria-hidden="true">
            <ellipse cx="${CORE.x}" cy="${CORE.y}" rx="430" ry="258" />
            <g clip-path="url(#rmap-clip)" class="rmap-grid">
              ${[70, 150, 230, 380, 460, 540].map((y) => `<line x1="60" y1="${y}" x2="940" y2="${y}" />`).join('')}
              ${[190, 300, 410, 500, 610, 700, 810].map((x) => `<line x1="${x}" y1="30" x2="${x}" y2="590" />`).join('')}
            </g>
            <ellipse cx="${CORE.x}" cy="${CORE.y}" rx="430" ry="258" class="rmap-ground-hatch" />
          </g>

          <!-- the road, drawn twice: a wide casing and a narrower surface -->
          <g class="rmap-road" aria-hidden="true">
            <path class="rmap-road-casing" d="${path}" pathLength="1" />
            <path class="rmap-road-surface" d="${path}" pathLength="1" />
            <path class="rmap-road-centre" d="${path}" pathLength="1" />
          </g>

          <g class="rmap-stops">
            ${stops.map(stopMarkup).join('')}
          </g>

          <!-- the house: halo, ring, core, then the number -->
          <g class="rmap-core" aria-hidden="true">
            <circle class="rmap-core-halo" cx="${CORE.x}" cy="${CORE.y}" r="92" />
            <circle class="rmap-core-pulse" cx="${CORE.x}" cy="${CORE.y}" r="34" />
            <circle class="rmap-core-ring" cx="${CORE.x}" cy="${CORE.y}" r="21" />
            <circle class="rmap-core-dot" cx="${CORE.x}" cy="${CORE.y}" r="14" />
            <text class="rmap-core-num" x="${CORE.x}" y="${CORE.y + 4}" text-anchor="middle">${meta.door}</text>
            <text class="rmap-core-label" x="${CORE.x}" y="${CORE.y + 46}" text-anchor="middle">FLAVORO</text>
            <text class="rmap-core-note" x="${CORE.x}" y="${CORE.y + 62}" text-anchor="middle">${meta.doorNote}</text>
          </g>
        </svg>

        <span class="rmap-compass" aria-hidden="true">N</span>
        <p class="rmap-frame-caption">
          <span class="rmap-frame-dot" aria-hidden="true"></span>
          Flavoro · ${meta.door}, ${meta.doorNote}
        </p>
      </div>
    </div>

    <ol class="rmap-legend">
      ${stops
        .map(
          (stop) => `
      <li class="rmap-legend-item" data-stop="${stop.id}">
        <span class="rmap-legend-index" aria-hidden="true">${String(stop.index + 1).padStart(2, '0')}</span>
        <span class="rmap-legend-body">
          <span class="rmap-legend-name">${stop.name}<span class="rmap-legend-min">${stop.minutes}</span></span>
          <span class="rmap-legend-note">${stop.note}</span>
        </span>
      </li>`,
        )
        .join('')}
      <li class="rmap-legend-item rmap-legend-item--link">
        <a class="rmap-maps" href="${HOUSE_MAPS_HREF}" target="_blank" rel="noopener noreferrer">
          ${meta.mapsLabel} <span aria-hidden="true">↗</span>
        </a>
      </li>
    </ol>
  </section>`
}

const HOUSE_MAPS_HREF =
  'https://maps.google.com/?q=742+Emberwood+Lane,+San+Francisco,+CA+94102'

export function initRoadMapGallery(root = document, items = JUNCTIONS) {
  const section = root.querySelector('[data-rmap]')
  if (!section) return () => {}

  const groups = new Map()
  for (const stop of items) {
    const group = section.querySelector(`.rmap-stop[data-stop="${stop.id}"]`)
    const row = section.querySelector(`.rmap-legend-item[data-stop="${stop.id}"]`)
    if (group) groups.set(stop.id, { group, row })
  }

  const setActive = (id) => {
    section.classList.toggle('is-busy', Boolean(id))
    for (const [key, { group, row }] of groups) {
      const on = key === id
      group.classList.toggle('is-active', on)
      row?.classList.toggle('is-active', on)
    }
  }

  const cleanups = []
  for (const [id, { group, row }] of groups) {
    const on = () => setActive(id)
    const off = () => setActive(null)
    for (const el of [group, row]) {
      if (!el) continue
      el.addEventListener('pointerenter', on)
      el.addEventListener('pointerleave', off)
      el.addEventListener('focusin', on)
      el.addEventListener('focusout', off)
      cleanups.push(() => {
        el.removeEventListener('pointerenter', on)
        el.removeEventListener('pointerleave', off)
        el.removeEventListener('focusin', on)
        el.removeEventListener('focusout', off)
      })
    }
  }

  // One observer reveals the whole diagram the first time it is seen; the
  // GSAP timeline in site-animations only needs a class to react to.
  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          section.classList.add('is-drawn')
          io.disconnect()
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(section)
    cleanups.push(() => io.disconnect())
  } else {
    section.classList.add('is-drawn')
  }

  return () => {
    setActive(null)
    cleanups.forEach((fn) => fn())
  }
}

export default { renderRoadMapGallery, initRoadMapGallery, JUNCTIONS }
