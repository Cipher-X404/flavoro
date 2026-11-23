/**
 * The published front-of-house facts: where the door is, when the fire is lit,
 * who answers which line, and what guests should know before they arrive.
 *
 * Everything here is pure data plus pure functions of `Date`, so the schedule
 * can be reasoned about (and tested) outside the browser. The page renders the
 * same numbers the reservation engine uses for evening service, but the hours
 * below are the *published* ones — the marketing schedule guests read on the
 * home page: dinner Wednesday to Sunday, the bar half an hour ahead of it.
 */

export const HOUSE = {
  name: 'Flavoro',
  street: '742 Emberwood Lane',
  city: 'San Francisco, CA 94102',
  cross: 'Franklin & Fell Street',
  phone: '+1 (415) 890-2341',
  phoneHref: 'tel:+14158902341',
  email: 'hello@flavorohearth.com',
  mailHref: 'mailto:hello@flavorohearth.com',
  timeZone: 'America/Los_Angeles',
  tzLabel: 'Pacific time',
  mapsHref:
    'https://maps.google.com/?q=742+Emberwood+Lane,+San+Francisco,+CA+94102',
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

const at = (hours, minutes) => hours * 60 + minutes

/** The fire schedule. Close times are minutes after midnight of that day. */
const WINDOWS = {
  0: [
    { kind: 'brunch', label: 'Long table', open: at(11, 30), close: at(15, 30) },
    { kind: 'bar', label: 'Bar', open: at(16, 30), close: at(24, 0) },
    { kind: 'dinner', label: 'Dinner', open: at(17, 30), close: at(22, 30) },
  ],
  3: [
    { kind: 'bar', label: 'Bar', open: at(16, 30), close: at(24, 0) },
    { kind: 'dinner', label: 'Dinner', open: at(17, 30), close: at(22, 30) },
  ],
  4: [
    { kind: 'bar', label: 'Bar', open: at(16, 30), close: at(24, 0) },
    { kind: 'dinner', label: 'Dinner', open: at(17, 30), close: at(22, 30) },
  ],
  5: [
    { kind: 'bar', label: 'Bar', open: at(16, 30), close: at(24, 0) },
    { kind: 'dinner', label: 'Dinner', open: at(17, 30), close: at(22, 30) },
  ],
  6: [
    { kind: 'bar', label: 'Bar', open: at(16, 30), close: at(24, 0) },
    { kind: 'dinner', label: 'Dinner', open: at(17, 30), close: at(22, 30) },
  ],
}

/** The time axis drawn on the week strip: 11 AM through 1 AM. */
export const AXIS = { start: at(11, 0), end: at(25, 0) }

export function windowsFor(day) {
  return WINDOWS[day] || []
}

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Opening hours in schema.org shape, derived from the same WINDOWS the
 * reservations engine reads — so a rich result can never drift from the
 * booking widget. Minutes are converted to 24-hour `HH:MM`.
 */
export function getOpeningHours() {
  const hhmm = (minutes) => {
    const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440
    return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
  }
  return SCHEMA_DAYS.flatMap((name, day) =>
    windowsFor(day).map((window) => ({
      days: [name],
      opens: hhmm(window.open),
      closes: hhmm(window.close),
    })),
  )
}

export function isServiceDay(day) {
  return windowsFor(day).length > 0
}

/** `1350` → `"10:30 PM"`, `1440` → `"midnight"`. */
export function formatClock(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440
  if (wrapped === 0) return 'midnight'
  const hours24 = Math.floor(wrapped / 60)
  const mins = wrapped % 60
  const suffix = hours24 < 12 ? 'AM' : 'PM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`
}

/** `"19:42"` — the house clock, 24-hour, no suffix. */
export function formatHouseClock(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
}

/**
 * The wall clock *inside the restaurant*, not the visitor's. Falls back to the
 * browser's own clock if Intl cannot resolve the zone.
 */
export function getLocalMoment(now = new Date(), timeZone = HOUSE.timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
    const value = (type) => parts.find((part) => part.type === type)?.value
    const weekday = DAY_INDEX[value('weekday')]
    const hours = Number(value('hour'))
    const minutes = Number(value('minute'))
    if (weekday === undefined || !Number.isFinite(hours) || !Number.isFinite(minutes)) {
      throw new Error('unreadable')
    }
    return {
      weekday,
      dayName: DAY_NAMES[weekday],
      minutes: hours * 60 + minutes,
      clock: formatHouseClock(hours * 60 + minutes),
      clock12: formatClock(hours * 60 + minutes),
    }
  } catch {
    const weekday = now.getDay()
    const minutes = now.getHours() * 60 + now.getMinutes()
    return {
      weekday,
      dayName: DAY_NAMES[weekday],
      minutes,
      clock: formatHouseClock(minutes),
      clock12: formatClock(minutes),
    }
  }
}

