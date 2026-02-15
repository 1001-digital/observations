<template>
  <div class="tip-select">
    <Button v-if="!active" class="tertiary small" @click="activate">
      Add tip
    </Button>
    <FormInputGroup v-else>
      <Button class="small" @click="double" title="Double tip">
        {{ formatted }} ETH
      </Button>
      <Button class="muted small" @click="clear">&times;</Button>
    </FormInputGroup>
  </div>
</template>

<script setup lang="ts">
import { parseEther } from 'viem'

const BASE = 0.001

const model = defineModel<bigint>({ default: 0n })

const level = ref(-1)
const active = computed(() => level.value >= 0)

const ethAmount = () => BASE * Math.pow(2, level.value)

const formatted = computed(() => {
  if (!active.value) return ''
  return String(ethAmount())
})

const activate = () => {
  level.value = 0
  model.value = parseEther(String(ethAmount()))
}

const double = () => {
  level.value++
  model.value = parseEther(String(ethAmount()))
}

const clear = () => {
  level.value = -1
  model.value = 0n
}

watch(model, (v) => {
  if (v === 0n) level.value = -1
})
</script>
