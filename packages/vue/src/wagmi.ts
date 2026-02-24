import { http, createConfig } from '@wagmi/core'
import { sepolia, mainnet } from 'viem/chains'
import { injected } from '@wagmi/connectors'

const rpcUrls = [
  import.meta.env.VITE_RPC_SEPOLIA_1,
  import.meta.env.VITE_RPC_SEPOLIA_2,
  import.meta.env.VITE_RPC_SEPOLIA_3,
].filter(Boolean) as string[]

export const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: rpcUrls.length ? http(rpcUrls[0]) : http(),
    [mainnet.id]: http(),
  },
})
