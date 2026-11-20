/**
 * Seed data for the front-end-only reservation prototype.
 *
 * The seed mirrors the restaurant identity used across the marketing site so
 * the demo feels coherent: dinner service Tuesday–Sunday, four seating zones,
 * ten tables and a small cast of example bookings. Everything is written to
 * localStorage once (see `store.js#ensureSeeded`).
 */

import { menuItems } from '../menu-data.js'
import { addDays, weekdayIndex, todayISO } from './datetime.js'

export const SCHEMA_VERSION = 1

export const COLLECTIONS = [
  'restaurantSettings',
  'menuItems',
  'tables',
  'customers',
  'reservations',
  'mealOrders',
  'reservationHistory',
  'notifications',
  'payments',
]

export const ZONES = [
  {
    id: 'main',
    name: 'Main Dining Room',
    tagline: 'Curved booths, low light, relaxed conversation.',
    description: 'Our signature salon with acoustic booths and a warm evening glow.',
    icon: 'armchair',
    minPartySize: 1,
    maxPartySize: 6,
  },
  {
    id: 'hearth',
    name: 'Fire Hearth Counter',
    tagline: 'High stools overlooking the live coals.',
    description: 'Front-row seats to the open fire and the plating pass.',
    icon: 'flame',
    minPartySize: 1,
    maxPartySize: 4,
  },
  {
    id: 'terrace',
    name: 'Garden Terrace',
    tagline: 'Lantern-lit, sheltered, open air.',
    description: 'A leafy terrace with outdoor heating for every season.',
    icon: 'leaf',
    minPartySize: 2,
    maxPartySize: 8,
  },
  {
    id: 'private',
    name: 'Private Alcove',
    tagline: 'A quiet room of your own.',
    description: 'A tucked-away alcove for celebrations of six to eight guests.',
    icon: 'wine',
    minPartySize: 6,
    maxPartySize: 8,
  },
]

const openingHours = {
  // Sunday = 0 … Saturday = 6. `null` means closed.
  0: { open: '17:30', close: '22:00' },
  1: null,
  2: { open: '17:30', close: '22:00' },
  3: { open: '17:30', close: '22:00' },
  4: { open: '17:30', close: '22:00' },
  5: { open: '17:30', close: '23:00' },
  6: { open: '17:00', close: '23:00' },
}

export const defaultSettings = {
  restaurantName: 'Flavoro',
  timezone: 'Africa/Lagos (demo/local browser time)',
  serviceLabel: 'Dinner service',
  openingHours,
  slotIntervalMinutes: 30,
  lastSeatingOffsetMinutes: 60,
  reservationDurationMinutes: 90,
  turnoverBufferMinutes: 15,
  leadTimeHours: 1,
  advanceBookingDays: 60,
  minPartySize: 1,
  maxPartySize: 8,
  autoConfirm: true,
  allowGuestBookings: true,
  depositPerGuest: 0,
  currency: 'USD',
  cancellationWindowHours: 24,
  blockedDates: [],
  blockedSlots: [],
  notesForGuests:
    'Tables are held for 15 minutes past the reservation time. Please tell us about allergies so the kitchen can prepare.',
  notificationsEnabled: true,
  paymentsSimulated: true,
  updatedAt: null,
}

