import { parseAbi } from 'viem'

export const ObservationsAbi = parseAbi([
  'event Observation(address indexed collection, uint256 indexed tokenId, address indexed observer, string note, bool located, int32 x, int32 y, uint8 viewType, uint32 time)',
  'function artifacts(address, uint256) view returns (uint128 count, uint128 firstBlock)',
  'function observe(address collection, uint256 tokenId, string note, uint8 viewType, uint32 time)',
  'function observeAt(address collection, uint256 tokenId, string note, int32 x, int32 y, uint8 viewType, uint32 time)',
])
