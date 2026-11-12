const navItems = [
  { label: 'Home', href: '/index.html' },
  { label: 'About', href: '/pages/about.html', children: [['Our Story', '/pages/about.html#story'], ['Our Producers', '/pages/about.html#ecosystem'], ['Our People', '/pages/people.html']] },
  { label: 'Menu', href: '/pages/menu.html', children: [['Dishes', '/pages/menu.html#act-morning'], ['Tasting Menu', '/pages/menu.html#act-tasting'], ['Cellar Flights', '/pages/menu.html#act-confections'], ['Group Feasting', '/pages/menu.html#act-tasting']] },
  { label: 'Gallery', href: '/pages/gallery.html' },
  { label: 'Reservations', href: '/pages/reservations.html', children: [['Book Table', '/pages/reservations.html'], ['Table Settings', '/pages/reservations.html#seating'], ['Private Dining', '/pages/private-dining.html']] },
  { label: 'Blog', href: '/pages/blog.html' },
  { label: 'Contact', href: '/pages/contact.html', children: [['Visit Us', '/pages/visit.html'], ['Accessibility', '/pages/accessibility.html']] },
]

export function header(active = 'Home') {
  const features = {
    About: { image: '/images/chef-team.jpg', eyebrow: 'THE FLAVORO STORY', title: 'A table with a story.', caption: 'The people and passion behind every plate.' },
    Menu: { image: '/images/hero-pasta.jpg', eyebrow: 'A TASTE OF FLAVORO', title: 'Made to be savored.', caption: 'Explore the flavors that bring us together.' },
    Contact: { image: '/images/editorial/dining-room.jpg', eyebrow: 'PLAN YOUR VISIT', title: 'Find your place.', caption: 'Everything you need before you arrive.' },
    Reservations: { image: '/images/restaurant-interior.jpg', eyebrow: 'YOUR SEAT AWAITS', title: 'Stay a little longer.', caption: 'Good company deserves a beautiful setting.' },
  }
  const links = navItems.map((item) => {
    const feature = features[item.label]
    const id = `mega-${item.label.toLowerCase()}`
    return `
    <li class="nav-item ${item.children ? 'has-dropdown' : ''}" ${item.children ? 'data-mega-item' : ''}>
      <div class="nav-link-group"><a class="nav-link ${active === item.label ? 'is-active' : ''}" href="${item.href}">${item.label}</a>${item.children ? `<button class="mega-toggle" type="button" aria-label="Open ${item.label} menu" aria-expanded="false" aria-controls="${id}" data-mega-toggle><i data-lucide="chevron-down"></i></button>` : ''}</div>
      ${item.children ? `<div class="mega-menu" id="${id}" data-mega-panel>
        <div class="mega-inner">
          <div class="mega-intro"><span class="mega-eyebrow">✳ &nbsp; EXPLORE FLAVORO</span><p>${feature.title}</p><span class="mega-intro-note">A LITTLE TASTE OF THE EXTRAORDINARY</span></div>
          <div class="mega-links"><span class="mega-label">${item.label} <span> / &nbsp; THE COLLECTION</span></span>${item.children.map(([label, href], i) => `<a href="${href}"><span class="mega-index">0${i + 1}</span><span>${label}</span><span class="mega-link-arrow">↗</span></a>`).join('')}</div>
          <a class="mega-feature" href="${item.href}"><img src="${feature.image}" alt=""><span class="mega-feature-shade"></span><span class="mega-feature-copy"><small>${feature.eyebrow}</small><strong>${feature.caption}</strong><span>DISCOVER MORE &nbsp; ↗</span></span></a>
        </div>
        <div class="mega-bottom"><span>GOOD FOOD. GOOD PEOPLE.</span><span>✳</span><span>MADE WITH SOUL</span></div>
      </div>` : ''}
    </li>`
  }).join('')

  return `<a class="skip-link" href="#main-content">Skip to main content</a><header class="site-header" data-header>
    <a href="/index.html" class="brand" aria-label="Flavoro home">
      <span class="brand-mark"><i data-lucide="utensils-crossed"></i></span>
      <span><b>Flavoro</b><small>RESTAURANT</small></span>
    </a>
    <nav class="desktop-nav" aria-label="Primary"><ul>${links}</ul></nav>
    <div class="header-actions">
      <a class="user-link" href="/pages/user-dashboard.html" aria-label="Your dashboard"><i data-lucide="user"></i></a>
      <a class="button button-primary header-cta magnetic" href="/pages/reservations.html"><i data-lucide="calendar-days"></i><span>Book a Table</span></a>
      <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-navigation" data-menu-toggle><span>MENU</span><i data-lucide="menu"></i></button>
    </div>
    <div class="mobile-menu" id="mobile-navigation" data-mobile-menu>
      <div class="mobile-menu-head"><a href="/index.html" class="mobile-menu-brand">Flavoro<span>✳</span></a><button data-menu-close aria-label="Close menu"><i data-lucide="x"></i></button></div>
      <div class="mobile-menu-body"><div class="mobile-menu-kicker">A LITTLE TASTE OF FLAVORO <span> / &nbsp; EXPLORE</span></div>
        <nav class="mobile-links" aria-label="Mobile navigation">${navItems.map((item, i) => `<a href="${item.href}" ${active === item.label ? 'aria-current="page"' : ''}><span class="mobile-link-number">0${i + 1}</span><span class="mobile-link-label">${item.label}</span><i data-lucide="arrow-up-right"></i></a>`).join('')}</nav>
        <a class="mobile-reserve" href="/pages/reservations.html"><span>Make yourself at home.</span><strong>Reserve a table <span>↗</span></strong></a>
      </div>
      <div class="mobile-menu-foot"><span>GOOD FOOD. GOOD PEOPLE.</span><span>✳ &nbsp; FLAVORO</span></div>
    </div>
  </header>`
}

