<script setup>
import { onMounted, computed } from "vue";
import { useBusinessStore } from "../../store/businessStore";
import { useRouter } from "vue-router";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2, Clock, Tag, Percent, Calendar, ArrowRight, AlertCircle, Store
} from "lucide-vue-next";

const businessStore = useBusinessStore();
const user = JSON.parse(localStorage.getItem("user") || "{}");
const businessId = user?.business_id;
const router = useRouter();

const isLoading = computed(() => businessStore.loading);

const formatTime = (time) => {
  return time ? time.replace(/:00([AP]M)$/, "$1") : "";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const viewProductDetails = (name, businessId) => {
  try {
    const encodedName = encodeURIComponent(name);
    router.push(`/business/${businessId}/${encodedName}`);
  } catch (error) {
    console.error("Error navigating to products page:", error);
  }
};

onMounted(async () => {
  if (businessId) {
    await businessStore.subBusiness(businessId);
  }
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Sub Businesses" description="View and manage your sub businesses" />

    <!-- Loading State -->
    <div v-if="isLoading" class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 6" :key="i" class="overflow-hidden">
        <Skeleton class="h-56 w-full rounded-none" />
        <CardHeader class="pb-3">
          <Skeleton class="h-5 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent class="space-y-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
        <CardFooter>
          <Skeleton class="h-10 w-full" />
        </CardFooter>
      </Card>
    </div>

    <!-- Error -->
    <Alert v-else-if="businessStore.error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>{{ businessStore.error }}</AlertDescription>
    </Alert>

    <!-- Products Grid -->
    <div
      v-else-if="businessStore.subBusinesses?.length"
      class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    >
      <Card
        v-for="(business, index) in businessStore.subBusinesses"
        :key="business.id"
        class="overflow-hidden transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4"
        :style="{ animationDelay: `${index * 75}ms` }"
      >
        <!-- Image -->
        <div class="relative h-56 overflow-hidden">
          <img
            :src="business.image_url"
            :alt="business.name"
            class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <Badge
            class="absolute top-3 right-3"
            :variant="business.status === 'active' ? 'default' : 'destructive'"
          >
            {{ business.status }}
          </Badge>
        </div>

        <CardHeader class="pb-3">
          <CardTitle class="text-lg">{{ business.name }}</CardTitle>
        </CardHeader>

        <CardContent class="space-y-2.5 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Tag class="h-4 w-4 shrink-0" />
            <span>{{ business.type }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="h-4 w-4 shrink-0" />
            <span>{{ formatTime(business.opening_time) }} - {{ formatTime(business.closing_time) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Percent class="h-4 w-4 shrink-0" />
            <span>{{ business.discount }}% Off</span>
          </div>
          <div class="flex items-center gap-2">
            <Calendar class="h-4 w-4 shrink-0" />
            <span>Updated {{ formatDate(business.updated_at) }}</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button class="w-full" @click="viewProductDetails(business.name, business.id)">
            View Products
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="No Businesses"
      description="Add some businesses to get started."
      :icon="Store"
    />
  </div>
</template>
