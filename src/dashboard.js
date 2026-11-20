import './dashboard.css'
import { gsap } from 'gsap'
import {
  createIcons,
  LayoutDashboard,
  UtensilsCrossed,
  Utensils,
  User,
  ChefHat,
  Megaphone,
  ClipboardList,
  SlidersHorizontal,
  Heart,
  UserRound,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  CircleHelp,
  Globe,
  ShoppingBag,
  CalendarDays,
  Image,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Flame,
  Bell,
  Activity,
  TrendingUp,
  Clock,
  Search,
  ShieldCheck,
  Users,
  Wine,
  Leaf,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Eye,
  Sliders,
  DollarSign,
  Compass,
  Zap,
  Info,
  ChevronDown,
  Ban,
  RotateCcw,
} from 'lucide'
import { isSignedIn, logout } from './local-auth.js'
import {
  getMenu,
  saveMenu,
  getUpdate,
  saveUpdate,
  getProfile,
  saveProfile,
  getSettings,
  saveSettings,
  getFavorites,
  saveFavorites,
  getTables,
  saveTables,
  getActivity,
  saveActivity,
  getUserPreferences,
  saveUserPreferences,
} from './dashboard-data.js'
import {
  bindAdminReservations,
  bindCustomerReservations,
  getAdminReservationBadge,
  getCustomerBookingCount,
  getNextCustomerReservationView,
  markDrawerAllRead,
  markDrawerNotificationRead,
  renderAdminReservationsPanel,
  renderCustomerReservationsPanel,
  renderNotificationFeed,
} from './dashboard-reservations.js'
import { resetCollection } from './data/store.js'

const resetTableCollection = () => resetCollection('tables')

const icons = {
  LayoutDashboard,
  UtensilsCrossed,
  Utensils,
  User,
  ChefHat,
  Megaphone,
  ClipboardList,
  SlidersHorizontal,
  Heart,
  UserRound,
  ArrowUpRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  CircleHelp,
  Globe,
  ShoppingBag,
  CalendarDays,
  Image,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Flame,
  Bell,
  Activity,
  TrendingUp,
  Clock,
  Search,
  ShieldCheck,
  Users,
  Wine,
  Leaf,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Eye,
  Sliders,
  DollarSign,
  Compass,
  Zap,
  Info,
  ChevronDown,
  Ban,
  RotateCcw,
}

const admin = document.body.dataset.dashboard === 'admin'
const root = document.querySelector('#dashboard')
const role = admin ? 'admin' : 'user'

const isPreviewMode = new URLSearchParams(location.search).get('preview') === 'true'
if (!isSignedIn(role) && !isPreviewMode) {
  location.replace(admin ? '/pages/admin-login.html' : '/pages/login.html')
}

const escape = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const clean = (value) => String(value ?? '').trim().replace(/[<>]/g, '')

const adminNav = [
  ['overview', 'layout-dashboard', 'Overview', ''],
  ['menu', 'utensils-crossed', 'Menu Studio', 'Live'],
  ['reservations', 'clipboard-list', 'Reservations', ''],
  ['tables', 'calendar-days', 'Floor & Tables', ''],
  ['updates', 'megaphone', 'Announcements', ''],
  ['operations', 'activity', 'Operations', 'Active'],
  ['settings', 'sliders-horizontal', 'Settings', ''],
]

const userNav = [
  ['overview', 'layout-dashboard', 'Home', ''],
  ['favorites', 'heart', 'Saved Dishes', '3'],
  ['activity', 'calendar-days', 'Reservations', ''],
  ['taste', 'compass', 'Taste Profile', 'VIP'],
  ['profile', 'user-round', 'Account', ''],
]

const nav = admin ? adminNav : userNav
let current = 'overview'
let clockInterval = null
let currentChartPeriod = 'today'

