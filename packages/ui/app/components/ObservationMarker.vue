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
      :title="title"
      arrow
      closable
      class="observation-popover"
    >
      <template
        v-if="$slots.title"
        #title
      >
        <slot name="title" />
      </template>
      <template #trigger>
        <button
          class="marker-dot"
          @click.stop="emit('select')"
        />
      </template>
      <!-- <Button -->
      <!--   class="marker-popover-close" -->
      <!--   aria-label="Close" -->
      <!--   @click="emit('close')" -->
      <!-- > -->
      <!--   <Icon type="close" /> -->
      <!-- </Button> -->
      <slot />
    </Popover>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  x: number
  y: number
  title?: string
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
    if (!value && !props.pending) emit('close')
  },
})

const popoverSide = computed(() => (props.y < 3000 ? 'bottom' : 'top'))
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
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
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
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>

<style>
.observation-popover {
  --popover-width: min(24rem, calc(100vw - 2 * var(--spacer)));

  h1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacer);
  }

  h1 time {
    font-weight: normal;
    font-size: var(--font-sm);
    color: var(--muted);
    white-space: nowrap;
    text-transform: none;
    font-size: var(--font-xs);
  }

  .observation-note {
    word-break: break-word;
    white-space: pre-wrap;
  }

  .marker-popover-close {
    position: absolute !important;
    top: 0;
    right: 0;
  }
}
</style>
