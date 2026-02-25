<template>
  <a
    v-if="isExternal"
    :href="(to as string)"
    :target="target"
  >
    <slot />
  </a>
  <RouterLink
    v-else
    :to="to!"
    :target="target"
  >
    <slot />
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  to?: string | Record<string, any>
  target?: string
}>()

const isExternal = computed(
  () => typeof props.to === 'string' && /^https?:\/\//.test(props.to),
)
</script>
