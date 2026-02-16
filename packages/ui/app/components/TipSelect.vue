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
const model = defineModel<bigint>({ default: 0n })

const { ethUSDRaw } = usePriceFeed()

const level = ref(-1)
const active = computed(() => level.value >= 0)

const usdAmount = computed(() => Math.pow(2, level.value))

const usdToWei = (usd: number) => {
  if (!ethUSDRaw.value) return 0n
  return BigInt(usd) * 10n ** 26n / ethUSDRaw.value
}

const updateModel = () => {
  model.value = usdToWei(usdAmount.value)
}

const activate = () => {
  level.value = 0
  updateModel()
}

const double = () => {
  level.value++
  updateModel()
}

const clear = () => {
  level.value = -1
  model.value = 0n
}

watch(model, (v) => {
  if (v === 0n) level.value = -1
})
</script>
