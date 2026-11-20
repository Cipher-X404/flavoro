# Contact & Journal — design notes and operating manual

Two pages were rebuilt around a single idea: **a restaurant website should behave
like the restaurant, not like a form.** The contact page is an arrival. The
journal is a bookcase. Both keep the house style — Cormorant display type,
paper and ink surfaces, one ember accent, hairlines instead of boxes — and both
ship a plain, working fallback underneath the theatre.

Nothing here talks to a network. Inquiries and letter subscriptions are stored in
the browser, exactly like reservations (see `docs/reservations.md`).

---

## 1. Contact — “The Front Door”

### Why this shape

The generic contact page (hero, address block, three cards, a map iframe, a form)
answers “where are you” and nothing else. This one is organised the way a guest
actually experiences the restaurant:

| # | Section | Class | What it does |
| --- | --- | --- | --- |
| — | The door | `.ct-hero` | Live service state, house clock, phone/email, the two ways in |
| 01 | The walk in | `.ct-arrive` | The last 200 metres, drawn as a plan that renders as you scroll |
| 02 | The fire schedule | `.ct-hours` | The week as a strip of service blocks, today marked, house time |
| 03 | The switchboard | `.ct-switch` | Six real lines; one call card that follows the selected line |
| 04 | The concierge desk | `.apple-concierge-section` | **Unchanged markup.** Now actually validates, stores and confirms |
| — | House notes | `.ct-notes` | Eight things guests ask before arriving, as a ledger |
| — | Closing | `.ct-close` | The house line and the last invitation |

Surface rhythm: ink → paper → ink → cream → light desk → ink → ink. The colour
change is the divider; there are no borders between bands.

### Live service state

`getServiceStatus()` in `src/data/contact.js` resolves the **house** clock, not
the visitor's:

```js
import { getServiceStatus } from './data/contact.js'
const status = getServiceStatus()
// { open, kitchen, bar, moment: { clock, clock12, weekday, dayName }, short, detail, next }
```

- Time zone: `HOUSE.timeZone` (`America/Los_Angeles`), read through
  `Intl.DateTimeFormat`; the browser clock is only a fallback.
- `short` is the pill copy — `"Kitchen until 10:30 PM"`, `"Opens Wed 5:30 PM"`.
- `detail` is a sentence — `"Dinner is served until 10:30 PM, the bar until
  midnight. Walk-ins at the bar, always."`
- The page repaints every 30 seconds and whenever the tab becomes visible.

The published hours live in `WINDOWS` (per weekday, minutes after midnight).
They are the *marketing* hours guests read on the home page (dinner Wednesday to
Sunday); the reservation engine keeps its own `openingHours` in
`src/data/seed.js`. Change both if the house changes its service days.

### The switchboard

Six entries in `SWITCHBOARD`, each with a name, a person, hours, three bullets,
a phone number, an email and the concierge `topic` it maps to. The page renders
them as a `role="tablist"`; selecting one repaints `.ct-card` (a tabpanel) and
moves focus with the arrow keys, Home and End. “Rather write it down?” clicks the
matching topic pill in the unmoved concierge section, scrolls to the form and
focuses the first field — the two halves of the page are wired together.

### The concierge desk actually works

The markup was left exactly as it was; all behaviour lives in
`src/contact-page.js` + `src/data/inquiries.js`:

1. **Validate** — `validateInquiry()` returns field-keyed errors. The page marks
   the offending inputs with `aria-invalid`, adds a `.ct-form-error` summary to
   the form footer and focuses the first problem. No native browser bubbles.
2. **Store** — `saveInquiry()` writes a record to
   `flavoro.data.v1.inquiries` (its own namespace, never touched by the demo
   reset) with a guest-facing reference such as `FQ-4K2M`.
3. **Notify** — an admin notification (`type: 'inquiry'`) is created for the
   dashboard. A failed notification never loses the inquiry.
