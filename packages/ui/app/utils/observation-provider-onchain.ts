import { type Address, type PublicClient } from 'viem'
import {
  ObservationsAbi,
  type ObservationData,
  type RecentObservationData,
  type ObservationProvider,
} from './observations'

const MAX_BLOCK_RANGE = 5000n

function blockRanges (from: bigint, to: bigint): [bigint, bigint][] {
  const ranges: [bigint, bigint][] = []
  for (let start = from; start <= to; start += MAX_BLOCK_RANGE + 1n) {
    ranges.push([start, start + MAX_BLOCK_RANGE > to ? to : start + MAX_BLOCK_RANGE])
  }
  return ranges
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

      const currentBlock = await client.getBlockNumber()
      const ranges = blockRanges(BigInt(firstBlock), currentBlock)

      const results = await Promise.all(ranges.map(([fromBlock, toBlock]) =>
        client.getContractEvents({
          address: contractAddress,
          abi: ObservationsAbi,
          eventName: 'Observation',
          args: { collection, tokenId },
          fromBlock,
          toBlock,
        })
      ))

      const items: ObservationData[] = results.flat().map((event) => ({
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
      const ranges = blockRanges(fromBlock, currentBlock)

      const results = await Promise.all(ranges.map(([from, to]) =>
        client.getContractEvents({
          address: contractAddress,
          abi: ObservationsAbi,
          eventName: 'Observation',
          fromBlock: from,
          toBlock: to,
        })
      ))

      return results.flat().map((event) => ({
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
