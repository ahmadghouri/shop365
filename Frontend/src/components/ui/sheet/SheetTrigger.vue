<script setup>
import { DialogTrigger } from 'radix-vue'
</script>

<template>
  <DialogTrigger v-bind="$attrs" as-child>
    <slot />
  </DialogTrigger>
</template>
