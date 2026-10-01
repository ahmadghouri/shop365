<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Providers" description="Manage your service providers">
      <template #actions>
        <Button @click="showForm = true">
          <Plus class="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </template>
    </PageHeader>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard
        title="Total Providers"
        :value="businessStore.businesses.length"
        :icon="Store"
        description="all registered"
        :loading="businessStore.loading"
      />
      <StatCard
        title="On Discount"
        :value="discountedCount"
        :icon="Percent"
        description="running offers"
        :loading="businessStore.loading"
      />
      <StatCard
        title="Provider Types"
        :value="typeCount"
        :icon="LayoutGrid"
        description="categories covered"
        :loading="businessStore.loading"
      />
      <StatCard
        title="Avg. Rating"
        :value="avgRating"
        :icon="Star"
        description="across providers"
        :loading="businessStore.loading"
      />
    </div>

    <!-- Toolbar: search + type filter -->
    <div class="flex flex-col sm:flex-row gap-3 mt-6 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Search providers…" class="pl-9" />
      </div>
      <select
        v-model="typeFilter"
        class="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-52"
      >
        <option value="">All types</option>
        <option v-for="t in providerTypes" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <div v-if="businessStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card v-for="i in 4" :key="i" class="overflow-hidden">
        <CardHeader>
          <Skeleton class="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-1/2 mb-2" />
          <Skeleton class="h-4 w-1/3" />
        </CardContent>
        <CardFooter>
          <Skeleton class="h-9 w-full" />
        </CardFooter>
      </Card>
    </div>

    <EmptyState
      v-else-if="filteredBusinesses.length === 0"
      title="No Providers"
      :description="searchQuery || typeFilter ? 'No providers match your filters.' : 'Get started by adding your first provider.'"
      :icon="Store"
      actionLabel="Add Provider"
      @action="showForm = true"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <router-link
        v-for="restaurant in filteredBusinesses"
        :key="restaurant.id"
        :to="{
          name: 'Products',
          params: { id: restaurant.id || restaurant._id },
          query: { title: restaurant.name },
        }"
      >
        <Card class="group h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
          <div class="relative flex h-40 items-center justify-center bg-muted/50 p-3">
            <img
              v-if="restaurant.image_url"
              :src="restaurant.image_url"
              :alt="restaurant.name"
              class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <Store v-else class="h-12 w-12 text-muted-foreground/40" />
            <Badge
              v-if="restaurant.discount > 0"
              variant="destructive"
              class="absolute top-2 left-2 text-[11px]"
            >
              {{ restaurant.discount }}% OFF
            </Badge>
          </div>
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <CardTitle class="truncate">{{ restaurant.name }}</CardTitle>
                <CardDescription class="capitalize">{{ restaurant.type }}</CardDescription>
              </div>
              <div class="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
                <Star class="h-3 w-3 text-amber-500 fill-amber-500" />
                <span class="text-xs font-semibold text-slate-700">
                  {{ Number(restaurant.reviews_avg_rating || 0).toFixed(1) }}
                </span>
                <span class="text-[11px] text-muted-foreground">({{ restaurant.reviews_count || 0 }})</span>
              </div>
            </div>
          </CardHeader>
          <CardFooter class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              class="flex-1"
              @click.prevent="editRestaurant(restaurant)"
            >
              <Pencil class="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              class="flex-1"
              @click.prevent="showDeleteConfirmation(restaurant.id)"
            >
              <Trash2 class="w-4 h-4 mr-1" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      </router-link>
    </div>

    <Dialog :open="showForm" @update:open="showForm = $event">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Provider</DialogTitle>
          <DialogDescription>Create a new service provider entry.</DialogDescription>
        </DialogHeader>
        <AddRestaurantForm @close="showForm = false" />
      </DialogContent>
    </Dialog>

    <Dialog :open="showEditForm" @update:open="handleEditDialogChange">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
          <DialogDescription>Update provider details.</DialogDescription>
        </DialogHeader>
        <EditRestaurantForm
          v-if="selectedRestaurant"
          :key="selectedRestaurant.id || selectedRestaurant._id"
          :restaurant="selectedRestaurant"
          @close="handleEditDialogChange(false)"
        />
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="showDeleteConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this provider? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useBusinessStore } from "@/store/businessStore.js";
import AddRestaurantForm from "@/components/AddRestaurant.vue";
import EditRestaurantForm from "@/components/EditRestaurant.vue";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Store, Percent, LayoutGrid, Star, Search } from "lucide-vue-next";

const businessStore = useBusinessStore();
const showForm = ref(false);
const searchQuery = ref("");
const typeFilter = ref("");

const providerTypes = computed(() => {
  const set = new Set(
    (businessStore.businesses || []).map((b) => b.type).filter(Boolean),
  );
  return [...set].sort();
});

const filteredBusinesses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return (businessStore.businesses || []).filter((b) => {
    if (typeFilter.value && b.type !== typeFilter.value) return false;
    if (!q) return true;
    return (b.name || "").toLowerCase().includes(q);
  });
});

const discountedCount = computed(
  () => (businessStore.businesses || []).filter((b) => Number(b.discount) > 0).length,
);
const typeCount = computed(() => providerTypes.value.length);
const avgRating = computed(() => {
  const list = (businessStore.businesses || []).filter((b) => b.reviews_count > 0);
  if (!list.length) return "0.0";
  const sum = list.reduce((s, b) => s + Number(b.reviews_avg_rating || 0), 0);
  return (sum / list.length).toFixed(1);
});
const showEditForm = ref(false);
const showDeleteConfirm = ref(false);
const selectedRestaurant = ref(null);
const restaurantToDeleteId = ref(null);

const editRestaurant = (restaurant) => {
  selectedRestaurant.value = restaurant;
  showEditForm.value = true;
};

const handleEditDialogChange = (open) => {
  showEditForm.value = open;
  if (!open) selectedRestaurant.value = null;
};

const showDeleteConfirmation = (id) => {
  restaurantToDeleteId.value = id;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (restaurantToDeleteId.value) {
    await businessStore.deleteBusiness(restaurantToDeleteId.value);
    showDeleteConfirm.value = false;
    restaurantToDeleteId.value = null;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  restaurantToDeleteId.value = null;
};

onMounted(() => {
  businessStore.getBusinesses();
});
</script>
