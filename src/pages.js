import { closePage, dishCard, footer, header, pageHero, sectionHead } from './components/site.js'
import { renderEndlessSection } from './components/ui/endless.js'
import { renderTeamLanyardRail } from './components/ui/team-lanyard-rail.js'

import {
  HOUSE,
  HOUSE_NOTES,
  ROUTE,
  ROUTE_CHIPS,
  SWITCHBOARD,
  blockStyle,
  getAxisTicks,
  getHeroFacts,
  getWeek,
} from './data/contact.js'

/* Four cut-outs, twelve drops. Each one falls at its own pace and tumbles
   slightly on the way down; the far tier is smaller, dimmer and softer so the
   rain has depth instead of a flat curtain. */
const SPICE_DROPS = [
  ['garlic', 'far', 9, 30, -2, -18, 12, 28],
  ['leaf', 'far', 23, 34, -14, 15, -10, -22],
  ['chili', 'far', 38, 28, -7, -22, 18, 30],
  ['pepper', 'far', 61, 32, -19, 10, -14, -26],
  ['leaf', 'far', 84, 36, -11, -8, 16, 22],
  ['thyme', 'far', 48, 31, -6, 14, -12, 24],
  ['ginger', 'far', 73, 35, -22, -12, 10, -20],
  ['chili', 'near', 4, 20, -5, -25, 20, 40],
  ['pepper', 'near', 16, 22, -12, 12, -18, -34],
  ['garlic', 'near', 29, 19, -1, -16, 14, 30],
  ['leaf', 'near', 44, 23, -15, -10, 12, -26],
  ['pepper', 'near', 55, 21, -8, 18, -20, 32],
  ['chili', 'near', 70, 20, -17, -20, 16, -30],
  ['garlic', 'near', 88, 22, -3, -12, 22, 26],
  ['thyme', 'near', 35, 21, -13, 10, -14, 28],
  ['ginger', 'near', 63, 23, -7, -16, 12, -30],
]

const spiceRain = () =>
  SPICE_DROPS.map(
    ([name, tier, x, dur, delay, r0, r1, dx]) =>
      `<img class="hm-spice" data-tier="${tier}" src="/images/spices/${name}.webp" alt="" data-eager decoding="async" style="--x:${x}%;--dur:${dur}s;--delay:${delay}s;--r0:${r0}deg;--r1:${r1}deg;--dx:${dx}px">`,
  ).join('')

const img = {
  hero: '/images/hero-pasta.jpg',
  heroVideo: '/video/flavo.mp4',
  interior: '/images/restaurant-interior.jpg',
  chefs: '/images/chef-team.jpg',
  dessert: '/images/dessert.jpg',
  drinks: '/images/cocktails.jpg',
  breakfast: '/images/breakfast.jpg',
  fish: '/images/market-fish.jpg',
  salad: '/images/garden-salad.jpg',
  private: '/images/private-dining.jpg',
  portrait: '/images/chef-portrait.jpg',
  stockDining: '/images/editorial/dining-room.jpg',
  sharedPasta: '/images/menu/shared-pasta.jpg',
  breakfastPhoto: '/images/menu/breakfast-eggs.jpg',
  dessertPhoto: '/images/menu/chocolate-dessert.jpg',
  cocktailPhoto: '/images/menu/cocktail.jpg',
  barPhoto: '/images/editorial/bartender.jpg',
}

const hmRoles = ['CHEF DE CUISINE', 'SOMMELIER', 'HEAD BAKER', 'FIRE COOK', 'PASTRY', 'HOST', 'BAR', 'FARM LIAISON']

const hmTicker = (roles) => `<div class="hm-ticker" aria-hidden="true"><div class="hm-ticker-track">${[...roles, ...roles].map((role) => `<span>${role}</span><b>✳</b>`).join('')}</div></div>`

const hmMask = (lines) => lines.map((line) => `<span class="hm-mask"><span class="hm-mask-in">${line}</span></span>`).join('')

function home() {
  const hero = getHeroFacts()
  return `${header('Home')}<main id="main-content" class="hm">
  <svg class="hm-defs" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <clipPath id="hm-stone" clipPathUnits="objectBoundingBox">
        <path d="M.05.17C.16.04.35.09.52.03.69-.03.88.06.96.2.99.33.97.55.93.72.89.9.77.98.56.98.36.98.19.94.09.83.01.7.01.48.02.3.02.24.03.21.05.17Z"/>
      </clipPath>
    </defs>
  </svg>

  <div class="hm-rail" aria-hidden="true">
    <span class="hm-rail-line"><i></i></span>
    <ol>
      <li>01</li><li>02</li><li>03</li><li>04</li><li>05</li><li>06</li><li>07</li>
    </ol>
  </div>

  <!-- 01 · THE HEARTH — film, no frame -->
  <section class="hm-scene hm-scene--hero hm-hero home-hero" id="hm-hearth" aria-labelledby="hm-hero-title" data-hm-open="${hero.open ? 'open' : 'closed'}">
    <video class="hero-bg" loop muted playsinline webkit-playsinline preload="metadata" poster="${img.hero}">
      <source src="${img.heroVideo}" type="video/mp4">
    </video>
    <span class="hm-hero-scrim" aria-hidden="true"></span>
    <span class="hm-hero-grain" aria-hidden="true"></span>

    <span class="hm-spices" aria-hidden="true">${spiceRain()}</span>

    <span class="hm-hero-spine" aria-hidden="true">
      <span>Hayes Valley · San Francisco</span>
      <i></i>
      <span>37.7762 N / 122.4241 W</span>
    </span>

    <aside class="hm-hero-panel hm-rise" aria-label="The house tonight">
      <p class="hm-panel-head">
        <span class="hm-dot" aria-hidden="true"></span>
        <b data-hm-day>${hero.day}</b>
        <span>Pacific time</span>
      </p>
      <dl class="hm-panel-rows">
        <div><dt>The fire</dt><dd data-hm-fire>${hero.fire}</dd></div>
        <div><dt>The bar</dt><dd data-hm-bar>${hero.bar}</dd></div>
        <div><dt>The door</dt><dd>Franklin &amp; Fell</dd></div>
        <div><dt>Seats</dt><dd>40</dd></div>
      </dl>
      <a class="hm-panel-call" href="${HOUSE.phoneHref}">
        <span>Reservations</span>
        <span>${HOUSE.phone}</span>
      </a>
    </aside>

    <div class="hm-body hm-hero-body">
      <div class="hm-hero-band">
        <div class="hm-hero-leadcol">
          <p class="hm-overline hm-rise"><span class="hm-dot" aria-hidden="true"></span><span data-hm-label>${hero.label}</span><i aria-hidden="true">/</i><span data-hm-short>${hero.short}</span></p>
          <h1 class="hero-title hm-hero-title" id="hm-hero-title">
            <span class="hm-hero-line">Doors at 4:30.</span>
            <span class="hm-hero-line">Fire at 5:30.</span>
            <span class="hm-hero-line hm-hero-line--last">Dinner until <span class="hm-hero-cycle" data-hm-cycle>the fire dies.</span></span>
          </h1>
          <div class="hm-hero-actions hm-rise">
            <a class="hm-btn hm-btn--solid" href="/pages/reservations.html"><span>Reserve a table</span><span class="hm-btn-ico" aria-hidden="true">↗</span></a>
            <a class="hm-btn hm-btn--line" href="/pages/menu.html"><span>See the menu</span><span class="hm-btn-ico" aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div class="hm-hero-copy hm-rise">
          <p class="hm-hero-lede">Forty seats, one fire, and a menu that changes when the growers do. Wednesday to Sunday in Hayes Valley, San Francisco.</p>
          <p class="hm-hero-note">Reservations recommended. Walk-ins at the bar, always — and the cellar seats twelve for private dinners.</p>
          <p class="hm-hero-sign">Matteo &amp; the kitchen</p>
        </div>
      </div>
    </div>

    <div class="hm-hero-meta">
      <span class="hm-meta-i">01<i>/07</i></span>
      <a class="hm-scroll" href="#hm-room"><span>Scroll</span><span class="hm-scroll-line" aria-hidden="true"></span></a>
      <button class="hm-film" type="button" data-video-toggle aria-label="Pause background video" aria-pressed="false">Ⅱ <span>PAUSE FILM</span></button>
    </div>
  </section>

  <!-- 02 · THE ROOM -->
  <section class="hm-scene hm-scene--paper hm-room" id="hm-room" aria-labelledby="hm-room-title">
    <figure class="hm-room-figure">
      <img src="${img.interior}" alt="The Flavoro dining room at dusk, tables lit by low lamps" data-hm-drift="10">
    </figure>
    <div class="hm-body hm-room-body">
      <div class="hm-room-copy">
        <span class="hm-kicker">02 <i>/</i> The room</span>
        <h2 class="hm-display" id="hm-room-title">${hmMask(['Low light,', 'warm oak,', '<em>good noise.</em>'])}</h2>
        <p class="hm-body-copy" data-hm-fade>Forty seats around a live fire, a marble bar, and linen that has seen a thousand dinners. Nothing in here is loud except the room itself.</p>
        <a class="hm-link" href="/pages/gallery.html" data-hm-fade><span>See the space</span><span class="hm-link-arrow" aria-hidden="true">↗</span></a>
      </div>
    </div>
    <span class="hm-room-caption" aria-hidden="true">Candlelight · Oak · Linen</span>
  </section>

  <!-- 03 · THE TABLE -->
  <section class="hm-scene hm-scene--cream hm-menu" id="hm-menu" aria-labelledby="hm-menu-title">
    <div class="hm-body hm-menu-body">
      <header class="hm-menu-head">
        <div>
          <span class="hm-kicker">03 <i>/</i> The table</span>
          <h2 class="hm-display hm-display--sm" id="hm-menu-title">${hmMask(['Three moments', 'of the <em>day.</em>'])}</h2>
        </div>
        <p class="hm-menu-intro" data-hm-fade>The menu moves with what the growers bring in each morning. A few things never leave.</p>
      </header>
      <ul class="hm-menu-list">
        <li><a class="hm-row" href="/pages/menu.html#act-morning" data-hm-peek="${img.breakfastPhoto}">
          <span class="hm-row-i">01</span>
          <span class="hm-row-time">Morning</span>
          <span class="hm-row-name">Sourdough, soft eggs &amp; cultured butter</span>
          <span class="hm-row-price">from $18</span>
          <span class="hm-row-arrow" aria-hidden="true">↗</span>
          <img class="hm-row-thumb" src="${img.breakfastPhoto}" alt="" aria-hidden="true">
        </a></li>
        <li><a class="hm-row" href="/pages/menu.html#act-midday" data-hm-peek="${img.salad}">
          <span class="hm-row-i">02</span>
          <span class="hm-row-time">Midday</span>
          <span class="hm-row-name">Charred greens, almond &amp; aged sheep’s cheese</span>
          <span class="hm-row-price">from $22</span>
          <span class="hm-row-arrow" aria-hidden="true">↗</span>
          <img class="hm-row-thumb" src="${img.salad}" alt="" aria-hidden="true">
        </a></li>
        <li><a class="hm-row" href="/pages/menu.html#act-confections" data-hm-peek="${img.dessertPhoto}">
          <span class="hm-row-i">03</span>
          <span class="hm-row-time">The finale</span>
          <span class="hm-row-name">Burnt honey tart, crème fraîche</span>
          <span class="hm-row-price">from $14</span>
          <span class="hm-row-arrow" aria-hidden="true">↗</span>
          <img class="hm-row-thumb" src="${img.dessertPhoto}" alt="" aria-hidden="true">
        </a></li>
      </ul>
      <p class="hm-menu-note" data-hm-fade>Menu items and prices are illustrative.</p>
    </div>
  </section>

  <!-- 04 · THE HEARTH -->
  <section class="hm-scene hm-scene--ink hm-fire" id="hm-fire" aria-labelledby="hm-fire-title">
    <span class="hm-fire-word" aria-hidden="true">Hearth</span>
    <div class="hm-body hm-fire-body">
      <div class="hm-fire-top">
        <span class="hm-kicker">04 <i>/</i> The hearth</span>
        <h2 class="hm-fire-title" id="hm-fire-title">${hmMask(['Seven hundred degrees,', '<em>every service.</em>'])}</h2>
      </div>
      <div class="hm-fire-grid">
        <p class="hm-fire-stat"><strong data-hm-count="700">700</strong><span aria-hidden="true">°</span></p>
        <div class="hm-fire-side">
          <svg class="hm-flame" viewBox="0 0 140 240" fill="none" aria-hidden="true">
            <path d="M70 10c9 32 44 42 44 92 0 38-24 62-44 62s-44-24-44-62c0-50 35-60 44-92Z" stroke="currentColor" stroke-width="1.2"/>
            <path d="M70 92c5 19 23 25 23 54 0 21-11 33-23 33s-23-12-23-33c0-29 18-35 23-54Z" stroke="currentColor" stroke-width="1"/>
          </svg>
          <p class="hm-body-copy" data-hm-fade>We light the fire at two in the afternoon and never let it go out. Everything that reaches your table has spent time over those coals — seared, smoked, or rested at the edge of the heat.</p>
        </div>
      </div>
      <ul class="hm-fire-facts">
        <li><b data-hm-count="9">9</b><span>hours the hearth burns</span></li>
        <li><b data-hm-count="80">80</b><span>miles, our sourcing radius</span></li>
        <li><b data-hm-count="3">3</b><span>woods — oak, cherry, almond</span></li>
      </ul>
    </div>
  </section>

  <!-- 05 · THE PEOPLE -->
  <section class="hm-scene hm-scene--ink hm-people" id="hm-people" aria-labelledby="hm-people-title">
    <figure class="hm-people-figure">
      <img src="${img.chefs}" alt="The Flavoro kitchen team working at the pass" data-hm-drift="8">
    </figure>
    <div class="hm-body hm-people-body">
      <div class="hm-people-copy">
        <span class="hm-kicker">05 <i>/</i> The people</span>
        <h2 class="hm-people-title" id="hm-people-title">${hmMask(['Good food is generous.', '<em>So is the room.</em>'])}</h2>
        <p class="hm-body-copy" data-hm-fade>Nine people on the floor, four in the kitchen, and one rule we all keep: nobody eats alone unless they want to.</p>
        <a class="hm-link" href="/pages/people.html" data-hm-fade><span>Meet the team</span><span class="hm-link-arrow" aria-hidden="true">↗</span></a>
      </div>
    </div>
    ${hmTicker(hmRoles)}
  </section>

  <!-- 06 · YOUR TABLE -->
  <section class="hm-scene hm-scene--ink hm-table" id="hm-table" aria-labelledby="hm-table-title">
    <div class="hm-body hm-table-body">
      <span class="hm-kicker">06 <i>/</i> Your table</span>
      <h2 class="hm-table-title" id="hm-table-title">${hmMask(['Come eat', '<em>with us.</em>'])}</h2>
      <p class="hm-table-script" data-hm-fade>We’ll keep the fire on.</p>
      <div class="hm-table-foot">
        <a class="hm-seal hm-seal--lg" href="/pages/reservations.html"><span class="hm-seal-orbit" aria-hidden="true"></span><b>Reserve</b><i>a table</i></a>
        <dl class="hm-details">
          <div><dt>Hours</dt><dd>Wednesday – Sunday · 5:30pm until late</dd></div>
          <div><dt>Hearth</dt><dd>Franklin &amp; Fell St, San Francisco</dd></div>
          <div><dt>Telephone</dt><dd><a href="tel:+14158902341">+1 (415) 890-2341</a></dd></div>
        </dl>
      </div>
    </div>
  </section>

  <!-- 07 · THE FOOTER — part of the stack -->
  <div class="hm-footer-panel">${footer()}</div>
</main>`
}

