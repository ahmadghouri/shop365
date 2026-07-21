<script setup>
import { AvatarImage } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: [String, Array, Object],
    default: '',
  },
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <AvatarImage
    :class="cn('aspect-square h-full w-full', props.class)"
    :src="src"
    :alt="alt"
  />
</template>
