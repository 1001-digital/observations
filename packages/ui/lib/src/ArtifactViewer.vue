<template>
  <div class="artifact-viewer">
    <header class="viewer-header">
      <ConnectProfile />
    </header>

    <article class="token-detail">
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
                  <Icon
                    :type="observing ? 'lucide:hand' : 'lucide:crosshair'"
                  />
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
          <ArtifactDetails
            :metadata="metadata"
            :collection="collection"
            :contract="contract"
            :owner="owner"
          />

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
        </template>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import type { Address } from 'viem'
import {
  Actions,
  Alert,
  Button,
  Icon,
  Loading,
  Tooltip,
} from '@1001-digital/components'
import {
  ArtifactVisual,
  ArtifactDetails,
  ObservationMarkers,
  Observations,
  ObservationDetail,
  ConnectProfile,
  ObservationsConfigKey,
  useObservationsConfig,
  useArtifactPage,
} from '@1001-digital/observations-components'

const props = defineProps<{
  contract: Address
  token: string
}>()

// Provide a scoped ObservationsConfig so composables pick up our contract+token.
const parentConfig = useObservationsConfig()
provide(ObservationsConfigKey, {
  ...parentConfig,
  contract: props.contract,
  token: props.token,
})

const contract = computed(() => props.contract)
const tokenId = computed(() => BigInt(props.token))
const focusedId = ref<string | null>(null)

const {
  metadata, owner, image, animationUrl, pending, error,
  collection, tipRecipient,
  observations, observationCount, observationsPending, refreshAndPoll,
  pendingMarker, discardMarker,
  focusedObservation, hasMultipleViewModes, effectiveShowAnimation, viewType,
  focusObservation, clearFocus, onPlaceMarker, onMarkerComplete,
} = useArtifactPage(
  contract,
  tokenId,
  focusedId,
  {
    onFocusObservation: (id) => { focusedId.value = id },
    onClearFocus: () => { focusedId.value = null },
    onBeforePlaceMarker: () => { focusedId.value = null },
  },
)
</script>

<style scoped>
.artifact-viewer {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  --font-family: serif;
}

.viewer-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 3rem;
  padding: 0 var(--spacer);
  border-bottom: var(--border);
}

.token-detail {
  display: grid;
  grid-auto-rows: min-content;

  @media (min-width: 45rem) {
    grid-template-columns: 1fr 20rem;
    grid-auto-rows: auto;
  }

  @media (min-width: 64rem) {
    grid-template-columns: 1fr 27rem;
  }

  @media (min-width: 80rem) {
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

  @media (min-width: 45rem) {
    height: 100cqh;
    border-bottom: none;
    border-right: var(--border);
    padding: var(--spacer-lg) var(--spacer-lg) var(--spacer-xl);
  }
}

.sidebar {
  @media (min-width: 45rem) {
    min-height: 0;
    overflow-y: auto;
  }

  > * {
    padding: var(--spacer);

    &:not(:last-child) {
      border-bottom: var(--border);
    }

    @media (min-width: 45rem) {
      padding: var(--spacer-lg);
    }
  }

  .artifact-details {
    width: auto;
  }
}

.visual-actions.actions {
  margin-top: var(--spacer-sm);
  justify-content: center;
}
</style>
