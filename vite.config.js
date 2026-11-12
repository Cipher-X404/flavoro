import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'pages/about.html'),
        menu: resolve(import.meta.dirname, 'pages/menu.html'),
        gallery: resolve(import.meta.dirname, 'pages/gallery.html'),
        reservations: resolve(import.meta.dirname, 'pages/reservations.html'),
        blog: resolve(import.meta.dirname, 'pages/blog.html'),
        contact: resolve(import.meta.dirname, 'pages/contact.html'),
        login: resolve(import.meta.dirname, 'pages/login.html'),
        signup: resolve(import.meta.dirname, 'pages/signup.html'),
        notFound: resolve(import.meta.dirname, 'pages/404.html'),
      },
    },
  },
})
