import { inject, type InjectionKey } from 'vue'
import type { Address } from 'viem'

export interface ObservationsConfig {
  observationsContract: Address
  contract?: Address
  token?: string
  indexerEndpoints: string[]
  mode: 'indexer' | 'onchain'
  exampleArtifacts: string[]
  ipfsGateway: string
  arweaveGateway: string
  artifact: {
    defaultView: 'animation' | 'image'
    details: {
      showCollection: boolean
      showSymbol: boolean
      showArtist: boolean
      showOwner: boolean
    }
  }
}

const defaultConfig: ObservationsConfig = {
  observationsContract: '0x' as Address,
  indexerEndpoints: [],
  mode: 'onchain',
  exampleArtifacts: [],
  ipfsGateway: 'https://ipfs.io/ipfs/',
  arweaveGateway: 'https://arweave.net/',
  artifact: {
    defaultView: 'animation',
    details: {
      showCollection: true,
      showSymbol: true,
      showArtist: true,
      showOwner: true,
    },
  },
}

export const ObservationsConfigKey: InjectionKey<ObservationsConfig> = Symbol('ObservationsConfig')

export const useObservationsConfig = (): ObservationsConfig =>
  inject(ObservationsConfigKey, defaultConfig)
