<template>
  <div class="observation">
    <div class="observation-header">
      <NuxtLink :to="`/observer/${observation.observer}`">
        <EvmAccount :address="observation.observer" />
      </NuxtLink>
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
    <small v-if="observation.tip > 0n" class="observation-tip">
      {{ formatTip(observation.tip) }} ETH
    </small>
  </div>
</template>

<script setup lang="ts">
import { formatEther } from 'viem'
import type { ObservationData } from '../utils/observations'

const props = defineProps<{
  observation: ObservationData
  showLocation?: boolean
  hasBothViews?: boolean
}>()

const blockExplorer = useBlockExplorer()

function formatTip(value: bigint): string {
  const formatted = formatEther(value)
  // Remove trailing zeros after decimal point
  if (formatted.includes('.')) {
    return formatted.replace(/\.?0+$/, '') || '0'
  }
  return formatted
}
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
  .observation-view-type,
  .observation-tip {
    color: var(--muted);
    font-size: var(--font-sm);
  }

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
