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
  watchEffect(() => {
    const value = toValue(crumb)
    if (value?.label) {
      state.set(key, value)
    } else {
      state.delete(key)
    }
  })

  onScopeDispose(() => {
    state.delete(key)
  })
}
