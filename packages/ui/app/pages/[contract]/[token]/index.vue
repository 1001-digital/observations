<template>
  <Artifact :contract="contract" :token-id="tokenId" />
</template>

<script setup lang="ts">
import type { Address } from 'viem'

const route = useRoute()

const contract = computed(() => route.params.contract as Address)
const tokenId = computed(() => BigInt(route.params.token as string))
</script>
