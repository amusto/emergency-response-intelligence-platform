import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API base is configurable so the same build runs in dev and Docker.
// In dev, requests to /api are proxied to the NestJS server.
export default defineConfig({
  plugins: [react()],
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
