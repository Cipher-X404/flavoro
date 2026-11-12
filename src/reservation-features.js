import { initializeIcons } from './icons.js'

const reservationMenuData = {
  experiences: [
    {
      id: 'tasting',
      name: "Chef Amara's 7-Course Seasonal Tasting",
      price: 95,
      priceLabel: '$95 per guest',
      badge: 'Most Popular',
      desc: 'An expressive seven-course sensory progression guided by peak market harvest and open live coals.',
      courses: [
        'Ember Prawn with Preserved Lemon Amuse-Bouche',
        'Charred Heirloom Tomatoes with Buffalo Burrata',
        'Crispy Day-Boat Snapper in Coconut Lime Emulsion',
        '12-Hour Smoked Beef Short Rib over Cassava Fondant',
        'Wild Finger Lime & Sorrel Granita Cleanser',
        'Midnight Dark Chocolate Molten Fondant & Bourbon Gelato',
        'Warm Petit Fours & Hearth Infused Digestifs',
      ],
    },
    {
      id: 'feasting',
      name: 'Hearthside Communal Family Feast',
      price: 72,
      priceLabel: '$72 per guest',
      badge: 'Best for Groups (4+)',
      desc: 'Generous sharing platters served down the center of the table on hand-thrown local ceramics.',
      courses: [
        'Warm 48-Hour Heritage Sourdough with Smoked Ember Butter',
        'Blistered Heirloom Burrata & Grilled Garden Greens',
        'Family Platter of 12-Hour Short Ribs & Wood-Fired Market Fish',
        'Crispy Cassava Rosti Cakes & Charred Broccolini',
        'Decadent Warm Chocolate & Pastry Dessert Board',
      ],
    },
    {
      id: 'alacarte',
      name: 'Curated A La Carte Table Course Selection',
      price: 0,
      priceLabel: 'Priced per item selected',
      badge: 'Custom Table Choice',
      desc: 'Select individual live menu courses in advance for our kitchen pass to fire upon your seating.',
      starters: [
        { name: 'Charred Heirloom Salad & Burrata', price: '$17' },
        { name: 'Wild Mushroom Toast with Goat Curd & Egg', price: '$18' },
        { name: 'Ember Wood Prawns with Preserved Lemon', price: '$22' },
        { name: 'Sunrise Brioche with Meyer Curd', price: '$14' },
      ],
      mains: [
        { name: '12-Hour Smoked Beef Short Rib & Cassava', price: '$34' },
        { name: 'Market Red Snapper in Coconut Embers', price: '$32' },
        { name: 'Truffle Alfredo Fresh Tagliolini', price: '$24' },
        { name: 'Fire-Grilled Herb Chicken & Root Jus', price: '$25' },
        { name: 'Garden Over Live Fire (Charred Aubergine)', price: '$25' },
      ],
      desserts: [
        { name: 'Midnight Chocolate Molten Fondant', price: '$16' },
        { name: 'Coconut Flame Hotcakes with Mango', price: '$16' },
        { name: 'Artisan Cheeses & Honeycomb Board', price: '$18' },
      ],
      pairings: [
        { name: 'The Discovery Wine Flight', price: '+$38/guest' },
        { name: 'The Grand Reserve Wine Flight', price: '+$68/guest' },
        { name: 'Botanical Zero-Proof Flight', price: '+$28/guest' },
        { name: 'Choose Beverage at Table', price: 'A la carte' },
      ],
    },
  ],
}

// Current reservation live menu selection state
let selectedExperience = 'tasting'
let curatedCourses = {
  starter: reservationMenuData.experiences[2].starters[0].name,
  main: reservationMenuData.experiences[2].mains[0].name,
  dessert: reservationMenuData.experiences[2].desserts[0].name,
  pairing: reservationMenuData.experiences[2].pairings[0].name,
}

export function initReservationFeatures() {
  const container = document.querySelector('#reservation-live-menu-wrap')
  if (!container) return

  renderReservationLiveMenu(container)
  setupReservationFormSubmission()
  initializeIcons()
}

