<script setup>
import { TooltipRoot } from 'radix-vue'

const props = defineProps({
  delayDuration: {
    type: Number,
    default: 700,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <TooltipRoot v-bind="$attrs" :delay-duration="delayDuration" :disabled="disabled">
    <slot />
  </TooltipRoot>
</template>
