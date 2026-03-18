import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

const observationsSrc = fileURLToPath(
  new URL('../components/src', import.meta.url),
)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  extends: ['@1001-digital/layers.base', '@1001-digital/layers.evm'],
  devtools: { enabled: true },
  ssr: false,
  css: [join(currentDir, './app/assets/styles/index.css')],
  components: [
    { path: join(currentDir, './app/components'), pathPrefix: false },
    { path: `${observationsSrc}/components`, pathPrefix: false },
  ],
  imports: {
    dirs: [
      `${observationsSrc}/composables`,
      `${observationsSrc}/utils`,
    ],
    transform: {
      include: [/@1001-digital\/components/, /@1001-digital\/components\.evm/, /@1001-digital\/observations-components/],
    },
  },
  vite: {
    resolve: {
      dedupe: ['vue', '@wagmi/core', '@wagmi/vue', '@1001-digital/components', '@1001-digital/components.evm'],
    },
    optimizeDeps: {
      exclude: ['@1001-digital/components', '@1001-digital/components.evm'],
    },
  },
  runtimeConfig: {
    public: {
      contract: '',
      token: '',
      observationsContract: '',
      observations: {
        indexers: '',
      },
      evm: {
        chains: {
          sepolia: { rpcs: '' },
        },
        ens: {
          indexers: 'http://localhost:42069/ens',
        },
      },
    },
  },
})