4. **Confirm** — the existing toast is re-used: its title becomes
   `Request logged · FQ-4K2M`, its body names the desk and the reply window, and
   the submit button reads `Logged · FQ-4K2M` before reverting.
5. **Remember** — a returning guest's name, email and phone are prefilled for 45
   days from their last inquiry.

```js
import { saveInquiry, listInquiries, lastInquiry } from './data/inquiries.js'
saveInquiry({ name, email, phone, message, topic, partySize, date, window })
```

---

## 2. Journal — “The Reading Room”

### Why this shape

`DESIGN-apple.md` describes a photography-first index: full-bleed tiles,
alternating light and dark canvases, display type with negative tracking, one
accent, one shadow reserved for the artifact. That discipline is respected
exactly — and then one idea Apple would never ship is bolted onto it: **the index
is a bookcase.**

| # | Section | Class | What it does |
| --- | --- | --- | --- |
| — | Cover | `.jr-hero` | Full-bleed photograph, the issue line, dispatch/minutes/date |
| 01 | The reading room | `.jr-room` | Eight cloth spines on a shelf; the book above opens to one |
| 02 | The whole issue | `.jr-index` | Chronological list of every dispatch, no interaction required |
| 03 | The letter | `.jr-letter` | One working signup, and a quiet way back to the tables |

### The shelf

- Spines are grouped by section (Hearth & Technique, Hospitality & Rituals,
  Terroir & Producers, Living Cellar) and numbered within it, the way a shelf
  actually is. The legend under the shelf names the four cloth colours.
- The books are `role="tab"` buttons with roving `tabindex`; the spread is the
  `tabpanel`. Left/Right/Up/Down step through them, Home/End jump to the ends,
  and the spread itself is focusable so the arrows work from there too.
- Selecting a spine turns the page: the photograph cross-fades, the right page
  wipes open from the gutter with GSAP, and the text settles in behind it.
  Reduced-motion users get an instant swap.
- The shelf scrolls horizontally on narrow screens and only auto-scrolls when
  the chosen book is actually out of view.

### One source of truth for the writing

Article copy stays in `articles` in `src/pages.js`. `journalIssue()` derives the
index from it (title, category, volume, reading time, image, caption) and
`journalShelf()` re-orders it by section. The page serialises the shelf into a
`<script type="application/json" class="jr-issue-data">` block, which
`src/journal-page.js` reads — no duplicated article metadata in JS, and no
second bundle of page templates.

Adding a dispatch: write the article in `articles`, add its slug to
`JOURNAL_ORDER`, and the shelf, legend, counters and index all follow.

### The letter

`subscribeToDispatch()` validates the address, stores it once in
`flavoro.data.v1.dispatch`, and the form reports success or “already on the
list” in place. No network call, no fake `onsubmit` handler.

---

## 3. Files

| Concern | Module |
| --- | --- |
| House facts, hours, route, switchboard, notes, status maths | `src/data/contact.js` |
| Inquiries + dispatch subscriptions | `src/data/inquiries.js` |
| Contact behaviour | `src/contact-page.js` |
| Journal behaviour | `src/journal-page.js` |
| Markup | `src/pages.js` (`contact()`, `blog()`, `journalIssue()`) |
| Styles | `src/style.css` — sections “CONTACT — The Front Door” and “JOURNAL — The Reading Room” |

`src/editorial-features.js` no longer owns either page: it keeps the shared
Apple-style reveal choreography for About and the concierge desk. The old
`.journal-*` and `.contact-*` rules remain in the stylesheet but are unused.

## 4. Known limits

- Inquiries and subscriptions are per-browser, like everything else in the
  prototype. Clearing site data clears them.
- The reference (`FQ-…`) is generated locally and is not a server-side lookup
  key; there is no “check my inquiry” screen yet.
- The switchboard numbers are fictional extensions of the house line.
- The reading-room spread animates with `clip-path`; browsers older than Safari
  14 / Chrome 88 simply swap instantly.
