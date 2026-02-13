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
    chains: {
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
