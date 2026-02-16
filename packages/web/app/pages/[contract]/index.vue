<template>
  <main class="collection-overview">
    <section class="collection-header">
      <Loading v-if="collectionPending" spinner />
      <template v-else-if="collectionData">
        <img
          v-if="collectionImage"
          :src="collectionImage"
          :alt="collectionData.name"
          class="collection-image"
        />
        <div class="collection-info">
          <h1>{{ collectionData.name || shortAddress(contract) }}</h1>
          <p v-if="collectionData.description">{{ collectionData.description }}</p>
          <dl v-if="collectionData.owner" class="collection-meta">
            <dt>Artist</dt>
            <dd>
              <NuxtLink :to="`/observer/${collectionData.owner}`">
                <EvmAccount :address="collectionData.owner" />
              </NuxtLink>
            </dd>
          </dl>
        </div>
      </template>
    </section>

    <section class="collection-tokens">
      <h2>
        Tokens
        <small v-if="artifacts.length">({{ artifacts.length }})</small>
      </h2>

      <Loading v-if="pending" spinner />
      <div
        v-else-if="artifacts.length"
        class="token-grid"
      >
        <Artifact
          v-for="a in artifacts"
          :key="a.tokenId.toString()"
          :contract="contract"
          :token-id="a.tokenId"
        >
          <template #default="{ metadata, image }">
            <Card as="div">
              <ArtifactVisual
                :image="image"
                :name="metadata.name"
              />
              <header>
                <h3>{{ metadata.name || `#${a.tokenId}` }}</h3>
                <small>{{ a.count }} observation{{ a.count !== 1n ? 's' : '' }}</small>
              </header>
              <CardLink :to="`/${contract}/${a.tokenId}`">
                {{ metadata.name || `#${a.tokenId}` }}
              </CardLink>
            </Card>
          </template>
        </Artifact>
      </div>
      <p v-else class="empty">No tokens with observations yet.</p>
    </section>

    <section class="collection-timeline">
      <h2>Timeline</h2>

      <Loading v-if="pending" spinner />
      <div
        v-else-if="observations.length"
        class="timeline-list"
      >
        <ObservationListItem
          v-for="obs in observations"
          :key="`${obs.tokenId}-${obs.id}`"
          :observation="obs"
        >
          <template #link>
            <NuxtLink
              :to="`/${contract}/${obs.tokenId}#${obs.id}`"
              class="observation-list-item-link"
            >
              #{{ obs.tokenId }}
            </NuxtLink>
          </template>
        </ObservationListItem>
      </div>
      <p v-else class="empty">No observations yet.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Address } from 'viem'

const route = useRoute()
const contract = route.params.contract as Address

const { collection: collectionData, image: collectionImage, pending: collectionPending } = useCollection(ref(contract))
const { artifacts, observations, pending } = useCollectionObservations(ref(contract))
</script>

<style scoped>
.collection-overview {
  max-width: 64rem;
  margin: var(--spacer) auto;
  padding: var(--spacer);
  display: grid;
  gap: var(--spacer-lg);
}

.collection-header {
  display: flex;
  gap: var(--spacer);
  align-items: start;

  .collection-image {
    width: 6rem;
    height: 6rem;
    border-radius: var(--spacer-xs);
    object-fit: cover;
  }

  .collection-info {
    display: grid;
    gap: var(--spacer-xs);

    h1 {
      font-size: var(--font-xl);
    }

    p {
      color: var(--muted);
    }
  }

  .collection-meta {
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

.collection-tokens {
  display: grid;
  gap: var(--spacer);

  h2 {
    font-size: var(--font-lg);

    small {
      color: var(--muted);
      font-weight: normal;
    }
  }

  .empty {
    color: var(--muted);
  }
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: var(--spacer);

  header {
    display: grid;
    gap: var(--spacer-xs);
    padding: var(--spacer-sm) 0;

    h3 {
      font-size: var(--font-base);
    }

    small {
      color: var(--muted);
      font-size: var(--font-sm);
    }
  }
}

.collection-timeline {
  display: grid;
  gap: var(--spacer);

  h2 {
    font-size: var(--font-lg);
  }

  .empty {
    color: var(--muted);
  }
}

.timeline-list {
  display: grid;
  gap: var(--spacer);
}
</style>
