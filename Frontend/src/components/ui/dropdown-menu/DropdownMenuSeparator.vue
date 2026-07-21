<script setup>
import { DropdownMenuSeparator } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<template>
  <DropdownMenuSeparator
    v-bind="$attrs"
    :class="cn('-mx-1 my-1 h-px bg-muted', props.class)"
  />
</template>
