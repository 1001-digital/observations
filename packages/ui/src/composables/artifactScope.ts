import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Address } from 'viem'
import { useObservationsConfig } from '../utils/config'

export const useArtifactScope = () => {
  const config = useObservationsConfig()

  return {
    contract: config.contract || undefined,
    token: config.token ? BigInt(config.token) : undefined,
  }
}

export const useArtifactContract = () => {
  const route = useRoute()
  const { contract } = useArtifactScope()

  return computed(() => contract || (route.params.contract as Address))
}

export const useArtifactTokenId = () => {
  const route = useRoute()
  const { token } = useArtifactScope()

  return computed(() => token ?? BigInt(route.params.token as string))
}
