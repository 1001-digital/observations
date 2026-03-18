<template>
  <section class="landing-hero">
    <h1>Observations.art</h1>
    <p>
      Observe, collect, and curate onchain — build a living record of the art
      and artifacts you discover.
    </p>
  </section>
</template>

<style scoped>
.landing-hero {
  text-align: center;
  padding: clamp(4rem, 9vw, 12rem) var(--spacer);
}

.landing-hero h1 {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.05;
  margin-bottom: var(--spacer-sm);
}

.landing-hero p {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  color: var(--muted);
  max-width: 36rem;
  margin: 0 auto;
  text-wrap: balance;
  line-height: var(--line-height-md);
}
</style>
