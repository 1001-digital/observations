<template>
  <Observations
    :contract="contract"
    :token-id="tokenId"
    :tip-recipient="tipRecipient"
    :observations="observations"
    :count="count"
    :external-pending="pending"
    :has-multiple-view-modes="hasMultipleViewModes"
    @complete="refreshAndPoll"
    @focus-observation="focusObservation"
  />
</template>

<script setup lang="ts">
const { observations, count, pending, refreshAndPoll, contract, tokenId, tipRecipient, hasMultipleViewModes } = useTokenPageData()
const { focusObservation } = useObservationNavigation()
</script>
