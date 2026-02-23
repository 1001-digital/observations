<template>
  <EvmTransactionFlow
    chain="sepolia"
    ref="flowRef"
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
        confirm: observation.note,
        complete: 'Your observation has been deleted onchain.',
      },
      action: {
        confirm: 'Delete',
      },
    }"
    @complete="emit('complete')"
    @cancel="emit('cancel')"
  >
    <template #complete="{ cancel }">
      <Actions>
        <Button @click="cancel">Close</Button>
      </Actions>
    </template>
  </EvmTransactionFlow>
</template>

<script setup lang="ts">
import { writeContract } from '@wagmi/core'
import { type Address, zeroAddress } from 'viem'
import type { Config } from '@wagmi/vue'
import { ObservationsAbi, type ObservationData } from '../utils/observations'

const props = defineProps<{
  observation: ObservationData
  contract: Address
  tokenId: bigint
}>()

const emit = defineEmits<{
  complete: []
  cancel: []
}>()

const { $wagmi } = useNuxtApp()
const config = useRuntimeConfig()
const contractAddress = config.public.observationsContract as Address

const flowRef = ref<{ initializeRequest: () => Promise<unknown> }>()

const submitDelete = () => {
  const obs = props.observation
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
      obs.x,
      obs.y,
      obs.viewType,
      obs.time,
      zeroAddress,
    ],
  })
}

onMounted(() => {
  flowRef.value?.initializeRequest()
})
</script>