function nextOpeningFrom(moment) {
  for (let step = 0; step <= 7; step += 1) {
    const day = (moment.weekday + step) % 7
    const candidates = windowsFor(day)
      .filter((window) => (step === 0 ? window.open > moment.minutes : true))
      .sort((a, b) => a.open - b.open)
    if (!candidates.length) continue
    return {
      day,
      dayName: DAY_NAMES[day],
      dayShort: DAY_SHORT[day],
      minutes: candidates[0].open,
      time: formatClock(candidates[0].open),
      label: candidates[0].label,
      step,
      relative:
        step === 0 ? 'tonight' : step === 1 ? 'tomorrow' : `on ${DAY_NAMES[day]}`,
    }
  }
  return null
}

/**
 * What is happening right now, in house time.
 * `open` is true when any line is serving; `kitchen` and `bar` break it down.
 */
export function getServiceStatus(now = new Date()) {
  const moment = getLocalMoment(now)
  const today = windowsFor(moment.weekday)
  const active = today.filter(
    (window) => moment.minutes >= window.open && moment.minutes < window.close,
  )
  const dinner = today.find((window) => window.kind === 'dinner' || window.kind === 'brunch')
  const bar = active.find((window) => window.kind === 'bar')

  if (active.length) {
    const closes = Math.max(...active.map((window) => window.close))
    const kitchen = active.find(
      (window) => window.kind === 'dinner' || window.kind === 'brunch',
    )
    return {
      open: true,
      kitchen: Boolean(kitchen),
      bar: Boolean(bar),
      moment,
      label: 'Open now',
      short: kitchen
        ? `Kitchen until ${formatClock(kitchen.close)}`
        : `Bar until ${formatClock(closes)}`,
      headline: kitchen ? 'The kitchen is open.' : 'The bar is open.',
      detail: kitchen
        ? `${kitchen.label === 'Dinner' ? 'Dinner is served until' : `The ${kitchen.label.toLowerCase()} runs until`} ${formatClock(kitchen.close)}${
            bar ? `, the bar until ${formatClock(bar.close)}` : ''
          }. ${bar ? 'Walk-ins at the bar, always.' : 'Walk-ins as the room allows.'}`
        : `The bar is pouring until ${formatClock(closes)}. The kitchen takes its first order at ${formatClock(dinner.open)}.`,
      closesAt: formatClock(closes),
      next: null,
    }
  }

  const next = nextOpeningFrom(moment)
  return {
    open: false,
    kitchen: false,
    bar: false,
    moment,
    label: 'Kitchen dark',
    short: next ? `Opens ${next.step === 0 ? 'today' : next.dayShort} ${next.time}` : 'Closed',
    headline: 'The fire is resting.',
    detail: next
      ? `The doors open ${next.relative} at ${next.time} for ${next.label.toLowerCase()}.`
      : 'We are closed. Leave a note and we will answer with the next service.',
    closesAt: null,
    next,
  }
}

/**
 * The four lines the home hero prints beside its title, and the label/short
 * pair that rides above it. Same clock, same schedule as `getServiceStatus`,
 * so the front page and the contact page can never disagree.
 */
const nextOpeningOf = (moment, kinds) => {
  for (let step = 0; step < 8; step += 1) {
    const day = (moment.weekday + step) % 7
    for (const window of windowsFor(day)) {
      if (!kinds.includes(window.kind)) continue
      if (step === 0 && window.open <= moment.minutes) continue
      return { step, time: formatClock(window.open), label: DAY_SHORT[day] }
    }
  }
  return null
}

const rowFor = (active, kinds, next) => {
  const live = active.find((window) => kinds.includes(window.kind))
  if (live) return `Until ${formatClock(live.close)}`
  if (!next) return 'Closed'
  return next.step === 0 ? `Opens ${next.time}` : `Opens ${next.label} ${next.time}`
}

