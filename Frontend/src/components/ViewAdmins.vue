<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6 text-gray-700">Vendor Admins</h1>

    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center h-screen bg-gray-100">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="text-center text-red-500">
      <p>Error fetching vendor admins: {{ error }}</p>
    </div>

    <!-- Vendor List -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="vendor in vendors" :key="vendor.id" class="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">{{ vendor.name }}</h2>
        <p class="text-sm text-gray-500">Phone: {{ vendor.phone_no }}</p>
        <p class="text-sm text-gray-500">
          Business:
          <span class="font-semibold text-slate-900">{{
            vendor.business_name
          }}</span>
        </p>
        <p class="text-sm text-gray-500">
          Created At: {{ new Date(vendor.created_at).toLocaleDateString() }}
        </p>

        <!-- Edit Button -->
        <button @click="openEditModal(vendor)" class="mt-4 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
          Edit
        </button>

        <button @click="showDeleteConfirmation(vendor.id)"
          class="mt-4 ml-2 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p class="mb-4">Are you sure you want to delete this Admin?</p>
        <div class="flex justify-end space-x-2">
          <button @click="confirmDelete" class="bg-red-500 px-4 py-2 text-white rounded-md">
            Delete
          </button>
          <button @click="cancelDelete" class="bg-gray-300 px-4 py-2 text-gray-800 rounded-md">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Admin Modal -->
    <div v-if="showEditModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 class="text-lg font-semibold mb-4">Edit Admin</h2>

        <form @submit.prevent="updateAdmin">
          <div class="mb-4">
            <label class="block text-gray-700">Name</label>
            <input type="text" v-model="editVendor.name" class="border p-2 rounded w-full" />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700">Phone Number</label>
            <input type="text" v-model="editVendor.phone_no" @input="validatePhoneNumber"
              class="border p-2 rounded w-full" />
            <!-- Display error message for phone number -->
            <p v-if="phoneError" class="text-red-500 text-sm">
              {{ phoneError }}
            </p>
          </div>
          <div class="flex justify-end">
            <button type="button" @click="closeEditModal"
              class="mr-2 bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit" class="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useUserStore } from "../store/userStore";
import { toast } from "vue3-toastify";
import { useAuthStore } from "../stores/authStore";
import { storeToRefs } from "pinia";

const vendors = ref([]);
const loading = ref(false);
const error = ref(null);
const showEditModal = ref(false);
const editVendor = ref({ name: "", phone_no: "", id: null });
const phoneError = ref("");
const userStore = useUserStore();
const showDeleteConfirm = ref(false);
const userId = ref("");


const authStore = useAuthStore();
const { token } = storeToRefs(authStore);


const showDeleteConfirmation = (id) => {
  userId.value = id;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  restaurantToDeleteId.value = null;
};

const confirmDelete = async () => {
  if (userId.value) {
    await userStore.deleteUser(userId.value);
    showDeleteConfirm.value = false;
    userId.value = null;
    toast.success("Admin Deleted Successfully");
  }
};

const fetchVendors = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/vendors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    vendors.value = response.data.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    loading.value = false;
  }
};

const deleteAdmin = async (id) => {
  try {
    await userStore.deleteUser(id);
    toast.success(
      "Admin deleted successfully. Please refresh to see the results"
    );
  } catch (error) {
    toast.error("Something went wrong");
  }
};

const openEditModal = (vendor) => {
  editVendor.value = { ...vendor };
  showEditModal.value = true;
  phoneError.value = "";
};

// Close the edit modal
const closeEditModal = () => {
  showEditModal.value = false;
  editVendor.value = { name: "", phone_no: "", id: null }; // reset the form
  phoneError.value = ""; // Reset phone error on modal close
};

// Validate phone number
const validatePhoneNumber = () => {
  const phoneNumber = editVendor.value.phone_no;
  if (phoneNumber.length !== 11) {
    phoneError.value = "Phone number must be 11 digits long.";
  } else {
    phoneError.value = ""; // Clears error if valid
  }
};

// Update admin
const updateAdmin = async () => {
  // Ensure validation before proceeding
  validatePhoneNumber();
  if (phoneError.value) return; // Prevent update if there is an error

  try {
    await axios.put(
      `${API_BASE_URL}/api/admin/admins/${editVendor.value.id}`,
      {
        name: editVendor.value.name,
        phone_no: editVendor.value.phone_no,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Refresh vendor list after successful update
    fetchVendors();
    closeEditModal();
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  }
};

// Fetch the vendors on page load
onMounted(() => {
  fetchVendors();
});
</script>

<style scoped>
body {
  background-color: #f7fafc;
}

h1 {
  font-family: "Poppins", sans-serif;
}

.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
</style>
