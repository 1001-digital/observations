<template>
  <a
    v-if="href"
    :href="href"
    :target="target ?? (isExternal ? '_blank' : undefined)"
  >
    <slot />
  </a>
  <span v-else>
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBlockExplorer } from '@1001-digital/components'

const props = defineProps<{
  to?: string | Record<string, any>
  target?: string
}>()

const blockExplorer = useBlockExplorer()

const isExternal = computed(
  () => typeof props.to === 'string' && /^https?:\/\//.test(props.to),
)

const href = computed(() => {
  if (typeof props.to !== 'string') return null
  if (isExternal.value) return props.to

  // Resolve internal address paths to block explorer
  const match = props.to.match(/^\/(?:observer\/)?(0x[a-fA-F0-9]{40})$/)
  if (match) return `${blockExplorer}/address/${match[1]}`

  return null
})
</script>
