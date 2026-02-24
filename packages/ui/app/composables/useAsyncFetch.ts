import { ref, watch, isRef, type Ref, type WatchSource } from 'vue'

interface UseAsyncFetchOptions<T> {
  watch?: WatchSource[]
  getCachedData?: () => T | undefined
}

export function useAsyncFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseAsyncFetchOptions<T>,
) {
  const data = ref<T | null>(null) as Ref<T | null>
  const pending = ref(true)
  const error = ref<Error | null>(null)

  // Initialize from cache if available
  const cached = options?.getCachedData?.()
  if (cached !== undefined) {
    data.value = cached
    pending.value = false
  }

  async function refresh() {
    pending.value = data.value == null
    error.value = null

    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      pending.value = false
    }
  }

  // Initial fetch
  refresh()

  // Watch sources for re-fetching
  if (options?.watch?.length) {
    watch(options.watch, refresh)
  }

  return { data, pending, error, refresh }
}
