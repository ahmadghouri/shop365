<script setup>
import { DropdownMenuTrigger } from 'radix-vue'
</script>

<template>
  <DropdownMenuTrigger v-bind="$attrs" as-child>
    <slot />
  </DropdownMenuTrigger>
</template>
