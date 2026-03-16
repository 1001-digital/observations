import { reactive, watchEffect, onScopeDispose, toValue, type MaybeRefOrGetter } from 'vue'

export interface BreadcrumbItem {
  label: string
  path: string
}

export type BreadcrumbKey = 'collection' | 'token' | 'observation'

const crumbs = reactive(new Map<BreadcrumbKey, BreadcrumbItem>())
const owned = new Map<BreadcrumbKey, symbol>()

export const useBreadcrumbs = () => crumbs

export function useBreadcrumb(
  key: BreadcrumbKey,
  crumb: MaybeRefOrGetter<BreadcrumbItem | null>,
  debounce = 150,
) {
  const id = Symbol()
  let timer: ReturnType<typeof setTimeout> | null = null

  const release = () => {
    if (timer) { clearTimeout(timer); timer = null }
    if (owned.get(key) === id) {
      owned.delete(key)
      crumbs.delete(key)
    }
  }

  watchEffect(() => {
    const value = toValue(crumb)
    if (value?.label) {
      owned.set(key, id)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        crumbs.set(key, value)
      }, debounce)
    } else {
      release()
    }
  })

  onScopeDispose(release)
}