const seedTables = [
  { id: 'T1', name: 'Table 01', zoneId: 'main', zone: 'Main Dining Room', seats: 4, minSeats: 1, status: 'open', features: ['Booth'], reservable: true },
  { id: 'T2', name: 'Table 02', zoneId: 'hearth', zone: 'Fire Hearth Counter', seats: 2, minSeats: 1, status: 'reserved', features: ['Chef view'], reservable: true },
  { id: 'T3', name: 'Table 03', zoneId: 'terrace', zone: 'Garden Terrace', seats: 6, minSeats: 2, status: 'reserved', features: ['Lantern lit'], reservable: true },
  { id: 'T4', name: 'Table 04', zoneId: 'hearth', zone: 'Fire Hearth Counter', seats: 2, minSeats: 1, status: 'open', features: ['Chef view'], reservable: true },
  { id: 'T5', name: 'Table 05', zoneId: 'private', zone: 'Private Alcove', seats: 8, minSeats: 6, status: 'open', features: ['Private room'], reservable: true },
  { id: 'T6', name: 'Table 06', zoneId: 'main', zone: 'Main Dining Room', seats: 4, minSeats: 1, status: 'open', features: ['Window'], reservable: true },
  { id: 'T7', name: 'Table 07', zoneId: 'terrace', zone: 'Garden Terrace', seats: 4, minSeats: 2, status: 'open', features: ['Open air'], reservable: true },
  { id: 'T8', name: 'Table 08', zoneId: 'main', zone: 'Main Dining Room', seats: 2, minSeats: 1, status: 'open', features: ['Quiet corner'], reservable: true },
  { id: 'T9', name: 'Table 09', zoneId: 'terrace', zone: 'Garden Terrace', seats: 2, minSeats: 2, status: 'open', features: ['Open air'], reservable: true },
  { id: 'T10', name: 'Table 10', zoneId: 'hearth', zone: 'Fire Hearth Counter', seats: 4, minSeats: 2, status: 'open', features: ['Chef view'], reservable: true },
]

const seedCustomers = [
  {
    id: 'cus_demo_eleanor',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.com',
    phone: '+1 (555) 234-8900',
    type: 'registered',
    notes: 'Prefers the quiet corner or fire hearth counter. Loves low-intervention wines.',
    seeded: true,
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z',
  },
  {
    id: 'cus_demo_marcus',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    phone: '+1 (555) 771-2088',
    type: 'guest',
    notes: 'Anniversary celebration in the garden.',
    seeded: true,
    createdAt: '2026-02-02T10:00:00.000Z',
    updatedAt: '2026-02-02T10:00:00.000Z',
  },
  {
    id: 'cus_demo_ava',
    name: 'Ava Okafor',
    email: 'ava.okafor@example.com',
    phone: '+1 (555) 908-1142',
    type: 'guest',
    notes: 'Books the private alcove for client dinners.',
    seeded: true,
    createdAt: '2026-02-18T10:00:00.000Z',
    updatedAt: '2026-02-18T10:00:00.000Z',
  },
]

function nextOpenDate(startISO, { usedDates = [], minOffset = 1 } = {}) {
  let candidate = addDays(startISO, minOffset)
  let guard = 0
  while (guard < 90) {
    const hours = openingHours[weekdayIndex(candidate)]
    if (hours && !usedDates.includes(candidate)) return candidate
    candidate = addDays(candidate, 1)
    guard += 1
  }
  return addDays(startISO, minOffset)
}

