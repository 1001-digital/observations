import { getContract, type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { parseAbi } from 'viem'
import { resolveURI } from './useArtifact'

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

const fetchCollection = async (
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

  const {
    data: collection,
    pending,
    error,
  } = useAsyncData(`collection-${contract.value}`, () =>
    fetchCollection(client, contract.value),
  )

  const image = computed(() => resolveURI(collection.value?.image))

  return {
    collection,
    image,
    pending,
    error,
  }
}
