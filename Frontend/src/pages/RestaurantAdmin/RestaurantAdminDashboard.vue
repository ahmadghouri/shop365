<template>
  <div class="container mx-auto">
    <h1 class="text-2xl font-bold mb-4">Select a Product</h1>
    <div class="mb-4">
      <select
        v-model="selectedProduct"
        @change="loadProductDetails"
        class="p-2 border rounded"
      >
        <option value="" disabled selected>Select Food</option>
        <option
          v-for="product in productStore.products"
          :key="product.id"
          :value="product"
        >
          {{ product.title }}
        </option>
      </select>
    </div>

    <div v-if="selectedProduct" class="mt-4">
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700"
            >Title</label
          >
          <input
            type="text"
            id="title"
            v-model="form.title"
            class="mt-1 p-2 block w-full border rounded"
            required
          />
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700"
            >Price</label
          >
          <input
            type="string"
            id="price"
            v-model="form.price"
            class="mt-1 p-2 block w-full border rounded"
            required
          />
        </div>

        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700"
            >Description</label
          >
          <textarea
            id="description"
            v-model="form.description"
            class="mt-1 p-2 block w-full border rounded"
            required
          ></textarea>
        </div>

        <div>
          <label for="type" class="block text-sm font-medium text-gray-700"
            >Type</label
          >
          <input
            type="text"
            id="type"
            v-model="form.type"
            class="mt-1 p-2 block w-full border rounded"
            required
          />
        </div>

        <button
          type="submit"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>

    <div v-else>
      <h1 class="text-xl font-bold mb-4">Product List</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="product in productStore.products"
          :key="product.id"
          class="bg-white shadow-md rounded-lg overflow-hidden"
        >
          <div class="p-4">
            <h2 class="text-xl font-semibold">{{ product.title }}</h2>
            <p class="text-gray-600">{{ product.description }}</p>
            <div class="mt-1">
              <span class="text-lg font-bold">{{ product.price }}</span>
            </div>
            <div class="mt-2 flex space-x-2">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const router = useRouter();
const productStore = useProductStore();

const selectedProduct = ref(null);
const form = ref({
  title: "",
  price: "",
  description: "",
  type: "",
});

const loadProductDetails = () => {
  if (selectedProduct.value) {
    form.value = {
      title: selectedProduct.value.title,
      price: selectedProduct.value.price,
      description: selectedProduct.value.description,
      type: selectedProduct.value.type,
    };
  }
};

const closeForm = () => {
  selectedProduct.value = null;
  form.value = {
    title: "",
    price: "",
    description: "",
    type: "",
  };
};

const submitForm = async () => {
  await productStore.updateProduct(form.value, selectedProduct.value.id);
  closeForm();
  router.push({ name: "RestaurantAdminDashboard" });
  toast.success("Product updated successfully!");
};

const deleteProduct = async (productId) => {
  await productStore.deleteProduct(productId);
};

onMounted(async () => {
  await productStore.getRestaurantProducts();
});
</script>

<style scoped></style>
