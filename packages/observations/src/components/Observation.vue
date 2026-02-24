<template>
  <div
    class="observation"
    :id="observation.id"
  >
    <div class="observation-header">
      <div class="observation-header-left">
        <component :is="LinkComponent" :to="`/observer/${observation.observer}`">
          <EvmAccount :address="observation.observer" />
        </component>
        <a
          class="observation-time"
          :href="`${blockExplorer}/tx/${observation.transactionHash}`"
          target="_blank"
        >
          <ObservationTime :block-number="observation.blockNumber" />
        </a>
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
      v-if="showLocation && (observation.x !== 0 || observation.y !== 0)"
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
      {{ formatTip(observation.tip) }} ETH<template v-if="showTipRecipient">
        &rarr; <EvmAccount :address="observation.tipRecipient" /></template>
    </small>
    <div
      v-if="responseCount"
      class="observation-footer"
    >
      <span class="observation-responses-count">
        {{ responseCount }} {{ responseCount === 1 ? 'reply' : 'replies' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { formatEther, zeroAddress, type Address } from 'viem'
import { LinkComponentKey, useBlockExplorer, EvmAccount, Dropdown, DropdownItem, Button, Icon } from '@1001-digital/components'
import type { ObservationData } from '../utils/observations'
import ObservationTime from './ObservationTime.vue'

const props = defineProps<{
  observation: ObservationData
  showLocation?: boolean
  hasMultipleViewModes?: boolean
  editable?: boolean
  responseCount?: number
  expectedTipRecipient?: Address
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const LinkComponent = inject(LinkComponentKey, 'a')
const showActions = ref(false)
const blockExplorer = useBlockExplorer()

const showTipRecipient = computed(() => {
  const { tip, tipRecipient } = props.observation
  return (
    tip > 0n &&
    tipRecipient !== zeroAddress &&
    (!props.expectedTipRecipient ||
      tipRecipient.toLowerCase() !== props.expectedTipRecipient.toLowerCase())
  )
})

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

    .observation-responses-count {
      color: var(--muted);
    }
  }
}
</style>
