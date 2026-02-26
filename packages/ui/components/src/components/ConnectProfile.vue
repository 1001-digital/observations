<template>
  <EvmProfile v-if="isConnected" :class-name="className" @disconnected="emit('disconnected')">
    <template #default="{ display, address }">
      <EvmAvatar :address="address" />
      <span>{{ display }}</span>
    </template>
  </EvmProfile>
  <EvmConnect v-else :class-name="className" @connected="emit('connected')" />
</template>

<script setup lang="ts">
import { useConnection } from '@wagmi/vue'
import { EvmProfile, EvmAvatar, EvmConnect } from '@1001-digital/components'

defineProps<{
  className?: string
}>()

const emit = defineEmits<{
  connected: []
  disconnected: []
}>()

const { isConnected } = useConnection()
</script>
