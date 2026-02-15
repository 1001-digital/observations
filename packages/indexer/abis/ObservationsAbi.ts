export const ObservationsAbi = [
  {
    type: "event",
    name: "Observation",
    inputs: [
      { indexed: true, name: "collection", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "observer", type: "address" },
      { indexed: false, name: "note", type: "string" },
      { indexed: false, name: "located", type: "bool" },
      { indexed: false, name: "x", type: "int32" },
      { indexed: false, name: "y", type: "int32" },
      { indexed: false, name: "viewType", type: "uint8" },
      { indexed: false, name: "time", type: "uint32" },
      { indexed: false, name: "tip", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "TipsClaimed",
    inputs: [
      { indexed: true, name: "collection", type: "address" },
      { indexed: true, name: "claimant", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "artifacts",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "uint256" },
    ],
    outputs: [
      { name: "count", type: "uint128" },
      { name: "firstBlock", type: "uint128" },
    ],
  },
  {
    type: "function",
    name: "observe",
    stateMutability: "payable",
    inputs: [
      { name: "collection", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "note", type: "string" },
      { name: "viewType", type: "uint8" },
      { name: "time", type: "uint32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "observeAt",
    stateMutability: "payable",
    inputs: [
      { name: "collection", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "note", type: "string" },
      { name: "x", type: "int32" },
      { name: "y", type: "int32" },
      { name: "viewType", type: "uint8" },
      { name: "time", type: "uint32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "tips",
    stateMutability: "view",
    inputs: [
      { name: "", type: "address" },
    ],
    outputs: [
      { name: "balance", type: "uint128" },
      { name: "unclaimedSince", type: "uint128" },
    ],
  },
  {
    type: "function",
    name: "claimTips",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collection", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "protocolOwner",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "", type: "address" },
    ],
  },
] as const;
