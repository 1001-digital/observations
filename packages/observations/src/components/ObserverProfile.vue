<template>
  <Card as="section" class="observer-profile">
    <div class="observer-profile-identity">
      <img
        v-if="profile.data?.avatar"
        :src="profile.data.avatar"
        :alt="displayName"
        class="observer-profile-avatar"
      />
      <div class="observer-profile-info">
        <h1>{{ displayName }}</h1>
        <p
          v-if="profile.ens"
          class="observer-profile-address"
          @click="copyAddress"
        >
          {{ shortAddress(profile.address as Address) }}
        </p>
        <p v-if="profile.data?.description" class="observer-profile-description">
          {{ profile.data.description }}
        </p>
        <div v-if="hasLinks" class="observer-profile-links">
          <a
            v-if="profile.data?.links.url"
            :href="profile.data.links.url"
            target="_blank"
          >
            {{ profile.data.links.url.replace(/^https?:\/\//, '') }}
          </a>
          <a
            v-if="profile.data?.links.twitter"
            :href="`https://x.com/${profile.data.links.twitter}`"
            target="_blank"
          >
            @{{ profile.data.links.twitter }}
          </a>
          <a
            v-if="profile.data?.links.github"
            :href="`https://github.com/${profile.data.links.github}`"
            target="_blank"
          >
            {{ profile.data.links.github }}
          </a>
        </div>
      </div>
    </div>
    <dl class="observer-profile-stats">
      <div>
        <dt>Observations</dt>
        <dd>{{ totalCount }}</dd>
      </div>
      <div v-if="totalTips > 0n">
        <dt>Tips</dt>
        <dd>{{ formatTip(totalTips) }} ETH</dd>
      </div>
    </dl>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatEther, type Address } from 'viem'
import { Card, shortAddress, type EnsProfile } from '@1001-digital/components'

const props = defineProps<{
  profile: EnsProfile
  totalCount: number
  totalTips: bigint
}>()

const displayName = computed(() =>
  props.profile.ens || shortAddress(props.profile.address as Address),
)

const hasLinks = computed(() => {
  const links = props.profile.data?.links
  return links && (links.url || links.twitter || links.github)
})

function formatTip(value: bigint): string {
  const formatted = formatEther(value)
  if (formatted.includes('.')) {
    return formatted.replace(/\.?0+$/, '') || '0'
  }
  return formatted
}

async function copyAddress() {
  try {
    await navigator.clipboard.writeText(props.profile.address)
  } catch {}
}
</script>

<style scoped>
.observer-profile {
  display: grid;
  gap: var(--spacer);
}

.observer-profile-identity {
  display: flex;
  gap: var(--spacer);
  align-items: start;
}

.observer-profile-avatar {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  object-fit: cover;
}

.observer-profile-info {
  display: grid;
  gap: var(--spacer-xs);

  h1 {
    font-size: var(--font-xl);
  }
}

.observer-profile-address {
  font-size: var(--font-sm);
  color: var(--muted);
  cursor: pointer;
}

.observer-profile-description {
  color: var(--muted);
}

.observer-profile-links {
  display: flex;
  gap: var(--spacer);
  font-size: var(--font-sm);
}

.observer-profile-stats {
  display: flex;
  gap: var(--spacer-lg);

  div {
    display: grid;
    gap: var(--spacer-xs);
  }

  dt {
    font-size: var(--font-sm);
    color: var(--muted);
  }

  dd {
    font-size: var(--font-lg);
    font-weight: 600;
  }
}
</style>
