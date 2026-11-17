/**
 * Team Lanyard Rail - Interactive 3D Physics Lanyard Carousel
 * Adapted for Vite + Vanilla JS / ES Modules
 * Tailored exclusively for Flavoro Wood-Fired Hearth Restaurant
 */

export const FLAVORO_TEAM = [
  {
    id: "matteo",
    name: "Matteo Vance",
    role: "Founding Chef & Firekeeper",
    team: "Flavoro · Live Hearth",
    tone: 1,
    image: "/images/chef-portrait.jpg",
    about: "Leads our live hearth over California white oak.",
    quote: "“Fire strips cooking down to its purest truth.”",
    tags: ["White Oak", "Day-Boat Catch"],
  },
  {
    id: "julian",
    name: "Julian Rossi",
    role: "Beverage Director & Cellar Master",
    team: "Flavoro · Living Cellar",
    tone: 2,
    image: "/images/editorial/bartender.jpg",
    about: "Curates living vintages and coastal botanical aperitifs.",
    quote: "“Wine should taste of the soil and sea fog.”",
    tags: ["Living Wines", "Native Botanicals"],
  },
  {
    id: "elena",
    name: "Elena Rostova",
    role: "Director of Hospitality",
    team: "Flavoro · Dining Room",
    tone: 3,
    image: "/images/editorial/dining-room.jpg",
    about: "Hosts our room with unhurried warmth and care.",
    quote: "“Hospitality is quiet generosity at the table.”",
    tags: ["Table Craft", "Warm Welcomes"],
  },
  {
    id: "clara",
    name: "Clara Chen",
    role: "Head Baker & Pastry Chef",
    team: "Flavoro · Heritage Bakery",
    tone: 4,
    image: "/images/chef-team.jpg",
    about: "Bakes wild heritage sourdough and hearth desserts.",
    quote: "“Wild yeast and heat demand pure patience.”",
    tags: ["Wild Levain", "Heritage Wheat"],
  },
  {
    id: "marco",
    name: "Marco Bellini",
    role: "Hearth Sous Chef",
    team: "Flavoro · Live Hearth",
    tone: 5,
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
    about: "Calibrates ember grates for searing and roasting.",
    quote: "“You never rush fire; you listen to its heat.”",
    tags: ["Live Embers", "Cast-Iron Grates"],
  },
  {
    id: "sora",
    name: "Sora Takahashi",
    role: "Head of Provenance & Foraging",
    team: "Flavoro · Coastal Larder",
    tone: 2,
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=600&q=80",
    about: "Sources daily harvests from 30 Sonoma family farms.",
    quote: "“Great cooking starts with living, honest soil.”",
    tags: ["30 Local Farms", "Daily Harvest"],
  },
  {
    id: "amara",
    name: "Amara Okonjo",
    role: "Chef’s Counter Lead",
    team: "Flavoro · Counter Salon",
    tone: 1,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    about: "Guides our eight-seat hearth counter experience.",
    quote: "“The counter is an open dialogue with fire.”",
    tags: ["Counter Seats", "Origin Stories"],
  },
  {
    id: "leo",
    name: "Leo Dubois",
    role: "Head Alchemist & Bartender",
    team: "Flavoro · Salon Bar",
    tone: 3,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    about: "Crafts smoked botanicals and pre-dinner aperitifs.",
    quote: "“Every glass mirrors the aroma of the hearth.”",
    tags: ["Hearth Smoke", "Botanical Bar"],
  },
];

// Enlarged badge dimensions
const BADGE_W = 210;
const BADGE_H = 336;
const RATIO = BADGE_H / BADGE_W; // 1.6
const CAROUSEL_PITCH = 250;
const PERSPECTIVE = 1000;
const MAX_STRETCH = 72;
const SWING_K = 28;
const SWING_DAMP = 2.2;
const LAG = 0.12;
const REEL_K = 220;
const REEL_ZETA = 0.5;
const REST_Y = [8, -9, 7, -8, 9, -7, 8, -9];
const REST_Z = [-1.5, 1.2, -1.8, 1.5, -1.2, 1.6, -1.4, 1.8];
const DROPS = [8, 22, 0, 16, 26, 6, 20, 10];
const AUTOPLAY_INTERVAL = 3800; // ms per card rotation

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barcode(seed) {
  const next = random(seed ^ 0x9e3779b9);
  let x = 0;
  let d = "";
  while (x < 110) {
    const w = 1 + Math.floor(next() * 3);
    d += `M${x} 0h${w}v24h-${w}z`;
    x += w + 1 + Math.floor(next() * 2.5);
  }
  return { d, width: x };
}

