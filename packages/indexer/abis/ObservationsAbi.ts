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
    stateMutability: "nonpayable",
    inputs: [
      { name: "collection", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "note", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "observeAt",
    stateMutability: "nonpayable",
    inputs: [
      { name: "collection", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "note", type: "string" },
      { name: "x", type: "int32" },
      { name: "y", type: "int32" },
    ],
    outputs: [],
  },
] as const;
