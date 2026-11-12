// Local-only demonstration. Client-side state is not an authentication boundary.
const key = role => `flavoro.demo.auth.${role}.v1`
const sessionKey = role => `flavoro.demo.session.${role}.v1`
const roles = ['admin', 'user']
function checkRole(role) { if (!roles.includes(role)) throw new Error('Invalid role') }
export function hasAccount(role) { checkRole(role); try { return !!JSON.parse(localStorage.getItem(key(role)) || 'null')?.hash } catch { return false } }
async function derive(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('A secure browser context is required for this preview.')
  const enc = new TextEncoder()
  const material = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', salt: Uint8Array.from(salt), iterations: 210000, hash:'SHA-256' }, material, 256)
  return Array.from(new Uint8Array(bits))
}
export async function register(role, email, password) {
  checkRole(role)
  email = email.trim().toLowerCase()
  if (!email || password.length < 8) throw new Error('Enter an email and a password of at least 8 characters.')
  if (hasAccount(role)) throw new Error('An account already exists in this browser. Please sign in.')
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
  const hash = await derive(password, salt)
  // Recheck after the asynchronous derivation, to avoid replacing a setup in another tab.
  if (hasAccount(role)) throw new Error('An account already exists in this browser. Please sign in.')
  localStorage.setItem(key(role), JSON.stringify({ email, salt, hash }))
  sessionStorage.setItem(sessionKey(role), 'active')
}
export async function login(role, email, password) {
  checkRole(role)
  let account
  try { account = JSON.parse(localStorage.getItem(key(role)) || 'null') } catch { account = null }
  if (!account || !Array.isArray(account.salt) || !Array.isArray(account.hash)) throw new Error('No account found in this browser. Complete setup first.')
  const hash = await derive(password, account.salt)
  let diff = hash.length ^ account.hash.length
  for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ (account.hash[i] || 0)
  if (diff !== 0 || account.email !== email.trim().toLowerCase()) throw new Error('Email or password is incorrect.')
  sessionStorage.setItem(sessionKey(role), 'active')
}
export function isSignedIn(role) { checkRole(role); try { return hasAccount(role) && sessionStorage.getItem(sessionKey(role)) === 'active' } catch { return false } }
export function logout(role) { checkRole(role); sessionStorage.removeItem(sessionKey(role)) }
