<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Vouchers</h1>
      <button
        @click="openCreateVoucherModal"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Create Voucher
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Loading vouchers...</p>
    </div>

    <div v-else-if="vouchers.length === 0" class="text-center py-8">
      <p class="text-gray-600">No vouchers found.</p>
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="voucher in vouchers"
        :key="voucher.id"
        class="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
      >
        <div>
          <div class="flex items-center space-x-4">
            <div>
              <p class="font-semibold text-gray-800">
                {{ voucher.code.toUpperCase() }}
              </p>
              <p class="text-sm text-gray-600">
                Discount: {{ voucher.discount_amount }}
              </p>
            </div>
            <div class="text-sm text-gray-500">
              <p>Expires: {{ formatDate(voucher.expiry_date) }}</p>
              <p>
                Status:
                <span
                  :class="{
                    'text-green-600': !voucher.is_used,
                    'text-red-600': voucher.is_used,
                  }"
                >
                  {{ voucher.is_used ? "Used" : "Active" }}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="confirmDelete(voucher.id)"
            class="text-red-600 hover:text-red-800 transition-colors"
            title="Delete Voucher"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showDeleteConfirmation"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 class="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p class="mb-6">Are you sure you want to delete this voucher?</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteConfirmation = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            @click="executeDelete"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import useVoucherStore from "../../store/voucherStore";
import { useRouter } from "vue-router";

// Store setup
const voucherStore = useVoucherStore();
const { vouchers } = storeToRefs(voucherStore);
const route = useRouter();

// State
const loading = ref(true);
const showDeleteConfirmation = ref(false);
const voucherToDelete = ref(null);

// Lifecycle
onMounted(async () => {
  try {
    await voucherStore.fetchVouchers();
  } catch (error) {
    // Handle error (could add error toast/notification)
    console.error("Failed to fetch vouchers", error);
  } finally {
    loading.value = false;
  }
});

// Methods
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function confirmDelete(id) {
  voucherToDelete.value = id;
  showDeleteConfirmation.value = true;
}

async function executeDelete() {
  if (voucherToDelete.value) {
    try {
      await voucherStore.deleteVoucher(voucherToDelete.value);
      showDeleteConfirmation.value = false;
      voucherToDelete.value = null;
    } catch (error) {
      // Handle error (could add error toast/notification)
      console.error("Failed to delete voucher", error);
      showDeleteConfirmation.value = false;
    }
  }
}

function openCreateVoucherModal() {
  route.push("/admin/create-voucher");
}
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
</style>
