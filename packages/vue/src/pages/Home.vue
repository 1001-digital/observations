<template>
  <main>
    <Card>
      <header>
        <h1>Find Artifact</h1>
      </header>
      <FindArtifact />
    </Card>
    <RecentObservations />
    <ExampleArtifacts />
  </main>
</template>

<script setup lang="ts">
import { Card } from '@1001-digital/components'
import FindArtifact from '@ui/components/FindArtifact.vue'
import RecentObservations from '@ui/components/RecentObservations.vue'
import ExampleArtifacts from '@ui/components/ExampleArtifacts.vue'
</script>

<style scoped>
main {
  max-width: 64rem;
  margin: var(--spacer) auto;
  padding: var(--spacer);
  display: grid;
  gap: var(--spacer-lg);
}

.card {
  header {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
