export const ObservationsAbi = [
  {
    type: "event",
    name: "Observation",
    inputs: [
      { indexed: true, name: "collection", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "observer", type: "address" },
      { indexed: false, name: "id", type: "uint64" },
      { indexed: false, name: "parent", type: "uint64" },
      { indexed: false, name: "update", type: "bool" },
      { indexed: false, name: "note", type: "string" },
      { indexed: false, name: "x", type: "int32" },
      { indexed: false, name: "y", type: "int32" },
      { indexed: false, name: "viewType", type: "uint8" },
      { indexed: false, name: "time", type: "uint32" },
      { indexed: false, name: "tip", type: "uint256" },
      { indexed: false, name: "tipRecipient", type: "address" },
    ],
  },
  {
    type: "event",
    name: "TipsClaimed",
    inputs: [
      { indexed: true, name: "recipient", type: "address" },
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
      { name: "count", type: "uint64" },
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
      { name: "parent", type: "uint64" },
      { name: "update", type: "bool" },
      { name: "note", type: "string" },
      { name: "x", type: "int32" },
      { name: "y", type: "int32" },
      { name: "viewType", type: "uint8" },
      { name: "time", type: "uint32" },
      { name: "tipRecipient", type: "address" },
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
      { name: "tipRecipient", type: "address" },
    ],
    outputs: [],
  },
] as const;