function about() {
  const embers = [
    ['8%', '7px', '13s', '0s', '26px'],
    ['17%', '4px', '10s', '2.4s', '-18px'],
    ['26%', '5px', '15s', '5.8s', '34px'],
    ['39%', '3px', '9s', '1.2s', '-22px'],
    ['52%', '6px', '14s', '4.1s', '18px'],
    ['64%', '4px', '11s', '6.3s', '-30px'],
    ['73%', '7px', '16s', '2.9s', '24px'],
    ['84%', '3px', '12s', '7.4s', '-16px'],
    ['92%', '5px', '15s', '4.8s', '20px'],
  ]
  const producerRows = [
    {
      index: '01', region: 'BODEGA BAY', name: 'Day-Boat Fishermen', image: '/images/market-fish.jpg',
      copy: 'Line-caught black cod, rockfish, and diver scallops from cold Pacific water, at our back door by afternoon.',
      note: 'Same-day catch', icon: 'compass',
    },
    {
      index: '02', region: 'SEBASTOPOL', name: 'Sun &amp; Furrow Farm', image: '/images/garden-salad.jpg',
      copy: 'Heirloom tomatoes, summer squash, bitter chicories, and tender herbs grown on organic Sonoma County soil.',
      note: 'Picked at peak ripeness', icon: 'leaf',
    },
    {
      index: '03', region: 'SONOMA VALLEY', name: 'Oak Ridge Pastures', image: '/images/hero-pasta.jpg',
      copy: 'Pasture-raised heritage pork and dry-aged beef from animals raised outdoors on family-owned grassland.',
      note: 'Humane &amp; pasture-fed', icon: 'shield-check',
    },
    {
      index: '04', region: 'PETALUMA', name: 'Petaluma Grain Mill', image: '/images/breakfast.jpg',
      copy: 'Stone-ground whole wheat, rye, and spelt milled weekly, so our bread and pasta keep their aroma and nutrients.',
      note: 'Stone-ground weekly', icon: 'award',
    },
  ]
  const rooms = [
    {
      index: '01', label: 'MAIN ROOM', seats: '48 SEATS', title: 'The Main<br>Dining Room',
      image: '/images/editorial/dining-room.jpg', zone: 'main',
      copy: 'Spacious booths, warm light, and a low soundtrack. Made for slow dinners, birthdays, and the friends you never see enough.',
      meta: [['users', '1–8 guests'], ['clock', 'Dinner Wed–Sun']],
    },
    {
      index: '02', label: 'HEARTH COUNTER', seats: '8 SEATS', title: 'The Hearth<br>Counter',
      image: '/images/chef-portrait.jpg', zone: 'hearth',
      copy: 'Eight seats facing the fire and the plating pass. Watch the cooks work, ask anything, and eat dishes hot off the grates.',
      meta: [['flame', 'Chef view'], ['award', 'Solo diners &amp; couples']],
    },
    {
      index: '03', label: 'GARDEN TERRACE', seats: '16 SEATS', title: 'The Secret<br>Garden Terrace',
      image: '/images/private-dining.jpg', zone: 'terrace',
      copy: 'A sheltered, heated terrace under lantern light and greenery. Ideal for small private parties and unhurried weekends.',
      meta: [['leaf', 'Outdoor heating'], ['users', 'Private gatherings']],
    },
  ]
  return `${header('About')}<main id="main-content" class="fl-about">

  <!-- 01 · HERO — a full-bleed overture -->
  <section class="fla-hero" id="about-hero" aria-labelledby="fla-hero-title">
    <div class="fla-hero-backdrop" aria-hidden="true">
      <img src="/images/restaurant-interior.jpg" alt="" loading="eager" fetchpriority="high" data-eager>
      <span class="fla-hero-wash"></span>
      <span class="fla-hero-grain"></span>
    </div>
    <div class="fla-ember-field" aria-hidden="true">
      ${embers.map(([x, size, duration, delay, drift]) => `<span style="--x:${x};--size:${size};--duration:${duration};--delay:${delay};--drift:${drift}"></span>`).join('')}
    </div>

    <div class="fla-shell fla-hero-shell">
      <div class="fla-hero-main">
        <p class="fla-kicker fla-hero-kicker fla-load"><span class="fla-live-dot"></span> WOOD-FIRED DINING <span class="fla-kicker-divider">/</span> SAN FRANCISCO</p>
        <h1 class="fla-hero-title" id="fla-hero-title">
          <span class="fla-line-mask"><span class="fla-line-inner">Cooked over</span></span>
          <span class="fla-line-mask"><span class="fla-line-inner"><em>wood fire.</em></span></span>
          <span class="fla-line-mask fla-line-mask--script"><span class="fla-line-inner">Made for gathering.</span></span>
        </h1>
        <p class="fla-hero-lede fla-load">We built Flavoro as a welcoming neighborhood dining room where good food, live oak embers, and honest hospitality come together without pretense.</p>
        <div class="fla-actions fla-hero-actions fla-load">
          <a href="/pages/reservations.html" class="fla-btn fla-btn--accent magnetic"><span>Reserve a table</span><i data-lucide="arrow-up-right"></i></a>
          <a href="#about-story" class="fla-btn fla-btn--ghost"><span>Read our story</span><i data-lucide="chevron-down"></i></a>
        </div>
      </div>

      <aside class="fla-hero-aside fla-load" aria-label="The Flavoro hearth">
        <figure class="fla-hero-figure">
          <div class="fla-hero-figure-media">
            <img src="/images/chef-team.jpg" alt="Chefs working together at the live hearth" loading="eager" fetchpriority="high" data-eager data-fla-parallax="4">
          </div>
          <figcaption><span>THE HEARTH, EVERY EVENING</span><span>FLV / 01</span></figcaption>
        </figure>
        <div class="fla-hero-note">
          <span>One fire.</span>
          <p>Ten tables, a room full of low light, and a menu that follows the season.</p>
        </div>
      </aside>
    </div>

    <div class="fla-shell fla-hero-foot">
      <div class="fla-hero-stats">
        <div><strong><span class="fla-count" data-count="700">700</span><sup>°</sup></strong><span>Live oak embers</span></div>
        <div><strong><span class="fla-count" data-count="80">80</span><small>mi</small></strong><span>Local sourcing radius</span></div>
        <div><strong><span class="fla-count" data-count="36">36</span><small>hrs</small></strong><span>Wild sourdough ferment</span></div>
      </div>
      <a class="fla-scroll-cue" href="#about-story"><span>SCROLL TO DISCOVER</span><i data-lucide="arrow-down"></i></a>
    </div>
  </section>

  <div class="fla-ribbon" aria-hidden="true">
    <div class="fla-ribbon-track">
      <div class="fla-ribbon-group">
        <span>WOOD FIRE</span><b>✳</b><span>SEASONAL PRODUCE</span><b>✳</b><span>LIVE OAK EMBERS</span><b>✳</b><span>HONEST HOSPITALITY</span><b>✳</b><span>NO SHORTCUTS</span><b>✳</b>
      </div>
      <div class="fla-ribbon-group">
        <span>WOOD FIRE</span><b>✳</b><span>SEASONAL PRODUCE</span><b>✳</b><span>LIVE OAK EMBERS</span><b>✳</b><span>HONEST HOSPITALITY</span><b>✳</b><span>NO SHORTCUTS</span><b>✳</b>
      </div>
    </div>
  </div>

  <!-- 02 · STORY — the room before service -->
  <section class="fla-story" id="about-story" aria-labelledby="fla-story-title">
    <div class="fla-shell">
      <header class="fla-head fla-head--split">
        <div class="fla-head-main">
          <span class="fla-kicker fla-reveal">CHAPTER 01 <span>/</span> HOW WE STARTED</span>
          <h2 class="fla-display fla-reveal" id="fla-story-title">Simple food,<br><em>cooked with care.</em></h2>
        </div>
        <p class="fla-head-note fla-reveal">Started in 2026 by Chef Matteo Vance and Sommelier Julian Rossi after years of working in traditional fine-dining kitchens.</p>
      </header>

      <div class="fla-story-grid">
        <div class="fla-story-visual">
          <figure class="fla-frame fla-reveal-clip">
            <div class="fla-frame-media">
              <img src="/images/editorial/dining-room.jpg" alt="The candlelit Flavoro dining room before service" data-fla-parallax="7">
            </div>
            <figcaption><span>THE DINING ROOM, BEFORE SERVICE</span><span>SAN FRANCISCO</span></figcaption>
          </figure>
          <figure class="fla-story-inset fla-reveal-clip">
            <div class="fla-story-inset-media">
              <img src="/images/market-fish.jpg" alt="Day-boat fish delivered to the Flavoro kitchen" data-fla-parallax="10">
            </div>
            <figcaption>Morning delivery · Bodega Bay</figcaption>
          </figure>
          <span class="fla-vertical-caption" aria-hidden="true">FIRE · PATIENCE · SEASON</span>
        </div>

        <div class="fla-story-copy">
          <p class="fla-pullquote fla-reveal">“The best meals aren’t about stiff tablecloths or complicated garnishes. They’re about delicious food, a warm room, and good conversation that lingers long after dessert.”</p>
          <p class="fla-body fla-reveal">After spending years in high-pressure kitchens in Lyon, Copenhagen, and Tokyo, Matteo and Julian wanted something different: a restaurant that feels like having dinner at a good friend’s home, with food cooked over real hardwood fire.</p>
          <p class="fla-body fla-reveal">Flavoro was built around a large open hearth in the center of the dining room. There are no gas stoves or electric shortcuts in our kitchen. We kindle seasoned California white oak and fruitwood every morning, letting the embers burn down into a deep, steady bed of heat.</p>
          <p class="fla-body fla-reveal">Whether you come in for a quick plate of handmade pasta and a glass of wine at the counter, or spend three hours sharing family-style platters with friends, you are welcome here.</p>
          <div class="fla-signature fla-reveal">
            <span class="fla-sig-badge">MV</span>
            <div><strong>Matteo Vance &amp; Julian Rossi</strong><span>Co-founders · Flavoro Restaurant</span></div>
            <i data-lucide="award"></i>
          </div>
          <a class="fla-text-link fla-reveal" href="/pages/people.html">Meet the people behind the fire <i data-lucide="arrow-up-right"></i></a>
        </div>
      </div>

      <div class="fla-facts">
        <div class="fla-fact fla-reveal"><strong><span class="fla-count" data-count="700">700</span><sup>°</sup></strong><span>Wood embers</span><p>Real California white oak, burning in our open hearth all day.</p></div>
        <div class="fla-fact fla-reveal"><strong><span class="fla-count" data-count="80">80</span><small>mi</small></strong><span>Local sourcing</span><p>Fish, greens, and dairy from nearby family farms and day boats.</p></div>
        <div class="fla-fact fla-reveal"><strong><span class="fla-count" data-count="36">36</span><small>hrs</small></strong><span>Wild sourdough</span><p>Slow-fermented heritage loaves, baked fresh every morning.</p></div>
        <div class="fla-fact fla-reveal"><strong><span class="fla-count" data-count="100">100</span><sup>%</sup></strong><span>From scratch</span><p>Fresh pasta rolled daily, house stocks, and churned butter.</p></div>
      </div>
    </div>
  </section>

  <!-- 03 · COOKING — three promises, three fires -->
  <section class="fla-code" id="about-tenets" aria-labelledby="fla-code-title">
    <div class="fla-shell">
      <header class="fla-head fla-head--center">
        <span class="fla-kicker fla-reveal">CHAPTER 02 <span>/</span> HOW WE COOK</span>
        <h2 class="fla-display fla-reveal" id="fla-code-title">Three things we <em>refuse to rush.</em></h2>
        <p class="fla-head-note fla-reveal">The straightforward promises behind every plate that leaves our kitchen.</p>
      </header>

      <div class="fla-code-grid">
        <article class="fla-code-card fla-reveal">
          <div class="fla-code-top"><span class="fla-code-index">01</span><span class="fla-code-icon"><i data-lucide="flame"></i></span></div>
          <span class="fla-code-tag">THE HEARTH</span>
          <h3>Real Wood Fire</h3>
          <p>Cooking over embers takes patience and attention. The intense radiant heat gives seafood crisp skin, deepens the sweetness of seasonal vegetables, and adds a gentle hint of wood smoke you just can't get on a gas stove.</p>
          <figure class="fla-code-media"><img src="/images/chef-portrait.jpg" alt="A chef tending the live fire at Flavoro" loading="lazy"></figure>
          <div class="fla-code-foot"><span>Aged California white oak &amp; fruitwood</span><i data-lucide="arrow-up-right"></i></div>
        </article>

        <article class="fla-code-card fla-reveal">
          <div class="fla-code-top"><span class="fla-code-index">02</span><span class="fla-code-icon"><i data-lucide="leaf"></i></span></div>
          <span class="fla-code-tag">THE FARMERS</span>
          <h3>Fresh Local Ingredients</h3>
          <p>We don't buy from industrial suppliers. We work directly with small growers, coastal foragers, and independent fishermen around Northern California who bring us peak-season produce within hours of harvest.</p>
          <figure class="fla-code-media"><img src="/images/garden-salad.jpg" alt="A garden salad of peak-season leaves and vegetables" loading="lazy"></figure>
          <div class="fla-code-foot"><span>Harvested by local friends within 80 miles</span><i data-lucide="arrow-up-right"></i></div>
        </article>

        <article class="fla-code-card fla-reveal">
          <div class="fla-code-top"><span class="fla-code-index">03</span><span class="fla-code-icon"><i data-lucide="wine"></i></span></div>
          <span class="fla-code-tag">THE CELLAR</span>
          <h3>Honest, Living Wines</h3>
          <p>Julian selects wines from small family vineyards that farm organically and use minimal intervention. They taste clean, expressive, and pair naturally with rich food straight off the fire.</p>
          <figure class="fla-code-media"><img src="/images/cocktails.jpg" alt="Cocktails and wine at the Flavoro bar" loading="lazy"></figure>
          <div class="fla-code-foot"><span>Organically farmed &amp; low-intervention</span><i data-lucide="arrow-up-right"></i></div>
        </article>
      </div>
    </div>
  </section>

  ${renderTeamLanyardRail()}

  <!-- 04 · PRODUCERS — an index of the source -->
  <section class="fla-producers" id="about-producers" aria-labelledby="fla-producers-title">
    <div class="fla-shell">
      <header class="fla-head fla-head--split">
        <div class="fla-head-main">
          <span class="fla-kicker fla-reveal">CHAPTER 03 <span>/</span> THE SOURCE</span>
          <h2 class="fla-display fla-reveal" id="fla-producers-title">Rooted in the<br><em>coast &amp; soil.</em></h2>
        </div>
        <p class="fla-head-note fla-reveal">Great cooking starts with great ingredients. These are the independent folks who make our menu possible — and the reason we know every mile of it.</p>
      </header>

      <div class="fla-producer-list">
        ${producerRows.map((row) => `
          <article class="fla-producer-row fla-reveal">
            <span class="fla-producer-index">${row.index}</span>
            <div class="fla-producer-name"><span>${row.region}</span><h3>${row.name}</h3></div>
            <p>${row.copy}</p>
            <figure class="fla-producer-thumb"><img src="${row.image}" alt="${row.name.replace(/&amp;/g, 'and')} supplier" loading="lazy"></figure>
            <div class="fla-producer-note"><i data-lucide="${row.icon}"></i><span>${row.note}</span></div>
          </article>
        `).join('')}
      </div>

      <div class="fla-producer-foot fla-reveal">
        <span>80 MILES. FOUR PARTNERS. ZERO SHORTCUTS.</span>
        <a href="/pages/menu.html">See what the season is cooking <i data-lucide="arrow-up-right"></i></a>
      </div>
    </div>
  </section>

  <!-- 05 · ROOMS — a filmstrip of the dining room -->
  <section class="fla-rooms" id="about-spaces" aria-labelledby="fla-rooms-title">
    <div class="fla-shell">
      <header class="fla-head fla-head--split">
        <div class="fla-head-main">
          <span class="fla-kicker fla-reveal">CHAPTER 04 <span>/</span> THE ROOM</span>
          <h2 class="fla-display fla-reveal" id="fla-rooms-title">Find your<br><em>corner of the fire.</em></h2>
        </div>
        <p class="fla-head-note fla-reveal">Whether you want to be close to the kitchen action or tucked away under the lanterns, there is a seat with your name on it.</p>
      </header>
    </div>

    <div class="fla-room-strip">
      ${rooms.map((room, index) => `
        <article class="fla-room-panel fla-reveal-clip${index === 0 ? ' is-open' : ''}">
          <img src="${room.image}" alt="${room.title.replace(/<br>/g, ' ')} at Flavoro" loading="lazy" data-fla-parallax="5">
          <span class="fla-room-shade" aria-hidden="true"></span>
          <div class="fla-room-top"><span>${room.index} / ${room.label}</span><span>${room.seats}</span></div>
          <div class="fla-room-copy">
            <h3>${room.title}</h3>
            <p>${room.copy}</p>
            <div class="fla-room-meta">
              ${room.meta.map(([icon, label]) => `<span><i data-lucide="${icon}"></i>${label}</span>`).join('')}
            </div>
            <a class="fla-room-link" href="/pages/reservations.html?zone=${room.zone}">Reserve this room <i data-lucide="arrow-up-right"></i></a>
          </div>
        </article>
      `).join('')}
    </div>
  </section>

  <!-- 06 · FINALE — one last invitation -->
  <section class="fla-finale" id="about-cta" aria-labelledby="fla-finale-title">
    <div class="fla-finale-media" aria-hidden="true">
      <img src="/images/restaurant-interior.jpg" alt="">
      <span class="fla-finale-shade"></span>
      <span class="fla-finale-glow"></span>
    </div>

    <div class="fla-shell fla-finale-grid">
      <figure class="fla-finale-quote fla-reveal">
        <span class="fla-finale-quote-mark" aria-hidden="true">“</span>
        <blockquote>Flavoro proves that the best dining experience doesn’t need pretense. Just crackling wood fire, fresh ingredients, and genuine hospitality.</blockquote>
        <figcaption><span>THE SAN FRANCISCO DINING GUIDE</span><i data-lucide="star"></i></figcaption>
      </figure>

      <div class="fla-finale-copy">
        <span class="fla-kicker fla-reveal">THE DOORS ARE OPEN</span>
        <h2 class="fla-finale-title" id="fla-finale-title"><span class="fla-line-mask"><span class="fla-line-inner">Come eat</span></span><span class="fla-line-mask"><span class="fla-line-inner"><em>with us.</em></span></span></h2>
        <p class="fla-reveal">We are open Wednesday through Sunday from 5:30 PM until late. We’d love to cook for you.</p>
        <div class="fla-actions fla-reveal">
          <a href="/pages/reservations.html" class="fla-btn fla-btn--accent magnetic"><span>Reserve a table</span><i data-lucide="calendar-days"></i></a>
          <a href="/pages/menu.html" class="fla-btn fla-btn--ghost"><span>Explore the menu</span><i data-lucide="arrow-up-right"></i></a>
        </div>
      </div>
    </div>

    <div class="fla-shell fla-finale-foot">
      <span>WEDNESDAY — SUNDAY</span>
      <span>5:30 PM UNTIL LATE</span>
      <span>SAN FRANCISCO, CA</span>
    </div>
  </section>

  </main>${footer()}`
}

