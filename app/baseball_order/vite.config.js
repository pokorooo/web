import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // When served under /baseball_order/ (app-level deploy), set base accordingly.
  // Override via BASE_PATH env if needed.
  base: process.env.BASE_PATH || '/',
})
