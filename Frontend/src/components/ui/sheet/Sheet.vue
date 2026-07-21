<script setup>
import { computed } from 'vue'
import { DialogRoot } from 'radix-vue'

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

const emit = defineEmits(['update:open'])

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})
</script>

<template>
  <DialogRoot v-model:open="isOpen" :default-open="defaultOpen">
    <slot />
  </DialogRoot>
</template>
