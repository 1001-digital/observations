<template>
  <section class="observations">
    <h2>
      Observations <small v-if="count > 0n">({{ count }})</small>
    </h2>

    <Loading
      v-if="pending"
      spinner
    />
    <template v-else>
      <div
        v-if="observations.length"
        class="observation-list"
      >
        <div
          v-for="(obs, i) in observations"
          :key="i"
          class="observation"
        >
          <div class="observation-header">
            <Address :address="obs.observer" />
          </div>
          <p class="observation-note">{{ obs.note }}</p>
        </div>
      </div>
      <p
        v-else
        class="empty"
      >
        No observations yet.
      </p>
    </template>

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
        >
          <template #start="{ start }">
            <Actions>
              <Button
                @click="start"
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
  </section>
</template>

<script setup lang="ts">
import { writeContract } from '@wagmi/core'
import type { Address } from 'viem'
import type { Config } from '@wagmi/vue'
import { ObservationsAbi } from '../utils/observations'

const props = defineProps<{
  contract: Address
  tokenId: bigint
}>()

const { $wagmi } = useNuxtApp()
const config = useRuntimeConfig()
const contractAddress = config.public.observationsContract as Address

const { isConnected } = useConnection()

const { observations, count, pending, refresh } = useObservations(
  toRef(() => props.contract),
  toRef(() => props.tokenId),
)

const note = ref('')

const submitObservation = () =>
  writeContract($wagmi as Config, {
    address: contractAddress,
    abi: ObservationsAbi,
    functionName: 'observe',
    args: [props.contract, props.tokenId, note.value, 0, 0],
  })

const onComplete = () => {
  note.value = ''
  refresh()
}
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

.observation {
  display: grid;
  gap: var(--spacer-xs);

  .observation-header {
    font-size: var(--font-sm);
    color: var(--muted);
  }

  .observation-note {
    word-break: break-word;
    white-space: pre-wrap;
  }

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}

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
