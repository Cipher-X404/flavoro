# Flavoro — work summary

Branch: `arena/8646712d-flavoro` · latest commit `7e463d3`

## 1. Admin can upload and publish a blog post

**Journal Studio** is a new panel in the admin dashboard (`book-open` in the dock,
beside Menu Studio).

- **Create** a dispatch: title, strand, volume, standfirst, byline, role and date.
- **Upload** a lead photograph by file picker *or* drag-and-drop. Large images
  are downsampled to 1600 px and re-encoded in a canvas before they are stored,
  so a normal phone photo never hits the browser's storage quota. Tested with a
  207 KB source that came back as a 276 KB data URL at 1672 × 941.
- **Write** the opening paragraphs plus any number of chapters, each with a
  heading. Chapters become anchors in the article's "In this dispatch" list.
- **Add** a pull quote, a closing note, and a small table of facts for the sidebar.
- **Publish / unpublish / duplicate / delete / edit** from the drawer. Drafts and
  published pieces are separate lists, so unpublishing loses no words.

Published posts are addressed through one shared shell,
`/pages/dispatch.html?slug=<slug>`, because the content lives in the browser
rather than in a file written at build time. They appear on the blog index
ahead of the eight shipped pieces, get their own reading time and word count,
and render in the same layout as the seeded dispatches.

Storage lives under its own namespaced key (`flavoro.data.v1.journalPosts`),
deliberately outside the seeded snapshot, so the shipped issue can never be
clobbered by an edit.

## 2. Why the site felt dull and lagged — root causes

I profiled rather than guessed; the first two hypotheses were wrong.

| What was actually wrong | Fix | Measured |
|---|---|---|
| 11 CSS `blur()` filters painting every scroll frame | Replaced with pre-rendered gradients | index p95 **33.3 → 16.8 ms** |
| The hero film was **15.6 MB** and blocked first paint | Re-encoded (2.9 MB / 1.2 MB), 55 KB poster, idle-time load | ~80 % less media |
| `will-change` on every ancestor of every lanyard badge | Removed the hints | about p95 **33.4 → 16.8 ms** |
| Ember glow was a 9 px `box-shadow` re-rasterised per frame | Radial gradient, painted once; 9 embers → 6 | part of the above |
| Ribbon marquee re-laid out its doubled content each frame | One layer hint, on one element | part of the above |
| Ambient loops animated forever, on and off screen | IntersectionObserver pauses them when their section leaves | off-screen animation → **0** |
| Custom cursor ran `mix-blend-mode` per mousemove; listeners re-bound per link | One delegated passive handler, no blend | fewer main-thread tasks |
| Header wrote on every scroll frame | rAF-coalesced, writes only on state flip | — |

Every page now measures **0 blur filters** and **p95 16.8 ms** except `about.html`,
which is the longest page (8,700 px) and lands between 33 and 50 ms during
heavy reveal scrolling — down from 66 with the original code.

## 3. Road map gallery (Contact page)

The supplied React `metro-map-gallery` was **rebuilt for this stack** — Vite +
vanilla ESM + GSAP, no React, no shadcn, no Tailwind, no TypeScript.

It replaces the old walking-route SVG and numbered route list on the contact page.

- The line is a **road**, not a railway: a smooth catmull-rom ring with a casing,
  a surface and a dashed ember centreline.
- Seven **notable junctions** hang off it — Octavia & Market, Van Ness & Fell,
  Franklin & Oak, Fell & Gough, Hayes & Laguna, Oak & Divisadero, Linden & Hayes.
- The **business is the brightest thing on the sheet**: a lit core with a radial
  ember halo, a slow pulse ring, and the street number inside it.
- Hovering or focusing a junction in the drawing highlights its row in the legend
  and dims the others, so one approach can be read at a time.
- On phones the SVG annotation is hidden (it scales with the viewBox and becomes
  illegible) and an HTML caption names the house; the legend carries the stops.

API: `renderRoadMapGallery()` → markup, `initRoadMapGallery()` → teardown, wired
from `main.js` like the team lanyard rail.

## 4. Other polish

- **Share cards.** Every page had `og:*` tags with relative image URLs and no
  Twitter card, so shared links rendered as a grey box. Now: canonical URL,
  absolute `og:image`, dimensions, `summary_large_image`.
- **Structured data.** `schema.org/Restaurant` with opening hours derived from the
  same `WINDOWS` the reservations engine reads, so a rich result cannot disagree
  with the booking widget. Journal pages add `Article` and `BreadcrumbList`.
- **App icons.** Rendered PNGs (180/192/512) from the flame mark plus a web
  manifest with shortcuts, so the site can be installed properly.
- **404.** Was a cartoon dog chef captioned "Oooops!" over a full-bleed
  illustration — the least on-brand page on the site. Now an editorial
  "off the menu" page in the Journal's language, with four real doors out.
- **Gallery.** Six of twelve corridor planes pointed at `cdn.21st.dev`, which no
  longer serves them: half the gallery was empty black rectangles. Replaced with
  local photographs and switched to lazy loading.
- **Studio cover bugs.** "Volume VOL. IX", literal `undefined` on studio covers,
  and copy that hard-coded "eight dispatches" while the issue grew.

## Verification

- `npm run build` — clean, no warnings.
- `npm run verify:reservations` — **34/34 passed**.
- Nine-page sweep: no broken images, no `undefined` text, no horizontal overflow,
  no page errors.
- Studio flow tested end to end: publish → index lead → article page with chapters,
  contents and sidebar; plus edit, duplicate, unpublish, delete and image upload.