const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`

function startLiveClock() {
  if (clockInterval) clearInterval(clockInterval)
  const update = () => {
    const el = document.getElementById('island-live-clock')
    if (el) {
      const now = new Date()
      el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  }
  update()
  clockInterval = setInterval(update, 1000)
}

function toast(text, type = 'info') {
  const el = root.querySelector('.dash-toast')
  if (!el) return
  el.innerHTML = `
    <div class="toast-capsule">
      <span class="toast-icon">${icon(type === 'success' ? 'check-circle-2' : type === 'flame' ? 'flame' : 'bell')}</span>
      <span class="toast-text">${escape(text)}</span>
    </div>
  `
  createIcons({ icons })
  el.classList.add('visible')
  gsap.fromTo(el, { y: 20, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' })

  clearTimeout(toast.timer)
  toast.timer = setTimeout(() => {
    gsap.to(el, { y: -15, opacity: 0, scale: 0.96, duration: 0.25, ease: 'power2.in', onComplete: () => el.classList.remove('visible') })
  }, 3400)
}

function shell() {
  const profile = getProfile()
  const guestFirstName = profile.name ? profile.name.split(' ')[0] : 'Guest'
  const notificationFeed = renderNotificationFeed(role)
  const navBadge = (id, fallback) => {
    if (admin && id === 'reservations') {
      const count = getAdminReservationBadge()
      return count ? String(count) : ''
    }
    if (!admin && id === 'activity') {
      const count = getCustomerBookingCount()
      return count ? String(count) : fallback
    }
    return fallback
  }

  root.innerHTML = `
  <header class="ios-glass-bar">
    <div class="bar-left">
      <a class="bar-brand" href="/index.html" aria-label="Flavoro Restaurant">
        <span class="brand-flame-circle"><i data-lucide="flame"></i></span>
        <div class="brand-text">
          <b>Flavoro</b>
          <span class="brand-badge">${admin ? 'STUDIO OS' : 'CLUB'}</span>
        </div>
      </a>
    </div>

    <!-- Apple Dynamic Island Status Capsule -->
    <div class="dynamic-island" id="dynamic-island" role="status" aria-label="Live restaurant status">
      <div class="island-pill-inner">
        <span class="island-live-beacon" aria-hidden="true"></span>
        <div class="island-telemetry">
          <span class="island-service-title">${admin ? 'Dinner Service Active' : 'Table Reservation Confirmed'}</span>
          <span class="island-divider">·</span>
          <span class="island-clock" id="island-live-clock">--:--:--</span>
        </div>
        <span class="island-status-pill">${admin ? '88% Capacity' : 'Hearth Counter'}</span>
      </div>
    </div>

    <div class="bar-right">
      <div class="bar-actions">
        <button type="button" class="bar-btn icon-only" id="btn-notifications" aria-label="Notifications">
          <i data-lucide="bell"></i>
          ${notificationFeed.unread ? '<span class="bar-notif-dot"></span>' : ''}
        </button>

        <a class="bar-btn site-btn" href="/index.html">
          <span>Website</span>
          <i data-lucide="arrow-up-right"></i>
        </a>

        <div class="user-pill-dropdown">
          <div class="user-avatar-capsule">
            <span class="avatar-letter">${admin ? 'A' : (guestFirstName[0] || 'G')}</span>
            <span class="user-name-label">${admin ? 'Admin Studio' : guestFirstName}</span>
          </div>
          <button class="bar-btn signout-btn" type="button" data-signout title="Sign out">
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- iOS Slide-out Notification Drawer -->
  <aside class="ios-drawer" id="notification-drawer" aria-hidden="true" role="dialog" aria-label="Recent notifications">
    <div class="drawer-header">
      <div class="drawer-title">
        <i data-lucide="bell"></i>
        <h3>Notifications &amp; Activity</h3>
      </div>
      <button type="button" class="drawer-close" id="btn-close-notifications" aria-label="Close notifications">
        <i data-lucide="x"></i>
      </button>
    </div>
    <div class="drawer-body">
      <div class="rsv-drawer-feed">
        ${notificationFeed.html}
      </div>
      <div class="rsv-drawer-head"><span>Studio activity</span></div>
      <div class="drawer-activity-feed">
        ${getActivity().map(act => `
          <div class="drawer-feed-item">
            <div class="feed-icon-wrap"><i data-lucide="${escape(act.icon || 'activity')}"></i></div>
            <div class="feed-copy">
              <p>${escape(act.text)}</p>
              <span class="feed-time">${escape(act.time)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </aside>

  <main class="dash-content-area" id="dash-content" tabindex="-1"></main>

  <!-- 10x Apple macOS/iOS Interactive Dock Navigation -->
  <nav class="ios-dock-wrap" aria-label="Dashboard navigation">
    <div class="dash-dock" id="dash-dock">
      <div class="dock-shelf">
        ${nav.map(([id, ic, label, badge]) => {
          const shownBadge = navBadge(id, badge)
          return `
          <button type="button"
            class="dock-item ${current === id ? 'is-active' : ''}"
            data-panel="${id}"
            data-label="${label}"
            aria-label="${label}"
            ${current === id ? 'aria-current="page"' : ''}>
            <div class="dock-icon-box">
              <i data-lucide="${ic}"></i>
              ${shownBadge ? `<span class="dock-badge">${shownBadge}</span>` : ''}
            </div>
            <span class="dock-tooltip">${label}</span>
            <span class="dock-active-pill" aria-hidden="true"></span>
          </button>
        `}).join('')}

        <span class="dock-separator" aria-hidden="true"></span>

        <a href="/index.html" class="dock-item dock-link" data-label="Return to Website" aria-label="Return to Website">
          <div class="dock-icon-box">
            <i data-lucide="globe"></i>
          </div>
          <span class="dock-tooltip">Return to Site</span>
        </a>
      </div>
    </div>
  </nav>

  <div class="dash-toast" role="status" aria-live="polite"></div>
  `

  root.querySelector('[data-signout]').addEventListener('click', () => {
    logout(role)
    location.replace(admin ? '/pages/admin-login.html' : '/pages/login.html')
  })

  // Notifications Drawer
  const drawer = root.querySelector('#notification-drawer')
  const notifBtn = root.querySelector('#btn-notifications')
  const closeNotifBtn = root.querySelector('#btn-close-notifications')

  notifBtn?.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open')
    if (isOpen) {
      drawer.classList.remove('is-open')
      drawer.setAttribute('aria-hidden', 'true')
    } else {
      drawer.classList.add('is-open')
      drawer.setAttribute('aria-hidden', 'false')
      gsap.from(drawer.querySelectorAll('.drawer-feed-item'), {
        x: 30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.35,
        ease: 'power2.out'
      })
    }
  })

  closeNotifBtn?.addEventListener('click', () => {
    drawer.classList.remove('is-open')
    drawer.setAttribute('aria-hidden', 'true')
  })

  drawer?.querySelectorAll('[data-drawer-notification]').forEach((item) => {
    item.addEventListener('click', () => {
      markDrawerNotificationRead(item.dataset.drawerNotification)
      item.classList.add('is-read')
      item.querySelector('.rsv-drawer-dot')?.remove()
      if (!renderNotificationFeed(role).unread) root.querySelector('.bar-notif-dot')?.remove()
    })
  })
  drawer?.querySelector('[data-drawer-mark-read]')?.addEventListener('click', () => {
    markDrawerAllRead(role)
    drawer.querySelectorAll('.rsv-drawer-item').forEach((item) => item.classList.add('is-read'))
    drawer.querySelectorAll('.rsv-drawer-dot').forEach((dot) => dot.remove())
    root.querySelector('.bar-notif-dot')?.remove()
    toast('All in-app notifications marked read.', 'success')
  })

  root.querySelectorAll('[data-panel]').forEach((b) => {
    b.addEventListener('click', () => {
      // Apple icon bounce on click
      gsap.timeline()
        .to(b, { scale: 0.88, duration: 0.1, ease: 'power2.out' })
        .to(b, { scale: 1.16, y: -8, duration: 0.22, ease: 'back.out(2)' })
        .to(b, { scale: 1, y: 0, duration: 0.18, ease: 'power2.out' })

      show(b.dataset.panel)
    })
  })

  startLiveClock()
  initDockMagnification()
}

// Apple iOS/macOS parabolic dock magnification physics
function initDockMagnification() {
  const dock = document.querySelector('#dash-dock')
  if (!dock) return
  const items = Array.from(dock.querySelectorAll('.dock-item'))
  const maxScale = 1.28
  const range = 110

  const onMouseMove = (e) => {
    if (window.matchMedia('(max-width: 768px)').matches) return
    const mouseX = e.clientX
    items.forEach((item) => {
      const rect = item.getBoundingClientRect()
      const itemCenter = rect.left + rect.width / 2
      const distance = Math.abs(mouseX - itemCenter)
      if (distance < range) {
        const norm = distance / range
        const scale = 1 + (maxScale - 1) * Math.cos(norm * (Math.PI / 2))
        const translateY = -12 * Math.cos(norm * (Math.PI / 2))
        item.style.transform = `scale(${scale.toFixed(3)}) translateY(${translateY.toFixed(1)}px)`
      } else {
        item.style.transform = 'scale(1) translateY(0px)'
      }
    })
  }

  const onMouseLeave = () => {
    items.forEach((item) => {
      gsap.to(item, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    })
  }

  dock.addEventListener('mousemove', onMouseMove)
  dock.addEventListener('mouseleave', onMouseLeave)
}

function show(panel) {
  current = nav.some(([id]) => id === panel) ? panel : 'overview'
  shell()
  const main = root.querySelector('main')
  main.innerHTML = (admin ? adminPanels : userPanels)[current]()
  createIcons({ icons })
  bind()

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.from(main.querySelectorAll('.ios-spring-enter'), {
      opacity: 0,
      y: 26,
      scale: 0.98,
      duration: 0.6,
      stagger: 0.05,
      ease: 'back.out(1.4)',
    })
  }

  window.scrollTo({ top: 0, behavior: 'auto' })
}

/* =========================================================================
   ADMIN DASHBOARD PANELS
   ========================================================================= */

