<template>
  <article class="artifact">
    <Loading v-if="pending" spinner />
    <Alert v-else-if="error">{{ error.message }}</Alert>
    <template v-else-if="metadata">
      <div class="artifact-media">
        <Embed v-if="animationUrl && showAnimation" :src="animationUrl" />
        <img v-else-if="image" :src="image" :alt="metadata.name" />
        <Actions v-if="animationUrl && image" class="artifact-actions">
          <Button class="small" @click="showAnimation = !showAnimation">
            <Icon :type="showAnimation ? 'lucide:image' : 'lucide:play'" />
          </Button>
        </Actions>
      </div>
      <section class="artifact-details">
        <h1 v-if="metadata.name">{{ metadata.name }}</h1>
        <p v-if="metadata.description">{{ metadata.description }}</p>
        <dl v-if="collection" class="artifact-collection">
          <template v-if="collection.name">
            <dt>Collection</dt>
            <dd>{{ collection.name }}</dd>
          </template>
          <template v-if="collection.symbol">
            <dt>Symbol</dt>
            <dd>{{ collection.symbol }}</dd>
          </template>
          <template v-if="collection.owner">
            <dt>Owner</dt>
            <dd>{{ collection.owner }}</dd>
          </template>
        </dl>
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

const contractRef = toRef(() => props.contract)

const { metadata, image, animationUrl, pending, error } = useArtifact(
  contractRef,
  toRef(() => props.tokenId),
)

const { collection } = useCollection(contractRef)

const { showAnimation } = useArtifactView(animationUrl, pending)
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

  .artifact-actions {
    position: absolute;
    bottom: var(--spacer-sm);
    right: var(--spacer-sm);
    z-index: 1;
  }
}

.artifact-details {
  display: grid;
  gap: var(--spacer-sm);
  width: min(80cqh, 80cqw);
  margin-inline: auto;

  h1,
  p {
    word-break: break-word;
  }

  h1 {
    font-size: var(--font-lg);
  }

  p {
    color: var(--muted);
  }

  .artifact-collection {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--spacer-xs) var(--spacer-sm);
    color: var(--muted);
    font-size: var(--font-sm);

    dt {
      font-weight: 600;
    }

    dd {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
