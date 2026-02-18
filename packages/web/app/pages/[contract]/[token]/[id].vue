<template>
  <ObservationDetail
    v-if="observation"
    :contract="contract"
    :token-id="tokenId"
    :recipient="recipient"
    :observations="observations"
    :focused-id="focusedId"
    :has-multiple-view-modes="hasMultipleViewModes"
    @focus-observation="focusObservation"
    @clear-focus="clearFocus"
    @complete="refreshAndPoll"
  />
  <Alert v-else-if="!pending">
    Observation not found.
  </Alert>
</template>

<script setup lang="ts">
const route = useRoute()
const { observations, pending, refreshAndPoll, contract, tokenId, recipient, hasMultipleViewModes } = useTokenPageData()
const { focusObservation, clearFocus } = useObservationNavigation()

const focusedId = computed(() => route.params.id as string)
const observation = computed(() => observations.value.find((o) => o.id === focusedId.value))
</script>
