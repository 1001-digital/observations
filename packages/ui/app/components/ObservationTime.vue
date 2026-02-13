<template>
  <time :datetime="iso">{{ ago }}</time>
</template>

<script setup lang="ts">
const props = defineProps<{
  timestamp: bigint
}>()

const iso = computed(() => new Date(Number(props.timestamp) * 1000).toISOString())
const ago = useSecondsAgo(iso)
</script>
