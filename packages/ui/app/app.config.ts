export default defineAppConfig({
  exampleArtifacts: [] as string[],
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
    mode: 'onchain' as 'indexer' | 'onchain',
  },
  evm: {
    defaultChain: 'sepolia',
    ipfsGateway: 'https://ipfs.io/ipfs/',
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
  },
})
