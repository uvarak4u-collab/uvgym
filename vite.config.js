import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    // /api/* is handled by the local API server (server/dev.js) — same routes Vercel will serve
    proxy: { '/api': `http://localhost:${process.env.API_PORT || 3001}` },
  },
  build: {
    chunkSizeWarningLimit: 600, // recharts alone is ~520 kB
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          charts: ['recharts'],
          motion: ['framer-motion', 'canvas-confetti'],
        },
      },
    },
  },
})