export function getHeroFacts(now = new Date()) {
  const status = getServiceStatus(now)
  const { moment } = status
  const active = windowsFor(moment.weekday).filter(
    (window) => moment.minutes >= window.open && moment.minutes < window.close,
  )
  return {
    open: status.open,
    label: status.label,
    short: status.short,
    day: moment.dayName,
    fire: status.open ? 'Lit' : 'Resting',
    bar: rowFor(active, ['bar'], nextOpeningOf(moment, ['bar'])),
    kitchen: rowFor(active, ['dinner', 'brunch'], nextOpeningOf(moment, ['dinner', 'brunch'])),
  }
}

/** One row per weekday, Monday first, with blocks positioned on the axis. */
export function getWeek(now = new Date()) {
  const { weekday } = getLocalMoment(now)
  const span = AXIS.end - AXIS.start
  const position = (minutes) =>
    Math.min(100, Math.max(0, ((minutes - AXIS.start) / span) * 100))
  return [1, 2, 3, 4, 5, 6, 0].map((day) => {
    const windows = windowsFor(day)
    return {
      day,
      name: DAY_NAMES[day],
      short: DAY_SHORT[day],
      isToday: day === weekday,
      closed: windows.length === 0,
      blocks: windows.map((window) => ({
        kind: window.kind,
        label: window.label,
        left: position(window.open),
        width: Math.max(1.5, position(window.close) - position(window.open)),
      })),
      summary: describeDay(day),
    }
  })
}

export function describeDay(day) {
  const windows = windowsFor(day)
  if (!windows.length) return 'Kitchen dark'
  return windows
    .map((window) =>
      window.kind === 'bar'
        ? `Bar until ${formatClock(window.close)}`
        : `${window.label} ${formatClock(window.open)} – ${formatClock(window.close)}`,
    )
    .join(' · ')
}

/** The axis labels printed above the week strip. */
export function getAxisTicks() {
  const ticks = []
  const label = (minutes) => formatClock(minutes).replace(':00', '').replace(' ', '')
  for (let minutes = AXIS.start; minutes < AXIS.end; minutes += 180) {
    ticks.push({
      minutes,
      label: label(minutes),
      left: ((minutes - AXIS.start) / (AXIS.end - AXIS.start)) * 100,
    })
  }
  // Always close the axis so the last hour is never unlabelled.
  ticks.push({ minutes: AXIS.end, label: label(AXIS.end), left: 100 })
  return ticks
}

export const ROUTE = [
  {
    index: '01',
    title: 'Step off at Van Ness',
    copy: 'Civic Center or Van Ness Muni, then eight minutes on foot along Fell. Leave the hill behind you.',
    meta: '8 min walk',
  },
  {
    index: '02',
    title: 'Follow the eucalyptus',
    copy: 'The row of blue gums on the south side is the last landmark before the block turns brick and quiet.',
    meta: 'Fell & Franklin',
  },
  {
    index: '03',
    title: 'Find the ember lamp',
    copy: 'A single amber lantern hangs above the door at 742. If it is lit, the ovens are already burning.',
    meta: 'Look up',
  },
  {
    index: '04',
    title: 'Give your name',
    copy: 'The host stand is three steps inside. Nothing else is required of you for the rest of the evening.',
    meta: 'That’s it',
  },
]

export const ROUTE_CHIPS = [
  'Complimentary valet from 5 PM',
  'Bike racks on Oak Street',
  'Step-free entrance on Franklin',
  'EV charging on request',
]

