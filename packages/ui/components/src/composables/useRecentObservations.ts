import { computed } from 'vue'
import { useConfig } from '@wagmi/vue'
import { useMainChainId } from '@1001-digital/components.evm'
import { useQuery } from '@1001-digital/dapp-query-vue'
import { createRecentObservationsQuery } from '../queries/observations'
import { useObservationsConfig } from '../utils/config'

export const useRecentObservations = () => {
  const wagmi = useConfig()
  const config = useObservationsConfig()
  const chainId = useMainChainId()

  const query = createRecentObservationsQuery(config, wagmi, chainId)
  const { data, pending, error, refresh } = useQuery(query, () => [] as const)

  return {
    observations: computed(() => data.value ?? []),
    pending,
    error,
    refresh,
  }
}
