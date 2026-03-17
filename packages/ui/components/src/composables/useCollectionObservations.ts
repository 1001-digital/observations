import { computed, type Ref } from 'vue'
import { type Address } from 'viem'
import { useConfig } from '@wagmi/vue'
import { useMainChainId } from '@1001-digital/components.evm'
import { useQuery } from '@1001-digital/dapp-query-vue'
import { createCollectionArtifactsQuery, createCollectionObservationsQuery } from '../queries/observations'
import { useObservationsConfig } from '../utils/config'

export const useCollectionObservations = (collection: Ref<Address>) => {
  const wagmi = useConfig()
  const config = useObservationsConfig()
  const chainId = useMainChainId()

  const artifactsQuery = createCollectionArtifactsQuery(config, wagmi, chainId)
  const observationsQuery = createCollectionObservationsQuery(config, wagmi, chainId)

  const { data: artifactsData, pending: p1, error: e1 } = useQuery(artifactsQuery, () => [collection.value])
  const { data: observationsData, pending: p2, error: e2 } = useQuery(observationsQuery, () => [collection.value])

  return {
    artifacts: computed(() => artifactsData.value ?? []),
    observations: computed(() => observationsData.value ?? []),
    pending: computed(() => p1.value || p2.value),
    error: computed(() => e1.value || e2.value),
  }
}
