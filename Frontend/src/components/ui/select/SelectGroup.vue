<script setup>
import { SelectGroup, SelectLabel } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: [String, Array, Object], default: '' },
})
</script>

<template>
  <SelectGroup :class="cn('p-1', props.class)">
    <SelectLabel class="py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground">
      <slot />
    </SelectLabel>
  </SelectGroup>
</template>