function adminOverview() {
  const menu = getMenu()
  const update = getUpdate()
  const tables = getTables()
  const seatedTables = tables.filter((t) => t.status === 'seated').length
  const totalTables = tables.length
  const occupancyPercent = Math.round((seatedTables / totalTables) * 100)

  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="flame"></i> CULINARY STUDIO &amp; COMMAND</div>
      <h1>Dining Room <em>Cadence.</em></h1>
      <p>Live hearth temperatures, floor status, covers telemetry, and operational intelligence.</p>
    </div>
    <div class="view-header-actions">
      <button type="button" class="ios-action-btn primary" id="btn-quick-dish"><i data-lucide="plus"></i> <span>Add Dish</span></button>
      <button type="button" class="ios-action-btn secondary" data-go="updates"><i data-lucide="megaphone"></i> <span>Publish Notice</span></button>
    </div>
  </div>

  <!-- iOS KPI Metric Cards -->
  <div class="kpi-grid ios-spring-enter">
    <div class="ios-card kpi-card">
      <div class="kpi-head">
        <span class="kpi-label">TODAY'S REVENUE</span>
        <div class="kpi-icon-bubble green"><i data-lucide="dollar-sign"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number">$8,740.00</span>
        <span class="kpi-delta positive"><i data-lucide="trending-up"></i> +18.4% vs yday</span>
      </div>
      <div class="kpi-bar-track"><div class="kpi-bar-fill" style="width: 78%;"></div></div>
      <span class="kpi-subtext">Peak 8:00 PM sitting fully booked</span>
    </div>

    <div class="ios-card kpi-card">
      <div class="kpi-head">
        <span class="kpi-label">COVERS &amp; CAPACITY</span>
        <div class="kpi-icon-bubble amber"><i data-lucide="users"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number">148 / 160</span>
        <span class="kpi-delta positive"><i data-lucide="check-circle-2"></i> ${occupancyPercent}% Floor</span>
      </div>
      <div class="kpi-bar-track"><div class="kpi-bar-fill amber" style="width: ${occupancyPercent}%;"></div></div>
      <span class="kpi-subtext">${seatedTables} active tables currently seated</span>
    </div>

    <div class="ios-card kpi-card">
      <div class="kpi-head">
        <span class="kpi-label">HEARTH DISHES FIRED</span>
        <div class="kpi-icon-bubble orange"><i data-lucide="flame"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number">${menu.length}</span>
        <span class="kpi-delta neutral"><i data-lucide="utensils-crossed"></i> Active Carte</span>
      </div>
      <div class="kpi-bar-track"><div class="kpi-bar-fill orange" style="width: 85%;"></div></div>
      <span class="kpi-subtext">700° seasoned oak hearth pass</span>
    </div>

    <div class="ios-card kpi-card">
      <div class="kpi-head">
        <span class="kpi-label">AVG TABLE TURN</span>
        <div class="kpi-icon-bubble purple"><i data-lucide="clock"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number">1h 22m</span>
        <span class="kpi-delta positive"><i data-lucide="trending-up"></i> -8m optimal</span>
      </div>
      <div class="kpi-bar-track"><div class="kpi-bar-fill purple" style="width: 90%;"></div></div>
      <span class="kpi-subtext">Optimal cadence across dining salon</span>
    </div>
  </div>

  <!-- Interactive Revenue & Covers Telemetry Curve (SVG Chart) -->
  <div class="ios-card chart-card ios-spring-enter">
    <div class="chart-header">
      <div>
        <span class="card-kicker">HOURLY TELEMETRY &amp; SERVICE CURVE</span>
        <h2>Revenue &amp; Guest Flow</h2>
      </div>
      <div class="ios-segmented-control" id="chart-segments">
        <button type="button" class="segment-btn is-active" data-period="today">Today</button>
        <button type="button" class="segment-btn" data-period="week">This Week</button>
        <button type="button" class="segment-btn" data-period="month">30-Day Trend</button>
      </div>
    </div>

    <div class="chart-canvas-wrap">
      <svg class="telemetry-chart" viewBox="0 0 920 220" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f88a08" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#f88a08" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Horizontal Guide Lines -->
        <line x1="0" y1="40" x2="920" y2="40" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
        <line x1="0" y1="100" x2="920" y2="100" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
        <line x1="0" y1="160" x2="920" y2="160" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />

        <!-- Area Fill -->
        <path id="chart-area" d="M 40,170 C 120,165 200,140 280,120 C 360,105 440,145 520,75 C 600,35 680,50 760,25 C 840,18 880,35 900,20 L 900,200 L 40,200 Z" fill="url(#chartGradient)" />

        <!-- Stroke Line -->
        <path id="chart-stroke" d="M 40,170 C 120,165 200,140 280,120 C 360,105 440,145 520,75 C 600,35 680,50 760,25 C 840,18 880,35 900,20" fill="none" stroke="#f88a08" stroke-width="3" stroke-linecap="round" />

        <!-- Highlight Nodes -->
        <circle cx="280" cy="120" r="5" fill="#f88a08" stroke="#1c1714" stroke-width="2"/>
        <circle cx="520" cy="75" r="5" fill="#f88a08" stroke="#1c1714" stroke-width="2"/>
        <circle cx="760" cy="25" r="7" fill="#ffad35" stroke="#fff" stroke-width="2"/>
      </svg>

      <!-- Dynamic Hover Scrubber Tooltip -->
      <div class="chart-tooltip" id="chart-tooltip">
        <span class="tooltip-time">08:00 PM Peak Sitting</span>
        <strong class="tooltip-val">$2,840 · 48 Covers</strong>
      </div>
    </div>

    <div class="chart-axis-labels">
      <span>12:00 PM</span>
      <span>02:00 PM</span>
      <span>04:00 PM</span>
      <span>06:00 PM</span>
      <span class="is-peak">08:00 PM (Peak)</span>
      <span>10:00 PM</span>
      <span>Close</span>
    </div>
  </div>

  <!-- Live Floor & Seating Grid -->
  <div class="floor-section ios-spring-enter">
    <div class="section-title-row">
      <div>
        <span class="card-kicker">REAL-TIME DINING ROOM LAYOUT</span>
        <h2>Active Tables &amp; Course Cadence</h2>
      </div>
      <button type="button" class="ios-action-btn secondary" data-go="tables">
        <span>View Full Floor</span> <i data-lucide="chevron-right"></i>
      </button>
    </div>

    <div class="tables-grid">
      ${tables.slice(0, 6).map(t => `
        <div class="table-card status-${t.status}" data-table-id="${t.id}">
          <div class="table-card-top">
            <span class="table-num">${t.name}</span>
            <span class="table-status-pill ${t.status}">${t.status}</span>
          </div>
          <div class="table-zone">${t.zone} · ${t.seats} Seats</div>
          <div class="table-guest">${t.guest || 'Open for seating'}</div>
          <div class="table-course-info">
            <i data-lucide="clock"></i>
            <span>${t.course ? `Current: ${t.course}` : t.time ? `At ${t.time}` : 'Ready for walk-ins'}</span>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Split Bento: Activity Stream & Shortcuts -->
  <div class="bento-dual-split ios-spring-enter">
    <div class="ios-card activity-card">
      <div class="card-title-row">
        <span class="card-kicker">CADENCE FEED</span>
        <h3>Recent Service Activity</h3>
      </div>
      <div class="activity-feed-list">
        ${getActivity().slice(0, 4).map(a => `
          <div class="activity-item">
            <div class="activity-icon-bubble"><i data-lucide="${a.icon}"></i></div>
            <div class="activity-copy">
              <p>${escape(a.text)}</p>
              <small>${escape(a.time)}</small>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="ios-card shortcuts-card">
      <div class="card-title-row">
        <span class="card-kicker">CONTROL SHORTCUTS</span>
        <h3>Quick Operations</h3>
      </div>
      <div class="shortcuts-action-list">
        <button type="button" class="shortcut-row" data-go="menu">
          <div class="shortcut-icon"><i data-lucide="utensils-crossed"></i></div>
          <div class="shortcut-text">
            <strong>Edit Living Carte</strong>
            <small>Adjust pricing, badges, and dietary labels</small>
          </div>
          <i data-lucide="chevron-right"></i>
        </button>

        <button type="button" class="shortcut-row" data-go="tables">
          <div class="shortcut-icon"><i data-lucide="calendar-days"></i></div>
          <div class="shortcut-text">
            <strong>Seating &amp; Reservations</strong>
            <small>Assign parties, manage table turnarounds</small>
          </div>
          <i data-lucide="chevron-right"></i>
        </button>

        <button type="button" class="shortcut-row" data-go="settings">
          <div class="shortcut-icon"><i data-lucide="sliders-horizontal"></i></div>
          <div class="shortcut-text">
            <strong>Front-Page Invitations</strong>
            <small>Tweak homepage text and service hours</small>
          </div>
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
  `
}

function menuPanel() {
  const items = getMenu()
  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="utensils-crossed"></i> MENU STUDIO</div>
      <h1>The Living <em>Carte.</em></h1>
      <p>Instant updates to dishes, prices, pairings, and dietary labels across the digital menu.</p>
    </div>
    <div class="view-header-actions">
      <button type="button" class="ios-action-btn primary" id="add-dish"><i data-lucide="plus"></i> <span>Add New Dish</span></button>
    </div>
  </div>

  <!-- iOS Search & Filter Segment Bar -->
  <div class="menu-control-bar ios-spring-enter">
    <div class="ios-search-field">
      <i data-lucide="search"></i>
      <input type="search" id="dash-menu-search" placeholder="Search dish by name, ingredients, or category…" aria-label="Search dishes">
      <button type="button" class="search-clear-btn" id="search-clear-btn" aria-label="Clear search" hidden><i data-lucide="x"></i></button>
    </div>

    <div class="ios-filter-pills" id="menu-category-pills">
      <button type="button" class="filter-pill is-active" data-cat="all">All (${items.length})</button>
      <button type="button" class="filter-pill" data-cat="breakfast">Morning</button>
      <button type="button" class="filter-pill" data-cat="lunch">Midday</button>
      <button type="button" class="filter-pill" data-cat="dinner">Evening</button>
      <button type="button" class="filter-pill" data-cat="drinks">Confections &amp; Cellar</button>
    </div>
  </div>

  <!-- Dishes Grid -->
  <div class="menu-items-grid ios-spring-enter" id="menu-items-grid">
    ${items.map(dishCardItem).join('')}
  </div>
  <p class="empty-notice-state" id="no-menu-results" hidden>
    <i data-lucide="search"></i>
    <span>No dishes match your search criteria. Try a different term or clear the filter.</span>
  </p>

  <div id="dish-dialog-root"></div>
  `
}

function dishCardItem(item) {
  const dietBadges = Array.isArray(item.diet)
    ? item.diet.map(d => `<span class="dish-mini-diet">${escape(d)}</span>`).join('')
    : ''

  return `
  <article class="dish-admin-card ios-spring-enter" data-category="${escape(item.category || 'dinner')}" data-search="${escape((item.name + ' ' + (item.categoryLabel || item.category) + ' ' + (item.description || '')).toLowerCase())}">
    <div class="dish-card-thumb">
      <img src="${escape(item.image)}" alt="${escape(item.name)}" loading="lazy">
      <span class="dish-cat-tag">${escape(item.categoryLabel || item.category || 'Mains')}</span>
    </div>
    <div class="dish-card-details">
      <div class="dish-title-row">
        <h3>${escape(item.name)}</h3>
        <span class="dish-card-price">$${Number(item.price || 0).toFixed(2)}</span>
      </div>
      <p class="dish-card-desc">${escape(item.description || 'Artisanal wood-fired creation.')}</p>
      ${dietBadges ? `<div class="dish-diet-row">${dietBadges}</div>` : ''}
    </div>
    <div class="dish-card-actions">
      <button type="button" class="dish-act-btn edit" data-edit="${escape(item.id)}" aria-label="Edit ${escape(item.name)}">
        <i data-lucide="pencil"></i> <span>Edit</span>
      </button>
      <button type="button" class="dish-act-btn delete" data-delete="${escape(item.id)}" aria-label="Delete ${escape(item.name)}">
        <i data-lucide="trash-2"></i>
      </button>
    </div>
  </article>
  `
}

function tablesPanel() {
  const tables = getTables()
  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="calendar-days"></i> FLOOR &amp; SEATING</div>
      <h1>Dining Room <em>Layout.</em></h1>
      <p>Interactive table assignments, party sizes, service courses, and real-time floor availability.</p>
    </div>
    <div class="view-header-actions">
      <button type="button" class="ios-action-btn primary" id="btn-reset-floor"><i data-lucide="refresh-cw"></i> <span>Reset Evening Session</span></button>
    </div>
  </div>

  <div class="tables-full-grid ios-spring-enter">
    ${tables.map(t => `
      <div class="table-admin-tile status-${t.status}" data-table-id="${t.id}">
        <div class="tile-header">
          <div class="tile-number-group">
            <span class="tile-id">${t.id}</span>
            <h4>${t.name}</h4>
          </div>
          <span class="table-status-pill ${t.status}">${t.status}</span>
        </div>
        <div class="tile-meta">
          <span><i data-lucide="compass"></i> ${t.zone}</span>
          <span><i data-lucide="users"></i> ${t.seats} Guests Max</span>
        </div>
        <div class="tile-guest-info">
          <strong>${t.guest || 'Available / Open'}</strong>
          <small>${t.course ? `Course: ${t.course}` : t.time ? `Reserved: ${t.time}` : 'Table ready for walk-ins'}</small>
          ${t.spend ? `<span class="tile-spend">Check Total: ${t.spend}</span>` : ''}
          ${t.note ? `<span class="tile-note"><i data-lucide="info"></i> ${escape(t.note)}</span>` : ''}
        </div>
        <div class="tile-action-bar">
          <button type="button" class="tile-toggle-btn" data-toggle-table="${t.id}">
            <span>Toggle Status</span> <i data-lucide="chevron-right"></i>
          </button>
        </div>
      </div>
    `).join('')}
  </div>
  `
}

function updatesPanel() {
  const u = getUpdate() || {}
  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="megaphone"></i> GUEST ANNOUNCEMENTS</div>
      <h1>Website <em>Broadcast.</em></h1>
      <p>Compose announcement modal banners that appear directly for visitors browsing the restaurant site.</p>
    </div>
  </div>

  <div class="ios-split-composer ios-spring-enter">
    <!-- Left Composer Form -->
    <form class="ios-card composer-form" id="update-form">
      <div class="card-title-row">
        <span class="card-kicker">COMPOSE ANNOUNCEMENT</span>
        <h3>Broadcast Details</h3>
      </div>

      <label class="ios-label">
        Small Overline Eyebrow
        <input name="eyebrow" maxlength="45" value="${escape(u.eyebrow || 'A NOTE FROM FLAVORO')}" required>
      </label>

      <label class="ios-label">
        Main Heading Title
        <input name="title" maxlength="80" value="${escape(u.title || '')}" placeholder="e.g. Autumn Woodfire Tasting Menu Now Open" required>
      </label>

      <label class="ios-label">
        Message to Guests
        <textarea name="message" maxlength="300" rows="4" placeholder="Describe the announcement, seasonal produce, or special event..." required>${escape(u.message || '')}</textarea>
      </label>

      <div class="ios-form-row">
        <label class="ios-label">
          Button Label (Optional)
          <input name="buttonLabel" maxlength="35" value="${escape(u.buttonLabel || '')}" placeholder="Explore the menu">
        </label>
        <label class="ios-label">
          Destination URL
          <input name="buttonUrl" maxlength="200" value="${escape(u.buttonUrl || '')}" placeholder="/pages/menu.html">
        </label>
      </div>

      <!-- iOS Toggle Switch -->
      <div class="ios-toggle-row">
        <label class="ios-switch">
          <input type="checkbox" name="enabled" ${u.enabled ? 'checked' : ''}>
          <span class="switch-slider"></span>
        </label>
        <div class="toggle-text">
          <strong>Publish live on website</strong>
          <small>Display immediately to all guests visiting Flavoro</small>
        </div>
      </div>

      <div class="composer-actions">
        <button type="submit" class="ios-action-btn primary"><i data-lucide="check"></i> <span>Save &amp; Broadcast</span></button>
        <button type="button" class="ios-action-btn secondary" id="remove-update"><span>Clear Broadcast</span></button>
      </div>
    </form>

    <!-- Right: Real-time Live Phone / Device Preview -->
    <div class="ios-card preview-card">
      <div class="preview-device-frame">
        <div class="device-notch"></div>
        <div class="announcement-live-mock">
          <span class="mock-spark-icon"><i data-lucide="flame"></i></span>
          <small data-preview="eyebrow">${escape(u.eyebrow || 'A NOTE FROM FLAVORO')}</small>
          <h3 data-preview="title">${escape(u.title || 'A little something new at the table.')}</h3>
          <p data-preview="message">${escape(u.message || 'Your broadcast message will render here in real time as you compose.')}</p>
          <span class="mock-button-preview" data-preview="buttonLabel">${escape(u.buttonLabel || 'EXPLORE CARTE')} ↗</span>
        </div>
      </div>
    </div>
  </div>
  `
}

function operationsPanel() {
  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="activity"></i> SYSTEMS &amp; INFRASTRUCTURE</div>
      <h1>Operations <em>Grid.</em></h1>
      <p>Connection status across booking providers, POS terminals, cellar stock, and kitchen hearth pass.</p>
    </div>
    <div class="view-header-actions">
      <button type="button" class="ios-action-btn secondary" id="btn-run-diagnostics"><i data-lucide="refresh-cw"></i> <span>Run System Diagnostics</span></button>
    </div>
  </div>

  <div class="operations-cards-grid ios-spring-enter">
    ${[
      ['calendar-days', 'Table Reservation Engine', 'Synchronized', 'SevenRooms / OpenTable bridge live for evening bookings and seat holds.', 'active'],
      ['flame', 'Kitchen Hearth Pass (KDS)', 'Active Cadence', 'Woodfire oven telemetry maintaining continuous 700° oak ember temperature.', 'active'],
      ['shopping-bag', 'POS & Order Terminal', 'Connected Preview', 'Payment processing and guest order bag checkout testing environment.', 'active'],
      ['wine', 'Cellar Inventory System', '248 Bottles Tracked', 'Low-intervention, organic, and biodynamic pairings cataloged for flights.', 'active'],
      ['users', 'Guest CRM & VIP Registry', '1,420 Guests', 'Notes on anniversary milestones, preferred booths, and dietary restrictions.', 'active'],
      ['shield-check', 'Day-Boat & Farm Supply', 'Verified Delivery', 'Daily seafood harvest and organic grower crates logged at dawn pass.', 'active'],
    ].map(([ic, title, status, desc, stateClass]) => `
      <div class="ios-card op-card">
        <div class="op-card-top">
          <div class="op-icon-bubble"><i data-lucide="${ic}"></i></div>
          <span class="op-status-badge ${stateClass}"><span class="badge-dot"></span> ${status}</span>
        </div>
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `).join('')}
  </div>
  `
}

function settingsPanel() {
  const s = getSettings()
  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="sliders-horizontal"></i> SITE SETTINGS</div>
      <h1>Homepage <em>Invitation.</em></h1>
      <p>Fine-tune the words that greet guests the moment they arrive at Flavoro.</p>
    </div>
  </div>

  <div class="ios-split-composer ios-spring-enter">
    <form class="ios-card composer-form" id="settings-form">
      <div class="card-title-row">
        <span class="card-kicker">HERO DISPLAY COPY</span>
        <h3>The Welcome Invitation</h3>
      </div>

      <label class="ios-label">
        First Line (Uppercase Headline)
        <input name="headline" maxlength="35" required value="${escape(s.headline)}">
      </label>

      <label class="ios-label">
        Second Line (Script Accent)
        <input name="accent" maxlength="35" required value="${escape(s.accent)}">
      </label>

      <label class="ios-label">
        Closing Subtitle Line
        <input name="subline" maxlength="50" required value="${escape(s.subline)}">
      </label>

      <label class="ios-label">
        Restaurant Hours Text
        <input name="hours" maxlength="60" value="${escape(s.hours || 'Wed – Sun: 5:30 PM – 11:00 PM')}">
      </label>

      <button type="submit" class="ios-action-btn primary"><i data-lucide="check"></i> <span>Save Homepage Copy</span></button>
    </form>

    <div class="ios-card hero-preview-card">
      <img src="/images/hero-pasta.jpg" alt="Hero Background">
      <div class="hero-preview-overlay">
        <span class="preview-spark-kicker"><i data-lucide="flame"></i> LIVE HOMEPAGE PREVIEW</span>
        <h2>${escape(s.headline)}<br><em>${escape(s.accent)}</em></h2>
        <p>${escape(s.subline)}</p>
        <span class="preview-hours">${escape(s.hours || 'Wed – Sun: 5:30 PM – 11:00 PM')}</span>
      </div>
    </div>
  </div>
  `
}

const adminPanels = {
  overview: adminOverview,
  menu: menuPanel,
  reservations: renderAdminReservationsPanel,
  tables: tablesPanel,
  updates: updatesPanel,
  operations: operationsPanel,
  settings: settingsPanel,
}

/* =========================================================================
   USER DASHBOARD PANELS (GUEST CLUB)
   ========================================================================= */

function userOverview() {
  const p = getProfile()
  const favorites = getFavorites()
  const nextRes = getNextCustomerReservationView()
  const preferences = getUserPreferences()
  const firstName = p.name ? p.name.split(' ')[0] : 'Guest'

  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="compass"></i> PRIVATE SALON &amp; GUEST CLUB</div>
      <h1>Welcome back, <em>${escape(firstName)}.</em></h1>
      <p>Your saved tastings, upcoming hearth reservations, and curated flavor preferences.</p>
    </div>
    <div class="view-header-actions">
      <a class="ios-action-btn primary" href="/pages/reservations.html"><i data-lucide="calendar-days"></i> <span>Book a Table</span></a>
      <a class="ios-action-btn secondary" href="/pages/menu.html"><i data-lucide="utensils-crossed"></i> <span>View Menu</span></a>
    </div>
  </div>

  <!-- User KPI & Status Row -->
  <div class="kpi-grid ios-spring-enter">
    <div class="ios-card kpi-card" data-go="favorites">
      <div class="kpi-head">
        <span class="kpi-label">YOUR FAVORITES</span>
        <div class="kpi-icon-bubble orange"><i data-lucide="heart"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number">${favorites.length}</span>
        <span class="kpi-delta neutral">Saved Dishes</span>
      </div>
      <span class="kpi-subtext">Click to view your curated collection</span>
    </div>

    <div class="ios-card kpi-card" data-go="activity">
      <div class="kpi-head">
        <span class="kpi-label">UPCOMING TABLE</span>
        <div class="kpi-icon-bubble amber"><i data-lucide="calendar-days"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number" style="font-size: 26px; line-height: 1.2;">${nextRes ? nextRes.time : 'None'}</span>
        <span class="kpi-delta positive">${nextRes ? nextRes.status : 'Open'}</span>
      </div>
      <span class="kpi-subtext">${nextRes ? `${nextRes.date} · ${nextRes.zone}` : 'Book your next dining experience'}</span>
    </div>

    <div class="ios-card kpi-card" data-go="taste">
      <div class="kpi-head">
        <span class="kpi-label">FLAVOR PASSPORT</span>
        <div class="kpi-icon-bubble green"><i data-lucide="compass"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number">${preferences.length}</span>
        <span class="kpi-delta positive">Taste Profiles</span>
      </div>
      <span class="kpi-subtext">Oak fire, natural wines, seasonal game</span>
    </div>

    <div class="ios-card kpi-card" data-go="profile">
      <div class="kpi-head">
        <span class="kpi-label">MEMBERSHIP STATUS</span>
        <div class="kpi-icon-bubble purple"><i data-lucide="shield-check"></i></div>
      </div>
      <div class="kpi-main">
        <span class="kpi-number" style="font-size: 24px;">Founding</span>
        <span class="kpi-delta positive">Tier II Guest</span>
      </div>
      <span class="kpi-subtext">Priority reservation access &amp; cellar flights</span>
    </div>
  </div>

  <!-- Next Reservation Spotlight Card -->
  ${nextRes ? `
    <div class="ios-card res-spotlight-card ios-spring-enter">
      <div class="spotlight-visual">
        <img src="/images/restaurant-interior.jpg" alt="Interior Dining Room">
        <div class="spotlight-visual-shade"></div>
        <span class="spotlight-badge"><i data-lucide="check-circle-2"></i> ${escape(String(nextRes.status).toUpperCase())} SITTING</span>
      </div>
      <div class="spotlight-content">
        <span class="card-kicker">YOUR NEXT EVENING WITH US</span>
        <h2>${escape(nextRes.experience)}</h2>
        <div class="spotlight-details-grid">
          <div><i data-lucide="calendar-days"></i> <span>${escape(nextRes.date)}</span></div>
          <div><i data-lucide="clock"></i> <span>${escape(nextRes.time)}</span></div>
          <div><i data-lucide="users"></i> <span>${escape(nextRes.guests)} Guests</span></div>
          <div><i data-lucide="compass"></i> <span>${escape(nextRes.zone)}</span></div>
        </div>
        <p class="spotlight-note"><i data-lucide="info"></i> ${escape(nextRes.notes)}</p>
        <div class="spotlight-actions">
          <a href="/pages/reservations.html?manage=${encodeURIComponent(nextRes.id)}" class="ios-action-btn secondary"><span>Modify Booking</span></a>
          <a href="/pages/menu.html" class="ios-action-btn primary"><span>Explore Tonight's Carte</span> <i data-lucide="arrow-up-right"></i></a>
        </div>
      </div>
    </div>
  ` : ''}

  <!-- Taste Profile & Curated Pairings -->
  <div class="bento-dual-split ios-spring-enter">
    <div class="ios-card passport-card">
      <div class="card-title-row">
        <span class="card-kicker">YOUR FLAVOR PREFERENCES</span>
        <h3>Culinary Profile</h3>
      </div>
      <p class="passport-desc">These flavor memories guide our kitchen and sommelier when preparing your table.</p>
      <div class="passport-tags-wrap">
        ${preferences.map(tag => `<span class="passport-pill"><i data-lucide="flame"></i> ${escape(tag)}</span>`).join('')}
      </div>
      <button type="button" class="ios-action-btn secondary" data-go="taste"><span>Manage Taste Profile</span> <i data-lucide="chevron-right"></i></button>
    </div>

    <div class="ios-card sommelier-card">
      <div class="card-title-row">
        <span class="card-kicker">CHEF &amp; SOMMELIER NOTE</span>
        <h3>Harvest Spotlight</h3>
      </div>
      <div class="sommelier-pick">
        <div class="sommelier-icon"><i data-lucide="wine"></i></div>
        <div>
          <strong>2021 Jura Savagnin Ouillé</strong>
          <p>Crisp orchard fruit and flinty minerality, poured specifically to accompany our wood-fired red snapper fillet.</p>
        </div>
      </div>
      <a href="/pages/menu.html#act-confections" class="ios-action-btn secondary"><span>Explore Cellar Flights</span> <i data-lucide="arrow-up-right"></i></a>
    </div>
  </div>
  `
}

function favoritesPanel() {
  const saved = getFavorites()
  const items = getMenu()
  const favoriteItems = saved.map((id) => items.find((i) => i.id === id)).filter(Boolean)

  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="heart"></i> CURATED SAVED DISHES</div>
      <h1>Your Private <em>Collection.</em></h1>
      <p>Dishes and cellar pairings you have earmarked for your next evening around the table.</p>
    </div>
  </div>

  <!-- Add to favorites selector -->
  <div class="ios-card fav-add-bar ios-spring-enter">
    <label for="favorite-select" class="fav-add-label">Save an additional dish to your personal collection:</label>
    <div class="fav-add-controls">
      <select id="favorite-select" class="ios-select">
        ${items.map(i => `<option value="${escape(i.id)}">${escape(i.name)} (${escape(i.categoryLabel || i.category)}) — $${Number(i.price || 0).toFixed(2)}</option>`).join('')}
      </select>
      <button type="button" class="ios-action-btn primary" id="add-favorite"><i data-lucide="plus"></i> <span>Save Dish</span></button>
    </div>
  </div>

  <div class="favorites-gallery-grid ios-spring-enter">
    ${favoriteItems.length > 0 ? favoriteItems.map(item => `
      <article class="fav-item-card">
        <div class="fav-card-image">
          <img src="${escape(item.image)}" alt="${escape(item.name)}">
          <span class="fav-cat-tag">${escape(item.categoryLabel || item.category)}</span>
        </div>
        <div class="fav-card-body">
          <div class="fav-card-title-row">
            <h3>${escape(item.name)}</h3>
            <span class="fav-price">$${Number(item.price || 0).toFixed(2)}</span>
          </div>
          <p class="fav-desc">${escape(item.description || 'Artisanal live hearth creation.')}</p>
          <div class="fav-card-actions">
            <button type="button" class="fav-remove-btn" data-unfavorite="${escape(item.id)}">
              <i data-lucide="trash-2"></i> <span>Remove</span>
            </button>
            <a href="/pages/menu.html" class="fav-menu-link">
              <span>View in Menu</span> <i data-lucide="arrow-up-right"></i>
            </a>
          </div>
        </div>
      </article>
    `).join('') : `
      <div class="empty-fav-state">
        <i data-lucide="heart"></i>
        <h3>No saved dishes yet</h3>
        <p>Use the selector above or browse the menu to save dishes for your next visit.</p>
        <a href="/pages/menu.html" class="ios-action-btn primary"><span>Explore The Menu</span> ↗</a>
      </div>
    `}
  </div>
  `
}

function userActivityPanel() {
  return renderCustomerReservationsPanel()
}

function tasteProfilePanel() {
  const preferences = getUserPreferences()
  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="compass"></i> TASTE PROFILE</div>
      <h1>Flavor <em>Passport.</em></h1>
      <p>Configure your taste affinities, beverage preferences, and dining comfort nuances.</p>
    </div>
  </div>

  <div class="ios-card taste-manager-card ios-spring-enter">
    <div class="card-title-row">
      <span class="card-kicker">CURATED PREFERENCES</span>
      <h3>Active Flavor Tags</h3>
    </div>
    <p class="taste-desc">Our kitchen brigade and front-of-house leads reference these notes before every service.</p>

    <div class="taste-pill-editor" id="taste-pill-container">
      ${preferences.map((tag, idx) => `
        <span class="editable-taste-pill">
          <span>${escape(tag)}</span>
          <button type="button" class="pill-remove" data-remove-taste="${idx}" aria-label="Remove ${escape(tag)}">&times;</button>
        </span>
      `).join('')}
    </div>

    <div class="add-taste-form">
      <input type="text" id="new-taste-input" class="ios-input" placeholder="Add a preference (e.g. Rare Game, Oloroso Sherry, Heirloom Brassicas)...">
      <button type="button" class="ios-action-btn primary" id="btn-add-taste"><i data-lucide="plus"></i> <span>Add Tag</span></button>
    </div>
  </div>
  `
}

function profilePanel() {
  const p = getProfile()
  return `
  <div class="dash-view-header ios-spring-enter">
    <div class="view-title-group">
      <div class="ios-capsule-badge"><i data-lucide="user-round"></i> GUEST PROFILE</div>
      <h1>Personal <em>Details.</em></h1>
      <p>Manage your contact details, table setting preferences, and allergen notes.</p>
    </div>
  </div>

  <form id="profile-form" class="ios-card profile-card ios-spring-enter">
    <div class="card-title-row">
      <span class="card-kicker">MEMBER INFORMATION</span>
      <h3>Hospitality Settings</h3>
    </div>

    <div class="ios-form-row">
      <label class="ios-label">
        Full Name
        <input name="name" maxlength="60" value="${escape(p.name)}" placeholder="Your full name" required>
      </label>
      <label class="ios-label">
        Email Address
        <input name="email" type="email" maxlength="120" value="${escape(p.email)}" placeholder="you@example.com" required>
      </label>
    </div>

    <div class="ios-form-row">
      <label class="ios-label">
        Phone Number
        <input name="phone" type="tel" maxlength="30" value="${escape(p.phone || '+1 (555) 234-8900')}" placeholder="+1 (555) 000-0000">
      </label>
      <label class="ios-label">
        Preferred Seating Zone
        <select name="seating" class="ios-select">
          <option value="Hearth Counter" ${p.seating === 'Hearth Counter' ? 'selected' : ''}>Fire Hearth Counter</option>
          <option value="Main Dining Salon" ${p.seating === 'Main Dining Salon' ? 'selected' : ''}>Main Dining Salon (Booth)</option>
          <option value="Garden Terrace" ${p.seating === 'Garden Terrace' ? 'selected' : ''}>Secret Garden Terrace</option>
          <option value="Private Alcove" ${p.seating === 'Private Alcove' ? 'selected' : ''}>Private Dining Alcove</option>
        </select>
      </label>
    </div>

    <label class="ios-label">
      Dining Preferences &amp; Allergen Passport
      <textarea name="preferences" maxlength="300" rows="4" placeholder="Detail any dietary preferences, anniversary dates, or favorite sommelier pairings...">${escape(p.preferences)}</textarea>
    </label>

    <button type="submit" class="ios-action-btn primary"><i data-lucide="check"></i> <span>Save Profile Settings</span></button>
  </form>
  `
}

const userPanels = {
  overview: userOverview,
  favorites: favoritesPanel,
  activity: userActivityPanel,
  taste: tasteProfilePanel,
  profile: profilePanel,
}

/* =========================================================================
   DISH DIALOG (APPLE MODAL SHEET)
   ========================================================================= */

function dishDialog(id) {
  const item = getMenu().find((i) => i.id === id)
  const d = item || {
    name: '',
    category: 'dinner',
    price: '',
    description: '',
    image: '/images/hero-pasta.jpg',
    diet: [],
  }

  const overlay = document.querySelector('#dish-dialog-root')
  overlay.innerHTML = `
  <div class="dash-modal" role="dialog" aria-modal="true" aria-labelledby="dish-dialog-title">
    <div class="dash-modal-backdrop"></div>
    <div class="dash-modal-card">
      <div class="modal-heading">
        <div>
          <span class="card-kicker">CARTE REVISION</span>
          <h2 id="dish-dialog-title">${item ? 'Edit Dish' : 'Add New Creation'}</h2>
        </div>
        <button class="dash-close" type="button" aria-label="Close dialog"><i data-lucide="x"></i></button>
      </div>

      <form id="dish-form">
        <label class="ios-label">Dish Name
          <input name="name" maxlength="80" required value="${escape(d.name)}" placeholder="e.g. Wood-Fired Heritage Ribeye">
        </label>

        <div class="ios-form-row">
          <label class="ios-label">Category
            <select name="category" class="ios-select">
              ${[
                ['breakfast', 'Morning'],
                ['lunch', 'Midday'],
                ['dinner', 'Evening'],
                ['drinks', 'Confections & Drinks'],
              ].map(([v, l]) => `<option value="${v}" ${d.category === v ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </label>
          <label class="ios-label">Price ($ USD)
            <input name="price" type="number" min="0" max="99999" step="0.01" required value="${escape(d.price)}" placeholder="38.00">
          </label>
        </div>

        <label class="ios-label">Description &amp; Provenance
          <textarea name="description" required maxlength="300" rows="3" placeholder="Describe the ingredients, woodfire technique, and seasonal sourcing...">${escape(d.description)}</textarea>
        </label>

        <label class="ios-label">Plate Photograph
          <select name="image" class="ios-select">
            ${item ? `<option value="${escape(d.image)}" selected>Current photograph (${escape(d.image)})</option>` : ''}
            ${[
              ['/images/hero-pasta.jpg', 'Signature Hearth Pasta'],
              ['/images/market-fish.jpg', 'Day-Boat Market Fish'],
              ['/images/garden-salad.jpg', 'Foraged Greens & Salad'],
              ['/images/restaurant-interior.jpg', 'Dining Salon Platter'],
              ['/images/breakfast.jpg', 'Morning Sourdough & Eggs'],
              ['/images/menu/breakfast-eggs.jpg', 'Heritage Breakfast Eggs'],
              ['/images/menu/chocolate-dessert.jpg', 'Smoked Chocolate Dessert'],
              ['/images/dessert.jpg', 'Glazed Embers Dessert'],
              ['/images/cocktails.jpg', 'Bar Cellar Cocktail'],
              ['/images/menu/cocktail.jpg', 'Botanical Spirit Cocktail'],
              ['/images/menu/pasta-editorial.jpg', 'Hand-Rolled Pasta'],
            ].map(([v, l]) => `<option value="${v}" ${d.image === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>

        <fieldset class="ios-fieldset">
          <legend>Dietary Certifications</legend>
          <div class="diet-checks-row">
            ${['vegetarian', 'gluten-free', 'spicy'].map(v => `
              <label class="dash-check">
                <input type="checkbox" name="diet" value="${v}" ${d.diet?.includes(v) ? 'checked' : ''}>
                <span>${v}</span>
              </label>
            `).join('')}
          </div>
        </fieldset>

        <div class="modal-form-actions">
          <button type="submit" class="ios-action-btn primary"><i data-lucide="check"></i> <span>Save Dish to Carte</span></button>
          <button type="button" class="ios-action-btn secondary dash-cancel"><span>Cancel</span></button>
        </div>
      </form>
    </div>
  </div>
  `

  createIcons({ icons })
  const modal = overlay.querySelector('.dash-modal')
  const card = overlay.querySelector('.dash-modal-card')
  const previous = document.activeElement

  // Spring animation for modal entry
  gsap.fromTo(card, { y: 60, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.6)' })

  const close = () => {
    gsap.to(card, {
      y: 40,
      scale: 0.96,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        overlay.innerHTML = ''
        previous?.focus()
      },
    })
  }

  modal.querySelector('.dash-close').onclick = close
  modal.querySelector('.dash-cancel').onclick = close
  modal.querySelector('.dash-modal-backdrop').onclick = close
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const category = data.get('category')
    const next = {
      ...(item || {
        id: 'dish-' + crypto.randomUUID(),
        ingredients: [],
        addons: [],
        pairing: '',
        allergens: [],
        badge: '',
        prepTime: '',
        calories: '',
      }),
      name: clean(data.get('name')),
      category,
      categoryLabel: {
        breakfast: 'Morning',
        lunch: 'Midday',
        dinner: 'Evening',
        drinks: 'Confections & Drinks',
      }[category] || 'Mains',
      price: Number(data.get('price')),
      description: clean(data.get('description')),
      image: data.get('image'),
      diet: data.getAll('diet'),
    }

    if (!next.name || !next.description) return
    const list = getMenu()
    if (item) list.splice(list.findIndex((i) => i.id === id), 1, next)
    else list.unshift(next)

    saveMenu(list)
    show('menu')
    toast(item ? 'Dish updated in living carte.' : 'New dish added to menu pass.', 'flame')
  }
}

/* =========================================================================
   EVENT BINDINGS & INTERACTIONS
   ========================================================================= */

function bind() {
  // Reservation management panels (admin ledger / customer bookings)
  bindAdminReservations(root, { show, toast })
  bindCustomerReservations(root, { show, toast })

  // Navigation shortcuts
  root.querySelectorAll('[data-go]').forEach((b) => {
    b.onclick = () => show(b.dataset.go)
  })

  // Quick Dish modal
  root.querySelector('#btn-quick-dish')?.addEventListener('click', () => dishDialog())
  root.querySelector('#add-dish')?.addEventListener('click', () => dishDialog())
  root.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => dishDialog(b.dataset.edit)))

  // Delete dish
  root.querySelectorAll('[data-delete]').forEach((b) => {
    b.onclick = () => {
      const item = getMenu().find((i) => i.id === b.dataset.delete)
      if (item && confirm(`Remove "${item.name}" from the active carte?`)) {
        saveMenu(getMenu().filter((i) => i.id !== item.id))
        show('menu')
        toast('Dish removed from carte.', 'info')
      }
    }
  })

  // Menu Search & Filter
  const searchInput = root.querySelector('#dash-menu-search')
  const clearBtn = root.querySelector('#search-clear-btn')

  if (searchInput) {
    let activeCat = 'all'
    const filterItems = () => {
      const query = searchInput.value.trim().toLowerCase()
      clearBtn.hidden = !query
      let visibleCount = 0

      root.querySelectorAll('.dish-admin-card').forEach((card) => {
        const matchesQuery = card.dataset.search.includes(query)
        const matchesCat = activeCat === 'all' || card.dataset.category === activeCat
        const isVisible = matchesQuery && matchesCat
        card.hidden = !isVisible
        if (isVisible) visibleCount++
      })

      const noRes = root.querySelector('#no-menu-results')
      if (noRes) noRes.hidden = visibleCount > 0
    }

    searchInput.addEventListener('input', filterItems)
    clearBtn?.addEventListener('click', () => {
      searchInput.value = ''
      filterItems()
      searchInput.focus()
    })

    root.querySelectorAll('#menu-category-pills .filter-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        root.querySelectorAll('#menu-category-pills .filter-pill').forEach((p) => p.classList.remove('is-active'))
        pill.classList.add('is-active')
        activeCat = pill.dataset.cat
        filterItems()
      })
    })
  }

  // Chart Segment Buttons
  root.querySelectorAll('#chart-segments .segment-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('#chart-segments .segment-btn').forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      currentChartPeriod = btn.dataset.period

      // Animate chart morph
      const pathArea = root.querySelector('#chart-area')
      const pathStroke = root.querySelector('#chart-stroke')

      let newAreaD = 'M 40,170 C 120,165 200,140 280,120 C 360,105 440,145 520,75 C 600,35 680,50 760,25 C 840,18 880,35 900,20 L 900,200 L 40,200 Z'
      let newStrokeD = 'M 40,170 C 120,165 200,140 280,120 C 360,105 440,145 520,75 C 600,35 680,50 760,25 C 840,18 880,35 900,20'

      if (currentChartPeriod === 'week') {
        newAreaD = 'M 40,150 C 140,110 240,135 340,90 C 440,80 540,110 640,40 C 740,20 840,55 900,30 L 900,200 L 40,200 Z'
        newStrokeD = 'M 40,150 C 140,110 240,135 340,90 C 440,80 540,110 640,40 C 740,20 840,55 900,30'
      } else if (currentChartPeriod === 'month') {
        newAreaD = 'M 40,180 C 130,130 220,150 320,100 C 420,60 520,80 620,45 C 720,30 820,40 900,15 L 900,200 L 40,200 Z'
        newStrokeD = 'M 40,180 C 130,130 220,150 320,100 C 420,60 520,80 620,45 C 720,30 820,40 900,15'
      }

      gsap.to(pathStroke, { attr: { d: newStrokeD }, duration: 0.6, ease: 'power2.inOut' })
      gsap.to(pathArea, { attr: { d: newAreaD }, duration: 0.6, ease: 'power2.inOut' })
      toast(`Viewing telemetry for ${btn.textContent}`, 'info')
    })
  })

  // Table Toggle Status (Admin)
  root.querySelectorAll('[data-toggle-table]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.toggleTable
      const tables = getTables()
      const t = tables.find((item) => item.id === id)
      if (!t) return

      const states = ['open', 'reserved', 'seated', 'plating', 'clearing']
      const nextIdx = (states.indexOf(t.status) + 1) % states.length
      t.status = states[nextIdx]
      saveTables(tables)
      show('tables')
      toast(`${t.name} status updated to: ${t.status.toUpperCase()}`, 'flame')
    }
  })

  // Reset Floor Session
  root.querySelector('#btn-reset-floor')?.addEventListener('click', () => {
    resetTableCollection()
    show('tables')
    toast('Evening seating session reset to defaults.', 'info')
  })

  // Run System Diagnostics
  root.querySelector('#btn-run-diagnostics')?.addEventListener('click', () => {
    toast('Running diagnostics: POS, KDS, & SevenRooms connectivity nominal.', 'success')
  })

  // Settings form
  root.querySelector('#settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    saveSettings({
      ...getSettings(),
      headline: clean(f.get('headline')),
      accent: clean(f.get('accent')),
      subline: clean(f.get('subline')),
      hours: clean(f.get('hours')),
    })
    show('settings')
    toast('Homepage invitation text saved.', 'success')
  })

  // Profile form
  root.querySelector('#profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    saveProfile({
      ...getProfile(),
      name: clean(f.get('name')),
      email: clean(f.get('email')),
      phone: clean(f.get('phone')),
      seating: clean(f.get('seating')),
      preferences: clean(f.get('preferences')),
    })
    toast('Guest profile & hospitality notes saved.', 'success')
  })

  // Updates form (realtime typing preview)
  const updateForm = root.querySelector('#update-form')
  if (updateForm) {
    updateForm.addEventListener('input', () => {
      ;['eyebrow', 'title', 'message', 'buttonLabel'].forEach((key) => {
        const el = root.querySelector(`[data-preview="${key}"]`)
        if (el) {
          el.textContent =
            updateForm.elements[key].value ||
            {
              eyebrow: 'A NOTE FROM FLAVORO',
              title: 'A little something new.',
              message: 'Your message to guests will appear here.',
              buttonLabel: 'DISCOVER MORE',
            }[key]
        }
      })
    })

    updateForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const f = new FormData(updateForm)
      const url = clean(f.get('buttonUrl'))
      if (url && (!url.startsWith('/') || url.startsWith('//'))) {
        toast('Use an internal path beginning with /', 'info')
        return
      }
      saveUpdate({
        eyebrow: clean(f.get('eyebrow')),
        title: clean(f.get('title')),
        message: clean(f.get('message')),
        buttonLabel: clean(f.get('buttonLabel')),
        buttonUrl: url,
        enabled: f.has('enabled'),
        id: crypto.randomUUID(),
      })
      toast('Broadcast updated for website visitors.', 'flame')
    })

    root.querySelector('#remove-update')?.addEventListener('click', () => {
      saveUpdate(null)
      show('updates')
      toast('Broadcast notice removed.', 'info')
    })
  }

  // Favorites add
  root.querySelector('#add-favorite')?.addEventListener('click', () => {
    const sel = root.querySelector('#favorite-select')
    if (!sel) return
    const id = sel.value
    const fav = getFavorites()
    if (id && !fav.includes(id)) {
      fav.unshift(id)
      saveFavorites(fav)
      show('favorites')
      toast('Dish saved to your private collection.', 'flame')
    } else {
      toast('This dish is already in your favorites.', 'info')
    }
  })

  // Favorites remove
  root.querySelectorAll('[data-unfavorite]').forEach((b) => {
    b.onclick = () => {
      const fav = getFavorites().filter((id) => id !== b.dataset.unfavorite)
      saveFavorites(fav)
      show('favorites')
      toast('Dish removed from saved collection.', 'info')
    }
  })

  // Taste tags remove
  root.querySelectorAll('[data-remove-taste]').forEach((b) => {
    b.onclick = () => {
      const idx = Number(b.dataset.removeTaste)
      const list = getUserPreferences()
      list.splice(idx, 1)
      saveUserPreferences(list)
      show('taste')
      toast('Taste preference tag removed.', 'info')
    }
  })

  // Taste tag add
  const addTasteInput = root.querySelector('#new-taste-input')
  root.querySelector('#btn-add-taste')?.addEventListener('click', () => {
    const val = clean(addTasteInput?.value)
    if (!val) return
    const list = getUserPreferences()
    if (!list.includes(val)) {
      list.push(val)
      saveUserPreferences(list)
      show('taste')
      toast(`Added "${val}" to taste passport.`, 'success')
    }
  })
}

// Initial render
show('overview')
