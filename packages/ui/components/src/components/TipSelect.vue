<template>
  <div class="tip-select">
    <Button
      v-if="!active"
      class="tertiary small"
      :disabled="disabled"
      @click="activate"
    >
      Add tip
    </Button>
    <FormInputGroup v-else>
      <Button
        class="small"
        :disabled="disabled"
        @click="double"
        title="Double tip"
      >
        <span>
          <span class="muted">$</span>
          <span>{{ formatNumber(usdAmount) }}</span>
        </span>
      </Button>
      <Button
        class="muted small"
        :disabled="disabled"
        @click="clear"
        >&times;</Button
      >
    </FormInputGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineModel } from 'vue'
import { parseEther } from 'viem'
import { Button, FormInputGroup, formatNumber } from '@1001-digital/components'
import { usePriceFeed } from '@1001-digital/components.evm'

defineProps<{
  disabled?: boolean
}>()

const model = defineModel<bigint>({ default: 0n })

const { ethUSDRaw, fetchPrice } = usePriceFeed()
fetchPrice()

const level = ref(-1)
const active = computed(() => level.value >= 0)

const usdAmount = computed(() => Math.pow(2, level.value))

const usdToWei = (usd: number) => {
  if (!ethUSDRaw.value) return 0n
  const ethPrice = Number(ethUSDRaw.value) / 1e8
  return parseEther((usd / ethPrice).toPrecision(3))
}

const activate = () => {
  level.value = 0
}
const double = () => {
  level.value++
}
const clear = () => {
  level.value = -1
}

watch([level, ethUSDRaw], () => {
  model.value = active.value ? usdToWei(usdAmount.value) : 0n
})

watch(model, (v) => {
  if (v === 0n && ethUSDRaw.value) level.value = -1
})
</script>

<style scoped>
:deep(.input-group) {
  button:first-child {
    min-width: 3rem;
  }
}
</style>
