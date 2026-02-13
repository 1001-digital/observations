<template>
  <div
    ref="container"
    class="observation-markers-container"
  >
    <slot :observing="observing" :has-embed="hasEmbed" :toggle-observing="toggleObserving" />

    <div
      v-if="overlayStyle"
      class="marker-overlay"
      :class="{ 'can-place': isConnected && observing, 'non-interactive': !observing }"
      :style="overlayStyle"
      @click="onOverlayClick"
    >
      <ObservationMarker
        v-for="obs in locatedObservations"
        :key="obs.id"
        :x="obs.x"
        :y="obs.y"
        :focused="focusedId === obs.id"
        :open="focusedId === obs.id"
        @select="emit('focusObservation', obs.id)"
        @close="emit('clearFocus')"
      >
        <template #title>
          <EvmAccount :address="obs.observer" />
          <ObservationTime :block-number="obs.blockNumber" />
        </template>
        <p class="observation-note">{{ obs.note }}</p>
      </ObservationMarker>

      <ObservationMarker
        v-if="pendingMarker"
        :x="pendingMarker.x"
        :y="pendingMarker.y"
        title="Create Observation"
        :pending="isTransacting"
        open
        @close="emit('discardMarker')"
      >
        <ObservationCreate
          v-model:pending="isTransacting"
          :contract="contract"
          :token-id="tokenId"
          :x="pendingMarker.x"
          :y="pendingMarker.y"
          :view-type="viewType"
          :time="mediaTime"
          @complete="emit('complete')"
        />
      </ObservationMarker>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem'
import type { ObservationData } from '../utils/observations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  observations: ObservationData[]
  pendingMarker: { x: number; y: number } | null
  focusedId: string | null
  viewType?: number
}>()

const emit = defineEmits<{
  placeMarker: [x: number, y: number]
  discardMarker: []
  focusObservation: [id: string]
  clearFocus: []
  complete: []
}>()

const { isConnected } = useConnection()

const isTransacting = ref(false)
const mediaTime = ref(0)
const observing = ref(true)
const hasEmbed = ref(false)
const toggleObserving = () => { observing.value = !observing.value }

const findMediaElement = (): HTMLMediaElement | null =>
  container.value?.querySelector<HTMLMediaElement>('video, audio') ?? null

const locatedObservations = computed(() =>
  props.observations.filter((obs) => obs.located && (props.viewType == null || obs.viewType === props.viewType)),
)

const container = ref<HTMLElement>()
const overlayStyle = ref<Record<string, string> | null>(null)

let observer: ResizeObserver | null = null

const updateOverlay = () => {
  const el = container.value?.querySelector<HTMLElement>(
    '.artifact-visual img, .artifact-visual .embed',
  )
  hasEmbed.value = !!container.value?.querySelector('.artifact-visual .embed')

  if (!el || !container.value) {
    overlayStyle.value = null
    return
  }

  const containerRect = container.value.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  overlayStyle.value = {
    position: 'absolute',
    left: `${elRect.left - containerRect.left}px`,
    top: `${elRect.top - containerRect.top}px`,
    width: `${elRect.width}px`,
    height: `${elRect.height}px`,
  }
}

onMounted(() => {
  observer = new ResizeObserver(updateOverlay)

  if (container.value) {
    observer.observe(container.value)
  }

  const checkElement = () => {
    const img = container.value?.querySelector<HTMLImageElement>(
      '.artifact-visual img',
    )
    if (img) {
      observer?.observe(img)
      if (img.complete) {
        updateOverlay()
      } else {
        img.addEventListener('load', updateOverlay, { once: true })
      }
      return
    }

    const embed = container.value?.querySelector<HTMLElement>(
      '.artifact-visual .embed',
    )
    if (embed) {
      observer?.observe(embed)
      updateOverlay()
    }
  }

  checkElement()

  const mutationObserver = new MutationObserver(() => {
    checkElement()
    updateOverlay()
  })

  if (container.value) {
    mutationObserver.observe(container.value, {
      childList: true,
      subtree: true,
    })
  }

  onBeforeUnmount(() => {
    observer?.disconnect()
    mutationObserver.disconnect()
  })
})

const onOverlayClick = (event: MouseEvent) => {
  if (!isConnected.value || !observing.value) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 10000)
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 10000)

  const media = findMediaElement()
  if (media) {
    mediaTime.value = Math.round(media.currentTime)
    media.pause()
  } else {
    mediaTime.value = 0
  }

  emit('placeMarker', x, y)
}

watch(() => props.pendingMarker, (val, old) => {
  if (old && !val) {
    findMediaElement()?.play()
  }
})

watch(() => props.focusedId, (id) => {
  if (!id) return

  const obs = props.observations.find((o) => o.id === id)
  if (!obs?.time) return

  const media = findMediaElement()
  if (media) {
    media.currentTime = obs.time
  }
})
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

  &.non-interactive {
    pointer-events: none;
  }
}

</style>
