import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Dovra',
        short_name: 'Dovra',
        description: 'Dovra — Document Management & AI',

        theme_color: '#ffffff',
        background_color: '#ffffff',

        display: 'standalone',

        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/img/docly-logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]

})