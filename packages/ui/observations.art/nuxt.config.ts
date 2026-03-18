import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  extends: ['../app'],
  css: [join(currentDir, './app/assets/styles/index.css')],
  watch: ['../components/src/**', '../app/app/**'],
})
