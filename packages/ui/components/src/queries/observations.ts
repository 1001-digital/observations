import { type Address, type PublicClient } from 'viem'
import { getPublicClient, watchContractEvent } from '@wagmi/core'
import type { Config } from '@wagmi/vue'
import { customSource, type QueryDefinition } from '@1001-digital/dapp-query-core'
import {
  ObservationsAbi,
  type ObservationData,
  type RecentObservationData,
  type CollectionArtifactData,
} from '../utils/observations'
import { createIndexerProvider } from '../utils/observation-provider-indexer'
import { createOnchainProvider } from '../utils/observation-provider-onchain'
import type { ObservationsConfig } from '../utils/config'

type IndexerProvider = ReturnType<typeof createIndexerProvider>
type OnchainProvider = ReturnType<typeof createOnchainProvider>

function makeSources<T>(
  config: ObservationsConfig,
  wagmi: Config,
  chainId: number,
  id: string,
  indexerFetch: (provider: IndexerProvider, ...args: unknown[]) => Promise<T>,
  onchainFetch: (provider: OnchainProvider, ...args: unknown[]) => Promise<T>,
) {
  const indexer = customSource<T>({
    id: `${id}-indexer`,
    fetch: async (...args: unknown[]) => {
      if (!config.indexerEndpoints.length) throw new Error('No indexer endpoints')
      return indexerFetch(createIndexerProvider(config.indexerEndpoints), ...args)
    },
  })

  const onchain = customSource<T>({
    id: `${id}-onchain`,
    fetch: async (...args: unknown[]) => {
      const client = getPublicClient(wagmi, { chainId }) as PublicClient
      if (!client) throw new Error('No public client')
      return onchainFetch(createOnchainProvider(client, config.observationsContract), ...args)
    },
  })

  return config.mode === 'indexer' ? [indexer, onchain] : [onchain, indexer]
}

export function createObservationsQuery(
  config: ObservationsConfig,
  wagmi: Config,
  chainId: number,
): QueryDefinition<{ count: bigint; items: ObservationData[] }, [Address, bigint]> {
  return {
    key: (collection: Address, tokenId: bigint) => `observations:${collection}:${tokenId}`,
    sources: makeSources(
      config, wagmi, chainId, 'observations',
      (p, collection, tokenId) => p.fetchObservations(collection as Address, tokenId as bigint),
      (p, collection, tokenId) => p.fetchObservations(collection as Address, tokenId as bigint),
    ),
    watch: (collection: Address, tokenId: bigint) => (onChange: () => void) => {
      return watchContractEvent(wagmi, {
        address: config.observationsContract,
        abi: ObservationsAbi,
        eventName: 'Observation',
        args: { collection, tokenId },
        onLogs: () => onChange(),
      })
    },
  }
}

export function createRecentObservationsQuery(
  config: ObservationsConfig,
  wagmi: Config,
  chainId: number,
): QueryDefinition<RecentObservationData[], []> {
  return {
    key: () => 'recent-observations',
    sources: makeSources(
      config, wagmi, chainId, 'recent-observations',
      (p) => p.fetchRecentObservations(),
      (p) => p.fetchRecentObservations(),
    ),
  }
}

export function createCollectionArtifactsQuery(
  config: ObservationsConfig,
  wagmi: Config,
  chainId: number,
): QueryDefinition<CollectionArtifactData[], [Address]> {
  return {
    key: (collection: Address) => `collection-artifacts:${collection}`,
    sources: makeSources(
      config, wagmi, chainId, 'collection-artifacts',
      (p, collection) => p.fetchCollectionArtifacts(collection as Address),
      (p, collection) => p.fetchCollectionArtifacts(collection as Address),
    ),
  }
}

export function createCollectionObservationsQuery(
  config: ObservationsConfig,
  wagmi: Config,
  chainId: number,
): QueryDefinition<RecentObservationData[], [Address]> {
  return {
    key: (collection: Address) => `collection-observations:${collection}`,
    sources: makeSources(
      config, wagmi, chainId, 'collection-observations',
      (p, collection) => p.fetchCollectionObservations(collection as Address),
      (p, collection) => p.fetchCollectionObservations(collection as Address),
    ),
  }
}
