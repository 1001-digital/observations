<template>
  <div class="artifact-visual">
    <Embed
      v-if="animationUrl && showAnimation"
      :src="animationUrl"
    />
    <img
      v-else-if="image"
      :src="image"
      :alt="name"
    />
    <Actions
      v-if="animationUrl && image"
      class="artifact-visual-actions"
    >
      <Button
        class="small"
        @click="showAnimation = !showAnimation"
      >
        <Icon :type="showAnimation ? 'lucide:image' : 'lucide:play'" />
      </Button>
    </Actions>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image: string
  animationUrl?: string
  name?: string
}>()

const showAnimation = defineModel<boolean>('showAnimation', { default: false })
</script>

<style>
:root {
  --artifact-shadow-inset: 10%;
  --artifact-shadow-color: var(--color);
  --artifact-shadow-blur: 5rem;
  --artifact-shadow-opacity: 0.25;
}
</style>

<style scoped>
.artifact-visual {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;

  img,
  :deep(.embed) {
    border: var(--border);
    z-index: 1;
  }

  img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: auto;
  }

  &::before {
    content: '';
    position: absolute;
    inset: var(--artifact-shadow-inset);
    background: var(--artifact-shadow-color);
    filter: blur(var(--artifact-shadow-blur));
    opacity: var(--artifact-shadow-opacity);
    z-index: 0;
    height: 80%;
    top: 40%;
    border-radius: 20%;
  }

  .artifact-visual-actions {
    position: absolute;
    bottom: var(--spacer-sm);
    right: var(--spacer-sm);
    z-index: 3;
  }
}
</style>
