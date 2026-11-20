import {
  getMenuItems,
  getTables as readStoreTables,
  saveMenuItems,
  saveTables as writeStoreTables,
} from './data/store.js'

const keys = {
  menu: 'flavoro.demo.menu.v1',
  update: 'flavoro.demo.update.v1',
  profile: 'flavoro.demo.profile.v1',
  settings: 'flavoro.demo.settings.v1',
  favorites: 'flavoro.demo.favorites.v1',
  tables: 'flavoro.demo.tables.v1',
  reservations: 'flavoro.demo.reservations.v1',
  activity: 'flavoro.demo.activity.v1',
  userPreferences: 'flavoro.demo.user.preferences.v1',
}

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export const defaults = {
  headline: 'Come for',
  accent: 'the flavor.',
  subline: 'Stay for the feeling.',
  name: 'Flavoro',
  hours: 'Wed – Sun: 5:30 PM – 11:00 PM',
  serviceStatus: 'Dinner Service Active',
}

// Menu data now lives in the central reservation store so admin edits are
// reflected in reservation pre-orders. The legacy key is migrated on first run
// by `data/store.js#ensureSeeded`.
export const getMenu = () => getMenuItems()
export const saveMenu = (value) => saveMenuItems(value)

export const getUpdate = () => read(keys.update, null)
export const saveUpdate = (value) => write(keys.update, value)

export const getProfile = () =>
  read(keys.profile, {
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.com',
    phone: '+1 (555) 234-8900',
    preferences: 'Prefers quiet corner table or fire hearth counter. Loves low-intervention natural wines and seasonal wood-fired game.',
    seating: 'Hearth Counter',
    dietary: ['Gluten-Free Friendly'],
  })
export const saveProfile = (value) => write(keys.profile, value)

export const getSettings = () => ({ ...defaults, ...read(keys.settings, {}) })
export const hasSavedSettings = () => read(keys.settings, null) !== null
export const saveSettings = (value) => write(keys.settings, value)

export const getFavorites = () => {
  const data = read(keys.favorites, null)
  if (Array.isArray(data) && data.length > 0) return data
  // Default favorites for immediate richness
  return ['fire-grilled-chicken', 'tasting-seven-course', 'garden-over-fire']
}
export const saveFavorites = (value) => write(keys.favorites, value)

// Tables Floor Status (Live interactive restaurant seating)
const defaultTables = [
  { id: 'T1', name: 'Table 01', zone: 'Main Salon', seats: 4, status: 'seated', course: 'Entree', guest: 'Dr. Sterling (4)', spend: '$340' },
  { id: 'T2', name: 'Table 02', zone: 'Fire Hearth Counter', seats: 2, status: 'seated', course: 'Tasting Flight', guest: 'M. Chen (2)', spend: '$420' },
  { id: 'T3', name: 'Table 03', zone: 'Terrace Booth', seats: 6, status: 'reserved', time: '8:15 PM', guest: 'A. Montgomery (6)', note: 'Anniversary' },
  { id: 'T4', name: 'Table 04', zone: 'Fire Hearth Pass', seats: 2, status: 'plating', course: 'Course 5/7', guest: 'S. Moreau (2)', spend: '$510' },
  { id: 'T5', name: 'Table 05', zone: 'Private Alcove', seats: 8, status: 'seated', course: 'Sommelier Pairings', guest: 'Vance Group (8)', spend: '$1,280' },
  { id: 'T6', name: 'Table 06', zone: 'Main Salon', seats: 4, status: 'clearing', course: 'Finished', guest: 'K. Patel (3)', spend: '$295' },
  { id: 'T7', name: 'Table 07', zone: 'Garden Terrace', seats: 4, status: 'open', seatsAvailable: 4 },
  { id: 'T8', name: 'Table 08', zone: 'Fire Hearth Counter', seats: 2, status: 'open', seatsAvailable: 2 },
]

// Tables are shared with the reservation availability engine.
export const getTables = () => readStoreTables()
export const saveTables = (value) => writeStoreTables(value)

// Admin Activity Timeline
const defaultActivity = [
  { id: 'act-1', type: 'order', text: 'Table 04 requested Sommelier Cellar Pairing (Flight B)', time: '3m ago', icon: 'wine' },
  { id: 'act-2', type: 'vip', text: 'VIP Reservation seated at Private Alcove: Vance Party', time: '12m ago', icon: 'users' },
  { id: 'act-3', type: 'kitchen', text: 'Hearth Pass: 7-Course Fire Journey Course 4 fired', time: '18m ago', icon: 'flame' },
  { id: 'act-4', type: 'booking', text: 'New reservation confirmed: Fri 8:00 PM (4 guests)', time: '32m ago', icon: 'calendar-days' },
  { id: 'act-5', type: 'system', text: 'Day-boat seafood cooperative delivery logged & verified', time: '1h ago', icon: 'shield-check' },
]

export const getActivity = () => read(keys.activity, defaultActivity)
export const saveActivity = (value) => write(keys.activity, value)

// User Flavor Passport Preferences
const defaultPreferences = [
  'Live-Fire Hearth Roasts',
  'Wild Mushrooms & Foraged Greens',
  'Low-Intervention Natural Wines',
  'Aged Balsamic & Emulsions',
  'Heritage Oak Smoke',
  'Wood-Fired Sourdough',
]

export const getUserPreferences = () => read(keys.userPreferences, defaultPreferences)
export const saveUserPreferences = (value) => write(keys.userPreferences, value)
