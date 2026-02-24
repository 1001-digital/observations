<template>
  <section class="observations">
    <h2>
      Observations <small v-if="displayCount > 0n">({{ displayCount }})</small>
    </h2>

    <ObservationCreate
      :contract="contract"
      :token-id="tokenId"
      :tip-recipient="tipRecipient"
      :view-type="viewType"
      @complete="onComplete"
    />

    <Loading
      v-if="displayPending"
      spinner
    />
    <template v-else>
      <div
        v-if="threads.length"
        class="observation-list"
      >
        <div
          v-for="thread in threads"
          :key="thread.observation.id"
          class="observation-thread"
          @click="emit('focusObservation', thread.observation.id)"
        >
          <Observation
            :observation="thread.observation"
            show-location
            :has-multiple-view-modes="hasMultipleViewModes"
            :expected-tip-recipient="tipRecipient"
            :response-count="thread.responses.length"
          />
        </div>
      </div>
      <p
        v-else
        class="empty"
      >
        No observations yet.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { Address } from 'viem'
import { Loading } from '@1001-digital/components'
import type { ObservationData } from '../utils/observations'
import { useObservations } from '../composables/useObservations'

interface ObservationThread {
  observation: ObservationData
  responses: ObservationData[]
}

const props = defineProps<{
  contract: Address
  tokenId: bigint
  tipRecipient?: Address
  observations?: ObservationData[]
  count?: bigint
  externalPending?: boolean
  hasMultipleViewModes?: boolean
  viewType?: number
}>()

const emit = defineEmits<{
  complete: []
  focusObservation: [id: string]
}>()

// Use external data when provided, otherwise fall back to internal fetch
const internal = props.observations
  ? null
  : useObservations(
      toRef(() => props.contract),
      toRef(() => props.tokenId),
    )

const allObservations = computed(
  () => props.observations ?? internal?.observations.value ?? [],
)
const displayCount = computed(() => props.count ?? internal?.count.value ?? 0n)
const displayPending = computed(
  () => props.externalPending ?? internal?.pending.value ?? false,
)

// Threading: group observations into threads (root observations only)
const threads = computed<ObservationThread[]>(() => {
  const obs = allObservations.value
  const rootObs = obs.filter((o) => o.parent === 0n)

  // Count all descendants per root
  const responsesByRoot = new Map<string, ObservationData[]>()
  for (const o of obs) {
    if (o.parent !== 0n) {
      // Walk parent chain to find root
      let parentId = o.parent.toString()
      const seen = new Set<string>()
      while (parentId !== '0') {
        if (seen.has(parentId)) break
        seen.add(parentId)
        const parent = obs.find((p) => p.id === parentId)
        if (!parent || parent.parent === 0n) break
        parentId = parent.parent.toString()
      }
      const list = responsesByRoot.get(parentId) ?? []
      list.push(o)
      responsesByRoot.set(parentId, list)
    }
  }

  return [...rootObs].reverse().map((o) => ({
    observation: o,
    responses: responsesByRoot.get(o.id) ?? [],
  }))
})

function onComplete() {
  internal?.refreshAndPoll()
  emit('complete')
}
</script>

<style scoped>
.observations {
  display: grid;
  gap: var(--spacer);
  min-height: 10rem;

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

.observation-list {
  display: grid;
  gap: var(--spacer);
}

.observation-thread {
  display: grid;
  gap: var(--spacer);
  cursor: pointer;

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
