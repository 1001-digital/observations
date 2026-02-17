<template>
  <div
    class="observation"
    :id="observation.id"
  >
    <div class="observation-header">
      <div class="observation-header-left">
        <NuxtLink :to="`/observer/${observation.observer}`">
          <EvmAccount :address="observation.observer" />
        </NuxtLink>
        <NuxtLink
          class="observation-time"
          :to="`${blockExplorer}/tx/${observation.transactionHash}`"
          target="_blank"
        >
          <ObservationTime :block-number="observation.blockNumber" />
        </NuxtLink>
      </div>
      <Dropdown
        v-if="editable"
        v-model:open="showActions"
        align="end"
      >
        <template #trigger>
          <Button class="small muted">
            <Icon type="lucide:ellipsis-vertical" />
          </Button>
        </template>
        <DropdownItem @select="emit('edit')">Edit</DropdownItem>
        <DropdownItem @select="emit('delete')">Delete</DropdownItem>
      </Dropdown>
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
      v-if="hasMultipleViewModes"
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
      <button
        v-if="responseCount"
        class="observation-responses-toggle"
        @click.stop="emit('toggleReplies')"
      >
        {{ repliesExpanded ? '&#9662;' : '&#9656;' }}
        {{ responseCount }} {{ responseCount === 1 ? 'reply' : 'replies' }}
      </button>
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
  hasMultipleViewModes?: boolean
  editable?: boolean
  responseCount?: number
  repliesExpanded?: boolean
  canReply?: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  reply: []
  toggleReplies: []
}>()

const showActions = ref(false)
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
  }

  .observation-header-left {
    display: flex;
    align-items: center;
    gap: var(--spacer-sm);

    .observation-time {
      color: var(--muted);
    }
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

    .observation-responses-toggle {
      all: unset;
      color: var(--muted);
      cursor: pointer;

      &:hover {
        color: var(--foreground, inherit);
      }
    }
  }
}
</style>
