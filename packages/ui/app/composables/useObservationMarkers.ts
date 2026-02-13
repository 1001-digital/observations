export const useObservationMarkers = () => {
  const pendingMarker = useState<{ x: number; y: number } | null>('observation-pending-marker', () => null)
  const focusedIndex = useState<number | null>('observation-focused-index', () => null)

  const placeMarker = (x: number, y: number) => {
    focusedIndex.value = null
    pendingMarker.value = { x, y }
  }

  const discardMarker = () => {
    pendingMarker.value = null
  }

  const focusObservation = (index: number) => {
    pendingMarker.value = null
    focusedIndex.value = index
  }

  return {
    pendingMarker,
    focusedIndex,
    placeMarker,
    discardMarker,
    focusObservation,
  }
}
