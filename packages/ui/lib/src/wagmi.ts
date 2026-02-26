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
import type { EvmChainKey } from './evmConfig'

export interface WagmiOptions {
  defaultChain: EvmChainKey
  rpc?: { mainnet?: string[]; sepolia?: string[] }
  walletConnectProjectId?: string
  title?: string
}

function buildTransport(urls?: string[]): Transport {
  const transports = (urls ?? []).filter(Boolean).map((url) => http(url))
  transports.push(http())
  return fallback(transports)
}

const configCache = new Map<string, ReturnType<typeof createConfig>>()

function wagmiCacheKey(options: WagmiOptions): string {
  return JSON.stringify([
    options.defaultChain,
    options.rpc?.mainnet ?? [],
    options.rpc?.sepolia ?? [],
    options.walletConnectProjectId ?? '',
  ])
}

export function createWagmiConfig(options: WagmiOptions) {
  const key = wagmiCacheKey(options)
  const cached = configCache.get(key)
  if (cached) return cached
  const title = options.title ?? 'OBSERVATIONS'

  const connectors: CreateConnectorFn[] = [
    injected(),
    safe(),
    metaMask({
      headless: true,
      dappMetadata: { name: title, iconUrl: '', url: '' },
    }),
    inAppWallet(),
  ]

  if (options.walletConnectProjectId) {
    connectors.push(
      walletConnect({
        projectId: options.walletConnectProjectId,
        showQrModal: false,
      }),
    )
  }

  const config = createConfig({
    chains: options.defaultChain === 'mainnet' ? [mainnet, sepolia] : [sepolia, mainnet],
    batch: { multicall: true },
    connectors,
    transports: {
      [sepolia.id]: buildTransport(options.rpc?.sepolia),
      [mainnet.id]: buildTransport(options.rpc?.mainnet),
    },
  })

  configCache.set(key, config)
  return config
}
