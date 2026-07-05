import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/wyjazdy/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-source.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: '/wyjazdy/',
        name: 'Wyjazdy',
        short_name: 'Wyjazdy',
        description: 'Osobisty kombajn do zarządzania wyjazdami: co kupione, ile kosztowało, kto ile oddał.',
        lang: 'pl',
        start_url: '/wyjazdy/',
        scope: '/wyjazdy/',
        display: 'standalone',
        background_color: '#f6f5f1',
        theme_color: '#0d9488',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Firestore's own offline cache handles data; this just needs the app shell
        // available offline so it can open at all without signal mid-trip.
        globPatterns: ['**/*.{js,css,html,png,ico,svg}'],
      },
    }),
  ],
})
