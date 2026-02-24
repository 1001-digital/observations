import { computed, type Ref } from 'vue'
import { getContract, type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { useConfig } from '@wagmi/vue'
import { parseAbi } from 'viem'
import { useChainConfig } from '@1001-digital/components'
import { resolveURI } from './useArtifact'
import { type ObservationsMode } from '../utils/observations'
import { useObservationsConfig, type ObservationsConfig } from '../utils/config'
import { useAsyncFetch } from './useAsyncFetch'

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
      const res = await fetch(`${baseUrl}/artifacts/${address.toLowerCase()}`)
      if (!res.ok) continue
      const data: {
        name: string | null
        symbol: string | null
        owner: string | null
        description: string | null
        image: string | null
        data: Record<string, unknown> | null
      } = await res.json()
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

const fetchContractURI = async (uri: string, config: ObservationsConfig): Promise<CollectionData> => {
  const resolved = resolveURI(uri, config)

  if (resolved.startsWith('data:application/json;base64,')) {
    const base64Data = resolved.split(',')[1]
    return JSON.parse(atob(base64Data!))
  }

  if (resolved.startsWith('data:application/json')) {
    const jsonStr = decodeURIComponent(resolved.split(',')[1]!)
    return JSON.parse(jsonStr)
  }

  const res = await fetch(resolved)
  return await res.json()
}

const fetchCollectionOnChain = async (
  client: PublicClient,
  address: Address,
  config: ObservationsConfig,
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
    ? await fetchContractURI(contractURI, config).catch(() => ({}))
    : {}

  return {
    ...uriData,
    // On-chain values take precedence
    ...(name && { name }),
    ...(symbol && { symbol }),
    ...(owner && { owner }),
  }
}

async function resolveCollection(
  strategies: ObservationsMode[],
  baseUrls: string[],
  client: PublicClient,
  address: Address,
  config: ObservationsConfig,
): Promise<CollectionData> {
  for (const strategy of strategies) {
    try {
      if (strategy === 'indexer') {
        if (!baseUrls.length) continue
        const data = await fetchCollectionFromIndexer(baseUrls, address)
        if (data) return data
      }
      if (strategy === 'onchain') {
        if (!client) continue
        return await fetchCollectionOnChain(client, address, config)
      }
    } catch { continue }
  }
  return {}
}

export const useCollection = (contract: Ref<Address>) => {
  const wagmi = useConfig()
  const config = useObservationsConfig()
  const chainId = useChainConfig('mainnet').id
  const client = getPublicClient(wagmi, { chainId }) as PublicClient
  const baseUrls = getArtifactBaseUrls(config.indexerEndpoints)

  const mode = computed<ObservationsMode>(() => config.mode)
  const strategies = computed<ObservationsMode[]>(() => mode.value === 'indexer'
    ? ['indexer', 'onchain']
    : ['onchain', 'indexer'],
  )

  const {
    data: collection,
    pending,
    error,
  } = useAsyncFetch(`collection-${contract.value}`, () =>
    resolveCollection(strategies.value, baseUrls, client, contract.value, config),
  )

  const image = computed(() => resolveURI(collection.value?.image, config))

  return {
    collection,
    image,
    pending,
    error,
  }
}
