<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-row items-center justify-between mb-6">
      <div class="flex items-center">
        <h1 class="text-2xl sm:text-3xl font-bold">{{ title }}</h1>
      </div>
      <button
        @click="addProduct"
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
      <!-- Add Product Modal -->
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
            <AddProduct @close="showForm = false" />
          </div>
        </div>
      </div>

      <!-- Edit Product Modal -->
      <div
        v-if="editFormVisible"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-center min-h-screen px-4">
          <div
            class="fixed inset-0 bg-gray-900 bg-opacity-50"
            @click="editFormVisible = false"
          ></div>
          <div class="relative bg-white rounded-lg w-full max-w-2xl mx-auto">
            <EditProduct
              :product="selectedProduct"
              @close="editFormVisible = false"
              @save="handleProductUpdate"
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
            <p class="mb-6">Are you sure you want to delete this product?</p>
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

    <!-- Product Grid -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="product in productStore.adminProducts"
        :key="product.id"
        class="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col"
      >
        <div class="p-6 flex flex-col h-full">
          <h2 class="text-xl font-semibold mb-3 truncate">
            {{ product.title }}
          </h2>
          <div class="prose prose-sm max-w-none mb-4 flex-grow">
            <div v-html="product.description"></div>
          </div>
          <div class="mt-auto">
            <p class="text-lg font-bold mb-4">
              PKR{{ parseFloat(product.price).toFixed(2) }}
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="editProduct(product)"
                class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Edit
              </button>
              <button
                @click="showDeleteConfirmation(product.id)"
                class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "../../store/productStore.js";
import AddProduct from "../../components/AddProduct.vue";
import EditProduct from "../../components/EditProduct.vue";

const route = useRoute();
const productStore = useProductStore();
const showForm = ref(false);
const editFormVisible = ref(false);
const selectedProduct = ref(null);
const showDeleteConfirm = ref(false);
const productToDeleteId = ref(null);

const title = ref(route.query.title);

onMounted(async () => {
  await productStore.getProductsAdmin(route.params.id);
});

const addProduct = () => {
  showForm.value = true;
};

const editProduct = (product) => {
  selectedProduct.value = product;
  editFormVisible.value = true;
};

const handleProductUpdate = () => {
  productStore.getProducts(route.params.id);
};

const showDeleteConfirmation = (productId) => {
  productToDeleteId.value = productId;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  if (productToDeleteId.value) {
    await productStore.deleteProduct(productToDeleteId.value);
    showDeleteConfirm.value = false;
    productToDeleteId.value = null;
    await productStore.getProducts(route.params.id);
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  productToDeleteId.value = null;
};
</script>

<style scoped></style>
