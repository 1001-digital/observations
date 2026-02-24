import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { RouterLink } from 'vue-router'
import type { Address } from 'viem'
import {
  EvmConfigKey,
  LinkComponentKey,
  IconAliasesKey,
  defaultIconAliases,
} from '@1001-digital/components'
import '@1001-digital/styles'
import {
  ObservationsConfigKey,
  type ObservationsConfig,
} from '@1001-digital/observations-components'
import { wagmiConfig } from './wagmi'
import { router } from './router'
import App from './App.vue'

const env = import.meta.env

const indexerEndpoints = [
  env.VITE_INDEXER_ENDPOINT_1,
  env.VITE_INDEXER_ENDPOINT_2,
  env.VITE_INDEXER_ENDPOINT_3,
].filter(Boolean) as string[]

const ensIndexerUrls = [env.VITE_ENS_INDEXER_1].filter(Boolean) as string[]

const observationsConfig: ObservationsConfig = {
  observationsContract: (env.VITE_OBSERVATIONS_CONTRACT || '0x') as Address,
  contract: (env.VITE_CONTRACT as Address) || undefined,
  token: env.VITE_TOKEN || undefined,
  indexerEndpoints,
  mode: indexerEndpoints.length ? 'indexer' : 'onchain',
  exampleArtifacts: [],
  ipfsGateway: 'https://ipfs.io/ipfs/',
  arweaveGateway: 'https://arweave.net/',
  artifact: {
    defaultView: 'animation',
    details: {
      showCollection: true,
      showSymbol: true,
      showArtist: true,
      showOwner: true,
    },
  },
}

const app = createApp(App)

app.use(router)
app.use(VueQueryPlugin)
app.use(WagmiPlugin, { config: wagmiConfig })

app.provide(ObservationsConfigKey, observationsConfig)
app.provide(LinkComponentKey, RouterLink)
app.provide(IconAliasesKey, defaultIconAliases)
app.provide(EvmConfigKey, {
  defaultChain: 'sepolia',
  chains: {
    mainnet: { id: 1, blockExplorer: 'https://etherscan.io' },
    sepolia: { id: 11155111, blockExplorer: 'https://sepolia.etherscan.io' },
  },
  ens: {
    mode: 'indexer',
    indexerUrls: ensIndexerUrls,
  },
})

app.mount('#app')
