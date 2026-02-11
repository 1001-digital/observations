<template>
  <Artifact :contract="contract" :token-id="tokenId" />
</template>

<script setup lang="ts">
const contract = useArtifactContract()
const tokenId = useArtifactTokenId()
</script>
