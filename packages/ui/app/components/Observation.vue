<template>
  <div class="observation">
    <div class="observation-header">
      <EvmAccount :address="observation.observer" />
      <NuxtLink
        :to="`${blockExplorer}/tx/${observation.transactionHash}`"
        target="_blank"
      >
        <ObservationTime :block-number="observation.blockNumber" />
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
