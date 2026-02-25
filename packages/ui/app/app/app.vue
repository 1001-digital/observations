<template>
  <div class="app">
    <Globals />
    <header class="app-header">
      <ConnectProfile />
    </header>
    <NuxtPage />
  </div>
</template>

<style>
:root {
  /* color-scheme: light; */
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

.app-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: var(--navbar-height);
  padding: 0 var(--spacer);
  border-bottom: var(--border);
}
</style>
