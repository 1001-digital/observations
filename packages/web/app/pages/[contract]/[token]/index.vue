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
        @place-marker="placeMarker"
        @discard-marker="discardMarker"
        @focus-observation="focusObservation"
        @clear-focus="clearFocus"
        @complete="onMarkerComplete"
      >
        <ArtifactVisual
          v-model:show-animation="showAnimation"
          :image="image"
          :animation-url="animationUrl"
          :name="metadata.name"
        />
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

        <Observations
          :contract="contract"
          :token-id="tokenId"
          :observations="observations"
          :count="observationCount"
          :external-pending="observationsPending"
          :focused-id="focusedId"
          @complete="refresh"
          @focus-observation="focusObservation"
        />
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

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
  refresh,
} = useObservations(toRef(contract), toRef(tokenId))

const {
  pendingMarker,
  focusedId,
  placeMarker,
  discardMarker,
  focusObservation,
  clearFocus,
} = useObservationMarkers()

// Initialize focused observation from query param
if (route.query.obs != null) {
  focusObservation(String(route.query.obs))
}

// Sync focused observation to query param
watch(focusedId, (id) => {
  const query = { ...route.query }
  if (id != null) {
    query.obs = id
  } else {
    delete query.obs
  }
  router.replace({ query })
})

const onMarkerComplete = () => {
  discardMarker()
  refresh()
}
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
</style>
