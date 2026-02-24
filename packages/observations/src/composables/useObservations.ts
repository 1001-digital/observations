import { computed, ref, watch, onScopeDispose, type Ref } from 'vue'
import { type Address, type PublicClient } from 'viem'
import { getPublicClient, watchContractEvent } from '@wagmi/core'
import { useConfig, type Config } from '@wagmi/vue'
import { useMainChainId } from '@1001-digital/components'
import {
  type ObservationsMode,
  type ObservationData,
  ObservationsAbi,
  observationsCache,
} from '../utils/observations'
import { createOnchainProvider } from '../utils/observation-provider-onchain'
import { createIndexerProvider } from '../utils/observation-provider-indexer'
import { useObservationsConfig } from '../utils/config'
import { useAsyncFetch } from './useAsyncFetch'

const POLL_INTERVAL = 3_000
const MAX_POLL_ATTEMPTS = 10

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
  const wagmi = useConfig()
  const config = useObservationsConfig()
  const chainId = useMainChainId()
  const contractAddress = config.observationsContract

  const mode = computed<ObservationsMode>(() => config.mode)
  const indexerUrls = computed(() => config.indexerEndpoints)
  const cacheKey = computed(() => `observations-${collection.value}-${tokenId.value}`)

  const strategies = computed<ObservationsMode[]>(() => mode.value === 'indexer'
    ? ['indexer', 'onchain']
    : ['onchain', 'indexer'],
  )

  const fetchFresh = () => resolve(
    strategies.value,
    collection.value,
    tokenId.value,
    indexerUrls.value,
    wagmi,
    chainId,
    contractAddress,
  )

  const {
    data: observations,
    pending,
    error,
    refresh,
  } = useAsyncFetch(
    cacheKey.value,
    () => observationsCache.fetch(cacheKey.value, fetchFresh),
    {
      watch: [collection, tokenId],
      getCachedData: () => observationsCache.get(cacheKey.value) ?? undefined,
    },
  )

  const count = computed(() => observations.value?.count ?? 0n)
  const items = computed(() => observations.value?.items ?? [])

  // Poll until new data appears (bypassing cache)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  function stopPolling () {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  async function pollOnce (previousCount: bigint) {
    try {
      const fresh = await fetchFresh()
      if (fresh.count > previousCount) {
        observations.value = fresh
        return true
      }
    } catch {
      // Ignore fetch errors during polling
    }
    return false
  }

  async function refreshAndPoll () {
    stopPolling()

    const previousCount = count.value

    // Try immediately first
    if (await pollOnce(previousCount)) return

    let attempts = 1

    pollTimer = setInterval(async () => {
      attempts++

      if (await pollOnce(previousCount) || attempts >= MAX_POLL_ATTEMPTS) {
        stopPolling()
      }
    }, POLL_INTERVAL)
  }

  // Watch for new onchain events in real-time
  let unwatchEvents: (() => void) | null = null

  function startWatching () {
    unwatchEvents?.()
    unwatchEvents = watchContractEvent(wagmi, {
      address: contractAddress,
      abi: ObservationsAbi,
      eventName: 'Observation',
      args: {
        collection: collection.value,
        tokenId: tokenId.value,
      },
      onLogs () {
        refreshAndPoll()
      },
    })
  }

  if (typeof window !== 'undefined') {
    startWatching()
    watch([collection, tokenId], startWatching)

    onScopeDispose(() => {
      stopPolling()
      unwatchEvents?.()
    })
  }

  return {
    observations: items,
    count,
    pending,
    error,
    refresh,
    refreshAndPoll,
  }
}
