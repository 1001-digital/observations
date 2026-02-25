export const evmChains = {
  mainnet: {
    id: 1,
    blockExplorer: 'https://etherscan.io',
  },
  sepolia: {
    id: 11155111,
    blockExplorer: 'https://sepolia.etherscan.io',
  },
} as const

export type EvmChainKey = keyof typeof evmChains

export function createEvmConfig(chain: EvmChainKey = 'sepolia') {
  const defaultChain: EvmChainKey = chain in evmChains ? chain : 'sepolia'

  return { defaultChain, evmChains }
}
