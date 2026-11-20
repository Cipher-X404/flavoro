# Reservation prototype — architecture & operating notes

Flavoro now has a complete, front-end-only reservation system. A guest can book a
table in six steps (guest or registered), pre-order dishes with quantities, review,
confirm, modify, cancel and repeat a visit. An administrator can manage the ledger,
assign tables, move service and kitchen statuses, configure availability, block
dates or sittings, and reset demo data.

There is **no backend, API, external database or payment provider**. Everything is
persisted in the browser with `localStorage` and JSON serialization.

> **Prototype disclaimer**
> Bookings live only in the browser that created them. Availability cannot be
> shared between devices and two browsers can book the same table. Nothing here is
> authentication-grade security. No email, SMS, push notification or payment is
> actually sent or charged. All notifications and payment states are simulated.

---

## 1. Module map

| Concern | Module |
| --- | --- |
| localStorage adapter (the only file touching storage) | `src/data/storage.js` |
| Repository / collections, seeding, import-export, reset | `src/data/store.js` |
| Seed snapshot & restaurant defaults | `src/data/seed.js` |
| Availability calculations (pure) | `src/data/availability.js` |
| Reservation lifecycle & admin operations | `src/data/reservations.js` |
| Guest / registered / admin identity + customers | `src/data/customers.js` |
| Simulated in-app notifications | `src/data/notifications.js` |
| Date & time helpers | `src/data/datetime.js` |
| Six-step public booking wizard + lookup | `src/reservation-features.js` |
| Reservation status / confirmation page | `src/reservation-confirmation.js` |
| Admin ledger + customer dashboard panels | `src/dashboard-reservations.js` |
| Styles for all of the above | `src/reservations.css` |

UI modules never call `localStorage` directly. They call domain services, which
use the repository. Replacing the repository with an API client later does not
require rebuilding the screens.

---

## 2. Persisted data

All keys use the `flavoro.data.v1.` namespace; a `meta` record stores the schema
version. Existing menu edits from the earlier prototype key
(`flavoro.demo.menu.v1`) are migrated once on first run.

| Collection | Key | Contents |
| --- | --- | --- |
| `restaurantSettings` | `flavoro.data.v1.restaurantSettings` | Opening hours, sitting interval, duration, buffer, lead time, horizon, party limits, auto-confirm, deposit, blocked dates/slots, guest notes |
| `menuItems` | `flavoro.data.v1.menuItems` | Shared menu catalogue used by the menu page, admin Menu Studio and reservation pre-orders |
| `tables` | `flavoro.data.v1.tables` | Name, zone, seats, minimum seats, floor status, bookable flag |
| `customers` | `flavoro.data.v1.customers` | Guest/registered customer records, contact details, notes |
| `reservations` | `flavoro.data.v1.reservations` | Booking records, guest snapshot, schedule, table, statuses, payment state, request id |
| `mealOrders` | `flavoro.data.v1.mealOrders` | Pre-order line items (menu id, name, price, quantity, notes), subtotal, kitchen/order status |
| `reservationHistory` | `flavoro.data.v1.reservationHistory` | Immutable audit entries for create/update/cancel/status/table/payment actions |
| `notifications` | `flavoro.data.v1.notifications` | In-app messages with audience (`admin` / `customer` / `guest`), read state, simulated flag |
| `payments` | `flavoro.data.v1.payments` | Simulated deposit records (`simulated: true`, “no charge” note) |

IDs are generated with a timestamp + cryptographic random suffix. Every record
carries ISO `createdAt` / `updatedAt` timestamps. Bookings also carry a readable
reference such as `FLV-7K2M9Q`.

### Seeding

`store.ensureSeeded()` writes a coherent demo snapshot once:

* Four seating zones (`main`, `hearth`, `terrace`, `private`) and ten tables.
* Dinner service Tuesday–Sunday (Monday closed); Friday/Saturday extend to 23:00.
* Three customers and four reservations (three upcoming, one completed) with meal
  orders, history and notifications. Seed dates are relative to “today”, so the
  demo always has upcoming bookings.
* Seeded records are flagged `seeded: true` so the admin can delete only demo data.

Useful demo tools in **Admin → Reservations → Availability → Prototype controls**:
export JSON, import JSON, delete demo records, reset the demo snapshot, or clear
all local reservation data. Resetting or clearing preserves `menuItems`, because
the catalogue is edited in Menu Studio and only borrowed by the reservation flow.
Deleting demo records removes only seeded bookings and their meal orders, history,
notifications and simulated payments. A real booking is kept even when it reuses a
seeded customer record, including that booking's notifications and payment state.
Hard-deleting one test booking also clears its in-app notifications and payment,
while the deletion itself remains in the local history log.

---

## 3. Roles (simulated)

The existing browser-only auth (`src/local-auth.js`) is reused; no new auth system
was introduced.

