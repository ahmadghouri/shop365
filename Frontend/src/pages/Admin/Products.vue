<template>
  <div class="container mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">{{ title }}</h1>
      <button
        @click="addProduct"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        Add
      </button>
    </div>

    <!-- Add Product Form Modal -->
    <div
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
      v-if="showForm"
    >
      <AddProduct @close="showForm = false" />
    </div>

    <!-- Edit Product Form Modal -->
    <div
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
      v-if="editFormVisible"
    >
      <EditProduct
        :product="selectedProduct"
        @close="editFormVisible = false"
        @save="handleProductUpdate"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
      v-if="showDeleteConfirm"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p class="mb-4">Are you sure you want to delete this product?</p>
        <div class="flex justify-end space-x-2">
          <button
            @click="confirmDelete"
            class="bg-red-500 px-4 py-2 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
          <button
            @click="cancelDelete"
            class="bg-gray-300 px-4 py-2 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="product in productStore.adminProducts"
        :key="product.id"
        class="bg-white shadow-md rounded-lg overflow-hidden"
      >
        <div class="p-4">
          <h2 class="text-xl font-semibold">{{ product.title }}</h2>
          <!-- <div v-html="product.description" class="prose max-w-none"></div> -->
          <p v-html="product.description" class="prose max-w-none"></p>
          <div class="mt-1">
            <span class="text-lg font-bold">{{ product.price }}</span>
          </div>
          <div class="mt-2 flex space-x-2">
            <button
              @click="editProduct(product)"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              @click="showDeleteConfirmation(product.id)"
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
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
