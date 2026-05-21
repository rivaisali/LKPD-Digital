import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      pwaAssets: {
        disabled: false,
        config: true,
      },
      manifest: {
        name: 'Petualangan Nita Karawo',
        short_name: 'Nita Karawo',
        description: 'LKPD Digital Transformasi Geometri berbasis Etnomatematika Karawo',
        theme_color: '#7C3AED',
        background_color: '#FFF7ED',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Precache semua aset statis termasuk gambar jpg/jpeg
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2,jpg,jpeg}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Tangani navigasi SPA saat offline — semua route kembali ke index.html
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/sw\.js/],
        runtimeCaching: [
          {
            // Cache CSS stylesheet Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Cache file font sebenarnya dari gstatic (Plus Jakarta Sans + Material Symbols)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
