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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Form, FormLabel, FormItem } from '@1001-digital/components'

const router = useRouter()
const contract = ref('')
const token = ref('')

const go = () => router.push(`/${contract.value}/${token.value}`)
</script>
