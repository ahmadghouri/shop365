<script setup>
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="i in 4" :key="i">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-8 w-20 mb-2" />
          <Skeleton class="h-3 w-16" />
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton class="h-5 w-32" />
        </CardHeader>
        <CardContent class="space-y-3">
          <Skeleton v-for="i in 5" :key="i" class="h-10 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton class="h-5 w-32" />
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3">
            <Skeleton class="h-10 w-10 rounded-full shrink-0" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-3/4" />
              <Skeleton class="h-3 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