| Role | How it is represented | Capabilities |
| --- | --- | --- |
| **Guest** | No session. A customer record is created on first booking. | Book, look up by reference + email, modify, cancel, repeat |
| **Registered customer** | `local-auth` user session + local profile email | Everything a guest can do, plus bookings appear in the guest dashboard and notifications drawer |
| **Administrator** | `local-auth` admin session (or the existing `?preview=true` demo mode) | Full ledger, table assignment, statuses, kitchen, simulated payments, availability configuration, data tools |

A booking is linked to a customer by email. Guests are promoted to “registered”
when they later sign in with that email; they are never demoted automatically.
`dashboard-reservations.js` and `customers.js` treat role checks as convenience
gates only — they are not security boundaries.

---

## 4. Six-step booking flow

1. **Party & date** — party size, seating zone (with party-range validation),
   a 14-day availability strip plus a native date picker up to the booking horizon.
   Closed days, blocked dates, full dates and dates outside the horizon are disabled
   with a reason.
2. **Sitting time** — generated sitting times for the chosen date with live table
   counts. Unavailable sittings show the reason (blocked, too soon, fully booked).
3. **Pre-order** — menu tabs by daypart, multiple dishes, quantity steppers,
   per-dish kitchen notes, running tray with subtotal. Pre-ordering is optional.
4. **Your details** — guest or registered booking, contact fields, occasion,
   dietary needs, notes. Registered booking is only selectable with a real local
   session.
5. **Review** — re-checks availability at render time, shows the suggested table,
   menu, totals, simulated payment state, notification/payment disclaimers and
   cancellation policy. Confirming is idempotent (see below).
6. **Confirmation** — booking reference, status, schedule, table, kitchen state,
   pre-order, generated in-app notifications, simulated payment, and actions to
   repeat, modify, cancel, open the confirmation page or the guest dashboard.

**Duplicate protection** works on two levels:

* A `clientRequestId` is generated when the wizard opens, reused across re-renders,
  and stored on the reservation. Re-submitting returns the existing record.
* A short-window guard catches rapid repeated submissions for the same email,
  date, time and party size when no request id is supplied. Repeat visits and
  deliberate admin bookings are exempt.

The submit button disables while saving, and the service re-checks availability
immediately before writing.

**Lookup / manage:** anyone with a reference and the booking email can load the
booking from the reservation page, then modify, cancel or repeat it. Registered
guests also see their upcoming bookings in the lookup panel and dashboard.

The status page never renders details from a bare `?id=`. It only auto-opens a
booking for an administrator session, the signed-in owner, or a booking that was
just created/looked up in the same tab (a sessionStorage handoff). Otherwise it
shows a lookup form with the reference prefilled, and the email must match. The
wizard applies the same gate to `?manage=` and `?repeat=` links, so a copied URL
cannot expose or clone someone else's contact details.

---

## 5. Availability rules

Calculated synchronously from stored settings, tables and reservations:

* **Opening hours** per weekday (closed days produce no sittings).
* **Booking horizon** (default 60 days) and **lead time** (default 1 hour).
* **Sitting interval** (30 min), **last seating** offset (60 min before close),
  **reservation duration** (90 min) and **turnover buffer** (15 min).
* **Table capacity**: party must fit the table, the table's minimum, and the
  zone’s min/max range. The private alcove requires six or more guests.
* **Existing reservations** block a table for `duration + buffer`. Overlap is
  `startA < endB && startB < endA`. Cancelled and no-show bookings release their
  tables immediately; pending, confirmed, seated and completed bookings hold them.
* **Blocked dates** close the entire day. **Blocked slots** close a single sitting
  on a specific date. Both are editable in the admin panel and are respected by
  the public wizard.
* **Auto table assignment** picks the smallest suitable free table in the chosen
  zone (or across zones for “best available”). Admins can override the assignment;
  capacity and conflicts are still validated.

Availability is simulated **per browser**. There is no global inventory lock and
no cross-device coordination.

---

## 6. Reservation lifecycle

Service statuses: `pending → confirmed → seated → completed`, plus `cancelled` and
`no_show`. Kitchen statuses: `queued → preparing → ready → served`.

Every change appends a `reservationHistory` entry with actor, action, before/after
summary and timestamp. Notifications are generated for the guest (or customer) and
the admin ledger. Cancelling keeps the reservation record and its history, releases
the table and marks the meal order cancelled. Hard deletion is reserved for test
records and is available only from the admin ledger.

**Payments** are off by default (`depositPerGuest = 0`). If an admin sets a
simulated deposit, new bookings carry a `simulated_due` state and the admin can
mark it `simulated_paid` or `waived`. No card data is collected, no provider is
contacted, and the `payments` collection explicitly records `simulated: true`.

**Notifications** are in-app only. They appear in the dashboard bell drawer and
next to the booking. Delivery metadata (`email: false, sms: false, push: false`)
documents the simulation, and the notification service is the single integration
point for a future email/SMS provider.

