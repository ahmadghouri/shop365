<script setup>
import { DialogClose } from 'radix-vue'
</script>

<template>
  <DialogClose v-bind="$attrs" as-child>
    <slot />
  </DialogClose>
</template>
