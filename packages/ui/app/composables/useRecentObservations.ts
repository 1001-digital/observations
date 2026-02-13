import { type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import type { Config } from '@wagmi/vue'
import {
  type ObservationsMode,
  type RecentObservationData,
  recentObservationsCache,
  getIndexerUrls,
} from '../utils/observations'
import { createOnchainProvider } from '../utils/observation-provider-onchain'
import { createIndexerProvider } from '../utils/observation-provider-indexer'

export type { RecentObservationData } from '../utils/observations'

async function resolve(
  strategies: ObservationsMode[],
  indexerUrls: string[],
  wagmi: Config,
  chainId: number,
  contractAddress: Address,
): Promise<RecentObservationData[]> {
  for (const strategy of strategies) {
    try {
      if (strategy === 'indexer') {
        if (!indexerUrls.length) continue
        return await createIndexerProvider(indexerUrls).fetchRecentObservations()
      }

      if (strategy === 'onchain') {
        const client = getPublicClient(wagmi, { chainId }) as PublicClient
        if (!client) continue
        return await createOnchainProvider(client, contractAddress).fetchRecentObservations()
      }
    } catch {
      continue
    }
  }

  return []
}

export const useRecentObservations = () => {
  const { $wagmi } = useNuxtApp()
  const appConfig = useAppConfig()
  const config = useRuntimeConfig()
  const chainId = useMainChainId()
  const contractAddress = config.public.observationsContract as Address

  const mode = computed<ObservationsMode>(() => (appConfig as any).observations?.mode || 'onchain')
  const indexerUrls = computed(() => getIndexerUrls(config.public.observations))

  const cacheKey = 'recent-observations'

  const {
    data: observations,
    pending,
    error,
    refresh,
  } = useAsyncData(
    cacheKey,
    () => {
      const strategies: ObservationsMode[] = mode.value === 'indexer'
        ? ['indexer', 'onchain']
        : ['onchain', 'indexer']

      return recentObservationsCache.fetch(cacheKey, () =>
        resolve(strategies, indexerUrls.value, $wagmi as Config, chainId, contractAddress),
      )
    },
    {
      getCachedData: () => recentObservationsCache.get(cacheKey) ?? undefined,
    },
  )

  const items = computed(() => observations.value ?? [])

  return {
    observations: items,
    pending,
    error,
    refresh,
  }
}
