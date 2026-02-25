<template>
  <main class="experience-index">
    <h1>Observations Experiences</h1>

    <div class="experience-cards">
      <router-link
        v-for="exp in experiences"
        :key="exp.path"
        :to="exp.path"
        class="experience-card"
      >
        <h2>{{ exp.title }}</h2>
        <p>{{ exp.description }}</p>
      </router-link>
    </div>
  </main>
</template>

<script setup lang="ts">
import { defaultContract, defaultToken, defaultObserver } from '../defaults'

const experiences = [
  {
    path: `/artifact?contract=${defaultContract}&token=${defaultToken}`,
    title: 'Single Artifact',
    description: 'View a single token with its visual, details, and observations.',
  },
  {
    path: `/collection?contract=${defaultContract}`,
    title: 'Single Collection',
    description: 'Browse a collection with its tokens and observation timeline.',
  },
  {
    path: `/artist?address=${defaultObserver}`,
    title: 'Single Artist',
    description: 'View an artist or observer profile with their observations.',
  },
]
</script>

<style scoped>
.experience-index {
  max-width: 64rem;
  margin: var(--spacer-lg) auto;
  padding: var(--spacer);
  display: grid;
  gap: var(--spacer-lg);
}

h1 {
  font-size: var(--font-xl);
}

.experience-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: var(--spacer);
}

.experience-card {
  display: grid;
  gap: var(--spacer-xs);
  padding: var(--spacer);
  border: var(--border);
  border-radius: var(--spacer-xs);
  text-decoration: none;
  color: inherit;
  transition: background 0.15s;

  &:hover {
    background: var(--gray-z-1);
  }

  h2 {
    font-size: var(--font-lg);
  }

  p {
    color: var(--muted);
    font-size: var(--font-sm);
  }
}
</style>
