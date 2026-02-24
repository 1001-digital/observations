<template>
  <Tooltip v-if="currentBlock">
    <template #trigger>
      <span>{{ blocksAgo }}</span>
    </template>
    {{ timeAgo }}
  </Tooltip>
  <span v-else>block {{ blockNumber }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlockNumber } from '@wagmi/vue'
import { useMainChainId, formatNumber } from '@1001-digital/components'
import { formatBlockAge } from '../utils/time'

const props = defineProps<{
  blockNumber: bigint
}>()

const chainId = useMainChainId()
const { data: currentBlock } = useBlockNumber({ chainId })

const blocksAgo = computed(() => {
  const diff = Number(currentBlock.value! - props.blockNumber)
  return `${formatNumber(diff)} blocks ago`
})

const timeAgo = computed(() => formatBlockAge(props.blockNumber, currentBlock.value!))
</script>
