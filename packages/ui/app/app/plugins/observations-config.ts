import type { Address } from 'viem'
import { ObservationsConfigKey, type ObservationsConfig } from '@1001-digital/observations-components'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const appConfig = useAppConfig()

  const pub = runtimeConfig.public
  const indexer = (pub as any).observations?.indexer
  const indexerEndpoints = indexer
    ? [indexer.endpoint1, indexer.endpoint2, indexer.endpoint3].filter(Boolean) as string[]
    : []

  const config: ObservationsConfig = {
    observationsContract: (pub as any).observationsContract as Address,
    contract: ((pub as any).contract as Address) || undefined,
    token: (pub as any).token || undefined,
    indexerEndpoints,
    mode: (appConfig as any).observations?.mode || 'onchain',
    exampleArtifacts: (appConfig as any).exampleArtifacts || [],
    ipfsGateway: (appConfig as any).ipfsGateway || 'https://ipfs.io/ipfs/',
    arweaveGateway: (appConfig as any).arweaveGateway || 'https://arweave.net/',
    artifact: {
      defaultView: (appConfig as any).artifact?.defaultView || 'animation',
      details: {
        showCollection: (appConfig as any).artifact?.details?.showCollection ?? true,
        showSymbol: (appConfig as any).artifact?.details?.showSymbol ?? true,
        showArtist: (appConfig as any).artifact?.details?.showArtist ?? true,
        showOwner: (appConfig as any).artifact?.details?.showOwner ?? true,
      },
    },
  }

  nuxtApp.vueApp.provide(ObservationsConfigKey, config)
})
