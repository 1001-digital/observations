<template>
  <div class="observation">
    <div class="observation-header">
      <EvmAccount :address="observation.observer" />
      <NuxtLink
        :to="`${blockExplorer}/tx/${observation.transactionHash}`"
        target="_blank"
      >
        <time :datetime="date.toISOString()">{{ formattedTime }}</time>
      </NuxtLink>
    </div>
    <p class="observation-note">{{ observation.note }}</p>
    <small v-if="showLocation && observation.located" class="observation-location">
      {{ (observation.x / 100).toFixed(1) }}% / {{ (observation.y / 100).toFixed(1) }}%
    </small>
    <small v-if="hasBothViews" class="observation-view-type">
      {{ observation.viewType === 1 ? 'animation' : 'image' }}
    </small>
  </div>
</template>

<script setup lang="ts">
import type { ObservationData } from '../composables/useObservations'

const props = defineProps<{
  observation: ObservationData
  showLocation?: boolean
  hasBothViews?: boolean
}>()

const blockExplorer = useBlockExplorer()

const date = computed(() => new Date(Number(props.observation.blockTimestamp) * 1000))

const formattedTime = computed(() => {
  const now = Date.now()
  const then = date.value.getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  return date.value.toLocaleDateString()
})
</script>

<style scoped>
.observation {
  display: grid;
  gap: var(--spacer-xs);

  .observation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-sm);
    color: var(--muted);
  }

  .observation-note {
    word-break: break-word;
    white-space: pre-wrap;
  }

  .observation-location,
  .observation-view-type {
    color: var(--muted);
    font-size: var(--font-sm);
  }

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
