import { createQueryClient } from '@1001-digital/dapp-query-core'
import { dappQueryPlugin } from '@1001-digital/dapp-query-vue'

export default defineNuxtPlugin((nuxtApp) => {
  const client = createQueryClient()

  nuxtApp.vueApp.use(dappQueryPlugin, client)
})
