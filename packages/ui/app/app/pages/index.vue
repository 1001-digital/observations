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
  margin: 0 auto;
  padding: clamp(4rem, 9vw, 12rem) 0;
  display: grid;
  gap: clamp(4rem, 9vw, 12rem);
}

.card {
  header {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