function buildSeedReservations(now) {
  const base = todayISO(now)
  const usedDates = []
  const upcomingDates = []
  for (let i = 0; i < 4; i += 1) {
    const date = nextOpenDate(base, { usedDates, minOffset: 2 + i })
    usedDates.push(date)
    upcomingDates.push(date)
  }
  const pastDate = addDays(base, -12)
  const createdAt = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString()

  return {
    reservations: [
      {
        id: 'rsv_seed_eleanor',
        reference: 'FLV-7K2M9Q',
        customerId: 'cus_demo_eleanor',
        guestType: 'registered',
        guest: { name: 'Eleanor Vance', email: 'eleanor.vance@example.com', phone: '+1 (555) 234-8900' },
        date: upcomingDates[0],
        time: '19:30',
        partySize: 2,
        zoneId: 'hearth',
        zoneName: 'Fire Hearth Counter',
        tableId: 'T2',
        tableName: 'Table 02',
        experience: "Chef Amara's 7-Course Seasonal Tasting Journey",
        occasion: 'Anniversary',
        notes: 'Quiet corner if possible. Anniversary celebration.',
        dietary: 'No shellfish.',
        status: 'confirmed',
        kitchenStatus: 'queued',
        source: 'seed',
        seeded: true,
        durationMinutes: 90,
        turnoverBufferMinutes: 15,
        payment: { required: false, status: 'not_required', amount: 0, currency: 'USD', simulated: true },
        clientRequestId: 'seed-eleanor-1',
        createdAt,
        updatedAt: createdAt,
        cancelledAt: null,
        cancellationReason: '',
      },
      {
        id: 'rsv_seed_marcus',
        reference: 'FLV-3R8T1B',
        customerId: 'cus_demo_marcus',
        guestType: 'guest',
        guest: { name: 'Marcus Chen', email: 'marcus.chen@example.com', phone: '+1 (555) 771-2088' },
        date: upcomingDates[1],
        time: '20:00',
        partySize: 4,
        zoneId: 'terrace',
        zoneName: 'Garden Terrace',
        tableId: 'T3',
        tableName: 'Table 03',
        experience: 'The Hearthside Communal Feast',
        occasion: 'Anniversary',
        notes: 'Lantern-lit table requested.',
        dietary: 'One vegetarian guest.',
        status: 'confirmed',
        kitchenStatus: 'queued',
        source: 'seed',
        seeded: true,
        durationMinutes: 90,
        turnoverBufferMinutes: 15,
        payment: { required: false, status: 'not_required', amount: 0, currency: 'USD', simulated: true },
        clientRequestId: 'seed-marcus-1',
        createdAt,
        updatedAt: createdAt,
        cancelledAt: null,
        cancellationReason: '',
      },
      {
        id: 'rsv_seed_ava',
        reference: 'FLV-9W4N2P',
        customerId: 'cus_demo_ava',
        guestType: 'guest',
        guest: { name: 'Ava Okafor', email: 'ava.okafor@example.com', phone: '+1 (555) 908-1142' },
        date: upcomingDates[2],
        time: '18:30',
        partySize: 6,
        zoneId: 'private',
        zoneName: 'Private Alcove',
        tableId: 'T5',
        tableName: 'Table 05',
        experience: 'The Coastal Harvest Seafood Board',
        occasion: 'Business dinner',
        notes: 'Client dinner. One guest arrives 15 minutes late.',
        dietary: '',
        status: 'confirmed',
        kitchenStatus: 'queued',
        source: 'seed',
        seeded: true,
        durationMinutes: 90,
        turnoverBufferMinutes: 15,
        payment: { required: false, status: 'not_required', amount: 0, currency: 'USD', simulated: true },
        clientRequestId: 'seed-ava-1',
        createdAt,
        updatedAt: createdAt,
        cancelledAt: null,
        cancellationReason: '',
      },
      {
        id: 'rsv_seed_eleanor_past',
        reference: 'FLV-2H6D8S',
        customerId: 'cus_demo_eleanor',
        guestType: 'registered',
        guest: { name: 'Eleanor Vance', email: 'eleanor.vance@example.com', phone: '+1 (555) 234-8900' },
        date: pastDate,
        time: '20:00',
        partySize: 2,
        zoneId: 'main',
        zoneName: 'Main Dining Room',
        tableId: 'T1',
        tableName: 'Table 01',
        experience: 'À la carte table reservation',
        occasion: '',
        notes: 'Window booth.',
        dietary: '',
        status: 'completed',
        kitchenStatus: 'served',
        source: 'seed',
        seeded: true,
        durationMinutes: 90,
        turnoverBufferMinutes: 15,
        payment: { required: false, status: 'not_required', amount: 0, currency: 'USD', simulated: true },
        clientRequestId: 'seed-eleanor-past',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20).toISOString(),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12).toISOString(),
        cancelledAt: null,
        cancellationReason: '',
      },
    ],
  }
}