function soft(distance, max) {
  const knee = max * 0.75;
  if (distance <= knee) return distance;
  return knee + (max - knee) * (1 - Math.exp(-(distance - knee) / (max - knee)));
}

function geometry(W, items) {
  const u = W / BADGE_W;
  const H = W * RATIO;
  const railR = Math.max(4, 5 * u);
  const railY = 16 + railR;
  const ring = 11 * u;
  const pivotY = railY + ring * 0.8;
  const strapW = Math.max(14, 20 * u);
  const crimp = 8 * u;
  const reel = 26 * u;
  const cordRest = 14 * u;
  const clipH = 18 * u;
  const clipW = 38 * u;
  const base = 64 * u;
  const straps = items.map((item, i) => base + Math.max(0, item.drop ?? DROPS[i % DROPS.length] ?? 0) * u);
  const reelTops = straps.map((len) => pivotY + len + crimp * 0.6);
  const clipTops = reelTops.map((top) => top + reel * 0.82 + cordRest);
  const cardTops = clipTops.map((top) => top + clipH * 0.62);
  const pendulum = cardTops.map((top) => top + H / 2 - pivotY);
  const restLength = pivotY + base + crimp * 0.6 + reel * 0.82 + cordRest + clipH * 0.62 + H / 2 - pivotY;
  const bottom = Math.max(0, ...cardTops.map((top) => top + H));
  return {
    W, H, u, railR, railY, ring, pivotY, strapW, crimp, reel, cordRest, clipH, clipW, straps, reelTops, clipTops, cardTops, pendulum,
    swingK: pendulum.map((len) => (SWING_K * restLength) / len),
    couple: pendulum.map((len) => (0.25 * 57.3) / len),
    maxStretch: Math.round(MAX_STRETCH * Math.min(1, W / 180)),
    height: Math.ceil(bottom + 32 * u),
  };
}

/**
 * Cyclic carousel targets centered around centerIndex
 */
function layoutCarouselTargets(stageWidth, centerIndex, count, swipeOffset = 0) {
  const pitch = CAROUSEL_PITCH;
  const total = pitch * count;
  const c = centerIndex ?? 0;
  const xs = Array.from({ length: count }, (_, i) => {
    let k = i - c;
    while (k > count / 2) k -= count;
    while (k <= -count / 2) k += count;
    return stageWidth / 2 + k * pitch + swipeOffset;
  });
  return { xs, total, pitch };
}

function spring(value, velocity, target, i, k, zeta, h) {
  const v = velocity[i] ?? 0;
  const x = value[i] ?? 0;
  const next = v + (-k * (x - target) - 2 * zeta * Math.sqrt(k) * v) * h;
  velocity[i] = next;
  value[i] = x + next * h;
}

/**
 * Generates semantic HTML markup for the Autoplaying Team Lanyard Carousel
 */
