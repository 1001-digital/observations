<template>
  <div class="artifact-visual">
    <Embed v-if="animationUrl && showAnimation" :src="animationUrl" />
    <img v-else-if="image" :src="image" :alt="name" />
    <Actions v-if="animationUrl && image" class="artifact-visual-actions">
      <Button class="small" @click="showAnimation = !showAnimation">
        <Icon :type="showAnimation ? 'lucide:image' : 'lucide:play'" />
      </Button>
    </Actions>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  image: string
  animationUrl: string
  name?: string
}>()

const showAnimation = defineModel<boolean>('showAnimation', { default: false })
</script>

<style scoped>
.artifact-visual {
  position: relative;
  margin: auto;
  width: min(80cqh, 80cqw);
  height: min(80cqh, 80cqw);

  img {
    display: block;
    width: auto;
    height: auto;
    aspect-ratio: auto;
    image-rendering: pixelated;
  }

  :deep(.embed) {
    max-width: 80vw;
    max-height: 80vh;
  }

  .artifact-visual-actions {
    position: absolute;
    bottom: var(--spacer-sm);
    right: var(--spacer-sm);
    z-index: 1;
  }
}
</style>