const dietaryTags = (name, description) => {
  const value = `${name} ${description}`.toLowerCase()
  const tags = []
  if (/mushroom|pancake|brioche|salad|garden|fondant/.test(value)) tags.push('vegetarian')
  if (/fish|chicken|rib|prawn|salad|cocktail|highball|hour|smoke|proof/.test(value)) tags.push('gluten-free')
  if (/chili|fire|pepper|spice/.test(value)) tags.push('spicy')
  return tags
}

const menuGroup = (id, eyebrow, title, items) => `<section id="${id}" class="menu-group section-pad"><div class="container menu-layout"><div class="menu-group-title">${sectionHead(eyebrow, title)}<span>Seasonal menu · prices in USD</span></div><div class="menu-list">${items.map(([n,d,p]) => { const tags = dietaryTags(n,d); return `<article class="menu-item reveal" data-diet="${tags.join(' ')}"><div><h3>${n}</h3><p>${d}</p>${tags.length ? `<div class="diet-tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : ''}</div><strong>${p}</strong></article>` }).join('')}</div></div></section>`

function menu() {
 return `${pageHero('Seasonal · Expressive · Live-Fired', 'The living menu.<br><em>Taste with instinct.</em>', 'Explore our peak-season creations, browse the authentic dining room carte to reserve your table experience, or fire an instant custom order straight to our hearth pass.', img.hero, 'Menu')}

 <!-- Dual-Mode Switcher: Clean Separation of Reservation Dining Carte vs Live Order Pass -->
 <section class="menu-mode-switcher-bar">
   <div class="container mode-switcher-container">
     <div class="mode-switcher-capsule">
       <button type="button" class="mode-tab-btn is-active" data-menu-mode="dining-carte" id="tab-btn-carte">
         <i data-lucide="book-open"></i>
         <div class="mode-tab-text">
           <span class="mode-title"><span class="mode-long">The Grand Dining Carte</span><span class="mode-short">Dine in</span></span>
           <small class="mode-subtitle">Authentic Restaurant Menu List · Table Reservations & Pairings</small>
         </div>
       </button>
       <button type="button" class="mode-tab-btn" data-menu-mode="hearth-order" id="tab-btn-order">
         <i data-lucide="flame"></i>
         <div class="mode-tab-text">
           <span class="mode-title"><span class="mode-long">The Live Hearth Order Pass</span><span class="mode-short">Order food</span></span>
           <small class="mode-subtitle">Live Table Orders · Ingredient Customizer & Bespoke Plates</small>
         </div>
       </button>
     </div>
     <div class="quick-bag-trigger-wrap">
       <button type="button" class="order-bag-pill open-order-bag-btn" aria-label="Open Order Bag">
         <i data-lucide="shopping-bag"></i>
         <span>Order Bag: <b class="order-bag-count">0</b> items (<b class="order-bag-total">$0.00</b>)</span>
       </button>
     </div>
   </div>
 </section>

 <!-- =========================================================================
      EXPERIENCE 1: THE GRAND DINING CARTE (Authentic Restaurant Menu List)
      ========================================================================= -->
 <section id="experience-dining-carte" class="dining-carte-section section-pad">
   <div class="container">
     <!-- Editorial Carte Folio Header -->
     <header class="carte-folio-header">
       <div class="carte-folio-badge">
         <span>Carte d'Automne · Vol. VII</span>
         <small>Open Firewood Hearth Cuisine</small>
       </div>
       <h2 class="carte-folio-title">La Grande Carte <em>du Terroir</em></h2>
       <p class="carte-folio-epigraph">"Every plate is an unhurried conversation between ancient embers, morning wild-foraged harvests, and time-honored fermentation. Cooked for your table with instinct and devotion."</p>
       
       <!-- Course Fast Jump Navigation -->
       <div class="carte-search-tools"><label for="carte-search">Find a dish</label><input type="search" id="carte-search" placeholder="Search dishes or ingredients" autocomplete="off"><div class="carte-diet-controls" role="group" aria-label="Filter dishes"><button type="button" data-carte-filter="all" aria-pressed="true">All</button><button type="button" data-carte-filter="vegetarian" aria-pressed="false">Vegetarian</button><button type="button" data-carte-filter="gluten-free" aria-pressed="false">Gluten-free</button><button type="button" data-carte-filter="spicy" aria-pressed="false">Spicy</button></div><p id="carte-filter-status" role="status" aria-live="polite"></p><p class="carte-allergen-note">Menu data is illustrative. Confirm ingredients and allergens with the restaurant before ordering.</p></div>
       <nav class="carte-course-nav" aria-label="Course fast navigation">
         <a href="#act-morning" class="course-jump-pill"><i data-lucide="sun"></i> Act I: Morning Starters</a>
         <a href="#act-midday" class="course-jump-pill"><i data-lucide="utensils"></i> Act II: Midday Harvest</a>
         <a href="#act-evening" class="course-jump-pill"><i data-lucide="flame"></i> Act III: Evening Ember Mains</a>
         <a href="#act-confections" class="course-jump-pill"><i data-lucide="wine"></i> Act IV: Confections & Cellar</a>
         <a href="#act-tasting" class="course-jump-pill is-highlight"><i data-lucide="award"></i> Signature Tasting & Feasts</a>
       </nav>
     </header>

     <!-- The Real Restaurant Menu List Wrap (Populated dynamically with authentic list styling) -->
     <div id="dining-carte-list-wrap" class="dining-carte-list-wrap">
       <!-- Dynamically populated with authentic menu list rows, dotted leader lines, ingredients & reserve table links -->
     </div>

     <!-- Signature Tasting & Group Feasting in Editorial Folio List Format -->
     <div id="act-tasting" class="carte-tasting-folio-block">
       <div class="tasting-folio-head">
         <span class="eyebrow"><i data-lucide="award"></i> Whole Table Dining Experiences</span>
         <h3>Chef Amara's Curated <em>Journeys & Feasts</em></h3>
         <p>Designed for collective dining, pre-reserved tables, and unforgettable evenings.</p>
       </div>

       <div class="tasting-folio-grid">
         <!-- 7-Course Tasting Item -->
         <article class="authentic-tasting-row">
           <div class="tasting-row-lead">
             <div class="tasting-row-top">
               <h4>The 7-Course Seasonal Fire Journey</h4>
               <span class="tasting-row-dots"></span>
               <strong class="tasting-row-price">$95 <small>/ guest</small></strong>
             </div>
             <p class="tasting-row-desc">A progressive sensory tasting through wild ocean catch, wood-smoked aged beef, and botanical mountain herbs, shaped by the morning market.</p>
             <ul class="tasting-course-preview">
               <li>Ember Prawn & Preserved Lemon Amuse</li>
               <li>Charred Heirloom Tomatoes & Buffalo Burrata</li>
               <li>Crisp Snapper in Coconut Embers</li>
               <li>12-Hour Smoked Short Rib & Cassava</li>
               <li>Midnight Chocolate Molten Fondant & Bourbon Gelato</li>
             </ul>
             <div class="tasting-sommelier-line">
               <i data-lucide="wine"></i> <span>Optional Sommelier Cellar Flight: +$45 / guest</span>
             </div>
           </div>
           <div class="tasting-row-actions">
             <button type="button" class="carte-view-btn btn-view-dish" data-dish-id="tasting-7-course" title="View tasting details">
               <i data-lucide="eye"></i> <span>View</span>
             </button>
             <a href="/pages/reservations.html?experience=tasting" class="button button-primary">
               <i data-lucide="calendar-days"></i> <span>Reserve Table for Tasting</span>
             </a>
             <button type="button" class="button button-dark btn-quick-order" data-quick-add-id="tasting-7-course">
               <i data-lucide="plus"></i> <span>Add to Order Bag</span>
             </button>
           </div>
         </article>

         <!-- Hearthside Feast Item -->
         <article class="authentic-tasting-row">
           <div class="tasting-row-lead">
             <div class="tasting-row-top">
               <h4>The Hearthside Communal Feast</h4>
               <span class="tasting-row-dots"></span>
               <strong class="tasting-row-price">$72 <small>/ guest</small></strong>
             </div>
             <p class="tasting-row-desc">For gatherings of 4 or more. Grand communal platters served down the center of the table on hand-carved soapstone and local ceramics.</p>
             <ul class="tasting-course-preview">
               <li>Warm 48-Hour Heritage Sourdough with Smoked Ember Butter</li>
               <li>Blistered Heirloom Burrata & Grilled Garden Greens</li>
               <li>Center-Cut Platter of 12-Hour Short Ribs & Wood-Fired Market Fish</li>
               <li>Crispy Cassava Rosti Cakes & Charred Broccolini</li>
               <li>Warm Chocolate & Pastry Dessert Board</li>
             </ul>
           </div>
           <div class="tasting-row-actions">
             <button type="button" class="carte-view-btn btn-view-dish" data-dish-id="hearthside-feast" title="View feasting details">
               <i data-lucide="eye"></i> <span>View</span>
             </button>
             <a href="/pages/reservations.html?experience=feasting" class="button button-primary">
               <i data-lucide="calendar-days"></i> <span>Reserve Feasting Table</span>
             </a>
             <button type="button" class="button button-dark btn-quick-order" data-quick-add-id="hearthside-feast">
               <i data-lucide="plus"></i> <span>Add to Order Bag</span>
             </button>
           </div>
         </article>
       </div>
     </div>
   </div>
 </section>

 <!-- =========================================================================
      EXPERIENCE 2: THE HEARTH ORDER PASS & BESPOKE CUSTOM STUDIO
      (Specific, Dedicated Kitchen Pass Styling · Instant Order & Ingredient Customizer)
      ========================================================================= -->
 <section id="experience-hearth-order" class="hearth-order-section is-hidden section-pad">
   <div class="container">
     
     <!-- Kitchen Pass Header & Live Dispatch Bar -->
     <div class="order-pass-hud">
       <div class="hud-col-left">
         <div class="live-hearth-pulse">
           <span class="hearth-fire-beacon"></span>
           <div>
             <strong>EXPLORE THE ORDER PREVIEW</strong>
             <span>Build a sample order and explore customization</span>
           </div>
         </div>
       </div>
       <div class="hud-col-right">
         <span class="hud-ticket-counter"><i data-lucide="clock"></i> Demo only · no live kitchen connection</span>
         <a href="#custom-studio" class="btn-scroll-custom-studio"><i data-lucide="flame"></i> Build Custom Plate from Scratch</a>
       </div>
     </div>

     <!-- Dedicated Kitchen Command Center (Search & Filters) -->
     <div class="kitchen-command-box">
       <!-- Search Bar -->
       <div class="search-bar-wrap">
         <i data-lucide="search" class="search-icon"></i>
         <input type="text" id="menu-search-input" class="menu-search-input" aria-label="Search menu dishes and ingredients" placeholder="Search menu dishes, or search by ingredient to exclude/include (e.g. truffle, snapper, brioche, mushroom)..." autocomplete="off">
         <button type="button" id="menu-search-clear" class="search-clear-btn" aria-label="Clear search"><i data-lucide="x"></i></button>
       </div>

       <!-- Category Navigation Tabs -->
       <div class="filter-group category-filter-group" role="group" aria-label="Order categories">
         <button type="button" class="filter-tab is-active" data-category-filter="all">All Kitchen Stations <span class="tab-count">16</span></button>
         <button type="button" class="filter-tab" data-category-filter="breakfast">Morning Station <span class="tab-count">4</span></button>
         <button type="button" class="filter-tab" data-category-filter="lunch">Midday Station <span class="tab-count">4</span></button>
         <button type="button" class="filter-tab" data-category-filter="dinner">Evening Hearth <span class="tab-count">5</span></button>
         <button type="button" class="filter-tab" data-category-filter="drinks">Cellar & Bar <span class="tab-count">4</span></button>
       </div>

       <!-- Dietary Filter Pills & Sort Selector Row -->
       <div class="filter-secondary-row">
         <div class="dietary-filter-group" role="group" aria-label="Dietary preferences">
           <button type="button" class="diet-pill is-active" data-diet-filter="all">All Plates</button>
           <button type="button" class="diet-pill" data-diet-filter="vegetarian"><i data-lucide="leaf"></i> Vegetarian</button>
           <button type="button" class="diet-pill" data-diet-filter="gluten-free"><i data-lucide="check"></i> Gluten-Free</button>
           <button type="button" class="diet-pill" data-diet-filter="spicy"><i data-lucide="flame"></i> Live-Fire Spicy</button>
           <button type="button" class="diet-pill" data-diet-filter="chefs-pick"><i data-lucide="award"></i> Chef's Picks</button>
         </div>

         <div class="sort-select-wrap">
           <label for="menu-sort-select"><i data-lucide="sliders-horizontal"></i> Sort:</label>
           <select id="menu-sort-select" class="menu-sort-select">
             <option value="default">Chef's Recommended</option>
             <option value="price-low">Price: Low to High</option>
             <option value="price-high">Price: High to Low</option>
             <option value="prep-speed">Fastest Preparation</option>
           </select>
         </div>
       </div>

       <div class="filter-feedback-row">
         <span id="filter-results-count" class="results-count">Showing <b>16</b> dishes ready for order</span>
         <span class="diet-disclaimer">Every item customizable. Click <b>"Customize Ingredients"</b> to exclude what you don't want or add premium extras.</span>
       </div>
     </div>

     <!-- The Dedicated Kitchen Dispatch Order List (Horizontal Rows - NOT cards!) -->
     <div id="hearth-order-list-wrap" class="hearth-order-list-wrap">
       <!-- Dynamically populated with horizontal culinary dispatch rows, prep times, ingredient tags, quick add, and customize triggers -->
     </div>

     <!-- Chef's Bespoke Custom Made Food Studio (Build from Scratch) -->
     <section id="custom-studio" class="bespoke-scratch-studio">
       ${sectionHead('Bespoke Culinary Studio', 'Request custom <em>made food.</em>', 'Have a specific craving, childhood flavor memory, or strict dietary vision? Build your bespoke plate from our live-fire hearth and Chef Amara will fire it especially for you.')}
       <div id="custom-dish-studio" class="custom-studio-wrap"></div>
     </section>

   </div>
 </section>

 <!-- Floating Ambient Lens / Visual Loupe for the Grand Dining Carte -->
 <div id="carte-hover-loupe" class="carte-hover-loupe" aria-hidden="true">
   <div class="loupe-image-wrap">
     <img id="loupe-img" src="${img.hero}" alt="Dish preview">
     <span id="loupe-badge" class="loupe-badge">Chef's Signature</span>
   </div>
   <div class="loupe-caption">
     <strong id="loupe-title">Dish Title</strong>
     <small id="loupe-pairing">Sommelier Pairing Note</small>
   </div>
 </div>

 <!-- Modal: Dedicated Ingredient Customizer (What you DON'T want + What you DO want) -->
 <div id="quick-view-modal" class="flavoro-modal" role="dialog" aria-modal="true" aria-label="Customize dish" aria-hidden="true">
   <div class="modal-backdrop"></div>
   <div class="modal-dialog quick-view-dialog">
     <button type="button" class="modal-close" aria-label="Close modal"><i data-lucide="x"></i></button>
     <div class="modal-body"></div>
   </div>
 </div>

 <!-- Modal: Dish Detail View (Image + Full Info Popup) -->
 <div id="dish-view-modal" class="flavoro-modal dish-view-modal" role="dialog" aria-modal="true" aria-label="View dish details" aria-hidden="true">
   <div class="modal-backdrop"></div>
   <div class="modal-dialog dish-view-dialog">
     <button type="button" class="modal-close dish-view-close-btn" aria-label="Close modal">
       <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
     </button>
     <div class="dish-view-body"></div>
   </div>
 </div>

 <!-- Slide-over Drawer: Interactive Order Bag -->
 <div id="order-bag-drawer" class="order-drawer" role="dialog" aria-modal="true" aria-label="Order bag" aria-hidden="true">
   <div class="drawer-backdrop"></div>
   <div class="drawer-panel">
     <div class="drawer-header">
       <div class="drawer-title-wrap">
         <i data-lucide="shopping-bag"></i>
         <div>
           <h3>Your Order Bag</h3>
           <span>Your selections, ready to review</span>
         </div>
       </div>
       <button type="button" class="drawer-close" aria-label="Close order bag"><i data-lucide="x"></i></button>
     </div>

     <div class="drawer-preview-notice">Guest checkout · preview only. No order or payment will be sent.</div>

     <!-- Items List Container -->
     <div class="drawer-items-list"></div>

     <!-- Order Summary & Checkout -->
     <div class="drawer-footer">
       <div class="drawer-summary-rows">
         <div class="summary-line">
           <span>Food & Beverage Subtotal:</span>
           <b id="drawer-subtotal">$0.00</b>
         </div>
         <div class="summary-line"><span>Taxes and fees</span><b>Not calculated</b></div>
       </div>

       <button type="button" class="button button-primary btn-checkout" id="btn-checkout-order">
         <i data-lucide="check-circle-2"></i> <span>Continue to checkout</span>
       </button>
       <small class="drawer-safe-guarantee"><i data-lucide="shield-check"></i> Preview only · no payment or order will be sent</small>
     </div>
   </div>
 </div>

 <!-- Floating Sticky Order Bag Trigger -->
 <button type="button" class="floating-order-bag open-order-bag-btn" aria-label="Open your order bag">
   <div class="float-icon-wrap">
     <i data-lucide="shopping-bag"></i>
     <span class="float-badge order-bag-count">0</span>
   </div>
   <div class="float-text-wrap">
     <small>Your preview bag</small>
     <b class="order-bag-total">$0.00</b>
   </div>
   <i data-lucide="arrow-up-right" class="float-arrow"></i>
 </button>

 ${closePage()}`
}

function checkout() {
 return `${header('Menu')}<main id="main-content" class="checkout-page"><section class="checkout-shell container"><div class="checkout-heading"><a href="/pages/menu.html#order" class="checkout-back">← &nbsp; Back to menu</a><span class="eyebrow">YOUR TABLE / GUEST CHECKOUT</span><h1>One last <em>look.</em></h1><p>Review your selections at your own pace. No account needed.</p></div><div class="checkout-disclaimer"><i data-lucide="info"></i><span><strong>Checkout preview only.</strong> Ordering and payments are not connected. No order will be placed or payment collected.</span></div><div id="checkout-root"></div></section></main>${footer()}`
}

function gallery() {
  return `${header('Gallery')}
  <main id="main-content" class="gallery-main-clean">
    ${renderEndlessSection({
      eyebrow: 'A VISUAL CHRONICLE',
      title: 'Life around our hearth.',
      subline: 'Morning prep at dawn, wine poured at dusk, and laughter echoing late into the night.',
      caption: 'Flavoro Restaurant · Hayes Valley, San Francisco'
    })}
  </main>
  ${footer()}`
}

function reservations() {
 return `${pageHero('Table Reservations · Front-end prototype', 'Reserve your table.<br><em>Curate your evening.</em>', 'A complete six-step booking experience running entirely in your browser. Availability, confirmations and notifications are simulated from locally stored restaurant data.', img.interior, 'Reservations')}
 <section id="book" class="booking-section section-pad">
   <div class="container">
     <div class="rsv-page-intro">
       ${sectionHead('Table Reservation', 'Find your place at the table', 'Choose your party, room, sitting and pre-order. Guest bookings need no account; registered guests keep every visit in their private dashboard.')}
       <p class="demo-notice" role="note"><b>Prototype note</b><br>This reservation system is front-end only. Bookings persist in this browser’s localStorage and are not shared across devices. No real email, SMS or payment is sent.</p>
     </div>
     <div id="reservation-wizard-root" class="rsv-root"></div>
     <div id="reservation-lookup-root"></div>
   </div>
 </section>

 <!-- NEW SECTION: Table Seating Settings (Reservations) -->
 <section id="seating" class="seating-section section-pad"><div class="container">
   ${sectionHead('Your setting', 'Choose your <em>table backdrop.</em>', 'Every space at Flavoro offers a distinctly different sensory experience for your evening.')}
   <div class="seating-grid">
     <article class="space-card reveal-card">
       <div class="space-image"><img src="${img.interior}" alt="Main Dining Room"><span class="space-tag">Atmospheric</span></div>
       <div class="space-body">
         <h3>Main Dining Room</h3>
         <p>Our signature salon featuring curved acoustic booths, soft warm glow, and relaxed conversation for groups and couples.</p>
         <ul class="space-perks"><li><i data-lucide="users"></i> 1 to 6 guests</li><li><i data-lucide="music"></i> Ambient vinyl</li></ul>
       </div>
     </article>
     <article class="space-card reveal-card">
       <div class="space-image"><img src="${img.hero}" alt="Fire Hearth Counter"><span class="space-tag">Interactive</span></div>
       <div class="space-body">
         <h3>Fire Hearth Counter</h3>
         <p>High-top bar stools overlooking the glowing charcoal embers and plating pass. Perfect for date nights and solo food connoisseurs.</p>
         <ul class="space-perks"><li><i data-lucide="flame"></i> 1 to 4 guests</li><li><i data-lucide="award"></i> Chef interaction</li></ul>
       </div>
     </article>
     <article class="space-card reveal-card">
       <div class="space-image"><img src="${img.private}" alt="Garden Terrace"><span class="space-tag">Open Air</span></div>
       <div class="space-body">
         <h3>Garden Terrace</h3>
         <p>Sheltered leafy terrace with lanterns, gentle evening breeze, and outdoor heating. Weather-proofed for comfort in all seasons.</p>
         <ul class="space-perks"><li><i data-lucide="leaf"></i> 2 to 8 guests</li><li><i data-lucide="moon"></i> Lantern lit</li></ul>
       </div>
     </article>
   </div>
 </div></section>

 <section id="private-dining" class="private-dining section-pad"><div class="container split-section"><div class="reveal-image"><img src="${img.private}" alt="Private dining setup"></div><div>${sectionHead('Private dining', 'Your occasion, made personal.', 'Host an intimate dinner, a spirited celebration or a beautifully simple business lunch in our private room.')}<p>The Private Alcove seats six to eight guests and can be booked directly in the reservation flow above. Larger buyouts are arranged with our hospitality team.</p><a class="text-link" href="/pages/contact.html">Visit information <i data-lucide="arrow-right"></i></a></div></div></section>

 <!-- NEW SECTION: Celebration Touches (Reservations) -->
 <section id="addons" class="addons-section section-pad"><div class="container">
   ${sectionHead('Special occasions', 'Thoughtful <em>celebration touches.</em>', 'Mention these in the notes of your booking and our kitchen and bar teams will prepare them in advance.')}
   <div class="addons-grid">
     <div class="addon-card reveal-card">
       <i data-lucide="wine"></i>
       <h4>Vintage Champagne</h4>
       <p>Chilled bottle of Grand Cru Champagne poured upon arrival with warm roasted spiced pecans.</p>
     </div>
     <div class="addon-card reveal-card">
       <i data-lucide="gift"></i>
       <h4>Custom Celebration Cake</h4>
       <p>Handcrafted chocolate praline or passion fruit sponge with personalized handwritten message.</p>
     </div>
     <div class="addon-card reveal-card">
       <i data-lucide="gift"></i>
       <h4>Florals on Table</h4>
       <p>Bespoke seasonal floral arrangement created by our botanical partner, yours to take home.</p>
     </div>
     <div class="addon-card reveal-card">
       <i data-lucide="check"></i>
       <h4>Keepsake Menus</h4>
       <p>Embossed custom tasting menu cards with the guest of honor’s name and date printed in gold foil.</p>
     </div>
   </div>
 </div></section>

 <section class="faq section-pad"><div class="container narrow">${sectionHead('Good to know', 'Before you arrive')}<div class="accordion"><details><summary>Can I make a reservation online?<i data-lucide="plus"></i></summary><p>Yes — this prototype lets you complete a full booking, modify it, cancel it and book a repeat visit. Everything is stored in your browser only, so a booking made here will not exist on another device.</p></details><details><summary>How does availability work?<i data-lucide="plus"></i></summary><p>Opening hours, sitting interval, table capacities, reservation duration and turnover buffers are read from locally stored restaurant settings. Cancelling a booking releases its table immediately. Availability cannot be guaranteed across different browsers.</p></details><details><summary>Where are my confirmations?<i data-lucide="plus"></i></summary><p>Confirmations and status changes appear as in-app notifications in the guest and admin dashboards. No email, SMS or push message is actually sent from this prototype.</p></details><details><summary>Can I plan a private event?<i data-lucide="plus"></i></summary><p>The Private Alcove (6–8 guests) can be reserved in the flow above. For larger gatherings, use the contact page to reach the hospitality team.</p></details></div></div></section>${closePage()}`
}

function blog() {
  const issue = journalIssue()
  const shelf = journalShelf(issue)
  const sections = [...new Map(shelf.map((post) => [post.sectionKey, post.category])).entries()]
  const first = shelf[0]
  const minutes = issue.reduce((total, post) => total + post.minutes, 0)
  return `
  <!-- The issue cover -->
  <section class="jr-hero" aria-labelledby="jr-title">
    <div class="jr-hero-media" aria-hidden="true">
      <img src="${img.chefs}" alt="" data-jr-drift>
    </div>
    <div class="jr-hero-inner">
      <p class="jr-kicker">
        <span>The Flavoro Journal</span>
        <span class="jr-kicker-sep" aria-hidden="true">·</span>
        <span>Volumes I – VIII</span>
        <span class="jr-kicker-sep" aria-hidden="true">·</span>
        <span>Filed from Hayes Valley</span>
      </p>
      <h1 class="jr-title" id="jr-title">Notes from<br><em>around the hearth.</em></h1>
      <div class="jr-hero-foot">
        <p class="jr-hero-note">Longform dispatches from the kitchen, the cellar and the dining room. No listicles, no recipes you will never cook — just the long way round a subject, written by the people who were there.</p>
        <dl class="jr-stats">
          <div><dt>Dispatches</dt><dd>08</dd></div>
          <div><dt>Reading</dt><dd>${minutes}<small>min</small></dd></div>
          <div><dt>Last filed</dt><dd>Oct 2026</dd></div>
        </dl>
      </div>
    </div>
  </section>

  <!-- 01 · the reading room: a shelf you browse, a book that opens -->
  <section class="jr-room" aria-labelledby="jr-room-title">
    <div class="jr-shell">
      <header class="jr-room-head">
        <h2 class="jr-room-title" id="jr-room-title"><span class="jr-num" aria-hidden="true">01</span> The reading room</h2>
        <p class="jr-room-hint" data-jr-hint>Pick a spine. The book opens above it.</p>
      </header>

      <div class="jr-book" data-jr-book>
        <div class="jr-spread" id="jr-spread" role="tabpanel" tabindex="0" aria-labelledby="jr-spine-0">
          <figure class="jr-page jr-page--left">
            <div class="jr-page-media">
              <img data-jr="image" src="${first.image}" alt="${first.caption}">
            </div>
            <figcaption class="jr-page-caption">
              <span data-jr="volume">Volume ${first.volume}</span>
              <span data-jr="caption">${first.caption}</span>
            </figcaption>
          </figure>

          <article class="jr-page jr-page--right">
            <p class="jr-cat"><span data-jr="category">${first.category}</span><span class="jr-cat-dot" aria-hidden="true">·</span><span data-jr="date">${first.date}</span></p>
            <h3 class="jr-post-title" data-jr="title">${first.title}</h3>
            <p class="jr-sub" data-jr="subtitle">${first.subtitle}</p>
            <div class="jr-byline">
              <span class="jr-byline-name" data-jr="author">${first.author}</span>
              <span class="jr-byline-role" data-jr="role">${first.role}</span>
              <span class="jr-byline-time" data-jr="time">${first.readTime}</span>
            </div>
            <a class="jr-read" data-jr="link" href="${first.url}">
              <span>Read the dispatch</span>
              <i data-lucide="arrow-up-right" aria-hidden="true"></i>
            </a>
          </article>
        </div>

        <div class="jr-shelf" data-jr-shelf>
          <div class="jr-shelf-track" role="tablist" aria-label="Journal dispatches">
          ${shelf.map((post, index) => `
          <button class="jr-spine" type="button" role="tab" id="jr-spine-${index}" data-jr-section="${post.sectionKey}"
            aria-controls="jr-spread" aria-selected="${index === 0 ? 'true' : 'false'}"
            tabindex="${index === 0 ? '0' : '-1'}" data-jr-index="${index}"
            style="--jr-h:${[262, 292, 244, 280, 254, 300, 248, 272][index % 8]}px;--jr-w:${[68, 78, 64, 74, 66, 84, 62, 72][index % 8]}px">
            <span class="jr-spine-vol" aria-hidden="true">${post.volume}</span>
            <span class="jr-spine-title">${post.short}</span>
            <span class="jr-spine-cat">${post.categoryRaw.toLowerCase()}</span>
          </button>`).join('')}
          </div>
        </div>

        <div class="jr-shelf-meta">
          <p class="jr-shelf-hint" aria-hidden="true">
            <span class="jr-key">←</span><span class="jr-key">→</span> to browse, <span class="jr-key">↵</span> to read
          </p>
          <ul class="jr-legend" aria-label="Shelf sections">
            ${sections.map(([key, label]) => `<li data-jr-section="${key}"><i aria-hidden="true"></i>${label}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- 02 · the whole issue, as an index -->
  <section class="jr-index" aria-labelledby="jr-index-title">
    <div class="jr-shell">
      <header class="jr-index-head">
        <h2 class="jr-room-title" id="jr-index-title"><span class="jr-num" aria-hidden="true">02</span> The whole issue</h2>
        <p>Every dispatch, in the order it was filed.</p>
      </header>
      <ol class="jr-list">
        ${issue.map((post) => `
        <li class="jr-list-row">
          <a href="${post.url}">
            <span class="jr-list-vol" aria-hidden="true">${post.volume}</span>
            <span class="jr-list-main">
              <span class="jr-list-title">${post.title}</span>
              <span class="jr-list-cat">${post.category}</span>
            </span>
            <span class="jr-list-date">${post.date}</span>
            <span class="jr-list-time">${post.minutes} min</span>
            <span class="jr-list-go" aria-hidden="true"><i data-lucide="arrow-up-right"></i></span>
          </a>
        </li>`).join('')}
      </ol>
    </div>
  </section>

  <!-- 03 · the letter -->
  <section class="jr-letter" aria-labelledby="jr-letter-title">
    <div class="jr-shell">
      <div class="jr-letter-grid">
        <div class="jr-letter-copy">
          <h2 class="jr-letter-title" id="jr-letter-title">One letter, <em>once a month.</em></h2>
          <p>What the kitchen is cooking, what landed in the cellar, and first refusal on the long table. Written by Elena, never by a marketing team.</p>
          <p class="jr-letter-foot"><a href="/pages/reservations.html"><span>Or skip the reading and take a chair</span><i data-lucide="arrow-up-right" aria-hidden="true"></i></a></p>
        </div>
        <form id="journal-newsletter-form" class="jr-form" novalidate>
          <div class="jr-field">
            <label for="jr-email">Email</label>
            <input id="jr-email" name="email" type="email" required placeholder="you@wherever.com" autocomplete="email" spellcheck="false">
            <button class="jr-submit" type="submit">
              <span>Send it to me</span>
              <i data-lucide="arrow-right" aria-hidden="true"></i>
            </button>
          </div>
          <p class="jr-form-note" data-jr-note role="status">Twice a month at most. One click to leave.</p>
        </form>
      </div>
    </div>
  </section>

  <script type="application/json" class="jr-issue-data">${JSON.stringify(shelf).replace(/</g, '\\u003c')}</script>${closePage()}`
}

function contact() {
  return `
  <!-- The front door: live service state, the two ways in -->
  <section class="ct-hero" aria-labelledby="ct-title">
    <div class="ct-hero-media" aria-hidden="true">
      <img src="${img.interior}" alt="" data-ct-drift>
    </div>
    <div class="ct-hero-inner">
      <p class="ct-kicker">
        <span class="ct-live" data-ct-state="idle"><span class="ct-live-dot" aria-hidden="true"></span><span data-ct-label>Checking the house…</span></span>
        <span class="ct-kicker-sep" aria-hidden="true">·</span>
        <span>Hayes Valley, San Francisco</span>
      </p>

      <h1 class="ct-title" id="ct-title">
        <span>Knock <em>once.</em></span>
        <span class="ct-title-script">We’ll be listening.</span>
      </h1>

      <div class="ct-hero-foot">
        <p class="ct-hero-detail" data-ct-detail>
          Dinner Wednesday through Sunday from 5:30, the bar half an hour earlier.
        </p>
        <div class="ct-hero-actions">
          <a class="ct-pill ct-pill--solid" href="${HOUSE.phoneHref}">
            <span>Call the house</span>
            <i data-lucide="phone" aria-hidden="true"></i>
          </a>
          <a class="ct-pill ct-pill--line" href="#contact-inquiry-form">
            <span>Write to us</span>
            <i data-lucide="arrow-up-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      <dl class="ct-hero-rail">
        <div>
          <dt>Address</dt>
          <dd>${HOUSE.street}<br>${HOUSE.city}</dd>
        </div>
        <div>
          <dt>Telephone</dt>
          <dd><a href="${HOUSE.phoneHref}">${HOUSE.phone}</a></dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd><a href="${HOUSE.mailHref}">${HOUSE.email}</a></dd>
        </div>
        <div>
          <dt>In the room</dt>
          <dd><b data-ct-clock>—</b> <span>${HOUSE.tzLabel}</span></dd>
        </div>
      </dl>
    </div>
  </section>

  <!-- 01 · the walk in -->
  <section class="ct-arrive" aria-labelledby="ct-arrive-title">
    <div class="ct-shell">
      <header class="ct-head">
        <span class="ct-num" aria-hidden="true">01</span>
        <h2 class="ct-head-title" id="ct-arrive-title">The last two hundred <em>metres.</em></h2>
        <p class="ct-head-note">Hayes Valley is small. Everything below is what happens between the corner and the chair.</p>
      </header>

      <div class="ct-arrive-grid">
        <figure class="ct-plan">
          <svg viewBox="0 0 460 360" role="img" aria-labelledby="ct-plan-title ct-plan-desc">
            <title id="ct-plan-title">Walking route to 742 Emberwood Lane</title>
            <desc id="ct-plan-desc">A plan of the block between Franklin, Fell and Oak Street. A dashed route leads from the Van Ness stop up Oak to the door on the corner of Franklin and Fell, marked with an ember lamp.</desc>
            <g class="ct-plan-blocks" aria-hidden="true">
              <rect x="24" y="24" width="112" height="72" />
              <rect x="24" y="128" width="112" height="72" />
              <rect x="24" y="232" width="112" height="88" />
              <rect x="204" y="24" width="120" height="72" />
              <rect x="204" y="128" width="120" height="72" />
              <rect x="204" y="232" width="120" height="88" />
              <rect x="392" y="24" width="48" height="72" />
              <rect x="392" y="128" width="48" height="72" />
              <rect x="392" y="232" width="48" height="88" />
            </g>
            <g class="ct-plan-streets" aria-hidden="true">
              <line x1="0" y1="112" x2="460" y2="112" />
              <line x1="0" y1="216" x2="460" y2="216" />
              <line x1="170" y1="0" x2="170" y2="360" />
              <line x1="358" y1="0" x2="358" y2="360" />
            </g>
            <g class="ct-plan-labels" aria-hidden="true">
              <text x="216" y="107" class="ct-plan-label">FELL STREET</text>
              <text x="216" y="211" class="ct-plan-label">OAK STREET</text>
              <text x="0" y="0" class="ct-plan-label" transform="translate(164 300) rotate(-90)">FRANKLIN STREET</text>
            </g>
            <path class="ct-plan-route" d="M52 344 L52 216 L170 216 L170 128"
              pathLength="1" fill="none" aria-hidden="true" />
            <circle class="ct-plan-start" cx="52" cy="344" r="3.5" aria-hidden="true" />
            <g class="ct-plan-pin" aria-hidden="true">
              <circle class="ct-plan-halo" cx="170" cy="112" r="20" />
              <circle class="ct-plan-dot" cx="170" cy="112" r="5" />
            </g>
            <text class="ct-plan-door" x="184" y="104" aria-hidden="true">742</text>
          </svg>
          <figcaption class="ct-plan-caption">
            <span>Eight minutes from the Van Ness stop.</span>
            <a href="${HOUSE.mapsHref}" target="_blank" rel="noopener noreferrer">Open in maps <i data-lucide="arrow-up-right" aria-hidden="true"></i></a>
          </figcaption>
        </figure>

        <ol class="ct-route">
          ${ROUTE.map((step) => `
          <li class="ct-route-step">
            <span class="ct-route-index" aria-hidden="true">${step.index}</span>
            <div class="ct-route-body">
              <h3>${step.title}</h3>
              <p>${step.copy}</p>
              <span class="ct-route-meta">${step.meta}</span>
            </div>
          </li>`).join('')}
        </ol>
      </div>

      <ul class="ct-chips">
        ${ROUTE_CHIPS.map((chip) => `<li>${chip}</li>`).join('')}
      </ul>
    </div>
  </section>

  <!-- 02 · the week, drawn -->
  <section class="ct-hours" aria-labelledby="ct-hours-title">
    <div class="ct-shell">
      <header class="ct-head ct-head--split">
        <span class="ct-num" aria-hidden="true">02</span>
        <h2 class="ct-head-title" id="ct-hours-title">When the fire is <em>lit.</em></h2>
        <p class="ct-head-note">Four days of cooking, two days of mending and foraging. The bar opens half an hour before the kitchen and keeps the same hours as the evening.</p>
      </header>

      <div class="ct-week" data-ct-week>
        <div class="ct-week-axis" aria-hidden="true">
          ${getAxisTicks().map((tick) => `<span style="left:${tick.left.toFixed(3)}%">${tick.label}</span>`).join('')}
        </div>
        <ol class="ct-week-rows">
          ${getWeek().map((day) => `
          <li class="ct-day${day.closed ? ' is-closed' : ''}${day.isToday ? ' is-today' : ''}">
            <span class="ct-day-name">
              ${day.short}
              ${day.isToday ? '<b>Today</b>' : ''}
            </span>
            <span class="ct-day-track" aria-hidden="true">
              ${day.blocks.map((block) => `<i class="ct-block ct-block--${block.kind}" style="${blockStyle(block)}"></i>`).join('')}
            </span>
            <span class="ct-day-summary">${day.summary}</span>
          </li>`).join('')}
        </ol>
        <p class="ct-week-foot" data-ct-week-foot>
          <span class="ct-live-dot" aria-hidden="true"></span>
          <span data-ct-footer-state>All times Pacific.</span>
        </p>
      </div>
    </div>
  </section>

  <!-- 03 · the switchboard -->
  <section class="ct-switch" aria-labelledby="ct-switch-title">
    <div class="ct-shell">
      <header class="ct-head ct-head--split">
        <span class="ct-num" aria-hidden="true">03</span>
        <h2 class="ct-head-title" id="ct-switch-title">Ask the right <em>person.</em></h2>
        <p class="ct-head-note">Six lines run into this building. Pick one and the card beside it tells you who answers, when, and what to say.</p>
      </header>

      <div class="ct-switch-grid">
        <div class="ct-lines" role="tablist" aria-orientation="vertical" aria-label="House telephone lines">
          ${SWITCHBOARD.map((line, index) => `
          <button class="ct-line${index === 0 ? ' is-active' : ''}" type="button" role="tab"
            id="ct-line-${line.id}" aria-controls="ct-card" aria-selected="${index === 0 ? 'true' : 'false'}"
            data-ct-line="${index}" tabindex="${index === 0 ? '0' : '-1'}">
            <span class="ct-line-no" aria-hidden="true">${line.line}</span>
            <span class="ct-line-name">${line.name}</span>
            <span class="ct-line-meta">${line.meta}</span>
            <span class="ct-line-light" aria-hidden="true"></span>
          </button>`).join('')}
        </div>

        <div class="ct-card" id="ct-card" role="tabpanel" aria-labelledby="ct-line-front" tabindex="-1" data-ct-card>
          <p class="ct-card-kicker"><span data-ct-field="line">Line 01</span><span class="ct-card-kicker-sep" aria-hidden="true">·</span><span data-ct-field="hours">Answers from 3 PM on service days</span></p>
          <h3 class="ct-card-name" data-ct-field="name">Front of house</h3>
          <p class="ct-card-person"><span data-ct-field="person">Elena Rostova</span><span class="ct-card-role" data-ct-field="role">Director of Hospitality</span></p>
          <p class="ct-card-copy" data-ct-field="copy">The line to call when the evening changes shape.</p>
          <ul class="ct-card-bullets" data-ct-field="bullets"></ul>
          <div class="ct-card-actions">
            <a class="ct-pill ct-pill--solid" data-ct-field="phoneHref" href="tel:+14158902341">
              <span data-ct-field="phone">+1 (415) 890-2341</span>
              <i data-lucide="phone" aria-hidden="true"></i>
            </a>
            <a class="ct-pill ct-pill--line" data-ct-field="mailHref" href="mailto:reservations@flavorohearth.com">
              <span data-ct-field="email">reservations@flavorohearth.com</span>
              <i data-lucide="mail" aria-hidden="true"></i>
            </a>
          </div>
          <button class="ct-card-form" type="button" data-ct-topic="table-assistance">
            <span>Rather write it down?</span>
            <span class="ct-card-form-ico" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 04: Apple UI Guest Concierge & Specialist Inquiries -->
  <section class="apple-concierge-section section-pad">
    <div class="apple-container">
      <div class="apple-section-header apple-reveal">
        <span class="apple-eyebrow">CONCIERGE &amp; SPECIALIST DESK</span>
        <h2 class="apple-display-lg">How can our dining team help?</h2>
        <p class="apple-lead-text">Select what you’d like to arrange below. Elena Rostova and our front-of-house team personally review every request to ensure your table is prepared to perfection.</p>
      </div>

      <div class="apple-concierge-flow">
        <!-- Step 1: Guided Topic Selection (Interactive Apple Option Cards) -->
        <div class="apple-flow-step apple-reveal">
          <div class="apple-step-header">
            <span class="apple-step-pill">Step 1</span>
            <h3 class="apple-step-title">Choose your inquiry topic</h3>
          </div>

          <div id="inquiry-pills" class="apple-topic-grid" role="radiogroup" aria-label="Inquiry Topic">
            <!-- Topic 1: Table Reservations -->
            <button type="button" class="apple-topic-card type-pill is-active" data-type="table-assistance" role="radio" aria-checked="true">
              <div class="topic-card-top">
                <div class="topic-icon-wrap">
                  <i data-lucide="calendar-days"></i>
                </div>
                <div class="apple-radio-circle" aria-hidden="true">
                  <i data-lucide="check"></i>
                </div>
              </div>
              <div class="topic-card-body">
                <h4 class="topic-title">Table Reservations</h4>
                <p class="topic-desc">Dining room reservations, seating adjustments, running late, or same-day table availability.</p>
              </div>
            </button>

            <!-- Topic 2: Private Dining & Terrace -->
            <button type="button" class="apple-topic-card type-pill" data-type="private-event" role="radio" aria-checked="false">
              <div class="topic-card-top">
                <div class="topic-icon-wrap">
                  <i data-lucide="users"></i>
                </div>
                <div class="apple-radio-circle" aria-hidden="true">
                  <i data-lucide="check"></i>
                </div>
              </div>
              <div class="topic-card-body">
                <h4 class="topic-title">Private Salons &amp; Buyouts</h4>
                <p class="topic-desc">Secret Garden Terrace for 8–16 guests, or exclusive restaurant buyouts for up to 70 attendees.</p>
              </div>
            </button>

            <!-- Topic 3: Sommelier & Cellar -->
            <button type="button" class="apple-topic-card type-pill" data-type="cellar-tasting" role="radio" aria-checked="false">
              <div class="topic-card-top">
                <div class="topic-icon-wrap">
                  <i data-lucide="wine"></i>
                </div>
                <div class="apple-radio-circle" aria-hidden="true">
                  <i data-lucide="check"></i>
                </div>
              </div>
              <div class="topic-card-body">
                <h4 class="topic-title">Sommelier &amp; Cellar</h4>
                <p class="topic-desc">Rare vintage allocations, customized pairings with Julian Rossi, or cellar corkage consultations.</p>
              </div>
            </button>

            <!-- Topic 4: Press & Special Visits -->
            <button type="button" class="apple-topic-card type-pill" data-type="press-editorial" role="radio" aria-checked="false">
              <div class="topic-card-top">
                <div class="topic-icon-wrap">
                  <i data-lucide="message-square"></i>
                </div>
                <div class="apple-radio-circle" aria-hidden="true">
                  <i data-lucide="check"></i>
                </div>
              </div>
              <div class="topic-card-body">
                <h4 class="topic-title">Press, Media &amp; Visits</h4>
                <p class="topic-desc">Editorial coverage, high-resolution imagery asset requests, culinary features, or community inquiries.</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Step 2: iOS Grouped Form Container -->
        <div class="apple-flow-step apple-reveal">
          <div class="apple-step-header">
            <span class="apple-step-pill">Step 2</span>
            <h3 class="apple-step-title">Guest details &amp; seating preferences</h3>
          </div>

          <form id="contact-inquiry-form" class="apple-ios-form-card" novalidate>
            <!-- Hidden State Inputs -->
            <input type="hidden" id="hidden-inquiry-type" name="inquiry_type" value="table-assistance">
            <input type="hidden" id="hidden-party-size" name="party_size" value="1-2">

            <!-- Section A: Contact Details -->
            <div class="apple-form-section">
              <div class="apple-section-legend">
                <span class="apple-legend-title">Contact Information</span>
                <span class="apple-legend-sub">We’ll reach you here to confirm your details.</span>
              </div>
              
              <div class="apple-grid-2">
                <div class="apple-field-wrap">
                  <label for="contact-name">Full Name <span class="apple-req">*</span></label>
                  <div class="apple-input-box">
                    <i data-lucide="user"></i>
                    <input id="contact-name" required name="full_name" type="text" placeholder="Sterling Thorne" autocomplete="name">
                  </div>
                </div>

                <div class="apple-field-wrap">
                  <label for="contact-email">Email Address <span class="apple-req">*</span></label>
                  <div class="apple-input-box">
                    <i data-lucide="mail"></i>
                    <input id="contact-email" required name="email" type="email" placeholder="sterling@example.com" autocomplete="email">
                  </div>
                </div>
              </div>

              <div class="apple-field-wrap apple-mt-14">
                <label for="contact-phone">Phone Number <span class="apple-opt">(optional — for day-of SMS table alerts)</span></label>
                <div class="apple-input-box">
                  <i data-lucide="phone"></i>
                  <input id="contact-phone" name="telephone" type="tel" placeholder="+1 (415) 890-2341" autocomplete="tel">
                </div>
              </div>
            </div>

            <!-- Section B: Party Size (iOS Segmented Capsule Control) -->
            <div class="apple-form-section">
              <div class="apple-section-legend">
                <span class="apple-legend-title">Party Size</span>
                <span class="apple-legend-sub">Choose your party count so we can match the ideal salon.</span>
              </div>

              <div class="apple-segmented-capsules" role="radiogroup" aria-label="Party Size">
                <button type="button" class="apple-capsule is-active" data-size="1-2" role="radio" aria-checked="true">
                  <span class="capsule-primary">1–2 Guests</span>
                  <span class="capsule-sub">Intimate Table</span>
                </button>
                <button type="button" class="apple-capsule" data-size="3-6" role="radio" aria-checked="false">
                  <span class="capsule-primary">3–6 Guests</span>
                  <span class="capsule-sub">Dining Room</span>
                </button>
                <button type="button" class="apple-capsule" data-size="7-16" role="radio" aria-checked="false">
                  <span class="capsule-primary">7–16 Guests</span>
                  <span class="capsule-sub">Garden Terrace</span>
                </button>
                <button type="button" class="apple-capsule" data-size="buyout" role="radio" aria-checked="false">
                  <span class="capsule-primary">17–70 Guests</span>
                  <span class="capsule-sub">Full Buyout</span>
                </button>
              </div>
            </div>

            <!-- Section C: Schedule & Seating Window -->
            <div class="apple-form-section">
              <div class="apple-section-legend">
                <span class="apple-legend-title">Schedule &amp; Seating Window</span>
                <span class="apple-legend-sub">Tell us when you plan to visit Flavoro.</span>
              </div>

              <div class="apple-grid-2">
                <div class="apple-field-wrap">
                  <label for="contact-date">Preferred Date</label>
                  <div class="apple-input-box">
                    <i data-lucide="calendar"></i>
                    <input id="contact-date" name="target_date" type="date">
                  </div>
                </div>

                <div class="apple-field-wrap">
                  <label for="contact-time-window">Seating Window</label>
                  <div class="apple-input-box apple-select-box">
                    <i data-lucide="clock"></i>
                    <select id="contact-time-window" name="time_window">
                      <option value="early-dinner">Early Dinner (5:30 PM – 6:30 PM)</option>
                      <option value="prime-evening" selected>Prime Evening (7:00 PM – 8:30 PM)</option>
                      <option value="late-supper">Late Supper (9:00 PM – 10:15 PM)</option>
                      <option value="sunday-feast">Sunday Long Table (11:30 AM – 2:30 PM)</option>
                    </select>
                    <i data-lucide="chevron-down" class="apple-select-arrow"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section D: Special Requests & Dietary Notes -->
            <div class="apple-form-section">
              <div class="apple-section-legend">
                <span class="apple-legend-title">Special Requests &amp; Dietary Care</span>
                <span class="apple-legend-sub">Our kitchen prepares tailored adaptations for every dietary need.</span>
              </div>

              <div class="apple-field-wrap">
                <label for="contact-message">Notes, Occasions &amp; Allergies <span class="apple-req">*</span></label>
                <textarea required id="contact-message" name="message" rows="4" placeholder="Please mention any severe food allergies (celiac, tree nuts, dairy), special celebrations (anniversary, milestone birthday), or preferred seating atmosphere..."></textarea>
              </div>
            </div>

            <!-- Section E: Action CTA & Guarantees -->
            <div class="apple-form-footer">
              <button id="btn-submit-inquiry" class="apple-action-btn" type="submit">
                <span>Send Request to Concierge</span>
                <i data-lucide="arrow-right"></i>
              </button>

              <div class="apple-reassurance-row">
                <div class="reassurance-pill">
                  <i data-lucide="check-circle-2"></i>
                  <span>Direct response within 4 service hours</span>
                </div>
                <div class="reassurance-pill">
                  <i data-lucide="check-circle-2"></i>
                  <span>Handled personally by Elena &amp; host team</span>
                </div>
                <div class="reassurance-pill">
                  <i data-lucide="check-circle-2"></i>
                  <span>Direct personal contact · No automated bots</span>
                </div>
              </div>
            </div>

            <!-- Floating iOS Capsule Success Toast -->
            <div id="inquiry-success-toast" class="apple-ios-toast" hidden>
              <div class="toast-capsule-badge">
                <i data-lucide="check"></i>
              </div>
              <div class="toast-content">
                <h4 class="toast-title">Request Received with Care</h4>
                <p class="toast-body">Elena Rostova and our front-of-house team have logged your details and will reply within 4 service hours.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- 04 · the house notes -->
  <section class="ct-notes" aria-labelledby="ct-notes-title">
    <div class="ct-shell">
      <header class="ct-head">
        <span class="ct-num" aria-hidden="true">04</span>
        <h2 class="ct-head-title" id="ct-notes-title">Before you <em>come.</em></h2>
        <p class="ct-head-note">Eight things worth knowing, in the order guests usually ask them.</p>
      </header>

      <dl class="ct-ledger">
        ${HOUSE_NOTES.map((note) => `
        <div class="ct-ledger-row">
          <dt>${note.label}</dt>
          <dd>${note.copy}</dd>
        </div>`).join('')}
      </dl>
    </div>
  </section>

  <!-- closing note -->
  <section class="ct-close" aria-labelledby="ct-close-title">
    <div class="ct-shell">
      <p class="ct-close-script">It is <b data-ct-clock="12h">—</b> in San Francisco, and the room is <span data-ct-openword>waiting</span>.</p>
      <h2 class="ct-close-title" id="ct-close-title">The fire is on.<br><em>Come stand near it.</em></h2>
      <div class="ct-close-actions">
        <a class="ct-pill ct-pill--solid" href="/pages/reservations.html">
          <span>Reserve a table</span>
          <i data-lucide="arrow-up-right" aria-hidden="true"></i>
        </a>
        <a class="ct-pill ct-pill--line" href="${HOUSE.phoneHref}">
          <span>${HOUSE.phone}</span>
          <i data-lucide="phone" aria-hidden="true"></i>
        </a>
      </div>
      <p class="ct-close-legal">${HOUSE.street} · ${HOUSE.city} · ${HOUSE.cross}</p>
    </div>
  </section>${closePage()}`
}

function privateDining() {
  return `${pageHero('Private Dining & Celebrations', 'Make a moment<br><em>of it.</em>', 'Dedicated salon spaces, bespoke wood-fired feasting menus, and personalized cellar pairings for gatherings from 8 to 70 guests.', img.private, 'Reservations')}
  
  <section class="section-pad table-story">
    <div class="container split-section">
      <div>
        ${sectionHead('CURATED CELEBRATIONS', 'A table shaped for <em>your company.</em>', 'From milestone anniversaries to intimate executive retreats, every private event at Flavoro is curated alongside Chef Matteo Vance and Sommelier Julian Rossi.')}
        <div class="concierge-promises" style="margin-top:24px;">
          <div class="promise-item"><i data-lucide="check-circle-2"></i> <span>Custom printed menus embossed with your personal crest or dedication</span></div>
          <div class="promise-item"><i data-lucide="check-circle-2"></i> <span>Dedicated private sommelier and service team</span></div>
          <div class="promise-item"><i data-lucide="check-circle-2"></i> <span>Acoustic isolation with private audio controls for speeches or curated vinyl</span></div>
        </div>
        <div style="margin-top:32px;">
          <a class="button button-primary" href="/pages/contact.html">
            <span>Inquire about private dining</span> <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </div>
      <div class="reveal-image">
        <img src="${img.sharedPasta}" alt="Pasta dishes shared at a private celebration table">
      </div>
    </div>
  </section>

  <section class="about-spaces-section section-pad">
    <div class="container">
      ${sectionHead('SANCTUARY SPACES', 'Our private <em>salons.</em>', 'Select the intimate space that matches your party size and atmosphere.')}
      <div class="spaces-showcase-grid">
        <div class="space-showcase-item reveal-card">
          <div class="space-showcase-img"><img src="/images/private-dining.jpg" alt="The Secret Garden Terrace"><span class="space-tag">Heated Veranda · Up to 16 Guests</span></div>
          <div class="space-showcase-body">
            <h3>The Secret Garden Terrace</h3>
            <p>Enclosed glass veranda surrounded by towering coastal redwoods, flickering lanterns, and overhead radiant heaters. Ideal for candlelit wine dinners and celebratory family gatherings.</p>
          </div>
        </div>
        <div class="space-showcase-item reveal-card">
          <div class="space-showcase-img"><img src="/images/restaurant-interior.jpg" alt="The Hearth Salon"><span class="space-tag">Main Salon · Up to 36 Guests</span></div>
          <div class="space-showcase-body">
            <h3>The Hearth Mezzanine</h3>
            <p>Curved banquette alcoves overlooking the glowing open hearth pass, providing elevated privacy while immersing your guests in the crackling energy of live fire.</p>
          </div>
        </div>
        <div class="space-showcase-item reveal-card">
          <div class="space-showcase-img"><img src="/images/hero-pasta.jpg" alt="Exclusive Full Buyout"><span class="space-tag">Full Buyout · Up to 70 Guests</span></div>
          <div class="space-showcase-body">
            <h3>Exclusive Restaurant Buyout</h3>
            <p>Total private command of the entire venue: Hearth Bar, Main Dining Salon, and Garden Terrace. Includes bespoke cocktail reception and interactive chef pass tastings.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section-pad">
    <div class="container narrow">
      ${sectionHead('PRIVATE GATHERINGS', 'Frequently asked questions')}
      <div class="faq-accordion-list">
        <details class="faq-item">
          <summary>What are the food &amp; beverage minimums?<i data-lucide="plus"></i></summary>
          <div class="faq-answer"><p>Minimum spends vary by evening, season, and salon choice. Garden Terrace evenings start at $2,200 for weeknights and $3,400 for weekends. Inquire through our concierge form for a detailed quotation.</p></div>
        </details>
        <details class="faq-item">
          <summary>Can customized tasting menus be arranged?<i data-lucide="plus"></i></summary>
          <div class="faq-answer"><p>Yes. Chef Matteo Vance consults directly with event hosts to incorporate favorite seasonal ingredients, commemorate specific family traditions, or tailor wine pairings.</p></div>
        </details>
        <details class="faq-item">
          <summary>How far in advance should private events be booked?<i data-lucide="plus"></i></summary>
          <div class="faq-answer"><p>We accept inquiries up to six months in advance. For prime weekend dates in autumn and spring, we recommend reserving 4 to 8 weeks ahead.</p></div>
        </details>
      </div>
    </div>
  </section>${closePage()}`
}

function visit() {
  return `${pageHero('Arrival & Experience Guide', 'Find your place<br><em>at the hearth.</em>', 'All practical arrival details, directions, transit access, and neighborhood suggestions for your evening with us.', img.interior, 'Contact')}
  
  <section class="contact-dossier-section section-pad">
    <div class="container">
      ${sectionHead('SAN FRANCISCO HEARTH', 'Coordinates &amp; <em>arrival.</em>', 'Located in the historic Hayes Valley cultural corridor, two blocks from the Davies Symphony Hall.')}
      <div class="dossier-grid">
        <div class="dossier-card reveal-card">
          <div class="dossier-icon"><i data-lucide="map-pin"></i></div>
          <span class="dossier-label">ADDRESS</span>
          <h3>742 Emberwood Lane</h3>
          <p>San Francisco, CA 94102<br>Cross of Franklin &amp; Fell Street</p>
          <div class="dossier-meta">
            <span>Coordinates: 37.7749° N, 122.4194° W</span>
          </div>
        </div>

        <div class="dossier-card reveal-card">
          <div class="dossier-icon"><i data-lucide="compass"></i></div>
          <span class="dossier-label">VALET SERVICE</span>
          <h3>Valet Staging</h3>
          <p>Complimentary white-glove valet parking is located at our private Franklin Street porte-cochère starting at 5:00 PM Wednesday through Sunday.</p>
          <div class="dossier-meta">
            <span>EV Charging available on request</span>
          </div>
        </div>

        <div class="dossier-card reveal-card">
          <div class="dossier-icon"><i data-lucide="clock"></i></div>
          <span class="dossier-label">DINING HOURS</span>
          <h3>Service Schedule</h3>
          <p>Dinner: Wed – Sun · 5:30 PM – 10:30 PM<br>Bar &amp; Amari Salon: Wed – Sun · 4:30 PM – Midnight<br>Sunday Long Table: Sun · 11:30 AM – 3:30 PM</p>
          <div class="dossier-meta">
            <span>Closed Monday &amp; Tuesday for kitchen foraging</span>
          </div>
        </div>
      </div>
      <div style="margin-top:40px; text-align:center;">
        <a class="button button-primary" href="/pages/reservations.html">
          <span>Explore table reservations</span> <i data-lucide="arrow-right"></i>
        </a>
      </div>
    </div>
  </section>${closePage()}`
}

function people() {
  return `${pageHero('The People & Hands', 'The warmth<br><em>behind the table.</em>', 'Food brings us together; the artisans, bakers, farmers, and hosts make the moment.', img.chefs, 'About')}
  <section class="about-leadership-section section-pad">
    <div class="container">
      ${sectionHead('OUR BRIGADE', 'Hospitality is a <em>shared story.</em>', 'A great meal is shaped by the hands, minds, and uncompromising care behind it.')}
      <div class="leadership-grid">
        <article class="leader-card reveal-card">
          <div class="leader-image"><img src="/images/chef-portrait.jpg" alt="Executive Chef Matteo Vance"></div>
          <div class="leader-info">
            <span class="leader-role">EXECUTIVE CHEF &amp; CO-FOUNDER</span>
            <h3>Matteo Vance</h3>
            <p>Directs Flavoro’s open hearth pass course-by-course with calm precision and deep reverence for wild California ingredients.</p>
          </div>
        </article>
        <article class="leader-card reveal-card">
          <div class="leader-image"><img src="/images/chef-team.jpg" alt="Head Baker & Pastry Director Clara Chen"></div>
          <div class="leader-info">
            <span class="leader-role">HEAD BAKER &amp; PASTRY DIRECTOR</span>
            <h3>Clara Chen</h3>
            <p>Nurtures Flavoro's 36-hour heritage wild sourdough starter and crafts ember-roasted stone fruit finales and smoked honey desserts.</p>
          </div>
        </article>
        <article class="leader-card reveal-card">
          <div class="leader-image"><img src="/images/editorial/bartender.jpg" alt="Beverage Director Julian Rossi"></div>
          <div class="leader-info">
            <span class="leader-role">BEVERAGE DIRECTOR &amp; MASTER SOMMELIER</span>
            <h3>Julian Rossi</h3>
            <p>Curator of our living wine cellar, championing small-scale biodynamic vigneron families and zero-waste botanical cordial programs.</p>
          </div>
        </article>
        <article class="leader-card reveal-card">
          <div class="leader-image"><img src="/images/editorial/dining-room.jpg" alt="Director of Hospitality Elena Rostova"></div>
          <div class="leader-info">
            <span class="leader-role">DIRECTOR OF HOSPITALITY</span>
            <h3>Elena Rostova</h3>
            <p>Brings effortless warmth and choreography to the dining salon, ensuring that every guest feels celebrated from their very first step.</p>
          </div>
        </article>
      </div>
      <div style="margin-top:40px; text-align:center;">
        <a class="button button-outline" href="/pages/about.html">
          <span>Read our founding story</span> <i data-lucide="arrow-right"></i>
        </a>
      </div>
    </div>
  </section>${closePage()}`
}

const articles = {
  'journal-gathering': {
    title: 'The Art of the Long Table: Why Dinners Should Linger',
    eyebrow: 'HOSPITALITY &amp; RITUALS · VOL. IV',
    subtitle: 'In an era of timed seatings and frantic table turns, reclaiming the restorative slowness of the evening meal.',
    author: 'Elena Rostova',
    role: 'Director of Hospitality',
    date: 'October 2, 2026',
    readTime: '5 min read',
    image: '/images/restaurant-interior.jpg',
    caption: 'The Main Dining Salon at Flavoro during late evening service, bathed in candlelight and quiet conversation.',
    pullQuote: '“A truly generous dining room does not mark time by watches or bill presentation, but by the quiet expansion of intimacy around the table.”',
    paragraphs: [
      'The modern urban restaurant has, in so many subtle ways, become an engine of accelerated turnover. Digital countdowns tick behind hosts’ stations, dessert menus arrive before silverware is cleared, and ambient acoustics are calibrated to hurry guests toward the door. At Flavoro, we consciously designed our service cadence to push back against this relentless velocity.',
      'A shared meal is one of the last secular sanctuaries where people sit opposite one another without screens, without agendas, and without an urgent destination. When guests cross our threshold and sink into curved flax banquettes, the room’s acoustic cedar baffling immediately lowers the ambient decibel level. The lighting—cast solely by real tallow candles and the amber glow of the live hearth—mimics the circadian transition from twilight to late evening.',
      'We intentionally structure our course intervals with breath. Between the wood-seared ocean catch and the braised short rib, there is a ten-minute pause—a glass of wine is refreshed, sourdough crusts are broken, and conversations find their second wind. We have observed that the most memorable conversations of our lives rarely happen during the first hour of dinner; they happen in the golden margin after the plates are cleared, when someone uncorks an unexpected bottle of amaro.',
      'Hospitality is not a performance of stiff efficiency. It is the art of giving guests permission to unhurriedly inhabit their own lives. As long as our kitchen fire burns, your chair belongs to you.'
    ],
    nextKey: 'journal-dayboat',
    nextTitle: 'The Day-Boat Line: 4:00 AM Harvests with Bodega Bay Fishermen'
  },
  'journal-craft': {
    title: 'The Geometry of Fresh Semolina: Hand-Rolled Heritage Pastas',
    eyebrow: 'HEARTH &amp; TECHNIQUE · VOL. III',
    subtitle: 'From 36-hour wild fermentation to bronze-die extrusions, exploring the microscopic texture that captures wood-fired sauces.',
    author: 'Clara Chen',
    role: 'Head Baker &amp; Pastry Director',
    date: 'September 16, 2026',
    readTime: '4 min read',
    image: '/images/menu/pasta-editorial.jpg',
    caption: 'Hand-kneaded semolina noodles dusted with heirloom flour on the marble prep pass.',
    pullQuote: '“Pasta is not merely a carbohydrate vehicle; it is an architectural surface engineered to hold emulsion and heat.”',
    paragraphs: [
      'To understand our pasta program, you have to understand grain at the cellular level. Most commercial pasta relies on hyper-processed durum semolina that has been stripped of its germ and bran to maximize shelf stability. At Flavoro, our flour arrives twice a week from Petaluma Grain Mill, stone-ground from certified organic California Sonora and red fife wheat berries.',
      'Every morning at 6:30 AM, our marble pasta counter becomes a laboratory of hydration and tactile instinct. Because freshly milled flour contains live enzymes and fluctuating ambient moisture, no two batches behave identically. Clara Chen assesses the dough by thumb pressure alone—feeling for that elusive springiness that indicates gluten development without over-kneading.',
      'Our pasta shapes are either rolled entirely by hand using three-foot maple matterelli or extruded through antique hand-turned bronze dies. Bronze imparts a microscopically rough, porous skin to each strand—a frosted texture that traps braised sugo, brown butter, and emulsified pasta water, rather than letting sauce slip off into a pool at the bottom of the bowl.',
      'Cooked in heavily salted, rolling water for mere moments, then finished directly in the pan over glowing white oak embers, the noodles absorb the smoky savor of bone marrow and roasted sweet corn. It is pasta that remembers the soil it grew in and the hands that shaped it.'
    ],
    nextKey: 'journal-vintages',
    nextTitle: 'Living Wines: Minimal-Intervention Cellars of the Central Coast'
  },
  'journal-hospitality': {
    title: 'Invisible Hospitality: The Choreography of Intuitive Dining',
    eyebrow: 'HOSPITALITY &amp; RITUALS · VOL. II',
    subtitle: 'Why the most profound moments of service are never theatrical, but felt in the anticipation of unspoken needs.',
    author: 'Elena Rostova',
    role: 'Director of Hospitality',
    date: 'August 28, 2026',
    readTime: '5 min read',
    image: '/images/editorial/dining-room.jpg',
    caption: 'Service director Elena Rostova reviewing evening floor assignments in the dining salon.',
    pullQuote: '“True hospitality anticipates before it is summoned, and dissolves into the background before it can draw attention to itself.”',
    paragraphs: [
      'There is a curious paradox at the heart of fine dining. In many renowned institutions, service has evolved into an ostentatious theater—servers reciting ten-minute monologues over an amuse-bouche, silver cloches lifted with choreographed flourishes, and stiff interruptions that shatter the private intimacy of the table.',
      'At Flavoro, our operational philosophy is rooted in what we call ‘invisible hospitality.’ Our servers are trained to read the subtle body language of a dining room: the slight glance toward the bar that indicates an empty glass, the leaning-in of two lovers that signals they should not be disturbed, or the inquisitive pause of a diner examining an unfamiliar varietal.',
      'Water glasses are replenished from side angles without interrupting conversation. Cutlery is replaced between courses with silent gliding movements. If a guest steps away from the table to take a phone call, their hot plate is held at the hearth pass until they return, ensuring their food is never allowed to cool into lukewarm compromise.',
      'When service is performed with quiet intuition, guests do not marvel at the staff—they simply feel completely at ease, cherished, and entirely present in the company of their companions. That is the only measure of hospitality that truly counts.'
    ],
    nextKey: 'journal-foraging',
    nextTitle: 'In Search of Heirloom Bitters: Wild Botanicals of the Coastal Range'
  },
  'journal-dayboat': {
    title: 'The Day-Boat Line: 4:00 AM Harvests with Bodega Bay Fishermen',
    eyebrow: 'TERROIR &amp; PRODUCERS · VOL. V',
    subtitle: 'How line-caught Pacific seafood travels from dawn tides to our white oak embers before nightfall.',
    author: 'Matteo Vance',
    role: 'Executive Chef &amp; Co-Founder',
    date: 'September 24, 2026',
    readTime: '6 min read',
    image: '/images/market-fish.jpg',
    caption: 'Pacific black cod glazed with wild coastal kelp and roasted over hot coals.',
    pullQuote: '“When fish is pulled from cold ocean currents at dawn and touches hardwood embers that evening, you are tasting the exact tide of that day.”',
    paragraphs: [
      'At four in the morning, Bodega Bay is shrouded in cold maritime fog. The water in the harbor is ink-black, smelling of salt kelp, wet cedar pilings, and clean diesel exhaust. This is where our seafood sourcing begins, aboard the F/V Althea with Captain Sorenson, a third-generation line fisherman whose family has worked these coastal shelves since the 1960s.',
      'Unlike industrial trawlers that spend weeks at sea packing catches in sub-zero freezer holds, Captain Sorenson operates exclusively as a ‘day-boat.’ His crew sets out before dawn, lines the deep continental trench for sablefish (black cod), rock cod, and diver scallops, and returns to the harbor wharf before the afternoon fog burns away.',
      'By 2:30 PM, the day’s haul arrives at Flavoro’s kitchen receiving door. The fish still have crystalline eyes, firm resilient flesh, and the translucent sheen of live ocean water. There is no fishy odor—only the brisk, electric scent of the cold North Pacific current.',
      'We prepare these catches with absolute restraint. The black cod is cured briefly in a wild coastal kelp brine, hung above the hearth for two hours to dry its skin, then seared skin-side-down over red-hot white oak coals. The skin crisps into delicate crackling while the interior flakes like butter. Sourcing like this demands humility: our job is not to conceal the ocean, but to let the embers frame it.'
    ],
    nextKey: 'journal-embers',
    nextTitle: 'The Dawn Embers: Reviving 700° White Oak Woodcraft'
  },
  'journal-vintages': {
    title: 'Living Wines: Minimal-Intervention Cellars of the Central Coast',
    eyebrow: 'LIVING CELLAR · VOL. VI',
    subtitle: 'Discarding laboratory additives in favor of spontaneous native ferments, amphora vessels, and ancient vines.',
    author: 'Julian Rossi',
    role: 'Beverage Director &amp; Master Sommelier',
    date: 'September 08, 2026',
    readTime: '8 min read',
    image: '/images/cocktails.jpg',
    caption: 'Unfiltered, low-intervention natural wines poured from artisanal Central Coast estates.',
    pullQuote: '“A conventional wine reflects the chemist’s laboratory; a living wine reflects the weather, geology, and microorganisms of its hillside.”',
    paragraphs: [
      'Much of the modern industrial wine industry operates under a polite fiction. Consumers assume wine is simply crushed grapes fermented in barrels. In reality, commercial winemaking permits over sixty legal chemical additives—synthetic tannins, cultured aromatic yeasts, powdered acidifiers, and heavy sulfur doses designed to homogenize flavor profiles across different vintages.',
      'At Flavoro, our 600-bottle cellar represents a total rejection of that sterile monoculture. Master Sommelier Julian Rossi spends weeks each season walking the slopes of the Santa Cruz Mountains, Ballard Canyon, and Mendocino Ridge, visiting independent vignerons who farm dry, biodynamic, and ungrafted old vines.',
      'These winemakers allow spontaneous fermentation initiated solely by the indigenous yeasts clinging to the grape skins. The wines ferment in unglazed terracotta amphorae, neutral Austrian casks, or concrete eggs. There is no fining, no sterile filtration, and either zero or minuscule sulfur additions at bottling.',
      'In the glass, these living wines possess an astonishing vitality. They pulse with energetic acidity, savory mineral textures, and aromatics that evolve dramatically over the course of an evening. Paired against wood-fired proteins and roasted wild mushrooms, they don\'t simply complement the dish—they ignite a conversation.'
    ],
    nextKey: 'journal-craft',
    nextTitle: 'The Geometry of Fresh Semolina: Hand-Rolled Heritage Pastas'
  },
  'journal-embers': {
    title: 'The Dawn Embers: Reviving 700° White Oak Woodcraft',
    eyebrow: 'HEARTH &amp; TECHNIQUE · VOL. I',
    subtitle: 'Why the primordial energy of aged hardwood embers unlocks caramelization and botanical smoke that gas burners cannot touch.',
    author: 'Matteo Vance',
    role: 'Executive Chef &amp; Co-Founder',
    date: 'October 14, 2026',
    readTime: '7 min read',
    image: '/images/hero-pasta.jpg',
    caption: 'The glowing white oak hearth at Flavoro, stoked to 700 degrees Fahrenheit before evening service.',
    pullQuote: '“Gas provides heat, but wood provides spirit. Cooking over live embers forces a chef to listen, observe, and surrender to instinct.”',
    paragraphs: [
      'Every morning at 6:00 AM, before the prep cooks arrive and before the first deliveries knock at the rear door, our hearth is kindled. We burn seasoned California white oak and mountain fruitwoods that have aged for a minimum of eighteen months. By midday, those roaring logs have collapsed into a deep, glowing bed of 700-degree embers that radiate pure, clean infrared energy.',
      'Modern commercial kitchen equipment is built for repeatability—you turn a dial to level six, and a gas burner maintains an identical BTU output indefinitely. But gas produces water vapor as a byproduct of combustion, creating a subtly humid cooking zone that dampens deep caramelization. Live wood embers, by contrast, emit intense dry radiant heat.',
      'When a prime cut of short rib or a basket of sweet heirloom carrots is lowered onto our cast-iron grates just inches above the coals, the Maillard reaction occurs with blistering speed. Natural sugars caramelize instantly into a brittle, savory crust, sealing in moisture before the interior can dry out.',
      'Simultaneously, trace aromatic oils within the oak vaporize into wisps of botanical smoke, infusing the food with whispers of roasted almond, dried herbs, and sweet sap. Cooking over fire cannot be automated with a thermostat. It requires intuition, patience, and a constant dialogue between the cook and the flame.'
    ],
    nextKey: 'journal-gathering',
    nextTitle: 'The Art of the Long Table: Why Dinners Should Linger'
  },
  'journal-foraging': {
    title: 'In Search of Heirloom Bitters: Wild Botanicals of the Coastal Range',
    eyebrow: 'LIVING CELLAR · VOL. VII',
    subtitle: 'Foraging wild mugwort, coastal bay laurel, and elderflower for our zero-waste botanical amari program.',
    author: 'Julian Rossi',
    role: 'Beverage Director &amp; Master Sommelier',
    date: 'August 19, 2026',
    readTime: '6 min read',
    image: '/images/editorial/bartender.jpg',
    caption: 'Infusions of coastal botanicals and bitter mountain herbs maturing in glass demijohns.',
    pullQuote: '“A digestif is the punctuation mark of the meal. It should taste of the mountains that shelter the valley.”',
    paragraphs: [
      'On Monday mornings when the dining rooms are quiet, Julian Rossi and our bar team lace up hiking boots and head into the fog-drenched chaparral of the Marin headlands and Coastal Range. With sustainable foraging permits in hand, we clip wild mugwort, yarrow, stinging nettle, and coastal sage.',
      'Back at the bar pass, these wild herbs are matched with citrus peels saved from our morning pastry service and stone fruit pits from our seasonal tarts. We practice a strict zero-waste philosophy: nothing aromatic is discarded.',
      'The botanicals undergo extended macerations in neutral grape spirits distilled from organic California wine skins. We monitor the infusions daily, balancing bitter gentian and wild wormwood against sweet clover honey and caramelized raw turbinado syrup.',
      'The resulting house amari and botanical vermouths are unlike anything found on a commercial backbar. They possess resinous pine notes, refreshing bitter clarity, and a grounding herbal warmth that settles the palate after a decadent wood-fired feast.'
    ],
    nextKey: 'journal-sunday',
    nextTitle: 'The Sunday Long Table: Communal Feasting &amp; Sourdough Rituals'
  },
  'journal-sunday': {
    title: 'The Sunday Long Table: Communal Feasting &amp; Sourdough Rituals',
    eyebrow: 'TERROIR &amp; PRODUCERS · VOL. VIII',
    subtitle: 'The weekly community ritual where hot sourdough is sliced, whole roasts are carved, and strangers become companions.',
    author: 'Clara Chen',
    role: 'Head Baker &amp; Pastry Director',
    date: 'August 10, 2026',
    readTime: '5 min read',
    image: '/images/breakfast.jpg',
    caption: 'Freshly baked sourdough boules, whipped cultured butter, and communal platters during the Sunday Long Table feast.',
    pullQuote: '“When you pass a heavy ceramic platter down a twenty-foot cedar table, the invisible walls between strangers vanish.”',
    paragraphs: [
      'Sunday service at Flavoro holds a special place in our brigade\'s heart. We strip the dining room of its individual tables and assemble one continuous, twenty-foot cedar banquet that runs the full length of the salon. There are no menus placed in front of diners—only carafes of chilled coastal cider, crusty loaves of hot sourdough, and ramekins of smoked ember butter.',
      'At 12:30 PM, the kitchen bell chimes and service begins family-style. Platters of ember-roasted heritage pork shoulders, charred seasonal pole beans, and crispy cassava rosti cakes are brought directly from the hearth pass and placed down the center of the table.',
      'Guests who arrived as strangers find themselves reaching across to pour wine for their neighbors, sharing stories, and laughing over shared dessert boards of warm stone-fruit cobbler and bourbon cream. It evokes the ancient communal banquets of the Mediterranean, transplanted into the heart of Northern California.',
      'It is a vibrant reminder that food was never meant to be consumed in solitary isolation. The greatest meals have always been about the circle of hands gathered around the warmth of the fire.'
    ],
    nextKey: 'journal-embers',
    nextTitle: 'The Dawn Embers: Reviving 700° White Oak Woodcraft'
  }
}


/* -------------------------------------------------------------------------
   The journal issue — one source of truth for the index, the shelf and the
   article pages. `articles` holds the writing; this shapes it for the index.
   ------------------------------------------------------------------------- */

const JOURNAL_ORDER = [
  'journal-embers',
  'journal-gathering',
  'journal-dayboat',
  'journal-craft',
  'journal-vintages',
  'journal-hospitality',
  'journal-foraging',
  'journal-sunday',
]

const titleCase = (value) =>
  String(value)
    .toLowerCase()
    .replace(/(^|[\s&])([a-z])/g, (match, lead, letter) => lead + letter.toUpperCase())

function journalIssue() {
  return JOURNAL_ORDER.filter((slug) => articles[slug]).map((slug) => {
    const article = articles[slug]
    const [category = '', volume = ''] = article.eyebrow
      .replace(/&amp;/g, '&')
      .split('·')
      .map((part) => part.trim())
    const plainTitle = article.title.replace(/&amp;/g, '&')
    const minutes = Number.parseInt(article.readTime, 10) || 5
    return {
      slug,
      url: `/pages/${slug}.html`,
      title: plainTitle,
      short: plainTitle.split(':')[0],
      category: titleCase(category),
      categoryRaw: category,
      sectionKey: category.toLowerCase().split(' ')[0].replace(/[^a-z]/g, ''),
      volume: volume.replace('VOL.', '').trim(),
      subtitle: article.subtitle,
      image: article.image,
      caption: article.caption,
      author: article.author,
      role: article.role,
      date: article.date,
      readTime: article.readTime,
      minutes,
    }
  })
}

/* The bookcase is grouped by section, the way a shelf actually is; the index
   above stays chronological, the way a bound volume actually is. */
const JOURNAL_SECTIONS = ['HEARTH & TECHNIQUE', 'HOSPITALITY & RITUALS', 'TERROIR & PRODUCERS', 'LIVING CELLAR']
const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 }

function journalShelf(issue) {
  return [...issue].sort((a, b) => {
    const section = JOURNAL_SECTIONS.indexOf(a.categoryRaw) - JOURNAL_SECTIONS.indexOf(b.categoryRaw)
    if (section !== 0) return section
    return (ROMAN[a.volume] || 0) - (ROMAN[b.volume] || 0)
  })
}

function journalArticle(key) {
  const article = articles[key] || articles['journal-embers']
  return `${pageHero(article.eyebrow, article.title, article.subtitle, article.image, 'Blog')}
  <article class="editorial-article section-pad">
    <div class="container narrow">
      <div class="article-top-nav">
        <a class="article-back-link" href="/pages/blog.html">
          <i data-lucide="arrow-left"></i> <span>Return to Flavoro Journal</span>
        </a>
      </div>

      <header class="article-header-meta">
        <div class="article-badge-row">
          <span class="article-category-badge">${article.eyebrow}</span>
          <span class="article-read-time"><i data-lucide="clock"></i> ${article.readTime}</span>
          <span class="article-pub-date">${article.date}</span>
        </div>
        <div class="article-byline-card">
          <div class="byline-avatar"><i data-lucide="award"></i></div>
          <div class="byline-info">
            <strong>By ${article.author}</strong>
            <small>${article.role}</small>
          </div>
        </div>
      </header>

      <div class="article-lead-paragraph">
        <p class="dropcap-lead">${article.paragraphs[0]}</p>
      </div>

      <figure class="article-featured-figure">
        <img src="${article.image}" alt="${article.title}">
        <figcaption><i data-lucide="camera"></i> ${article.caption}</figcaption>
      </figure>

      <div class="article-body-copy">
        <p>${article.paragraphs[1]}</p>
      </div>

      <blockquote class="editorial-pull-quote">
        <i data-lucide="quote" class="quote-mark"></i>
        <p>${article.pullQuote}</p>
        <cite>— ${article.author}, ${article.role}</cite>
      </blockquote>

      <div class="article-body-copy">
        ${article.paragraphs.slice(2).map(p => `<p>${p}</p>`).join('')}
      </div>

      <div class="article-author-bio-box">
        <div class="bio-inner">
          <div class="bio-icon"><i data-lucide="award"></i></div>
          <div class="bio-content">
            <h4>About the Author: ${article.author}</h4>
            <p>${article.role} at Flavoro. Dedicated to advancing regenerative agricultural sourcing, live-fire culinary heritage, and thoughtful hospitality across Northern California.</p>
          </div>
        </div>
      </div>

      ${article.nextKey ? `
      <div class="article-next-card">
        <span class="next-label">CONTINUE READING THE DISPATCHES</span>
        <div class="next-card-inner">
          <div>
            <small>NEXT ESSAY</small>
            <h3>${article.nextTitle}</h3>
          </div>
          <a href="/pages/${article.nextKey}.html" class="button button-outline">
            <span>Read Next</span> <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </div>` : ''}

      <div class="article-bottom-actions">
        <a class="button button-outline" href="/pages/blog.html">
          <i data-lucide="arrow-left"></i> <span>Browse All Dispatches</span>
        </a>
      </div>
    </div>
  </article>

  <section class="reservation-banner">
    <img src="/images/restaurant-interior.jpg" alt="Dining Room">
    <div class="container">
      <span class="eyebrow">SAVOR THE DISPATCH IN PERSON</span>
      <h2>Experience the hearth.</h2>
      <p>Reserve a table for this evening and taste the season's harvest over white oak embers.</p>
      <a class="button button-primary" href="/pages/reservations.html">
        <span>Reserve a table</span> <i data-lucide="calendar-days"></i>
      </a>
    </div>
  </section>${closePage()}`
}
function infoPage(kind) {
 const content = {
  privacy: ['Privacy policy', 'Privacy matters.', 'Draft for review: this preview does not provide a finalized privacy policy. Before launch, the operator must disclose the data collected, purposes, retention, providers, user rights and contact details.', 'Preview forms are not connected and do not send information. The sample order bag uses session storage in your browser.'],
  terms: ['Terms of use', 'A note on this site.', 'Draft for review: terms must be approved by the site operator before launch. The site currently presents an illustrative restaurant concept.', 'Menu details, prices, availability, booking and ordering are examples only and do not constitute an offer or confirmation.'],
  accessibility: ['Accessibility', 'A table for everyone.', 'We aim to make this website usable with a keyboard and provide reduced-motion alternatives where possible.', 'This site has not yet completed an independent accessibility audit. Verified contact details for accessibility feedback and venue access information will be added when available.'],
  'order-confirmation': ['Order status', 'No order placed.', 'Online ordering is not connected. Visiting this page does not submit or confirm an order.', 'You can return to the menu to explore the order preview.'],
 }
 const [label,title,one,two] = content[kind]
 return `${pageHero(label, title, 'Flavoro · Information', img.interior, '')}<section class="editorial-article section-pad"><div class="container narrow"><span class="eyebrow">${label.toUpperCase()}</span><p>${one}</p><p>${two}</p><a class="selection-link" href="${kind === 'order-confirmation' ? '/pages/menu.html' : '/pages/visit.html'}">${kind === 'order-confirmation' ? 'Explore the menu' : 'Plan a visit'} <span>↗</span></a></div></section>${closePage()}`
}

function notFound() {
 return `<main id="main-content" class="error-404">
   <h1 class="sr-only">Page not found</h1>
   <img class="error-404-art" src="/images/404-chef.jpg" alt="A disappointed cartoon dog chef standing beside a burnt meal">
   <div class="error-404-code" aria-label="404 error"><strong>404</strong><span>ERROR</span></div>
   <div class="error-404-bubble"><p>Oooops!<br>Something<br>went wrong</p><a href="/index.html">Back to home <i data-lucide="arrow-right"></i></a></div>
 </main>`
}

function auth(type) {
 const signup = type === 'signup'
 return `<main id="main-content" class="auth-page"><a class="brand auth-brand" href="/index.html"><span class="brand-mark"><i data-lucide="utensils-crossed"></i></span><span><b>Flavoro</b><small>RESTAURANT</small></span></a><div class="auth-visual"><img src="${img.hero}" alt="A plated dish"><div><span class="script-line">Welcome to Flavoro</span><h1>${signup ? 'Your table has<br>room for you.' : 'Come back to<br>something delicious.'}</h1></div></div><div class="auth-panel"><a class="back-link" href="/index.html"><i data-lucide="arrow-left"></i>Back home</a><div class="auth-box"><span class="eyebrow">Flavoro members · Local preview</span><h2>${signup ? 'Create your space' : 'Welcome back'}</h2><p>Keep a local collection of your favorite dishes and preferences.</p><div class="demo-notice">Browser-only demo, not secure authentication. Use a test password, not a real one. One guest account per browser; clearing storage removes it.</div><form data-account-form data-mode="${signup ? 'signup' : 'login'}">${signup ? '<label>Full name<input name="name" required maxlength="60" autocomplete="name" placeholder="Your full name"></label>' : ''}<label>Email address<input name="email" required type="email" autocomplete="username" placeholder="you@example.com"></label><label>Password<input name="password" required type="password" minlength="8" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="At least 8 characters"></label>${signup ? '<label>Confirm password<input name="confirm" required type="password" minlength="8" autocomplete="new-password" placeholder="Repeat password"></label>' : ''}<button class="button button-primary" type="submit">${signup ? 'Create local account' : 'Sign in'}<i data-lucide="arrow-right"></i></button><p data-account-status role="status" aria-live="polite"></p></form><div class="auth-switch">${signup ? 'Already have an account?' : 'New to Flavoro?'} <a href="/pages/${signup ? 'login' : 'signup'}.html">${signup ? 'Sign in' : 'Create account'}</a></div><div style="margin-top:14px; text-align:center;"><a href="/pages/user-dashboard.html?preview=true" style="font-size:11px; font-weight:700; color:#e07300;">Explore Guest Dashboard Directly ↗</a></div></div></div></main>`
}

export function renderPage(page) {
 function reservationStatusPage() {
  return `${pageHero('Reservation status · Local prototype', 'Your table,<br><em>at a glance.</em>', 'Review, modify, repeat or cancel a booking stored in this browser. Nothing here is connected to a live restaurant system.', img.interior, 'Reservations')}
  <section class="section-pad rsv-status-section"><div class="container narrow"><div id="reservation-status-root"></div></div></section>${closePage()}`
}

const pages = { home, about, menu, gallery, reservations, blog, contact, checkout, 'private-dining': privateDining, visit, people, ...Object.fromEntries(Object.keys(articles).map(key => [key, () => journalArticle(key)])), ...Object.fromEntries(['privacy','terms','accessibility','order-confirmation'].map(key => [key, () => infoPage(key)])), 'reservation-confirmation': reservationStatusPage, login: () => auth('login'), signup: () => auth('signup'), notFound }
 return (pages[page] || notFound)()
}
