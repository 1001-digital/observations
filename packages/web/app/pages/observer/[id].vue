<template>
  <main class="observer-page">
    <Loading v-if="profilePending" spinner />
    <template v-else-if="profile">
      <ObserverProfile
        :profile="profile"
        :total-count="totalCount"
        :total-tips="totalTips"
      />

      <section class="observer-timeline">
        <h2>Observations</h2>

        <Loading v-if="pending" spinner />
        <template v-else>
          <div
            v-if="observations.length"
            class="observer-timeline-list"
          >
            <ObservationListItem
              v-for="obs in observations"
              :key="`${obs.collection}-${obs.tokenId}-${obs.id}`"
              :observation="obs"
              hide-observer
              :show-artifact-preview="isIndexerMode"
            />
          </div>
          <p v-else class="empty">No observations yet.</p>

          <Button
            v-if="hasMore"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load more' }}
          </Button>
        </template>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { isAddress } from 'viem'

const route = useRoute()
const id = route.params.id as string
const appConfig = useAppConfig()

const isIndexerMode = computed(() => (appConfig as any).observations?.mode === 'indexer')

const observerAddress = computed(() => {
  if (isAddress(id)) return id
  return profile.value?.address || undefined
})

const { data: profile, pending: profilePending } = useEnsProfile(ref(id))

const {
  observations,
  totalCount,
  totalTips,
  pending,
  hasMore,
  loadingMore,
  loadMore,
} = useObserverObservations(observerAddress)
</script>

<style scoped>
.observer-page {
  max-width: 64rem;
  margin: var(--spacer) auto;
  padding: var(--spacer);
  display: grid;
  gap: var(--spacer-lg);
}

.observer-timeline {
  display: grid;
  gap: var(--spacer);

  h2 {
    font-size: var(--font-lg);
  }

  .empty {
    color: var(--muted);
  }
}

.observer-timeline-list {
  display: grid;
  gap: var(--spacer);
}
</style>