export function renderTeamLanyardRail(items = FLAVORO_TEAM, options = {}) {
  const eyebrow = options.eyebrow || "THE SOUL OF THE HEARTH";
  const heading = options.heading || "The hands behind the fire.";
  const lead = options.lead || "Cooking with live embers leaves nowhere to hide. Every loaf, pour, sear, and greeting is guided by eight artisans devoted to patience, warmth, and the wild terroir of California.";

  const cardsHtml = items.map((item, i) => {
    const seed = hash(`${item.id}:${item.name}`);
    const bars = barcode(seed);
    const digits = String(seed % 1000000000).padStart(9, "0");
    const tags = (item.tags || []).slice(0, 3);
    const toneClass = `tone-${item.tone || (i % 5) + 1}`;

    const tagsHtml = tags.map(t => `<span class="lanyard-tag">${t}</span>`).join('');

    return `
      <div class="lanyard-slot ${toneClass} ${i === 0 ? 'is-active' : ''}" data-lanyard="${i}" style="width: ${BADGE_W}px;">
        <span class="lanyard-ring" aria-hidden="true"></span>
        <span class="lanyard-swing" data-swing>
          <span class="lanyard-strap" data-strap aria-hidden="true" style="--stretch: 0px;">
            <span class="strap-shadow"></span>
            <span class="strap-fabric">
              <span class="strap-stitch"></span>
              <span class="strap-cap"></span>
              <span class="strap-accent-stitch"></span>
            </span>
            <svg class="strap-hook" viewBox="0 0 30 16" preserveAspectRatio="none">
              <rect x="2" y="3" width="26" height="10" rx="5" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="3"></rect>
              <path d="M7 4.5 H23" stroke="white" stroke-opacity="0.6" stroke-width="1"></path>
            </svg>
            <span class="strap-crimp"></span>
            <span class="strap-reel">
              <span class="reel-inner"></span>
              <span class="reel-hub"></span>
            </span>
            <span class="strap-cord" data-cord></span>
          </span>

          <span class="lanyard-hang" data-hang>
            <span class="badge-shadow-wrap" aria-hidden="true">
              <span class="badge-shadow" data-shadow></span>
            </span>

            <button type="button" data-badge="${i}" aria-label="${item.name}, ${item.role} - Click to flip card" class="lanyard-badge-btn" tabindex="0">
              <span class="lanyard-flip" data-flip>
                <!-- FRONT FACE -->
                <span data-face="front" class="badge-face badge-front">
                  <span class="badge-color-band"></span>
                  <span class="badge-hole"></span>
                  <span class="badge-avatar-wrap">
                    <img src="${item.image}" alt="${item.name}" draggable="false" loading="eager" decoding="async">
                  </span>
                  <span class="badge-name">${item.name}</span>
                  <span class="badge-role">${item.role}</span>
                  <span class="badge-team">${item.team || "Flavoro · Hearth"}</span>
                  <span class="badge-barcode-wrap">
                    <svg viewBox="0 0 ${bars.width} 24" preserveAspectRatio="none">
                      <path d="${bars.d}" fill="currentColor"></path>
                    </svg>
                    <span class="badge-digits">${digits}</span>
                  </span>
                  <span class="badge-flip-prompt">
                    <i data-lucide="rotate-cw"></i>
                    <span>Click to discover story</span>
                  </span>
                  <span class="badge-gloss" aria-hidden="true"></span>
                </span>

                <!-- BACK FACE — Professional Profile & Things They Say -->
                <span data-face="back" class="badge-face badge-back">
                  <span class="badge-color-band short"></span>
                  <span class="badge-hole"></span>
                  <div class="badge-back-content">
                    <div class="badge-back-header">
                      <span class="badge-back-team">${item.team || "Flavoro · Artisan"}</span>
                      <h4 class="badge-back-name">${item.name}</h4>
                      <span class="badge-back-role">${item.role}</span>
                    </div>

                    <div class="badge-back-divider" aria-hidden="true"></div>

                    <!-- About the Person -->
                    <div class="badge-back-section">
                      <span class="badge-section-label">ABOUT</span>
                      <p class="badge-about-text">${item.about || ""}</p>
                    </div>

                    <!-- Things They Say -->
                    <div class="badge-back-section badge-quote-section">
                      <span class="badge-section-label">IN THEIR WORDS</span>
                      <blockquote class="badge-quote-text">${item.quote || ""}</blockquote>
                    </div>

                    <!-- Craft Tags -->
                    <div class="badge-tags">${tagsHtml}</div>

                    <!-- Return Hint -->
                    <div class="badge-flip-hint">
                      <i data-lucide="rotate-ccw"></i>
                      <span>Click card to turn back</span>
                    </div>
                  </div>
                  <span class="badge-gloss" aria-hidden="true"></span>
                </span>
              </span>
            </button>

            <!-- Plastic Clip -->
            <span class="badge-plastic-clip" aria-hidden="true">
              <span class="clip-tongue"></span>
              <span class="clip-jaw"></span>
              <span class="clip-slit"></span>
            </span>
          </span>
        </span>
      </div>
    `;
  }).join('');

  return `
    <section class="team-lanyard-rail-section" data-slot="team-lanyard-rail" aria-label="${heading}">
      <div class="apple-container">
        <header class="team-rail-header apple-reveal">
          <span class="apple-eyebrow apple-eyebrow-blue">${eyebrow}</span>
          <h2 class="apple-display-lg apple-text-white">${heading}</h2>
          <p class="apple-lead-text apple-text-muted">${lead}</p>
        </header>
      </div>

      <div class="lanyard-stage-container">
        <!-- Interactive Carousel Left/Right Controls -->
        <button type="button" class="lanyard-nav-btn prev" data-nav="prev" aria-label="Previous artisan">
          <i data-lucide="chevron-left"></i>
        </button>
        <button type="button" class="lanyard-nav-btn next" data-nav="next" aria-label="Next artisan">
          <i data-lucide="chevron-right"></i>
        </button>

        <div class="lanyard-stage" data-stage role="region" aria-label="Team Lanyard Carousel" tabindex="0">
          <!-- Overhead Metallic Rail -->
          <div class="overhead-rail" aria-hidden="true">
            <div class="rail-glow"></div>
            <div class="rail-bar"></div>
            <div class="rail-stop left"></div>
            <div class="rail-stop right"></div>
          </div>

          <!-- Lanyard Badges (Autoplaying Cyclic Carousel) -->
          ${cardsHtml}
        </div>
      </div>
    </section>
  `;
}

