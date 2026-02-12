<template>
  <article class="artifact">
    <Loading
      v-if="pending"
      spinner
    />
    <Alert v-else-if="error">{{ error.message }}</Alert>
    <slot
      v-else-if="metadata"
      :metadata="metadata"
      :image="image"
      :animation-url="animationUrl"
      :show-animation="showAnimation"
      :collection="collection"
    >
      <ArtifactVisual
        v-model:show-animation="showAnimation"
        :image="image"
        :animation-url="animationUrl"
        :name="metadata.name"
      />
      <ArtifactDetails
        :metadata="metadata"
        :collection="collection"
        :contract="contract"
        :owner="owner"
      />
    </slot>
  </article>
</template>

<script setup lang="ts">
import type { Address } from 'viem'

const props = defineProps<{
  contract: Address
  tokenId: bigint
}>()

const contractRef = toRef(() => props.contract)

const { metadata, owner, image, animationUrl, pending, error } = useArtifact(
  contractRef,
  toRef(() => props.tokenId),
)

const { collection } = useCollection(contractRef)

const { showAnimation } = useArtifactView(animationUrl, pending)
</script>

<style scoped>
.artifact {
  display: grid;
  gap: var(--spacer);
  container-type: inline-size;
}
</style>
