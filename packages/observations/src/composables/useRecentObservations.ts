import { computed } from 'vue'
import { type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { useConfig, type Config } from '@wagmi/vue'
import { useMainChainId } from '@1001-digital/components'
import {
  type ObservationsMode,
  type RecentObservationData,
  recentObservationsCache,
} from '../utils/observations'
import { createOnchainProvider } from '../utils/observation-provider-onchain'
import { createIndexerProvider } from '../utils/observation-provider-indexer'
import { useObservationsConfig } from '../utils/config'
import { useAsyncFetch } from './useAsyncFetch'

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
  const wagmi = useConfig()
  const config = useObservationsConfig()
  const chainId = useMainChainId()
  const contractAddress = config.observationsContract

  const mode = computed<ObservationsMode>(() => config.mode)
  const indexerUrls = computed(() => config.indexerEndpoints)

  const cacheKey = 'recent-observations'

  const {
    data: observations,
    pending,
    error,
    refresh,
  } = useAsyncFetch(
    cacheKey,
    () => {
      const strategies: ObservationsMode[] = mode.value === 'indexer'
        ? ['indexer', 'onchain']
        : ['onchain', 'indexer']

      return recentObservationsCache.fetch(cacheKey, () =>
        resolve(strategies, indexerUrls.value, wagmi, chainId, contractAddress),
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
