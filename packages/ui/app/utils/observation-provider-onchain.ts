import { type Address, type PublicClient } from 'viem'
import {
  ObservationsAbi,
  type ObservationData,
  type RecentObservationData,
  type CollectionArtifactData,
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
        id: String(event.args.id!),
        parent: event.args.parent!,
        update: event.args.update!,
        observer: event.args.observer!,
        note: event.args.note!,
        located: event.args.located!,
        x: event.args.x!,
        y: event.args.y!,
        viewType: event.args.viewType!,
        time: event.args.time!,
        tip: event.args.tip!,
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
        id: String(event.args.id!),
        parent: event.args.parent!,
        update: event.args.update!,
        observer: event.args.observer!,
        note: event.args.note!,
        located: event.args.located!,
        x: event.args.x!,
        y: event.args.y!,
        viewType: event.args.viewType!,
        time: event.args.time!,
        tip: event.args.tip!,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        collection: event.args.collection!,
        tokenId: event.args.tokenId!,
      })) as RecentObservationData[]
    },

    async fetchCollectionArtifacts(collection) {
      if (!contractAddress) return []

      const currentBlock = await client.getBlockNumber()
      const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n
      const ranges = blockRanges(fromBlock, currentBlock)

      const results = await Promise.all(ranges.map(([from, to]) =>
        client.getContractEvents({
          address: contractAddress,
          abi: ObservationsAbi,
          eventName: 'Observation',
          args: { collection },
          fromBlock: from,
          toBlock: to,
        })
      ))

      const artifactMap = new Map<string, CollectionArtifactData>()
      for (const event of results.flat()) {
        const tokenId = event.args.tokenId!
        const key = tokenId.toString()
        const existing = artifactMap.get(key)
        if (existing) {
          existing.count += 1n
        } else {
          artifactMap.set(key, { tokenId, count: 1n })
        }
      }

      return [...artifactMap.values()].sort((a, b) =>
        Number(b.count - a.count),
      )
    },

    async fetchCollectionObservations(collection) {
      if (!contractAddress) return []

      const currentBlock = await client.getBlockNumber()
      const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n
      const ranges = blockRanges(fromBlock, currentBlock)

      const results = await Promise.all(ranges.map(([from, to]) =>
        client.getContractEvents({
          address: contractAddress,
          abi: ObservationsAbi,
          eventName: 'Observation',
          args: { collection },
          fromBlock: from,
          toBlock: to,
        })
      ))

      const events = results.flat()
      events.sort((a, b) => Number(b.blockNumber - a.blockNumber))

      return events.slice(0, 100).map((event) => ({
        id: String(event.args.id!),
        parent: event.args.parent!,
        update: event.args.update!,
        observer: event.args.observer!,
        note: event.args.note!,
        located: event.args.located!,
        x: event.args.x!,
        y: event.args.y!,
        viewType: event.args.viewType!,
        time: event.args.time!,
        tip: event.args.tip!,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        collection: event.args.collection!,
        tokenId: event.args.tokenId!,
      })) as RecentObservationData[]
    },
  }
}
