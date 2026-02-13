export const useObservationMarkers = () => {
  const pendingMarker = useState<{ x: number; y: number } | null>('observation-pending-marker', () => null)
  const focusedId = useState<string | null>('observation-focused-id', () => null)

  const placeMarker = (x: number, y: number) => {
    focusedId.value = null
    pendingMarker.value = { x, y }
  }

  const discardMarker = () => {
    pendingMarker.value = null
  }

  const focusObservation = (id: string) => {
    pendingMarker.value = null
    focusedId.value = id
  }

  const clearFocus = () => {
    focusedId.value = null
  }

  return {
    pendingMarker,
    focusedId,
    placeMarker,
    discardMarker,
    focusObservation,
    clearFocus,
  }
}
