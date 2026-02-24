const env = import.meta.env

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

type EvmChainKey = keyof typeof evmChains

const DEFAULT_CHAIN: EvmChainKey = 'sepolia'

const isEvmChainKey = (key?: string): key is EvmChainKey =>
  !!key && key in evmChains

export const defaultChain: EvmChainKey = isEvmChainKey(env.VITE_DEFAULT_CHAIN)
  ? env.VITE_DEFAULT_CHAIN
  : DEFAULT_CHAIN
