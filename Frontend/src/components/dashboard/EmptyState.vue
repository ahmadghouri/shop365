<script setup>
import { Button } from '@/components/ui/button'
import { Inbox } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: 'No data found'
  },
  description: {
    type: String,
    default: 'There is nothing to display here yet.'
  },
  icon: {
    type: Object,
    default: null
  },
  actionLabel: {
    type: String,
    default: ''
  },
  actionRoute: {
    type: String,
    default: ''
  }
})

const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="rounded-full bg-muted p-4 mb-4">
      <component :is="icon || Inbox" class="h-10 w-10 text-muted-foreground" />
    </div>
    <h3 class="text-lg font-semibold mb-1">{{ title }}</h3>
    <p class="text-sm text-muted-foreground max-w-sm mb-6">{{ description }}</p>
    <Button v-if="actionLabel && actionRoute" @click="router.push(actionRoute)">
      {{ actionLabel }}
    </Button>
  </div>
</template>