/**
 * Initializes autoplaying physics loop, spring dynamics, drag swipe, and reversible click flips
 */
export function initTeamLanyardRail(container = document.querySelector('[data-slot="team-lanyard-rail"]'), items = FLAVORO_TEAM) {
  if (!container) return () => {};

  const stage = container.querySelector('[data-stage]');
  if (!stage) return () => {};

  const count = items.length;
  const slots = Array.from(stage.querySelectorAll('.lanyard-slot'));
  const swings = Array.from(stage.querySelectorAll('[data-swing]'));
  const straps = Array.from(stage.querySelectorAll('[data-strap]'));
  const cords = Array.from(stage.querySelectorAll('[data-cord]'));
  const hangs = Array.from(stage.querySelectorAll('[data-hang]'));
  const buttons = Array.from(stage.querySelectorAll('.lanyard-badge-btn'));
  const flips = Array.from(stage.querySelectorAll('[data-flip]'));
  const shadows = Array.from(stage.querySelectorAll('[data-shadow]'));
  const prevBtn = container.querySelector('[data-nav="prev"]');
  const nextBtn = container.querySelector('[data-nav="next"]');

  let centerIndex = 0;
  let flippedIndex = null;
  let autoplayTimer = null;
  let userInteracting = false;
  let resumeTimer = null;
  let swipeOffset = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sim = {
    x: new Array(count).fill(0),
    vx: new Array(count).fill(0),
    px: new Array(count).fill(0),
    tx: new Array(count).fill(0),
    sw: new Array(count).fill(0),
    vsw: new Array(count).fill(0),
    beta: new Array(count).fill(0),
    ry: new Array(count).fill(0),
    vry: new Array(count).fill(0),
    tr: new Array(count).fill(0),
    rz: new Array(count).fill(0),
    vrz: new Array(count).fill(0),
    tz: new Array(count).fill(0),
    lift: new Array(count).fill(0),
    vlift: new Array(count).fill(0),
    tl: new Array(count).fill(0),
    pop: new Array(count).fill(0),
    vpop: new Array(count).fill(0),
    tp: new Array(count).fill(0),
    st: new Array(count).fill(0),
    vst: new Array(count).fill(0),
    drag: -1,
    pull: -1,
    free: 0,
    last: 0,
    raf: 0,
  };

  let geo = geometry(BADGE_W, items);
  let stageWidth = stage.clientWidth || container.clientWidth || 1200;

  const paint = (i) => {
    const slot = slots[i];
    if (!slot) return;
    slot.style.transform = `translate3d(${((sim.x[i] ?? 0) - geo.W / 2).toFixed(2)}px, 0, 0)`;

    const sw = sim.sw[i] ?? 0;
    if (swings[i]) swings[i].style.transform = `rotate(${sw.toFixed(3)}deg)`;

    const st = sim.st[i] ?? 0;
    if (straps[i]) straps[i].style.setProperty('--stretch', `${st.toFixed(2)}px`);

    if (cords[i]) cords[i].style.transform = `scaleY(${Math.max(0.12, (geo.cordRest + st) / geo.cordRest).toFixed(4)})`;

    const lift = sim.lift[i] ?? 0;
    const pop = sim.pop[i] ?? 0;
    if (hangs[i]) {
      hangs[i].style.transform = `translate3d(0, ${(st - 4 * lift).toFixed(2)}px, 0) rotate(${((sim.beta[i] ?? 0) - sw + (sim.rz[i] ?? 0)).toFixed(3)}deg) scale(${(1 + 0.08 * pop).toFixed(4)})`;
    }

    const ry = sim.ry[i] ?? 0;
    const facing = Math.abs(Math.cos((ry * Math.PI) / 180));
    if (flips[i]) {
      flips[i].style.transform = `perspective(${PERSPECTIVE}px) rotateY(${ry.toFixed(2)}deg)`;
      flips[i].style.setProperty('--shade', ((1 - facing) * 0.45).toFixed(3));
      const phi = ((((ry + 90) % 180) + 180) % 180) - 90;
      flips[i].style.setProperty('--gx', `${(phi * 0.9).toFixed(1)}%`);

      // Dynamic Face Visibility at 90 deg ensures crisp 3D rendering
      const normalizedRy = ((Math.round(ry) % 360) + 360) % 360;
      const isFacingBack = normalizedRy > 90 && normalizedRy < 270;
      const frontFace = flips[i].querySelector('[data-face="front"]');
      const backFace = flips[i].querySelector('[data-face="back"]');

      if (frontFace) {
        frontFace.style.visibility = isFacingBack ? 'hidden' : 'visible';
        frontFace.style.pointerEvents = isFacingBack ? 'none' : 'auto';
      }
      if (backFace) {
        backFace.style.visibility = isFacingBack ? 'visible' : 'hidden';
        backFace.style.pointerEvents = isFacingBack ? 'auto' : 'none';
      }
    }

    if (shadows[i]) {
      shadows[i].style.transform = `translate3d(${(geo.W * 0.045 + lift * 3 * geo.u).toFixed(2)}px, ${(geo.H * 0.03 + lift * 7 * geo.u).toFixed(2)}px, 0) scale(${(Math.max(0.12, facing) * (1 + 0.03 * lift + 0.05 * pop)).toFixed(3)}, ${(1 + 0.03 * lift + 0.05 * pop).toFixed(3)})`;
      shadows[i].style.opacity = (0.72 + 0.28 * lift).toFixed(3);
    }
  };

  const step = (now) => {
    const dt = sim.last ? Math.min(0.1, (now - sim.last) / 1000) : 1 / 60;
    sim.last = now;
    const sub = Math.max(3, Math.ceil(dt / 0.006));
    const h = dt / sub;
    let busy = false;

    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < count; i++) {
        const before = sim.vx[i] ?? 0;
        if (i !== sim.drag) {
          const restoring = now > sim.free;
          const ax = restoring ? -130 * ((sim.x[i] ?? 0) - (sim.tx[i] ?? 0)) - 2 * Math.sqrt(130) * 0.86 * before : -3.2 * before;
          sim.vx[i] = before + ax * h;
          sim.x[i] = (sim.x[i] ?? 0) + (sim.vx[i] ?? 0) * h;
        }
      }

      for (let i = 0; i < count; i++) {
        const dv = (sim.vx[i] ?? 0) - (sim.px[i] ?? 0);
        sim.px[i] = sim.vx[i] ?? 0;
        if (i !== sim.pull) {
          const sw = sim.sw[i] ?? 0;
          const vsw = clamp((sim.vsw[i] ?? 0) + (geo.couple[i] ?? 0.07) * clamp(dv, -900, 900), -90, 90);
          const next = vsw + (-(geo.swingK[i] ?? SWING_K) * sw - SWING_DAMP * vsw) * h;
          sim.vsw[i] = next;
          sim.sw[i] = clamp(sw + next * h, -18, 18);
        }
        sim.beta[i] = (sim.beta[i] ?? 0) + ((sim.sw[i] ?? 0) - (sim.beta[i] ?? 0)) * Math.min(1, h / LAG);
        spring(sim.ry, sim.vry, sim.tr[i] ?? 0, i, 170, 0.62, h);
        spring(sim.rz, sim.vrz, sim.tz[i] ?? 0, i, 120, 0.8, h);
        spring(sim.lift, sim.vlift, sim.tl[i] ?? 0, i, 200, 0.75, h);
        spring(sim.pop, sim.vpop, sim.tp[i] ?? 0, i, 160, 0.55, h);
        if (i !== sim.pull) {
          spring(sim.st, sim.vst, 0, i, REEL_K, REEL_ZETA, h);
          sim.st[i] = Math.max(-geo.cordRest * 0.85, sim.st[i] ?? 0);
        }
      }
    }

    for (let i = 0; i < count; i++) {
      paint(i);
      if (
        Math.abs(sim.vx[i] ?? 0) > 0.4 ||
        Math.abs((sim.x[i] ?? 0) - (sim.tx[i] ?? 0)) > 0.3 ||
        Math.abs((sim.ry[i] ?? 0) - (sim.tr[i] ?? 0)) > 0.05 ||
        Math.abs((sim.sw[i] ?? 0)) > 0.05 ||
        Math.abs((sim.st[i] ?? 0)) > 0.1
      ) {
        busy = true;
      }
    }

    if (sim.drag >= 0 || sim.pull >= 0 || now < sim.free) busy = true;

    if (busy) {
      sim.raf = requestAnimationFrame(step);
    } else {
      sim.raf = 0;
      sim.last = 0;
    }
  };

  const kick = () => {
    if (reduceMotion) {
      for (let i = 0; i < count; i++) {
        sim.x[i] = sim.tx[i];
        sim.ry[i] = sim.tr[i];
        paint(i);
      }
      return;
    }
    if (!sim.raf) {
      sim.last = 0;
      sim.raf = requestAnimationFrame(step);
    }
  };

  const impulse = (i, amount) => {
    if (i < 0 || i >= count) return;
    sim.vsw[i] = (sim.vsw[i] ?? 0) + amount;
    kick();
  };

  const syncTargets = () => {
    const { xs, total } = layoutCarouselTargets(stageWidth, centerIndex, count, swipeOffset);
    for (let i = 0; i < count; i++) {
      const targetX = xs[i] ?? 0;
      // Handle cyclic boundary wrap without flying across entire screen
      if (total > 0) {
        const shift = Math.round((targetX - (sim.x[i] ?? targetX)) / total) * total;
        if (shift !== 0) sim.x[i] = (sim.x[i] ?? 0) + shift;
      }
      sim.tx[i] = targetX;

      const isCenter = centerIndex === i;
      const isFlipped = flippedIndex === i;
      sim.tr[i] = isFlipped ? 180 : isCenter ? 0 : (REST_Y[i % REST_Y.length] ?? 0);
      sim.tz[i] = (isCenter || isFlipped) ? 0 : (REST_Z[i % REST_Z.length] ?? 0);
      sim.tl[i] = (isCenter || isFlipped) ? 1 : 0;
      sim.tp[i] = isFlipped ? 1 : 0;

      slots[i]?.classList.toggle('is-flipped', isFlipped);
      slots[i]?.classList.toggle('is-active', isCenter);
      buttons[i]?.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
    }
    kick();
  };

  const pauseUserInteraction = () => {
    userInteracting = true;
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      userInteracting = false;
    }, 4000);
  };

  const goTo = (index, flip = false) => {
    centerIndex = ((index % count) + count) % count;
    if (flip) {
      flippedIndex = centerIndex;
    } else {
      flippedIndex = null;
    }
    impulse(centerIndex, centerIndex % 2 ? 12 : -12);
    syncTargets();
  };

  const next = () => {
    flippedIndex = null;
    goTo(centerIndex + 1);
  };
  const prev = () => {
    flippedIndex = null;
    goTo(centerIndex - 1);
  };

  /**
   * Reversible flip toggle in place:
   * Flips badge `i` right where it hangs on the rail, without moving the carousel or shifting positions.
   * Click 1 -> turns to back (180deg)
   * Click 2 -> turns back to front (0deg)
   */
  const toggle = (i) => {
    pauseUserInteraction();
    if (flippedIndex === i) {
      flippedIndex = null;
      impulse(i, i % 2 ? -8 : 8);
    } else {
      flippedIndex = i;
      impulse(i, i % 2 ? 10 : -10);
    }
    syncTargets();
  };

  // Autoplay Loop that moves the carousel on its own
  const startAutoplay = () => {
    stopAutoplay();
    if (reduceMotion) return;
    autoplayTimer = setInterval(() => {
      // Automatically advance if no card is flipped open and user is not currently dragging/clicking
      if (flippedIndex === null && !userInteracting) {
        next();
      }
    }, AUTOPLAY_INTERVAL);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  // Measure and calculate carousel positions
  const measure = () => {
    stageWidth = stage.clientWidth || container.clientWidth || window.innerWidth || 1200;
    geo = geometry(BADGE_W, items);
    stage.style.height = `${geo.height}px`;

    const { xs } = layoutCarouselTargets(stageWidth, centerIndex, count, 0);
    for (let i = 0; i < count; i++) {
      sim.x[i] = xs[i];
      sim.tx[i] = xs[i];
      slots[i].style.width = `${geo.W}px`;
      slots[i].style.height = `${geo.height}px`;
    }
    syncTargets();
  };

  measure();
  startAutoplay();

  // Initial gentle entry sway
  if (!reduceMotion) {
    items.forEach((_, i) => {
      setTimeout(() => impulse(i, (i % 2 ? -1 : 1) * 18), 120 + i * 70);
    });
  }

  // Pointer & Swipe interactions
  let pointerId = -1;
  let startX = 0;
  let startY = 0;
  let draggedBadge = -1;
  let isDraggingStrap = false;
  let isSwiping = false;

  const onPointerDown = (e) => {
    if (e.target.closest('[data-link="true"]')) return;
    pauseUserInteraction();

    const badgeBtn = e.target.closest('[data-badge]');
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    draggedBadge = badgeBtn ? parseInt(badgeBtn.dataset.badge, 10) : -1;
    isDraggingStrap = false;
    isSwiping = false;
  };

  const onPointerMove = (e) => {
    if (pointerId !== e.pointerId) return;
    const dy = e.clientY - startY;
    const dx = e.clientX - startX;

    if (!isDraggingStrap && !isSwiping) {
      if (Math.abs(dy) > Math.abs(dx) && dy > 8 && draggedBadge >= 0) {
        isDraggingStrap = true;
      } else if (Math.abs(dx) > 10) {
        isSwiping = true;
      }
    }

    if (isDraggingStrap && draggedBadge >= 0) {
      sim.st[draggedBadge] = soft(dy, geo.maxStretch);
      sim.sw[draggedBadge] = clamp(-dx * 0.25, -16, 16);
      kick();
    } else if (isSwiping) {
      swipeOffset = dx * 0.7;
      syncTargets();
    }
  };

  const onPointerUp = (e) => {
    if (pointerId !== e.pointerId) return;
    pointerId = -1;

    if (isDraggingStrap && draggedBadge >= 0) {
      sim.st[draggedBadge] = 0;
      sim.sw[draggedBadge] = 0;
      kick();
    } else if (isSwiping) {
      const dx = e.clientX - startX;
      swipeOffset = 0;
      if (Math.abs(dx) > 45) {
        if (dx < 0) next();
        else prev();
      } else {
        syncTargets();
      }
    }

    draggedBadge = -1;
    setTimeout(() => {
      isDraggingStrap = false;
      isSwiping = false;
      pauseUserInteraction();
    }, 60);
  };

  stage.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Dedicated button click handler
  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      if (e.target.closest('[data-link="true"]')) return;
      if (isDraggingStrap || isSwiping) return;
      e.preventDefault();
      toggle(idx);
    });
  });

  // Prev / Next Chevron navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      pauseUserInteraction();
      prev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      pauseUserInteraction();
      next();
    });
  }

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && flippedIndex !== null) {
      flippedIndex = null;
      syncTargets();
    } else if (e.key === 'ArrowRight') {
      pauseUserInteraction();
      next();
    } else if (e.key === 'ArrowLeft') {
      pauseUserInteraction();
      prev();
    } else if (e.key === 'Enter' || e.key === ' ') {
      const activeEl = document.activeElement;
      const bIdx = activeEl?.dataset?.badge;
      if (bIdx !== undefined) {
        e.preventDefault();
        toggle(parseInt(bIdx, 10));
      }
    }
  };
  window.addEventListener('keydown', onKeyDown);

  const onResize = () => measure();
  window.addEventListener('resize', onResize);

  return () => {
    stopAutoplay();
    if (resumeTimer) clearTimeout(resumeTimer);
    cancelAnimationFrame(sim.raf);
    stage.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
  };
}
