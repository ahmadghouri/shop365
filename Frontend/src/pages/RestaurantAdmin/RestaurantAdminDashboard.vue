<template>
  <div class="container mx-auto mobile-spacing">
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold mb-4">Select a Product</h1>
      <router-link
        class="bg-blue-500 px-5 py-1 mb-4 text-white rounded-md"
        to="/admin/store-product"
        >ADD</router-link
      >
    </div>
    <div class="relative mb-4">
      <select
        v-model="selectedProduct"
        @change="loadProductDetails"
        class="block w-full p-3 rounded-md bg-white text-gray-800 text-lg focus:outline-none"
      >
        <option value="" disabled>Select a Product</option>
        <option
          v-for="product in productStore.products"
          :key="product.id"
          :value="product"
        >
          {{ product.title }}
        </option>
      </select>

      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <svg
          class="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
    </div>

    <div v-if="selectedProduct" class="mt-4">
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="text"
            id="price"
            v-model="form.price"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            for="description"
            class="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        <div>
          <label for="type" class="block text-sm font-medium text-gray-700">
            Type
          </label>
          <input
            type="text"
            id="type"
            v-model="form.type"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out"
        >
          Submit
        </button>
        <button
          type="button"
          @click="closeForm"
          class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-150 ease-in-out"
        >
          Cancel
        </button>
      </form>
    </div>

    <div v-else>
      <h1 class="text-2xl font-semibold mb-4">Product List</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="product in productStore.products"
          :key="product.id"
          class="bg-white shadow-md rounded-lg overflow-hidden"
        >
          <div class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-semibold">{{ product.title }}</h2>
                <p class="text-gray-600">{{ product.description }}</p>
              </div>
              <div class="mt-1">
                <span class="text-lg font-bold">{{ product.price }}</span>
              </div>
            </div>
            <div class="mt-4 flex space-x-4">
              <button
                @click="confirmDelete(product.id)"
                class="text-red-500 border-2 w-full font-bold border-red-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Delete
              </button>

              <button
                @click="openFormForUpdate(product)"
                class="bg-yellow-500 text-white w-full font-bold rounded-lg px-4 py-2 hover:bg-yellow-600 transition duration-150 ease-in-out"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4"
    >
      <div class="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full md:w-1/3">
        <h2 class="text-lg font-semibold mb-4 text-center">Confirm Deletion</h2>
        <p class="text-center mb-4">
          Are you sure you want to delete this product?
        </p>
        <div
          class="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4"
        >
          <button
            @click="deleteProduct(confirmDeleteId)"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150 ease-in-out w-full md:w-auto"
          >
            Yes, Delete
          </button>
          <button
            @click="cancelDelete"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-150 ease-in-out w-full md:w-auto"
          >
            Cancel
          </button>
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
const showConfirmModal = ref(false);
const confirmDeleteId = ref(null);

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
  router.push({ path: router.currentRoute.value.fullPath });
};

const openFormForUpdate = (product) => {
  selectedProduct.value = product;
  loadProductDetails();
};

const submitForm = async () => {
  const formData = new FormData();
  formData.append("title", form.value.title);
  formData.append("description", form.value.description);
  formData.append("price", form.value.price.toString()); // Convert to string

  if (form.value.image) {
    formData.append("image", form.value.image);
  }

  formData.append("_method", "PUT");

  try {
    await productStore.updateProduct(formData, selectedProduct.value.id);
    closeForm();
    toast.success("Product updated successfully, Refresh to see the update");
  } catch (error) {
    console.error("Error updating product:", error);
  }
};

const confirmDelete = (productId) => {
  confirmDeleteId.value = productId;
  showConfirmModal.value = true;
};

const cancelDelete = () => {
  showConfirmModal.value = false;
  confirmDeleteId.value = null;
};

const deleteProduct = async (productId) => {
  await productStore.deleteProduct(productId);
  showConfirmModal.value = false;
  confirmDeleteId.value = null;
  toast.success("Product deleted successfully!");
};

onMounted(async () => {
  await productStore.getRestaurantProducts();
});
</script>

<style scoped>
/* Custom styling for the select element */
select::-ms-expand {
  display: none;
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
</style>
