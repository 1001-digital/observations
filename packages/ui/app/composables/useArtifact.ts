import { computed, type Ref } from 'vue'
import { getContract, type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { useConfig } from '@wagmi/vue'
import { parseAbi } from 'viem'
import { resolveUri, useChainConfig } from '@1001-digital/components'
import { type ObservationsMode } from '../utils/observations'
import { useObservationsConfig } from '../utils/config'
import { useAsyncFetch } from './useAsyncFetch'

const ERC721_ABI = parseAbi([
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
])

const ERC1155_ABI = parseAbi([
  'function uri(uint256) view returns (string)',
  'function supportsInterface(bytes4 interfaceId) view returns (bool)',
])

const ERC721_INTERFACE_ID = '0x80ac58cd'
const ERC1155_INTERFACE_ID = '0xd9b67a26'

export interface TokenMetadata {
  name?: string
  description?: string
  image?: string
  animation_url?: string
  [key: string]: unknown
}

export const resolveURI = (uri?: string): string => {
  const config = useObservationsConfig()
  return resolveUri(uri, {
    ipfsGateway: config.ipfsGateway,
    arweaveGateway: config.arweaveGateway,
  })
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

async function fetchTokenFromIndexer(
  baseUrls: string[],
  collection: Address,
  tokenId: bigint,
): Promise<TokenMetadata | null> {
  for (const baseUrl of baseUrls) {
    try {
      const res = await fetch(`${baseUrl}/artifacts/${collection.toLowerCase()}/${tokenId}`)
      if (!res.ok) continue
      const data: {
        name: string | null
        description: string | null
        image: string | null
        animationUrl: string | null
        data: Record<string, unknown> | null
      } = await res.json()
      if (data) {
        return {
          name: data.name ?? undefined,
          description: data.description ?? undefined,
          image: data.image ?? undefined,
          animation_url: data.animationUrl ?? undefined,
          ...(data.data ?? {}),
        }
      }
    } catch {
      // Try next endpoint
    }
  }
  return null
}

const fetchTokenURI = async (
  client: PublicClient,
  address: Address,
  tokenId: bigint,
): Promise<string> => {
  const contract = getContract({
    address,
    abi: [...ERC721_ABI, ...ERC1155_ABI],
    client,
  })

  // Detect token standard via ERC165
  const isERC721 = await contract.read
    .supportsInterface([ERC721_INTERFACE_ID])
    .catch(() => false)

  if (isERC721) {
    return await contract.read.tokenURI([tokenId])
  }

  const isERC1155 = await contract.read
    .supportsInterface([ERC1155_INTERFACE_ID])
    .catch(() => false)

  if (isERC1155) {
    const uri = await contract.read.uri([tokenId])
    const tokenIdHex = tokenId.toString(16).padStart(64, '0')
    return uri.replace('{id}', tokenIdHex)
  }

  // Fallback: try ERC721 tokenURI directly
  return await contract.read.tokenURI([tokenId])
}

const fetchMetadata = async (uri: string): Promise<TokenMetadata> => {
  const resolved = resolveURI(uri)

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

async function resolveArtifact(
  strategies: ObservationsMode[],
  baseUrls: string[],
  client: PublicClient,
  collection: Address,
  tokenId: bigint,
): Promise<TokenMetadata> {
  for (const strategy of strategies) {
    try {
      if (strategy === 'indexer') {
        if (!baseUrls.length) continue
        const data = await fetchTokenFromIndexer(baseUrls, collection, tokenId)
        if (data) return data
      }
      if (strategy === 'onchain') {
        if (!client) continue
        return await fetchTokenURI(client, collection, tokenId).then(fetchMetadata)
      }
    } catch { continue }
  }
  return {}
}

export const useArtifact = (contract: Ref<Address>, tokenId: Ref<bigint>) => {
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
    data: metadata,
    pending,
    error,
  } = useAsyncFetch(`artifact-${contract.value}-${tokenId.value}`, () =>
    resolveArtifact(strategies.value, baseUrls, client, contract.value, tokenId.value),
  )

  const { data: owner } = useAsyncFetch(
    `artifact-owner-${contract.value}-${tokenId.value}`,
    () => {
      const c = getContract({ address: contract.value, abi: ERC721_ABI, client })
      return c.read.ownerOf([tokenId.value]).catch(() => undefined)
    },
  )

  const image = computed(() => resolveURI(metadata.value?.image))
  const animationUrl = computed(() => resolveURI(metadata.value?.animation_url))

  return {
    metadata,
    owner,
    image,
    animationUrl,
    pending,
    error,
  }
}
