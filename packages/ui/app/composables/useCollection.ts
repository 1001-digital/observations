import { getContract, type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { parseAbi } from 'viem'
import { resolveURI } from './useArtifact'
import { getIndexerUrls } from '../utils/observations'

const COLLECTION_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function owner() view returns (address)',
  'function contractURI() view returns (string)',
])

export interface CollectionData {
  name?: string
  symbol?: string
  owner?: Address
  description?: string
  image?: string
  [key: string]: unknown
}

function getArtifactBaseUrls(indexerUrls: string[]): string[] {
  return indexerUrls
    .map((url) => {
      try {
        return new URL(url).origin
      } catch {
        return null
      }
    })
    .filter(Boolean) as string[]
}

async function fetchCollectionFromIndexer(
  baseUrls: string[],
  address: Address,
): Promise<CollectionData | null> {
  for (const baseUrl of baseUrls) {
    try {
      const data = await $fetch<{
        name: string | null
        symbol: string | null
        owner: string | null
        description: string | null
        image: string | null
        data: Record<string, unknown> | null
      }>(`${baseUrl}/artifacts/${address.toLowerCase()}`)
      if (data) {
        return {
          ...(data.data ?? {}),
          ...(data.name && { name: data.name }),
          ...(data.symbol && { symbol: data.symbol }),
          ...(data.owner && { owner: data.owner as Address }),
          ...(data.description && { description: data.description }),
          ...(data.image && { image: data.image }),
        }
      }
    } catch {
      // Try next endpoint
    }
  }
  return null
}

const fetchContractURI = async (uri: string): Promise<CollectionData> => {
  const resolved = resolveURI(uri)

  if (resolved.startsWith('data:application/json;base64,')) {
    const base64Data = resolved.split(',')[1]
    return JSON.parse(atob(base64Data!))
  }

  if (resolved.startsWith('data:application/json')) {
    const jsonStr = decodeURIComponent(resolved.split(',')[1]!)
    return JSON.parse(jsonStr)
  }

  return await $fetch(resolved)
}

const fetchCollectionOnChain = async (
  client: PublicClient,
  address: Address,
): Promise<CollectionData> => {
  const contract = getContract({
    address,
    abi: COLLECTION_ABI,
    client,
  })

  const [name, symbol, owner, contractURI] = await Promise.all([
    contract.read.name().catch(() => undefined),
    contract.read.symbol().catch(() => undefined),
    contract.read.owner().catch(() => undefined),
    contract.read.contractURI().catch(() => undefined),
  ])

  const uriData = contractURI
    ? await fetchContractURI(contractURI).catch(() => ({}))
    : {}

  return {
    ...uriData,
    // On-chain values take precedence
    ...(name && { name }),
    ...(symbol && { symbol }),
    ...(owner && { owner }),
  }
}

export const useCollection = (contract: Ref<Address>) => {
  const { $wagmi } = useNuxtApp()
  const chainId = useChainConfig('mainnet').id
  const client = getPublicClient($wagmi, { chainId }) as PublicClient
  const config = useRuntimeConfig()
  const indexerUrls = getIndexerUrls(config.public.observations)
  const baseUrls = getArtifactBaseUrls(indexerUrls)

  const {
    data: collection,
    pending,
    error,
  } = useAsyncData(`collection-${contract.value}`, async () => {
    // Try indexer first
    if (baseUrls.length) {
      const cached = await fetchCollectionFromIndexer(baseUrls, contract.value)
      if (cached) return cached
    }

    // Fall back to direct RPC
    return fetchCollectionOnChain(client, contract.value)
  })

  const image = computed(() => resolveURI(collection.value?.image))

  return {
    collection,
    image,
    pending,
    error,
  }
}
