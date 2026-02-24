<template>
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
        :view-type="hasMultipleViewModes ? (effectiveShowAnimation ? 1 : 0) : undefined"
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
        <Actions v-if="(animationUrl && image) || hasEmbed" class="visual-actions">
          <Tooltip v-if="animationUrl && image">
            <template #trigger>
              <Button class="small" @click="effectiveShowAnimation = !effectiveShowAnimation">
                <Icon :type="effectiveShowAnimation ? 'lucide:image' : 'lucide:play'" />
              </Button>
            </template>
            {{ effectiveShowAnimation ? 'Show image' : 'Show animation' }}
          </Tooltip>
          <Tooltip v-if="hasEmbed">
            <template #trigger>
              <Button class="small" @click="toggleObserving">
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
        <ArtifactDetails
          :metadata="metadata"
          :collection="collection"
          :contract="contract"
          :owner="owner"
        />

        <router-view />
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Actions, Alert, Button, Icon, Loading, Tooltip } from '@1001-digital/components'
import ArtifactVisual from '@ui/components/ArtifactVisual.vue'
import ArtifactDetails from '@ui/components/ArtifactDetails.vue'
import ObservationMarkers from '@ui/components/ObservationMarkers.vue'
import { useArtifactContract, useArtifactTokenId, useArtifactScope } from '@ui/composables/artifactScope'
import { useArtifact } from '@ui/composables/useArtifact'
import { useArtifactView } from '@ui/composables/useArtifactView'
import { useCollection } from '@ui/composables/useCollection'
import { useObservations } from '@ui/composables/useObservations'
import { useObservationMarkers } from '@ui/composables/useObservationMarkers'
import {
  tokenPageDataKey,
  observationNavigationKey,
} from '@ui/composables/useTokenPageProvide'

const route = useRoute()
const router = useRouter()

const contract = useArtifactContract()
const tokenId = useArtifactTokenId()

const { metadata, owner, image, animationUrl, pending, error } = useArtifact(
  toRef(contract),
  toRef(tokenId),
)
const { collection } = useCollection(toRef(contract))
const tipRecipient = computed(() => collection.value?.owner)
const { showAnimation } = useArtifactView(animationUrl, pending)

const {
  observations,
  count: observationCount,
  pending: observationsPending,
  refreshAndPoll,
} = useObservations(toRef(contract), toRef(tokenId))

const { pendingMarker, placeMarker, discardMarker } = useObservationMarkers()

const focusedId = computed(() => (route.params.id as string) ?? null)

const { contract: scopeContract, token: scopeToken } = useArtifactScope()
const basePath = computed(() =>
  scopeContract && scopeToken
    ? ''
    : `/${contract.value}/${tokenId.value}`,
)

const hasMultipleViewModes = computed(() => !!image.value && !!animationUrl.value)

const effectiveShowAnimation = computed({
  get() {
    if (focusedId.value && hasMultipleViewModes.value) {
      const obs = observations.value.find((o) => o.id === focusedId.value)
      if (obs) return obs.viewType === 1
    }
    return showAnimation.value
  },
  set(value: boolean) {
    showAnimation.value = value
  },
})

const viewType = computed(() => effectiveShowAnimation.value ? 1 : 0)

const focusObservation = (id: string) => {
  pendingMarker.value = null
  router.push({ path: `${basePath.value}/${id}`, query: route.query })
}

const clearFocus = () => {
  router.push({ path: basePath.value || '/', query: route.query })
}

const onPlaceMarker = async (x: number, y: number) => {
  if (route.params.id) {
    await router.push({ path: basePath.value || '/', query: route.query })
  }
  placeMarker(x, y)
}

const onMarkerComplete = () => {
  discardMarker()
  refreshAndPoll()
}

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
  display: grid;
  grid-auto-rows: min-content;

  @media (min-width: 45rem) {
    height: calc(100dvh - var(--navbar-height, 0px));
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
