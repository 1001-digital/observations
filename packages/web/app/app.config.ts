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
  ipfsGateway: 'https://ipfs.vv.xyz/ipfs/',
  observations: {
    mode: 'indexer' as 'indexer' | 'onchain',
  },
})
