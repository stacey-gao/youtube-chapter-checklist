import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites: https://<user>.github.io/<repo>/
// Set VITE_BASE_PATH=/your-repo-name/ in CI or .env.production
const base = process.env.VITE_BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
