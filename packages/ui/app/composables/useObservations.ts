import { type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import type { Config } from '@wagmi/vue'
import {
  type ObservationsMode,
  type ObservationData,
  observationsCache,
  getIndexerUrls,
} from '../utils/observations'
import { createOnchainProvider } from '../utils/observation-provider-onchain'
import { createIndexerProvider } from '../utils/observation-provider-indexer'

export type { ObservationData } from '../utils/observations'

async function resolve(
  strategies: ObservationsMode[],
  collection: Address,
  tokenId: bigint,
  indexerUrls: string[],
  wagmi: Config,
  chainId: number,
  contractAddress: Address,
) {
  for (const strategy of strategies) {
    try {
      if (strategy === 'indexer') {
        if (!indexerUrls.length) continue
        return await createIndexerProvider(indexerUrls).fetchObservations(collection, tokenId)
      }

      if (strategy === 'onchain') {
        const client = getPublicClient(wagmi, { chainId }) as PublicClient
        if (!client) continue
        return await createOnchainProvider(client, contractAddress).fetchObservations(collection, tokenId)
      }
    } catch {
      continue
    }
  }

  return { count: 0n, items: [] as ObservationData[] }
}

export const useObservations = (collection: Ref<Address>, tokenId: Ref<bigint>) => {
  const { $wagmi } = useNuxtApp()
  const appConfig = useAppConfig()
  const config = useRuntimeConfig()
  const chainId = useMainChainId()
  const contractAddress = config.public.observationsContract as Address

  const mode = computed<ObservationsMode>(() => (appConfig as any).observations?.mode || 'onchain')
  const indexerUrls = computed(() => getIndexerUrls(config.public.observations))
  const cacheKey = computed(() => `observations-${collection.value}-${tokenId.value}`)

  const {
    data: observations,
    pending,
    error,
    refresh,
  } = useAsyncData(
    cacheKey.value,
    () => {
      const strategies: ObservationsMode[] = mode.value === 'indexer'
        ? ['indexer', 'onchain']
        : ['onchain', 'indexer']

      return observationsCache.fetch(cacheKey.value, () =>
        resolve(strategies, collection.value, tokenId.value, indexerUrls.value, $wagmi as Config, chainId, contractAddress),
      )
    },
    {
      watch: [collection, tokenId],
      getCachedData: () => observationsCache.get(cacheKey.value) ?? undefined,
    },
  )

  const count = computed(() => observations.value?.count ?? 0n)
  const items = computed(() => observations.value?.items ?? [])

  return {
    observations: items,
    count,
    pending,
    error,
    refresh,
  }
}
