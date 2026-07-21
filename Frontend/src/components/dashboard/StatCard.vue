<script setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: Object,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  trend: {
    type: String,
    default: '',
    validator: (v) => ['', 'up', 'down'].includes(v)
  },
  trendValue: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium">
        <Skeleton v-if="loading" class="h-4 w-24" />
        <span v-else>{{ title }}</span>
      </CardTitle>
      <div v-if="icon && !loading" class="text-muted-foreground">
        <component :is="icon" class="h-5 w-5" />
      </div>
      <Skeleton v-if="loading" class="h-5 w-5 rounded" />
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="space-y-2">
        <Skeleton class="h-8 w-20" />
        <Skeleton class="h-3 w-16" />
      </div>
      <div v-else>
        <div class="text-2xl font-bold">{{ value }}</div>
        <div v-if="description || trendValue" class="flex items-center gap-1 mt-1">
          <span v-if="trend === 'up'" class="inline-flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp class="h-3 w-3 mr-0.5" />
            {{ trendValue }}
          </span>
          <span v-else-if="trend === 'down'" class="inline-flex items-center text-xs text-red-600 font-medium">
            <TrendingDown class="h-3 w-3 mr-0.5" />
            {{ trendValue }}
          </span>
          <span v-else-if="trendValue" class="text-xs text-muted-foreground">
            {{ trendValue }}
          </span>
          <span v-if="description" class="text-xs text-muted-foreground">
            {{ description }}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
