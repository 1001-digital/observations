<template>
  <div
    ref="container"
    class="observation-markers-container"
  >
    <slot
      :observing="observing"
      :has-embed="hasEmbed"
      :toggle-observing="toggleObserving"
    />

    <div
      v-if="overlayStyle"
      class="marker-overlay"
      :class="{
        'can-place': isConnected && observing,
        'non-interactive': !observing,
      }"
      :style="overlayStyle"
      @click="onOverlayClick"
    >
      <ObservationMarker
        v-for="obs in locatedObservations"
        :key="obs.id"
        :x="obs.x"
        :y="obs.y"
        :focused="effectiveFocusedId === obs.id"
        :open="effectiveFocusedId === obs.id"
        @select="emit('focusObservation', obs.id)"
        @close="emit('clearFocus')"
      >
        <template #title>
          <component :is="LinkComponent" :to="`/observer/${displayObs(obs).observer}`">
            <EvmAccount :address="displayObs(obs).observer" />
          </component>
          <ObservationTime :block-number="displayObs(obs).blockNumber" />
        </template>

        <p
          v-if="focusedReplyParent && effectiveFocusedId === obs.id"
          class="popover-in-response-to"
        >
          in response to
          <a @click.stop.prevent="emit('focusObservation', focusedReplyParent.id)">
            &ldquo;{{ truncate(focusedReplyParent.note) }}&rdquo;
            by <EvmAccount :address="focusedReplyParent.observer" />
          </a>
        </p>

        <p class="observation-note">{{ displayObs(obs).note }}</p>
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
          :tip-recipient="tipRecipient"
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
import { ref, computed, watch, inject, onMounted, onBeforeUnmount } from 'vue'
import type { Address } from 'viem'
import { useConnection } from '@wagmi/vue'
import { LinkComponentKey, EvmAccount } from '@1001-digital/components'
import type { ObservationData } from '../utils/observations'
import ObservationMarker from './ObservationMarker.vue'
import ObservationCreate from './ObservationCreate.vue'
import ObservationTime from './ObservationTime.vue'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  tipRecipient?: Address
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

const LinkComponent = inject(LinkComponentKey, 'a')
const { isConnected } = useConnection()

const isTransacting = ref(false)
const mediaTime = ref(0)
const observing = ref(true)
const hasEmbed = ref(false)
const toggleObserving = () => {
  observing.value = !observing.value
}

const findMediaElement = (): HTMLMediaElement | null =>
  container.value?.querySelector<HTMLMediaElement>('video, audio') ?? null

const locatedObservations = computed(() =>
  props.observations.filter(
    (obs) =>
      (obs.x !== 0 || obs.y !== 0) &&
      obs.parent === 0n &&
      (props.viewType == null || obs.viewType === props.viewType),
  ),
)

// Walk the full parent chain to root (not just 1 level), with cycle protection
const effectiveFocusedId = computed(() => {
  const id = props.focusedId
  if (!id) return null

  const obs = props.observations.find((o) => o.id === id)
  if (!obs || obs.parent === 0n) return id

  // Walk up the parent chain to the root
  let current = obs
  const seen = new Set<string>([id])
  while (current.parent !== 0n) {
    const parentId = current.parent.toString()
    if (seen.has(parentId)) break // cycle protection
    seen.add(parentId)
    const parent = props.observations.find((o) => o.id === parentId)
    if (!parent) break
    current = parent
  }
  return current.id
})

// The actual focused observation when it's a reply (not root)
const focusedReply = computed(() => {
  const id = props.focusedId
  if (!id) return null
  const obs = props.observations.find((o) => o.id === id)
  if (obs && obs.parent !== 0n) return obs
  return null
})

// The direct parent of the focused reply
const focusedReplyParent = computed(() => {
  if (!focusedReply.value) return null
  const parentId = focusedReply.value.parent.toString()
  return props.observations.find((o) => o.id === parentId) ?? null
})

function displayObs(obs: ObservationData): ObservationData {
  return focusedReply.value && effectiveFocusedId.value === obs.id
    ? focusedReply.value
    : obs
}

function truncate(text: string, max = 20): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '\u2026'
}

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

watch(hasEmbed, (val) => {
  if (!val) observing.value = true
})

watch(
  () => props.pendingMarker,
  (val, old) => {
    if (old && !val) {
      findMediaElement()?.play()
    }
  },
)

watch(
  effectiveFocusedId,
  (id) => {
    if (!id) return

    const obs = props.observations.find((o) => o.id === props.focusedId)
    if (!obs?.time) return

    const media = findMediaElement()
    if (media) {
      media.currentTime = obs.time
    }
  },
  { immediate: true },
)
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

<style>
.popover-in-response-to {
  font-size: var(--font-sm);
  color: var(--muted);

  a {
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: var(--foreground, inherit);
    }
  }
}
</style>
