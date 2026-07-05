import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Local Pages Functions + D1 run under `wrangler pages dev` on :8788.
    // Harmless when wrangler isn't running — the quote builder falls back
    // to its email path on proxy failure.
    proxy: { '/api': 'http://127.0.0.1:8788' },
  },
})
