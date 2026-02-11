import type { Address } from 'viem'

export const useArtifactScope = () => {
  const { contract, token } = useRuntimeConfig().public

  return {
    contract: (contract as Address) || undefined,
    token: token ? BigInt(token) : undefined,
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
