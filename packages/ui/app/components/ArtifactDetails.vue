<template>
  <section class="artifact-details">
    <h1 v-if="metadata.name">{{ metadata.name }}</h1>
    <p v-if="metadata.description">{{ metadata.description }}</p>
    <dl
      v-if="collection"
      class="artifact-collection"
    >
      <template v-if="details.showCollection && collection.name">
        <dt>Collection</dt>
        <dd>
          <NuxtLink
            :to="`${blockExplorer}/address/${contract}`"
            target="_blank"
          >
            {{ collection.name
            }}<small v-if="details.showSymbol && collection.symbol">
              ({{ collection.symbol }})</small
            >
          </NuxtLink>
        </dd>
      </template>
      <template v-if="details.showArtist && collection.owner">
        <dt>Artist</dt>
        <dd>
          <NuxtLink
            :to="`${blockExplorer}/address/${collection.owner}`"
            target="_blank"
          >
            <Address :address="collection.owner" />
          </NuxtLink>
        </dd>
      </template>
      <template v-if="details.showOwner && owner">
        <dt>Owner</dt>
        <dd>
          <NuxtLink
            :to="`${blockExplorer}/address/${owner}`"
            target="_blank"
          >
            <Address :address="owner" />
          </NuxtLink>
        </dd>
      </template>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { Address } from 'viem'
import type { CollectionData } from '../composables/useCollection'

defineProps<{
  metadata: { name?: string; description?: string }
  collection?: CollectionData | null
  contract?: string
  owner?: Address | null
}>()

const {
  artifact: { details },
} = useAppConfig()
const blockExplorer = useBlockExplorer('mainnet')
</script>

<style scoped>
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
