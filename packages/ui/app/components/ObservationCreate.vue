<template>
  <div class="observation-form">
    <template v-if="isConnected">
      <FormTextarea
        v-model="note"
        placeholder="Leave an observation..."
        :rows="3"
      />
      <FormItem>
        <input
          v-model="tipInput"
          type="number"
          step="0.001"
          min="0"
          placeholder="0"
          label="Tip (ETH)"
        />
        <template #suffix> ETH </template>
      </FormItem>
      <EvmTransactionFlow
        :request="submitObservation"
        :text="{
          title: {
            confirm: 'Submit Observation',
            requesting: 'Submitting Observation',
            waiting: 'Submitting Observation',
            complete: 'Observation Submitted',
            error: 'Submission Failed',
          },
          lead: {
            complete: 'Your observation has been recorded onchain.',
          },
          action: {
            confirm: 'Submit',
          },
        }"
        skip-confirmation
        @complete="onComplete"
        @cancel="pending = false"
      >
        <template #start="{ start }">
          <Actions>
            <Button
              @click.stop.prevent="() => triggerTransactionFlow(start)"
              :disabled="!note.trim()"
              >Observe</Button
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
import { parseEther, type Address } from 'viem'
import type { Config } from '@wagmi/vue'
import { ObservationsAbi } from '../utils/observations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  x?: number
  y?: number
  viewType?: number
  time?: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const { $wagmi } = useNuxtApp()
const config = useRuntimeConfig()
const contractAddress = config.public.observationsContract as Address

const { isConnected } = useConnection()

const pending = defineModel<boolean>('pending')

const note = ref('')
const tipInput = ref('')

const tipValue = computed(() => {
  const v = parseFloat(tipInput.value)
  if (!v || v <= 0) return 0n
  return parseEther(String(tipInput.value))
})

const located = computed(() => props.x != null && props.y != null)

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
          0n,
          false,
          note.value,
          props.x!,
          props.y!,
          props.viewType ?? 0,
          props.time ?? 0,
        ]
      : [
          props.contract,
          props.tokenId,
          0n,
          false,
          note.value,
          props.viewType ?? 0,
          props.time ?? 0,
        ],
    value: tipValue.value,
  })

const onComplete = () => {
  pending.value = false
  note.value = ''
  tipInput.value = ''
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
