import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

const observationsSrc = fileURLToPath(
  new URL('../ui/src', import.meta.url),
)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  extends: ['@1001-digital/layers.base', '@1001-digital/layers.evm'],
  devtools: { enabled: true },
  ssr: false,
  css: [join(currentDir, './app/assets/styles/index.css')],
  components: [
    {
      path: `${observationsSrc}/components`,
      pathPrefix: false,
    },
  ],
  imports: {
    dirs: [
      `${observationsSrc}/composables`,
      `${observationsSrc}/utils`,
    ],
    transform: {
      include: [/@1001-digital\/components/, /@1001-digital\/observations-ui/],
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ['@1001-digital/components'],
    },
  },
  runtimeConfig: {
    public: {
      contract: '',
      token: '',
      observationsContract: '',
      observations: {
        indexer: {
          endpoint1: '',
          endpoint2: '',
          endpoint3: '',
        },
      },
      evm: {
        chains: {
          sepolia: { rpc1: '', rpc2: '', rpc3: '' },
        },
        ens: {
          indexer1: 'http://localhost:42069/ens',
        },
      },
    },
  },
})
