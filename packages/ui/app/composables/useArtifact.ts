import { getContract, type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { parseAbi } from 'viem'

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

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'
const ARWEAVE_GATEWAY = 'https://arweave.net/'

export interface TokenMetadata {
  name?: string
  description?: string
  image?: string
  animation_url?: string
  [key: string]: unknown
}

export const resolveURI = (uri?: string): string => {
  if (!uri) return ''
  if (uri.startsWith('data:')) return uri
  if (uri.startsWith('ipfs://'))
    return IPFS_GATEWAY + uri.replace('ipfs://', '')
  if (uri.startsWith('ar://')) return ARWEAVE_GATEWAY + uri.replace('ar://', '')
  if (uri.startsWith('Qm') || uri.startsWith('baf')) return IPFS_GATEWAY + uri
  return uri
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

  return await $fetch(resolved)
}

export const useArtifact = (contract: Ref<Address>, tokenId: Ref<bigint>) => {
  const { $wagmi } = useNuxtApp()
  const chainId = useChainConfig('mainnet').id
  const client = getPublicClient($wagmi, { chainId }) as PublicClient

  const {
    data: metadata,
    pending,
    error,
  } = useAsyncData(`artifact-${contract.value}-${tokenId.value}`, () =>
    fetchTokenURI(client, contract.value, tokenId.value).then(fetchMetadata),
  )

  const { data: owner } = useAsyncData(
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
