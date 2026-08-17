import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Document Management System',
        short_name: 'DocManage',
        description: 'Document Management System with AI Summary',

        theme_color: '#ffffff',
        background_color: '#ffffff',

        display: 'standalone',

        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]

})