<template>
  <div class="observation-list-item">
    <div v-if="!hideObserver" class="observation-list-item-header">
      <component :is="LinkComponent" :to="`/observer/${observation.observer}`">
        <EvmAccount :address="observation.observer" />
      </component>
      <a
        :href="`${blockExplorer}/tx/${observation.transactionHash}`"
        target="_blank"
      >
        <ObservationTime :block-number="observation.blockNumber" />
      </a>
    </div>
    <p class="observation-list-item-note">{{ observation.note }}</p>
    <div v-if="showArtifactPreview" class="observation-list-item-artifact">
      <Artifact
        :contract="observation.collection"
        :token-id="observation.tokenId"
      >
        <template #default="{ metadata, image }">
          <component :is="LinkComponent"
            :to="`/${observation.collection}/${observation.tokenId}/${observation.id}`"
            class="observation-list-item-preview"
          >
            <img
              v-if="image"
              :src="image"
              :alt="metadata.name"
              class="observation-list-item-thumbnail"
            />
            <span>{{ metadata.name || `${shortAddress(observation.collection)} / #${observation.tokenId}` }}</span>
          </component>
        </template>
      </Artifact>
    </div>
    <slot v-else name="link">
      <component :is="LinkComponent"
        :to="`/${observation.collection}/${observation.tokenId}/${observation.id}`"
        class="observation-list-item-link"
      >
        {{ shortAddress(observation.collection) }} / #{{ observation.tokenId }}
      </component>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { LinkComponentKey, useBlockExplorer, shortAddress, EvmAccount } from '@1001-digital/components'
import type { RecentObservationData } from '../utils/observations'
import Artifact from './Artifact.vue'
import ObservationTime from './ObservationTime.vue'

const props = defineProps<{
  observation: RecentObservationData
  hideObserver?: boolean
  showArtifactPreview?: boolean
}>()

const LinkComponent = inject(LinkComponentKey, 'a')
const blockExplorer = useBlockExplorer()
</script>

<style scoped>
.observation-list-item {
  display: grid;
  gap: var(--spacer-xs);

  .observation-list-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--font-sm);
    color: var(--muted);
  }

  .observation-list-item-note {
    word-break: break-word;
    white-space: pre-wrap;
  }

  .observation-list-item-link,
  :slotted(.observation-list-item-link) {
    font-size: var(--font-sm);
    color: var(--muted);
  }

  .observation-list-item-preview {
    display: flex;
    align-items: center;
    gap: var(--spacer-xs);
    font-size: var(--font-sm);
    color: var(--muted);
  }

  .observation-list-item-thumbnail {
    width: 2rem;
    height: 2rem;
    border-radius: var(--spacer-xs);
    object-fit: cover;
  }

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
