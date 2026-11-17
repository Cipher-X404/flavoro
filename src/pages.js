import { closePage, dishCard, footer, header, pageHero, sectionHead } from './components/site.js'
import { renderEndlessSection } from './components/ui/endless.js'
import { renderTeamLanyardRail } from './components/ui/team-lanyard-rail.js'

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

const marquee = (text = 'FIRE · FLAVOR · PEOPLE · PASSION ·') => `<div class="marquee" aria-hidden="true"><div>${Array(5).fill(`<span>${text}</span>`).join('')}</div></div>`

function homeCodex() {
  return `
  <section class="codex-section" aria-label="The Flavoro Craft and Tenets">
    <!-- Top Editorial Header & Epigraph -->
    <div class="codex-header">
      <div class="container codex-header-inner">
        <div class="codex-prologue reveal">
          <span class="codex-kicker">
            <span class="codex-spark">✳</span>
            THE FLAVORO CODEX &nbsp; / &nbsp; FOUR TENETS OF THE TABLE
          </span>
          <h2 class="codex-title">
            Where fire meets season, and strangers leave as <em>company.</em>
          </h2>
        </div>
        <div class="codex-aside reveal">
          <p class="codex-lead">
            Every evening at Flavoro is anchored in four core principles — from our oak-fired hearth to our local growers and living cellar.
          </p>
          <a href="/pages/reservations.html" class="codex-action">
            <span>Reserve your evening</span>
            <i data-lucide="arrow-up-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- 4-Column Architectural Codex Grid -->
    <div class="container codex-grid-wrap">
      <div class="codex-grid">
        <!-- Pillar I -->
        <article class="codex-column reveal">
          <div class="codex-col-header">
            <span class="codex-num">I</span>
            <span class="codex-tag">HEARTH METHOD</span>
          </div>
          <div class="codex-feature">
            <span class="codex-display-word">Heat.</span>
            <span class="codex-stat">700° Live Oak Flame</span>
          </div>
          <p class="codex-body">
            Dishes are shaped course-by-course over seasoned white oak embers, marrying searing hearth heat with delicate wood smoke.
          </p>
          <div class="codex-meta">
            <i data-lucide="flame" aria-hidden="true"></i>
            <span>Hardwood hearth cooking</span>
          </div>
        </article>

        <!-- Pillar II -->
        <article class="codex-column reveal">
          <div class="codex-col-header">
            <span class="codex-num">II</span>
            <span class="codex-tag">FARM TERROIR</span>
          </div>
          <div class="codex-feature">
            <span class="codex-display-word">Earth.</span>
            <span class="codex-stat">Zero-Kilometer Harvest</span>
          </div>
          <p class="codex-body">
            We cook strictly in rhythm with regional growers, heirloom orchards, biodynamic producers, and day-boat fishing cooperatives.
          </p>
          <div class="codex-meta">
            <i data-lucide="leaf" aria-hidden="true"></i>
            <span>100% Seasonal provenance</span>
          </div>
        </article>

        <!-- Pillar III -->
        <article class="codex-column reveal">
          <div class="codex-col-header">
            <span class="codex-num">III</span>
            <span class="codex-tag">LOW-INTERVENTION</span>
          </div>
          <div class="codex-feature">
            <span class="codex-display-word">Spirit.</span>
            <span class="codex-stat">Living Cellar Vintages</span>
          </div>
          <p class="codex-body">
            Natural wines, botanical infusions, and low-intervention fermentation pairings curated to dialogue with our wood-fired plates.
          </p>
          <div class="codex-meta">
            <i data-lucide="wine" aria-hidden="true"></i>
            <span>Cellar flights &amp; pairings</span>
          </div>
        </article>

        <!-- Pillar IV -->
        <article class="codex-column reveal">
          <div class="codex-col-header">
            <span class="codex-num">IV</span>
            <span class="codex-tag">THE SALON</span>
          </div>
          <div class="codex-feature">
            <span class="codex-display-word">Gather.</span>
            <span class="codex-stat">Wednesday – Sunday</span>
          </div>
          <p class="codex-body">
            From the kinetic energy of our open counter seats to candlelit dining room tables. Doors open from 5:30 PM until late.
          </p>
          <div class="codex-meta">
            <i data-lucide="calendar-days" aria-hidden="true"></i>
            <span>Reserved tables &amp; walk-in bar</span>
          </div>
        </article>
      </div>
    </div>

    <!-- Bottom Coordinates & Motto Ribbon -->
    <div class="codex-footer">
      <div class="container codex-footer-inner">
        <span class="codex-foot-coord">FLAVORO RESTAURANT &nbsp; / &nbsp; OPEN HEARTH CUISINE</span>
        <span class="codex-foot-motto">“Food worth gathering for. Moments worth staying for.”</span>
        <a href="/pages/about.html" class="codex-foot-link">
          <span>Our philosophy</span>
          <i data-lucide="arrow-up-right" aria-hidden="true"></i>
        </a>
      </div>
    </div>
  </section>`
}

