<script setup>
import { TooltipTrigger } from 'radix-vue'
</script>

<template>
  <TooltipTrigger v-bind="$attrs" as-child>
    <slot />
  </TooltipTrigger>
</template>
