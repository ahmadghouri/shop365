<script setup>
import { TooltipProvider } from 'radix-vue'

const props = defineProps({
  delayDuration: {
    type: Number,
    default: 700,
  },
  skipDelayDuration: {
    type: Number,
    default: 300,
  },
})
</script>

<template>
  <TooltipProvider v-bind="$attrs" :delay-duration="delayDuration" :skip-delay-duration="skipDelayDuration">
    <slot />
  </TooltipProvider>
</template>
