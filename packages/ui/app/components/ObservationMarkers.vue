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
        :pending="replyingToId === obs.id && isReplyTransacting"
        @select="emit('focusObservation', obs.id)"
        @close="emit('clearFocus')"
      >
        <template #title>
          <NuxtLink :to="`/observer/${obs.observer}`">
            <EvmAccount :address="obs.observer" />
          </NuxtLink>
          <ObservationTime :block-number="obs.blockNumber" />
        </template>
        <p class="observation-note">{{ obs.note }}</p>

        <button
          v-if="responsesByParent.get(obs.id)?.length"
          class="popover-replies-toggle"
          @click.stop="togglePopoverReplies(obs.id)"
        >
          {{ expandedReplies.has(obs.id) ? '&#9662;' : '&#9656;' }}
          {{ responsesByParent.get(obs.id)!.length }}
          {{ responsesByParent.get(obs.id)!.length === 1 ? 'reply' : 'replies' }}
        </button>

        <div
          v-if="expandedReplies.has(obs.id)"
          class="popover-replies"
        >
          <div
            v-for="reply in responsesByParent.get(obs.id)"
            :key="reply.id"
            class="popover-reply"
          >
            <div class="popover-reply-header">
              <NuxtLink :to="`/observer/${reply.observer}`">
                <EvmAccount :address="reply.observer" />
              </NuxtLink>
              <ObservationTime :block-number="reply.blockNumber" />
            </div>
            <p class="observation-note">{{ reply.note }}</p>
          </div>
        </div>

        <ObservationCreate
          v-if="replyingToId === obs.id"
          v-model:pending="isReplyTransacting"
          :contract="contract"
          :token-id="tokenId"
          :parent="BigInt(obs.id)"
          @complete="onPopoverReplyComplete"
        />
        <Button
          v-else-if="isConnected"
          class="small muted"
          @click.stop="replyingToId = obs.id"
          >Reply</Button
        >
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

const replyingToId = ref<string | null>(null)
const isTransacting = ref(false)
const isReplyTransacting = ref(false)
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
      obs.located &&
      obs.parent === 0n &&
      (props.viewType == null || obs.viewType === props.viewType),
  ),
)

const responsesByParent = computed(() => {
  const map = new Map<string, ObservationData[]>()
  for (const obs of props.observations) {
    if (obs.parent !== 0n) {
      const key = obs.parent.toString()
      const list = map.get(key) ?? []
      list.push(obs)
      map.set(key, list)
    }
  }
  return map
})

// Resolve focusedId to the parent observation id when it's a reply
const effectiveFocusedId = computed(() => {
  const id = props.focusedId
  if (!id) return null
  // Check if it's a reply and resolve to its parent
  const obs = props.observations.find((o) => o.id === id)
  if (obs && obs.parent !== 0n) return obs.parent.toString()
  return id
})

const expandedReplies = ref<Set<string>>(new Set())

function togglePopoverReplies(id: string) {
  if (expandedReplies.value.has(id)) {
    expandedReplies.value.delete(id)
  } else {
    expandedReplies.value.add(id)
  }
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

watch(
  () => props.pendingMarker,
  (val, old) => {
    if (old && !val) {
      findMediaElement()?.play()
    }
  },
)

const onPopoverReplyComplete = () => {
  replyingToId.value = null
  emit('complete')
}

watch(
  effectiveFocusedId,
  (id, oldId) => {
    replyingToId.value = null
    if (oldId) expandedReplies.value.delete(oldId)

    if (!id) return

    // Auto-expand replies in popover when focusing a reply
    if (props.focusedId !== id) {
      expandedReplies.value.add(id)
    }

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
.popover-replies-toggle {
  all: unset;
  font-size: var(--font-sm);
  color: var(--muted);
  cursor: pointer;

  &:hover {
    color: var(--foreground, inherit);
  }
}

.popover-replies {
  display: grid;
  gap: var(--spacer-sm);
  padding-left: var(--spacer-sm);
  border-left: 2px solid var(--border-color, var(--muted));
}

.popover-reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-sm);
  color: var(--muted);
}
</style>
