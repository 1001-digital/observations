<template>
  <span>{{ display }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  blockNumber: bigint
}>()

const { data: currentBlock } = useBlockNumber()

const display = computed(() => {
  if (!currentBlock.value) return `block ${props.blockNumber}`

  const diff = currentBlock.value - props.blockNumber
  if (diff <= 0n) return 'this block'
  if (diff === 1n) return '1 block ago'
  return `${diff} blocks ago`
})
</script>