export const SWITCHBOARD = [
  {
    id: 'front',
    line: '01',
    name: 'Front of house',
    meta: 'Tonight, table, running late',
    person: 'Elena Rostova',
    role: 'Director of Hospitality',
    copy: 'The line to call when the evening changes shape — you are late, you need a chair added, or someone at the table cannot eat what we planned.',
    bullets: [
      'Same-day tables and seating changes',
      'Running late, or arriving early',
      'Allergies discovered on the night',
    ],
    hours: 'Answers from 3 PM on service days',
    phone: '+1 (415) 890-2341',
    phoneHref: 'tel:+14158902341',
    email: 'reservations@flavorohearth.com',
    topic: 'table-assistance',
  },
  {
    id: 'private',
    line: '02',
    name: 'Private salons',
    meta: 'Terrace, buyouts, feasts',
    person: 'Marcus Feld',
    role: 'Events Director',
    copy: 'The Secret Garden Terrace seats sixteen. The whole room seats seventy. Both come with a menu written for the night rather than taken from a list.',
    bullets: [
      'Terrace dinners for 8 – 16 guests',
      'Full restaurant buyouts to 70',
      'Bespoke wood-fired feasting menus',
    ],
    hours: 'Monday to Friday, 10 AM – 6 PM',
    phone: '+1 (415) 890-2342',
    phoneHref: 'tel:+14158902342',
    email: 'events@flavorohearth.com',
    topic: 'private-event',
  },
  {
    id: 'cellar',
    line: '03',
    name: 'Cellar & sommelier',
    meta: 'Allocations, pairings, corkage',
    person: 'Julian Rossi',
    role: 'Master Sommelier',
    copy: 'For bottles we keep behind the wall, for a flight built around your table, or for the honest answer about whether your bottle needs us at all.',
    bullets: [
      'Rare and library allocations',
      'Flights paired course by course',
      'Corkage questions, answered plainly',
    ],
    hours: 'Wednesday to Sunday, from noon',
    phone: '+1 (415) 890-2343',
    phoneHref: 'tel:+14158902343',
    email: 'cellar@flavorohearth.com',
    topic: 'cellar-tasting',
  },
  {
    id: 'press',
    line: '04',
    name: 'Press & editorial',
    meta: 'Story requests, imagery',
    person: 'Sofia Marchetti',
    role: 'Communications',
    copy: 'Photography from the room, interviews with the kitchen, or the small facts a fact-checker needs at short notice.',
    bullets: [
      'High-resolution image requests',
      'Interview and visit scheduling',
      'Fact-checking and credits',
    ],
    hours: 'Monday to Thursday, 9 AM – 5 PM',
    phone: '+1 (415) 890-2344',
    phoneHref: 'tel:+14158902344',
    email: 'press@flavorohearth.com',
    topic: 'press-editorial',
  },
  {
    id: 'access',
    line: '05',
    name: 'Access & dietary',
    meta: 'Step-free, allergies, quiet tables',
    person: 'The kitchen pass',
    role: 'Chef de cuisine & floor lead',
    copy: 'Call before you book and we will build the evening around you: the step-free route in, a table away from the room’s loudest corner, a menu without what you cannot have.',
    bullets: [
      'Step-free arrival and seating',
      'Celiac, nut, dairy and low-FODMAP menus',
      'Low-light or quiet-table requests',
    ],
    hours: 'Answered by the pass, daily from 2 PM',
    phone: '+1 (415) 890-2345',
    phoneHref: 'tel:+14158902345',
    email: 'kitchen@flavorohearth.com',
    topic: 'table-assistance',
  },
  {
    id: 'gifts',
    line: '06',
    name: 'Gifts & keepsakes',
    meta: 'Vouchers, menus, florals',
    person: 'The host stand',
    role: 'Front of house',
    copy: 'Dinner given as a gift, a menu card worth keeping, or flowers waiting at the table when someone sits down.',
    bullets: [
      'Gift vouchers, posted or collected',
      'Embossed keepsake menus',
      'Seasonal florals at the table',
    ],
    hours: 'Daily, 11 AM – 9 PM',
    phone: '+1 (415) 890-2346',
    phoneHref: 'tel:+14158902346',
    email: 'hello@flavorohearth.com',
    topic: 'press-editorial',
  },
]

export const HOUSE_NOTES = [
  {
    label: 'Dress',
    copy: 'Smart casual. A jacket is never wrong; trainers are never a problem.',
  },
  {
    label: 'Little ones',
    copy: 'Welcome at every service. There is a smaller menu — semolina pasta with butter, mostly — and we will not hurry you.',
  },
  {
    label: 'Corkage',
    copy: '$45 a bottle, two bottles maximum. Waived entirely on any bottle bought from our cellar that evening.',
  },
  {
    label: 'Allergies',
    copy: 'Tell us 24 hours ahead and the kitchen rewrites the course rather than removes it.',
  },
  {
    label: 'Timing',
    copy: 'We hold a table for 15 minutes. Call and we will hold it for as long as the bridge takes.',
  },
  {
    label: 'Dogs',
    copy: 'On the terrace, always. There is a water bowl behind the host stand and a cook who will make a fuss.',
  },
  {
    label: 'Photographs',
    copy: 'Take them. Just not of the table beside you — the room is lit for eating, not for flash.',
  },
  {
    label: 'Access',
    copy: 'Step-free from Franklin Street, an accessible restroom on the ground floor, and a lift to the terrace.',
  },
]

/** Inline styles for the week strip, kept out of the template. */
export function blockStyle(block) {
  return `left:${block.left.toFixed(3)}%;width:${block.width.toFixed(3)}%`
}
