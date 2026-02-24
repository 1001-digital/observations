<template>
  <EvmProfile v-if="isConnected" @disconnected="emit('disconnected')">
    <template #default="{ display, address }">
      <EvmAvatar :address="address" />
      <span>{{ display }}</span>
    </template>
  </EvmProfile>
  <EvmConnect v-else @connected="emit('connected')" />
</template>

<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import { EvmProfile, EvmAvatar, EvmConnect } from '@1001-digital/components'

const emit = defineEmits<{
  connected: []
  disconnected: []
}>()

const { isConnected } = useConnection()
</script>
