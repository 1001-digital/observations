import { type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import type { Config } from '@wagmi/vue'
import {
  type ObservationsMode,
  type CollectionArtifactData,
  type RecentObservationData,
  collectionArtifactsCache,
  collectionObservationsCache,
  getIndexerUrls,
} from '../utils/observations'
import { createOnchainProvider } from '../utils/observation-provider-onchain'
import { createIndexerProvider } from '../utils/observation-provider-indexer'

function getProvider(
  strategy: ObservationsMode,
  indexerUrls: string[],
  wagmi: Config,
  chainId: number,
  contractAddress: Address,
) {
  if (strategy === 'indexer' && indexerUrls.length) {
    return createIndexerProvider(indexerUrls)
  }

  if (strategy === 'onchain') {
    const client = getPublicClient(wagmi, { chainId }) as PublicClient
    if (client) return createOnchainProvider(client, contractAddress)
  }

  return null
}

async function resolveArtifacts(
  strategies: ObservationsMode[],
  collection: Address,
  indexerUrls: string[],
  wagmi: Config,
  chainId: number,
  contractAddress: Address,
): Promise<CollectionArtifactData[]> {
  for (const strategy of strategies) {
    try {
      const provider = getProvider(strategy, indexerUrls, wagmi, chainId, contractAddress)
      if (provider) return await provider.fetchCollectionArtifacts(collection)
    } catch {
      continue
    }
  }
  return []
}

async function resolveObservations(
  strategies: ObservationsMode[],
  collection: Address,
  indexerUrls: string[],
  wagmi: Config,
  chainId: number,
  contractAddress: Address,
): Promise<RecentObservationData[]> {
  for (const strategy of strategies) {
    try {
      const provider = getProvider(strategy, indexerUrls, wagmi, chainId, contractAddress)
      if (provider) return await provider.fetchCollectionObservations(collection)
    } catch {
      continue
    }
  }
  return []
}

export const useCollectionObservations = (collection: Ref<Address>) => {
  const { $wagmi } = useNuxtApp()
  const appConfig = useAppConfig()
  const config = useRuntimeConfig()
  const chainId = useMainChainId()
  const contractAddress = config.public.observationsContract as Address

  const mode = computed<ObservationsMode>(() => (appConfig as any).observations?.mode || 'onchain')
  const indexerUrls = computed(() => getIndexerUrls(config.public.observations))

  const strategies = computed<ObservationsMode[]>(() => mode.value === 'indexer'
    ? ['indexer', 'onchain']
    : ['onchain', 'indexer'],
  )

  const artifactsCacheKey = computed(() => `collection-artifacts-${collection.value}`)
  const observationsCacheKey = computed(() => `collection-observations-${collection.value}`)

  const {
    data: artifacts,
    pending: artifactsPending,
    error: artifactsError,
  } = useAsyncData(
    artifactsCacheKey.value,
    () => collectionArtifactsCache.fetch(artifactsCacheKey.value, () =>
      resolveArtifacts(strategies.value, collection.value, indexerUrls.value, $wagmi as Config, chainId, contractAddress),
    ),
    {
      watch: [collection],
      getCachedData: () => collectionArtifactsCache.get(artifactsCacheKey.value) ?? undefined,
    },
  )

  const {
    data: observations,
    pending: observationsPending,
    error: observationsError,
  } = useAsyncData(
    observationsCacheKey.value,
    () => collectionObservationsCache.fetch(observationsCacheKey.value, () =>
      resolveObservations(strategies.value, collection.value, indexerUrls.value, $wagmi as Config, chainId, contractAddress),
    ),
    {
      watch: [collection],
      getCachedData: () => collectionObservationsCache.get(observationsCacheKey.value) ?? undefined,
    },
  )

  return {
    artifacts: computed(() => artifacts.value ?? []),
    observations: computed(() => observations.value ?? []),
    pending: computed(() => artifactsPending.value || observationsPending.value),
    error: computed(() => artifactsError.value || observationsError.value),
  }
}
