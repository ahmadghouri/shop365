<template>
  <div class="space-y-6">
    <PageHeader title="SHOP365 Users" description="View grocery store users">
      <template #actions>
        <Button variant="outline" @click="usersStore.fetchUsers()" :disabled="loading">
          <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
          Refresh
        </Button>
      </template>
    </PageHeader>

    <!-- Summary -->
    <div v-if="!loading && users?.length" class="flex items-center gap-4 text-sm text-muted-foreground">
      <div class="flex items-center gap-1.5">
        <Users class="h-4 w-4" />
        <span class="font-medium text-foreground">{{ users.length }}</span> users
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="i in 6" :key="i">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-1.5">
              <Skeleton class="h-5 w-32" />
              <Skeleton class="h-3 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>

    <!-- Error -->
    <Alert v-else-if="usersStore.error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>{{ usersStore.error }}</AlertDescription>
    </Alert>

    <!-- Users Grid -->
    <div v-else-if="users?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="(user, index) in users"
        :key="user?.id || index"
        class="transition-all duration-200 hover:shadow-md"
      >
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <Avatar class="h-12 w-12">
              <AvatarFallback class="bg-primary text-primary-foreground font-bold">
                {{ (user?.name || "U").charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle class="text-base">{{ user?.name || "Unknown User" }}</CardTitle>
              <CardDescription class="flex items-center gap-1">
                <Hash class="h-3 w-3" />
                {{ user?.id || "N/A" }}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-3">
          <Separator />

          <!-- Contact -->
          <div class="flex items-center gap-2 text-sm">
            <Phone class="h-4 w-4 text-muted-foreground shrink-0" />
            <span class="text-muted-foreground">Phone:</span>
            <span class="font-medium ml-auto">{{ user?.phone_no || "Not provided" }}</span>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
              <Star class="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p class="text-[10px] text-muted-foreground leading-none mb-0.5">Points</p>
                <p class="font-semibold text-sm">{{ user?.points || 0 }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
              <ShoppingBag class="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p class="text-[10px] text-muted-foreground leading-none mb-0.5">Orders</p>
                <p class="font-semibold text-sm">{{ user?.order_count || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Address -->
          <div class="flex items-start gap-2 text-sm">
            <MapPin class="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div class="min-w-0">
              <p class="truncate">{{ user?.household?.address || "Not provided" }}</p>
              <p class="text-muted-foreground text-xs">{{ user?.household?.town?.town_name || "" }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="!loading && !users?.length"
      title="No Users"
      description="No grocery store users found."
      :icon="Users"
    />
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "../../store/userStore";
import { computed, onMounted } from "vue";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw, Users, Phone, MapPin, Star, ShoppingBag, Hash, AlertCircle
} from "lucide-vue-next";

const usersStore = useUserStore();
const { groceryUsers: users } = storeToRefs(usersStore);
const loading = computed(() => usersStore.loading);

onMounted(() => {
  usersStore.fetchUsers();
});
</script>
