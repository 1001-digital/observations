<template>
  <div class="observation-form">
    <template v-if="isConnected">
      <FormTextarea
        v-model="note"
        :placeholder="
          editObservation
            ? 'Update your observation...'
            : 'Leave an observation...'
        "
        :rows="3"
      />
      <TipSelect
        v-if="!editObservation"
        v-model="tip"
      />
      <EvmTransactionFlow
        :request="submitObservation"
        :text="{
          title: {
            confirm: editObservation
              ? 'Update Observation'
              : 'Submit Observation',
            requesting: editObservation
              ? 'Updating Observation'
              : 'Submitting Observation',
            waiting: editObservation
              ? 'Updating Observation'
              : 'Submitting Observation',
            complete: editObservation
              ? 'Observation Updated'
              : 'Observation Submitted',
            error: editObservation ? 'Update Failed' : 'Submission Failed',
          },
          lead: {
            complete: editObservation
              ? 'Your observation has been updated onchain.'
              : 'Your observation has been recorded onchain.',
          },
          action: {
            confirm: editObservation ? 'Update' : 'Submit',
          },
        }"
        skip-confirmation
        @complete="onComplete"
        @cancel="pending = false"
      >
        <template #start="{ start }">
          <Actions>
            <Button
              v-if="editObservation"
              @click.stop.prevent="emit('cancel-edit')"
              >Cancel</Button
            >
            <Button
              @click.stop.prevent="() => triggerTransactionFlow(start)"
              :disabled="!note.trim()"
              >{{ editObservation ? 'Update' : 'Observe' }}</Button
            >
          </Actions>
        </template>
        <template #confirm>
          <p class="observation-note">{{ note }}</p>
        </template>
        <template #complete="{ cancel }">
          <Actions>
            <Button @click="cancel">Close</Button>
          </Actions>
        </template>
      </EvmTransactionFlow>
    </template>
    <EvmConnect v-else />
  </div>
</template>

<script setup lang="ts">
import { writeContract } from '@wagmi/core'
import type { Address } from 'viem'
import type { Config } from '@wagmi/vue'
import { ObservationsAbi, type ObservationData } from '../utils/observations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  x?: number
  y?: number
  viewType?: number
  time?: number
  editObservation?: ObservationData | null
}>()

const emit = defineEmits<{
  complete: []
  'cancel-edit': []
}>()

const { $wagmi } = useNuxtApp()
const config = useRuntimeConfig()
const contractAddress = config.public.observationsContract as Address

const { isConnected } = useConnection()

const pending = defineModel<boolean>('pending')

const note = ref('')
const tip = ref(0n)

const located = computed(() => {
  if (props.editObservation) return props.editObservation.located
  return props.x != null && props.y != null
})

const parentId = computed(() =>
  props.editObservation ? BigInt(props.editObservation.id) : 0n,
)

const isUpdate = computed(() => !!props.editObservation)

const effectiveX = computed(() => props.editObservation?.x ?? props.x ?? 0)
const effectiveY = computed(() => props.editObservation?.y ?? props.y ?? 0)
const effectiveViewType = computed(() => props.editObservation?.viewType ?? props.viewType ?? 0)
const effectiveTime = computed(() => props.editObservation?.time ?? props.time ?? 0)

watch(
  () => props.editObservation,
  (obs) => {
    note.value = obs?.note ?? ''
    tip.value = 0n
  },
  { immediate: true },
)

const triggerTransactionFlow = (cb: Function) => {
  pending.value = true
  cb()
}
const submitObservation = () =>
  writeContract($wagmi as Config, {
    address: contractAddress,
    abi: ObservationsAbi,
    functionName: located.value ? 'observeAt' : 'observe',
    args: located.value
      ? [
          props.contract,
          props.tokenId,
          parentId.value,
          isUpdate.value,
          note.value,
          effectiveX.value,
          effectiveY.value,
          effectiveViewType.value,
          effectiveTime.value,
        ]
      : [
          props.contract,
          props.tokenId,
          parentId.value,
          isUpdate.value,
          note.value,
          effectiveViewType.value,
          effectiveTime.value,
        ],
    value: tip.value,
  })

const onComplete = () => {
  pending.value = false
  note.value = ''
  tip.value = 0n
  emit('complete')
}
</script>

<style scoped>
.observation-form {
  display: grid;
  gap: var(--spacer-sm);

  textarea {
    width: 100%;
    padding: var(--spacer);

    &::placeholder {
      color: var(--muted);
    }
  }
}
</style>
