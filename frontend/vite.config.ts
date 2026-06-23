import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Πρόσθεσε αυτό το import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // <-- 2. Πρόσθεσε αυτό εδώ στα plugins
  ],
})