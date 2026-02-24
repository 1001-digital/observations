import {
  http,
  createConfig,
  fallback,
  type CreateConnectorFn,
} from '@wagmi/core'
import { sepolia, mainnet } from 'viem/chains'
import type { Transport } from 'viem'
import { injected, metaMask, safe, walletConnect } from '@wagmi/connectors'
import { inAppWallet } from '@1001-digital/components'
import { defaultChain } from './evmConfig'

const env = import.meta.env

const title = env.VITE_TITLE || 'OBSERVATIONS'

// Build transports with fallbacks
function buildTransport(...envKeys: (string | undefined)[]): Transport {
  const transports = envKeys.filter(Boolean).map((url) => http(url))
  transports.push(http())
  return fallback(transports)
}

const sepoliaTransport = buildTransport(
  env.VITE_RPC_SEPOLIA_1,
  env.VITE_RPC_SEPOLIA_2,
  env.VITE_RPC_SEPOLIA_3,
)

const mainnetTransport = buildTransport(
  env.VITE_RPC_MAINNET_1,
  env.VITE_RPC_MAINNET_2,
  env.VITE_RPC_MAINNET_3,
)

// Connectors
const connectors: CreateConnectorFn[] = [
  injected(),
  safe(),
  metaMask({
    headless: true,
    dappMetadata: {
      name: title,
      iconUrl: '',
      url: '',
    },
  }),
  inAppWallet(),
]

if (env.VITE_WALLET_CONNECT_PROJECT_ID)
  connectors.push(
    walletConnect({
      projectId: env.VITE_WALLET_CONNECT_PROJECT_ID,
      showQrModal: false,
    }),
  )

export const wagmiConfig = createConfig({
  chains: defaultChain === 'mainnet' ? [mainnet, sepolia] : [sepolia, mainnet],
  batch: {
    multicall: true,
  },
  connectors,
  transports: {
    [sepolia.id]: sepoliaTransport,
    [mainnet.id]: mainnetTransport,
  },
})
