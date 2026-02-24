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
import { ref, onMounted } from 'vue'
import { writeContract } from '@wagmi/core'
import { type Address, zeroAddress } from 'viem'
import { useConfig } from '@wagmi/vue'
import { Button, Actions, EvmTransactionFlow } from '@1001-digital/components'
import { ObservationsAbi, type ObservationData } from '../utils/observations'
import { useObservationsConfig } from '../utils/config'

const props = defineProps<{
  observation: ObservationData
  contract: Address
  tokenId: bigint
}>()

const emit = defineEmits<{
  complete: []
  cancel: []
}>()

const wagmi = useConfig()
const obsConfig = useObservationsConfig()
const contractAddress = obsConfig.observationsContract

const flowRef = ref<{ initializeRequest: () => Promise<unknown> }>()

const submitDelete = () => {
  const obs = props.observation
  return writeContract(wagmi, {
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