function home() {
  return `${header('Home')}<main id="main-content">
  <section class="home-hero" data-parallax aria-label="Welcome to Flavoro">
    <video class="hero-bg" loop muted playsinline webkit-playsinline preload="metadata" poster="${img.hero}">
      <source src="${img.heroVideo}" type="video/mp4">
    </video>
    <div class="hero-vignette" aria-hidden="true"></div>
    <div class="hero-grain" aria-hidden="true"></div>
    <div class="hero-frame" aria-hidden="true"></div>
    <div class="hero-editorial">
      <div class="hero-overline"><span class="hero-spark">✳</span> A PLACE FOR GOOD THINGS</div>
      <h1 class="hero-title"><span>Come for</span><span>the <em>flavor.</em></span><span class="hero-title-last">Stay for the feeling.</span></h1>
      <div class="hero-bottom-copy">
        <p>Food worth gathering for.<br>Moments worth staying for.</p>
        <a class="hero-discover" href="/pages/menu.html"><span>Explore the menu</span><span class="hero-arrow" aria-hidden="true">↗</span></a>
      </div>
    </div>
    <div class="hero-orbit" aria-hidden="true"><svg class="hero-flourish" viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="78"/><path d="M90 34v112M34 90h112M50 50l80 80M130 50l-80 80"/></svg><span>GOOD FOOD<br>GOOD MOOD</span></div>
    <button class="hero-video-control" type="button" data-video-toggle aria-label="Pause background video" aria-pressed="false">Ⅱ <span>PAUSE FILM</span></button>
    <div class="hero-footer-line"><span>FLAVORO &nbsp; / &nbsp; RESTAURANT</span><a href="#home-story">SCROLL TO EXPLORE <span>↓</span></a><span>MADE WITH SOUL &nbsp; ✳</span></div>
  </section>
  ${homeCodex()}

  <section id="home-story" class="table-story section-pad" aria-labelledby="table-story-title"><div class="container table-story-grid">
    <div class="table-story-copy reveal"><span class="eyebrow">THE FLAVORO FEELING &nbsp; / &nbsp; 01</span><h2 id="table-story-title">A table worth <em>staying for.</em></h2><p>It starts with something delicious. It becomes a moment shared.</p><a class="text-link" href="/pages/about.html">Discover our story <i data-lucide="arrow-up-right"></i></a></div>
    <div class="table-story-image reveal-image"><img src="${img.interior}" alt="A warmly lit dining space"><span>THE ART OF GATHERING &nbsp; ✳</span></div>
    <div class="table-story-aside"><span>FOOD / PEOPLE / MOMENTS</span><p>Come as you are.<br>Stay a little longer.</p></div>
  </div></section>

  <section id="signatures" class="home-selection section-pad" aria-labelledby="selection-heading"><div class="container">
    <div class="selection-head"><div><span class="selection-kicker">A TASTE OF FLAVORO &nbsp; / &nbsp; 02</span><h2 id="selection-heading">A little something<br><em>for everyone.</em></h2></div><div class="selection-intro"><p>From the first bite to the last, there’s always something worth savoring.</p><a class="selection-link" href="/pages/menu.html">Explore the menu <span>↗</span></a></div></div>
    <div class="selection-grid">
      <a class="selection-card reveal-card" href="/pages/menu.html#act-morning"><div class="selection-image"><img src="${img.breakfastPhoto}" alt="Scrambled eggs and toast"><span>01 / MORNING</span><b aria-hidden="true">↗</b></div><div class="selection-caption"><h3>Start beautifully.</h3><p>Something good for the beginning of your day.</p></div></a>
      <a class="selection-card reveal-card" href="/pages/menu.html#act-midday"><div class="selection-image"><img src="${img.salad}" alt="A colorful plate of greens"><span>02 / MIDDAY</span><b aria-hidden="true">↗</b></div><div class="selection-caption"><h3>Stay for a while.</h3><p>A little time together, made delicious.</p></div></a>
      <a class="selection-card reveal-card" href="/pages/menu.html#act-confections"><div class="selection-image"><img src="${img.dessertPhoto}" alt="Chocolate dessert on a plate"><span>03 / THE FINALE</span><b aria-hidden="true">↗</b></div><div class="selection-caption"><h3>End on a sweet note.</h3><p>For the moments you wish would linger.</p></div></a>
    </div><p class="selection-note">A visual introduction. Menu items and prices are illustrative.</p>
  </div></section>

  <section id="spaces" class="home-gather section-pad"><div class="container gather-grid"><div class="gather-image reveal-image"><img src="${img.private}" alt="A table set for dining"><span>THE PLEASURE OF SHARING &nbsp; ✳</span></div><div class="gather-copy reveal"><span class="selection-kicker">GOOD COMPANY &nbsp; / &nbsp; 03</span><h2>Make a moment<br><em>of it.</em></h2><p>Some occasions call for a little more time around the table. Discover the inspiration behind gathering at Flavoro.</p><a class="selection-link" href="/pages/private-dining.html">Explore private dining <span>↗</span></a></div></div></section>

  <section class="home-people section-pad"><div class="container people-grid"><div class="people-copy reveal"><span class="selection-kicker">THE HUMAN TOUCH &nbsp; / &nbsp; 04</span><h2>It’s the people<br>that make it <em>special.</em></h2><p>Good hospitality is made in the details—and in the moments shared across the table.</p><a class="selection-link" href="/pages/people.html">Meet the story <span>↗</span></a></div><div class="people-image reveal-image"><img src="${img.chefs}" alt="Chefs working together in a kitchen"></div></div></section>

  <section class="reservation-banner"><img src="${img.drinks}" alt="Candlelit restaurant table"><div class="container"><span class="eyebrow">Your table is waiting</span><h2>Reserve your evening.</h2><p>Good food tastes better when it is shared.</p><a class="button button-primary magnetic" href="/pages/reservations.html">Book a table <i data-lucide="calendar-days"></i></a></div></section>
  </main>${footer()}`
}

