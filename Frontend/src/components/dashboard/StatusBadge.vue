<script setup>
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: ''
  }
})

const statusConfig = {
  pending:          { variant: 'destructive', dot: 'bg-red-500' },
  confirmed:        { variant: 'secondary',   dot: 'bg-sky-500' },
  preparing:        { variant: 'secondary',   dot: 'bg-amber-500' },
  picked_up:        { variant: 'secondary',   dot: 'bg-purple-500' },
  out_for_delivery: { variant: 'secondary',   dot: 'bg-orange-500' },
  delivered:        { variant: 'default',     dot: 'bg-emerald-500' },
  cancelled:        { variant: 'destructive', dot: 'bg-red-500' },
  completed:        { variant: 'default',     dot: 'bg-emerald-500' },
  processing:       { variant: 'secondary',   dot: 'bg-amber-500' },
  active:           { variant: 'default',     dot: 'bg-emerald-500' },
  default:          { variant: 'outline',     dot: 'bg-gray-400' },
}

const config = computed(() => {
  return statusConfig[props.status?.toLowerCase()] || statusConfig.default
})

const badgeVariant = computed(() => {
  return props.variant || config.value.variant
})
</script>

<template>
  <Badge :variant="badgeVariant" class="gap-1.5">
    <span :class="['inline-block h-2 w-2 rounded-full', config.dot]" aria-hidden="true" />
    {{ status }}
  </Badge>
</template>
