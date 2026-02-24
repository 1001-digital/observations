import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { RouterLink } from 'vue-router'
import type { Address } from 'viem'
import '@1001-digital/styles'
import {
  EvmConfigKey,
  LinkComponentKey,
  IconAliasesKey,
  defaultIconAliases,
} from '@1001-digital/components'
import {
  ObservationsConfigKey,
  type ObservationsConfig,
} from '@1001-digital/observations-components'
import { defaultChain, evmChains } from './evmConfig'
import { wagmiConfig } from './wagmi'
import { router } from './router'
import App from './App.vue'

const env = import.meta.env

const title = env.VITE_TITLE || 'OBSERVATIONS'

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
  exampleArtifacts: [
    '0x7c4111e3bb57b636906a7246db1e70876fd97d97/2',
    '0x7c4111e3bb57b636906a7246db1e70876fd97d97/3',
    '0x7c4111e3bb57b636906a7246db1e70876fd97d97/4',
    '0x66736f0484b079b662264ccb9099ed2b1edf7fdd/7',
    '0x66736f0484b079b662264ccb9099ed2b1edf7fdd/2',
    '0x66736f0484b079b662264ccb9099ed2b1edf7fdd/4',
    '0x036721e5a769cc48b3189efbb9cce4471e8a48b1/1',
    '0x036721e5a769cc48b3189efbb9cce4471e8a48b1/15455',
    '0x036721e5a769cc48b3189efbb9cce4471e8a48b1/1001',
  ],
  ipfsGateway: 'https://ipfs.vv.xyz/ipfs/',
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
  title,
  defaultChain,
  chains: evmChains,
  ens: {
    mode: 'indexer',
    indexerUrls: ensIndexerUrls,
  },
  ipfsGateway: 'https://ipfs.vv.xyz/ipfs/',
  arweaveGateway: 'https://arweave.net/',
  walletConnectProjectId: env.VITE_WALLET_CONNECT_PROJECT_ID || undefined,
})

app.mount('#app')
