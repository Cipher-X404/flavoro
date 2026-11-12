import { isSignedIn, login, register } from './local-auth.js'
import { getProfile, saveProfile } from './dashboard-data.js'
export function initUserAuth() {
  const form = document.querySelector('[data-account-form]')
  if (!form) return
  if (isSignedIn('user')) { location.replace('/pages/user-dashboard.html'); return }
  form.addEventListener('submit', async event => {
    event.preventDefault()
    const data = new FormData(form), signup = form.dataset.mode === 'signup'
    const status = form.querySelector('[data-account-status]'), button = form.querySelector('button[type=submit]')
    if (signup && data.get('password') !== data.get('confirm')) { status.textContent = 'Passwords do not match.'; return }
    button.disabled = true; status.textContent = 'Please wait…'
    try {
      if (signup) {
        await register('user', data.get('email'), data.get('password'))
        saveProfile({ ...getProfile(), name: String(data.get('name')).trim().replace(/[<>]/g, ''), email: String(data.get('email')).trim() })
      } else await login('user', data.get('email'), data.get('password'))
      location.assign('/pages/user-dashboard.html')
    } catch (error) { status.textContent = error.message || 'Could not complete sign in.'; button.disabled = false }
  })
}
