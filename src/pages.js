import { closePage, dishCard, footer, header, pageHero, sectionHead } from './components/site.js'

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
}

const marquee = (text = 'FIRE · FLAVOR · PEOPLE · PASSION ·') => `<div class="marquee" aria-hidden="true"><div>${Array(5).fill(`<span>${text}</span>`).join('')}</div></div>`

function home() {
  return `${header('Home')}<main id="main-content">
  <section class="home-hero" data-parallax aria-label="Hero section">
    <video class="hero-bg" autoplay loop muted playsinline webkit-playsinline preload="auto" poster="${img.hero}">
      <source src="${img.heroVideo}" type="video/mp4">
      <img class="hero-bg" src="${img.hero}" alt="Flavoro open fire culinary craft">
    </video>
    <div class="hero-vignette"></div>
    <div class="hero-grain"></div>
    <div class="hero-ambient-glow" aria-hidden="true"></div>

    <!-- Editorial Architectural HUD (Top telemetry bar) -->
    <div class="hero-status-hud container">
      <div class="hero-hud-pill">
        <span class="hud-live-dot" aria-hidden="true"></span>
        <span class="hud-tag">HEARTH LIVE</span>
        <span class="hud-divider">·</span>
        <span class="hud-val">NATIVE COALS 420°C</span>
      </div>
      <div class="hero-hud-center">
        <span class="hud-terroir"><i data-lucide="compass"></i> 6.1550° N, 6.7860° E · ONITSHA</span>
      </div>
      <div class="hero-hud-pill hero-hud-service">
        <i data-lucide="clock-3"></i>
        <span>EVENING SERVICE: 5:30 PM — LATE</span>
      </div>
    </div>

    <!-- Spatial Main Canvas: Asymmetric Editorial Layout -->
    <div class="container hero-spatial-canvas">
      <!-- Primary Core Editorial -->
      <div class="hero-core-editorial">
        <div class="hero-kicker-strip">
          <span class="hero-kicker-num">№ 01</span>
          <span class="hero-kicker-rule" aria-hidden="true"></span>
          <span class="script-line hero-kicker">Food is fire, memory & soul</span>
        </div>

        <h1 class="split-title hero-monolith-title">
          <span class="monolith-line-1">POETRY OF <span class="hollow-word">FLAME</span></span>
          <span class="monolith-line-2"><em>& Ancestral</em> CHAR</span>
        </h1>

        <p class="hero-manifesto">
          An unhurried sanctuary where indigenous hardwoods, wild day-boat catches, and highland botanicals collide across glowing hearthstones. Cooked with instinct, served with radical warmth.
        </p>

        <div class="hero-actions hero-action-suite">
          <a class="button button-primary magnetic hero-cta-btn" href="/pages/menu.html">
            <i data-lucide="utensils-crossed"></i>
            <span>Explore The Living Carte</span>
          </a>
          <a class="button button-ghost magnetic hero-reserve-btn" href="/pages/reservations.html">
            <i data-lucide="calendar-days"></i>
            <span>Reserve Table Experience</span>
          </a>
          <div class="hero-availability-cue">
            <span class="avail-pip"></span>
            <span>Tonight: Limited Counter & Salon Available</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Interactive Sensory Dossier Cards -->
      <div class="hero-sensory-dossier" aria-label="Restaurant sensory highlights">
        <div class="sensory-dossier-head">
          <span class="dossier-label">SENSORY PILLARS</span>
          <span class="dossier-count">ACTS I — III</span>
        </div>

        <div class="sensory-cards-stack">
          <!-- Pillar I -->
          <a href="#signatures" class="sensory-card magnetic">
            <div class="sensory-card-idx">ACT I</div>
            <div class="sensory-card-main">
              <h4>Live Fireplace Hearth</h4>
              <p>Wild cherrywood & mahogany embers. Zero industrial gas.</p>
            </div>
            <div class="sensory-card-action">
              <i data-lucide="arrow-up-right"></i>
            </div>
          </a>

          <!-- Pillar II -->
          <a href="#spaces" class="sensory-card magnetic">
            <div class="sensory-card-idx">ACT II</div>
            <div class="sensory-card-main">
              <h4>Three Dining Atmospheres</h4>
              <p>The Hearth Counter, Velvet Salon & Garden Terrace.</p>
            </div>
            <div class="sensory-card-action">
              <i data-lucide="arrow-up-right"></i>
            </div>
          </a>

          <!-- Pillar III -->
          <a href="#reviews" class="sensory-card magnetic">
            <div class="sensory-card-idx">ACT III</div>
            <div class="sensory-card-main">
              <h4>Critical Acclaim</h4>
              <p>Michelin Selected Guide 2025 · 4.9★ from 1,200+ guests.</p>
            </div>
            <div class="sensory-card-action">
              <i data-lucide="arrow-up-right"></i>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Editorial Bottom Dock Bar -->
    <div class="hero-dock-bar container">
      <div class="dock-curation">
        <span class="dock-badge"><i data-lucide="flame"></i> TODAY’S HEARTH PASS</span>
        <p class="dock-text">Line-Caught Atlantic Red Snapper in charred banana leaves, Jos wild chanterelles & cold-pressed black truffle essence.</p>
      </div>
      <div class="dock-portal-wrap">
        <a href="#spaces" class="hero-scroll-portal magnetic" aria-label="Descend to dining atmospheres">
          <span class="portal-lbl">DESCEND</span>
          <div class="portal-indicator" aria-hidden="true">
            <span class="portal-hairline"></span>
            <i data-lucide="chevron-down"></i>
          </div>
        </a>
      </div>
    </div>
  </section>
  ${marquee()}

  <!-- Section 1: Intro / Story Preview -->
  <section class="intro-section section-pad"><div class="container intro-grid">
    <div class="intro-copy">${sectionHead('About us', 'We serve <em>happiness.</em>', 'At Flavoro, food is more than a meal. It is fire, memory, generosity and the joy of being together.')}
      <p class="reveal">We source with care, cook with instinct and welcome every guest as an old friend. Every plate carries a little surprise and a lot of soul.</p><a class="text-link reveal" href="/pages/about.html">Learn our story <i data-lucide="arrow-right"></i></a>
    </div>
    <div class="intro-visual reveal-image"><img src="${img.interior}" alt="Flavoro dining room"><div class="experience-card"><b>10+</b><span>Years of<br>experience</span></div></div>
    <div class="value-grid">${[['leaf','Fresh ingredients'],['chef-hat','Skilled chefs'],['clock-3','Fast & friendly'],['smile','Happy guests']].map(([i,t])=>`<div class="reveal-card"><i data-lucide="${i}"></i><b>${t}</b></div>`).join('')}</div>
  </div></section>

  <!-- Section 2: Dining Atmospheres / Spaces Showcase (NEW) -->
  <section id="spaces" class="spaces-section section-pad"><div class="container">
    ${sectionHead('Dining atmospheres', 'Spaces shaped for <em>every mood.</em>', 'Whether you seek the lively theatre of open flames, the gentle hush of candlelit velvet booths, or the breeze of our private salon.')}
    <div class="spaces-grid">
      <article class="space-card reveal-card">
        <div class="space-image">
          <img src="${img.hero}" alt="The Fire Hearth Counter">
          <span class="space-tag">Hearthside</span>
        </div>
        <div class="space-body">
          <h3>The Fire Hearth Counter</h3>
          <p>Front-row counter seating watching our chefs work the live coals. Immersive, energetic, and tailored for curious palates seeking front-row craft.</p>
          <ul class="space-perks">
            <li><i data-lucide="flame"></i> Live-fire view</li>
            <li><i data-lucide="sparkles"></i> Chef interaction</li>
            <li><i data-lucide="wine"></i> Sommelier pours</li>
          </ul>
          <a class="text-link" href="/pages/reservations.html">Reserve Counter <i data-lucide="arrow-right"></i></a>
        </div>
      </article>
      <article class="space-card reveal-card">
        <div class="space-image">
          <img src="${img.interior}" alt="The Main Dining Room">
          <span class="space-tag">Candlelit</span>
        </div>
        <div class="space-body">
          <h3>The Main Dining Salon</h3>
          <p>Warm aged timber, curved velvet banquettes, and golden acoustic lighting. Designed for lingering over multi-course meals, wine, and laughter.</p>
          <ul class="space-perks">
            <li><i data-lucide="users"></i> Booths & tables</li>
            <li><i data-lucide="heart"></i> Intimate lighting</li>
            <li><i data-lucide="music"></i> Curated vinyl jazz</li>
          </ul>
          <a class="text-link" href="/pages/reservations.html">Reserve Table <i data-lucide="arrow-right"></i></a>
        </div>
      </article>
      <article class="space-card reveal-card">
        <div class="space-image">
          <img src="${img.private}" alt="The Garden Salon & Terrace">
          <span class="space-tag">Secluded</span>
        </div>
        <div class="space-body">
          <h3>The Garden Salon & Terrace</h3>
          <p>Framed by mature foliage and soft lanterns, this secluded wing hosts milestone celebrations, spirited family toasts, and private feasting.</p>
          <ul class="space-perks">
            <li><i data-lucide="leaf"></i> Lush greenery</li>
            <li><i data-lucide="shield-check"></i> Private service</li>
            <li><i data-lucide="calendar-days"></i> Up to 28 guests</li>
          </ul>
          <a class="text-link" href="/pages/reservations.html">Reserve Salon <i data-lucide="arrow-right"></i></a>
        </div>
      </article>
    </div>
  </div></section>

  <!-- Section 3: The Chef's Curated Folio List (Redesigned from cards to Haute Restaurant List) -->
  <section id="signatures" class="home-menu-folio section-pad">
    <div class="container">
      <div class="folio-head-wrap">
        ${sectionHead('Peak season selection', 'The chef’s signature <em>folio list.</em>', 'A curated preview of dishes defined by native Nigerian firewood smoke, day-boat catches, and ancient wild herbs. Cooked to order for your table.')}
        <div class="folio-legend">
          <span><i data-lucide="flame"></i> Woodfire Ember Roasted</span>
          <span><i data-lucide="leaf"></i> Foraged Botanicals</span>
          <span><i data-lucide="wine"></i> Sommelier Curated</span>
        </div>
      </div>

      <div class="home-authentic-menu-list">
        <!-- Item 01 -->
        <article class="home-menu-row reveal" data-dish-id="wild-mushroom-toast">
          <div class="home-row-lead">
            <span class="home-row-num">№ 01</span>
            <div class="home-row-info">
              <div class="home-row-title-line">
                <h3 class="home-dish-name">Jos Foraged Wild Mushroom Toast</h3>
                <div class="home-diet-wrap"><span class="carte-diet-badge" title="Vegetarian">🌱 Vegetarian</span><span class="carte-diet-badge" title="Chef's Pick">★ Chef's Pick</span></div>
                <span class="home-leader-dots" aria-hidden="true"></span>
                <strong class="home-dish-price">$18.00</strong>
              </div>
              <p class="home-dish-ingredients">Charred heritage sourdough, whipped chèvre goat curd, pan-seared Jos plateau chanterelles, 63° slow-poached pasture egg, cold-pressed black truffle essence.</p>
              <div class="home-row-pairing">
                <i data-lucide="wine"></i> <span><em>Sommelier Pairing:</em> Single-origin Ethiopian cold pour or volcanic Nerello Mascalese</span>
              </div>
            </div>
          </div>
          <div class="home-row-actions">
            <a href="/pages/reservations.html?experience=alacarte&item=Wild%20Mushroom%20Toast" class="home-reserve-link" title="Reserve a table for this course">
              <i data-lucide="calendar-days"></i> <span>Reserve for this Course</span>
            </a>
            <a href="/pages/menu.html#order" class="home-order-link" title="Order via Live Hearth Pass">
              <i data-lucide="plus"></i> <span>Order Dish</span>
            </a>
          </div>
        </article>

        <!-- Item 02 -->
        <article class="home-menu-row reveal" data-dish-id="market-snapper">
          <div class="home-row-lead">
            <span class="home-row-num">№ 02</span>
            <div class="home-row-info">
              <div class="home-row-title-line">
                <h3 class="home-dish-name">Whole Wood-Fired Red Snapper in Banana Leaf</h3>
                <div class="home-diet-wrap"><span class="carte-diet-badge" title="Gluten-Free">🌾 Gluten-Free</span><span class="carte-diet-badge" title="Live Fire">🔥 Live-Fire</span></div>
                <span class="home-leader-dots" aria-hidden="true"></span>
                <strong class="home-dish-price">$32.00</strong>
              </div>
              <p class="home-dish-ingredients">Line-caught Atlantic snapper steamed in charred banana leaves over glowing cherrywood coals, coconut lemongrass velouté, pickled mustard seeds, charred sea purslane.</p>
              <div class="home-row-pairing">
                <i data-lucide="wine"></i> <span><em>Sommelier Pairing:</em> 2023 Skin-Contact Chenin Blanc or botanical lemongrass shrub</span>
              </div>
            </div>
          </div>
          <div class="home-row-actions">
            <a href="/pages/reservations.html?experience=alacarte&item=Charred%20Red%20Snapper" class="home-reserve-link" title="Reserve a table for this course">
              <i data-lucide="calendar-days"></i> <span>Reserve for this Course</span>
            </a>
            <a href="/pages/menu.html#order" class="home-order-link" title="Order via Live Hearth Pass">
              <i data-lucide="plus"></i> <span>Order Dish</span>
            </a>
          </div>
        </article>

        <!-- Item 03 -->
        <article class="home-menu-row reveal" data-dish-id="smoked-short-ribs">
          <div class="home-row-lead">
            <span class="home-row-num">№ 03</span>
            <div class="home-row-info">
              <div class="home-row-title-line">
                <h3 class="home-dish-name">12-Hour Smoked Beef Short Ribs</h3>
                <div class="home-diet-wrap"><span class="carte-diet-badge" title="Gluten-Free">🌾 Gluten-Free</span><span class="carte-diet-badge" title="Signature">★ Signature</span></div>
                <span class="home-leader-dots" aria-hidden="true"></span>
                <strong class="home-dish-price">$34.00</strong>
              </div>
              <p class="home-dish-ingredients">Center-cut prime beef rib smoked over wild cherrywood and aged mahogany embers, black garlic tare glaze, crispy cassava fondant, pickled sea buckthorn, bone marrow emulsion.</p>
              <div class="home-row-pairing">
                <i data-lucide="wine"></i> <span><em>Sommelier Pairing:</em> 2018 Aged Bolgheri Superiore or smoked hibiscus peppercorn decoction</span>
              </div>
            </div>
          </div>
          <div class="home-row-actions">
            <a href="/pages/reservations.html?experience=alacarte&item=12-Hour%20Smoked%20Beef%20Short%20Ribs" class="home-reserve-link" title="Reserve a table for this course">
              <i data-lucide="calendar-days"></i> <span>Reserve for this Course</span>
            </a>
            <a href="/pages/menu.html#order" class="home-order-link" title="Order via Live Hearth Pass">
              <i data-lucide="plus"></i> <span>Order Dish</span>
            </a>
          </div>
        </article>

        <!-- Item 04 -->
        <article class="home-menu-row reveal" data-dish-id="truffle-tagliatelle">
          <div class="home-row-lead">
            <span class="home-row-num">№ 04</span>
            <div class="home-row-info">
              <div class="home-row-title-line">
                <h3 class="home-dish-name">Black Truffle Alfredo Fresh Tagliolini</h3>
                <div class="home-diet-wrap"><span class="carte-diet-badge" title="Vegetarian">🌱 Vegetarian</span></div>
                <span class="home-leader-dots" aria-hidden="true"></span>
                <strong class="home-dish-price">$24.00</strong>
              </div>
              <p class="home-dish-ingredients">Hand-extruded golden egg pasta, 36-month aged Parmigiano-Reggiano, Normandy cultured butter, cracked tellicherry black pepper, fresh shaved seasonal truffles.</p>
              <div class="home-row-pairing">
                <i data-lucide="wine"></i> <span><em>Sommelier Pairing:</em> Premier Cru Meursault 2020 or roasted oolong vanilla infusion</span>
              </div>
            </div>
          </div>
          <div class="home-row-actions">
            <a href="/pages/reservations.html?experience=alacarte&item=Truffle%20Alfredo%20Tagliolini" class="home-reserve-link" title="Reserve a table for this course">
              <i data-lucide="calendar-days"></i> <span>Reserve for this Course</span>
            </a>
            <a href="/pages/menu.html#order" class="home-order-link" title="Order via Live Hearth Pass">
              <i data-lucide="plus"></i> <span>Order Dish</span>
            </a>
          </div>
        </article>

        <!-- Item 05 -->
        <article class="home-menu-row reveal" data-dish-id="chocolate-fondant">
          <div class="home-row-lead">
            <span class="home-row-num">№ 05</span>
            <div class="home-row-info">
              <div class="home-row-title-line">
                <h3 class="home-dish-name">Midnight Dark Chocolate Ember Fondant</h3>
                <div class="home-diet-wrap"><span class="carte-diet-badge" title="Vegetarian">🌱 Vegetarian</span></div>
                <span class="home-leader-dots" aria-hidden="true"></span>
                <strong class="home-dish-price">$16.00</strong>
              </div>
              <p class="home-dish-ingredients">70% single-origin Venezuelan dark chocolate molten cake roasted directly on coals, house-churned Kentucky bourbon gelato, smoked fleur de sel, dark cacao nib crunch.</p>
              <div class="home-row-pairing">
                <i data-lucide="wine"></i> <span><em>Sommelier Pairing:</em> 20-Year Tawny Port or Hearthside Smoked Old Fashioned</span>
              </div>
            </div>
          </div>
          <div class="home-row-actions">
            <a href="/pages/reservations.html?experience=alacarte&item=Midnight%20Dark%20Chocolate%20Fondant" class="home-reserve-link" title="Reserve a table for this course">
              <i data-lucide="calendar-days"></i> <span>Reserve for this Course</span>
            </a>
            <a href="/pages/menu.html#order" class="home-order-link" title="Order via Live Hearth Pass">
              <i data-lucide="plus"></i> <span>Order Dish</span>
            </a>
          </div>
        </article>
      </div>

      <!-- Folio Footer with Direct Actions -->
      <div class="home-folio-footer">
        <div class="folio-footer-note">
          <i data-lucide="sparkle"></i>
          <span>Looking to curate your entire meal? Every dish can be customized by ingredient (removing what you don’t want & adding premium extras).</span>
        </div>
        <div class="folio-footer-cta">
          <a class="button button-primary magnetic" href="/pages/menu.html"><i data-lucide="book-open"></i> View Full 16-Dish Carte</a>
          <a class="button button-dark magnetic" href="/pages/menu.html#order"><i data-lucide="flame"></i> Open Live Hearth Pass</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Provenance & Artisan Craft (NEW) -->
  <section id="provenance" class="provenance-section section-pad"><div class="container provenance-grid">
    <div class="provenance-visual reveal-image">
      <img src="${img.salad}" alt="Fresh garden harvest and herbs">
      <div class="provenance-badge">
        <i data-lucide="compass"></i>
        <span>100% Traceable & Organic Sourcing</span>
      </div>
    </div>
    <div>
      ${sectionHead('Farm, sea & ember', 'Grounded in nature, <em>elevated by flame.</em>', 'Every morning begins before dawn with crates from small-scale growers, wild coastal divers, and heritage grain farmers.')}
      <p class="reveal" style="color:#d7d0c7;margin:-20px 0 25px;font-size:16.5px;line-height:1.65;">We believe true luxury is knowing where each seed sprouted, how the fish was caught, and whose hands milled the grain. Our cooking is the honest translation of this land.</p>
      <div class="provenance-pillars">
        <div class="pillar-card reveal-card">
          <i data-lucide="leaf"></i>
          <h4>Daily Harvest</h4>
          <p>Organically grown greens and heirloom vegetables picked within 24 hours.</p>
        </div>
        <div class="pillar-card reveal-card">
          <i data-lucide="shield-check"></i>
          <h4>Line-Caught Seafood</h4>
          <p>Sustainable day-boat catches with zero destructive industrial trawling.</p>
        </div>
        <div class="pillar-card reveal-card">
          <i data-lucide="flame"></i>
          <h4>Native Hardwood</h4>
          <p>Locally salvaged oak and fruitwoods create clean smoke without gas.</p>
        </div>
        <div class="pillar-card reveal-card">
          <i data-lucide="sparkles"></i>
          <h4>House Ferments</h4>
          <p>48-hour sourdoughs, wild vinegars, and aged hot ferments made in-house.</p>
        </div>
      </div>
    </div>
  </div></section>

  <!-- Section 5: Why Flavoro (Numbered Features) -->
  <section class="dark-feature section-pad"><div class="container dark-feature-grid"><div class="sticky-copy">${sectionHead('Why Flavoro', 'A dining room with a pulse.', 'Every night unfolds differently—guided by season, sound, flame and the people around your table.')}<a class="button button-primary" href="/pages/reservations.html">Reserve tonight</a></div><div class="feature-list">${[['01','Honest sourcing','We know our growers, makers and fishermen by name.'],['02','Live-fire craft','Smoke, char and patience bring every ingredient into focus.'],['03','Warm service','Attentive without theatre. Personal without pretence.'],['04','Beautiful rhythm','Lighting, music and service move together all evening.']].map(x=>`<article class="feature-row reveal"><span>${x[0]}</span><div><h3>${x[1]}</h3><p>${x[2]}</p></div><i data-lucide="arrow-up-right"></i></article>`).join('')}</div></div></section>

  <!-- Section 6: Meet Chef Amara -->
  <section class="chef-feature section-pad"><div class="container split-section"><div class="reveal-image"><img src="${img.portrait}" alt="Flavoro executive chef"></div><div>${sectionHead('Meet the team', 'Made by people who care.', 'Our chefs blend technical precision with the kind of generosity that cannot be taught.')}<div class="quote"><i data-lucide="quote"></i><p>“Great cooking begins with respect—for the ingredient, for the craft, and for the guest.”</p><span>— Chef Amara Cole</span></div><a class="text-link" href="/pages/about.html#chefs">Meet our chefs <i data-lucide="arrow-right"></i></a></div></div></section>

  <!-- Section 7: Guest Reviews & Critical Acclaim (Redesigned as an Editorial Press Dossier) -->
  <section id="reviews" class="reviews-section section-pad"><div class="container">
    <div class="accolades-strip reveal">
      <div class="accolade-item">
        <i data-lucide="award"></i>
        <div><b>Michelin Selected</b><span>Guide 2025</span></div>
      </div>
      <div class="accolade-item">
        <i data-lucide="star"></i>
        <div><b>4.9 / 5.0 Rating</b><span>Over 1,200 Verified Reviews</span></div>
      </div>
      <div class="accolade-item">
        <i data-lucide="sparkle"></i>
        <div><b>African Gourmet Award</b><span>Best Hearth Dining 2024</span></div>
      </div>
      <div class="accolade-item">
        <i data-lucide="wine"></i>
        <div><b>Wine Spectator</b><span>Excellence Award 2025</span></div>
      </div>
    </div>

    ${sectionHead('Impressions', 'Praised by <em>palates & press.</em>', 'Here is what international critics, food scholars, and regular guests record in our dining room guestbook.')}

    <!-- Editorial Critic's Dossier (Generous line lengths, balanced text containers) -->
    <div class="critic-dossier-wrap">
      <!-- Lead Critical Review Banner -->
      <article class="critic-lead-card reveal">
        <div class="critic-lead-header">
          <div class="critic-badge-group">
            <span class="critic-verified-pill"><i data-lucide="award"></i> Lead Critical Review</span>
            <div class="review-stars">${Array(5).fill('<i data-lucide="star"></i>').join('')}</div>
          </div>
          <span class="critic-season">Autumn Dining Review · Published Oct 2024</span>
        </div>
        <blockquote class="critic-lead-quote">
          “An extraordinary triumph of fire, heritage, and restraint. The red snapper in coconut lime broth might be the most memorable dish cooked anywhere this year. Chef Amara has turned the live-fire hearth into an art of deep emotional resonance.”
        </blockquote>
        <div class="reviewer-signature">
          <div class="reviewer-avatar">TC</div>
          <div class="reviewer-info">
            <b>Tara Chambers</b>
            <span>Chief Dining Critic · Gourmet West Africa</span>
          </div>
          <div class="reviewer-pairing-callout">
            <i data-lucide="wine"></i> <span>Tasted with: Skin-Contact Chenin Blanc & 7-Course Journey</span>
          </div>
        </div>
      </article>

      <!-- Secondary Review Ledger -->
      <div class="critic-secondary-grid">
        <article class="critic-sub-card reveal">
          <div class="review-stars">${Array(5).fill('<i data-lucide="star"></i>').join('')}</div>
          <blockquote>“We celebrated our 10th anniversary at the Hearth Counter. From the warm brioche to the final chocolate fondant, every second felt magical, unhurried, and deeply soul-warming.”</blockquote>
          <div class="reviewer">
            <div class="reviewer-avatar">EO</div>
            <div class="reviewer-info">
              <b>Emeka & Sarah O.</b>
              <span>Regular Guests · Hearth Counter Seating</span>
            </div>
          </div>
        </article>

        <article class="critic-sub-card reveal">
          <div class="review-stars">${Array(5).fill('<i data-lucide="star"></i>').join('')}</div>
          <blockquote>“Rarely do atmosphere, acoustic warmth, wine pairing, and hospitality align so effortlessly. Flavoro is redefining what modern African dining feels and tastes like.”</blockquote>
          <div class="reviewer">
            <div class="reviewer-avatar">MK</div>
            <div class="reviewer-info">
              <b>Marcus Klein</b>
              <span>Epicure International Review</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div></section>

  <!-- Section 8: Cultural Calendar & Happenings (Redesigned as an Artisanal Schedule Ledger List) -->
  <section id="events" class="events-section section-pad">
    <div class="container">
      <div class="events-header-wrap">
        ${sectionHead('Cultural calendar', 'Evenings with <em>a pulse & purpose.</em>', 'Our dining room is a living stage. From low-lit vinyl sessions to live-fire apprentice masterclasses, explore our weekly cadence.')}
        <div class="events-legend-pill">
          <span class="live-dot"></span>
          <span>Reservations Open 30 Days in Advance</span>
        </div>
      </div>

      <div class="events-ledger-list">
        <!-- Event Row 1 -->
        <article class="event-ledger-row reveal">
          <div class="event-cadence-badge">
            <span class="cadence-day">THU</span>
            <small class="cadence-freq">EVERY WEEK</small>
            <span class="cadence-time">8:00 PM — LATE</span>
          </div>
          <div class="event-ledger-body">
            <div class="event-ledger-heading">
              <h3 class="event-ledger-title">Live Acoustic Jazz, Vinyl & Cellar Pours</h3>
              <span class="event-leader-dots" aria-hidden="true"></span>
              <span class="event-tag-pill"><i data-lucide="music"></i> Music & Wine</span>
            </div>
            <p class="event-ledger-desc">An intimate trio of Lagos jazz instrumentalists perform acoustic arrangements alongside weekly sommelier flights of skin-contact natural wines, rare Sicilian volcanic reds, and curated midnight small plates.</p>
            <div class="event-ledger-perks">
              <span><i data-lucide="wine"></i> Flight Pairings from $38</span>
              <span><i data-lucide="users"></i> Salon & Bar Seating</span>
              <span><i data-lucide="clock-3"></i> Walk-ins Welcome at Bar</span>
            </div>
          </div>
          <div class="event-ledger-action">
            <a class="button button-primary magnetic" href="/pages/reservations.html?event=jazz">
              <span>Reserve Table</span>
              <i data-lucide="arrow-right"></i>
            </a>
          </div>
        </article>

        <!-- Event Row 2 -->
        <article class="event-ledger-row reveal">
          <div class="event-cadence-badge is-highlight">
            <span class="cadence-day">SAT</span>
            <small class="cadence-freq">1st OF MONTH</small>
            <span class="cadence-time">11:00 AM — 2:30 PM</span>
          </div>
          <div class="event-ledger-body">
            <div class="event-ledger-heading">
              <h3 class="event-ledger-title">The Masterclass: Live Hearth Fire & Ember Searing</h3>
              <span class="event-leader-dots" aria-hidden="true"></span>
              <span class="event-tag-pill is-fire"><i data-lucide="flame"></i> Chef Masterclass</span>
            </div>
            <p class="event-ledger-desc">Step behind the line with Chef Amara Cole. Explore timber selection (mahogany, oak, fruitwood), fire temperature management (from 80°C cold smoke to 450°C blazing coals), and finish with a communal 4-course banquet.</p>
            <div class="event-ledger-perks">
              <span><i data-lucide="award"></i> Limited to 12 Guests</span>
              <span><i data-lucide="utensils"></i> Includes 4-Course Feast</span>
              <span><i data-lucide="gift"></i> Custom Apron Included</span>
            </div>
          </div>
          <div class="event-ledger-action">
            <a class="button button-primary magnetic" href="/pages/reservations.html?event=masterclass">
              <span>Reserve Seat</span>
              <i data-lucide="arrow-right"></i>
            </a>
          </div>
        </article>

        <!-- Event Row 3 -->
        <article class="event-ledger-row reveal">
          <div class="event-cadence-badge">
            <span class="cadence-day">SUN</span>
            <small class="cadence-freq">EVERY WEEK</small>
            <span class="cadence-time">12:00 PM — 5:00 PM</span>
          </div>
          <div class="event-ledger-body">
            <div class="event-ledger-heading">
              <h3 class="event-ledger-title">The Sunday Communal Harvest & Feasting Table</h3>
              <span class="event-leader-dots" aria-hidden="true"></span>
              <span class="event-tag-pill"><i data-lucide="users"></i> Family Dining</span>
            </div>
            <p class="event-ledger-desc">Convivial, sharing-style banquets served down the center of our long oak tables on hand-thrown ceramics. Whole-roasted market catch, 12-hour short ribs, warm cassava flatbreads, and large-format wine magnums.</p>
            <div class="event-ledger-perks">
              <span><i data-lucide="smile"></i> Perfect for Groups (4+)</span>
              <span><i data-lucide="heart"></i> Family & Kids Welcome</span>
              <span><i data-lucide="sparkles"></i> Seasonal Surprise Dessert</span>
            </div>
          </div>
          <div class="event-ledger-action">
            <a class="button button-primary magnetic" href="/pages/reservations.html?event=sunday-harvest">
              <span>Reserve Feast</span>
              <i data-lucide="arrow-right"></i>
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- Section 9: Reservation Banner -->
  <section class="reservation-banner"><img src="${img.drinks}" alt="Candlelit restaurant table"><div class="container"><span class="eyebrow">Your table is waiting</span><h2>Reserve your evening.</h2><p>Good food tastes better when it is shared.</p><a class="button button-primary magnetic" href="/pages/reservations.html">Book a table <i data-lucide="calendar-days"></i></a></div></section>
  </main>${footer()}`
}

