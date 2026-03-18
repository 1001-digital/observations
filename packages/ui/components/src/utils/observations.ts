import { parseAbi, type Address } from 'viem'

export const ObservationsAbi = parseAbi([
  'event Observation(address indexed collection, uint256 indexed tokenId, address indexed observer, uint64 id, uint64 parent, bool update, string note, int32 x, int32 y, uint8 viewType, uint32 time, uint256 tip, address tipRecipient)',
  'event TipsClaimed(address indexed recipient, address indexed claimant, uint256 amount)',
  'function artifacts(address, uint256) view returns (uint64 count, uint128 firstBlock)',
  'function observe(address collection, uint256 tokenId, uint64 parent, bool update, string note, int32 x, int32 y, uint8 viewType, uint32 time, address tipRecipient) payable',
  'function tips(address) view returns (uint128 balance, uint128 unclaimedSince)',
  'function claimTips(address tipRecipient)',
])

export interface ObservationData {
  id: string
  parent: bigint
  update: boolean
  observer: Address
  note: string
  x: number
  y: number
  viewType: number
  time: number
  tip: bigint
  tipRecipient: Address
  blockNumber: bigint
  updatedBlock?: bigint
  transactionHash: string
}

export interface RecentObservationData extends ObservationData {
  collection: Address
  tokenId: bigint
}

export interface CollectionArtifactData {
  tokenId: bigint
  count: bigint
}

export type ObservationsMode = 'indexer' | 'onchain'

export interface ObservationProvider {
  fetchObservations(collection: Address, tokenId: bigint): Promise<{ count: bigint; items: ObservationData[] }>
  fetchRecentObservations(): Promise<RecentObservationData[]>
  fetchCollectionArtifacts(collection: Address): Promise<CollectionArtifactData[]>
  fetchCollectionObservations(collection: Address): Promise<RecentObservationData[]>
}

interface ObservationsRuntimeConfig {
  indexers?: string
}

export function getIndexerUrls(config: ObservationsRuntimeConfig): string[] {
  return (config.indexers || '').split(/\s+/).filter(Boolean)
}
