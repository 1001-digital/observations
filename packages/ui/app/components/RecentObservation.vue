<template>
  <div class="recent-observation">
    <div class="recent-observation-header">
      <EvmAccount :address="observation.observer" />
      <NuxtLink
        :to="`${blockExplorer}/tx/${observation.transactionHash}`"
        target="_blank"
      >
        <time :datetime="date.toISOString()">{{ formattedTime }}</time>
      </NuxtLink>
    </div>
    <p class="recent-observation-note">{{ observation.note }}</p>
    <NuxtLink
      :to="`/${observation.collection}/${observation.tokenId}`"
      class="recent-observation-artifact"
    >
      {{ shortAddress(observation.collection) }} / #{{ observation.tokenId }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { RecentObservationData } from '../composables/useRecentObservations'

const props = defineProps<{
  observation: RecentObservationData
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
.recent-observation {
  display: grid;
  gap: var(--spacer-xs);

  .recent-observation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-sm);
    color: var(--muted);
  }

  .recent-observation-note {
    word-break: break-word;
    white-space: pre-wrap;
  }

  .recent-observation-artifact {
    font-size: var(--font-sm);
    color: var(--muted);
  }

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
