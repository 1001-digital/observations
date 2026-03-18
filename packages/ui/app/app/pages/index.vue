<template>
  <main>
    <LandingHero />
    <Card>
      <header>
        <h1>Find Artifact</h1>
      </header>
      <FindArtifact />
    </Card>
    <RecentObservations />
    <!-- <ExampleArtifacts /> -->
  </main>
</template>

<script setup lang="ts">
useHead({ title: 'Observations' })
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
