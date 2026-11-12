import { menuItems } from './menu-data.js'
import { getMenu } from './dashboard-data.js'
import { initializeIcons } from './icons.js'

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

// Order state
let order = []
try {
  const saved = sessionStorage.getItem('flavoro_order_bag')
  if (saved) order = JSON.parse(saved)
} catch (e) {
  order = []
}

function saveOrder() {
  try {
    sessionStorage.setItem('flavoro_order_bag', JSON.stringify(order))
  } catch (e) {}
  updateCartBadge()
  renderOrderDrawer()
}

// Active filters for the Hearth Order Pass
const filters = {
  search: '',
  category: 'all',
  diet: 'all',
  sortBy: 'default',
}

// Current customization modal state
let activeDish = null
let customModalState = {
  excludedIngredients: [], // list of ingredient names user wants REMOVED / DO NOT ADD
  selectedAddons: [],      // list of addon objects user wants ADDED
  spice: 'medium',
  notes: '',
  qty: 1,
}

// Bespoke Scratch Studio state
const scratchStudioState = {
  base: 'Wood-Fired Heritage Sourdough',
  basePrice: 6,
  protein: '12-Hour Smoked Beef Short Ribs',
  proteinPrice: 22,
  cookingStyle: 'Ember-Charred Over Wild Cherrywood',
  dislikes: [], // "DO NOT ADD" items for the custom dish
  sauce: 'Truffle & Roasted Bone Marrow Emulsion',
  saucePrice: 4,
}

export function initMenuFeatures() {
  const managedMenu = getMenu()
  menuItems.splice(0, menuItems.length, ...managedMenu)
  setupModeSwitcher()
  renderAuthenticDiningCarte()
  setupCarteFilters()
  if (/^#act-(morning|midday|evening|confections)$/.test(window.location.hash)) {
    requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView())
  }
  renderHearthOrderList()
  setupFilterControls()
  setupCustomizationModal()
  setupDishViewModal()
  setupCustomStudio()
  setupOrderDrawer()
  setupCarteHoverLoupe()
  updateCartBadge()
  initializeIcons()
}

// -------------------------------------------------------------
// Mode Switcher: Clear Separation between Dining Carte & Live Order Pass
// -------------------------------------------------------------
function setupModeSwitcher() {
  const carteBtn = document.querySelector('#tab-btn-carte')
  const orderBtn = document.querySelector('#tab-btn-order')
  const carteSection = document.querySelector('#experience-dining-carte')
  const orderSection = document.querySelector('#experience-hearth-order')

  function activateMode(mode) {
    if (mode === 'hearth-order') {
      carteBtn?.classList.remove('is-active')
      orderBtn?.classList.add('is-active')
      carteSection?.classList.add('is-hidden')
      orderSection?.classList.remove('is-hidden')
    } else {
      orderBtn?.classList.remove('is-active')
      carteBtn?.classList.add('is-active')
      orderSection?.classList.add('is-hidden')
      carteSection?.classList.remove('is-hidden')
    }
    initializeIcons()
  }

  carteBtn?.addEventListener('click', () => activateMode('dining-carte'))
  orderBtn?.addEventListener('click', () => activateMode('hearth-order'))

  // Listen to hash or URL param
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('mode') === 'order' || window.location.hash === '#order') {
    activateMode('hearth-order')
  }

  // Cross-link buttons from the dining carte to switch directly to order
  document.querySelectorAll('.btn-switch-to-order').forEach((btn) => {
    btn.addEventListener('click', () => {
      activateMode('hearth-order')
      const targetId = btn.dataset.dishId
      if (targetId) {
        setTimeout(() => {
          const row = document.querySelector(`.kitchen-order-row[data-dish-id="${targetId}"]`)
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' })
            row.classList.add('is-highlighted')
            setTimeout(() => row.classList.remove('is-highlighted'), 2000)
          }
        }, 150)
      }
    })
  })
}

// -------------------------------------------------------------
// 1. THE GRAND DINING CARTE (Authentic Restaurant Menu List - NOT cards!)
// -------------------------------------------------------------
function renderAuthenticDiningCarte() {
  const container = document.querySelector('#dining-carte-list-wrap')
  if (!container) return

  // Organize dishes into Haute-Cuisine Courses / Acts
  const acts = [
    {
      id: 'act-morning',
      num: 'Act I',
      title: 'Morning Sun & Hearth Brioche',
      time: '08:00 — 12:00',
      epigraph: 'Butter-laminated doughs, foraged mushrooms, and farm eggs slow-poached over embers.',
      items: menuItems.filter((d) => d.category === 'breakfast'),
    },
    {
      id: 'act-midday',
      num: 'Act II',
      title: 'Midday Catch & Foraged Greens',
      time: '12:00 — 17:00',
      epigraph: 'Day-boat fish in parchment, crisp garden botanicals, and hand-ground heritage wagyu.',
      items: menuItems.filter((d) => d.category === 'lunch'),
    },
    {
      id: 'act-evening',
      num: 'Act III',
      title: 'Evening Embers & Woodfire Mains',
      time: '17:00 — Midnight',
      epigraph: '12-hour cherrywood smokes, aged cuts, hand-cut winter tagliatelle, and blistered coastal catch.',
      items: menuItems.filter((d) => d.category === 'dinner'),
    },
    {
      id: 'act-confections',
      num: 'Act IV',
      title: 'Confections, Infusions & Cellar Elixirs',
      time: 'All Hours',
      epigraph: 'Dark cacao roasted over coals, cold-distilled shrubs, and rare single-estate pairings.',
      items: menuItems.filter((d) => d.category === 'drinks'),
    },
  ]

  let globalIndex = 1

  container.innerHTML = acts.map((act) => `
    <div id="${act.id}" class="carte-act-block">
      <!-- Act Header -->
      <div class="carte-act-header">
        <div class="carte-act-top">
          <span class="carte-act-roman">${act.num}</span>
          <span class="carte-act-time">${act.time}</span>
        </div>
        <h3 class="carte-act-title">${act.title}</h3>
        <p class="carte-act-desc">${act.epigraph}</p>
        <div class="carte-act-divider">
          <span>♦</span>
        </div>
      </div>

      <!-- Authentic Menu List -->
      <div class="authentic-menu-list">
        ${act.items.map((dish) => {
          const itemNum = String(globalIndex++).padStart(2, '0')
          const dietBadges = dish.diet.map((d) => {
            if (d === 'vegetarian') return '<span class="carte-diet-badge" title="Vegetarian">🌱 Vegetarian</span>'
            if (d === 'gluten-free') return '<span class="carte-diet-badge" title="Gluten-Free">🌾 Gluten-Free</span>'
            if (d === 'spicy') return '<span class="carte-diet-badge" title="Live-Fire Spicy">🔥 Live Fire</span>'
            return ''
          }).join('')

          return `
            <article class="authentic-menu-row" data-dish-id="${dish.id}" data-dish-name="${dish.name}" data-dish-image="${dish.image}" data-dish-badge="${dish.badge}" data-dish-pairing="${dish.pairing}">
              <div class="menu-row-thumb-wrap btn-view-dish" data-dish-id="${dish.id}" title="Click to view ${dish.name}">
                <img class="menu-row-thumb" src="${dish.image}" alt="${dish.name}" loading="lazy" decoding="async">
                <span class="thumb-view-cue"><i data-lucide="eye"></i></span>
              </div>
              <div class="menu-row-lead">
                <span class="menu-row-num">№ ${itemNum}</span>
                <div class="menu-row-info">
                  <div class="menu-row-title-line">
                    <h4 class="menu-dish-name">${dish.name}</h4>
                    <div class="menu-diet-wrap">${dietBadges}</div>
                    <span class="menu-leader-dots" aria-hidden="true"></span>
                    <strong class="menu-dish-price">$${Number(dish.price).toFixed(2)}</strong>
                  </div>
                  
                  <p class="menu-dish-ingredients">${dish.description}</p>
                  
                  <div class="menu-row-sommelier">
                    <i data-lucide="wine"></i>
                    <span><em>Cellar Pairing:</em> ${dish.pairing}</span>
                  </div>
                </div>
              </div>

              <div class="menu-row-actions">
                <button type="button" class="carte-view-btn btn-view-dish" data-dish-id="${dish.id}" title="View image and details of ${dish.name}">
                  <i data-lucide="eye"></i> <span>View</span>
                </button>
                <a href="/pages/reservations.html?experience=alacarte&item=${encodeURIComponent(dish.name)}" class="carte-reserve-link" title="Reserve dining table for this course">
                  <i data-lucide="calendar-days"></i> <span>Reserve for this Course</span>
                </a>
                <button type="button" class="carte-quick-order-btn btn-quick-order" data-quick-add-id="${dish.id}" title="Quick Add to Order Bag">
                  <i data-lucide="plus"></i> <span>Quick Order</span>
                </button>
                <button type="button" class="carte-customize-btn btn-trigger-customize" data-dish-id="${dish.id}" title="Customize Ingredients (Remove or Add items)">
                  <i data-lucide="sliders-horizontal"></i> <span>Customize</span>
                </button>
              </div>
            </article>
          `
        }).join('')}
      </div>
    </div>
  `).join('')

  // Bind clicks
  container.querySelectorAll('.btn-trigger-customize').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      openCustomizationModal(btn.dataset.dishId)
    })
  })

  container.querySelectorAll('.btn-quick-order').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      quickAddToOrder(btn.dataset.quickAddId)
    })
  })

  container.querySelectorAll('.btn-view-dish').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      openDishViewModal(btn.dataset.dishId)
    })
  })

  initializeIcons()
}

