<template>
  <div class="observation">
    <div class="observation-header">
      <NuxtLink :to="`/observer/${observation.observer}`">
        <EvmAccount :address="observation.observer" />
      </NuxtLink>
      <div class="observation-header-right">
        <template v-if="editable">
          <Button
            class="small muted"
            @click.stop="emit('edit')"
            >edit</Button
          >
          <Button
            class="small muted"
            @click.stop="emit('delete')"
            >delete</Button
          >
        </template>
        <NuxtLink
          :to="`${blockExplorer}/tx/${observation.transactionHash}`"
          target="_blank"
        >
          <ObservationTime :block-number="observation.blockNumber" />
        </NuxtLink>
      </div>
    </div>
    <p class="observation-note">{{ observation.note }}</p>
    <small
      v-if="showLocation && observation.located"
      class="observation-location"
    >
      {{ (observation.x / 100).toFixed(1) }}% /
      {{ (observation.y / 100).toFixed(1) }}%
    </small>
    <small
      v-if="hasBothViews"
      class="observation-view-type"
    >
      {{ observation.viewType === 1 ? 'animation' : 'image' }}
    </small>
    <small
      v-if="observation.updatedBlock"
      class="observation-updated"
    >
      updated <ObservationTime :block-number="observation.updatedBlock" />
    </small>
    <small
      v-if="observation.tip > 0n"
      class="observation-tip"
    >
      {{ formatTip(observation.tip) }} ETH
    </small>
    <div
      v-if="responseCount || canReply"
      class="observation-footer"
    >
      <small
        v-if="responseCount"
        class="observation-responses-count"
      >
        {{ responseCount }} {{ responseCount === 1 ? 'reply' : 'replies' }}
      </small>
      <Button
        v-if="canReply"
        class="small muted"
        @click.stop="emit('reply')"
        >Reply</Button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatEther } from 'viem'
import type { ObservationData } from '../utils/observations'

defineProps<{
  observation: ObservationData
  showLocation?: boolean
  hasBothViews?: boolean
  editable?: boolean
  responseCount?: number
  canReply?: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  reply: []
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

  .observation-header-right {
    display: flex;
    align-items: center;
    gap: var(--spacer-sm);
  }

  .observation-note {
    word-break: break-word;
    white-space: pre-wrap;
  }

  .observation-location,
  .observation-view-type,
  .observation-updated,
  .observation-tip {
    color: var(--muted);
    font-size: var(--font-sm);
  }

  .observation-footer {
    display: flex;
    align-items: center;
    gap: var(--spacer);
    font-size: var(--font-sm);

    .observation-responses-count {
      color: var(--muted);
    }
  }
}
</style>
