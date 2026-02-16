import { type Address } from 'viem'
import {
  type ObservationData,
  type RecentObservationData,
  type CollectionArtifactData,
  type ObservationProvider,
} from './observations'

export interface PaginatedObservations {
  items: RecentObservationData[]
  endCursor: string | null
  hasNextPage: boolean
  totalCount: number
}

interface PonderObservation {
  id: string
  collection: string
  tokenId: string
  observer: string
  parent: string
  update: boolean
  note: string
  located: boolean
  x: number
  y: number
  view: number
  time: number
  tip: string
  updatedBlock: string | null
  block: string
  txHash: string
}

const OBSERVATIONS_QUERY = `
  query($collection: String!, $tokenId: BigInt!) {
    artifact(collection: $collection, tokenId: $tokenId) {
      count
    }
    observations(
      where: { collection: $collection, tokenId: $tokenId, update: false, deleted: false }
      orderBy: "block"
      orderDirection: "asc"
      limit: 1000
    ) {
      items {
        id parent update observer note located x y view time tip updatedBlock block txHash
      }
    }
  }
`

const RECENT_OBSERVATIONS_QUERY = `
  query {
    observations(where: { update: false, deleted: false }, orderBy: "block", orderDirection: "desc", limit: 100) {
      items {
        id collection tokenId parent update observer note located x y view time tip updatedBlock block txHash
      }
    }
  }
`

const COLLECTION_ARTIFACTS_QUERY = `
  query($collection: String!) {
    artifacts(
      where: { collection: $collection }
      orderBy: "count"
      orderDirection: "desc"
      limit: 1000
    ) {
      items {
        tokenId
        count
      }
    }
  }
`

const COLLECTION_OBSERVATIONS_QUERY = `
  query($collection: String!) {
    observations(
      where: { collection: $collection, update: false, deleted: false }
      orderBy: "block"
      orderDirection: "desc"
      limit: 100
    ) {
      items {
        id collection tokenId parent update observer note located x y view time tip updatedBlock block txHash
      }
    }
  }
`

const OBSERVER_OBSERVATIONS_QUERY = `
  query($observer: String!, $limit: Int!, $after: String) {
    observations(
      where: { observer: $observer, update: false, deleted: false }
      orderBy: "block"
      orderDirection: "desc"
      limit: $limit
      after: $after
    ) {
      items {
        id collection tokenId parent update observer note located x y view time tip updatedBlock block txHash
      }
      pageInfo {
        endCursor
        hasNextPage
      }
      totalCount
    }
  }
`

function mapObservation(raw: PonderObservation): ObservationData {
  return {
    id: raw.id,
    parent: BigInt(raw.parent || '0'),
    update: raw.update,
    observer: raw.observer as Address,
    note: raw.note,
    located: raw.located,
    x: raw.x,
    y: raw.y,
    viewType: raw.view,
    time: raw.time,
    tip: BigInt(raw.tip || '0'),
    blockNumber: BigInt(raw.block),
    updatedBlock: raw.updatedBlock ? BigInt(raw.updatedBlock) : undefined,
    transactionHash: raw.txHash,
  }
}

export function mapRecentObservation(raw: PonderObservation): RecentObservationData {
  return {
    ...mapObservation(raw),
    collection: raw.collection as Address,
    tokenId: BigInt(raw.tokenId),
  }
}

export async function graphqlFetch<T>(
  endpoints: string[],
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  let lastError: Error | undefined

  for (const endpoint of endpoints) {
    try {
      const response = await $fetch<{ data: T; errors?: { message: string }[] }>(endpoint, {
        method: 'POST',
        body: { query, variables },
      })

      if (response.errors?.length) {
        throw new Error(response.errors![0]!.message)
      }

      return response.data
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError ?? new Error('No indexer endpoints configured')
}

export async function fetchObserverObservations(
  endpoints: string[],
  observer: string,
  limit: number = 50,
  after?: string,
): Promise<PaginatedObservations> {
  const data = await graphqlFetch<{
    observations: {
      items: PonderObservation[]
      pageInfo: { endCursor: string | null; hasNextPage: boolean }
      totalCount: number
    }
  }>(endpoints, OBSERVER_OBSERVATIONS_QUERY, {
    observer: observer.toLowerCase(),
    limit,
    after,
  })

  return {
    items: data.observations.items.map(mapRecentObservation),
    endCursor: data.observations.pageInfo.endCursor,
    hasNextPage: data.observations.pageInfo.hasNextPage,
    totalCount: data.observations.totalCount,
  }
}

export function createIndexerProvider(endpoints: string[]): ObservationProvider {
  return {
    async fetchObservations(collection, tokenId) {
      const data = await graphqlFetch<{
        artifact: { count: string } | null
        observations: { items: PonderObservation[] }
      }>(endpoints, OBSERVATIONS_QUERY, {
        collection: collection.toLowerCase(),
        tokenId: tokenId.toString(),
      })

      const count = data.artifact ? BigInt(data.artifact.count) : 0n
      const items = data.observations.items.map(mapObservation)

      return { count, items }
    },

    async fetchRecentObservations() {
      const data = await graphqlFetch<{
        observations: { items: PonderObservation[] }
      }>(endpoints, RECENT_OBSERVATIONS_QUERY)

      return data.observations.items.map(mapRecentObservation).reverse()
    },

    async fetchCollectionArtifacts(collection) {
      const data = await graphqlFetch<{
        artifacts: { items: { tokenId: string; count: string }[] }
      }>(endpoints, COLLECTION_ARTIFACTS_QUERY, {
        collection: collection.toLowerCase(),
      })

      return data.artifacts.items.map((item): CollectionArtifactData => ({
        tokenId: BigInt(item.tokenId),
        count: BigInt(item.count),
      }))
    },

    async fetchCollectionObservations(collection) {
      const data = await graphqlFetch<{
        observations: { items: PonderObservation[] }
      }>(endpoints, COLLECTION_OBSERVATIONS_QUERY, {
        collection: collection.toLowerCase(),
      })

      return data.observations.items.map(mapRecentObservation)
    },
  }
}
