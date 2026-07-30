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

    <div class="mb-6">
      <StatCard
        title="Total Providers"
        :value="businessStore.businesses.length"
        :icon="Store"
        description="All registered providers"
        :loading="businessStore.loading"
      />
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
      v-else-if="businessStore.businesses.length === 0"
      title="No Providers"
      description="Get started by adding your first provider."
      :icon="Store"
      actionLabel="Add Provider"
      @action="showForm = true"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <router-link
        v-for="restaurant in businessStore.businesses"
        :key="restaurant.id"
        :to="{
          name: 'Products',
          params: { id: restaurant.id || restaurant._id },
          query: { title: restaurant.name },
        }"
      >
        <Card class="h-full transition-shadow hover:shadow-md cursor-pointer">
          <div v-if="restaurant.image_url" class="flex h-40 items-center justify-center bg-muted/50 p-3">
            <img :src="restaurant.image_url" :alt="restaurant.name" class="h-full w-full object-contain" />
          </div>
          <CardHeader>
            <CardTitle class="truncate">{{ restaurant.name }}</CardTitle>
            <CardDescription>{{ restaurant.type }}</CardDescription>
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
import { ref, onMounted } from "vue";
import { useBusinessStore } from "@/store/businessStore.js";
import AddRestaurantForm from "@/components/AddRestaurant.vue";
import EditRestaurantForm from "@/components/EditRestaurant.vue";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Store } from "lucide-vue-next";

const businessStore = useBusinessStore();
const showForm = ref(false);
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
