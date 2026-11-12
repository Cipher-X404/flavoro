import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: { allowedHosts: ['.e2b.app'] },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'pages/about.html'),
        menu: resolve(import.meta.dirname, 'pages/menu.html'),
        checkout: resolve(import.meta.dirname, 'pages/checkout.html'),
        gallery: resolve(import.meta.dirname, 'pages/gallery.html'),
        reservations: resolve(import.meta.dirname, 'pages/reservations.html'),
        blog: resolve(import.meta.dirname, 'pages/blog.html'),
        contact: resolve(import.meta.dirname, 'pages/contact.html'),
        login: resolve(import.meta.dirname, 'pages/login.html'),
        signup: resolve(import.meta.dirname, 'pages/signup.html'),
        notFound: resolve(import.meta.dirname, 'pages/404.html'),
        'admin-login': resolve(import.meta.dirname, 'pages/admin-login.html'),
        'admin-dashboard': resolve(import.meta.dirname, 'pages/admin-dashboard.html'),
        'user-dashboard': resolve(import.meta.dirname, 'pages/user-dashboard.html'),
        'private-dining': resolve(import.meta.dirname, 'pages/private-dining.html'),
        'visit': resolve(import.meta.dirname, 'pages/visit.html'),
        'people': resolve(import.meta.dirname, 'pages/people.html'),
        'journal-gathering': resolve(import.meta.dirname, 'pages/journal-gathering.html'),
        'journal-craft': resolve(import.meta.dirname, 'pages/journal-craft.html'),
        'journal-hospitality': resolve(import.meta.dirname, 'pages/journal-hospitality.html'),
        'privacy': resolve(import.meta.dirname, 'pages/privacy.html'),
        'terms': resolve(import.meta.dirname, 'pages/terms.html'),
        'accessibility': resolve(import.meta.dirname, 'pages/accessibility.html'),
        'reservation-confirmation': resolve(import.meta.dirname, 'pages/reservation-confirmation.html'),
        'order-confirmation': resolve(import.meta.dirname, 'pages/order-confirmation.html'),

      },
    },
  },
})
