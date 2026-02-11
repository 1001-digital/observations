<template>
  <article class="artifact">
    <Loading v-if="pending" spinner />
    <Alert v-else-if="error">{{ error.message }}</Alert>
    <template v-else-if="metadata">
      <div class="artifact-media">
        <img v-if="image" :src="image" :alt="metadata.name" />
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

const { metadata, image, pending, error } = useArtifact(
  toRef(() => props.contract),
  toRef(() => props.tokenId),
)
</script>

<style scoped>
.artifact {
  display: grid;
  gap: var(--spacer);
}

.artifact-media {
  overflow: hidden;
  position: relative;
  background-color: var(--background);

  img {
    width: 100%;
    height: auto;
    display: block;
    image-rendering: pixelated;
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
