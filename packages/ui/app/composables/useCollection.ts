import { getContract, type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { parseAbi } from 'viem'

const COLLECTION_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function owner() view returns (address)',
])

export interface CollectionData {
  name?: string
  symbol?: string
  owner?: Address
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

  const [name, symbol, owner] = await Promise.all([
    contract.read.name().catch(() => undefined),
    contract.read.symbol().catch(() => undefined),
    contract.read.owner().catch(() => undefined),
  ])

  return { name, symbol, owner }
}

export const useCollection = (contract: Ref<Address>) => {
  const { $wagmi } = useNuxtApp()
  const chainId = useMainChainId()
  const client = getPublicClient($wagmi, { chainId }) as PublicClient

  const {
    data: collection,
    pending,
    error,
  } = useAsyncData(
    `collection-${contract.value}`,
    () => fetchCollection(client, contract.value),
  )

  return {
    collection,
    pending,
    error,
  }
}
