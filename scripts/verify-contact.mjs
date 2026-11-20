/**
 * Contact-page data checks.
 *
 * The schedule, the live service state and the concierge validation are pure
 * functions of a `Date`, so they are verified here rather than through the DOM.
 * Run with `npm run verify:contact`.
 */

import { getServiceStatus, getWeek, getAxisTicks, formatClock, getLocalMoment, HOUSE_NOTES, SWITCHBOARD } from '../src/data/contact.js';

let fails = 0;
const ok = (l, c, x = '') => { if (c) console.log('  ✓', l); else { fails++; console.log('  ✗', l, x); } };

// Conversion sanity
ok('formatClock 1350 → 10:30 PM', formatClock(1350) === '10:30 PM', formatClock(1350));
ok('formatClock 1440 → midnight', formatClock(1440) === 'midnight', formatClock(1440));
ok('formatClock 690 → 11:30 AM', formatClock(690) === '11:30 AM', formatClock(690));

// Tuesday 19:00 Pacific → closed
const tue = new Date('2026-11-17T19:00:00-08:00');
const s1 = getServiceStatus(tue);
ok('Tuesday 7pm is closed', s1.open === false, JSON.stringify(s1.short));
ok('…and names Wednesday as next', s1.next?.dayName === 'Wednesday', JSON.stringify(s1.next));
ok('…detail reads like a sentence', /doors open tomorrow at 4:30 PM/.test(s1.detail), s1.detail);

// Wednesday 19:00 → open, kitchen + bar
const wed = new Date('2026-11-18T19:00:00-08:00');
const s2 = getServiceStatus(wed);
ok('Wednesday 7pm is open', s2.open && s2.kitchen && s2.bar, JSON.stringify(s2.short));
ok('…closes at midnight (bar latest)', s2.closesAt === 'midnight', s2.closesAt);
ok('…clock is house time 19:00', s2.moment.clock === '19:00', s2.moment.clock);

// Sunday 13:00 → brunch only
const sun = new Date('2026-11-22T13:00:00-08:00');
const s3 = getServiceStatus(sun);
ok('Sunday 1pm serves the long table', s3.open && s3.kitchen, JSON.stringify(s3.short));

// Monday 19:00 → closed, next Wednesday
const mon = new Date('2026-11-16T19:00:00-08:00');
const s4 = getServiceStatus(mon);
ok('Monday closed, next is Wednesday', !s4.open && s4.next.dayName === 'Wednesday', JSON.stringify(s4.next));

// Week strip
const week = getWeek(wed);
ok('week has 7 rows, Monday first', week.length === 7 && week[0].name === 'Monday', week.map(d => d.short).join(','));
ok('Mon + Tue are closed', week.filter(d => d.closed).length === 2);
ok('Wednesday flagged as today', week.find(d => d.isToday)?.day === 3);
const blocks = week.find(d => d.day === 3).blocks;
ok('today has 2 blocks (bar + dinner)', blocks.length === 2, String(blocks.length));
ok('blocks are within 0–100%', blocks.every(b => b.left >= 0 && b.left + b.width <= 100.01), JSON.stringify(blocks));
ok('ticks are ordered 11 → 01', getAxisTicks().length === 6 && getAxisTicks()[0].label === '11AM' && getAxisTicks().at(-1).label === '1AM', JSON.stringify(getAxisTicks().map(t => t.label)));

// Content sanity
ok('six switchboard lines', SWITCHBOARD.length === 6);
ok('each line has phone + email + topic', SWITCHBOARD.every(l => l.phoneHref.startsWith('tel:') && l.email.includes('@') && l.topic));
ok('eight house notes', HOUSE_NOTES.length === 8);

// Inquiry validation + persistence
const { validateInquiry, saveInquiry, listInquiries, subscribeToDispatch, isSubscribed } = await import('../src/data/inquiries.js');
const bad = validateInquiry({ name: 'A', email: 'nope', message: 'short' });
ok('invalid inquiry reports name/email/message', !bad.ok && bad.errors.name && bad.errors.email && bad.errors.message, JSON.stringify(bad.errors));
const good = { name: 'Elena Test', email: 'elena@example.com', phone: '+1 415 555 0134', message: 'Celiac guest joining on Friday, needs the tasting menu.', topic: 'table-assistance', partySize: '3-6' };
ok('valid inquiry passes', validateInquiry(good).ok);
const past = validateInquiry({ ...good, date: '2020-01-01' });
ok('past date is rejected', !past.ok && !!past.errors.date, JSON.stringify(past.errors));
const record = saveInquiry(good);
ok('inquiry saved with reference', /^FQ-/.test(record.reference), record.reference);
ok('inquiry is retrievable', listInquiries().length === 1 && listInquiries()[0].reference === record.reference);
ok('dispatch subscribe works once', subscribeToDispatch('a@b.co').already === false && subscribeToDispatch('a@b.co').already === true && isSubscribed('a@b.co'));

console.log(fails ? `\n${fails} failed` : '\nAll data checks passed');
process.exit(fails ? 1 : 0);
