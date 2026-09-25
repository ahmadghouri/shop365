<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Rider Applications" description="Review and approve rider signup requests">
      <template #actions>
        <div class="relative w-full sm:w-72">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            v-model="search"
            type="search"
            placeholder="Search name, phone, CNIC, address…"
            class="pl-9 pr-9"
          />
          <button
            v-if="search"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
            aria-label="Clear search"
            @click="search = ''"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Summary stats double as quick status filters -->
    <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <button
        v-for="stat in stats"
        :key="stat.key"
        type="button"
        class="rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50"
        :class="statusFilter === stat.key ? 'border-primary ring-1 ring-primary' : ''"
        @click="statusFilter = statusFilter === stat.key ? 'all' : stat.key"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">{{ stat.label }}</span>
          <span class="flex h-7 w-7 items-center justify-center rounded-full" :class="stat.iconClass">
            <component :is="stat.icon" class="h-4 w-4" />
          </span>
        </div>
        <p class="mt-2 text-2xl font-bold tracking-tight">{{ stat.count }}</p>
      </button>
    </div>

    <!-- Advanced filter toolbar -->
    <div class="mb-5 flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
      <div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal class="h-4 w-4" />
        Filters
      </div>
      <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        <Select v-model="statusFilter" placeholder="All statuses">
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </Select>
        <Select v-model="vehicleFilter" placeholder="All vehicles">
          <SelectItem value="all">All vehicles</SelectItem>
          <SelectItem v-for="v in vehicleOptions" :key="v" :value="v">{{ v }}</SelectItem>
        </Select>
        <Select v-model="sortBy" placeholder="Sort by">
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="name">Name (A–Z)</SelectItem>
        </Select>
      </div>
      <Button
        v-if="hasActiveFilters"
        variant="outline"
        size="sm"
        class="shrink-0"
        @click="resetFilters"
      >
        <X class="mr-1 h-3.5 w-3.5" />
        Reset
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 6" :key="i">
        <CardHeader>
          <Skeleton class="h-5 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="mb-2 h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>

    <!-- No applications at all -->
    <EmptyState
      v-else-if="applications.length === 0"
      title="No Applications"
      description="No rider applications have been submitted yet."
      :icon="Bike"
    />

    <!-- No matches for current filters -->
    <EmptyState
      v-else-if="filteredApplications.length === 0"
      title="No matching applications"
      description="Try adjusting your search or filters."
      :icon="Search"
    />

    <template v-else>
      <p class="mb-3 text-sm text-muted-foreground">
        Showing {{ filteredApplications.length }} of {{ applications.length }} applications
      </p>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="application in filteredApplications"
          :key="application._id"
          class="flex flex-col overflow-hidden"
        >
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center justify-between gap-2">
              <span class="flex min-w-0 items-center gap-3">
                <Avatar class="h-10 w-10 shrink-0">
                  <AvatarImage v-if="application.photo_image" :src="application.photo_image" :alt="application.name" />
                  <AvatarFallback>{{ initials(application.name) }}</AvatarFallback>
                </Avatar>
                <span class="min-w-0">
                  <span class="block truncate font-semibold">{{ application.name }}</span>
                  <span class="block truncate text-xs font-normal text-muted-foreground">
                    Applied {{ timeAgo(application.createdAt) }}
                  </span>
                </span>
              </span>
              <Badge :class="statusClass(application.status)" class="shrink-0 capitalize">
                {{ application.status }}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent class="flex flex-1 flex-col space-y-2">
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ application.phone_no }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ application.cnic }}</span>
            </div>
            <div class="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin class="mt-0.5 h-4 w-4 shrink-0" />
              <span class="line-clamp-2">{{ application.address }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Bike class="h-4 w-4 shrink-0" />
              <span class="truncate">{{ application.vehicle_type }}</span>
            </div>

            <!-- Document verification progress -->
            <div class="pt-1">
              <div class="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Documents verified</span>
                <span class="font-medium">{{ docProgress(application).approved }}/{{ docProgress(application).total }}</span>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full rounded-full bg-green-500 transition-all"
                  :style="{ width: docProgress(application).percent + '%' }"
                />
              </div>
            </div>

            <!-- Admin message indicator -->
            <div
              v-if="application.admin_message"
              class="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <MessageSquare class="h-3.5 w-3.5 shrink-0" />
              <span class="truncate">Note sent to applicant</span>
            </div>

            <!-- Uploaded images -->
            <div class="grid grid-cols-4 gap-2 pt-1">
              <a
                v-for="img in imageList(application)"
                :key="img.key"
                :href="img.url || undefined"
                target="_blank"
                rel="noopener"
                class="block"
                :title="img.label"
              >
                <img
                  v-if="img.url"
                  :src="img.url"
                  :alt="img.label"
                  class="h-16 w-full rounded-md border object-cover"
                />
                <div
                  v-else
                  class="flex h-16 w-full items-center justify-center rounded-md border border-dashed text-center text-[10px] text-muted-foreground"
                >
                  {{ img.label }}
                </div>
              </a>
            </div>

            <!-- Actions -->
            <div class="mt-auto flex gap-2 pt-3">
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
              <ArrowRight class="h-3 w-3" />
            </router-link>
          </CardContent>
        </Card>
      </div>
    </template>
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  CreditCard,
  MapPin,
  Bike,
  ArrowRight,
  Search,
  X,
  SlidersHorizontal,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-vue-next";

const queryClient = useQueryClient();
const updatingId = ref(null);

// --- Filters / search state ---
const search = ref("");
const statusFilter = ref("all");
const vehicleFilter = ref("all");
const sortBy = ref("newest");

const { data: applicationsData, isLoading: loading } = useQuery({
  queryKey: QUERY_KEYS.RIDER_APPS,
  queryFn: async () => {
    const response = await riderApplicationApi.getAll();
    // Backend wraps the list in { status, message, data }
    return response.data?.data ?? response.data ?? [];
  },
});

const applications = computed(() => applicationsData.value ?? []);

// Distinct vehicle types present in the data, for the vehicle filter.
const vehicleOptions = computed(() => {
  const set = new Set(
    applications.value.map((a) => a.vehicle_type).filter(Boolean)
  );
  return [...set].sort();
});

const stats = computed(() => {
  const count = (status) =>
    applications.value.filter((a) => a.status === status).length;
  return [
    { key: "all", label: "Total", count: applications.value.length, icon: Users, iconClass: "bg-muted text-foreground" },
    { key: "pending", label: "Pending", count: count("pending"), icon: Clock, iconClass: "bg-yellow-100 text-yellow-700" },
    { key: "approved", label: "Approved", count: count("approved"), icon: CheckCircle2, iconClass: "bg-green-100 text-green-700" },
    { key: "rejected", label: "Rejected", count: count("rejected"), icon: XCircle, iconClass: "bg-red-100 text-red-700" },
  ];
});

const hasActiveFilters = computed(
  () =>
    !!search.value ||
    statusFilter.value !== "all" ||
    vehicleFilter.value !== "all" ||
    sortBy.value !== "newest"
);

const filteredApplications = computed(() => {
  const term = search.value.trim().toLowerCase();
  let list = applications.value.filter((a) => {
    if (statusFilter.value !== "all" && a.status !== statusFilter.value) return false;
    if (vehicleFilter.value !== "all" && a.vehicle_type !== vehicleFilter.value) return false;
    if (term) {
      const haystack = [a.name, a.phone_no, a.cnic, a.address, a.vehicle_type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  list = [...list];
  if (sortBy.value === "name") {
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else {
    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortBy.value === "oldest" ? da - db : db - da;
    });
  }
  return list;
});

const imageList = (a) => [
  { key: "cnic_front", label: "CNIC Front", url: a.cnic_front_image },
  { key: "cnic_back", label: "CNIC Back", url: a.cnic_back_image },
  { key: "photo", label: "Photo", url: a.photo_image },
  { key: "vehicle", label: "Vehicle", url: a.vehicle_image },
];

const DOC_KEYS = ["cnic_front_image", "cnic_back_image", "photo_image", "vehicle_image"];

// How many of the four documents an admin has explicitly approved.
const docProgress = (a) => {
  const total = DOC_KEYS.length;
  const approved = DOC_KEYS.filter(
    (k) => a.documents?.[k]?.status === "approved"
  ).length;
  return { approved, total, percent: Math.round((approved / total) * 100) };
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const timeAgo = (value) => {
  if (!value) return "recently";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "recently";
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
};

const statusClass = (status) => {
  if (status === "approved") return "border-transparent bg-green-100 text-green-700 hover:bg-green-100";
  if (status === "rejected") return "border-transparent bg-red-100 text-red-700 hover:bg-red-100";
  return "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
};

const resetFilters = () => {
  search.value = "";
  statusFilter.value = "all";
  vehicleFilter.value = "all";
  sortBy.value = "newest";
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
