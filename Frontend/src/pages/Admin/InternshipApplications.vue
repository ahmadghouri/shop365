<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Internship Applications" description="Review incoming internship applications" />

    <!-- Summary + search -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <StatCard title="Total Applications" :value="applications.length" :icon="GraduationCap" description="submitted"
        :loading="loading" />
      <StatCard title="With Portfolio" :value="withPortfolioCount" :icon="ExternalLink" description="linked portfolios"
        :loading="loading" />
    </div>

    <div class="relative mt-6 mb-6">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input v-model="searchQuery" placeholder="Search by name or email…" class="pl-9" />
    </div>

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

    <EmptyState v-else-if="filteredApplications.length === 0" title="No Applications"
      :description="searchQuery ? 'No applications match your search.' : 'No internship applications have been submitted yet.'"
      :icon="GraduationCap" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="application in filteredApplications" :key="application.id"
        class="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <Avatar class="h-11 w-11">
              <AvatarFallback class="bg-primary/10 text-primary font-semibold">
                {{ (application.full_name || 'A').charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <CardTitle class="text-base truncate">{{ application.full_name }}</CardTitle>
          </div>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail class="w-4 h-4" />
            {{ application.email }}
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone class="w-4 h-4" />
            {{ application.phone }}
          </div>
          <div v-if="application.portfolio_url" class="text-sm">
            <a :href="application.portfolio_url" target="_blank"
              class="text-primary hover:underline flex items-center gap-1">
              <ExternalLink class="w-3 h-3" />
              View Portfolio
            </a>
          </div>
          <p v-if="application.academic_info" class="text-sm text-muted-foreground">
            Academic Info: {{ application.academic_info }}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { internshipApi } from "@/api/modules/internship.api";
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { QUERY_KEYS } from "@/api/queries/query-keys";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, ExternalLink, GraduationCap, Search } from "lucide-vue-next";

const queryClient = useQueryClient();

const { data: applicationsData, isLoading: loading } = useQuery({
  queryKey: QUERY_KEYS.INTERNSHIP_APPS,
  queryFn: async () => {
    const response = await internshipApi.getAll();
    return response.data;
  },
});

const applications = computed(() => applicationsData.value ?? []);

const searchQuery = ref("");
const filteredApplications = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return applications.value;
  return applications.value.filter(
    (a) =>
      (a.full_name || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q),
  );
});
const withPortfolioCount = computed(
  () => applications.value.filter((a) => a.portfolio_url).length,
);

const showDeleteConfirmation = ref(false)
const selectedApplicationId = ref(null)

const confirmDelete = (id) => {
  selectedApplicationId.value = id
  showDeleteConfirmation.value = true
}

const executeDelete = async () => {
  try {
    await axios.delete(`/api/internship-applications/${selectedApplicationId.value}`)
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERNSHIP_APPS });
    showDeleteConfirmation.value = false
  } catch (error) {
    console.error('Failed to delete application', error)
  }
}
</script>
