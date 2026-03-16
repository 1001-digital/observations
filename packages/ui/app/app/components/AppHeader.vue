<template>
  <header class="app-header">
    <nav class="app-nav">
      <NuxtLink to="/" class="app-logo">Observations</NuxtLink>
      <template v-for="crumb in breadcrumbs" :key="crumb.path">
        <span class="breadcrumb-separator">/</span>
        <NuxtLink :to="crumb.path">{{ crumb.label }}</NuxtLink>
      </template>
    </nav>
    <ConnectProfile />
  </header>
</template>

<script setup lang="ts">
import type { Address } from 'viem'
import { shortAddress } from '@1001-digital/components.evm'

const route = useRoute()

const breadcrumbs = computed(() => {
  const crumbs: { path: string; label: string }[] = []
  const contract = route.params.contract as string | undefined
  const token = route.params.token as string | undefined
  const id = route.params.id as string | undefined

  if (!contract) return crumbs

  crumbs.push({
    path: `/${contract}`,
    label: shortAddress(contract as Address),
  })

  if (token) {
    crumbs.push({
      path: `/${contract}/${token}`,
      label: `#${token}`,
    })
  }

  if (id) {
    crumbs.push({
      path: `/${contract}/${token}/${id}`,
      label: `#${id}`,
    })
  }

  return crumbs
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--navbar-height);
  padding: 0 var(--spacer);
  border-bottom: var(--border);
}

.app-nav {
  display: flex;
  align-items: center;
  gap: var(--spacer-xs);
  overflow: hidden;
  min-width: 0;
}

.app-logo {
  font-weight: 600;
  flex-shrink: 0;
}

.breadcrumb-separator {
  color: var(--muted);
  flex-shrink: 0;
}

.app-nav a:not(.app-logo) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
