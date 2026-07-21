<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'destructive'].includes(v),
  },
  class: {
    type: [String, Array, Object],
    default: '',
  },
})

const variantClasses = {
  default: 'bg-background text-foreground border',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
}
</script>

<template>
  <div
    role="alert"
    :class="cn('relative w-full rounded-lg border p-4', variantClasses[props.variant], props.class)"
  >
    <slot />
  </div>
</template>
