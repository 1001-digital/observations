<template>
  <div class="artifact-viewer">
    <TokenDetail
      :contract="contract"
      :token-id="tokenId"
      :focused-id="focusedId"
      :navigation="navigation"
    >
      <template v-if="$slots['before-details']" #before-details>
        <slot name="before-details" />
      </template>
      <template v-if="$slots['after-details']" #after-details>
        <slot name="after-details" />
      </template>
      <template v-if="$slots.default" #default>
        <slot />
      </template>
      <template v-if="$slots['after-content']" #after-content>
        <slot name="after-content" />
      </template>
    </TokenDetail>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import type { Address } from 'viem'
import {
  TokenDetail,
  ObservationsConfigKey,
  useObservationsConfig,
  type ArtifactPageNavigation,
} from '@1001-digital/observations-components'

const props = defineProps<{
  contract: Address
  token: string
}>()

const parentConfig = useObservationsConfig()
provide(ObservationsConfigKey, {
  ...parentConfig,
  contract: props.contract,
  token: props.token,
})

const contract = computed(() => props.contract)
const tokenId = computed(() => BigInt(props.token))
const focusedId = ref<string | null>(null)

const navigation: ArtifactPageNavigation = {
  onFocusObservation: (id) => {
    focusedId.value = id
  },
  onClearFocus: () => {
    focusedId.value = null
  },
  onBeforePlaceMarker: () => {
    focusedId.value = null
  },
}
</script>

<style scoped>
.artifact-viewer {
  height: 100%;
  --font-family: serif;
}
</style>
