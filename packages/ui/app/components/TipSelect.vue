<template>
  <div class="tip-select">
    <Button v-if="!active" class="tertiary small" @click="activate">
      Add tip
    </Button>
    <FormInputGroup v-else>
      <Button class="small" @click="double" title="Double tip">
        ${{ usdAmount }}
      </Button>
      <Button class="muted small" @click="clear">&times;</Button>
    </FormInputGroup>
  </div>
</template>

<script setup lang="ts">
import { parseEther } from 'viem'

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

const activate = () => { level.value = 0 }
const double = () => { level.value++ }
const clear = () => { level.value = -1 }

watch([level, ethUSDRaw], () => {
  model.value = active.value ? usdToWei(usdAmount.value) : 0n
})

watch(model, (v) => {
  if (v === 0n && ethUSDRaw.value) level.value = -1
})
</script>
