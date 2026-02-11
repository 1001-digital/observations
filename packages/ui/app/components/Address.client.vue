<template>
  <span>{{ display }}</span>
</template>

<script setup lang="ts">
import type { Address } from 'viem'
import { useEnsName } from '@wagmi/vue'

const props = withDefaults(
  defineProps<{
    address: Address
    ens?: boolean
    shorten?: boolean
  }>(),
  {
    ens: true,
    shorten: true,
  },
)

const address = computed(() => props.address)

const { data: ensName } = useEnsName({
  address,
  chainId: 1,
  query: { enabled: computed(() => props.ens) },
})

const display = computed(() => {
  if (ensName.value) return ensName.value
  if (props.shorten) return shortAddress(props.address)
  return props.address
})
</script>
