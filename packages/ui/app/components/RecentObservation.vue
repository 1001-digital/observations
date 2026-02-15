<template>
  <div class="recent-observation">
    <div class="recent-observation-header">
      <EvmAccount :address="observation.observer" />
      <NuxtLink
        :to="`${blockExplorer}/tx/${observation.transactionHash}`"
        target="_blank"
      >
        <ObservationTime :block-number="observation.blockNumber" />
      </NuxtLink>
    </div>
    <p class="recent-observation-note">{{ observation.note }}</p>
    <slot name="link">
      <NuxtLink
        :to="`/${observation.collection}/${observation.tokenId}`"
        class="recent-observation-link"
      >
        {{ shortAddress(observation.collection) }} / #{{ observation.tokenId }}
      </NuxtLink>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { RecentObservationData } from '../utils/observations'

const props = defineProps<{
  observation: RecentObservationData
}>()

const blockExplorer = useBlockExplorer()
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

  .recent-observation-link,
  :slotted(.recent-observation-link) {
    font-size: var(--font-sm);
    color: var(--muted);
  }

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
