<template>
  <article class="token-detail">
    <div class="artifact-column">
      <ObservationMarkers
        v-if="metadata"
        :contract="contract"
        :token-id="tokenId"
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

        <NuxtPage />
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()

const contract = useArtifactContract()
const tokenId = useArtifactTokenId()

const { metadata, owner, image, animationUrl, pending, error } = useArtifact(
  toRef(contract),
  toRef(tokenId),
)
const { collection } = useCollection(toRef(contract))
const { showAnimation } = useArtifactView(animationUrl, pending)

const {
  observations,
  count: observationCount,
  pending: observationsPending,
  refreshAndPoll,
} = useObservations(toRef(contract), toRef(tokenId))

const { pendingMarker, placeMarker, discardMarker } = useObservationMarkers()

// Derive focusedId from route
const focusedId = computed(() => (route.params.id as string) ?? null)

// Compute base path for navigation
const { contract: scopeContract, token: scopeToken } = useArtifactScope()
const basePath = computed(() =>
  scopeContract && scopeToken
    ? ''
    : `/${contract.value}/${tokenId.value}`,
)

const hasMultipleViewModes = computed(() => !!image.value && !!animationUrl.value)

// When an observation is focused, derive view mode from its viewType
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

// Navigation helpers
const focusObservation = (id: string) => {
  pendingMarker.value = null
  navigateTo({ path: `${basePath.value}/${id}`, query: route.query })
}

const clearFocus = () => {
  navigateTo({ path: basePath.value || '/', query: route.query })
}

const onPlaceMarker = (x: number, y: number) => {
  placeMarker(x, y)
  if (route.params.id) {
    navigateTo({ path: basePath.value || '/', query: route.query })
  }
}

const onMarkerComplete = () => {
  discardMarker()
  refreshAndPoll()
}

// Provide data to child routes
provide(tokenPageDataKey, {
  observations,
  count: observationCount,
  pending: observationsPending,
  refreshAndPoll,
  contract,
  tokenId,
  hasMultipleViewModes,
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

.observations {
  min-height: 10rem;
}

.visual-actions.actions {
  margin-top: var(--spacer-sm);
  justify-content: center;
}
</style>
