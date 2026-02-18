import type { InjectionKey, Ref } from 'vue'
import type { Address } from 'viem'
import type { ObservationData } from '../utils/observations'

export interface TokenPageData {
  observations: Readonly<Ref<ObservationData[]>>
  count: Readonly<Ref<bigint>>
  pending: Readonly<Ref<boolean>>
  refreshAndPoll: () => void
  contract: Readonly<Ref<Address>>
  tokenId: Readonly<Ref<bigint>>
  recipient: Readonly<Ref<Address | undefined>>
  hasMultipleViewModes: Readonly<Ref<boolean>>
}

export interface ObservationNavigation {
  focusObservation: (id: string) => void
  clearFocus: () => void
}

export const tokenPageDataKey: InjectionKey<TokenPageData> = Symbol('tokenPageData')
export const observationNavigationKey: InjectionKey<ObservationNavigation> = Symbol('observationNavigation')

export const useTokenPageData = (): TokenPageData => {
  const data = inject(tokenPageDataKey)
  if (!data) throw new Error('useTokenPageData must be used within a token page')
  return data
}

export const useObservationNavigation = (): ObservationNavigation => {
  const nav = inject(observationNavigationKey)
  if (!nav) throw new Error('useObservationNavigation must be used within a token page')
  return nav
}
