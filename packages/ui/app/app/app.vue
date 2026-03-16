<template>
  <div class="app">
    <AppHeader />
    <NuxtPage />
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --navbar-height: 3.5rem;
}

html {
  scrollbar-gutter: auto;
}
</style>

<style scoped>
.app {
  min-height: 100dvh;
  width: 100vw;
}
</style>