---

## 7. Admin & customer management

**Admin → Reservations**

* Bookings tab: KPI summary; scope filters (upcoming / today / past / all); search
  by name, reference, email, phone or table; status and date filters.
* Per booking: service status, table assignment, meal prep status, simulated
  payment state, expandable detail (pre-order, notes, history, notifications),
  cancel, hard delete, repeat booking.
* Floor & availability tab: weekly hours (open/closed + times), sitting interval,
  duration, buffer, last seating, lead time, horizon, party limits, simulated
  deposit, auto-confirm, guest booking toggle, notification toggle, guest note;
  blocked dates and blocked sittings; per-table name, zone, seats, minimum seats,
  floor status and bookable flag; add/remove tables; JSON export/import and demo
  reset tools.
* The existing **Floor & Tables** panel still works and now reads the same table
  collection, so floor status and reservation configuration no longer diverge.

**User dashboard → Reservations**

* Upcoming bookings with status, table, kitchen state and pre-order subtotal.
* Actions: modify, book again (prefilled new booking), cancel, expand menu/history/
  notifications, open the confirmation page.
* Past visits and cancellations with “Book again”.
* In-app notification list with mark-read and mark-all-read.

The dashboard overview’s “Upcoming table” card and nav badge now come from real
reservation data.

---

## 8. Future migration path

The seams are deliberate:

1. **Repository swap** — reimplement the functions in `src/data/store.js`
   (`getCollection`, `setCollection`, `updateCollection`, settings/tables/etc.) as
   async API calls. Domain services already funnel all reads/writes through it.
   `subscriptions`/`subscribe` can be backed by websockets or polling.
2. **Availability service** — `src/data/availability.js` is pure and synchronous.
   Move it server-side unchanged to guarantee global inventory; expose a
   “quote/availability” endpoint and keep the same response shapes.
3. **Reservation service** — replace local writes in `src/data/reservations.js`
   with create/update/cancel endpoints. Keep `clientRequestId` for server-side
   idempotency and re-check availability inside a database transaction.
4. **Auth** — replace `local-auth.js` role checks with a real session. The customer
   record is already keyed by normalized email; add `authUserId` when available.
5. **Notifications** — implement email/SMS adapters behind `createNotification`.
   The UI can keep rendering the in-app collection.
6. **Payments** — replace the simulated deposit fields with a payment-intent flow.
   Keep the `simulated` flag so demo data remains distinguishable from real data.
7. **Schema** — bump `SCHEMA_VERSION` in `seed.js` and add migrations in
   `ensureSeeded()` / a migration module. Export/import already provides a JSON
   bridge for moving demo data.

---

## 9. Testing

Automated data-layer verification (no browser or extra dependency required):

```bash
npm run verify:reservations
```

It covers seeding/JSON persistence, availability (closed days, zones, party limits,
blocked dates/slots), guest creation, idempotent and near-duplicate submission
protection, meal orders and quantities, modification, cancellation freeing the
table, repeat bookings creating new records, service/kitchen statuses, simulated
payments, table capacity validation, admin stats, export/import and demo deletion.

Manual workflow checklist:

**Guest**
- [ ] Book as a guest with no account; note the reference.
- [ ] Refresh — booking still exists.
- [ ] Look up with reference + wrong email → rejected; correct email → found.
- [ ] Modify date, time, party size and menu quantities; refresh and confirm changes.
- [ ] Cancel; the booking shows cancelled and the sitting becomes bookable again.
- [ ] Use “Repeat” / “Book again”; a new reference is created and the original stays.

**Registered customer**
- [ ] Create a local account at `/pages/signup.html` and sign in.
- [ ] Book a table; the email is prefilled and the booking is linked to the customer.
- [ ] Open `/pages/user-dashboard.html` → the booking appears with pre-order and kitchen state.
- [ ] Cancel or modify from the dashboard; open the bell drawer for in-app updates.

**Admin**
- [ ] Open `/pages/admin-login.html` (or `admin-dashboard.html?preview=true`).
- [ ] Admin → Reservations shows the new booking with guest type and reference.
- [ ] Change service and kitchen statuses; refresh and verify persistence.
- [ ] Assign a different table; invalid/small/conflicting tables are rejected.
- [ ] Turn off auto-confirm, make a booking → it arrives as `pending`; confirm it.
- [ ] Set a simulated deposit, book → admin can mark the simulated payment paid.
- [ ] Block a date or sitting; the public wizard removes it from availability.
- [ ] Change opening hours / duration / buffer; the wizard reflects them.
- [ ] Delete demo records only; reset the demo snapshot; export and re-import JSON.

**Cross-checks**
- [ ] Double-click “Confirm reservation” → exactly one record.
- [ ] Cancel a booking → the same slot becomes available for a party of that size.
- [ ] Repeat booking → two distinct records with different references.
- [ ] Menu items and per-dish notes survive refresh and appear in the admin detail.
