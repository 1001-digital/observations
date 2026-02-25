<template>
  <div class="artifact-experience">
    <div class="config-bar">
      <label>
        Contract
        <input v-model="contractInput" type="text" placeholder="0x..." />
      </label>
      <label>
        Token
        <input v-model="tokenInput" type="text" placeholder="1" />
      </label>
      <button @click="load">Load</button>
    </div>

    <ArtifactMount
      :key="`${activeContract}-${activeToken}`"
      :contract="activeContract"
      :token="activeToken"
    />
  </div>
</template>

<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Address } from 'viem'
import { defaultContract, defaultToken } from '../defaults'
import ArtifactMount from './artifact/ArtifactMount.vue'

const route = useRoute()
const router = useRouter()

const activeContract: Ref<Address> = ref(
  ((route.query.contract as string) || defaultContract) as Address,
)
const activeToken = ref(
  (route.query.token as string) || defaultToken,
)

const contractInput = ref(activeContract.value as string)
const tokenInput = ref(activeToken.value)

const load = () => {
  activeContract.value = contractInput.value as Address
  activeToken.value = tokenInput.value
  router.replace({ query: { contract: contractInput.value, token: tokenInput.value } })
}
</script>

<style scoped>
.config-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--spacer-sm);
  padding: var(--spacer-sm) var(--spacer);
  border-bottom: var(--border);
  background: var(--gray-z-1);
  font-size: var(--font-sm);

  label {
    display: grid;
    gap: 2px;
    font-weight: 600;
  }

  input {
    font: inherit;
    padding: var(--spacer-xs) var(--spacer-sm);
    border: var(--border);
    border-radius: var(--spacer-xs);
    min-width: 0;
  }

  input[placeholder="0x..."] {
    width: 26ch;
  }

  input[placeholder="1"] {
    width: 6ch;
  }

  button {
    font: inherit;
    padding: var(--spacer-xs) var(--spacer);
    border: var(--border);
    border-radius: var(--spacer-xs);
    background: var(--gray-z-2);
    cursor: pointer;

    &:hover {
      background: var(--gray-z-3);
    }
  }
}
</style>
