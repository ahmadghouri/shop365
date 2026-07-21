<script setup>
import { AlertDialogCancel } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<template>
  <AlertDialogCancel
    :class="
      cn(
        'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0',
        props.class
      )
    "
  >
    <slot />
  </AlertDialogCancel>
</template>
