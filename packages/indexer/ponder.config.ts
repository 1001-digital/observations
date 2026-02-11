import { createConfig } from "ponder";

import { ObservationsAbi } from "./abis/ObservationsAbi";

export default createConfig({
  chains: {
    sepolia: {
      id: 11155111,
      rpc: process.env.PONDER_RPC_URL_11155111!,
    },
  },
  contracts: {
    Observations: {
      chain: "sepolia",
      abi: ObservationsAbi,
      address: process.env.OBSERVATIONS_ADDRESS! as `0x${string}`,
      startBlock: Number(process.env.OBSERVATIONS_START_BLOCK ?? 0),
    },
  },
});
