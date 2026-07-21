<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Restaurants" description="Manage your restaurants">
      <template #actions>
        <Button @click="showForm = true">
          <Plus class="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </template>
    </PageHeader>

    <div class="mb-6">
      <StatCard
        title="Total Restaurants"
        :value="businessStore.businesses.length"
        :icon="Store"
        description="All registered restaurants"
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
      title="No Restaurants"
      description="Get started by adding your first restaurant."
      :icon="Store"
      actionLabel="Add Restaurant"
      @action="showForm = true"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <router-link
        v-for="restaurant in businessStore.businesses"
        :key="restaurant.id"
        :to="{
          name: 'Products',
          params: { id: restaurant.id },
          query: { title: restaurant.name },
        }"
      >
        <Card class="h-full transition-shadow hover:shadow-md cursor-pointer">
          <CardHeader>
            <CardTitle class="truncate">{{ restaurant.name }}</CardTitle>
            <CardDescription>{{ restaurant.type }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-1 text-sm text-muted-foreground">
              <p class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                Opens: {{ restaurant.opening_time }}
              </p>
              <p class="flex items-center gap-2">
                <Clock class="w-4 h-4" />
                Closes: {{ restaurant.closing_time }}
              </p>
            </div>
          </CardContent>
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

    <Dialog v-model:open="showForm">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Restaurant</DialogTitle>
          <DialogDescription>Create a new restaurant entry.</DialogDescription>
        </DialogHeader>
        <AddRestaurantForm @close="showForm = false" />
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showEditForm">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
          <DialogDescription>Update restaurant details.</DialogDescription>
        </DialogHeader>
        <EditRestaurantForm
          :restaurant="selectedRestaurant"
          @close="showEditForm = false"
        />
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="showDeleteConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this restaurant? This action cannot be undone.
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
import { Plus, Pencil, Trash2, Clock, Store } from "lucide-vue-next";

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
