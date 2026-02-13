<template>
  <div
    class="observation-marker"
    :class="{ pending, focused }"
    :style="{ left: `${x / 100}%`, top: `${y / 100}%` }"
  >
    <Popover
      v-model:open="isOpen"
      :side="popoverSide"
      :collision-padding="12"
      closable
      class="observation-popover"
    >
      <template #trigger>
        <button
          class="marker-dot"
          @click.stop="emit('select')"
        />
      </template>
      <slot />
    </Popover>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  x: number
  y: number
  pending?: boolean
  focused?: boolean
  open?: boolean
}>()

const emit = defineEmits<{
  select: []
  close: []
}>()

const isOpen = computed({
  get: () => props.open ?? false,
  set: (value) => {
    if (!value) emit('close')
  },
})

const popoverSide = computed(() => props.y < 3000 ? 'bottom' : 'top')
</script>

<style scoped>
.observation-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.marker-dot {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: 2px solid white;
  background: var(--color);
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.4),
    0 1px 3px rgb(0 0 0 / 0.3);

  &:hover {
    transform: scale(1.2);
  }

  .pending & {
    background: var(--accent, var(--color));
    animation: pulse 1.5s ease-in-out infinite;
  }

  .focused & {
    transform: scale(1.3);
    box-shadow:
      0 0 0 1px rgb(0 0 0 / 0.4),
      0 0 0 4px var(--accent, var(--color));
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>

<style>
.observation-popover {
  --popover-width: min(40rem, calc(100vw - 2 * var(--spacer)));
}
</style>
