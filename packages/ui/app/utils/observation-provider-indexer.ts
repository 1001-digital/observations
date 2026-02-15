import { type Address } from 'viem'
import {
  type ObservationData,
  type RecentObservationData,
  type ObservationProvider,
} from './observations'

interface PonderObservation {
  id: string
  collection: string
  tokenId: string
  observer: string
  note: string
  located: boolean
  x: number
  y: number
  view: number
  time: number
  tip: string
  block: string
  txHash: string
}

const OBSERVATIONS_QUERY = `
  query($collection: String!, $tokenId: BigInt!) {
    artifact(collection: $collection, tokenId: $tokenId) {
      count
    }
    observations(
      where: { collection: $collection, tokenId: $tokenId }
      orderBy: "block"
      orderDirection: "asc"
      limit: 1000
    ) {
      items {
        id observer note located x y view time tip block txHash
      }
    }
  }
`

const RECENT_OBSERVATIONS_QUERY = `
  query {
    observations(orderBy: "block", orderDirection: "desc", limit: 100) {
      items {
        id collection tokenId observer note located x y view time tip block txHash
      }
    }
  }
`

function mapObservation(raw: PonderObservation): ObservationData {
  return {
    id: raw.id,
    observer: raw.observer as Address,
    note: raw.note,
    located: raw.located,
    x: raw.x,
    y: raw.y,
    viewType: raw.view,
    time: raw.time,
    tip: BigInt(raw.tip || '0'),
    blockNumber: BigInt(raw.block),
    transactionHash: raw.txHash,
  }
}

function mapRecentObservation(raw: PonderObservation): RecentObservationData {
  return {
    ...mapObservation(raw),
    collection: raw.collection as Address,
    tokenId: BigInt(raw.tokenId),
  }
}

async function graphqlFetch<T>(
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
  }
}
