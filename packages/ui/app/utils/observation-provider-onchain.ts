import { type Address, type PublicClient } from 'viem'
import {
  ObservationsAbi,
  type ObservationData,
  type RecentObservationData,
  type ObservationProvider,
} from './observations'

export function createOnchainProvider(client: PublicClient, contractAddress: Address): ObservationProvider {
  return {
    async fetchObservations(collection, tokenId) {
      if (!contractAddress) return { count: 0n, items: [] }

      const [count, firstBlock] = await client.readContract({
        address: contractAddress,
        abi: ObservationsAbi,
        functionName: 'artifacts',
        args: [collection, tokenId],
      })

      if (count === 0n) return { count: 0n, items: [] }

      const events = await client.getContractEvents({
        address: contractAddress,
        abi: ObservationsAbi,
        eventName: 'Observation',
        args: { collection, tokenId },
        fromBlock: BigInt(firstBlock),
      })

      const items: ObservationData[] = events.map((event) => ({
        id: `${event.blockNumber}-${event.logIndex}`,
        observer: event.args.observer!,
        note: event.args.note!,
        located: event.args.located!,
        x: event.args.x!,
        y: event.args.y!,
        viewType: event.args.viewType!,
        time: event.args.time!,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
      }))

      return { count, items }
    },

    async fetchRecentObservations() {
      if (!contractAddress) return []

      const currentBlock = await client.getBlockNumber()
      const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n

      const events = await client.getContractEvents({
        address: contractAddress,
        abi: ObservationsAbi,
        eventName: 'Observation',
        fromBlock,
      })

      return events.map((event) => ({
        id: `${event.blockNumber}-${event.logIndex}`,
        observer: event.args.observer!,
        note: event.args.note!,
        located: event.args.located!,
        x: event.args.x!,
        y: event.args.y!,
        viewType: event.args.viewType!,
        time: event.args.time!,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        collection: event.args.collection!,
        tokenId: event.args.tokenId!,
      })) as RecentObservationData[]
    },
  }
}
