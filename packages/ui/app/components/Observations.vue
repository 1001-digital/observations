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
          v-for="(obs, i) in displayObservations"
          :key="i"
          ref="observationRefs"
          :class="{ focused: focusedIndex === i }"
          @click="emit('focusObservation', i)"
        >
          <Observation :observation="obs" show-location />
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
import type { ObservationData } from '../composables/useObservations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  observations?: ObservationData[]
  count?: bigint
  externalPending?: boolean
  focusedIndex?: number | null
}>()

const emit = defineEmits<{
  complete: []
  focusObservation: [index: number]
}>()

// Use external data when provided, otherwise fall back to internal fetch
const internal = props.observations
  ? null
  : useObservations(toRef(() => props.contract), toRef(() => props.tokenId))

const displayObservations = computed(() => props.observations ?? internal?.observations.value ?? [])
const displayCount = computed(() => props.count ?? internal?.count.value ?? 0n)
const displayPending = computed(() => props.externalPending ?? internal?.pending.value ?? false)

const onComplete = () => {
  internal?.refresh()
  emit('complete')
}

const observationRefs = useTemplateRef<HTMLElement[]>('observationRefs')

watch(
  () => props.focusedIndex,
  (index) => {
    if (index == null) return
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
