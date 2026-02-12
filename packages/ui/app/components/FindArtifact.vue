<template>
  <Form @submit.prevent="go">
    <FormLabel label="Contract address">
      <FormItem>
        <input
          v-model="contract"
          placeholder="0x..."
          required
        />
      </FormItem>
    </FormLabel>
    <FormLabel label="Token ID">
      <FormItem>
        <input
          v-model="token"
          placeholder="1"
          required
        />
      </FormItem>
    </FormLabel>
    <Button type="submit">View</Button>
  </Form>
</template>

<script setup lang="ts">
const contract = ref('')
const token = ref('')

const go = () => navigateTo(`/${contract.value}/${token.value}`)
</script>
