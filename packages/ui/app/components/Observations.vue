<template>
  <section class="observations">
    <h2>
      Observations <small v-if="count > 0n">({{ count }})</small>
    </h2>

    <ObservationCreate
      :contract="contract"
      :token-id="tokenId"
      @complete="refresh"
    />

    <Loading
      v-if="pending"
      spinner
    />
    <template v-else>
      <div
        v-if="observations.length"
        class="observation-list"
      >
        <div
          v-for="(obs, i) in observations"
          :key="i"
          class="observation"
        >
          <div class="observation-header">
            <Address :address="obs.observer" />
          </div>
          <p class="observation-note">{{ obs.note }}</p>
        </div>
      </div>
      <p
        v-else
        class="empty"
      >
        No observations yet.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Address } from 'viem'

const props = defineProps<{
  contract: Address
  tokenId: bigint
}>()

const { observations, count, pending, refresh } = useObservations(
  toRef(() => props.contract),
  toRef(() => props.tokenId),
)
</script>

<style scoped>
.observations {
  display: grid;
  gap: var(--spacer);

  h2 {
    font-size: var(--font-lg);

    small {
      color: var(--muted);
      font-weight: normal;
    }
  }

  .empty {
    color: var(--muted);
  }
}

.observation-list {
  display: grid;
  gap: var(--spacer);
}

.observation {
  display: grid;
  gap: var(--spacer-xs);

  .observation-header {
    font-size: var(--font-sm);
    color: var(--muted);
  }

  .observation-note {
    word-break: break-word;
    white-space: pre-wrap;
  }

  &:not(:last-child) {
    padding-bottom: var(--spacer);
    border-bottom: var(--border);
  }
}
</style>
