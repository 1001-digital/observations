<template>
  <section class="example-artifacts">
    <Artifact
      v-for="id in artifacts"
      :key="id"
      :contract="id.split('/')[0] as Address"
      :token-id="BigInt(id.split('/')[1]!)"
    >
      <template #default="{ metadata, image }">
        <Card as="div">
          <ArtifactVisual
            :image="image"
            :name="metadata.name"
          />
          <header>
            <h1>{{ metadata.name }}</h1>
          </header>
          <CardLink
            :to="`/${id}`"
            class="card-link"
          >
            {{ metadata.name }}
          </CardLink>
        </Card>
      </template>
    </Artifact>
  </section>
</template>

<script setup lang="ts">
import type { Address } from 'viem'
import { Card, CardLink } from '@1001-digital/components'
import { useObservationsConfig } from '../utils/config'
import Artifact from './Artifact.vue'
import ArtifactVisual from './ArtifactVisual.vue'

const { exampleArtifacts: artifacts } = useObservationsConfig()
</script>

<style scoped>
.example-artifacts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: var(--spacer);
}

footer {
  text-align: center;

  a {
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