export function footer() {
  return `<footer class="site-footer">
    <div class="footer-display">
      <a class="footer-email" href="mailto:hello@flavoro.com" aria-label="Email Flavoro at hello@flavoro.com">HELLO@FLAVORO.COM</a>
      <div class="footer-socials" aria-label="Flavoro social links">
        <a class="social-instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Flavoro on Instagram">INSTAGRAM</a>
        <div class="footer-social-pair">
          <a class="social-facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Flavoro on Facebook">FACEBOOK</a>
          <a class="social-whatsapp" href="https://wa.me/2340000000000" target="_blank" rel="noopener noreferrer" aria-label="Message Flavoro on WhatsApp">WHATSAPP</a>
        </div>
      </div>
    </div>
    <nav class="footer-utility" aria-label="Useful links"><a href="/pages/visit.html">Visit us</a><a href="/pages/private-dining.html">Private dining</a><a href="/pages/people.html">Our people</a><a href="/pages/privacy.html">Privacy</a><a href="/pages/terms.html">Terms</a><a href="/pages/accessibility.html">Accessibility</a><a href="/pages/user-dashboard.html">Guest dashboard</a></nav><div class="footer-bottom"><span>©2026 Flavoro</span><span>Concept preview · details to be verified</span></div>
  </footer>`
}

export const sectionHead = (eyebrow, title, copy = '') => `<div class="section-head reveal"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${copy ? `<p>${copy}</p>` : ''}</div>`

export const dishCard = (name, description, price, image, tag = '') => `<article class="dish-card reveal-card">
  <div class="dish-image"><img src="${image}" alt="${name}">${tag ? `<span>${tag}</span>` : ''}</div>
  <div class="dish-copy"><div><h3>${name}</h3><p>${description}</p></div><strong>${price}</strong></div>
  <a href="/pages/menu.html" aria-label="View ${name}"><i data-lucide="arrow-up-right"></i></a>
</article>`

export const pageHero = (eyebrow, title, copy, image, active) => `${header(active)}<main id="main-content"><section class="page-hero" data-parallax>
  <img class="page-hero-bg" src="${image}" alt="">
  <div class="page-hero-overlay"></div><div class="page-hero-grain"></div>
  <div class="page-hero-content container"><span class="eyebrow hero-kicker">${eyebrow}</span><h1 class="split-title">${title}</h1><p>${copy}</p></div>
  <div class="scroll-cue"><span>SCROLL TO DISCOVER</span><i data-lucide="arrow-down"></i></div>
</section>`

export const closePage = () => `</main>${footer()}`
