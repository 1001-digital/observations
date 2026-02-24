import { ref, computed, watch, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { useConfig } from '@wagmi/vue'
import { getPublicClient } from '@wagmi/core'
import type { Config } from '@wagmi/core'
import {
  ensCache,
  fetchEnsFromIndexer,
  fetchEnsFromChain,
  type EnsProfile,
} from '@1001-digital/components'
import { useEvmConfig } from '@1001-digital/components'

const ENS_KEYS_PROFILE = ['avatar', 'header', 'description', 'url', 'com.twitter', 'com.github']

async function resolve(
  identifier: string,
  strategies: ('indexer' | 'chain')[],
  indexerUrls: string[],
  wagmi: Config,
  chainKeys: string[],
): Promise<EnsProfile> {
  for (const strategy of strategies) {
    try {
      if (strategy === 'indexer') {
        if (!indexerUrls.length) continue
        return await fetchEnsFromIndexer(identifier, indexerUrls)
      }
      if (strategy === 'chain') {
        const client = getPublicClient(wagmi, { chainId: 1 })
        if (!client) continue
        return await fetchEnsFromChain(identifier, client, chainKeys)
      }
    } catch {
      continue
    }
  }
  return { address: identifier, ens: null, data: null }
}

/**
 * Standalone Vue replacement for `useEnsProfile` from @1001-digital/components.
 * The upstream version depends on Nuxt APIs; this uses @wagmi/vue + EvmConfig injection.
 */
export const useEnsProfile = (
  identifier: MaybeRefOrGetter<string | undefined>,
): { data: Ref<EnsProfile | null>; pending: Ref<boolean> } => {
  const wagmi = useConfig()
  const evmConfig = useEvmConfig()

  const mode = evmConfig.ens?.mode || 'indexer'
  const indexerUrls = evmConfig.ens?.indexerUrls || []

  const data = ref<EnsProfile | null>(null)
  const pending = ref(false)

  const fetchProfile = async () => {
    const id = toValue(identifier)
    if (!id) {
      data.value = null
      return
    }

    const cacheKey = `ens-profile-${id}`
    const cached = ensCache.get(cacheKey)
    if (cached) {
      data.value = cached as EnsProfile
      return
    }

    pending.value = true
    try {
      const strategies: ('indexer' | 'chain')[] =
        mode === 'indexer' ? ['indexer', 'chain'] : ['chain', 'indexer']

      data.value = await ensCache.fetch(cacheKey, () =>
        resolve(id, strategies, indexerUrls, wagmi, ENS_KEYS_PROFILE),
      )
    } catch {
      data.value = { address: id, ens: null, data: null }
    } finally {
      pending.value = false
    }
  }

  watch(() => toValue(identifier), fetchProfile, { immediate: true })

  return { data, pending }
}