function about() {
  return `${pageHero('Since 2016 · Onitsha', 'Food with a story.<br><em>People with passion.</em>', 'Flavoro was built around one simple belief: the best tables make room for everyone.', img.interior, 'About')}
  <section id="story" class="story section-pad"><div class="container split-section"><div>${sectionHead('Our story', 'It started with a table for twelve.', 'What began as a tiny candlelit supper club became a home for curious palates and generous hospitality.')}<p class="reveal">Founder and executive chef Amara Cole grew up around noisy Sunday lunches where recipes were rarely written down and nobody left early. Flavoro carries that spirit forward—refined, never restrained.</p><p class="reveal">Today, our menu follows the seasons while our dining room stays grounded in warmth, spontaneity and the pleasure of sharing.</p></div><div class="reveal-image framed-image"><img src="${img.interior}" alt="Our dining room"><span>EST. 2016</span></div></div></section>
  <section class="numbers"><div class="container stats-grid">${[['10+','Years of flavor'],['42','Local partners'],['18k','Happy guests'],['4.9','Average rating']].map(x=>`<div class="stat reveal"><strong data-count>${x[0]}</strong><span>${x[1]}</span></div>`).join('')}</div></section>
  <section class="values section-pad"><div class="container">${sectionHead('Our philosophy', 'Nothing extra. Nothing ordinary.', 'Four principles guide every choice, from the first delivery to the final goodbye.')}<div class="big-card-grid">${[['leaf','Season first','We let ingredients lead, changing our cooking as the market changes.'],['flame','Fire & patience','Some flavors need heat. Others simply need time.'],['heart','Radical warmth','Hospitality begins before you arrive and lingers after you leave.'],['sparkles','Always curious','Tradition is our foundation, never our limit.']].map(([i,t,c],n)=>`<article class="value-card reveal-card"><span>0${n+1}</span><i data-lucide="${i}"></i><h3>${t}</h3><p>${c}</p></article>`).join('')}</div></div></section>
  <section class="timeline section-pad"><div class="container"><div class="sticky-copy">${sectionHead('The journey', 'A decade in motion.')}</div><div class="timeline-list">${[['2016','Twelve seats, one menu','Our first supper was served in a borrowed room with a record player and a lot of nerve.'],['2019','Flavoro found a home','We opened our own dining room and invited the city in.'],['2022','The kitchen grew','A new team, a live-fire hearth and our first chef’s tasting menu.'],['Today','Still hungry','New ideas, new producers and the same promise of a beautiful evening.']].map(x=>`<article class="reveal"><strong>${x[0]}</strong><div><h3>${x[1]}</h3><p>${x[2]}</p></div></article>`).join('')}</div></div></section>

  <!-- NEW SECTION: Our Producers & Growers (About) -->
  <section id="ecosystem" class="producers-section section-pad"><div class="container">
    ${sectionHead('Our ecosystem', 'The hands behind <em>the harvest.</em>', 'Great food is born long before it reaches our stove. We proudly collaborate with independent growers, fishermen, and millers.')}
    <div class="producers-grid">
      <article class="producer-card reveal-card">
        <div class="producer-image"><img src="${img.salad}" alt="Highland Valley Farm greens"></div>
        <div class="producer-content">
          <small>Heirloom Produce · Jos Plateau</small>
          <h3>Highland Valley Farms</h3>
          <p>Cultivating native heirloom herbs, brassicas, and crisp organic root vegetables grown at 1,200m elevation with zero synthetic fertilizers.</p>
        </div>
      </article>
      <article class="producer-card reveal-card">
        <div class="producer-image"><img src="${img.fish}" alt="Coastal artisanal fishery catch"></div>
        <div class="producer-content">
          <small>Sustainable Day-Boat · Atlantic Coast</small>
          <h3>Delta Hook & Line Fishery</h3>
          <p>A generational cooperative of coastal divers and hook-and-line fishermen bringing wild red snapper and prawns into our kitchen within 24 hours.</p>
        </div>
      </article>
      <article class="producer-card reveal-card">
        <div class="producer-image"><img src="${img.breakfast}" alt="Heritage stone-ground grain sourdough"></div>
        <div class="producer-content">
          <small>Ancient Grains · Kano Valley</small>
          <h3>Heritage Stone Mills</h3>
          <p>Stone-grinding single-variety ancient millet, sorghum, and wheat flours on natural granite millstones for our slow-fermented hearth breads.</p>
        </div>
      </article>
    </div>
  </div></section>

  <!-- NEW SECTION: Hospitality & Sustainability Pledge (About) -->
  <section id="pledge" class="pledge-section section-pad"><div class="container">
    ${sectionHead('Our pledge', 'Hospitality with <em>a conscience.</em>', 'We treat our soil, our ocean, our team, and our guests with equal devotion.')}
    <div class="pledge-grid">
      <div class="pledge-card reveal-card">
        <i data-lucide="leaf"></i>
        <h3>Zero Food Waste</h3>
        <p>Every vegetable trim, bone, and peel is transformed into savory glazes, stocks, vinegar reductions, or enriched garden compost.</p>
      </div>
      <div class="pledge-card reveal-card">
        <i data-lucide="shield-check"></i>
        <h3>100% Plastic Free</h3>
        <p>We eliminated single-use plastics from deliveries, storage, and guest services in favor of beeswax wraps, glass, and compostables.</p>
      </div>
      <div class="pledge-card reveal-card">
        <i data-lucide="heart"></i>
        <h3>Living Wage & Care</h3>
        <p>All kitchen and dining room staff receive industry-leading living wages, comprehensive healthcare, and four-day flexible work weeks.</p>
      </div>
      <div class="pledge-card reveal-card">
        <i data-lucide="users"></i>
        <h3>Apprentice Guild</h3>
        <p>We sponsor six young culinary apprentices annually with full tuition, hands-on hearth training, and guaranteed career placement.</p>
      </div>
    </div>
  </div></section>

  <section id="chefs" class="team-section section-pad"><div class="container">${sectionHead('The kitchen', 'Meet our chefs', 'Different backgrounds. One shared language: flavor.')}<div class="team-hero reveal-image"><img src="${img.chefs}" alt="Our chef team"></div><div class="team-names">${[['Amara Cole','Executive Chef'],['Luca Marino','Chef de Cuisine'],['Nneka Obi','Pastry Chef']].map(x=>`<div><h3>${x[0]}</h3><span>${x[1]}</span></div>`).join('')}</div></div></section>
  <section class="reservation-banner"><img src="${img.hero}" alt="Signature dish"><div class="container"><span class="eyebrow">Come meet us</span><h2>Taste the story.</h2><a class="button button-primary" href="/pages/reservations.html">Reserve a table</a></div></section>${closePage()}`
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
           <span class="mode-title">The Grand Dining Carte</span>
           <small class="mode-subtitle">Authentic Restaurant Menu List · Table Reservations & Pairings</small>
         </div>
       </button>
       <button type="button" class="mode-tab-btn" data-menu-mode="hearth-order" id="tab-btn-order">
         <i data-lucide="flame"></i>
         <div class="mode-tab-text">
           <span class="mode-title">The Live Hearth Order Pass</span>
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
       <nav class="carte-course-nav" aria-label="Course fast navigation">
         <a href="#act-morning" class="course-jump-pill"><i data-lucide="sun"></i> Act I: Morning Starters</a>
         <a href="#act-midday" class="course-jump-pill"><i data-lucide="utensils"></i> Act II: Midday Harvest</a>
         <a href="#act-evening" class="course-jump-pill"><i data-lucide="flame"></i> Act III: Evening Ember Mains</a>
         <a href="#act-confections" class="course-jump-pill"><i data-lucide="sparkles"></i> Act IV: Confections & Cellar</a>
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
             <strong>LIVE HEARTH DISPATCH ACTIVE</strong>
             <span>Woodfire Temperature: 450°C · Average Line Prep: 14 Mins</span>
           </div>
         </div>
       </div>
       <div class="hud-col-right">
         <span class="hud-ticket-counter"><i data-lucide="clock"></i> Active Kitchen Queues: 2 Tickets</span>
         <a href="#custom-studio" class="btn-scroll-custom-studio"><i data-lucide="sparkles"></i> Build Custom Plate from Scratch</a>
       </div>
     </div>

     <!-- Dedicated Kitchen Command Center (Search & Filters) -->
     <div class="kitchen-command-box">
       <!-- Search Bar -->
       <div class="search-bar-wrap">
         <i data-lucide="search" class="search-icon"></i>
         <input type="text" id="menu-search-input" class="menu-search-input" placeholder="Search menu dishes, or search by ingredient to exclude/include (e.g. truffle, snapper, brioche, mushroom)..." autocomplete="off">
         <button type="button" id="menu-search-clear" class="search-clear-btn" aria-label="Clear search"><i data-lucide="x"></i></button>
       </div>

       <!-- Category Navigation Tabs -->
       <div class="filter-group category-filter-group" role="tablist" aria-label="Order categories">
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
           <button type="button" class="diet-pill" data-diet-filter="chefs-pick"><i data-lucide="star"></i> Chef's Picks</button>
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
 <div id="quick-view-modal" class="flavoro-modal" aria-hidden="true">
   <div class="modal-backdrop"></div>
   <div class="modal-dialog quick-view-dialog">
     <button type="button" class="modal-close" aria-label="Close modal"><i data-lucide="x"></i></button>
     <div class="modal-body"></div>
   </div>
 </div>

 <!-- Slide-over Drawer: Interactive Order Bag -->
 <div id="order-bag-drawer" class="order-drawer" aria-hidden="true">
   <div class="drawer-backdrop"></div>
   <div class="drawer-panel">
     <div class="drawer-header">
       <div class="drawer-title-wrap">
         <i data-lucide="shopping-bag"></i>
         <div>
           <h3>Your Order Bag</h3>
           <span>Routed directly to the Hearth Pass</span>
         </div>
       </div>
       <button type="button" class="drawer-close" aria-label="Close order bag"><i data-lucide="x"></i></button>
     </div>

     <!-- Dining Mode Selection -->
     <div class="drawer-mode-switch">
       <button type="button" class="mode-tab is-active" data-dining-mode="dine-in">
         <i data-lucide="utensils"></i> Dine-In Table
       </button>
       <button type="button" class="mode-tab" data-dining-mode="pickup">
         <i data-lucide="clock"></i> Takeaway Pickup
       </button>
     </div>

     <!-- Table Number / Pickup Time Inputs -->
     <div class="drawer-location-inputs">
       <div id="dine-in-table-wrap" class="input-group">
         <label for="dine-in-table-number">Table / Seating Area</label>
         <input type="text" id="dine-in-table-number" placeholder="e.g. Table 12, Counter 4, Garden Salon" value="Table 12">
       </div>
       <div id="pickup-time-wrap" class="input-group is-hidden">
         <label for="pickup-time-select">Requested Pickup Time</label>
         <select id="pickup-time-select">
           <option>Today in 25 mins (Fastest)</option>
           <option>Today in 45 mins</option>
           <option>Today at 7:00 PM</option>
           <option>Today at 8:30 PM</option>
         </select>
       </div>
       <div class="input-group">
         <label for="order-guest-name">Guest Name</label>
         <input type="text" id="order-guest-name" placeholder="Your name or party name" value="Honored Guest">
       </div>
     </div>

     <!-- Items List Container -->
     <div class="drawer-items-list"></div>

     <!-- Order Summary & Checkout -->
     <div class="drawer-footer">
       <div class="drawer-summary-rows">
         <div class="summary-line">
           <span>Food & Beverage Subtotal:</span>
           <b id="drawer-subtotal">$0.00</b>
         </div>
         <div class="summary-line">
           <span>Local Hospitality Tax (8%):</span>
           <b id="drawer-tax">$0.00</b>
         </div>
         <div class="summary-line">
           <span>Kitchen & Service Gratuity (10%):</span>
           <b id="drawer-gratuity">$0.00</b>
         </div>
         <div class="summary-total-line">
           <span>Grand Total:</span>
           <strong id="drawer-grand-total">$0.00</strong>
         </div>
       </div>

       <button type="button" class="button button-primary btn-checkout" id="btn-checkout-order">
         <i data-lucide="check-circle-2"></i> <span>Send Order to Live Kitchen</span>
       </button>
       <small class="drawer-safe-guarantee"><i data-lucide="shield-check"></i> 100% Guaranteed Fresh from Hearth · Zero Contact Friction</small>
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
     <small>Active Table Order</small>
     <b class="order-bag-total">$0.00</b>
   </div>
   <i data-lucide="arrow-up-right" class="float-arrow"></i>
 </button>

 ${closePage()}`
}

function gallery() {
 const tiles = [img.hero,img.interior,img.chefs,img.dessert,img.drinks,img.breakfast,img.fish,img.private,img.salad,img.portrait,img.hero,img.drinks]
 return `${pageHero('A look inside', 'Good nights.<br><em>Beautifully remembered.</em>', 'From first light in the kitchen to the last glass at the bar.', img.drinks, 'Gallery')}
 <section class="gallery-section section-pad"><div class="container">${sectionHead('The Flavoro journal', 'Scenes from our table')}<div class="gallery-grid">${tiles.map((src,i)=>`<button class="gallery-tile reveal-image" data-lightbox="${src}" aria-label="Open gallery image ${i+1}"><img src="${src}" alt="Flavoro restaurant moment ${i+1}"><span><i data-lucide="maximize-2"></i></span></button>`).join('')}</div></div></section>
 ${marquee('COME HUNGRY · STAY A WHILE ·')}

 <!-- NEW SECTION: The Arc of a Day in Motion (Gallery) -->
 <section id="behind-the-scenes" class="day-arc-section section-pad"><div class="container">
   ${sectionHead('Behind the scenes', 'A day in <em>choreography.</em>', 'From the silent dawn firewood delivery to the laughter echoing past midnight, step into our kitchen rhythm.')}
   <div class="day-arc-grid">
     <article class="arc-card reveal-card">
       <div class="arc-time"><i data-lucide="sun"></i> 07:30 AM · Morning Ember</div>
       <h3>The Hearth Awakens</h3>
       <p>Hardwood logs are kindled in the hearth, sourdough loaves slide into the cast-iron bake, and our produce baskets arrive fresh from the morning markets.</p>
     </article>
     <article class="arc-card reveal-card">
       <div class="arc-time"><i data-lucide="sun"></i> 12:30 PM · Midday Light</div>
       <h3>The Sunlight Service</h3>
       <p>Tall windows flood the dining salon with sunshine. Crisp chilled wines are uncorked, lunch salads tossed, and pasta dough rolled fresh to order.</p>
     </article>
     <article class="arc-card reveal-card">
       <div class="arc-time"><i data-lucide="moon"></i> 06:00 PM · Golden Hour</div>
       <h3>The Evening Rush</h3>
       <p>Cocktail shakers clink, live coals roar to peak searing heat, vinyl jazz begins playing, and candle wicks glow across every table.</p>
     </article>
     <article class="arc-card reveal-card">
       <div class="arc-time"><i data-lucide="moon"></i> 10:30 PM · Midnight Glow</div>
       <h3>Late Night Stories</h3>
       <p>Digestifs and aged amari flow freely at the bar, chefs step out of the pass to greet friends, and lingering laughter carries the night home.</p>
     </article>
   </div>
 </div></section>

 <section class="gallery-quote section-pad"><div class="container"><i data-lucide="quote"></i><blockquote>“A restaurant should feel like a world you can step into—and never quite want to leave.”</blockquote><span>Flavoro, Onitsha</span></div></section><div class="lightbox" data-lightbox-modal><button aria-label="Close"><i data-lucide="x"></i></button><img alt="Expanded gallery view"></div>${closePage()}`
}

function reservations() {
 return `${pageHero('Table Reservations · Live Hearth Dining', 'Reserve your table.<br><em>Curate your evening.</em>', 'Select your table setting and pre-choose from our live multi-course menu so Chef Amara’s hearth pass is prepared for your party.', img.interior, 'Reservations')}
 <section class="booking-section section-pad">
   <div class="container booking-grid">
     <div>
       ${sectionHead('Table Reservation', 'Secure your dining table', 'Book in advance for our dining salon, hearth counter, or secret garden terrace. For parties of seven or more, our communal feasting boards ensure a seamless evening.')}
       <div class="booking-notes">
         <div><i data-lucide="clock-3"></i><span><b>Dining Hours</b>Mon—Thu 5pm—11pm<br>Fri—Sun 12pm—late</span></div>
         <div><i data-lucide="phone"></i><span><b>Reservations Concierge</b>+234 123 456 7890</span></div>
         <div><i data-lucide="utensils"></i><span><b>Live Menu Pre-Selection</b>Our kitchen preps your chosen courses before your arrival</span></div>
       </div>
     </div>

     <form id="reservation-booking-form" class="booking-form reveal">
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
         <label>Party size<select name="party"><option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5 guests</option><option>6 guests</option><option>7+ guests (Feasting)</option></select></label>
         <label>Table Atmosphere<select name="setting"><option>Main Dining Room (Atmospheric)</option><option>Fire Hearth Counter (Chef View)</option><option>Secret Garden Terrace (Open Air)</option><option>Private Dining Room</option></select></label>
       </div>

       <!-- Embedded Live Menu Course Selector (Separated from Online Ordering) -->
       <div class="res-step-badge" style="margin-top:28px;"><span>Step 2 · Pre-Select Live Menu for Your Table</span></div>
       <div id="reservation-live-menu-wrap" class="res-live-menu-wrapper"></div>

       <label style="margin-top:24px;">Special Wishes or Dietary Allergies for Chef Amara<textarea name="notes" placeholder="Anniversary celebrations, seating preferences, allergies..."></textarea></label>
       
       <button class="button button-primary btn-submit-res" type="submit" style="width:100%;margin-top:16px;">
         <i data-lucide="calendar-days"></i> <span>Confirm Table Reservation with Selected Menu</span>
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
         <ul class="space-perks"><li><i data-lucide="flame"></i> 1 to 4 guests</li><li><i data-lucide="sparkles"></i> Chef interaction</li></ul>
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

 <section id="private-dining" class="private-dining section-pad"><div class="container split-section"><div class="reveal-image"><img src="${img.private}" alt="Private dining setup"></div><div>${sectionHead('Private dining', 'Your occasion, made personal.', 'Host an intimate dinner, a spirited celebration or a beautifully simple business lunch in our private room.')}<ul class="check-list"><li><i data-lucide="check"></i>Up to 28 seated guests</li><li><i data-lucide="check"></i>Custom seasonal menus</li><li><i data-lucide="check"></i>Dedicated host and sommelier</li></ul><a class="text-link" href="/pages/contact.html">Plan an event <i data-lucide="arrow-right"></i></a></div></div></section>

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
       <i data-lucide="sparkles"></i>
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

 <section class="faq section-pad"><div class="container narrow">${sectionHead('Good to know', 'Before you arrive')}<div class="accordion">${[['What is your cancellation policy?','Reservations can be changed or cancelled up to 24 hours before your booking.'],['Can you accommodate dietary needs?','Absolutely. Tell us when booking and our kitchen will create a thoughtful alternative.'],['Is there a dress code?','Smart casual. Come polished, comfortable and ready for a beautiful night.'],['Are children welcome?','Yes. Earlier reservations are especially suited to families.']].map(x=>`<details class="reveal"><summary>${x[0]}<i data-lucide="plus"></i></summary><p>${x[1]}</p></details>`).join('')}</div></div></section>${closePage()}`
}

function blog() {
 const posts = [['The beautiful work before service',img.chefs,'Kitchen notes'],['Why we still cook with fire',img.hero,'Craft'],['A late-night guide to Flavoro',img.drinks,'City life'],['Meet the growers behind the menu',img.interior,'People'],['The art of the final course',img.dessert,'Pastry'],['Ten years around the table',img.interior,'Stories']]
 return `${pageHero('Stories from Flavoro', 'Notes from<br><em>behind the pass.</em>', 'People, produce, places and the ideas shaping our restaurant.', img.chefs, 'Blog')}
 <section class="featured-story section-pad"><div class="container split-section"><div class="reveal-image"><img src="${img.hero}" alt="Cooking with fire"></div><div><span class="eyebrow">Featured · 8 min read</span><h2>Cooking by instinct in a kitchen built on trust.</h2><p>Chef Amara on leading a team, listening to ingredients and leaving enough room for surprise.</p><a class="text-link" href="#article">Read the story <i data-lucide="arrow-right"></i></a></div></div></section>
 <section class="journal section-pad"><div class="container">${sectionHead('The journal', 'Fresh from Flavoro')}<div class="post-grid">${posts.map((x,i)=>`<article class="post-card reveal-card"><a href="#article"><div><img src="${x[1]}" alt="${x[0]}"><span>${x[2]}</span></div><small>${String(i+2).padStart(2,'0')}.07.2026 · 5 min read</small><h3>${x[0]}</h3><p>Go a little deeper into the ingredients, rituals and people behind each evening.</p><span class="text-link">Read story <i data-lucide="arrow-right"></i></span></a></article>`).join('')}</div></div></section>
 <section id="article" class="newsletter"><div class="container"><span class="eyebrow">A good note, occasionally</span><h2>Stories worth savoring.</h2><p>New menus, kitchen dispatches and invitations—sent with restraint.</p><form data-demo-form><input type="email" required aria-label="Email address" placeholder="Email address"><button class="button button-primary">Join the list</button></form><p data-form-status></p></div></section>${closePage()}`
}

function contact() {
 return `${pageHero('Come find us', 'Let’s make<br><em>something memorable.</em>', 'Reservations, private events, press, partnerships—or simply a hello.', img.interior, 'Contact')}
 <section class="contact-section section-pad"><div class="container contact-grid"><div>${sectionHead('Contact', 'We would love to hear from you.')}<div class="contact-methods"><a href="tel:+2341234567890"><i data-lucide="phone"></i><span><small>Call</small>+234 123 456 7890</span></a><a href="mailto:hello@flavoro.restaurant"><i data-lucide="mail"></i><span><small>Email</small>hello@flavoro.restaurant</span></a><div><i data-lucide="map-pin"></i><span><small>Visit</small>123 Food Street, GRA, Onitsha</span></div></div></div><form class="contact-form reveal" data-demo-form><div class="form-row"><label>Name<input required placeholder="Your name"></label><label>Email<input required type="email" placeholder="Your email"></label></div><label>What can we help with?<select><option>General enquiry</option><option>Private dining</option><option>Press & partnerships</option><option>Careers</option></select></label><label>Message<textarea required placeholder="Tell us a little more..."></textarea></label><button class="button button-primary">Send message <i data-lucide="arrow-right"></i></button><p data-form-status></p></form></div></section>
 <section class="location section-pad"><div class="container location-grid"><div class="map-card"><div class="map-lines"></div><span class="map-pin"><i data-lucide="map-pin"></i></span><div><b>Flavoro</b><small>Onitsha · Nigeria</small></div></div><div>${sectionHead('Hours & location', 'Meet us at the table.')}<div class="hours"><div><span>Monday—Thursday</span><b>5:00 PM—11:00 PM</b></div><div><span>Friday</span><b>12:00 PM—12:00 AM</b></div><div><span>Saturday</span><b>11:00 AM—12:00 AM</b></div><div><span>Sunday</span><b>11:00 AM—10:00 PM</b></div></div><a class="button button-dark" href="#">Get directions <i data-lucide="move-up-right"></i></a></div></div></section>
 <section class="reservation-banner"><img src="${img.drinks}" alt="Flavoro bar"><div class="container"><span class="eyebrow">See you soon</span><h2>The best nights begin here.</h2><a class="button button-primary" href="/pages/reservations.html">Reserve your table</a></div></section>${closePage()}`
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
 return `<main id="main-content" class="auth-page"><a class="brand auth-brand" href="/index.html"><span class="brand-mark"><i data-lucide="utensils-crossed"></i></span><span><b>Flavoro</b><small>RESTAURANT</small></span></a><div class="auth-visual"><img src="${img.hero}" alt="Flavoro signature dish"><div><span class="script-line">Welcome to Flavoro</span><h1>${signup ? 'Your table has<br>room for you.' : 'Come back to<br>something delicious.'}</h1></div></div><div class="auth-panel"><a class="back-link" href="/index.html"><i data-lucide="arrow-left"></i>Back home</a><div class="auth-box"><span class="eyebrow">Flavoro members</span><h2>${signup ? 'Create an account' : 'Welcome back'}</h2><p>${signup ? 'Save favorites, manage reservations and enjoy a more personal Flavoro.' : 'Sign in to manage reservations and saved experiences.'}</p><form data-demo-form>${signup ? '<label>Full name<input required placeholder="Your full name"></label>' : ''}<label>Email address<input required type="email" placeholder="you@example.com"></label><label>Password<input required type="password" placeholder="••••••••"></label>${!signup ? '<div class="auth-options"><label><input type="checkbox"> Remember me</label><a href="#">Forgot password?</a></div>' : '<label class="terms"><input required type="checkbox"> I agree to the Terms and Privacy Policy.</label>'}<button class="button button-primary">${signup ? 'Create account' : 'Sign in'}<i data-lucide="arrow-right"></i></button><p data-form-status></p></form><div class="auth-switch">${signup ? 'Already have an account?' : 'New to Flavoro?'} <a href="/pages/${signup ? 'login' : 'signup'}.html">${signup ? 'Sign in' : 'Create account'}</a></div></div></div></main>`
}

export function renderPage(page) {
 const pages = { home, about, menu, gallery, reservations, blog, contact, login: () => auth('login'), signup: () => auth('signup'), notFound }
 return (pages[page] || home)()
}
