import { ref } from 'vue'

// Module-level ref preserves singleton state across calls
const pendingMarker = ref<{ x: number; y: number } | null>(null)

export const useObservationMarkers = () => {
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
