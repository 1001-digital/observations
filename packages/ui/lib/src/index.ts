import { createApp, defineComponent, h } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import type { Address } from 'viem'
import '@1001-digital/styles'
import {
  Globals,
  EvmConfigKey,
  LinkComponentKey,
  IconAliasesKey,
  defaultIconAliases,
} from '@1001-digital/components'
import {
  ObservationsConfigKey,
  type ObservationsConfig,
} from '@1001-digital/observations-components'
import AppLink from './AppLink.vue'
import ArtifactViewer from './ArtifactViewer.vue'
import { createEvmConfig } from './evmConfig'
import { createWagmiConfig } from './wagmi'

export interface ArtifactOptions {
  /** NFT contract address */
  contract: Address
  /** Token ID */
  token: string
  /** Observations protocol contract address */
  observationsContract?: Address
  /** Default chain: 'mainnet' | 'sepolia' */
  chain?: 'mainnet' | 'sepolia'
  /** RPC URLs per chain */
  rpc?: { mainnet?: string[]; sepolia?: string[] }
  /** Indexer API endpoints (uses onchain mode if empty) */
  indexerEndpoints?: string[]
  /** WalletConnect project ID */
  walletConnectProjectId?: string
  /** IPFS gateway URL */
  ipfsGateway?: string
  /** Arweave gateway URL */
  arweaveGateway?: string
  /** ENS indexer URLs */
  ensIndexerUrls?: string[]
}

/**
 * Mount an artifact viewer on a DOM element.
 *
 * @example
 * ```ts
 * const { unmount } = mountArtifact('#viewer', {
 *   contract: '0x036721e5a769cc48b3189efbb9cce4471e8a48b1',
 *   token: '1',
 *   observationsContract: '0x...',
 * })
 * ```
 */
export function mountArtifact(
  el: string | HTMLElement,
  options: ArtifactOptions,
) {
  const element = typeof el === 'string' ? document.querySelector(el) : el
  if (!element) throw new Error(`Element not found: ${el}`)

  const ipfsGateway = options.ipfsGateway ?? 'https://ipfs.vv.xyz/ipfs/'
  const arweaveGateway = options.arweaveGateway ?? 'https://arweave.net/'
  const indexerEndpoints = options.indexerEndpoints ?? []
  const ensIndexerUrls = options.ensIndexerUrls ?? []
  const chain = options.chain ?? 'sepolia'

  const { defaultChain, evmChains } = createEvmConfig(chain)
  const wagmiConfig = createWagmiConfig({
    defaultChain,
    rpc: options.rpc,
    walletConnectProjectId: options.walletConnectProjectId,
  })

  const observationsConfig: ObservationsConfig = {
    observationsContract: options.observationsContract ?? ('0x' as Address),
    indexerEndpoints,
    mode: indexerEndpoints.length ? 'indexer' : 'onchain',
    exampleArtifacts: [],
    ipfsGateway,
    arweaveGateway,
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

  const Root = defineComponent({
    setup() {
      return () => [
        h(Globals),
        h(ArtifactViewer, {
          contract: options.contract,
          token: options.token,
        }),
      ]
    },
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/:contract/:token', component: Root },
    ],
  })
  router.replace(`/${options.contract}/${options.token}`)

  const app = createApp(Root)

  app.use(router)
  app.use(VueQueryPlugin)
  app.use(WagmiPlugin, { config: wagmiConfig })

  app.provide(ObservationsConfigKey, observationsConfig)
  app.provide(LinkComponentKey, AppLink)
  app.provide(IconAliasesKey, defaultIconAliases)
  app.provide(EvmConfigKey, {
    title: 'OBSERVATIONS',
    defaultChain,
    chains: evmChains,
    ens: {
      mode: ensIndexerUrls.length ? 'indexer' : 'chain',
      indexerUrls: ensIndexerUrls,
    },
    ipfsGateway,
    arweaveGateway,
    walletConnectProjectId: options.walletConnectProjectId,
  })

  app.mount(element)

  return { unmount: () => app.unmount() }
}
