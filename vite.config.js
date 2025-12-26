import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [], // Removed missing assets: favicon.ico, apple-touch-icon.png, masked-icon.svg
      manifest: {
        name: 'Transporte Santa Lucía',
        short_name: 'Santa Lucía',
        description: 'Aplicación oficial de Transporte Santa Lucía',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
