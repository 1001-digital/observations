<template>
  <section class="observations">
    <h2>
      Observations <small v-if="displayCount > 0n">({{ displayCount }})</small>
    </h2>

    <ObservationCreate
      :contract="contract"
      :token-id="tokenId"
      @complete="onComplete"
    />

    <Loading
      v-if="displayPending"
      spinner
    />
    <template v-else>
      <div
        v-if="displayObservations.length"
        class="observation-list"
      >
        <div
          v-for="obs in displayObservations"
          :key="obs.id"
          ref="observationRefs"
          :class="{ focused: focusedId === obs.id }"
          @click="emit('focusObservation', obs.id)"
        >
          <Observation :observation="obs" show-location :has-both-views="hasBothViews" />
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
import type { Address } from 'viem'
import type { ObservationData } from '../utils/observations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  observations?: ObservationData[]
  count?: bigint
  externalPending?: boolean
  focusedId?: string | null
  hasBothViews?: boolean
}>()

const emit = defineEmits<{
  complete: []
  focusObservation: [id: string]
}>()

// Use external data when provided, otherwise fall back to internal fetch
const internal = props.observations
  ? null
  : useObservations(toRef(() => props.contract), toRef(() => props.tokenId))

const displayObservations = computed(() => [...(props.observations ?? internal?.observations.value ?? [])].reverse())
const displayCount = computed(() => props.count ?? internal?.count.value ?? 0n)
const displayPending = computed(() => props.externalPending ?? internal?.pending.value ?? false)

const onComplete = () => {
  internal?.refreshAndPoll()
  emit('complete')
}

const observationRefs = useTemplateRef<HTMLElement[]>('observationRefs')

watch(
  () => props.focusedId,
  (id) => {
    if (id == null) return
    const index = displayObservations.value.findIndex((obs) => obs.id === id)
    if (index < 0) return
    nextTick(() => {
      observationRefs.value?.[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  },
)
</script>

<style scoped>
.observations {
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

.observation-list {
  display: grid;
  gap: var(--spacer);
}

.focused {
  outline: 2px solid var(--accent, var(--color));
  outline-offset: var(--spacer-xs);
  border-radius: var(--spacer-xs);
}
</style>
