import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tambahkan baris ini
  base: '/point-of-sale/', // Sesuaikan dengan nama repository Anda
})