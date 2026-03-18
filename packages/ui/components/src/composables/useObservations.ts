import { computed, type Ref } from 'vue'
import { type Address } from 'viem'
import { useConfig } from '@wagmi/vue'
import { useMainChainId } from '@1001-digital/components.evm'
import { useQuery, useQueryClient } from '@1001-digital/dapp-query-vue'
import { createObservationsQuery } from '../queries/observations'
import { useObservationsConfig } from '../utils/config'
import type { ObservationData } from '../utils/observations'

export const useObservations = (collection: Ref<Address>, tokenId: Ref<bigint>) => {
  const wagmi = useConfig()
  const config = useObservationsConfig()
  const chainId = useMainChainId()

  const query = createObservationsQuery(config, wagmi, chainId)
  const queryClient = useQueryClient()
  type Data = { count: bigint; items: ObservationData[] }
  const { data, pending, error, refresh } = useQuery<Data, [Address, bigint]>(query, () => [collection.value, tokenId.value])

  const count = computed(() => data.value?.count ?? 0n)
  const items = computed(() => data.value?.items ?? [])

  async function refreshAndPoll() {
    const prev = count.value
    await queryClient.waitForChange(
      query,
      [collection.value, tokenId.value],
      (d: Data) => d.count > prev,
    )
  }

  return {
    observations: items,
    count,
    pending,
    error,
    refresh,
    refreshAndPoll,
  }
}
