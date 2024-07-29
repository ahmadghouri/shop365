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

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="product in productStore.products"
        :key="product.id"
        class="bg-white shadow-md rounded-lg overflow-hidden"
      >
        <!-- <img
          :src="product.image_url"
          alt="Product Image"
          class="w-full h-48 object-cover"
        /> -->
        <div class="p-4">
          <h2 class="text-xl font-semibold">{{ product.title }}</h2>
          <p class="text-gray-600">{{ product.description }}</p>
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
              @click="deleteProduct(product.id)"
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

const title = ref(route.query.title);

onMounted(async () => {
  await productStore.getProducts(route.params.id);
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

const deleteProduct = async (productId) => {
  await productStore.deleteProduct(productId);
};
</script>

<style scoped></style>