function setupCarteFilters() {
  const search = document.querySelector('#carte-search')
  const controls = [...document.querySelectorAll('[data-carte-filter]')]
  const status = document.querySelector('#carte-filter-status')
  let diet = 'all'
  const apply = () => {
    const query = search.value.trim().toLowerCase()
    let count = 0
    document.querySelectorAll('.authentic-menu-row').forEach(row => {
      const dish = menuItems.find(item => item.id === row.dataset.dishId)
      const matches = dish && (diet === 'all' || dish.diet.includes(diet)) && `${dish.name} ${dish.description} ${dish.ingredients.map(i => i.name).join(' ')}`.toLowerCase().includes(query)
      row.hidden = !matches
      if (matches) count++
    })
    document.querySelectorAll('.carte-act-block').forEach(block => { block.hidden = !block.querySelector('.authentic-menu-row:not([hidden])') })
    if (status) status.textContent = `${count} ${count === 1 ? 'dish' : 'dishes'} found${count ? '' : ' — try another search or filter'}.`
  }
  search?.addEventListener('input', apply)
  controls.forEach(button => button.addEventListener('click', () => {
    diet = button.dataset.carteFilter
    controls.forEach(item => item.setAttribute('aria-pressed', String(item === button)))
    apply()
  }))
  if (search) apply()
}

// -------------------------------------------------------------
// Floating Ambient Loupe for the Grand Dining Carte
// (Displays photo preview on row hover without breaking the clean list format!)
// -------------------------------------------------------------
function setupCarteHoverLoupe() {
  const loupe = document.querySelector('#carte-hover-loupe')
  const loupeImg = document.querySelector('#loupe-img')
  const loupeTitle = document.querySelector('#loupe-title')
  const loupePairing = document.querySelector('#loupe-pairing')
  const loupeBadge = document.querySelector('#loupe-badge')
  if (!loupe) return

  let activeRow = null

  // On mobile view or touch devices, never display the hover loupe preview
  const isMobileView = () => window.innerWidth <= 900 || window.matchMedia('(hover: none)').matches

  document.querySelectorAll('.authentic-menu-row').forEach((row) => {
    row.addEventListener('mouseenter', (e) => {
      if (isMobileView()) {
        loupe.classList.remove('is-visible')
        return
      }

      activeRow = row
      const img = row.dataset.dishImage
      const title = row.dataset.dishName
      const pairing = row.dataset.dishPairing
      const badge = row.dataset.dishBadge

      if (loupeImg) loupeImg.src = img
      if (loupeTitle) loupeTitle.textContent = title
      if (loupePairing) loupePairing.textContent = `🍷 ${pairing}`
      if (loupeBadge) loupeBadge.textContent = badge

      loupe.classList.add('is-visible')
      positionLoupe(e)
    })

    row.addEventListener('mousemove', (e) => {
      if (isMobileView()) {
        loupe.classList.remove('is-visible')
        return
      }
      if (activeRow === row) {
        positionLoupe(e)
      }
    })

    row.addEventListener('mouseleave', () => {
      activeRow = null
      loupe.classList.remove('is-visible')
    })
  })

  function positionLoupe(e) {
    if (isMobileView()) {
      loupe.classList.remove('is-visible')
      return
    }
    const x = e.clientX + 25
    const y = e.clientY - 60
    loupe.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }
}

// -------------------------------------------------------------
// 2. THE HEARTH ORDER PASS (Dedicated Kitchen Pass Styling · Instant Order List)
// -------------------------------------------------------------
function getFilteredDishes() {
  return menuItems.filter((dish) => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matchName = dish.name.toLowerCase().includes(q)
      const matchDesc = dish.description.toLowerCase().includes(q)
      const matchIngredients = dish.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
      const matchCategory = dish.categoryLabel.toLowerCase().includes(q)
      if (!matchName && !matchDesc && !matchIngredients && !matchCategory) return false
    }

    // Category
    if (filters.category !== 'all' && dish.category !== filters.category) {
      return false
    }

    // Dietary
    if (filters.diet !== 'all') {
      if (filters.diet === 'chefs-pick') {
        if (!dish.badge.toLowerCase().includes('chef')) return false
      } else if (!dish.diet.includes(filters.diet)) {
        return false
      }
    }

    return true
  }).sort((a, b) => {
    if (filters.sortBy === 'price-low') return a.price - b.price
    if (filters.sortBy === 'price-high') return b.price - a.price
    if (filters.sortBy === 'prep-speed') return parseInt(a.prepTime) - parseInt(b.prepTime)
    return 0
  })
}

