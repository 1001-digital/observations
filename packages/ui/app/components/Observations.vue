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
        v-if="threads.length"
        class="observation-list"
      >
        <div
          v-for="thread in threads"
          :key="thread.observation.id"
          class="observation-thread"
        >
          <div
            :ref="
              (el) =>
                setObservationRef(thread.observation.id, el as HTMLElement)
            "
            :class="{ focused: focusedId === thread.observation.id }"
            @click="emit('focusObservation', thread.observation.id)"
          >
            <ObservationCreate
              v-if="editingObservation?.id === thread.observation.id"
              :contract="contract"
              :token-id="tokenId"
              :edit-observation="editingObservation"
              @complete="onComplete"
              @cancel-edit="cancelEdit"
            />
            <Observation
              v-else
              :observation="thread.observation"
              show-location
              :has-multiple-view-modes="hasMultipleViewModes"
              :editable="isOwnObservation(thread.observation)"
              :response-count="thread.responses.length"
              :replies-expanded="expandedThreads.has(thread.observation.id)"
              :can-reply="
                isConnected &&
                !editingObservation &&
                replyingTo !== thread.observation.id
              "
              @edit="startEdit(thread.observation)"
              @delete="startDelete(thread.observation)"
              @reply="startReply(thread.observation.id)"
              @toggle-replies="toggleReplies(thread.observation.id)"
            />
          </div>

          <div
            v-if="thread.responses.length && expandedThreads.has(thread.observation.id)"
            class="observation-responses"
          >
            <div
              v-for="response in thread.responses"
              :key="response.id"
              :ref="(el) => setObservationRef(response.id, el as HTMLElement)"
              :class="{ focused: focusedId === response.id }"
              @click="emit('focusObservation', response.id)"
            >
              <ObservationCreate
                v-if="editingObservation?.id === response.id"
                :contract="contract"
                :token-id="tokenId"
                :edit-observation="editingObservation"
                @complete="onComplete"
                @cancel-edit="cancelEdit"
              />
              <Observation
                v-else
                :observation="response"
                show-location
                :has-multiple-view-modes="hasMultipleViewModes"
                :editable="isOwnObservation(response)"
                @edit="startEdit(response)"
                @delete="startDelete(response)"
              />
            </div>
          </div>

          <div
            v-if="replyingTo === thread.observation.id"
            class="observation-reply-form"
          >
            <ObservationCreate
              :contract="contract"
              :token-id="tokenId"
              :parent="BigInt(thread.observation.id)"
              :x="thread.observation.located ? thread.observation.x : undefined"
              :y="thread.observation.located ? thread.observation.y : undefined"
              :view-type="thread.observation.viewType"
              :time="thread.observation.time"
              @complete="onReplyComplete"
            />
          </div>
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
      ref="deleteFlowRef"
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

interface ObservationThread {
  observation: ObservationData
  responses: ObservationData[]
}

const props = defineProps<{
  contract: Address
  tokenId: bigint
  observations?: ObservationData[]
  count?: bigint
  externalPending?: boolean
  focusedId?: string | null
  hasMultipleViewModes?: boolean
}>()

const emit = defineEmits<{
  complete: []
  focusObservation: [id: string]
}>()

const { $wagmi } = useNuxtApp()
const config = useRuntimeConfig()
const contractAddress = config.public.observationsContract as Address
const { address, isConnected } = useConnection()

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

// Threading: group observations into threads
const threads = computed<ObservationThread[]>(() => {
  const obs = allObservations.value
  const topLevel = obs.filter((o) => o.parent === 0n)
  const topLevelIds = new Set(topLevel.map((o) => o.id))

  // Group responses by parent ID
  const responsesByParent = new Map<string, ObservationData[]>()
  for (const o of obs) {
    if (o.parent !== 0n) {
      const parentKey = o.parent.toString()
      if (topLevelIds.has(parentKey)) {
        const list = responsesByParent.get(parentKey) ?? []
        list.push(o)
        responsesByParent.set(parentKey, list)
      } else {
        // Orphan — treat as top-level
        topLevel.push(o)
        topLevelIds.add(o.id)
      }
    }
  }

  // Top-level reversed (newest first), responses chronological (oldest first)
  return [...topLevel].reverse().map((o) => ({
    observation: o,
    responses: responsesByParent.get(o.id) ?? [],
  }))
})

const replyingTo = ref<string | null>(null)
const expandedThreads = ref<Set<string>>(new Set())

const editingObservation = ref<ObservationData | null>(null)
const deletingObservation = ref<ObservationData | null>(null)
const deleteFlowRef = ref<{ initializeRequest: () => Promise<unknown> }>()

function isOwnObservation(obs: ObservationData): boolean {
  return (
    !!address.value &&
    obs.observer.toLowerCase() === address.value.toLowerCase()
  )
}

function startEdit(obs: ObservationData) {
  replyingTo.value = null
  editingObservation.value = obs
}

function cancelEdit() {
  editingObservation.value = null
}

function toggleReplies(id: string) {
  if (expandedThreads.value.has(id)) {
    expandedThreads.value.delete(id)
  } else {
    expandedThreads.value.add(id)
  }
}

function startReply(id: string) {
  replyingTo.value = replyingTo.value === id ? null : id
  if (replyingTo.value) expandedThreads.value.add(id)
}

function startDelete(obs: ObservationData) {
  deletingObservation.value = obs
  nextTick(() => {
    deleteFlowRef.value?.initializeRequest()
  })
}

const submitDelete = () => {
  const obs = deletingObservation.value!
  return writeContract($wagmi as Config, {
    address: contractAddress,
    abi: ObservationsAbi,
    functionName: obs.located ? 'observeAt' : 'observe',
    args: obs.located
      ? [
          props.contract,
          props.tokenId,
          BigInt(obs.id),
          true,
          '',
          obs.x,
          obs.y,
          obs.viewType,
          obs.time,
        ]
      : [
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

const onReplyComplete = () => {
  replyingTo.value = null
  internal?.refreshAndPoll()
  emit('complete')
}

// Map-based ref tracking for scroll-to
const observationRefMap = new Map<string, HTMLElement>()

function setObservationRef(id: string, el: HTMLElement | null) {
  if (el) {
    observationRefMap.set(id, el)
  } else {
    observationRefMap.delete(id)
  }
}

watch(
  [() => props.focusedId, threads],
  ([id]) => {
    if (id == null) return

    // Auto-expand thread if focusing a reply (e.g. from URI hash)
    const thread = threads.value.find((t) =>
      t.responses.some((r) => r.id === id),
    )
    if (thread) expandedThreads.value.add(thread.observation.id)

    nextTick(() => {
      observationRefMap
        .get(id)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  },
  { immediate: true },
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

.observation-thread:not(:last-child) {
  padding-bottom: var(--spacer);
  border-bottom: var(--border);
}

.observation-responses {
  margin-left: var(--spacer-sm);
  padding-left: var(--spacer);
  border-left: 2px solid var(--border-color, var(--muted));
  display: grid;
  gap: var(--spacer);
  margin-top: var(--spacer);
}

.observation-reply-form {
  margin-top: var(--spacer);
}

.focused {
  outline: 2px solid var(--accent, var(--color));
  outline-offset: var(--spacer-xs);
  border-radius: var(--spacer-xs);
}
</style>
