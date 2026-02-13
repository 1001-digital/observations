<template>
  <div
    ref="container"
    class="observation-markers-container"
  >
    <slot />

    <div
      v-if="overlayStyle"
      class="marker-overlay"
      :class="{ 'can-place': isConnected }"
      :style="overlayStyle"
      @click="onOverlayClick"
    >
      <ObservationMarker
        v-for="{ obs, originalIndex } in locatedObservations"
        :key="originalIndex"
        :x="obs.x"
        :y="obs.y"
        :focused="focusedIndex === originalIndex"
        :open="focusedIndex === originalIndex"
        @select="emit('focusObservation', originalIndex)"
        @close="emit('clearFocus')"
      >
        <Observation :observation="obs" />
      </ObservationMarker>

      <ObservationMarker
        v-if="pendingMarker"
        :x="pendingMarker.x"
        :y="pendingMarker.y"
        pending
        open
        @close="emit('discardMarker')"
      >
        <ObservationCreate
          :contract="contract"
          :token-id="tokenId"
          :x="pendingMarker.x"
          :y="pendingMarker.y"
          @complete="emit('complete')"
        />
      </ObservationMarker>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem'
import type { ObservationData } from '../composables/useObservations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  observations: ObservationData[]
  pendingMarker: { x: number; y: number } | null
  focusedIndex: number | null
}>()

const emit = defineEmits<{
  placeMarker: [x: number, y: number]
  discardMarker: []
  focusObservation: [index: number]
  clearFocus: []
  complete: []
}>()

const { isConnected } = useConnection()

const locatedObservations = computed(() =>
  props.observations
    .map((obs, originalIndex) => ({ obs, originalIndex }))
    .filter(({ obs }) => obs.located),
)

const container = ref<HTMLElement>()
const overlayStyle = ref<Record<string, string> | null>(null)

let observer: ResizeObserver | null = null

const updateOverlay = () => {
  const img = container.value?.querySelector<HTMLImageElement>('.artifact-visual img')
  if (!img || !container.value) {
    overlayStyle.value = null
    return
  }

  const containerRect = container.value.getBoundingClientRect()
  const imgRect = img.getBoundingClientRect()

  overlayStyle.value = {
    position: 'absolute',
    left: `${imgRect.left - containerRect.left}px`,
    top: `${imgRect.top - containerRect.top}px`,
    width: `${imgRect.width}px`,
    height: `${imgRect.height}px`,
  }
}

onMounted(() => {
  observer = new ResizeObserver(updateOverlay)

  if (container.value) {
    observer.observe(container.value)
  }

  const checkImage = () => {
    const img = container.value?.querySelector<HTMLImageElement>('.artifact-visual img')
    if (img) {
      observer?.observe(img)
      if (img.complete) {
        updateOverlay()
      } else {
        img.addEventListener('load', updateOverlay, { once: true })
      }
    }
  }

  checkImage()

  const mutationObserver = new MutationObserver(() => {
    checkImage()
    updateOverlay()
  })

  if (container.value) {
    mutationObserver.observe(container.value, { childList: true, subtree: true })
  }

  onBeforeUnmount(() => {
    observer?.disconnect()
    mutationObserver.disconnect()
  })
})

const onOverlayClick = (event: MouseEvent) => {
  if (!isConnected.value) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 10000)
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 10000)
  emit('placeMarker', x, y)
}
</script>

<style scoped>
.observation-markers-container {
  position: relative;
}

.marker-overlay {
  z-index: 2;

  &.can-place {
    cursor: crosshair;
  }
}
</style>
