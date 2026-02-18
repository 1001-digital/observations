export const useObservationMarkers = () => {
  const pendingMarker = useState<{ x: number; y: number } | null>('observation-pending-marker', () => null)

  const placeMarker = (x: number, y: number) => {
    pendingMarker.value = { x, y }
  }

  const discardMarker = () => {
    pendingMarker.value = null
  }

  return {
    pendingMarker,
    placeMarker,
    discardMarker,
  }
}
