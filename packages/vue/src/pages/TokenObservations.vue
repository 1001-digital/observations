<template>
  <Observations
    :contract="contract"
    :token-id="tokenId"
    :tip-recipient="tipRecipient"
    :observations="observations"
    :count="count"
    :external-pending="pending"
    :has-multiple-view-modes="hasMultipleViewModes"
    :view-type="viewType"
    @complete="refreshAndPoll"
    @focus-observation="focusObservation"
  />
</template>

<script setup lang="ts">
import Observations from '@ui/components/Observations.vue'
import { useTokenPageData, useObservationNavigation } from '@ui/composables/useTokenPageProvide'

const { observations, count, pending, refreshAndPoll, contract, tokenId, tipRecipient, hasMultipleViewModes, viewType } = useTokenPageData()
const { focusObservation } = useObservationNavigation()
</script>
