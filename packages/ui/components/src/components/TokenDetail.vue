<template>
  <article class="token-detail">
    <div class="layout">
      <div class="artifact-column">
        <ObservationMarkers
          v-if="metadata"
          :contract="contract"
          :token-id="tokenId"
          :tip-recipient="tipRecipient"
          :observations="observations"
          :pending-marker="pendingMarker"
          :focused-id="focusedId"
          :view-type="
            hasMultipleViewModes ? (effectiveShowAnimation ? 1 : 0) : undefined
          "
          @place-marker="onPlaceMarker"
          @discard-marker="discardMarker"
          @focus-observation="focusObservation"
          @clear-focus="clearFocus"
          @complete="onMarkerComplete"
          v-slot="{ observing, hasEmbed, toggleObserving }"
        >
          <ArtifactVisual
            v-model:show-animation="effectiveShowAnimation"
            :image="image"
            :animation-url="animationUrl"
            :name="metadata.name"
          />
          <Actions
            v-if="(animationUrl && image) || hasEmbed"
            class="visual-actions"
          >
            <Tooltip v-if="animationUrl && image">
              <template #trigger>
                <Button
                  class="small"
                  @click="effectiveShowAnimation = !effectiveShowAnimation"
                >
                  <Icon
                    :type="
                      effectiveShowAnimation ? 'lucide:image' : 'lucide:play'
                    "
                  />
                </Button>
              </template>
              {{ effectiveShowAnimation ? 'Show image' : 'Show animation' }}
            </Tooltip>
            <Tooltip v-if="hasEmbed">
              <template #trigger>
                <Button
                  class="small"
                  @click="toggleObserving"
                >
                  <Icon :type="observing ? 'lucide:hand' : 'lucide:crosshair'" />
                </Button>
              </template>
              {{ observing ? 'Interact' : 'Observe' }}
            </Tooltip>
          </Actions>
        </ObservationMarkers>
      </div>

      <div class="sidebar">
        <Loading
          v-if="pending"
          spinner
        />
        <Alert v-else-if="error">{{ error.message }}</Alert>
        <template v-else-if="metadata">
          <slot name="before-details" />

          <ArtifactDetails
            :metadata="metadata"
            :collection="collection"
            :contract="contract"
            :owner="owner"
          />

          <slot name="after-details" />

          <slot>
            <ObservationDetail
              v-if="focusedObservation"
              :contract="contract"
              :token-id="tokenId"
              :tip-recipient="tipRecipient"
              :observations="observations"
              :focused-id="focusedId!"
              :has-multiple-view-modes="hasMultipleViewModes"
              @focus-observation="focusObservation"
              @clear-focus="clearFocus"
              @complete="refreshAndPoll"
            />
            <Observations
              v-else
              :contract="contract"
              :token-id="tokenId"
              :tip-recipient="tipRecipient"
              :observations="observations"
              :count="observationCount"
              :external-pending="observationsPending"
              :has-multiple-view-modes="hasMultipleViewModes"
              :view-type="viewType"
              @complete="refreshAndPoll"
              @focus-observation="focusObservation"
            />
          </slot>

          <slot name="after-content" />
        </template>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue'
import type { Address } from 'viem'
import {
  Actions,
  Alert,
  Button,
  Icon,
  Loading,
  Tooltip,
} from '@1001-digital/components'
import ArtifactVisual from './ArtifactVisual.vue'
import ArtifactDetails from './ArtifactDetails.vue'
import ObservationMarkers from './ObservationMarkers.vue'
import Observations from './Observations.vue'
import ObservationDetail from './ObservationDetail.vue'
import {
  useArtifactPage,
  type ArtifactPageNavigation,
} from '../composables/useArtifactPage'
import {
  tokenPageDataKey,
  observationNavigationKey,
} from '../composables/useTokenPageProvide'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  focusedId: string | null
  navigation: ArtifactPageNavigation
}>()

const contract = toRef(props, 'contract')
const tokenId = toRef(props, 'tokenId')
const focusedId = computed(() => props.focusedId)

const {
  metadata,
  owner,
  image,
  animationUrl,
  pending,
  error,
  collection,
  tipRecipient,
  observations,
  observationCount,
  observationsPending,
  refreshAndPoll,
  pendingMarker,
  discardMarker,
  focusedObservation,
  hasMultipleViewModes,
  effectiveShowAnimation,
  viewType,
  focusObservation,
  clearFocus,
  onPlaceMarker,
  onMarkerComplete,
} = useArtifactPage(contract, tokenId, focusedId, props.navigation)

provide(tokenPageDataKey, {
  observations,
  count: observationCount,
  pending: observationsPending,
  refreshAndPoll,
  contract,
  tokenId,
  tipRecipient,
  hasMultipleViewModes,
  viewType,
})

provide(observationNavigationKey, {
  focusObservation,
  clearFocus,
})
</script>

<style scoped>
.token-detail {
  container-type: size;
  height: 100%;
}

.layout {
  display: grid;
  grid-auto-rows: min-content;
  height: 100%;

  @container (min-width: 45rem) {
    grid-template-columns: 1fr 20rem;
    grid-auto-rows: auto;
  }

  @container (min-width: 64rem) {
    grid-template-columns: 1fr 27rem;
  }

  @container (min-width: 80rem) {
    grid-template-columns: 1fr 35rem;
  }
}

.artifact-column {
  display: flex;
  justify-content: center;
  align-items: center;
  container-type: size;
  border-bottom: var(--border);
  height: 100cqw;
  background: var(--gray-z-0);

  .artifact-visual {
    width: min(80cqw, 80cqh);
    height: min(80cqw, 80cqh);
  }

  @container (min-width: 45rem) {
    height: 100cqh;
    border-bottom: none;
    border-right: var(--border);
    padding: var(--spacer-lg) var(--spacer-lg) var(--spacer-xl);
  }
}

.sidebar {
  @container (min-width: 45rem) {
    min-height: 0;
    overflow-y: auto;
  }

  > *,
  & :deep(> *) {
    padding: var(--spacer);

    &:not(:last-child) {
      border-bottom: var(--border);
    }

    @container (min-width: 45rem) {
      padding: var(--spacer-lg);
    }
  }

  & :deep(.artifact-details) {
    width: auto;
  }
}

.visual-actions.actions {
  margin-top: var(--spacer-sm);
  justify-content: center;
}
</style>
