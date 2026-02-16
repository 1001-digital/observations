<template>
  <section class="observations">
    <h2>
      Observations <small v-if="displayCount > 0n">({{ displayCount }})</small>
    </h2>

    <ObservationCreate
      ref="createFormRef"
      :contract="contract"
      :token-id="tokenId"
      :edit-observation="editingObservation"
      @complete="onComplete"
      @cancel-edit="cancelEdit"
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
          <Observation
            :observation="obs"
            show-location
            :has-both-views="hasBothViews"
            :editable="isOwnObservation(obs)"
            @edit="startEdit(obs)"
            @delete="startDelete(obs)"
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

    <EvmTransactionFlow
      v-if="deletingObservation"
      :request="submitDelete"
      :text="{
        title: {
          confirm: 'Delete Observation',
          requesting: 'Deleting Observation',
          waiting: 'Deleting Observation',
          complete: 'Observation Deleted',
          error: 'Deletion Failed',
        },
        lead: {
          confirm: deletingObservation.note,
          complete: 'Your observation has been deleted onchain.',
        },
        action: {
          confirm: 'Delete',
        },
      }"
      @complete="onDeleteComplete"
      @cancel="deletingObservation = null"
    >
      <template #complete="{ cancel }">
        <Actions>
          <Button @click="cancel">Close</Button>
        </Actions>
      </template>
    </EvmTransactionFlow>
  </section>
</template>

<script setup lang="ts">
import { writeContract } from '@wagmi/core'
import type { Address } from 'viem'
import type { Config } from '@wagmi/vue'
import { ObservationsAbi, type ObservationData } from '../utils/observations'

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

const { $wagmi } = useNuxtApp()
const config = useRuntimeConfig()
const contractAddress = config.public.observationsContract as Address
const { address } = useConnection()

// Use external data when provided, otherwise fall back to internal fetch
const internal = props.observations
  ? null
  : useObservations(toRef(() => props.contract), toRef(() => props.tokenId))

const displayObservations = computed(() => [...(props.observations ?? internal?.observations.value ?? [])].reverse())
const displayCount = computed(() => props.count ?? internal?.count.value ?? 0n)
const displayPending = computed(() => props.externalPending ?? internal?.pending.value ?? false)

const editingObservation = ref<ObservationData | null>(null)
const deletingObservation = ref<ObservationData | null>(null)
const createFormRef = ref<HTMLElement>()

function isOwnObservation(obs: ObservationData): boolean {
  return !!address.value && obs.observer.toLowerCase() === address.value.toLowerCase()
}

function startEdit(obs: ObservationData) {
  editingObservation.value = obs
  nextTick(() => {
    createFormRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })
}

function cancelEdit() {
  editingObservation.value = null
}

function startDelete(obs: ObservationData) {
  deletingObservation.value = obs
}

const submitDelete = () => {
  const obs = deletingObservation.value!
  return writeContract($wagmi as Config, {
    address: contractAddress,
    abi: ObservationsAbi,
    functionName: 'observe',
    args: [
      props.contract,
      props.tokenId,
      BigInt(obs.id),
      true,
      '',
      obs.viewType,
      obs.time,
    ],
  })
}

const onDeleteComplete = () => {
  deletingObservation.value = null
  internal?.refreshAndPoll()
  emit('complete')
}

const onComplete = () => {
  editingObservation.value = null
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
