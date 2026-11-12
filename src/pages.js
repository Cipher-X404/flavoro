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
  stockDining: '/images/editorial/dining-room.jpg',
  sharedPasta: '/images/menu/shared-pasta.jpg',
  breakfastPhoto: '/images/menu/breakfast-eggs.jpg',
  dessertPhoto: '/images/menu/chocolate-dessert.jpg',
  cocktailPhoto: '/images/menu/cocktail.jpg',
  barPhoto: '/images/editorial/bartender.jpg',
}

const marquee = (text = 'FIRE · FLAVOR · PEOPLE · PASSION ·') => `<div class="marquee" aria-hidden="true"><div>${Array(5).fill(`<span>${text}</span>`).join('')}</div></div>`

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
  ${marquee()}

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
 return `${pageHero('The Flavoro feeling', 'Good food.<br><em>Better together.</em>', 'A table is more than a place to eat. It is a place to connect.', img.interior, 'About')}
 <section id="story" class="table-story section-pad"><div class="container table-story-grid"><div class="table-story-copy reveal"><span class="eyebrow">THE IDEA BEHIND THE TABLE</span><h2>Make room for <em>the moment.</em></h2><p>Flavor, conversation and the simple pleasure of sharing a meal: that is the spirit behind Flavoro.</p><a class="text-link" href="/pages/menu.html">Explore the menu <i data-lucide="arrow-up-right"></i></a></div><div class="table-story-image reveal-image"><img src="${img.interior}" alt="A warmly lit dining room"><span>GOOD FOOD / GOOD PEOPLE</span></div><div class="table-story-aside"><span>THE FLAVORO FEELING</span><p>A little longer.<br>A little closer.</p></div></div></section>
 <section id="chefs" class="section-pad"><div class="container split-section"><div class="reveal-image"><img src="${img.chefs}" alt="Chefs working together in a kitchen"></div><div>${sectionHead('The people', 'A little care in <em>every detail.</em>', 'From the kitchen to the table, hospitality is made by people.')}<p>Team stories and profiles will be shared here once verified.</p><a class="text-link" href="/pages/gallery.html">See the gallery <i data-lucide="arrow-up-right"></i></a></div></div></section>
 <section id="ecosystem" class="section-pad story-produce"><div class="container split-section"><div>${sectionHead('Ingredients & craft', 'The ingredients are <em>just the beginning.</em>', 'A meal brings together ingredients, craft and the people around the table.')}<p>Producer details and sourcing information will be added when available.</p></div><div class="reveal-image"><img src="${img.salad}" alt="A colorful plate of greens"></div></div></section>
 <section class="reservation-banner"><img src="${img.hero}" alt="A plated dish"><div class="container"><span class="eyebrow">Come together</span><h2>A table worth staying for.</h2><a class="button button-primary" href="/pages/reservations.html">Explore reservations</a></div></section>${closePage()}`
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
         <a href="#custom-studio" class="btn-scroll-custom-studio"><i data-lucide="sparkles"></i> Build Custom Plate from Scratch</a>
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
 const tiles = [[img.hero,'A plated pasta dish'],[img.interior,'A warmly lit dining room'],[img.chefs,'Chefs together in the kitchen'],[img.dessert,'A dessert'],[img.drinks,'Cocktails at the bar'],[img.breakfast,'A breakfast dish'],[img.fish,'A fish dish'],[img.private,'A table set for private dining'],[img.salad,'A plate of greens'],[img.portrait,'A chef portrait'],[img.breakfastPhoto,'Scrambled eggs served with toast'],[img.dessertPhoto,'A chocolate dessert with cinnamon'],[img.cocktailPhoto,'A cocktail served at a bar'],[img.barPhoto,'A bartender preparing drinks']]
 return `${pageHero('A look inside', 'Good nights.<br><em>Beautifully remembered.</em>', 'From first light in the kitchen to the last glass at the bar.', img.drinks, 'Gallery')}
 <section class="gallery-section section-pad"><div class="container">${sectionHead('The Flavoro journal', 'Scenes from our table', 'A visual collection of illustrative food and hospitality photography.')}<div class="gallery-grid">${tiles.map(([src,alt])=>`<button class="gallery-tile reveal-image" data-lightbox="${src}" aria-label="View: ${alt}"><img src="${src}" alt="${alt}"><span><i data-lucide="maximize-2"></i></span></button>`).join('')}</div></div></section>
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

 <section class="gallery-quote section-pad"><div class="container"><i data-lucide="quote"></i><blockquote>“A restaurant should feel like a world you can step into—and never quite want to leave.”</blockquote><span>Flavoro, Onitsha</span></div></section><div class="lightbox" data-lightbox-modal role="dialog" aria-modal="true" aria-label="Gallery image viewer"><button class="lightbox-close" aria-label="Close gallery viewer"><i data-lucide="x"></i></button><img alt=""><div class="lightbox-controls"><button type="button" data-lightbox-prev aria-label="Previous image">← Previous</button><span data-lightbox-count aria-live="polite"></span><button type="button" data-lightbox-next aria-label="Next image">Next →</button></div></div>${closePage()}`
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

 <section class="faq section-pad"><div class="container narrow">${sectionHead('Good to know', 'Before you arrive')}<div class="accordion"><details><summary>Can I make a reservation online?<i data-lucide="plus"></i></summary><p>Online reservations are not connected yet. This page is a preview and does not confirm a booking.</p></details><details><summary>Where can I find accessibility and dietary information?<i data-lucide="plus"></i></summary><p>These details will be published once verified. Menu labels are illustrative and should not be relied on for allergies.</p></details><details><summary>Can I plan a private event?<i data-lucide="plus"></i></summary><p>Private dining details and enquiry options will be added when confirmed.</p></details></div></div></section>${closePage()}`
}

function blog() {
 return `${pageHero('The Flavoro journal', 'Notes from<br><em>around the table.</em>', 'Ideas about food, hospitality and the joy of gathering.', img.chefs, 'Blog')}
 <section class="journal-essays section-pad"><div class="container"><div class="journal-intro">${sectionHead('A collection of thoughts', 'A little more to <em>savor.</em>', 'Three short reflections on what makes a meal memorable.')}</div><div class="journal-essay-grid">
 <article id="gathering" class="journal-essay reveal"><span>01 / THE TABLE</span><h2>The art of staying a little longer.</h2><p>The best meals have a way of stretching beyond the last bite. They give us space to catch up, celebrate, and be present with the people around us.</p><a class="text-link" href="/pages/journal-gathering.html">Read the story ↗</a></article>
 <article id="craft" class="journal-essay reveal"><span>02 / THE CRAFT</span><h2>Good food begins with attention.</h2><p>A memorable plate is more than a list of ingredients. It is a balance of texture, warmth and care, brought together for the pleasure of sharing.</p><a class="text-link" href="/pages/journal-craft.html">Read the story ↗</a></article>
 <article id="hospitality" class="journal-essay reveal"><span>03 / THE FEELING</span><h2>There is always room at the table.</h2><p>Hospitality can be found in the small things: a warm welcome, a comfortable space, and the feeling that there is nowhere else you need to be.</p><a class="text-link" href="/pages/journal-hospitality.html">Read the story ↗</a></article>
 </div></div></section><section class="reservation-banner"><img src="${img.interior}" alt="A dining room"><div class="container"><span class="eyebrow">The next chapter</span><h2>Find your place at the table.</h2><a class="button button-primary" href="/pages/reservations.html">Explore reservations</a></div></section>${closePage()}`
}

function contact() {
 return `${pageHero('Plan your visit', 'Let’s make<br><em>something memorable.</em>', 'Find the information you need for a good time around the table.', img.interior, 'Contact')}
 <div class="experience-notice"><div class="container">VISIT INFORMATION IS BEING VERIFIED. CONTACT DETAILS, HOURS AND DIRECTIONS ARE NOT YET AVAILABLE.</div></div>
 <section class="section-pad visit-section"><div class="container visit-grid"><div>${sectionHead('Visit Flavoro', 'Everything begins <em>at the table.</em>', 'Planning a visit, a celebration or a larger gathering? Essential details will appear here once confirmed.')}</div><div class="visit-info"><article><span>01 / LOCATION</span><h3>Finding us</h3><p>A verified address and directions will be added here.</p></article><article><span>02 / OPENING HOURS</span><h3>When to visit</h3><p>Hours and walk-in information are not yet available.</p></article><article><span>03 / ACCESSIBILITY</span><h3>Making your visit comfortable</h3><p>Accessibility, transport and parking details will be shared when confirmed.</p></article><article><span>04 / GET IN TOUCH</span><h3>Talk to us</h3><p>Verified contact details are not yet available. This website is a preview and cannot send enquiries.</p></article></div></div></section>
 <section class="reservation-banner"><img src="${img.private}" alt="A table set for dining"><div class="container"><span class="eyebrow">Gather beautifully</span><h2>Make a moment of it.</h2><a class="button button-primary" href="/pages/private-dining.html">Explore private dining</a></div></section>${closePage()}`
}

function privateDining() {
 return `${pageHero('Private dining & occasions', 'Make a moment<br><em>of it.</em>', 'A little more time, a little more space, and good company around the table.', img.stockDining, 'Reservations')}
 <div class="experience-notice"><div class="container">ILLUSTRATIVE PHOTOGRAPHY · SPACE DETAILS AND ENQUIRIES ARE NOT YET AVAILABLE.</div></div>
 <section class="section-pad table-story"><div class="container split-section"><div>${sectionHead('Gather beautifully', 'A table for <em>your occasion.</em>', 'From intimate dinners to shared celebrations, imagine an occasion shaped around the people who matter.')}<p>Capacity, menus, accessibility and pricing will be shared once confirmed. Enquiries are not connected in this preview.</p><a class="text-link" href="/pages/visit.html">Plan a visit <i data-lucide="arrow-up-right"></i></a></div><div class="reveal-image"><img src="${img.sharedPasta}" alt="Pasta dishes shared at a table"></div></div></section>
 <section class="section-pad"><div class="container narrow">${sectionHead('Planning ahead', 'The details matter.')}<div class="accordion"><details><summary>How many guests can be accommodated?<i data-lucide="plus"></i></summary><p>Capacity has not yet been confirmed.</p></details><details><summary>Are special menus available?<i data-lucide="plus"></i></summary><p>Menu options and dietary arrangements will be shared once confirmed.</p></details><details><summary>How do I enquire?<i data-lucide="plus"></i></summary><p>Contact and enquiry services are not connected yet.</p></details></div></div></section>${closePage()}`
}
function visit() {
 return `${pageHero('Plan your visit', 'Find your place<br><em>at the table.</em>', 'Everything you need for a comfortable visit, all in one place.', img.stockDining, 'Contact')}
 <div class="experience-notice"><div class="container">ILLUSTRATIVE PHOTOGRAPHY · VISIT INFORMATION IS AWAITING VERIFICATION.</div></div><section class="visit-section section-pad"><div class="container visit-grid"><div>${sectionHead('Before you arrive', 'The details of <em>your visit.</em>', 'We will share verified information here when it is available.')}<a class="selection-link" href="/pages/reservations.html">Explore reservations <span>↗</span></a></div><div class="visit-info"><article><span>01 / ADDRESS</span><h3>Where to find us</h3><p>Address and directions are not yet available.</p></article><article><span>02 / HOURS</span><h3>When to visit</h3><p>Opening hours and walk-in guidance are not yet confirmed.</p></article><article><span>03 / GETTING HERE</span><h3>Transport & parking</h3><p>Transport and parking information will be added once verified.</p></article><article><span>04 / ACCESSIBILITY</span><h3>Making your visit comfortable</h3><p>Venue accessibility details and contact information are awaiting confirmation.</p></article></div></div></section>${closePage()}`
}
function people() {
 return `${pageHero('The people', 'The warmth<br><em>behind the table.</em>', 'Food brings us together; people make the moment.', img.chefs, 'About')}<section class="section-pad"><div class="container split-section"><div>${sectionHead('People & craft', 'Hospitality is a <em>shared story.</em>', 'A great meal is shaped by the hands, ideas and care behind it.')}<p>Verified team profiles and producer stories will appear here when available.</p><a class="text-link" href="/pages/about.html">Explore our story <i data-lucide="arrow-up-right"></i></a></div><div class="reveal-image"><img src="${img.chefs}" alt="Chefs in a kitchen"></div></div></section>${closePage()}`
}
const articles = {
 'journal-gathering': { title:'The art of staying a little longer.', eyebrow:'The table', image:img.sharedPasta, paragraphs:['The best meals have a way of stretching beyond the last bite. They give us space to catch up, celebrate, and be present with the people around us.','A shared table is an invitation to slow down. Whether it is a celebration or an ordinary afternoon, the moments between the courses can be the ones we remember most.'] },
 'journal-craft': { title:'Good food begins with attention.', eyebrow:'The craft', image:'/images/menu/pasta-editorial.jpg', paragraphs:['A memorable plate is more than a list of ingredients. It is a balance of texture, warmth and care, brought together for the pleasure of sharing.','Thoughtful food is about the little choices: the contrast of flavors, the way a plate arrives, and the joy of offering it to someone else.'] },
 'journal-hospitality': { title:'There is always room at the table.', eyebrow:'The feeling', image:img.barPhoto, paragraphs:['Hospitality can be found in the small things: a warm welcome, a comfortable space, and the feeling that there is nowhere else you need to be.','It is the quiet art of making room for connection, conversation and the unexpected pleasure of spending time together.'] },
}
function journalArticle(key) {
 const article = articles[key]
 return `${pageHero(article.eyebrow, article.title, 'Notes from around the table.', article.image, 'Blog')}<article class="editorial-article section-pad"><div class="container narrow"><a class="text-link" href="/pages/blog.html">← Back to the journal</a><span class="eyebrow">${article.eyebrow} &nbsp; / &nbsp; THE FLAVORO JOURNAL</span>${article.paragraphs.map(p=>`<p>${p}</p>`).join('')}<div class="article-image"><img src="${article.image}" alt="Illustrative photograph for the story"><small>Illustrative photography</small></div><a class="selection-link" href="/pages/blog.html">More from the journal <span>↗</span></a></div></article>${closePage()}`
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
 return `<main id="main-content" class="auth-page"><a class="brand auth-brand" href="/index.html"><span class="brand-mark"><i data-lucide="utensils-crossed"></i></span><span><b>Flavoro</b><small>RESTAURANT</small></span></a><div class="auth-visual"><img src="${img.hero}" alt="A plated dish"><div><span class="script-line">Welcome to Flavoro</span><h1>${signup ? 'Your table has<br>room for you.' : 'Come back to<br>something delicious.'}</h1></div></div><div class="auth-panel"><a class="back-link" href="/index.html"><i data-lucide="arrow-left"></i>Back home</a><div class="auth-box"><span class="eyebrow">Flavoro members · Local preview</span><h2>${signup ? 'Create your space' : 'Welcome back'}</h2><p>Keep a local collection of your favorite dishes and preferences.</p><div class="demo-notice">Browser-only demo, not secure authentication. Use a test password, not a real one. One guest account per browser; clearing storage removes it.</div><form data-account-form data-mode="${signup ? 'signup' : 'login'}">${signup ? '<label>Full name<input name="name" required maxlength="60" autocomplete="name" placeholder="Your full name"></label>' : ''}<label>Email address<input name="email" required type="email" autocomplete="username" placeholder="you@example.com"></label><label>Password<input name="password" required type="password" minlength="8" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="At least 8 characters"></label>${signup ? '<label>Confirm password<input name="confirm" required type="password" minlength="8" autocomplete="new-password" placeholder="Repeat password"></label>' : ''}<button class="button button-primary" type="submit">${signup ? 'Create local account' : 'Sign in'}<i data-lucide="arrow-right"></i></button><p data-account-status role="status" aria-live="polite"></p></form><div class="auth-switch">${signup ? 'Already have an account?' : 'New to Flavoro?'} <a href="/pages/${signup ? 'login' : 'signup'}.html">${signup ? 'Sign in' : 'Create account'}</a></div></div></div></main>`
}

export function renderPage(page) {
 const pages = { home, about, menu, gallery, reservations, blog, contact, checkout, 'private-dining': privateDining, visit, people, ...Object.fromEntries(Object.keys(articles).map(key => [key, () => journalArticle(key)])), ...Object.fromEntries(['privacy','terms','accessibility','reservation-confirmation','order-confirmation'].map(key => [key, () => infoPage(key)])), login: () => auth('login'), signup: () => auth('signup'), notFound }
 return (pages[page] || home)()
}
