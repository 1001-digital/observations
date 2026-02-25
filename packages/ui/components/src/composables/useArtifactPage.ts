import { computed, type Ref } from 'vue'
import type { Address } from 'viem'
import { useArtifact } from './useArtifact'
import { useArtifactView } from './useArtifactView'
import { useCollection } from './useCollection'
import { useObservations } from './useObservations'
import { useObservationMarkers } from './useObservationMarkers'

export interface ArtifactPageNavigation {
  onFocusObservation: (id: string) => void
  onClearFocus: () => void
  onBeforePlaceMarker?: () => void | Promise<void>
}

export const useArtifactPage = (
  contract: Ref<Address>,
  tokenId: Ref<bigint>,
  focusedId: Ref<string | null>,
  navigation: ArtifactPageNavigation,
) => {
  const { metadata, owner, image, animationUrl, pending, error } = useArtifact(
    contract,
    tokenId,
  )
  const { collection } = useCollection(contract)
  const tipRecipient = computed(() => collection.value?.owner)
  const { showAnimation } = useArtifactView(animationUrl, pending)

  const {
    observations,
    count: observationCount,
    pending: observationsPending,
    refreshAndPoll,
  } = useObservations(contract, tokenId)

  const { pendingMarker, placeMarker, discardMarker } = useObservationMarkers()

  const focusedObservation = computed(() =>
    focusedId.value
      ? observations.value.find((o) => o.id === focusedId.value)
      : null,
  )

  const hasMultipleViewModes = computed(
    () => !!image.value && !!animationUrl.value,
  )

  const effectiveShowAnimation = computed({
    get() {
      if (focusedId.value && hasMultipleViewModes.value) {
        const obs = observations.value.find((o) => o.id === focusedId.value)
        if (obs) return obs.viewType === 1
      }
      return showAnimation.value
    },
    set(value: boolean) {
      showAnimation.value = value
    },
  })

  const viewType = computed(() => (effectiveShowAnimation.value ? 1 : 0))

  const focusObservation = (id: string) => {
    pendingMarker.value = null
    navigation.onFocusObservation(id)
  }

  const clearFocus = () => {
    navigation.onClearFocus()
  }

  const onPlaceMarker = async (x: number, y: number) => {
    await navigation.onBeforePlaceMarker?.()
    placeMarker(x, y)
  }

  const onMarkerComplete = () => {
    discardMarker()
    refreshAndPoll()
  }

  return {
    metadata,
    owner,
    image,
    animationUrl,
    pending,
    error,
    collection,
    tipRecipient,
    observations,
    observationCount,
    observationsPending,
    refreshAndPoll,
    pendingMarker,
    discardMarker,
    focusedObservation,
    hasMultipleViewModes,
    effectiveShowAnimation,
    viewType,
    focusObservation,
    clearFocus,
    onPlaceMarker,
    onMarkerComplete,
  }
}
