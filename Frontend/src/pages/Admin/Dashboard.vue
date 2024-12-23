<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-row items-center justify-between mb-6">
      <div class="flex items-center">
        <h1 class="text-2xl sm:text-3xl font-bold">All Restaurants</h1>
      </div>
      <button
        @click="showForm = true"
        class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Add Restaurant Modal -->
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-center min-h-screen px-4">
          <div
            class="fixed inset-0 bg-gray-900 bg-opacity-50"
            @click="showForm = false"
          ></div>
          <div class="relative bg-white rounded-lg w-full max-w-2xl mx-auto">
            <AddRestaurantForm @close="showForm = false" />
          </div>
        </div>
      </div>

      <!-- Edit Restaurant Modal -->
      <div
        v-if="showEditForm"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-center min-h-screen px-4">
          <div
            class="fixed inset-0 bg-gray-900 bg-opacity-50"
            @click="showEditForm = false"
          ></div>
          <div class="relative bg-white rounded-lg w-full max-w-2xl mx-auto">
            <EditRestaurantForm
              :restaurant="selectedRestaurant"
              @close="showEditForm = false"
            />
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-center min-h-screen px-4">
          <div
            class="fixed inset-0 bg-gray-900 bg-opacity-50"
            @click="cancelDelete"
          ></div>
          <div class="relative bg-white rounded-lg w-full max-w-md mx-auto p-6">
            <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p class="mb-6">Are you sure you want to delete this restaurant?</p>
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <button
                @click="cancelDelete"
                class="w-full sm:w-auto px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="confirmDelete"
                class="w-full sm:w-auto px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Restaurant Grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <router-link
        v-for="restaurant in businessStore.businesses"
        :key="restaurant.id"
        :to="{
          name: 'Products',
          params: { id: restaurant.id },
          query: { title: restaurant.name },
        }"
        class="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col"
      >
        <div class="p-6 flex flex-col h-full">
          <h2 class="text-xl font-semibold mb-3 truncate">
            {{ restaurant.name }}
          </h2>
          <div class="prose prose-sm max-w-none mb-4 flex-grow">
            <p class="text-gray-600">{{ restaurant.type }}</p>
            <div class="flex flex-col mt-2">
              <p class="text-sm text-gray-600">
                Opening Time: {{ restaurant.opening_time }}
              </p>
              <p class="text-sm text-gray-600">
                Closing Time: {{ restaurant.closing_time }}
              </p>
            </div>
          </div>
          <div class="mt-auto">
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click.prevent="editRestaurant(restaurant)"
                class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Edit
              </button>
              <button
                @click.prevent="showDeleteConfirmation(restaurant.id)"
                class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
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
