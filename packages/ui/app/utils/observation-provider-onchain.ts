import { type Address, type PublicClient } from 'viem'
import {
  ObservationsAbi,
  type ObservationData,
  type RecentObservationData,
  type ObservationProvider,
} from './observations'

async function resolveBlockTimestamps(client: PublicClient, events: { blockNumber: bigint }[]) {
  const uniqueBlockNumbers = [...new Set(events.map((e) => e.blockNumber))]
  const blocks = await Promise.all(
    uniqueBlockNumbers.map((blockNumber) => client.getBlock({ blockNumber })),
  )
  return new Map(blocks.map((b) => [b.number, b.timestamp]))
}

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

      const blockTimestamps = await resolveBlockTimestamps(client, events)

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
        blockTimestamp: blockTimestamps.get(event.blockNumber) ?? 0n,
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

      const blockTimestamps = await resolveBlockTimestamps(client, events)

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
        blockTimestamp: blockTimestamps.get(event.blockNumber) ?? 0n,
        transactionHash: event.transactionHash,
        collection: event.args.collection!,
        tokenId: event.args.tokenId!,
      })) as RecentObservationData[]
    },
  }
}
