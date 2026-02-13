<template>
  <span>{{ display }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  blockNumber: bigint
}>()

const chainId = useMainChainId()
const { data: currentBlock } = useBlockNumber({ chainId })

const display = computed(() => {
  if (!currentBlock.value) return `block ${props.blockNumber}`

  return formatBlockAge(props.blockNumber, currentBlock.value)
})
</script>
