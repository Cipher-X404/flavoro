# Contact & Journal — design notes and operating manual

Two pages were rebuilt around a single idea: **a restaurant website should behave
like the restaurant, not like a form.** The contact page is an arrival. The
journal is an issue of a magazine. Both keep the house style — Cormorant display
type, paper and ink surfaces, one ember accent, hairlines instead of boxes — and
both ship a plain, working fallback underneath the theatre.

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

## 2. Journal — “The Issue”

### Why this shape

The journal is an **issue**, not a card grid. The reading experience is built
like a printed magazine:

| # | Section | Class | What it does |
| --- | --- | --- | --- |
| — | Cover | `.jrn-cover` | The newest dispatch gets a whole page: full-bleed photograph, title, dek, byline, issue statistics |
| 01 | The issue, in full | `.jrn-index` | A printed contents page — every dispatch as a numbered row with its photograph, one-line summary and extent |
| 02 | Read by subject | `.jrn-strands` | The same eight pieces grouped into four running strands, one open at a time |
| 03 | The desk | `.jrn-desk` | How a dispatch is written, and a way to send one in |
| 04 | The letter | `.jrn-letter` | One working signup, and a quiet way back to the tables |

Every dispatch page (`.art`) then reads as a feature:

| Part | Class | What it does |
| --- | --- | --- |
| The arrival | `.art-hero` | Photograph, category, title, standfirst, and four facts — author, date, reading time, chapters |
| The rail | `.art-rail` | Sticky contents that tracks where the reader is, copy-link, all dispatches |
| The scene | `.art-opening` | A drop-cap lead paragraph and the opening movement |
| The figures | `.art-figure` | Two body photographs per dispatch, each with a caption that names what is in frame |
| The chapters | `.art-chapter` | Five or six subheaded chapters, each with its own argument |
| The quote | `.art-quote` | One pull quote, set as a torn-out line |
| The takeaway | `.art-takeaway` | The practical half of a feature: 4–6 facts a reader can act on |
| The author | `.art-author` | Who wrote it and why they are qualified to |
| Next | `.art-next` + `.art-more` | The next dispatch in the issue, then three more |

### Interaction

- **Filtering** — the four strand buttons filter the contents rows. The rows
  animate in with a short GSAP stagger; with reduced motion they simply appear.
- **Strands** — an accordion that opens one strand at a time. It works as a
  plain disclosure list with JavaScript, and as a fully open list without it.
- **Contents tracking** — an `IntersectionObserver` marks the chapter the
  reader is currently in, with an `aria-current` for assistive technology.
- **Copy link** — writes the current URL to the clipboard and reports success
  in place; no third-party share widget.

### One source of truth for the writing

The writing lives in **`src/data/journal.js`**: eight full features — 9,000
words between them, 1,000–1,400 per dispatch — each with a title, standfirst,
dek, opening paragraphs, five or six chapters, a pull quote, a reading-time
sidebar and a close note. `journalIssue()` in `src/pages.js` derives everything
the index and the dispatch pages need — the category, the volume, the extent,
the word count, the chapter count, and the reading time, which is computed
from the copy at 200 words a minute rather than declared by hand.

Photographs are held to the same rule as the captions. `DISPATCH_PHOTOS` pairs
each image with a caption describing what is actually in the frame, and
`DISPATCH_FIGURES` names the two body photographs each dispatch uses, so no
page repeats its own hero and no picture sits under a caption about something
else.

The index serialises the issue into a
`<script type="application/json" class="jr-issue-data">` block, so
`src/journal-page.js` never duplicates article metadata.

Adding a dispatch: write it in `src/data/journal.js`, add its slug to
`JOURNAL_ORDER`, and the cover, the contents, the strands, the counters and the
"next dispatch" links all follow.

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
| Journal writing | `src/data/journal.js` — eight dispatches (~9,000 words), order and strands |
| Markup | `src/pages.js` (`contact()`, `blog()`, `journalArticle()`, `journalIssue()`) |
| Styles | `src/style.css` — sections “CONTACT — The Front Door”, “JOURNAL — The Dispatch” and “DISPATCH — the article page” |

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
