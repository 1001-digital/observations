import type { Address } from 'viem'

const env = import.meta.env

export const defaultContract = (env.VITE_DEFAULT_CONTRACT || '0x036721e5a769cc48b3189efbb9cce4471e8a48b1') as Address
export const defaultToken = env.VITE_DEFAULT_TOKEN || '1'
export const defaultObserver = env.VITE_DEFAULT_OBSERVER || 'jalil.eth'
