<template>
  <section class="recent-observations">
    <h2>Recent Observations</h2>

    <Loading
      v-if="pending"
      spinner
    />
    <template v-else>
      <div
        v-if="displayObservations.length"
        class="recent-observation-list"
      >
        <RecentObservation
          v-for="obs in displayObservations"
          :key="`${obs.collection}-${obs.tokenId}-${obs.id}`"
          :observation="obs"
        />
      </div>
      <p
        v-else
        class="empty"
      >
        No recent observations.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
const { observations, pending } = useRecentObservations()

const displayObservations = computed(() => [...observations.value].reverse())
</script>

<style scoped>
.recent-observations {
  display: grid;
  gap: var(--spacer);

  h2 {
    font-size: var(--font-lg);
  }

  .empty {
    color: var(--muted);
  }
}

.recent-observation-list {
  display: grid;
  gap: var(--spacer);
}
</style>
