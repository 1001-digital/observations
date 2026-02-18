<template>
  <div class="observation-detail">
    <a
      class="back-link"
      @click.prevent="emit('clearFocus')"
    >
      &larr; All observations
    </a>

    <a
      v-if="parentObservation"
      class="in-reply-to"
      @click.prevent="emit('focusObservation', parentObservation.id)"
    >
      in reply to
      &ldquo;{{ truncate(parentObservation.note) }}&rdquo;
      by <EvmAccount :address="parentObservation.observer" />
    </a>

    <ObservationCreate
      v-if="editingObservation"
      :contract="contract"
      :token-id="tokenId"
      :edit-observation="editingObservation"
      @complete="onComplete"
      @cancel-edit="editingObservation = null"
    />
    <Observation
      v-else
      :observation="focused"
      show-location
      :has-multiple-view-modes="hasMultipleViewModes"
      :expected-tip-recipient="focusedExpectedRecipient"
      :editable="isOwn"
      @edit="editingObservation = focused"
      @delete="deletingObservation = focused"
    />

    <div
      v-if="directResponses.length"
      class="observation-detail-responses"
    >
      <h3>{{ directResponses.length }} {{ directResponses.length === 1 ? 'reply' : 'replies' }}</h3>
      <div
        v-for="response in directResponses"
        :key="response.id"
        class="observation-detail-response"
        @click="emit('focusObservation', response.id)"
      >
        <Observation
          :observation="response"
          :has-multiple-view-modes="hasMultipleViewModes"
          :expected-tip-recipient="focused.observer"
          :response-count="countDirectResponses(response.id)"
        />
      </div>
    </div>

    <ObservationCreate
      :contract="contract"
      :token-id="tokenId"
      :parent="BigInt(focusedId)"
      :recipient="focused.observer"
      :x="focused.located ? focused.x : undefined"
      :y="focused.located ? focused.y : undefined"
      :view-type="focused.viewType"
      :time="focused.time"
      @complete="onComplete"
    />

    <ObservationDelete
      v-if="deletingObservation"
      :observation="deletingObservation"
      :contract="contract"
      :token-id="tokenId"
      @complete="onDeleteComplete"
      @cancel="deletingObservation = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem'
import type { ObservationData } from '../utils/observations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  recipient?: Address
  observations: ObservationData[]
  focusedId: string
  hasMultipleViewModes?: boolean
}>()

const emit = defineEmits<{
  focusObservation: [id: string]
  clearFocus: []
  complete: []
}>()

const { address } = useConnection()

const focused = computed(() =>
  props.observations.find((o) => o.id === props.focusedId)!,
)

const isOwn = computed(
  () =>
    !!address.value &&
    focused.value.observer.toLowerCase() === address.value.toLowerCase(),
)

const parentObservation = computed(() => {
  if (focused.value.parent === 0n) return null
  return props.observations.find(
    (o) => o.id === focused.value.parent.toString(),
  ) ?? null
})

const directResponses = computed(() =>
  props.observations.filter(
    (o) => o.parent.toString() === props.focusedId,
  ),
)

// Expected tip recipient for the focused observation:
// root → collection artist, reply → parent observer
const focusedExpectedRecipient = computed(() =>
  parentObservation.value?.observer ?? props.recipient,
)


function countDirectResponses(id: string): number {
  return props.observations.filter((o) => o.parent.toString() === id).length
}

const editingObservation = ref<ObservationData | null>(null)
const deletingObservation = ref<ObservationData | null>(null)

function onComplete() {
  editingObservation.value = null
  emit('complete')
}

function onDeleteComplete() {
  deletingObservation.value = null
  emit('clearFocus')
  emit('complete')
}

function truncate(text: string, max = 30): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '\u2026'
}
</script>

<style scoped>
.observation-detail {
  display: grid;
  gap: var(--spacer);
}

.back-link {
  font-size: var(--font-sm);
  color: var(--muted);
  cursor: pointer;

  &:hover {
    color: var(--foreground, inherit);
  }
}

.in-reply-to {
  font-size: var(--font-sm);
  color: var(--muted);
  cursor: pointer;

  &:hover {
    color: var(--foreground, inherit);
  }
}

.observation-detail-responses {
  display: grid;
  gap: var(--spacer);

  h3 {
    font-size: var(--font-sm);
    color: var(--muted);
    font-weight: normal;
  }
}

.observation-detail-response {
  cursor: pointer;
  padding-left: var(--spacer-sm);
  border-left: 2px solid var(--border-color, var(--muted));

  &:hover {
    border-left-color: var(--foreground, inherit);
  }
}
</style>
