export default defineAppConfig({
  exampleArtifacts: [
    '0x7c4111e3bb57b636906a7246db1e70876fd97d97/2',
    '0x7c4111e3bb57b636906a7246db1e70876fd97d97/3',
    '0x7c4111e3bb57b636906a7246db1e70876fd97d97/4',
    '0x66736f0484b079b662264ccb9099ed2b1edf7fdd/7',
    '0x66736f0484b079b662264ccb9099ed2b1edf7fdd/2',
    '0x66736f0484b079b662264ccb9099ed2b1edf7fdd/4',
    '0x036721e5a769cc48b3189efbb9cce4471e8a48b1/1',
    '0x036721e5a769cc48b3189efbb9cce4471e8a48b1/15455',
    '0x036721e5a769cc48b3189efbb9cce4471e8a48b1/1001',
  ],
  artifact: {
    defaultView: 'animation' as 'animation' | 'image',
    details: {
      showCollection: true,
      showSymbol: true,
      showArtist: true,
      showOwner: true,
    },
  },
  observations: {
    mode: 'indexer' as 'indexer' | 'onchain',
  },
  evm: {
    defaultChain: 'sepolia',
    ipfsGateway: 'https://ipfs.vv.xyz/ipfs/',
    arweaveGateway: 'https://arweave.net/',
    chains: {
      mainnet: {
        id: 1,
        blockExplorer: 'https://etherscan.io',
      },
      sepolia: {
        id: 11155111,
        blockExplorer: 'https://sepolia.etherscan.io',
      },
    },
    ens: {
      mode: 'indexer',
    },
    inAppWallet: {
      enabled: true,
    },
  },
})
