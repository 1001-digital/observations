import type { RecentObservationData } from '../utils/observations'
import { fetchObserverObservations } from '../utils/observation-provider-indexer'

const PAGE_SIZE = 50

export const useObserverObservations = (observer: Ref<string | undefined>) => {
  const config = useRuntimeConfig()
  const indexerUrls = computed(() => getIndexerUrls(config.public.observations))

  const observations = ref<RecentObservationData[]>([])
  const totalCount = ref(0)
  const endCursor = ref<string | null>(null)
  const hasMore = ref(false)
  const pending = ref(false)
  const loadingMore = ref(false)
  const error = ref<Error | null>(null)

  const totalTips = computed(() =>
    observations.value.reduce((sum, obs) => sum + obs.tip, 0n),
  )

  async function load() {
    const address = toValue(observer)
    if (!address || !indexerUrls.value.length) return

    pending.value = true
    error.value = null

    try {
      const result = await fetchObserverObservations(indexerUrls.value, address, PAGE_SIZE)
      observations.value = result.items
      totalCount.value = result.totalCount
      endCursor.value = result.endCursor
      hasMore.value = result.hasNextPage
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      pending.value = false
    }
  }

  async function loadMore() {
    const address = toValue(observer)
    if (!address || !endCursor.value || loadingMore.value) return

    loadingMore.value = true

    try {
      const result = await fetchObserverObservations(
        indexerUrls.value,
        address,
        PAGE_SIZE,
        endCursor.value,
      )
      observations.value = [...observations.value, ...result.items]
      endCursor.value = result.endCursor
      hasMore.value = result.hasNextPage
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      loadingMore.value = false
    }
  }

  watch(observer, () => {
    observations.value = []
    totalCount.value = 0
    endCursor.value = null
    hasMore.value = false
    load()
  }, { immediate: true })

  return {
    observations,
    totalCount,
    totalTips,
    pending,
    error,
    hasMore,
    loadingMore,
    loadMore,
  }
}
