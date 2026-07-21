<script setup>
import { AlertDialogDescription } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<template>
  <AlertDialogDescription :class="cn('text-sm text-muted-foreground', props.class)">
    <slot />
  </AlertDialogDescription>
</template>
