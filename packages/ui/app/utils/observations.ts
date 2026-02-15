import { parseAbi, type Address } from 'viem'

export const ObservationsAbi = parseAbi([
  'event Observation(address indexed collection, uint256 indexed tokenId, address indexed observer, string note, bool located, int32 x, int32 y, uint8 viewType, uint32 time, uint256 tip)',
  'event TipsClaimed(address indexed collection, address indexed claimant, uint256 amount)',
  'function artifacts(address, uint256) view returns (uint128 count, uint128 firstBlock)',
  'function observe(address collection, uint256 tokenId, string note, uint8 viewType, uint32 time) payable',
  'function observeAt(address collection, uint256 tokenId, string note, int32 x, int32 y, uint8 viewType, uint32 time) payable',
  'function tips(address) view returns (uint128 balance, uint128 unclaimedSince)',
  'function claimTips(address collection)',
  'function unclaimedTipsRecipient() view returns (address)',
])

export interface ObservationData {
  id: string
  observer: Address
  note: string
  located: boolean
  x: number
  y: number
  viewType: number
  time: number
  tip: bigint
  blockNumber: bigint
  transactionHash: string
}

export interface RecentObservationData extends ObservationData {
  collection: Address
  tokenId: bigint
}

export type ObservationsMode = 'indexer' | 'onchain'

export interface ObservationProvider {
  fetchObservations(collection: Address, tokenId: bigint): Promise<{ count: bigint; items: ObservationData[] }>
  fetchRecentObservations(): Promise<RecentObservationData[]>
}

export const observationsCache = createCache<{ count: bigint; items: ObservationData[] }>(5 * 60 * 1000, 200)
export const recentObservationsCache = createCache<RecentObservationData[]>(5 * 60 * 1000, 1)

interface ObservationsRuntimeConfig {
  indexer?: { endpoint1?: string; endpoint2?: string; endpoint3?: string }
}

export function getIndexerUrls(config: ObservationsRuntimeConfig): string[] {
  if (!config.indexer) return []
  return [config.indexer.endpoint1, config.indexer.endpoint2, config.indexer.endpoint3].filter(Boolean) as string[]
}
