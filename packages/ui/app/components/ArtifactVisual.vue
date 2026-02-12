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

<style scoped>
.artifact-visual {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;

  img {
    display: block;
    width: auto;
    height: auto;
    aspect-ratio: auto;
  }

  .artifact-visual-actions {
    position: absolute;
    bottom: var(--spacer-sm);
    right: var(--spacer-sm);
    z-index: 1;
  }
}
</style>
