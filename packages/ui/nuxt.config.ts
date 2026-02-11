// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  extends: [
    '@1001-digital/layers.base',
    '@1001-digital/layers.evm',
  ],
  runtimeConfig: {
    public: {
      contract: '',
      token: '',
    },
  },
  devtools: { enabled: true },
})
