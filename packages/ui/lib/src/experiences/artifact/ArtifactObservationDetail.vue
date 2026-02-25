<template>
  <ObservationDetail
    v-if="observation"
    :contract="contract"
    :token-id="tokenId"
    :tip-recipient="tipRecipient"
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Alert } from '@1001-digital/components'
import { ObservationDetail, useTokenPageData, useObservationNavigation } from '@1001-digital/observations-components'

const route = useRoute()
const { observations, pending, refreshAndPoll, contract, tokenId, tipRecipient, hasMultipleViewModes } = useTokenPageData()
const { focusObservation, clearFocus } = useObservationNavigation()

const focusedId = computed(() => route.params.id as string)
const observation = computed(() => observations.value.find((o) => o.id === focusedId.value))
</script>
