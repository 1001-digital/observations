import { type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import type { ObservationData } from './useObservations'
import { ObservationsAbi } from '../utils/observations'

export interface RecentObservationData extends ObservationData {
  collection: Address
  tokenId: bigint
}

export const useRecentObservations = () => {
  const { $wagmi } = useNuxtApp()
  const chainId = useMainChainId()
  const client = getPublicClient($wagmi, { chainId }) as PublicClient
  const config = useRuntimeConfig()
  const contractAddress = config.public.observationsContract as Address

  const {
    data: observations,
    pending,
    error,
    refresh,
  } = useAsyncData(
    'recent-observations',
    async () => {
      if (!contractAddress) return []

      const currentBlock = await client.getBlockNumber()
      const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n

      const events = await client.getContractEvents({
        address: contractAddress,
        abi: ObservationsAbi,
        eventName: 'Observation',
        fromBlock,
      })

      const uniqueBlockNumbers = [...new Set(events.map((e) => e.blockNumber))]
      const blocks = await Promise.all(
        uniqueBlockNumbers.map((blockNumber) => client.getBlock({ blockNumber })),
      )
      const blockTimestamps = new Map(blocks.map((b) => [b.number, b.timestamp]))

      const items: RecentObservationData[] = events.map((event) => ({
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
      }))

      return items
    },
  )

  const items = computed(() => observations.value ?? [])

  return {
    observations: items,
    pending,
    error,
    refresh,
  }
}
