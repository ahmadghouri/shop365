<script setup>
import { DropdownMenuRoot } from 'radix-vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: undefined,
  },
  defaultOpen: {
    type: Boolean,
    default: undefined,
  },
})
</script>

<template>
  <DropdownMenuRoot v-bind="$attrs" :open="open" :default-open="defaultOpen">
    <slot />
  </DropdownMenuRoot>
</template>
