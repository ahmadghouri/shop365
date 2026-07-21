<script setup>
import { AlertDialogTrigger } from 'radix-vue'
</script>

<template>
  <AlertDialogTrigger v-bind="$attrs" as-child>
    <slot />
  </AlertDialogTrigger>
</template>
