// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  extends: ['@1001-digital/layers.base', '@1001-digital/layers.evm'],
  runtimeConfig: {
    public: {
      contract: '',
      token: '',
      observationsContract: '',
      evm: {
        chains: {
          sepolia: { rpc1: '', rpc2: '', rpc3: '' },
        },
      },
    },
  },
})
