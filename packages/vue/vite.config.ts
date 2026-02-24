import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@ui': fileURLToPath(new URL('../ui/app', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@1001-digital/components'],
  },
})
