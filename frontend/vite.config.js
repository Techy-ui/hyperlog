import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/hyperlog/', // 👈 Make sure this matches your exact GitHub repo name
})