function about() {
  return `${header('About')}<main id="main-content" class="apple-about-page">
  
  <!-- Section 1: Hero Keynote (Deep Black Canvas #000000) -->
  <section class="apple-tile-section apple-tile-black" id="about-hero">
    <div class="apple-container apple-hero-center">
      <span class="apple-eyebrow-hero apple-reveal">FLAVORO RESTAURANT · SAN FRANCISCO</span>
      <h1 class="apple-headline-hero apple-reveal">
        Cooked over wood fire.<br>Made for gathering.
      </h1>
      <p class="apple-lead-hero apple-reveal">
        We built Flavoro as a welcoming neighborhood dining room where good food, live oak embers, and honest hospitality come together without pretense.
      </p>
      <div class="apple-hero-cta-group apple-reveal">
        <a href="/pages/reservations.html" class="apple-pill-btn apple-pill-blue">
          <span>Reserve a table</span> <i data-lucide="arrow-right"></i>
        </a>
        <a href="#about-story" class="apple-pill-btn apple-pill-ghost">
          <span>Our story</span> <i data-lucide="chevron-down"></i>
        </a>
      </div>

      <!-- Hero Pedestal with Apple Museum Shadow -->
      <div class="apple-hero-pedestal apple-reveal-image">
        <div class="apple-pedestal-frame">
          <img src="/images/restaurant-interior.jpg" alt="The warm, candlelit dining room at Flavoro">
          <div class="apple-pedestal-caption">
            <span>Our dining room at dusk — warm lights, comfortable tables, and the hearth at the center.</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: How We Started (Parchment Canvas #f5f5f7) -->
  <section class="apple-tile-section apple-tile-parchment" id="about-story">
    <div class="apple-container">
      <div class="apple-section-header apple-reveal">
        <span class="apple-eyebrow">HOW WE STARTED</span>
        <h2 class="apple-display-lg">Simple food, cooked with care.</h2>
        <p class="apple-lead-text">Started in 2026 by Chef Matteo Vance and Sommelier Julian Rossi after years of working in traditional fine-dining kitchens.</p>
      </div>

      <div class="apple-monograph-split">
        <div class="apple-editorial-col apple-reveal">
          <p class="apple-callout-text">“The best meals aren’t about stiff tablecloths or complicated garnishes. They’re about delicious food, a warm room, and good conversation that lingers long after dessert.”</p>
          <p class="apple-body-text">After spending years in high-pressure kitchens in Lyon, Copenhagen, and Tokyo, Matteo and Julian wanted something different: a restaurant that feels like having dinner at a good friend’s home, with food cooked over real hardwood fire.</p>
          <p class="apple-body-text">Flavoro was built around a large open hearth in the center of the dining room. There are no gas stoves or electric shortcuts in our kitchen. We kindle seasoned California white oak and fruitwood every morning, letting the embers burn down into a deep, steady bed of heat.</p>
          <p class="apple-body-text">Whether you come in for a quick plate of handmade pasta and a glass of wine at the counter, or spend three hours sharing family-style platters with friends, you are welcome here.</p>
          <div class="apple-signature-row">
            <div class="sig-badge"><i data-lucide="award"></i></div>
            <div>
              <strong>Matteo Vance &amp; Julian Rossi</strong>
              <small>Co-Founders, Flavoro Restaurant</small>
            </div>
          </div>
        </div>

        <!-- Bento Specs HUD -->
        <div class="apple-specs-hud apple-reveal">
          <div class="apple-spec-box">
            <strong class="apple-spec-num">700°</strong>
            <span class="apple-spec-label">WOOD EMBERS</span>
            <p>Real California white oak burning in our open hearth all day.</p>
          </div>
          <div class="apple-spec-box">
            <strong class="apple-spec-num">80 mi</strong>
            <span class="apple-spec-label">LOCAL SOURCING</span>
            <p>Everything from our fish to our greens comes from nearby family farms.</p>
          </div>
          <div class="apple-spec-box">
            <strong class="apple-spec-num">36 hrs</strong>
            <span class="apple-spec-label">WILD SOURDOUGH</span>
            <p>Slow-fermented heritage loaves baked fresh every morning by Clara.</p>
          </div>
          <div class="apple-spec-box">
            <strong class="apple-spec-num">100%</strong>
            <span class="apple-spec-label">MADE FROM SCRATCH</span>
            <p>Fresh pasta rolled by hand daily, house stocks, and churned butter.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: How We Cook (Pure White Canvas #ffffff) -->
  <section class="apple-tile-section apple-tile-white" id="about-tenets">
    <div class="apple-container">
      <div class="apple-section-header apple-reveal">
        <span class="apple-eyebrow">HOW WE COOK</span>
        <h2 class="apple-display-lg">Three things we care deeply about.</h2>
        <p class="apple-lead-text">The straightforward promises behind every plate that leaves our kitchen.</p>
      </div>

      <div class="apple-bento-grid">
        <!-- Bento 1 -->
        <div class="apple-bento-card apple-reveal-card">
          <div class="bento-icon-circle"><i data-lucide="flame"></i></div>
          <span class="bento-tag">THE HEARTH</span>
          <h3>Real Wood Fire</h3>
          <p>Cooking over embers takes patience and attention. The intense radiant heat gives seafood crisp skin, deepens the sweetness of seasonal vegetables, and adds a gentle hint of wood smoke you just can't get on a gas stove.</p>
          <div class="bento-footer">
            <span>Aged California white oak &amp; fruitwood</span>
          </div>
        </div>

        <!-- Bento 2 -->
        <div class="apple-bento-card apple-reveal-card">
          <div class="bento-icon-circle"><i data-lucide="leaf"></i></div>
          <span class="bento-tag">THE FARMERS</span>
          <h3>Fresh Local Ingredients</h3>
          <p>We don't buy from industrial suppliers. We work directly with small growers, coastal foragers, and independent fishermen around Northern California who bring us peak-season produce within hours of harvest.</p>
          <div class="bento-footer">
            <span>Harvested by local friends within 80 miles</span>
          </div>
        </div>

        <!-- Bento 3 -->
        <div class="apple-bento-card apple-reveal-card">
          <div class="bento-icon-circle"><i data-lucide="wine"></i></div>
          <span class="bento-tag">THE CELLAR</span>
          <h3>Honest, Living Wines</h3>
          <p>Julian selects wines from small family vineyards that farm organically and use minimal intervention. They taste clean, expressive, and pair naturally with rich food straight off the fire.</p>
          <div class="bento-footer">
            <span>Organically farmed &amp; low-intervention</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  ${renderTeamLanyardRail()}

  <!-- Section 5: Our Partners (Parchment Canvas #f5f5f7) -->
  <section class="apple-tile-section apple-tile-parchment" id="about-producers">
    <div class="apple-container">
      <div class="apple-section-header apple-reveal">
        <span class="apple-eyebrow">OUR PARTNERS</span>
        <h2 class="apple-display-lg">The growers and fishermen who supply our kitchen.</h2>
        <p class="apple-lead-text">Great cooking starts with great ingredients. These are the independent folks who make our menu possible.</p>
      </div>

      <div class="apple-utility-grid">
        <div class="apple-utility-card apple-reveal-card">
          <div class="utility-card-top">
            <span class="utility-region-badge">BODEGA BAY</span>
            <i data-lucide="compass"></i>
          </div>
          <h4>Day-Boat Fishermen</h4>
          <p>Line-caught black cod, rockfish, and diver scallops caught in cold Pacific waters and brought straight to our back door by afternoon.</p>
          <div class="utility-spec-foot">
            <span>Delivered the same day it’s caught</span>
          </div>
        </div>

        <div class="apple-utility-card apple-reveal-card">
          <div class="utility-card-top">
            <span class="utility-region-badge">SEBASTOPOL</span>
            <i data-lucide="leaf"></i>
          </div>
          <h4>Sun &amp; Furrow Farm</h4>
          <p>Heirloom tomatoes, sweet summer squash, bitter chicories, and tender herbs grown on rich organic soil in Sonoma County.</p>
          <div class="utility-spec-foot">
            <span>Organic vegetables picked at peak ripeness</span>
          </div>
        </div>

        <div class="apple-utility-card apple-reveal-card">
          <div class="utility-card-top">
            <span class="utility-region-badge">SONOMA VALLEY</span>
            <i data-lucide="shield-check"></i>
          </div>
          <h4>Oak Ridge Pastures</h4>
          <p>Pasture-raised heritage pork and dry-aged beef from animals raised outdoors on family-owned Northern California grasslands.</p>
          <div class="utility-spec-foot">
            <span>Humanely raised &amp; pasture-fed</span>
          </div>
        </div>

        <div class="apple-utility-card apple-reveal-card">
          <div class="utility-card-top">
            <span class="utility-region-badge">PETALUMA</span>
            <i data-lucide="award"></i>
          </div>
          <h4>Petaluma Grain Mill</h4>
          <p>Stone-ground whole wheat, rye, and spelt flour milled weekly so our bread and fresh pasta retain their natural aroma and nutrients.</p>
          <div class="utility-spec-foot">
            <span>Freshly stone-ground weekly</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: The Dining Room (Pure White Canvas #ffffff) -->
  <section class="apple-tile-section apple-tile-white" id="about-spaces">
    <div class="apple-container">
      <div class="apple-section-header apple-reveal">
        <span class="apple-eyebrow">THE DINING ROOM</span>
        <h2 class="apple-display-lg">Find the right spot for your night.</h2>
        <p class="apple-lead-text">Whether you want to be close to the kitchen action or tucked away in a quiet corner.</p>
      </div>

      <div class="apple-spaces-stack">
        <!-- Space 1 -->
        <article class="apple-space-banner apple-reveal-card">
          <div class="space-banner-image">
            <img src="/images/restaurant-interior.jpg" alt="The Main Dining Room at Flavoro">
          </div>
          <div class="space-banner-content">
            <span class="space-spec-chip">MAIN ROOM · 48 SEATS</span>
            <h3>The Main Dining Room</h3>
            <p>Spacious booths, warm lighting, and relaxed music. Perfect for date nights, birthday dinners, or catching up with old friends over a bottle of wine.</p>
            <div class="space-pill-row">
              <span class="space-meta-pill"><i data-lucide="users"></i> 1 to 8 Guests</span>
              <span class="space-meta-pill"><i data-lucide="clock"></i> Dinner Wed – Sun</span>
            </div>
          </div>
        </article>

        <!-- Space 2 -->
        <article class="apple-space-banner apple-reveal-card">
          <div class="space-banner-image">
            <img src="/images/hero-pasta.jpg" alt="The Hearth Counter at Flavoro">
          </div>
          <div class="space-banner-content">
            <span class="space-spec-chip">HEARTH COUNTER · 8 SEATS</span>
            <h3>The Hearth Counter</h3>
            <p>Bar seats directly facing the open fire and plating line. Watch the chefs cook, ask questions, and enjoy dishes hot off the grates.</p>
            <div class="space-pill-row">
              <span class="space-meta-pill"><i data-lucide="flame"></i> Chef View</span>
              <span class="space-meta-pill"><i data-lucide="award"></i> Solo Diners &amp; Couples</span>
            </div>
          </div>
        </article>

        <!-- Space 3 -->
        <article class="apple-space-banner apple-reveal-card">
          <div class="space-banner-image">
            <img src="/images/private-dining.jpg" alt="The Secret Garden Terrace at Flavoro">
          </div>
          <div class="space-banner-content">
            <span class="space-spec-chip">GARDEN TERRACE · 16 SEATS</span>
            <h3>The Secret Garden Terrace</h3>
            <p>A sheltered, heated outdoor terrace surrounded by greenery and lanterns. Great for small private parties and relaxed weekend dinners.</p>
            <div class="space-pill-row">
              <span class="space-meta-pill"><i data-lucide="leaf"></i> Outdoor Heating</span>
              <span class="space-meta-pill"><i data-lucide="users"></i> Private Gatherings</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Section 7: Keynote Callout (Surface Black Canvas #000000) -->
  <section class="apple-tile-section apple-tile-black" id="about-cta">
    <div class="apple-container apple-quote-center apple-reveal">
      <div class="apple-quote-icon"><i data-lucide="quote"></i></div>
      <blockquote class="apple-keynote-quote">
        “Flavoro proves that the best dining experience doesn’t need pretense. Just crackling wood fire, fresh ingredients, and genuine hospitality.”
      </blockquote>
      <cite class="apple-quote-cite">— The San Francisco Dining Guide</cite>

      <div class="apple-epilogue-box">
        <span class="apple-eyebrow-hero">OUR DOORS ARE OPEN</span>
        <h2 class="apple-headline-cta">Come eat with us.</h2>
        <p class="apple-lead-hero">We are open Wednesday through Sunday from 5:30 PM until late. We’d love to cook for you.</p>
        <div class="apple-cta-buttons">
          <a href="/pages/reservations.html" class="apple-pill-btn apple-pill-blue">
            <span>Reserve a table</span> <i data-lucide="calendar-days"></i>
          </a>
          <a href="/pages/menu.html" class="apple-pill-btn apple-pill-ghost">
            <span>Explore the menu</span> <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </div>
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
 return `${pageHero('Table Reservations · Preview', 'Reserve your table.<br><em>Curate your evening.</em>', 'Explore the booking experience. Reservations are not connected or confirmed on this site.', img.interior, 'Reservations')}
 <section class="booking-section section-pad">
   <div class="container booking-grid">
     <div>
       ${sectionHead('Table Reservation', 'Find your place at the table', 'Explore the reservation experience as a guest. No account is required.')}
       <p class="demo-notice">Online booking is not connected. Dates and times shown below are examples, not availability.</p>
     </div>

     <form id="reservation-booking-form" class="booking-form reveal"><p class="demo-notice" role="status">Preview only: availability is not live and this form cannot book a table.</p>
       <div class="res-step-badge"><span>Step 1 · Reservation Details</span></div>
       <div class="form-row">
         <label>Full name<input required name="name" type="text" placeholder="Your full name"></label>
         <label>Email address<input required name="email" type="email" placeholder="you@example.com"></label>
       </div>
       <div class="form-row">
         <label>Date<input required name="date" type="date"></label>
         <label>Time<select name="time"><option>5:30 PM</option><option>6:00 PM</option><option>7:00 PM</option><option>8:00 PM</option><option>9:00 PM</option><option>9:30 PM</option></select></label>
       </div>
       <div class="form-row">
         <label>Party size<select name="party"><option>1 guest</option><option selected>2 guests</option><option>3 guests</option><option>4 guests</option><option>5 guests</option><option>6 guests</option><option>7+ guests (Feasting)</option></select></label>
         <label>Table Atmosphere<select name="setting"><option>Main Dining Room (Atmospheric)</option><option>Fire Hearth Counter (Chef View)</option><option>Secret Garden Terrace (Open Air)</option><option>Private Dining Room</option></select></label>
       </div>

       <!-- Embedded Live Menu Course Selector (Separated from Online Ordering) -->
       <div class="res-step-badge" style="margin-top:28px;"><span>Step 2 · Explore a sample menu</span></div>
       <div id="reservation-live-menu-wrap" class="res-live-menu-wrapper"></div>

       <label style="margin-top:24px;">Special Wishes or Dietary Allergies for Chef Amara<textarea name="notes" placeholder="Anniversary celebrations, seating preferences, allergies..."></textarea></label>
       
       <button class="button button-primary btn-submit-res" type="submit" style="width:100%;margin-top:16px;">
         <i data-lucide="calendar-days"></i> <span>Review your selections</span>
       </button>
       <p class="form-status" data-form-status></p>
     </form>
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
         <ul class="space-perks"><li><i data-lucide="users"></i> 1 to 8 guests</li><li><i data-lucide="music"></i> Ambient vinyl</li></ul>
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
       <div class="space-image"><img src="${img.private}" alt="Secret Garden Terrace"><span class="space-tag">Open Air</span></div>
       <div class="space-body">
         <h3>Secret Garden Terrace</h3>
         <p>Sheltered leafy terrace with lanterns, gentle evening breeze, and outdoor heating. Weather-proofed for comfort in all seasons.</p>
         <ul class="space-perks"><li><i data-lucide="leaf"></i> 2 to 12 guests</li><li><i data-lucide="moon"></i> Lantern lit</li></ul>
       </div>
     </article>
   </div>
 </div></section>

 <section id="private-dining" class="private-dining section-pad"><div class="container split-section"><div class="reveal-image"><img src="${img.private}" alt="Private dining setup"></div><div>${sectionHead('Private dining', 'Your occasion, made personal.', 'Host an intimate dinner, a spirited celebration or a beautifully simple business lunch in our private room.')}<p>Capacity, menu options and enquiry details will be shared once confirmed.</p><a class="text-link" href="/pages/contact.html">Visit information <i data-lucide="arrow-right"></i></a></div></div></section>

 <!-- NEW SECTION: Celebration Touches (Reservations) -->
 <section id="addons" class="addons-section section-pad"><div class="container">
   ${sectionHead('Special occasions', 'Thoughtful <em>celebration touches.</em>', 'Enhance your reservation with customized additions prepared in advance by our kitchen and bar teams.')}
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

 <section class="faq section-pad"><div class="container narrow">${sectionHead('Good to know', 'Before you arrive')}<div class="accordion"><details><summary>Can I make a reservation online?<i data-lucide="plus"></i></summary><p>Online reservations are not connected yet. This page is a preview and does not confirm a booking.</p></details><details><summary>Where can I find accessibility and dietary information?<i data-lucide="plus"></i></summary><p>These details will be published once verified. Menu labels are illustrative and should not be relied on for allergies.</p></details><details><summary>Can I plan a private event?<i data-lucide="plus"></i></summary><p>Private dining details and enquiry options will be added when confirmed.</p></details></div></div></section>${closePage()}`
}

function blog() {
  return `${pageHero('The Flavoro Journal · Editorial Dispatches', 'Notes from<br><em>around the hearth.</em>', 'Longform culinary essays, seasonal foraging chronicles, cellar explorations, and the quiet philosophy of hospitality.', img.chefs, 'Blog')}
  
  <!-- Lead Story Hero Card -->
  <section class="journal-lead-section section-pad">
    <div class="container">
      <article class="lead-story-card reveal-card">
        <div class="lead-story-image">
          <img src="/images/hero-pasta.jpg" alt="A chef searing over white oak hardwood embers">
          <span class="lead-tag"><i data-lucide="flame"></i> FEATURED DISPATCH</span>
        </div>
        <div class="lead-story-body">
          <div class="lead-meta">
            <span class="lead-category">HEARTH &amp; TECHNIQUE</span>
            <span class="lead-bullet">·</span>
            <span class="lead-time"><i data-lucide="clock"></i> 7 min read</span>
            <span class="lead-bullet">·</span>
            <span class="lead-date">October 14, 2026</span>
          </div>
          <h2>The Dawn Embers: Reviving 700° White Oak Woodcraft</h2>
          <p class="lead-excerpt">Why the primordial energy of aged hardwood embers unlocks nuances of caramelization, moisture retention, and botanical smoke that modern gas burners could never dream of touching. An inquiry into ancestral heat and modern gastronomic instinct.</p>
          <div class="lead-author-row">
            <div class="author-avatar"><img src="/images/chef-portrait.jpg" alt="Matteo Vance"></div>
            <div class="author-info">
              <strong>Matteo Vance</strong>
              <small>Executive Chef &amp; Co-Founder</small>
            </div>
          </div>
          <a class="button button-primary" href="/pages/journal-embers.html">
            <span>Read full dispatch</span> <i data-lucide="arrow-right"></i>
          </a>
        </div>
      </article>
    </div>
  </section>

  <!-- Editorial Category Filter Bar -->
  <section class="journal-filter-section">
    <div class="container">
      <div class="journal-nav-bar">
        <div id="journal-category-pills" class="category-pills-row" role="tablist" aria-label="Journal Categories">
          <button type="button" class="category-pill is-active" data-journal-filter="all">All Dispatches <span class="pill-count">8</span></button>
          <button type="button" class="category-pill" data-journal-filter="hearth">Hearth &amp; Technique <span class="pill-count">2</span></button>
          <button type="button" class="category-pill" data-journal-filter="producers">Terroir &amp; Producers <span class="pill-count">2</span></button>
          <button type="button" class="category-pill" data-journal-filter="cellar">Living Cellar <span class="pill-count">2</span></button>
          <button type="button" class="category-pill" data-journal-filter="hospitality">Hospitality &amp; Rituals <span class="pill-count">2</span></button>
        </div>
      </div>
    </div>
  </section>

  <!-- 8 Curated Journal Cards Grid -->
  <section class="journal-feed-section section-pad">
    <div class="container">
      <div class="journal-posts-grid">
        <!-- Post 1: The Dawn Embers -->
        <article class="journal-post-card reveal-card" data-category="hearth">
          <div class="card-thumb">
            <img src="/images/hero-pasta.jpg" alt="White oak embers in the hearth">
            <span class="card-cat-badge">HEARTH &amp; TECHNIQUE</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 7 min read</span>
              <span>·</span>
              <time>Oct 14, 2026</time>
            </div>
            <h3><a href="/pages/journal-embers.html">The Dawn Embers: Reviving 700° White Oak Woodcraft</a></h3>
            <p>How ancient ember-roasting techniques, seasoned California white oak, and radiant stone hearths extract intense sweetness from coastal root vegetables and sea catch.</p>
            <div class="card-footer">
              <span class="card-author">By Matteo Vance</span>
              <a class="card-read-link" href="/pages/journal-embers.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>

        <!-- Post 2: The Art of the Long Table -->
        <article class="journal-post-card reveal-card" data-category="hospitality">
          <div class="card-thumb">
            <img src="/images/restaurant-interior.jpg" alt="Candlelit dining table">
            <span class="card-cat-badge">HOSPITALITY &amp; RITUALS</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 5 min read</span>
              <span>·</span>
              <time>Oct 02, 2026</time>
            </div>
            <h3><a href="/pages/journal-gathering.html">The Art of the Long Table: Why Dinners Should Linger</a></h3>
            <p>Modern dining often rushes toward the exit. At Flavoro, we build evenings designed to expand—where second bottles are uncorked, conversations deepen, and time suspends.</p>
            <div class="card-footer">
              <span class="card-author">By Elena Rostova</span>
              <a class="card-read-link" href="/pages/journal-gathering.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>

        <!-- Post 3: The Day-Boat Line -->
        <article class="journal-post-card reveal-card" data-category="producers">
          <div class="card-thumb">
            <img src="/images/market-fish.jpg" alt="Freshly harvested seafood">
            <span class="card-cat-badge">TERROIR &amp; PRODUCERS</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 6 min read</span>
              <span>·</span>
              <time>Sep 24, 2026</time>
            </div>
            <h3><a href="/pages/journal-dayboat.html">The Day-Boat Line: 4:00 AM Harvests with Bodega Bay Fishermen</a></h3>
            <p>A journey out before sunrise into the cold Pacific swell for black cod and hand-dived scallops landed just hours before our evening hearth lights up.</p>
            <div class="card-footer">
              <span class="card-author">By Matteo Vance</span>
              <a class="card-read-link" href="/pages/journal-dayboat.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>

        <!-- Post 4: The Geometry of Fresh Semolina -->
        <article class="journal-post-card reveal-card" data-category="hearth">
          <div class="card-thumb">
            <img src="/images/menu/pasta-editorial.jpg" alt="Handmade semolina pasta">
            <span class="card-cat-badge">HEARTH &amp; TECHNIQUE</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 4 min read</span>
              <span>·</span>
              <time>Sep 16, 2026</time>
            </div>
            <h3><a href="/pages/journal-craft.html">The Geometry of Fresh Semolina: Hand-Rolled Heritage Pastas</a></h3>
            <p>From 36-hour dough fermentation to hand-extruded bronze dies, exploring the physical architecture of handmade noodles that catch every drop of braised sugo.</p>
            <div class="card-footer">
              <span class="card-author">By Clara Chen</span>
              <a class="card-read-link" href="/pages/journal-craft.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>

        <!-- Post 5: Living Wines -->
        <article class="journal-post-card reveal-card" data-category="cellar">
          <div class="card-thumb">
            <img src="/images/cocktails.jpg" alt="Natural wines and glassware">
            <span class="card-cat-badge">LIVING CELLAR</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 8 min read</span>
              <span>·</span>
              <time>Sep 08, 2026</time>
            </div>
            <h3><a href="/pages/journal-vintages.html">Living Wines: Minimal-Intervention Cellars of the Central Coast</a></h3>
            <p>Discarding chemical additives in favor of spontaneous native ferments, amphora aging, and ancient vineyard vines that tell an unvarnished geological truth.</p>
            <div class="card-footer">
              <span class="card-author">By Julian Rossi</span>
              <a class="card-read-link" href="/pages/journal-vintages.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>

        <!-- Post 6: Invisible Hospitality -->
        <article class="journal-post-card reveal-card" data-category="hospitality">
          <div class="card-thumb">
            <img src="/images/editorial/dining-room.jpg" alt="Staff orchestrating dinner service">
            <span class="card-cat-badge">HOSPITALITY &amp; RITUALS</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 5 min read</span>
              <span>·</span>
              <time>Aug 28, 2026</time>
            </div>
            <h3><a href="/pages/journal-hospitality.html">Invisible Hospitality: The Choreography of Intuitive Dining</a></h3>
            <p>The hallmarks of exceptional service are never theatrical or intrusive. They are felt in the anticipation of needs, quiet warmth, and seamless room balance.</p>
            <div class="card-footer">
              <span class="card-author">By Elena Rostova</span>
              <a class="card-read-link" href="/pages/journal-hospitality.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>

        <!-- Post 7: In Search of Heirloom Bitters -->
        <article class="journal-post-card reveal-card" data-category="cellar">
          <div class="card-thumb">
            <img src="/images/editorial/bartender.jpg" alt="Botanical infusions and amari">
            <span class="card-cat-badge">LIVING CELLAR</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 6 min read</span>
              <span>·</span>
              <time>Aug 19, 2026</time>
            </div>
            <h3><a href="/pages/journal-foraging.html">In Search of Heirloom Bitters: Wild Botanicals of the Coastal Range</a></h3>
            <p>Foraging wild mugwort, yarrow, coastal bay laurel, and elderflower to infuse our house-made amari and botanical vermouth program at the bar pass.</p>
            <div class="card-footer">
              <span class="card-author">By Julian Rossi</span>
              <a class="card-read-link" href="/pages/journal-foraging.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>

        <!-- Post 8: The Sunday Long Table -->
        <article class="journal-post-card reveal-card" data-category="producers">
          <div class="card-thumb">
            <img src="/images/breakfast.jpg" alt="Communal feast table setting">
            <span class="card-cat-badge">TERROIR &amp; PRODUCERS</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span><i data-lucide="clock"></i> 5 min read</span>
              <span>·</span>
              <time>Aug 10, 2026</time>
            </div>
            <h3><a href="/pages/journal-sunday.html">The Sunday Long Table: Communal Feasting &amp; Sourdough Rituals</a></h3>
            <p>The weekly community ritual where our bakery releases warm loaves, whole roasted shoulders are carved family-style, and neighbors gather around one continuous hearth.</p>
            <div class="card-footer">
              <span class="card-author">By Clara Chen</span>
              <a class="card-read-link" href="/pages/journal-sunday.html">Read essay <i data-lucide="arrow-right"></i></a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Editorial Newsletter Dispatch Subscription -->
  <section class="journal-newsletter-section section-pad">
    <div class="container narrow">
      <div class="newsletter-card reveal">
        <span class="eyebrow"><i data-lucide="mail"></i> FLAVORO DISPATCHES</span>
        <h2>The Seasonal Epilogue</h2>
        <p>Curated thoughts on regenerative farming, rare cellar arrivals, seasonal recipes from Chef Matteo Vance, and invitations to intimate table feasts.</p>
        <form id="journal-newsletter-form" class="newsletter-form" onsubmit="event.preventDefault(); this.querySelector('button').innerHTML='<span>Subscribed</span>'; this.querySelector('input').value='';">
          <input type="email" required placeholder="Enter your email address" aria-label="Email address for dispatch">
          <button type="submit" class="button button-primary"><span>Join dispatch</span> <i data-lucide="arrow-right"></i></button>
        </form>
        <small class="newsletter-guarantee">Published twice monthly. Zero marketing spam. Unsubscribe at any instant.</small>
      </div>
    </div>
  </section>

  <!-- Closing Reservation Banner -->
  <section class="reservation-banner">
    <img src="${img.interior}" alt="Flavoro Dining Room at Night">
    <div class="container">
      <span class="eyebrow">PRACTICAL HOSPITALITY</span>
      <h2>Pull up a chair.</h2>
      <p>Stories belong around the table. Join us this week for an unhurried dinner.</p>
      <a class="button button-primary" href="/pages/reservations.html">
        <span>Reserve your table</span> <i data-lucide="calendar-days"></i>
      </a>
    </div>
  </section>${closePage()}`
}

function contact() {
  return `${pageHero('Arrival & Inquiries · Guest Concierge', 'Connect with Flavoro.<br><em>Your table awaits.</em>', 'From intimate counter bookings to full restaurant buyouts and private cellar tastings, our hospitality team is at your disposal.', img.interior, 'Contact')}
  
  <!-- Section 01: Spatial Dossier & Arrival Coordinates -->
  <section class="contact-dossier-section section-pad">
    <div class="container">
      ${sectionHead('LOCATION &amp; ARRIVAL', 'Finding our hearth in <em>Hayes Valley.</em>', 'Located in the historic Hayes Valley cultural corridor, between Opera House architecture and coastal eucalyptus groves.')}
      <div class="dossier-grid">
        <div class="dossier-card reveal-card">
          <div class="dossier-icon"><i data-lucide="map-pin"></i></div>
          <span class="dossier-label">STREET ADDRESS</span>
          <h3>742 Emberwood Lane</h3>
          <p>San Francisco, CA 94102<br>Cross of Franklin &amp; Fell Street</p>
          <div class="dossier-meta">
            <span>Coordinates: 37.7749° N, 122.4194° W</span>
          </div>
        </div>

        <div class="dossier-card reveal-card">
          <div class="dossier-icon"><i data-lucide="compass"></i></div>
          <span class="dossier-label">VALET &amp; ARRIVAL BY ROAD</span>
          <h3>Complimentary Valet</h3>
          <p>White-glove valet staging commences 30 minutes prior to first dinner service at our Franklin Street private porte-cochère.</p>
          <div class="dossier-meta">
            <span>EV Charging available on request</span>
          </div>
        </div>

        <div class="dossier-card reveal-card">
          <div class="dossier-icon"><i data-lucide="clock"></i></div>
          <span class="dossier-label">TRANSIT ACCESSIBILITY</span>
          <h3>Civic Center Corridor</h3>
          <p>A tranquil 6-minute stroll from Civic Center BART / Muni station, and two blocks from the Van Ness Rapid Transit corridor.</p>
          <div class="dossier-meta">
            <span>Accessible entrance with zero-step ramp</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 02: Operating Schedule & Dining Cadence Matrix -->
  <section class="contact-cadence-section section-pad">
    <div class="container">
      ${sectionHead('SERVICE SCHEDULE', 'Hours &amp; weekly <em>seating.</em>', 'Our kitchen operates with circadian rhythms—gathering ingredients at dawn, firing white oak coals at dusk.')}
      <div class="cadence-matrix-wrap reveal">
        <table class="cadence-table">
          <thead>
            <tr>
              <th>Service Experience</th>
              <th>Days of Operation</th>
              <th>Hours of Service</th>
              <th>Seating Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>The Hearth Dining Room</strong><br><small>Curated 4-course &amp; 7-course tasting carte</small></td>
              <td>Wednesday through Sunday</td>
              <td>5:30 PM – 10:30 PM</td>
              <td>Reservations recommended · Walk-ins as available</td>
            </tr>
            <tr>
              <td><strong>Hearth Bar &amp; Amari Salon</strong><br><small>Living wines, wild amari, raw bar &amp; snacks</small></td>
              <td>Wednesday through Sunday</td>
              <td>4:30 PM – Midnight</td>
              <td>Reserved for walk-ins · No bookings required</td>
            </tr>
            <tr>
              <td><strong>The Sunday Long Table</strong><br><small>Communal feasting, wood-fired roasts &amp; breads</small></td>
              <td>Every Sunday</td>
              <td>11:30 AM – 3:30 PM</td>
              <td>Family-style seating · Pre-reserved ticketed feasts</td>
            </tr>
            <tr class="cadence-dark-row">
              <td><strong>Kitchen Dark / Harvest Days</strong><br><small>Foraging excursions &amp; hearth masonry care</small></td>
              <td>Monday &amp; Tuesday</td>
              <td>Closed to Public</td>
              <td>Private culinary buyouts available upon request</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Section 03: Direct Concierge & Department Directory -->
  <section class="contact-departments-section section-pad">
    <div class="container">
      ${sectionHead('DIRECT DIRECTORY', 'Get in touch with <em>our team.</em>', 'Reach the specific artisan or coordinator best equipped to assist your evening.')}
      <div class="departments-grid">
        <article class="department-card reveal-card">
          <div class="dept-icon"><i data-lucide="phone"></i></div>
          <span class="dept-badge">FRONT OF HOUSE</span>
          <h3>Table Reservations &amp; Inquiries</h3>
          <p>For bookings of 1 to 6 guests, evening running late notifications, or same-day table inquiries.</p>
          <div class="dept-contact-links">
            <a href="tel:+14158902341"><i data-lucide="phone"></i> +1 (415) 890-2341</a>
            <a href="mailto:reservations@flavorohearth.com"><i data-lucide="mail"></i> reservations@flavorohearth.com</a>
          </div>
        </article>

        <article class="department-card reveal-card">
          <div class="dept-icon"><i data-lucide="users"></i></div>
          <span class="dept-badge">PRIVATE SALONS</span>
          <h3>Private Dining &amp; Buyouts</h3>
          <p>Exclusive use of our Secret Garden Terrace (up to 16 covers) or full restaurant buyouts (up to 70 guests).</p>
          <div class="dept-contact-links">
            <a href="tel:+14158902342"><i data-lucide="phone"></i> +1 (415) 890-2342</a>
            <a href="mailto:events@flavorohearth.com"><i data-lucide="mail"></i> events@flavorohearth.com</a>
          </div>
        </article>

        <article class="department-card reveal-card">
          <div class="dept-icon"><i data-lucide="wine"></i></div>
          <span class="dept-badge">SOMMELIER TEAM</span>
          <h3>Cellar Procurement &amp; Flights</h3>
          <p>Consult with Master Sommelier Julian Rossi regarding rare allocations, corkage questions, or customized cellar flights.</p>
          <div class="dept-contact-links">
            <a href="tel:+14158902343"><i data-lucide="phone"></i> +1 (415) 890-2343</a>
            <a href="mailto:cellar@flavorohearth.com"><i data-lucide="mail"></i> cellar@flavorohearth.com</a>
          </div>
        </article>

        <article class="department-card reveal-card">
          <div class="dept-icon"><i data-lucide="book-open"></i></div>
          <span class="dept-badge">COMMUNICATIONS</span>
          <h3>Press &amp; Editorial Inquiries</h3>
          <p>High-resolution asset requests, editorial culinary features, architectural photography, or interview scheduling.</p>
          <div class="dept-contact-links">
            <a href="tel:+14158902344"><i data-lucide="phone"></i> +1 (415) 890-2344</a>
            <a href="mailto:press@flavorohearth.com"><i data-lucide="mail"></i> press@flavorohearth.com</a>
          </div>
        </article>
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

  <!-- Section 05: Practical Dining Guidelines & FAQ Accordion -->
  <section class="contact-faq-section section-pad">
    <div class="container narrow">
      ${sectionHead('HELPFUL DETAILS', 'Before you <em>arrive.</em>', 'Clear, thoughtful standards to ensure effortless harmony for every table.')}
      <div class="faq-accordion-list">
        <details class="faq-item">
          <summary>What is Flavoro’s sartorial dress guideline?<i data-lucide="plus"></i></summary>
          <div class="faq-answer">
            <p>We welcome smart casual elegance. We recommend dinner attire that makes you feel celebratory yet unconstrained—jackets and tailored knitwear are favored, while athletic wear and beachwear are discouraged in the evening dining salons.</p>
          </div>
        </details>

        <details class="faq-item">
          <summary>How are severe food allergies and dietary needs handled?<i data-lucide="plus"></i></summary>
          <div class="faq-answer">
            <p>Chef Matteo Vance and our kitchen brigade pride themselves on crafting bespoke adaptations for vegetarian, vegan, celiac / gluten-free, and pescatarian diners. Please notify us at least 24 hours prior to service so that custom vegetable broths and fresh pasta doughs may be pre-fermented for your table.</p>
          </div>
        </details>

        <details class="faq-item">
          <summary>What is your cellar corkage policy?<i data-lucide="plus"></i></summary>
          <div class="faq-answer">
            <p>Guests may bring up to two 750ml bottles of special wine not currently represented on our cellar list. Corkage is $45 per bottle, and the fee is gracefully waived for every bottle purchased directly from our sommelier reserve portfolio.</p>
          </div>
        </details>

        <details class="faq-item">
          <summary>Are children and young gourmands welcome?<i data-lucide="plus"></i></summary>
          <div class="faq-answer">
            <p>Always. We believe great food memories begin in childhood. Our kitchen happily crafts simplified, fresh dishes—such as fresh semolina pasta with butter and aged Parmigiano, or hearth-roasted organic chicken—for our younger guests.</p>
          </div>
        </details>

        <details class="faq-item">
          <summary>What is your reservation cancellation and amendment policy?<i data-lucide="plus"></i></summary>
          <div class="faq-answer">
            <p>Standard table reservations may be modified or cancelled without penalty up to 24 hours before your booking. For large feasting parties and full buyouts, a 72-hour notice is requested so that our farmers and day-boat fishermen can adjust their dawn harvests.</p>
          </div>
        </details>
      </div>
    </div>
  </section>

  <!-- Section 06: Private Dining & Arrival Banner -->
  <section class="reservation-banner">
    <img src="${img.private}" alt="A beautifully set table for private dining">
    <div class="container">
      <span class="eyebrow">CELEBRATE WITH INTENTION</span>
      <h2>Host an unforgettable evening.</h2>
      <p>Whether an intimate anniversary dinner or a private company celebration around our glowing hearth.</p>
      <a class="button button-primary" href="/pages/reservations.html">
        <span>Reserve table online</span> <i data-lucide="calendar-days"></i>
      </a>
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
  'reservation-confirmation': ['Reservation status', 'No reservation confirmed.', 'Online booking is not connected. Visiting this page does not create or confirm a reservation.', 'Please return to the reservation preview to explore the experience.'],
  'order-confirmation': ['Order status', 'No order placed.', 'Online ordering is not connected. Visiting this page does not submit or confirm an order.', 'You can return to the menu to explore the order preview.'],
 }
 const [label,title,one,two] = content[kind]
 return `${pageHero(label, title, 'Flavoro · Information', img.interior, '')}<section class="editorial-article section-pad"><div class="container narrow"><span class="eyebrow">${label.toUpperCase()}</span><p>${one}</p><p>${two}</p><a class="selection-link" href="${kind === 'reservation-confirmation' ? '/pages/reservations.html' : kind === 'order-confirmation' ? '/pages/menu.html' : '/pages/visit.html'}">${kind === 'reservation-confirmation' ? 'Reservation preview' : kind === 'order-confirmation' ? 'Explore the menu' : 'Plan a visit'} <span>↗</span></a></div></section>${closePage()}`
}

function notFound() {
 return `<main id="main-content" class="error-404">
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
 const pages = { home, about, menu, gallery, reservations, blog, contact, checkout, 'private-dining': privateDining, visit, people, ...Object.fromEntries(Object.keys(articles).map(key => [key, () => journalArticle(key)])), ...Object.fromEntries(['privacy','terms','accessibility','reservation-confirmation','order-confirmation'].map(key => [key, () => infoPage(key)])), login: () => auth('login'), signup: () => auth('signup'), notFound }
 return (pages[page] || home)()
}
