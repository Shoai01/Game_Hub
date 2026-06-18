import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/v1/room': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
