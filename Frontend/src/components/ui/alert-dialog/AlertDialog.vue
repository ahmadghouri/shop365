<script setup>
import { computed } from 'vue'
import { AlertDialogRoot } from 'radix-vue'

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
  <AlertDialogRoot v-model:open="isOpen" :default-open="defaultOpen">
    <slot />
  </AlertDialogRoot>
</template>
