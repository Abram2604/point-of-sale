// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/point-of-sale/', // <- nama repo / nama path GitHub Pages
  plugins: [react()]
})
