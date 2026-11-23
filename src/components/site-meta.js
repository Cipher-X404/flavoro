/* ===========================================================================
   Share & search metadata
   ---------------------------------------------------------------------------
   The site is a static multi-page build, so each page's <head> is written by
   hand. That is how it drifted: titles were duplicated, nothing had a
   canonical URL, and a shared link rendered as a bare grey box. These helpers
   generate the blocks that have to agree with each other — the social card,
   the structured data, and the icon set — from one description of the
   restaurant.

   Structured data follows schema.org/Restaurant. Opening hours are derived
   from the same week the reservations engine uses, so the rich result can
   never disagree with the booking widget.
   ========================================================================== */

import { HOUSE } from '../data/contact.js'

const SITE = 'https://flavorohearth.com'

export const RESTAURANT_ID = `${SITE}/#restaurant`

/** The canonical, absolute URL for a path such as `/pages/menu.html`.
 *  `/index.html` is the same document as `/`, and search engines treat them
 *  as duplicates, so it is normalised here. */
export function canonical(url = '/') {
  const path = (url.startsWith('/') ? url : `/${url}`).replace(/^\/index\.html(?=$|\?|#)/, '/')
  return `${SITE}${path}`
}

/**
 * Social-card block. `image` is a site-absolute path; the og:image is made
 * absolute because most crawlers ignore relative ones.
 */
export function socialMeta({
  title,
  description,
  image = '/images/hero-pasta.jpg',
  url = '/',
  type = 'website',
  alt = '',
}) {
  const absoluteImage = `${SITE}${image.startsWith('/') ? image : `/${image}`}`
  return `    <link rel="canonical" href="${canonical(url)}" />
    <meta property="og:site_name" content="Flavoro" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${canonical(url)}" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:image" content="${absoluteImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    ${alt ? `<meta property="og:image:alt" content="${escapeAttr(alt)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${absoluteImage}" />`
}

/** Icons and install metadata. Shared by every page. */
export const iconMeta = `    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />`

/**
 * schema.org/Restaurant. `hours` is a list of {days, opens, closes} already in
 * schema.org day names (e.g. "Wednesday"), so the page controls the mapping.
 */
export function restaurantSchema({ hours = [], url = '/' } = {}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': RESTAURANT_ID,
    name: 'Flavoro',
    description:
      'Live-oak fire, California growers and a dining room built for gathering in Hayes Valley, San Francisco.',
    url: canonical(url),
    image: [`${SITE}/images/hero-pasta.jpg`, `${SITE}/images/hero-film-poster.jpg`],
    servesCuisine: ['Californian', 'Wood-fired', 'Italian'],
    priceRange: '$$$',
    telephone: HOUSE.phone,
    email: HOUSE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: HOUSE.street,
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94102',
      addressCountry: 'US',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 37.7762, longitude: -122.4241 },
    hasMap: HOUSE.mapsHref,
    acceptsReservations: `${SITE}/pages/reservations.html`,
    menu: `${SITE}/pages/menu.html`,
    ...(hours.length
      ? {
          openingHoursSpecification: hours.map(({ days, opens, closes }) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: days,
            opens,
            closes,
          })),
        }
      : {}),
  }
  return jsonLd(data)
}

/** A single journal dispatch, so articles get their own rich result. */
export function articleSchema({ title, description, image, url, datePublished, author, section }) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image ? [`${SITE}${image.startsWith('/') ? image : `/${image}`}`] : undefined,
    url: canonical(url),
    mainEntityOfPage: canonical(url),
    datePublished,
    dateModified: datePublished,
    author: { '@type': 'Person', name: author || 'The Flavoro Journal' },
    publisher: { '@id': RESTAURANT_ID },
    articleSection: section,
    isPartOf: { '@type': 'Periodical', name: 'The Flavoro Journal', publisher: { '@id': RESTAURANT_ID } },
  })
}

/** Breadcrumbs, so search results show the trail rather than a bare URL. */
export function breadcrumbSchema(trail = []) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: canonical(entry.url),
    })),
  })
}

function jsonLd(data) {
  // `undefined` keys are dropped by JSON.stringify, which keeps the payloads
  // above readable without a second pass.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return `    <script type="application/ld+json">${json}</script>`
}

function escapeAttr(value) {
  return String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

export { SITE }
