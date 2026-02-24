<template>
  <div
    class="embed"
    :class="{ playable: isPlayable }"
    @touchmove.stop.prevent="() => null"
  >
    <video
      v-if="isPlayable"
      autoplay
      muted
      playsinline
      loop
      controls
      crossorigin="anonymous"
    >
      <source
        :src="src"
        :type="mediaType"
      />
      Your browser does not support the video tag.
    </video>
    <iframe
      v-else
      ref="frame"
      frameborder="0"
      :src="src"
      sandbox="allow-scripts"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, watch, nextTick } from 'vue'
import { useWindowSize } from '@vueuse/core'

async function fetchMediaType(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { method: 'HEAD' })

    if (!response.ok) return undefined

    const contentType = response.headers.get('Content-Type')
    return contentType ? contentType.split(';')[0] : undefined
  } catch (error) {
    console.error(`Error fetching media type: ${error}`)
    return undefined
  }
}

const props = defineProps<{
  src: string
}>()

const src = ref(props.src)
const mediaType = ref<string>()
const isPlayable = computed(() => {
  if (!mediaType.value) return false
  return document.createElement('video').canPlayType(mediaType.value) !== ''
})

watchEffect(async () => {
  src.value = props.src
  mediaType.value = await fetchMediaType(src.value)
})

// Force reload on resize
const { width } = useWindowSize()
watch(width, () => {
  src.value = ''

  nextTick(() => {
    src.value = props.src
  })
})
</script>

<style scoped>
.embed {
  position: relative;
  touch-action: none;
  overflow: hidden;
  aspect-ratio: 1;
  width: 100cqw;

  &.playable {
    aspect-ratio: auto;
  }

  video {
    display: block;
    width: 100%;
    height: auto;
  }

  iframe {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    pointer-events: all;
  }
}
</style>
