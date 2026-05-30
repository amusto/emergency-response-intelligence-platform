import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// The API base is configurable so the same build runs in dev and Docker.
// In dev, requests to /api are proxied to the NestJS server.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // We control activation via a "Reload to update" banner (see pwa.ts),
      // mirroring the time-boxing app — no surprise auto-updates.
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon-48x48.png'],
      manifest: {
        name: 'ERIP — Command Center',
        short_name: 'ERIP',
        description: 'Emergency Response Intelligence Platform',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0b0f17',
        theme_color: '#0b0f17',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Phase 1 of PWA: precache the app shell only. Full offline (API +
        // map-tile caching, background sync) is intentionally deferred.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      // SW stays off in dev so HMR works cleanly (matches time-boxing).
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
