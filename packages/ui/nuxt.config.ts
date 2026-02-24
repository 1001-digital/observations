import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)
const observationsPkg = resolve('../../node_modules/@1001-digital/observations/src')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  extends: ['@1001-digital/layers.base', '@1001-digital/layers.evm'],
  components: [
    {
      path: `${observationsPkg}/components`,
      pathPrefix: false,
    },
  ],
  imports: {
    dirs: [
      `${observationsPkg}/composables`,
      `${observationsPkg}/utils`,
    ],
    transform: {
      include: [/@1001-digital\/components/, /@1001-digital\/observations/],
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
