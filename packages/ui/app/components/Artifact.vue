<template>
  <article class="artifact">
    <Loading v-if="pending" spinner />
    <Alert v-else-if="error">{{ error.message }}</Alert>
    <template v-else-if="metadata">
      <div class="artifact-media">
        <Embed v-if="animationUrl" :src="animationUrl" />
        <img v-else-if="image" :src="image" :alt="metadata.name" />
      </div>
      <section class="artifact-details">
        <h1>{{ metadata.name }}</h1>
        <p v-if="metadata.description">{{ metadata.description }}</p>
      </section>
    </template>
  </article>
</template>

<script setup lang="ts">
import type { Address } from 'viem'

const props = defineProps<{
  contract: Address
  tokenId: bigint
}>()

const { metadata, image, animationUrl, pending, error } = useArtifact(
  toRef(() => props.contract),
  toRef(() => props.tokenId),
)
</script>

<style scoped>
.artifact {
  display: grid;
  gap: var(--spacer);
  container-type: inline;
}

.artifact-media {
  position: relative;
  margin: auto;
  width: min(80cqh, 80cqw);
  height: min(80cqh, 80cqw);

  img {
    display: block;
    width: 100%;
    height: 100%;
    width: auto;
    height: auto;
    aspect-ratio: auto;
    image-rendering: pixelated;
  }

  :deep(.embed) {
    max-width: 80vw;
    max-height: 80vh;
  }

}

.artifact-details {
  display: grid;
  gap: var(--spacer-sm);

  h1 {
    font-size: var(--font-lg);
  }

  p {
    color: var(--muted);
  }
}
</style>
