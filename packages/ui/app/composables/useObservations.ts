import { type Address, type PublicClient } from 'viem'
import { getPublicClient } from '@wagmi/core'
import { ObservationsAbi } from '../utils/observations'

export interface ObservationData {
  id: string
  observer: Address
  note: string
  located: boolean
  x: number
  y: number
  viewType: number
  time: number
  blockNumber: bigint
  blockTimestamp: bigint
  transactionHash: string
}

export const useObservations = (collection: Ref<Address>, tokenId: Ref<bigint>) => {
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
    `observations-${collection.value}-${tokenId.value}`,
    async () => {
      if (!contractAddress) return { count: 0n, items: [] as ObservationData[] }

      const [count, firstBlock] = await client.readContract({
        address: contractAddress,
        abi: ObservationsAbi,
        functionName: 'artifacts',
        args: [collection.value, tokenId.value],
      })

      if (count === 0n) return { count: 0n, items: [] as ObservationData[] }

      const events = await client.getContractEvents({
        address: contractAddress,
        abi: ObservationsAbi,
        eventName: 'Observation',
        args: {
          collection: collection.value,
          tokenId: tokenId.value,
        },
        fromBlock: BigInt(firstBlock),
      })

      const uniqueBlockNumbers = [...new Set(events.map((e) => e.blockNumber))]
      const blocks = await Promise.all(
        uniqueBlockNumbers.map((blockNumber) => client.getBlock({ blockNumber })),
      )
      const blockTimestamps = new Map(blocks.map((b) => [b.number, b.timestamp]))

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
  )

  const count = computed(() => observations.value?.count ?? 0n)
  const items = computed(() => observations.value?.items ?? [])

  return {
    observations: items,
    count,
    pending,
    error,
    refresh,
  }
}
