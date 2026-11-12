const navItems = [
  { label: 'Home', href: '/index.html' },
  { label: 'About', href: '/pages/about.html', children: [['Our Story', '/pages/about.html#story'], ['Our Producers', '/pages/about.html#ecosystem'], ['Our Chefs', '/pages/about.html#chefs']] },
  { label: 'Menu', href: '/pages/menu.html', children: [['Dishes', '/pages/menu.html#breakfast'], ['Tasting Menu', '/pages/menu.html#tasting'], ['Cellar Flights', '/pages/menu.html#cellar'], ['Group Feasting', '/pages/menu.html#feasting']] },
  { label: 'Gallery', href: '/pages/gallery.html' },
  { label: 'Reservations', href: '/pages/reservations.html', children: [['Book Table', '/pages/reservations.html'], ['Table Settings', '/pages/reservations.html#seating'], ['Private Dining', '/pages/reservations.html#private-dining']] },
  { label: 'Blog', href: '/pages/blog.html' },
  { label: 'Contact', href: '/pages/contact.html' },
]

export function header(active = 'Home') {
  const links = navItems.map((item) => `
    <li class="nav-item ${item.children ? 'has-dropdown' : ''}">
      <a class="nav-link ${active === item.label ? 'is-active' : ''}" href="${item.href}">${item.label}${item.children ? '<i data-lucide="chevron-down"></i>' : ''}</a>
      ${item.children ? `<div class="dropdown">${item.children.map(([label, href]) => `<a href="${href}">${label}<i data-lucide="arrow-up-right"></i></a>`).join('')}</div>` : ''}
    </li>`).join('')

  return `<a class="skip-link" href="#main-content">Skip to main content</a><header class="site-header" data-header>
    <a href="/index.html" class="brand" aria-label="Flavoro home">
      <span class="brand-mark"><i data-lucide="utensils-crossed"></i></span>
      <span><b>Flavoro</b><small>RESTAURANT</small></span>
    </a>
    <nav class="desktop-nav" aria-label="Primary"><ul>${links}</ul></nav>
    <div class="header-actions">
      <a class="user-link" href="/pages/login.html" aria-label="Account"><i data-lucide="user"></i></a>
      <a class="button button-primary header-cta magnetic" href="/pages/reservations.html"><i data-lucide="calendar-days"></i><span>Book a Table</span></a>
      <button class="menu-toggle" type="button" aria-label="Open menu" data-menu-toggle><i data-lucide="menu"></i></button>
    </div>
    <div class="mobile-menu" data-mobile-menu>
      <div class="mobile-menu-head"><span>Explore Flavoro</span><button data-menu-close aria-label="Close menu"><i data-lucide="x"></i></button></div>
      <div class="mobile-links">${navItems.map(item => `<a href="${item.href}">${item.label}<i data-lucide="arrow-up-right"></i></a>`).join('')}</div>
      <a class="button button-primary" href="/pages/reservations.html">Reserve your table</a>
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
    <div class="footer-bottom"><span>©2026 Flavoro</span><span>All rights reserved</span></div>
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