function renderReservationLiveMenu(container) {
  const exp = reservationMenuData.experiences.find((e) => e.id === selectedExperience)

  container.innerHTML = `
    <div class="res-menu-container">
      <div class="res-menu-header">
        <span class="eyebrow"><i data-lucide="utensils"></i> Table Course Curation</span>
        <h3>Pre-Select Your Live Table Dining Experience</h3>
        <p>Choose what Chef Amara and our live-fire hearth will prepare for your reservation.</p>
      </div>

      <!-- Format Switcher Cards -->
      <div class="exp-format-grid">
        ${reservationMenuData.experiences.map((item) => `
          <div class="exp-card ${selectedExperience === item.id ? 'is-selected' : ''}" data-exp-id="${item.id}">
            <div class="exp-card-head">
              <span class="exp-badge">${item.badge}</span>
              <strong class="exp-price">${item.priceLabel}</strong>
            </div>
            <h4>${item.name}</h4>
            <p>${item.desc}</p>
            <div class="exp-select-cue">
              <i data-lucide="${selectedExperience === item.id ? 'check-circle-2' : 'circle'}"></i>
              <span>${selectedExperience === item.id ? 'Selected for Table' : 'Select Experience'}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Experience Details / Course View -->
      <div class="res-course-preview-box">
        ${selectedExperience === 'tasting' ? `
          <div class="tasting-preview-content">
            <div class="preview-head">
              <h4>Chef Amara's 7-Course Live Tasting Journey</h4>
              <span>$95.00 per guest · Served to entire table</span>
            </div>
            <ol class="tasting-courses-list">
              ${exp.courses.map((course, idx) => `
                <li>
                  <span class="course-num">Course 0${idx + 1}</span>
                  <b>${course}</b>
                </li>
              `).join('')}
            </ol>
          </div>
        ` : selectedExperience === 'feasting' ? `
          <div class="tasting-preview-content">
            <div class="preview-head">
              <h4>Hearthside Communal Family Feast</h4>
              <span>$72.00 per guest · Generous sharing platters</span>
            </div>
            <ol class="tasting-courses-list">
              ${exp.courses.map((course, idx) => `
                <li>
                  <span class="course-num">Platter 0${idx + 1}</span>
                  <b>${course}</b>
                </li>
              `).join('')}
            </ol>
          </div>
        ` : `
          <!-- Curated A La Carte Course Builder -->
          <div class="alacarte-picker-wrap">
            <div class="preview-head">
              <h4>Customize Your Table's Multi-Course Progression</h4>
              <span>Select the exact live dishes for your party:</span>
            </div>

            <div class="course-picker-sections">
              <!-- Starter -->
              <div class="picker-section">
                <span class="picker-label">1. Table Starter:</span>
                <div class="picker-options">
                  ${reservationMenuData.experiences[2].starters.map((item) => `
                    <label class="picker-pill-card ${curatedCourses.starter === item.name ? 'is-active' : ''}">
                      <input type="radio" name="res-starter" value="${item.name}" ${curatedCourses.starter === item.name ? 'checked' : ''}>
                      <span>${item.name}</span>
                      <b>${item.price}</b>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Main -->
              <div class="picker-section">
                <span class="picker-label">2. Hearth Live-Fire Main:</span>
                <div class="picker-options">
                  ${reservationMenuData.experiences[2].mains.map((item) => `
                    <label class="picker-pill-card ${curatedCourses.main === item.name ? 'is-active' : ''}">
                      <input type="radio" name="res-main" value="${item.name}" ${curatedCourses.main === item.name ? 'checked' : ''}>
                      <span>${item.name}</span>
                      <b>${item.price}</b>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Dessert -->
              <div class="picker-section">
                <span class="picker-label">3. Sweet Hearth Finale:</span>
                <div class="picker-options">
                  ${reservationMenuData.experiences[2].desserts.map((item) => `
                    <label class="picker-pill-card ${curatedCourses.dessert === item.name ? 'is-active' : ''}">
                      <input type="radio" name="res-dessert" value="${item.name}" ${curatedCourses.dessert === item.name ? 'checked' : ''}>
                      <span>${item.name}</span>
                      <b>${item.price}</b>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Pairing -->
              <div class="picker-section">
                <span class="picker-label">4. Sommelier Cellar Flight:</span>
                <div class="picker-options">
                  ${reservationMenuData.experiences[2].pairings.map((item) => `
                    <label class="picker-pill-card ${curatedCourses.pairing === item.name ? 'is-active' : ''}">
                      <input type="radio" name="res-pairing" value="${item.name}" ${curatedCourses.pairing === item.name ? 'checked' : ''}>
                      <span>${item.name}</span>
                      <b>${item.price}</b>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `}
      </div>

      <!-- Live Selection Summary Banner -->
      <div class="res-selection-summary-banner">
        <div class="summary-left">
          <i data-lucide="sparkles"></i>
          <div>
            <strong>Attached to Your Table Reservation:</strong>
            <p>
              ${selectedExperience === 'tasting' ? '7-Course Seasonal Live-Fire Tasting Journey' :
                selectedExperience === 'feasting' ? 'Hearthside Communal Family Feast' :
                `Custom Menu: ${curatedCourses.starter} → ${curatedCourses.main} → ${curatedCourses.dessert} (${curatedCourses.pairing})`}
            </p>
          </div>
        </div>
        <span class="summary-badge">Kitchen Notified Ahead</span>
      </div>
    </div>
  `

  initializeIcons()

  // Experience Card Clicks
  container.querySelectorAll('.exp-card').forEach((card) => {
    card.addEventListener('click', () => {
      selectedExperience = card.dataset.expId
      renderReservationLiveMenu(container)
    })
  })

  // Radio triggers for A La Carte
  container.querySelectorAll('input[name="res-starter"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      curatedCourses.starter = radio.value
      renderReservationLiveMenu(container)
    })
  })
  container.querySelectorAll('input[name="res-main"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      curatedCourses.main = radio.value
      renderReservationLiveMenu(container)
    })
  })
  container.querySelectorAll('input[name="res-dessert"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      curatedCourses.dessert = radio.value
      renderReservationLiveMenu(container)
    })
  })
  container.querySelectorAll('input[name="res-pairing"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      curatedCourses.pairing = radio.value
      renderReservationLiveMenu(container)
    })
  })
}

function setupReservationFormSubmission() {
  const form = document.querySelector('#reservation-booking-form')
  if (!form) return
  const date = form.querySelector('[name="date"]')
  if (date) { const now = new Date(); date.min = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}` }
  form.addEventListener('submit', event => {
    event.preventDefault()
    const data = new FormData(form)
    const trigger = document.activeElement
    const overlay = document.createElement('div')
    overlay.className = 'booking-review-overlay'
    overlay.innerHTML = `<section class="booking-review-card" role="dialog" aria-modal="true" aria-labelledby="booking-review-title" aria-describedby="booking-review-desc"><button class="booking-review-close" type="button" aria-label="Close review">×</button><div class="booking-review-icon"><i data-lucide="calendar-days"></i></div><span class="eyebrow">YOUR TABLE / PREVIEW</span><h2 id="booking-review-title">A moment to <em>check.</em></h2><p id="booking-review-desc">Your selections are ready to review. This is not a confirmed reservation.</p><div class="booking-review-list"></div><div class="booking-review-notice"><i data-lucide="info"></i><span>Online booking is not connected. No request has been sent and availability is not live.</span></div><button class="button button-dark booking-review-done" type="button">Back to your selections</button></section>`
    const list = overlay.querySelector('.booking-review-list')
    for (const [label, key] of [['Guest','name'],['Email','email'],['Date','date'],['Preferred time','time'],['Party size','party'],['Setting','setting']]) {
      const row = document.createElement('div'), title = document.createElement('span'), value = document.createElement('strong')
      title.textContent = label; value.textContent = data.get(key) || '—'; row.append(title, value); list.append(row)
    }
    const close = () => { overlay.remove(); document.body.classList.remove('modal-open'); trigger?.focus() }
    overlay.querySelector('.booking-review-close').addEventListener('click', close)
    overlay.querySelector('.booking-review-done').addEventListener('click', close)
    overlay.addEventListener('click', e => { if (e.target === overlay) close() })
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab') { const buttons = [...overlay.querySelectorAll('button')]; if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons.at(-1).focus() } else if (!e.shiftKey && document.activeElement === buttons.at(-1)) { e.preventDefault(); buttons[0].focus() } }
    })
    document.body.append(overlay); document.body.classList.add('modal-open'); initializeIcons(); overlay.querySelector('.booking-review-close').focus()
  })
}