function renderHearthOrderList() {
  const container = document.querySelector('#hearth-order-list-wrap')
  const countBadge = document.querySelector('#filter-results-count')
  if (!container) return

  const filtered = getFilteredDishes()

  if (countBadge) {
    countBadge.innerHTML = `Showing <b>${filtered.length}</b> dishes ready for order`
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="menu-empty-state">
        <i data-lucide="search"></i>
        <h3>No dishes match your filter</h3>
        <p>Try clearing your dietary selections or search keyword.</p>
        <button type="button" class="button button-primary" id="btn-reset-filters">Reset All Filters</button>
      </div>
    `
    container.querySelector('#btn-reset-filters')?.addEventListener('click', resetFilters)
    initializeIcons()
    return
  }

  // Render Horizontal Culinary Dispatch Rows (NOT cards!)
  container.innerHTML = filtered.map((dish) => {
    const dietBadges = dish.diet.map((d) => {
      let icon = 'leaf'
      if (d === 'spicy') icon = 'flame'
      if (d === 'gluten-free') icon = 'check'
      return `<span class="order-diet-pill"><i data-lucide="${icon}"></i> ${d}</span>`
    }).join('')

    return `
      <div class="kitchen-order-row" data-dish-id="${dish.id}">
        <div class="order-row-main">
          <!-- Left Badge & Station -->
          <div class="order-row-station-col">
            <div class="order-row-thumb-wrap btn-view-dish" data-dish-id="${dish.id}" title="Click to view image and details of ${dish.name}">
              <img class="order-row-thumb" src="${dish.image}" alt="${dish.name}" loading="lazy">
              <span class="thumb-view-cue"><i data-lucide="eye"></i></span>
            </div>
            <span class="station-badge">HEARTH PASS</span>
            <span class="prep-pill"><i data-lucide="clock"></i> ${dish.prepTime}</span>
            <span class="calories-pill">${dish.calories}</span>
          </div>

          <!-- Middle Content & Ingredients Cloud -->
          <div class="order-row-content">
            <div class="order-row-heading">
              <h4 class="order-dish-title">${dish.name}</h4>
              <div class="order-diet-group">${dietBadges}</div>
              <span class="order-dish-price">$${Number(dish.price).toFixed(2)}</span>
            </div>
            
            <p class="order-dish-desc">${dish.description}</p>
            
            <!-- Ingredients Present (What is in this dish) -->
            <div class="order-ingredients-preview">
              <span class="preview-label">Present Ingredients:</span>
              ${dish.ingredients.map((ing) => `
                <span class="ing-tag ${ing.removable ? 'is-removable' : ''}" title="${ing.removable ? 'Can be excluded' : 'Core element'}">
                  ${ing.name}
                </span>
              `).join('')}
            </div>
          </div>

          <!-- Right Action Buttons -->
          <div class="order-row-actions">
            <button type="button" class="btn-view-dish order-view-btn" data-dish-id="${dish.id}">
              <div class="btn-text-pair">
                <strong class="btn-action-name"><i data-lucide="eye"></i> View Dish</strong>
                <small class="btn-subtext">Image & full details</small>
              </div>
            </button>

            <button type="button" class="btn-fire-order btn-quick-order" data-quick-add-id="${dish.id}">
              <div class="btn-text-pair">
                <strong class="btn-action-name"><i data-lucide="plus"></i> Quick Order</strong>
                <small class="btn-subtext">Standard Recipe • $${Number(dish.price).toFixed(2)}</small>
              </div>
            </button>

            <button type="button" class="btn-open-customizer btn-trigger-customize" data-dish-id="${dish.id}">
              <div class="btn-text-pair">
                <strong class="btn-action-name"><i data-lucide="sliders-horizontal"></i> Customize Ingredients</strong>
                <small class="btn-subtext">Exclude or Add items</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    `
  }).join('')

  // Bind clicks
  container.querySelectorAll('.btn-trigger-customize').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      openCustomizationModal(btn.dataset.dishId)
    })
  })

  container.querySelectorAll('.btn-quick-order').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      quickAddToOrder(btn.dataset.quickAddId)
    })
  })

  container.querySelectorAll('.btn-view-dish').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      openDishViewModal(btn.dataset.dishId)
    })
  })

  initializeIcons()
}

function setupFilterControls() {
  const searchInput = document.querySelector('#menu-search-input')
  const clearSearch = document.querySelector('#menu-search-clear')

  searchInput?.addEventListener('input', (e) => {
    filters.search = e.target.value.trim()
    clearSearch?.classList.toggle('is-visible', !!filters.search)
    renderHearthOrderList()
  })

  clearSearch?.addEventListener('click', () => {
    if (searchInput) searchInput.value = ''
    filters.search = ''
    clearSearch.classList.remove('is-visible')
    renderHearthOrderList()
  })

  document.querySelectorAll('[data-category-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-category-filter]').forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      filters.category = btn.dataset.categoryFilter
      renderHearthOrderList()
    })
  })

  document.querySelectorAll('[data-diet-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-diet-filter]').forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      filters.diet = btn.dataset.dietFilter
      renderHearthOrderList()
    })
  })

  const sortSelect = document.querySelector('#menu-sort-select')
  sortSelect?.addEventListener('change', (e) => {
    filters.sortBy = e.target.value
    renderHearthOrderList()
  })
}

function resetFilters() {
  filters.search = ''
  filters.category = 'all'
  filters.diet = 'all'
  filters.sortBy = 'default'

  const searchInput = document.querySelector('#menu-search-input')
  if (searchInput) searchInput.value = ''
  document.querySelector('#menu-search-clear')?.classList.remove('is-visible')

  document.querySelectorAll('[data-category-filter]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.categoryFilter === 'all')
  })
  document.querySelectorAll('[data-diet-filter]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.dietFilter === 'all')
  })

  const sortSelect = document.querySelector('#menu-sort-select')
  if (sortSelect) sortSelect.value = 'default'

  renderHearthOrderList()
}

// -------------------------------------------------------------
// Interactive Dish Ingredient Customization Modal
// ("What user DOES NOT want added" + "What user DOES want added")
// -------------------------------------------------------------
let customizeModal
let customizationTrigger
let drawerTrigger
function trapDialogFocus(event, dialog) {
  if (event.key !== 'Tab') return
  const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')].filter(el => el.getClientRects().length && !el.closest('[aria-hidden="true"]'))
  if (!focusable.length) { event.preventDefault(); return }
  const first = focusable[0], last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

function setupCustomizationModal() {
  customizeModal = document.querySelector('#quick-view-modal')
  if (!customizeModal) return

  customizeModal.querySelector('.modal-backdrop')?.addEventListener('click', closeCustomizationModal)
  customizeModal.querySelector('.modal-close')?.addEventListener('click', closeCustomizationModal)

  document.addEventListener('keydown', (e) => {
    if (customizeModal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeCustomizationModal()
      else trapDialogFocus(e, customizeModal)
    }
  })
}

export function openCustomizationModal(dishId) {
  const dish = menuItems.find((d) => d.id === dishId)
  if (!dish || !customizeModal) return

  customizationTrigger = document.activeElement
  activeDish = dish
  customModalState = {
    excludedIngredients: [],
    selectedAddons: [],
    spice: 'medium',
    notes: '',
    qty: 1,
  }

  renderCustomizationModalContent()
  customizeModal.classList.add('is-open')
  customizeModal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('modal-open')
  customizeModal.querySelector('.modal-close')?.focus()
}

export function closeCustomizationModal() {
  if (customizeModal) {
    customizeModal.classList.remove('is-open')
    customizeModal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    customizationTrigger?.focus()
  }
}

// -------------------------------------------------------------
// Dish Detail View Modal (Image + Full Info Popup)
// -------------------------------------------------------------
let dishViewModal
let dishViewTrigger

function setupDishViewModal() {
  dishViewModal = document.querySelector('#dish-view-modal')
  if (!dishViewModal) return

  dishViewModal.querySelector('.modal-backdrop')?.addEventListener('click', closeDishViewModal)
  dishViewModal.querySelector('.modal-close')?.addEventListener('click', closeDishViewModal)

  document.addEventListener('keydown', (e) => {
    if (dishViewModal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeDishViewModal()
      else trapDialogFocus(e, dishViewModal)
    }
  })

  // Global delegation for View button and meal thumbnails across carte, tasting & order pass
  document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.btn-view-dish')
    if (viewBtn && viewBtn.dataset.dishId) {
      e.preventDefault()
      e.stopPropagation()
      openDishViewModal(viewBtn.dataset.dishId)
      return
    }

    const dishImg = e.target.closest('.menu-row-thumb-wrap, .order-row-thumb-wrap, .menu-row-mobile-image')
    if (dishImg) {
      const dishId = dishImg.dataset.dishId || dishImg.closest('[data-dish-id]')?.dataset.dishId
      if (dishId) {
        e.preventDefault()
        e.stopPropagation()
        openDishViewModal(dishId)
        return
      }
    }

    const closeBtn = e.target.closest('.dish-view-inner-close, .dish-view-dismiss-btn, .dish-view-close-btn')
    if (closeBtn) {
      e.preventDefault()
      e.stopPropagation()
      closeDishViewModal()
      return
    }
  })
}

function openDishViewModal(dishId) {
  const dish = menuItems.find((d) => d.id === dishId)
  if (!dish || !dishViewModal) return

  dishViewTrigger = document.activeElement
  const body = dishViewModal.querySelector('.dish-view-body')
  if (!body) return

  const dietBadges = dish.diet.map((d) => {
    if (d === 'vegetarian') return '<span class="dish-view-diet" title="Vegetarian">🌱 Vegetarian</span>'
    if (d === 'gluten-free') return '<span class="dish-view-diet" title="Gluten-Free">🌾 Gluten-Free</span>'
    if (d === 'spicy') return '<span class="dish-view-diet" title="Live-Fire Spicy">🔥 Live Fire Spicy</span>'
    return ''
  }).join('')

  body.innerHTML = `
    <div class="dish-view-layout">
      <div class="dish-view-image-wrap">
        <img src="${dish.image}" alt="${dish.name}" loading="eager">
        <span class="dish-view-badge">${dish.badge || 'Chef Selection'}</span>
      </div>
      <div class="dish-view-info">
        <div class="dish-view-topline">
          <small class="dish-view-category">${dish.categoryLabel || 'Seasonal Selection'}</small>
          <div class="dish-view-meta">
            <span><i data-lucide="clock"></i> ${dish.prepTime}</span>
            <span><i data-lucide="flame"></i> ${dish.calories}</span>
          </div>
        </div>
        <h2 class="dish-view-title">${dish.name}</h2>
        <div class="dish-view-price-row">
          <strong class="dish-view-price">$${Number(dish.price).toFixed(2)}</strong>
          ${dietBadges ? `<div class="dish-view-diets">${dietBadges}</div>` : ''}
        </div>
        <p class="dish-view-desc">${dish.description}</p>
        
        <div class="dish-view-section">
          <h4><i data-lucide="utensils"></i> Ingredients & Composition</h4>
          <ul class="dish-view-ingredients">
            ${dish.ingredients.map((ing) => `<li><i data-lucide="check"></i> <span>${ing.name}</span></li>`).join('')}
          </ul>
        </div>
        
        ${dish.allergens && dish.allergens.length ? `
          <div class="dish-view-section">
            <h4><i data-lucide="alert-triangle"></i> Allergens</h4>
            <div class="dish-view-allergens">${dish.allergens.map(a => `<span class="allergen-tag"><i data-lucide="alert-circle"></i> ${a}</span>`).join('')}</div>
          </div>
        ` : ''}
        
        ${dish.pairing ? `
          <div class="dish-view-section dish-view-pairing">
            <h4><i data-lucide="wine"></i> Sommelier Cellar Pairing</h4>
            <p>${dish.pairing}</p>
          </div>
        ` : ''}
        
        ${dish.chefNote ? `
          <div class="dish-view-chef-note">
            <i data-lucide="quote"></i>
            <p>“${dish.chefNote}”</p>
            <span>Chef Amara's Hearth Note</span>
          </div>
        ` : ''}

        <div class="dish-view-actions">
          <button type="button" class="button button-primary dish-view-quick-add" data-quick-add-id="${dish.id}">
            <i data-lucide="plus"></i> <span>Add to Order Bag • $${Number(dish.price).toFixed(2)}</span>
          </button>
          <button type="button" class="button button-dark dish-view-trigger-custom" data-dish-id="${dish.id}">
            <i data-lucide="sliders-horizontal"></i> <span>Customize Ingredients</span>
          </button>
          <button type="button" class="button button-ghost dish-view-dismiss-btn">
            <i data-lucide="x"></i> <span>Close Details</span>
          </button>
        </div>
      </div>
    </div>
  `

  body.querySelector('.dish-view-quick-add')?.addEventListener('click', () => {
    quickAddToOrder(dish.id)
    closeDishViewModal()
  })
  body.querySelector('.dish-view-trigger-custom')?.addEventListener('click', () => {
    closeDishViewModal()
    openCustomizationModal(dish.id)
  })
  body.querySelector('.dish-view-dismiss-btn')?.addEventListener('click', closeDishViewModal)

  dishViewModal.classList.add('is-open')
  dishViewModal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('modal-open')
  dishViewModal.querySelector('.modal-close')?.focus()
  initializeIcons()
}

function closeDishViewModal() {
  if (dishViewModal) {
    dishViewModal.classList.remove('is-open')
    dishViewModal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    dishViewTrigger?.focus()
  }
}

function renderCustomizationModalContent() {
  const modalBody = customizeModal?.querySelector('.modal-body')
  if (!modalBody || !activeDish) return

  const dish = activeDish
  const addonsTotal = customModalState.selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const singleItemPrice = dish.price + addonsTotal
  const totalPrice = singleItemPrice * customModalState.qty

  modalBody.innerHTML = `
    <div class="customizer-layout">
      <!-- Media & Intro Header -->
      <div class="customizer-sidebar">
        <div class="customizer-media-wrap">
          <img src="${dish.image}" alt="${dish.name}">
          <span class="customizer-badge">${dish.badge}</span>
        </div>
        <div class="customizer-sidebar-info">
          <small class="customizer-cat">${dish.categoryLabel}</small>
          <h2>${dish.name}</h2>
          <p class="customizer-desc">${dish.description}</p>
          <div class="customizer-meta-pills">
            <span><i data-lucide="clock"></i> ${dish.prepTime}</span>
            <span><i data-lucide="flame"></i> ${dish.calories}</span>
          </div>
          <div class="customizer-chef-note">
            <i data-lucide="quote"></i>
            <p>“${dish.chefNote}”</p>
          </div>
        </div>
      </div>

      <!-- Main Customization Panel -->
      <div class="customizer-main">
        <!-- 1. What You DON'T Want Added (Ingredients to Exclude) -->
        <div class="customizer-section-title">
          <span class="section-badge red-badge">Step 1</span>
          <div>
            <h3>Ingredients Present (Click to Remove / DO NOT ADD)</h3>
            <p>Dislike something or have an allergy? Click to tell our chef <b>NOT</b> to add it:</p>
          </div>
        </div>

        <div class="ingredient-toggles-grid">
          ${dish.ingredients.map((ing) => {
            const isRemoved = customModalState.excludedIngredients.includes(ing.name)
            return `
              <div class="ingredient-toggle-card ${isRemoved ? 'is-excluded' : 'is-included'}" data-ing-name="${ing.name}" data-removable="${ing.removable}">
                <div class="ing-card-left">
                  <div class="ing-check-icon">
                    <i data-lucide="${isRemoved ? 'x' : 'check'}"></i>
                  </div>
                  <div>
                    <strong class="ing-name">${ing.name}</strong>
                    <small class="ing-state-label">${isRemoved ? '✕ REMOVED (Do Not Add)' : '✓ Included in Dish'}</small>
                  </div>
                </div>
                <span class="ing-tag-action">${isRemoved ? 'OMIT' : 'KEEP'}</span>
              </div>
            `
          }).join('')}
        </div>

        <!-- 2. What You DO Want Added (Artisan Additions) -->
        <div class="customizer-section-title" style="margin-top: 32px;">
          <span class="section-badge orange-badge">Step 2</span>
          <div>
            <h3>Artisan Extras & Additions (What you want ADDED)</h3>
            <p>Select extra portions or luxury fire-roasted additions:</p>
          </div>
        </div>

        <div class="addons-selection-grid">
          ${dish.addons.map((addon) => {
            const isChecked = customModalState.selectedAddons.some((a) => a.name === addon.name)
            return `
              <label class="addon-choice-card ${isChecked ? 'is-checked' : ''}">
                <input type="checkbox" class="addon-checkbox" data-addon-name="${addon.name}" data-addon-price="${addon.price}" ${isChecked ? 'checked' : ''}>
                <div class="addon-card-info">
                  <span class="addon-name">${addon.name}</span>
                  <small class="addon-sub">Prepared freshly by hearth</small>
                </div>
                <b class="addon-price">+$${addon.price}.00</b>
              </label>
            `
          }).join('')}
        </div>

        <!-- 3. Heat & Spice Level -->
        <div class="customizer-section-title" style="margin-top: 32px;">
          <span class="section-badge">Step 3</span>
          <div>
            <h3>Live-Fire Spice Temperature</h3>
            <p>How much flame heat should Chef Amara apply?</p>
          </div>
        </div>

        <div class="spice-selector-row">
          <button type="button" class="spice-pill ${customModalState.spice === 'mild' ? 'is-active' : ''}" data-spice="mild">
            <i data-lucide="leaf"></i> Mild & Fragrant
          </button>
          <button type="button" class="spice-pill ${customModalState.spice === 'medium' ? 'is-active' : ''}" data-spice="medium">
            <i data-lucide="flame"></i> Medium Hearth Ember
          </button>
          <button type="button" class="spice-pill ${customModalState.spice === 'fiery' ? 'is-active' : ''}" data-spice="fiery">
            <i data-lucide="flame"></i> Wild Scotch Bonnet Heat
          </button>
        </div>

        <!-- 4. Special Kitchen Memo -->
        <div class="customizer-section-title" style="margin-top: 32px;">
          <span class="section-badge">Step 4</span>
          <div>
            <h3>Special Kitchen Note</h3>
            <p>Allergies, plating wishes, or instructions for the line cooks:</p>
          </div>
        </div>

        <input type="text" id="customizer-notes-input" class="custom-note-field" placeholder="e.g. Please sear extra crispy on the embers, olive oil on side..." value="${customModalState.notes}">

        <!-- Live Kitchen Ticket Summary & Add to Order Bar -->
        <div class="customizer-footer-bar">
          <div class="customizer-price-wrap">
            <div class="qty-stepper">
              <button type="button" class="btn-qty" id="cust-qty-minus"><i data-lucide="minus"></i></button>
              <span class="qty-num">${customModalState.qty}</span>
              <button type="button" class="btn-qty" id="cust-qty-plus"><i data-lucide="plus"></i></button>
            </div>
            <div>
              <small class="mod-summary-text">
                ${customModalState.excludedIngredients.length > 0 ? `<span class="red-text">-${customModalState.excludedIngredients.length} Omitted (Do Not Add)</span> · ` : ''}
                ${customModalState.selectedAddons.length > 0 ? `<span class="orange-text">+${customModalState.selectedAddons.length} Added</span>` : 'Standard recipe'}
              </small>
              <div class="custom-total-val">$${totalPrice}.00</div>
            </div>
          </div>

          <button type="button" class="button button-primary btn-add-custom-dish" id="btn-submit-customized-dish">
            <i data-lucide="shopping-bag"></i> <span>Add to Order Bag • $${totalPrice}.00</span>
          </button>
        </div>
      </div>
    </div>
  `

  initializeIcons()

  // Bind Ingredient Toggles
  modalBody.querySelectorAll('.ingredient-toggle-card').forEach((card) => {
    card.addEventListener('click', () => {
      const ingName = card.dataset.ingName
      if (customModalState.excludedIngredients.includes(ingName)) {
        customModalState.excludedIngredients = customModalState.excludedIngredients.filter((n) => n !== ingName)
      } else {
        customModalState.excludedIngredients.push(ingName)
      }
      renderCustomizationModalContent()
    })
  })

  // Bind Addon Checkboxes
  modalBody.querySelectorAll('.addon-checkbox').forEach((chk) => {
    chk.addEventListener('change', () => {
      const name = chk.dataset.addonName
      const price = parseFloat(chk.dataset.addonPrice)
      if (chk.checked) {
        if (!customModalState.selectedAddons.some((a) => a.name === name)) {
          customModalState.selectedAddons.push({ name, price })
        }
      } else {
        customModalState.selectedAddons = customModalState.selectedAddons.filter((a) => a.name !== name)
      }
      renderCustomizationModalContent()
    })
  })

  // Bind Spice Pills
  modalBody.querySelectorAll('.spice-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      customModalState.spice = btn.dataset.spice
      renderCustomizationModalContent()
    })
  })

  // Bind Notes
  const notesField = modalBody.querySelector('#customizer-notes-input')
  notesField?.addEventListener('input', (e) => {
    customModalState.notes = e.target.value
  })

  // Quantity buttons
  modalBody.querySelector('#cust-qty-minus')?.addEventListener('click', () => {
    if (customModalState.qty > 1) {
      customModalState.qty--
      renderCustomizationModalContent()
    }
  })

  modalBody.querySelector('#cust-qty-plus')?.addEventListener('click', () => {
    customModalState.qty++
    renderCustomizationModalContent()
  })

  // Submit Customized Dish to Cart
  modalBody.querySelector('#btn-submit-customized-dish')?.addEventListener('click', () => {
    const dish = activeDish
    const addonsTotal = customModalState.selectedAddons.reduce((sum, a) => sum + a.price, 0)
    const unitPrice = dish.price + addonsTotal

    const isCustomized = customModalState.excludedIngredients.length > 0 || customModalState.selectedAddons.length > 0 || customModalState.notes.length > 0

    const cartItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      dishId: dish.id,
      name: dish.name + (isCustomized ? ' (Customized)' : ''),
      basePrice: dish.price,
      price: unitPrice,
      qty: customModalState.qty,
      image: dish.image,
      isCustomized,
      excludedIngredients: [...customModalState.excludedIngredients],
      selectedAddons: [...customModalState.selectedAddons],
      spice: customModalState.spice,
      notes: customModalState.notes,
    }

    order.push(cartItem)
    saveOrder()
    closeCustomizationModal()

    const modLabel = isCustomized ? 'customized with your ingredient specifications' : ''
    showToast(`Added ${dish.name} ${modLabel} to your order bag!`, 'View Order', openOrderDrawer)
  })
}

// -------------------------------------------------------------
// 3. BESPOKE CUSTOM SCRATCH STUDIO (Build a 100% custom dish from scratch)
// -------------------------------------------------------------
function setupCustomStudio() {
  const container = document.querySelector('#custom-dish-studio')
  if (!container) return

  const bases = [
    { name: 'Wood-Fired Heritage Sourdough', price: 6 },
    { name: 'Warm Brown Butter Brioche', price: 7 },
    { name: 'Crisp Cassava Fondant Rosti', price: 8 },
    { name: 'Steamed Heritage Herb Jasmine Rice', price: 6 },
    { name: 'Foraged Organic Baby Greens Bed', price: 7 },
  ]

  const proteins = [
    { name: '12-Hour Smoked Beef Short Ribs', price: 22 },
    { name: 'Wood-Fired Red Snapper Fillet', price: 20 },
    { name: 'Fire-Blistered Giant Tiger Prawns', price: 18 },
    { name: 'Jos Foraged Wild Chanterelles', price: 16 },
    { name: 'Charred Buffalo Milk Burrata', price: 14 },
    { name: 'House Herb & Fennel Sausage', price: 14 },
  ]

  const techniques = [
    'Ember-Charred Over Wild Cherrywood',
    'Low & Slow 12-Hour Smoked',
    'Pan-Crisped in Brown Cultured Butter',
    'Steamed in Banana Leaves over Embers',
  ]

  const dislikeOptions = [
    'No Onions / Shallots',
    'No Garlic',
    'No Dairy / Butter',
    'No Gluten',
    'No Cilantro / Coriander',
    'No Peanuts / Tree Nuts',
    'No Chili / Zero Heat',
  ]

  const sauces = [
    { name: 'Truffle & Roasted Bone Marrow Emulsion', price: 4 },
    { name: 'Smoked Scotch Bonnet Pepper Jam', price: 3 },
    { name: 'Meyer Citrus & Coconut Blossom Curd', price: 3 },
    { name: 'Green Herb & Fermented Garlic Mojo', price: 3 },
    { name: 'Charred Tomato & Wild Oregano Jus', price: 3 },
  ]

  function renderStudio() {
    const totalCustomPrice = scratchStudioState.basePrice + scratchStudioState.proteinPrice + scratchStudioState.saucePrice

    container.innerHTML = `
      <div class="scratch-studio-grid">
        <div class="studio-builder-controls">
          <!-- Step 1: Base -->
          <div class="studio-step-block">
            <span class="studio-step-label">1. Choose Culinary Canvas / Base</span>
            <div class="studio-options-wrap">
              ${bases.map((b) => `
                <button type="button" class="studio-pill-btn ${scratchStudioState.base === b.name ? 'is-active' : ''}" data-base="${b.name}" data-price="${b.price}">
                  <span>${b.name}</span>
                  <b>+$${b.price}</b>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 2: Protein -->
          <div class="studio-step-block">
            <span class="studio-step-label">2. Select Hearth Protein or Main Harvest</span>
            <div class="studio-options-wrap">
              ${proteins.map((p) => `
                <button type="button" class="studio-pill-btn ${scratchStudioState.protein === p.name ? 'is-active' : ''}" data-protein="${p.name}" data-price="${p.price}">
                  <span>${p.name}</span>
                  <b>+$${p.price}</b>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 3: Cooking Style -->
          <div class="studio-step-block">
            <span class="studio-step-label">3. Live-Fire Cooking Technique</span>
            <div class="studio-options-wrap">
              ${techniques.map((t) => `
                <button type="button" class="studio-pill-btn ${scratchStudioState.cookingStyle === t ? 'is-active' : ''}" data-technique="${t}">
                  <span>${t}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Step 4: Exclusions / What NOT to add -->
          <div class="studio-step-block">
            <span class="studio-step-label red-label">4. Ingredients to EXCLUDE (Do Not Add)</span>
            <div class="studio-options-wrap">
              ${dislikeOptions.map((d) => {
                const isSelected = scratchStudioState.dislikes.includes(d)
                return `
                  <button type="button" class="studio-pill-btn dislike-pill ${isSelected ? 'is-excluded' : ''}" data-dislike="${d}">
                    <i data-lucide="${isSelected ? 'x' : 'minus'}"></i>
                    <span>${d}</span>
                  </button>
                `
              }).join('')}
            </div>
          </div>

          <!-- Step 5: Artisan Emulsion -->
          <div class="studio-step-block">
            <span class="studio-step-label">5. Chef's Finishing Emulsion or Sauce</span>
            <div class="studio-options-wrap">
              ${sauces.map((s) => `
                <button type="button" class="studio-pill-btn ${scratchStudioState.sauce === s.name ? 'is-active' : ''}" data-sauce="${s.name}" data-price="${s.price}">
                  <span>${s.name}</span>
                  <b>+$${s.price}</b>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Studio Live Ticket Preview Card -->
        <div class="studio-preview-ticket">
          <div class="preview-ticket-header">
            <i data-lucide="chef-hat"></i>
            <div>
              <h4>Bespoke Creation Ticket</h4>
              <span>Fired specifically to your request</span>
            </div>
          </div>

          <div class="preview-ticket-specs">
            <div><span>Base:</span><b>${scratchStudioState.base}</b></div>
            <div><span>Main:</span><b>${scratchStudioState.protein}</b></div>
            <div><span>Technique:</span><b>${scratchStudioState.cookingStyle}</b></div>
            <div><span>Finishing:</span><b>${scratchStudioState.sauce}</b></div>
            ${scratchStudioState.dislikes.length > 0 ? `
              <div class="ticket-dislikes">
                <span>DO NOT ADD:</span>
                <b class="red-text">${scratchStudioState.dislikes.join(', ')}</b>
              </div>
            ` : ''}
          </div>

          <div class="preview-ticket-footer">
            <div class="ticket-total">
              <small>Calculated Plate Price</small>
              <strong>$${Number(totalCustomPrice).toFixed(2)}</strong>
            </div>
            <button type="button" class="button button-primary" id="btn-fire-bespoke-plate">
              <i data-lucide="flame"></i> <span>Fire Bespoke Plate to Order Bag</span>
            </button>
          </div>
        </div>
      </div>
    `

    initializeIcons()

    // Bind base clicks
    container.querySelectorAll('[data-base]').forEach((btn) => {
      btn.addEventListener('click', () => {
        scratchStudioState.base = btn.dataset.base
        scratchStudioState.basePrice = parseFloat(btn.dataset.price)
        renderStudio()
      })
    })

    // Bind protein clicks
    container.querySelectorAll('[data-protein]').forEach((btn) => {
      btn.addEventListener('click', () => {
        scratchStudioState.protein = btn.dataset.protein
        scratchStudioState.proteinPrice = parseFloat(btn.dataset.price)
        renderStudio()
      })
    })

    // Bind technique clicks
    container.querySelectorAll('[data-technique]').forEach((btn) => {
      btn.addEventListener('click', () => {
        scratchStudioState.cookingStyle = btn.dataset.technique
        renderStudio()
      })
    })

    // Bind dislike clicks
    container.querySelectorAll('[data-dislike]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.dataset.dislike
        if (scratchStudioState.dislikes.includes(item)) {
          scratchStudioState.dislikes = scratchStudioState.dislikes.filter((d) => d !== item)
        } else {
          scratchStudioState.dislikes.push(item)
        }
        renderStudio()
      })
    })

    // Bind sauce clicks
    container.querySelectorAll('[data-sauce]').forEach((btn) => {
      btn.addEventListener('click', () => {
        scratchStudioState.sauce = btn.dataset.sauce
        scratchStudioState.saucePrice = parseFloat(btn.dataset.price)
        renderStudio()
      })
    })

    // Fire bespoke creation
    container.querySelector('#btn-fire-bespoke-plate')?.addEventListener('click', () => {
      const customItem = {
        id: 'bespoke-' + Date.now(),
        dishId: 'custom-bespoke-dish',
        name: `Bespoke Hearth: ${scratchStudioState.protein}`,
        basePrice: totalCustomPrice,
        price: totalCustomPrice,
        qty: 1,
        image: '/images/hero-pasta.jpg',
        isCustomized: true,
        excludedIngredients: [...scratchStudioState.dislikes],
        selectedAddons: [{ name: scratchStudioState.sauce, price: scratchStudioState.saucePrice }],
        spice: 'Chef Calibrated',
        notes: `Base: ${scratchStudioState.base} · Technique: ${scratchStudioState.cookingStyle}`,
      }

      order.push(customItem)
      saveOrder()
      showToast(`Added your Bespoke Hearth Creation ($${Number(totalCustomPrice).toFixed(2)}) to order!`, 'View Order', openOrderDrawer)
    })
  }

  renderStudio()
}

// -------------------------------------------------------------
// Quick Add to Order (Standard prep)
// -------------------------------------------------------------
export function quickAddToOrder(dishId) {
  const dish = menuItems.find((d) => d.id === dishId)
  if (!dish) return

  const existing = order.find((item) => !item.isCustomized && item.dishId === dishId)
  if (existing) {
    existing.qty += 1
  } else {
    order.push({
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      dishId: dish.id,
      name: dish.name,
      basePrice: dish.price,
      price: dish.price,
      qty: 1,
      image: dish.image,
      isCustomized: false,
      excludedIngredients: [],
      selectedAddons: [],
      spice: 'medium',
      notes: '',
    })
  }

  saveOrder()
  showToast(`Added ${dish.name} (x1) to your order bag!`, 'View Order', openOrderDrawer)
}

// -------------------------------------------------------------
// Toast Notification
// -------------------------------------------------------------
export function showToast(message, actionText = 'View Order', actionCallback = null) {
  let toastContainer = document.querySelector('.flavoro-toast-container')
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'flavoro-toast-container'
    document.body.appendChild(toastContainer)
  }

  const toast = document.createElement('div')
  toast.className = 'flavoro-toast'
  toast.setAttribute('role', 'status')
  toast.innerHTML = `<div class="toast-content"><i data-lucide="check-circle-2"></i><span></span></div>${actionCallback ? '<button class="toast-action" type="button"></button>' : ''}`
  toast.querySelector('.toast-content span').textContent = message
  if (actionCallback) toast.querySelector('.toast-action').textContent = actionText

  toastContainer.appendChild(toast)
  initializeIcons()

  if (actionCallback) {
    toast.querySelector('.toast-action')?.addEventListener('click', () => {
      actionCallback()
      toast.remove()
    })
  }

  setTimeout(() => toast.classList.add('is-visible'), 10)
  setTimeout(() => {
    toast.classList.remove('is-visible')
    setTimeout(() => toast.remove(), 400)
  }, 4200)
}

// -------------------------------------------------------------
// Order Bag Drawer Management
// -------------------------------------------------------------
let orderDrawer
let diningMode = 'dine-in'

function setupOrderDrawer() {
  orderDrawer = document.querySelector('#order-bag-drawer')
  if (!orderDrawer) return

  orderDrawer.querySelector('.drawer-backdrop')?.addEventListener('click', closeOrderDrawer)
  orderDrawer.querySelector('.drawer-close')?.addEventListener('click', closeOrderDrawer)
  orderDrawer.addEventListener('keydown', event => { if (event.key === 'Escape') closeOrderDrawer(); else trapDialogFocus(event, orderDrawer) })

  document.querySelectorAll('.open-order-bag-btn').forEach((btn) => {
    btn.addEventListener('click', openOrderDrawer)
  })

  // Mode switcher
  orderDrawer.querySelectorAll('[data-dining-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      orderDrawer.querySelectorAll('[data-dining-mode]').forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')
      diningMode = btn.dataset.diningMode

      const tableInputWrap = orderDrawer.querySelector('#dine-in-table-wrap')
      const pickupTimeWrap = orderDrawer.querySelector('#pickup-time-wrap')
      if (diningMode === 'dine-in') {
        tableInputWrap?.classList.remove('is-hidden')
        pickupTimeWrap?.classList.add('is-hidden')
      } else {
        tableInputWrap?.classList.add('is-hidden')
        pickupTimeWrap?.classList.remove('is-hidden')
      }
    })
  })

  orderDrawer.querySelector('#btn-checkout-order')?.addEventListener('click', submitOrderToKitchen)

  renderOrderDrawer()
}

export function openOrderDrawer() {
  if (orderDrawer) {
    drawerTrigger = document.activeElement
    renderOrderDrawer()
    orderDrawer.classList.add('is-open')
    orderDrawer.setAttribute('aria-hidden', 'false')
    document.body.classList.add('drawer-open')
    orderDrawer.querySelector('.drawer-close')?.focus()
  }
}

export function closeOrderDrawer() {
  if (orderDrawer) {
    orderDrawer.classList.remove('is-open')
    orderDrawer.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('drawer-open')
    drawerTrigger?.focus()
  }
}

function updateCartBadge() {
  const totalCount = order.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = order.reduce((sum, item) => sum + item.price * item.qty, 0)

  document.querySelectorAll('.order-bag-count').forEach((el) => {
    el.textContent = totalCount
  })

  document.querySelectorAll('.order-bag-total').forEach((el) => {
    el.textContent = `$${totalPrice.toFixed(2)}`
  })

  document.querySelectorAll('.floating-order-bag').forEach((el) => {
    el.classList.toggle('is-visible', totalCount > 0)
  })
}

function renderOrderDrawer() {
  if (!orderDrawer) return

  const itemsList = orderDrawer.querySelector('.drawer-items-list')
  const subtotalEl = orderDrawer.querySelector('#drawer-subtotal')
  const taxEl = orderDrawer.querySelector('#drawer-tax')
  const gratuityEl = orderDrawer.querySelector('#drawer-gratuity')
  const grandTotalEl = orderDrawer.querySelector('#drawer-grand-total')
  const checkoutBtn = orderDrawer.querySelector('#btn-checkout-order')

  if (!itemsList) return

  if (order.length === 0) {
    itemsList.innerHTML = `
      <div class="drawer-empty-state">
        <i data-lucide="shopping-bag"></i>
        <h3>Your order bag is empty</h3>
        <p>Explore our menu dishes and customize your ingredients to place an order.</p>
        <button type="button" class="button button-dark" id="btn-drawer-browse">Browse Dishes</button>
      </div>
    `
    itemsList.querySelector('#btn-drawer-browse')?.addEventListener('click', closeOrderDrawer)
    if (subtotalEl) subtotalEl.textContent = '$0.00'
    if (taxEl) taxEl.textContent = '$0.00'
    if (gratuityEl) gratuityEl.textContent = '$0.00'
    if (grandTotalEl) grandTotalEl.textContent = '$0.00'
    if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'true')
    initializeIcons()
    return
  }

  if (checkoutBtn) checkoutBtn.removeAttribute('disabled')

  const subtotal = order.reduce((sum, item) => sum + item.price * item.qty, 0)
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`

  itemsList.innerHTML = order.map((item, index) => {
    const hasExcluded = item.excludedIngredients && item.excludedIngredients.length > 0
    const hasAddons = item.selectedAddons && item.selectedAddons.length > 0

    return `
      <div class="drawer-item-row ${item.isCustomized ? 'is-custom-item' : ''}">
        <img class="drawer-item-thumb" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        <div class="drawer-item-info">
          <div class="drawer-item-head">
            <h4>${escapeHtml(item.name)}</h4>
            <button type="button" class="btn-remove-item" data-remove-index="${index}" aria-label="Remove item">
              <i data-lucide="trash-2"></i>
            </button>
          </div>

          <!-- Itemized Ingredient Modifications -->
          <div class="drawer-ingredient-specs">
            ${hasExcluded ? `
              <div class="spec-excluded">
                <span class="spec-label">Do Not Add:</span>
                <b>${escapeHtml(item.excludedIngredients.join(', '))}</b>
              </div>
            ` : ''}

            ${hasAddons ? `
              <div class="spec-added">
                <span class="spec-label">Added Extras:</span>
                <b>${item.selectedAddons.map((a) => `${escapeHtml(a.name)} (+$${Number(a.price).toFixed(2)})`).join(', ')}</b>
              </div>
            ` : ''}

            <div class="spec-prep">
              <span>Spice: <b>${escapeHtml(item.spice || 'Medium')}</b></span>
              ${item.notes ? `<span> · Note: <em>${escapeHtml(item.notes)}</em></span>` : ''}
            </div>
          </div>

          <div class="drawer-item-footer">
            <div class="item-qty-stepper">
              <button type="button" class="btn-item-qty" data-qty-change="${index}" data-delta="-1" aria-label="Decrease quantity of ${escapeHtml(item.name)}"><i data-lucide="minus"></i></button>
              <span>${item.qty}</span>
              <button type="button" class="btn-item-qty" data-qty-change="${index}" data-delta="1" aria-label="Increase quantity of ${escapeHtml(item.name)}"><i data-lucide="plus"></i></button>
            </div>
            <strong class="item-line-total">$${(Number(item.price) * Number(item.qty)).toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `
  }).join('')

  // Bind modifiers
  itemsList.querySelectorAll('.btn-remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeIndex, 10)
      order.splice(idx, 1)
      saveOrder()
    })
  })

  itemsList.querySelectorAll('.btn-item-qty').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.qtyChange, 10)
      const delta = parseInt(btn.dataset.delta, 10)
      if (order[idx]) {
        order[idx].qty += delta
        if (order[idx].qty <= 0) {
          order.splice(idx, 1)
        }
        saveOrder()
      }
    })
  })

  initializeIcons()
}

function submitOrderToKitchen() {
  if (!order.length) return
  window.location.assign('/pages/checkout.html')
}
