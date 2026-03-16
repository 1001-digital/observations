<template>
  <header class="app-header">
    <nav class="app-nav">
      <NuxtLink
        to="/"
        class="app-logo"
        >Observations</NuxtLink
      >
      <template
        v-for="crumb in breadcrumbs"
        :key="crumb.path"
      >
        <span class="breadcrumb-separator">/</span>
        <NuxtLink :to="crumb.path">{{ crumb.label }}</NuxtLink>
      </template>
    </nav>
    <ConnectProfile />
  </header>
</template>

<script setup lang="ts">
const crumbs = useBreadcrumbs()

const order = ['collection', 'token', 'observation'] as const

const breadcrumbs = computed(() =>
  order.filter((key) => crumbs.has(key)).map((key) => crumbs.get(key)!),
)
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
  color: var(--gray-z-4);
  flex-shrink: 0;
  padding-inline: var(--spacer-xs);
}

.app-nav a:not(.app-logo) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--gray-z-7);

  &:hover,
  &:focus {
    color: var(--color);
  }

  &.router-link-exact-active {
    color: var(--muted);
  }
}

.app-nav a {
  text-transform: uppercase;
}
</style>
