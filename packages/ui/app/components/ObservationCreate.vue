<template>
  <div class="observation-form">
    <template v-if="isConnected">
      <FormTextarea
        v-model="note"
        placeholder="Leave an observation..."
        :rows="3"
      />
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
            confirm: 'Leave your observation on this artifact.',
            complete: 'Your observation has been recorded onchain.',
          },
          action: {
            confirm: 'Submit',
          },
        }"
        @complete="onComplete"
        @cancel="pending = false"
      >
        <template #start="{ start }">
          <Actions>
            <Button
              @click.stop.prevent="pending = true; start()"
              :disabled="!note.trim()"
              >Observe</Button
            >
          </Actions>
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
import { ObservationsAbi } from '../utils/observations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
  x?: number
  y?: number
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

const located = computed(() => props.x != null && props.y != null)

const submitObservation = () =>
  writeContract($wagmi as Config, {
    address: contractAddress,
    abi: ObservationsAbi,
    functionName: located.value ? 'observeAt' : 'observe',
    args: located.value
      ? [props.contract, props.tokenId, note.value, props.x!, props.y!, 0, 0]
      : [props.contract, props.tokenId, note.value, 0, 0],
  })

const onComplete = () => {
  pending.value = false
  note.value = ''
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
