<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Rider Applications" description="Review and approve rider signup requests" />

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="i in 3" :key="i">
        <CardHeader>
          <Skeleton class="h-5 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-3/4 mb-2" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>

    <EmptyState
      v-else-if="applications.length === 0"
      title="No Applications"
      description="No rider applications have been submitted yet."
      :icon="Bike"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="application in applications" :key="application._id">
        <CardHeader>
          <CardTitle class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-2">
              <User class="w-5 h-5" />
              {{ application.name }}
            </span>
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full"
              :class="statusClass(application.status)"
            >
              {{ application.status }}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone class="w-4 h-4" />
            {{ application.phone_no }}
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard class="w-4 h-4" />
            {{ application.cnic }}
          </div>
          <div class="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin class="w-4 h-4 mt-0.5" />
            {{ application.address }}
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Bike class="w-4 h-4" />
            {{ application.vehicle_type }}
          </div>

          <!-- Uploaded images -->
          <div class="grid grid-cols-4 gap-2 pt-2">
            <a
              v-for="img in imageList(application)"
              :key="img.key"
              :href="img.url || undefined"
              target="_blank"
              class="block"
              :title="img.label"
            >
              <img
                v-if="img.url"
                :src="img.url"
                :alt="img.label"
                class="w-full h-16 object-cover rounded-md border"
              />
              <div
                v-else
                class="w-full h-16 rounded-md border border-dashed flex items-center justify-center text-[10px] text-muted-foreground text-center"
              >
                {{ img.label }}
              </div>
            </a>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-3">
            <Button
              size="sm"
              class="flex-1"
              :disabled="application.status === 'approved' || updatingId === application._id"
              @click="updateStatus(application._id, 'approved')"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              class="flex-1"
              :disabled="application.status === 'rejected' || updatingId === application._id"
              @click="updateStatus(application._id, 'rejected')"
            >
              Reject
            </Button>
          </div>
          <router-link
            :to="`/admin/rider-applications/${application._id}`"
            class="mt-2 flex items-center justify-center gap-1 text-sm text-primary hover:underline"
          >
            View full details
            <ArrowRight class="w-3 h-3" />
          </router-link>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { riderApplicationApi } from "@/api/modules/riderApplication.api";
import { ref, computed } from "vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { QUERY_KEYS } from "@/api/queries/query-keys";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { User, Phone, CreditCard, MapPin, Bike, ArrowRight } from "lucide-vue-next";

const queryClient = useQueryClient();
const updatingId = ref(null);

const { data: applicationsData, isLoading: loading } = useQuery({
  queryKey: QUERY_KEYS.RIDER_APPS,
  queryFn: async () => {
    const response = await riderApplicationApi.getAll();
    // Backend wraps the list in { status, message, data }
    return response.data?.data ?? response.data ?? [];
  },
});

const applications = computed(() => applicationsData.value ?? []);

const imageList = (a) => [
  { key: "cnic_front", label: "CNIC Front", url: a.cnic_front_image },
  { key: "cnic_back", label: "CNIC Back", url: a.cnic_back_image },
  { key: "photo", label: "Photo", url: a.photo_image },
  { key: "vehicle", label: "Vehicle", url: a.vehicle_image },
];

const statusClass = (status) => {
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const updateStatus = async (id, status) => {
  updatingId.value = id;
  try {
    await riderApplicationApi.updateStatus(id, status);
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RIDER_APPS });
  } catch (error) {
    console.error("Failed to update rider application", error);
  } finally {
    updatingId.value = null;
  }
};
</script>
