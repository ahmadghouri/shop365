<template>
  <div class="bg-gray-100 min-h-screen mobile-spacing">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">All Restaurants</h1>
      <button
        @click="showForm = true"
        class="bg-blue-500 px-4 py-1 text-white rounded-md"
      >
        Add
      </button>
    </div>
    <div
      v-if="showForm"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <AddRestaurantForm @close="showForm = false" />
    </div>
    <div
      v-if="showEditForm"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <EditRestaurantForm
        :restaurant="selectedRestaurant"
        @close="showEditForm = false"
      />
    </div>
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p class="mb-4">Are you sure you want to delete this restaurant?</p>
        <div class="flex justify-end space-x-2">
          <button
            @click="confirmDelete"
            class="bg-red-500 px-4 py-2 text-white rounded-md"
          >
            Delete
          </button>
          <button
            @click="cancelDelete"
            class="bg-gray-300 px-4 py-2 text-gray-800 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <router-link
        v-for="restaurant in businessStore.businesses"
        :key="restaurant.id"
        :to="{
          name: 'Products',
          params: { id: restaurant.id },
          query: { title: restaurant.name },
        }"
        class="bg-white shadow-md rounded-lg overflow-hidden"
      >
        <div class="p-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">
              {{ restaurant.name }}
            </h2>
            <p class="text-gray-700 mb-2">{{ restaurant.type }}</p>
          </div>

          <div class="flex justify-between items-center">
            <p class="text-gray-600 text-sm mb-2">
              Opening Time: {{ restaurant.opening_time }}
            </p>
            <p class="text-gray-600 text-sm mb-2">
              Closing Time: {{ restaurant.closing_time }}
            </p>
          </div>

          <div class="flex gap-2 items-center">
            <button
              @click.stop.prevent="editRestaurant(restaurant)"
              class="bg-green-500 px-4 py-2 text-white rounded-md"
            >
              Edit
            </button>
            <button
              @click.stop.prevent="showDeleteConfirmation(restaurant.id)"
              class="bg-red-500 px-4 py-2 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useBusinessStore } from "../../store/businessStore.js";
import AddRestaurantForm from "../../components/AddRestaurant.vue";
import EditRestaurantForm from "../../components/EditRestaurant.vue";

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

<style scoped></style>
