<script setup>
import { DropdownMenuLabel } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<template>
  <DropdownMenuLabel
    v-bind="$attrs"
    :class="cn('px-2 py-1.5 text-sm font-semibold', props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>
