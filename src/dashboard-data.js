import { menuItems } from './menu-data.js'
const keys = { menu: 'flavoro.demo.menu.v1', update: 'flavoro.demo.update.v1', profile: 'flavoro.demo.profile.v1', settings: 'flavoro.demo.settings.v1', favorites: 'flavoro.demo.favorites.v1' }
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
const write = (key, value) => { localStorage.setItem(key, JSON.stringify(value)) }
export const defaults = { headline: 'Come for', accent: 'the flavor.', subline: 'Stay for the feeling.', name: 'Flavoro', hours: '' }
export const getMenu = () => { const data = read(keys.menu, null); return Array.isArray(data) ? data : structuredClone(menuItems) }
export const saveMenu = value => write(keys.menu, value)
export const getUpdate = () => read(keys.update, null)
export const saveUpdate = value => write(keys.update, value)
export const getProfile = () => read(keys.profile, { name: '', email: '', preferences: '' })
export const saveProfile = value => write(keys.profile, value)
export const getSettings = () => ({ ...defaults, ...read(keys.settings, {}) })
export const saveSettings = value => write(keys.settings, value)
export const getFavorites = () => { const data = read(keys.favorites, []); return Array.isArray(data) ? data : [] }
export const saveFavorites = value => write(keys.favorites, value)
