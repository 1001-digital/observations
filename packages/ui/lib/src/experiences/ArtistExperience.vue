<template>
  <div class="artist-experience">
    <div class="config-bar">
      <label>
        Address / ENS
        <input v-model="addressInput" type="text" placeholder="0x... or name.eth" />
      </label>
      <button @click="load">Load</button>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAddress } from 'viem'
import { Button, Loading } from '@1001-digital/components'
import {
  ObserverProfile,
  ObservationListItem,
  useObserverObservations,
  useObservationsConfig,
} from '@1001-digital/observations-components'
import { useEnsProfile } from '../composables/useEnsProfile'
import { defaultObserver } from '../defaults'

const route = useRoute()
const router = useRouter()
const config = useObservationsConfig()

const activeAddress = ref(
  (route.query.address as string) || defaultObserver,
)

const addressInput = ref(activeAddress.value)

const load = () => {
  activeAddress.value = addressInput.value
  router.replace({ query: { address: addressInput.value } })
}

const isIndexerMode = computed(() => config.mode === 'indexer')

const { data: profile, pending: profilePending } = useEnsProfile(activeAddress)

const observerAddress = computed(() => {
  if (isAddress(activeAddress.value)) return activeAddress.value
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
.config-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--spacer-sm);
  padding: var(--spacer-sm) var(--spacer);
  border-bottom: var(--border);
  background: var(--gray-z-1);
  font-size: var(--font-sm);

  label {
    display: grid;
    gap: 2px;
    font-weight: 600;
  }

  input {
    font: inherit;
    padding: var(--spacer-xs) var(--spacer-sm);
    border: var(--border);
    border-radius: var(--spacer-xs);
    width: 26ch;
    min-width: 0;
  }

  button {
    font: inherit;
    padding: var(--spacer-xs) var(--spacer);
    border: var(--border);
    border-radius: var(--spacer-xs);
    background: var(--gray-z-2);
    cursor: pointer;

    &:hover {
      background: var(--gray-z-3);
    }
  }
}

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
