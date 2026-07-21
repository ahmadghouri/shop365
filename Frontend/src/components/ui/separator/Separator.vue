<script setup>
import { Separator as SeparatorRoot } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical'].includes(v),
  },
  decorative: {
    type: Boolean,
    default: undefined,
  },
  class: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<template>
  <SeparatorRoot
    :orientation="orientation"
    :decorative="decorative"
    :class="cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]', props.class)"
  />
</template>
