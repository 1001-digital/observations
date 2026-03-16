<template>
  <TokenDetail
    class="token-page"
    :contract="contract"
    :token-id="tokenId"
    :focused-id="focusedId"
    :navigation="navigation"
  >
    <NuxtPage />
  </TokenDetail>
</template>

<script setup lang="ts">
const route = useRoute()

const contract = useArtifactContract()
const tokenId = useArtifactTokenId()

const focusedId = computed(() => (route.params.id as string) ?? null)

const { contract: scopeContract, token: scopeToken } = useArtifactScope()
const basePath = computed(() =>
  scopeContract && scopeToken
    ? ''
    : `/${contract.value}/${tokenId.value}`,
)

const crumbs = useBreadcrumbs()
const title = computed(() => {
  const token = crumbs.get('token')
  const collection = crumbs.get('collection')
  const parts = [token?.label || `#${tokenId.value}`]
  if (collection) parts.push(collection.label)
  return parts.join(' \u2014 ')
})
useHead(computed(() => ({ title: title.value })))

const navigation = {
  onFocusObservation: (id: string) => navigateTo({ path: `${basePath.value}/${id}`, query: route.query }),
  onClearFocus: () => navigateTo({ path: basePath.value || '/', query: route.query }),
  onBeforePlaceMarker: () => route.params.id
    ? navigateTo({ path: basePath.value || '/', query: route.query })
    : undefined,
}
</script>

<style scoped>
.token-page {
  @media (min-width: 45rem) {
    height: calc(100dvh - var(--navbar-height, 0px));
  }
}
</style>
