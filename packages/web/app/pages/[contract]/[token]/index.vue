<template>
  <article class="token-detail">
    <div class="artifact-column">
      <ArtifactVisual
        v-if="metadata"
        v-model:show-animation="showAnimation"
        :image="image"
        :animation-url="animationUrl"
        :name="metadata.name"
      />
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

        <Observations :contract="contract" :token-id="tokenId" />
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
const contract = useArtifactContract()
const tokenId = useArtifactTokenId()

const { metadata, owner, image, animationUrl, pending, error } = useArtifact(
  toRef(contract),
  toRef(tokenId),
)
const { collection } = useCollection(toRef(contract))
const { showAnimation } = useArtifactView(animationUrl, pending)
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

  .artifact-visual {
    width: 80cqw;
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
