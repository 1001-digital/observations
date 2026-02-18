<template>
  <Observations
    :contract="contract"
    :token-id="tokenId"
    :recipient="recipient"
    :observations="observations"
    :count="count"
    :external-pending="pending"
    :has-multiple-view-modes="hasMultipleViewModes"
    @complete="refreshAndPoll"
    @focus-observation="focusObservation"
  />
</template>

<script setup lang="ts">
const { observations, count, pending, refreshAndPoll, contract, tokenId, recipient, hasMultipleViewModes } = useTokenPageData()
const { focusObservation } = useObservationNavigation()
</script>
