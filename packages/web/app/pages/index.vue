<template>
  <main>
    <Card>
      <header>
        <h1>Find Artifact</h1>
      </header>
      <FindArtifact />
    </Card>
  </main>
</template>

<style scoped>
main {
  max-width: 32rem;
  margin: var(--spacer) auto;
  padding: var(--spacer);
}

.card {
  header {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
