<template>
  <Globals>
    <div class="app">
      <header class="app-header">
        <ConnectProfile @connected="onConnected" @disconnected="onDisconnected" />
      </header>
      <router-view />
    </div>
  </Globals>
</template>

<script setup lang="ts">
import { Globals } from '@1001-digital/components'
import { ConnectProfile } from '@1001-digital/observations-components'

const onConnected = () => {}
const onDisconnected = () => {}
</script>

<style>
:root {
  color-scheme: light;
  --navbar-height: 3.5rem;
  --font-family: serif;
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