function buildSeedMealOrders(reservations) {
  const orderFrom = (reservation, items, status) => ({
    id: `ord_${reservation.id}`,
    reservationId: reservation.id,
    items,
    subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    itemCount: items.reduce((sum, item) => sum + item.qty, 0),
    status,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
  })
  const find = (id) => menuItems.find((item) => item.id === id)
  const mk = (id, qty, notes = '') => {
    const dish = find(id)
    return dish
      ? { menuItemId: dish.id, name: dish.name, category: dish.category, price: dish.price, qty, notes }
      : null
  }
  const eleanorOrder = [mk('tasting-7-course', 2, 'One guest avoids shellfish'), mk('discovery-flight', 2)]
  const marcusOrder = [mk('hearthside-feast', 4), mk('garden-highball', 4)]
  const avaOrder = [mk('coastal-feast', 6), mk('grand-reserve-flight', 2)]
  const pastOrder = [mk('12-hour-short-rib', 1), mk('red-snapper-coconut', 1), mk('midnight-fondant', 2)]

  return [
    orderFrom(reservations[0], eleanorOrder.filter(Boolean), 'confirmed'),
    orderFrom(reservations[1], marcusOrder.filter(Boolean), 'confirmed'),
    orderFrom(reservations[2], avaOrder.filter(Boolean), 'confirmed'),
    orderFrom(reservations[3], pastOrder.filter(Boolean), 'served'),
  ]
}

function buildSeedHistory(reservations) {
  const history = []
  reservations.forEach((reservation, index) => {
    history.push({
      id: `hist_${reservation.id}_created`,
      reservationId: reservation.id,
      action: index === 3 ? 'completed' : 'created',
      actor: reservation.guestType === 'registered' ? 'customer' : 'guest',
      summary:
        index === 3
          ? 'Evening completed and archived in the booking history.'
          : `Reservation confirmed for ${reservation.partySize} guests.`,
      changes: {},
      fromStatus: null,
      toStatus: reservation.status,
      createdAt: reservation.createdAt,
      seeded: true,
    })
  })
  return history
}

function buildSeedNotifications(reservations) {
  const created = []
  reservations.slice(0, 3).forEach((reservation) => {
    created.push({
      id: `notif_admin_${reservation.id}`,
      audience: 'admin',
      customerId: reservation.customerId,
      reservationId: reservation.id,
      type: 'reservation_created',
      title: 'New table reservation',
      message: `${reservation.guest.name} · ${reservation.partySize} guests · ${reservation.zoneName} · ${reservation.date}`,
      read: false,
      simulated: true,
      channel: 'in-app',
      createdAt: reservation.createdAt,
    })
    created.push({
      id: `notif_guest_${reservation.id}`,
      audience: reservation.guestType === 'registered' ? 'customer' : 'guest',
      customerId: reservation.customerId,
      reservationId: reservation.id,
      type: 'reservation_confirmed',
      title: 'Your table is confirmed',
      message: `We look forward to hosting you at ${reservation.time} on ${reservation.date}. Reference ${reservation.reference}.`,
      read: false,
      simulated: true,
      channel: 'in-app',
      createdAt: reservation.createdAt,
    })
  })
  return created
}

/**
 * Build a complete, internally consistent data snapshot.
 * Reservations are spread across future dates so availability stays sensible.
 */
export function buildSeedData(reference = new Date()) {
  const { reservations } = buildSeedReservations(reference)
  const mealOrders = buildSeedMealOrders(reservations)
  return {
    restaurantSettings: {
      ...structuredClone(defaultSettings),
      updatedAt: reference.toISOString(),
    },
    menuItems: structuredClone(menuItems),
    tables: structuredClone(seedTables),
    customers: structuredClone(seedCustomers),
    reservations,
    mealOrders,
    reservationHistory: buildSeedHistory(reservations),
    notifications: buildSeedNotifications(reservations),
    payments: [],
  }
}

export { seedTables }
