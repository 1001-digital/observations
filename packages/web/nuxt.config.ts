import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  extends: ['../ui'],
  devtools: { enabled: true },
  ssr: false,
  css: [join(currentDir, './app/assets/styles/index.css')],
})
