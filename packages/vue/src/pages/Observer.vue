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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { isAddress } from 'viem'
import { Button, Loading } from '@1001-digital/components'
import {
  ObserverProfile,
  ObservationListItem,
  useObserverObservations,
  useObservationsConfig,
} from '@1001-digital/observations'
import { useEnsProfile } from '../composables/useEnsProfile'

const route = useRoute()
const id = route.params.id as string
const config = useObservationsConfig()

const isIndexerMode = computed(() => config.mode === 'indexer')

const { data: profile, pending: profilePending } = useEnsProfile(ref(id))

const observerAddress = computed(() => {
  if (isAddress(id)) return id
  return profile.value?.address || undefined
})

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
