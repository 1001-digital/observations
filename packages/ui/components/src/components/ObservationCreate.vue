<template>
  <div class="observation-form">
    <template v-if="isConnected">
      <FormTextarea
        v-model="note"
        :placeholder="
          editObservation
            ? 'Update your observation...'
            : isReply
              ? 'Write a reply...'
              : 'Leave an observation...'
        "
        :rows="3"
        :disabled="pending"
      />
      <TipSelect
        v-if="!editObservation && tipRecipient"
        v-model="tip"
      />
      <EvmTransactionFlow
        chain="sepolia"
        :request="submitObservation"
        :text="{
          title: {
            confirm: editObservation
              ? 'Update Observation'
              : isReply
                ? 'Submit Reply'
                : 'Submit Observation',
            requesting: editObservation
              ? 'Updating Observation'
              : isReply
                ? 'Submitting Reply'
                : 'Submitting Observation',
            waiting: editObservation
              ? 'Updating Observation'
              : isReply
                ? 'Submitting Reply'
                : 'Submitting Observation',
            complete: editObservation
              ? 'Observation Updated'
              : isReply
                ? 'Reply Submitted'
                : 'Observation Submitted',
            error: editObservation
              ? 'Update Failed'
              : isReply
                ? 'Reply Failed'
                : 'Submission Failed',
          },
          lead: {
            complete: editObservation
              ? 'Your observation has been updated onchain.'
              : isReply
                ? 'Your reply has been recorded onchain.'
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
              :disabled="pending || !note.trim()"
              >{{
                editObservation ? 'Update' : isReply ? 'Reply' : 'Observe'
              }}</Button
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
import { ref, computed, watch, defineModel } from 'vue'
import { writeContract } from '@wagmi/core'
import { type Address, zeroAddress } from 'viem'
import { useConfig, useConnection, type Config } from '@wagmi/vue'
import { Button, Actions, FormTextarea, EvmConnect, EvmTransactionFlow } from '@1001-digital/components'
import { ObservationsAbi, type ObservationData } from '../utils/observations'
import { useObservationsConfig } from '../utils/config'
import TipSelect from './TipSelect.vue'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  x?: number
  y?: number
  viewType?: number
  time?: number
  editObservation?: ObservationData | null
  parent?: bigint
  tipRecipient?: Address
}>()

const emit = defineEmits<{
  complete: []
  'cancel-edit': []
}>()

const wagmi = useConfig()
const obsConfig = useObservationsConfig()
const contractAddress = obsConfig.observationsContract

const { isConnected } = useConnection()

const pending = defineModel<boolean>('pending')

const note = ref('')
const tip = ref(0n)

const parentId = computed(() => {
  if (props.editObservation) return BigInt(props.editObservation.id)
  return props.parent ?? 0n
})

const isReply = computed(
  () => !props.editObservation && (props.parent ?? 0n) > 0n,
)

const isUpdate = computed(() => !!props.editObservation)

const effectiveX = computed(() => props.editObservation?.x ?? props.x ?? 0)
const effectiveY = computed(() => props.editObservation?.y ?? props.y ?? 0)
const effectiveViewType = computed(
  () => props.editObservation?.viewType ?? props.viewType ?? 0,
)
const effectiveTime = computed(
  () => props.editObservation?.time ?? props.time ?? 0,
)

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
const effectiveRecipient = computed(() =>
  tip.value > 0n ? (props.tipRecipient ?? zeroAddress) : zeroAddress,
)

const submitObservation = () => {
  return writeContract(wagmi, {
    address: contractAddress,
    abi: ObservationsAbi,
    functionName: 'observe',
    args: [
      props.contract,
      props.tokenId,
      parentId.value,
      isUpdate.value,
      note.value,
      effectiveX.value,
      effectiveY.value,
      effectiveViewType.value,
      effectiveTime.value,
      effectiveRecipient.value,
    ],
    value: tip.value,
  })
}

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
