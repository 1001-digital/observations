import { reactive, watchEffect, onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue'

export interface BreadcrumbItem {
  label: string
  path: string
}

export type BreadcrumbKey = 'collection' | 'token' | 'observation'

const state = reactive(new Map<BreadcrumbKey, BreadcrumbItem>())

export function useBreadcrumbs() {
  return state
}

export function useBreadcrumb(
  key: BreadcrumbKey,
  crumb: MaybeRefOrGetter<BreadcrumbItem | null>,
) {
  let lastSet: BreadcrumbItem | null = null

  watchEffect(() => {
    const value = toValue(crumb)
    if (value?.label) {
      lastSet = value
      state.set(key, value)
    } else {
      lastSet = null
      state.delete(key)
    }
  })

  onScopeDispose(() => {
    // Only clean up if no new owner has taken over this key
    if (state.get(key) === lastSet) {
      state.delete(key)
    }
  })
}
