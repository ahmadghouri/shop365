<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRoute, useRouter } from "vue-router";
import debounce from "lodash/debounce";
import AddSubProduct from "../../components/AddSubProduct.vue";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const businessName = decodeURIComponent(route.params.name);
const businessId = route.params.id;

// Form and UI states
const selectedProduct = ref(null);
const isLoading = ref(false);
const searchQuery = ref("");
const imageError = ref("");
const discount = ref(0);
const showAddModal = ref(false);
const showDeleteConfirm = ref(false);

const form = ref({
  title: "",
  price: "",
  description: "",
  type: "",
  image: null,
});

// Load products with debounced search
const debounceSearch = debounce(async () => {
  isLoading.value = true;
  try {
    await productStore.getProducts(businessId, searchQuery.value);
  } finally {
    isLoading.value = false;
  }
}, 300);

// File handling
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 15 * 1024) {
      // 15KB limit
      imageError.value = "Image size must be less than 15KB";
      event.target.value = "";
      return;
    }
    imageError.value = "";
    form.value.image = file;
  }
};

// Form handlers
const loadProductDetails = () => {
  if (selectedProduct.value) {
    form.value = {
      title: selectedProduct.value.title,
      price: selectedProduct.value.price,
      description: selectedProduct.value.description,
      type: selectedProduct.value.type,
      image: null,
    };
    discount.value = selectedProduct.value.discount || 0;
  }
};

const addProduct = () => {
  showAddModal.value = true;
};

const submitForm = async () => {
  if (selectedProduct.value) {
    const formData = new FormData();
    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null) {
        formData.append(key, form.value[key]);
      }
    });
    await productStore.updateProduct(formData, selectedProduct.value.id);
    clearForm();
    await productStore.getProducts(businessId);
  }
};

const applyDiscountToProduct = async () => {
  if (selectedProduct.value && discount.value >= 0 && discount.value <= 100) {
    const formData = new FormData();
    formData.append("discount", discount.value);
    await productStore.updateProduct(formData, selectedProduct.value.id);
    clearForm();
    await productStore.getProducts(businessId);
  }
};

const openFormForUpdate = (product) => {
  selectedProduct.value = product;
  loadProductDetails();
};

const clearForm = () => {
  selectedProduct.value = null;
  form.value = {
    title: "",
    price: "",
    description: "",
    type: "",
    image: null,
  };
  discount.value = 0;
  imageError.value = "";
};

const handleProductAdded = () => {
  showAddModal.value = false;
  productStore.getProducts(businessId);
};

onMounted(() => {
  productStore.getProducts(businessId);
});
</script>

<template>
  <div class="container mx-auto mobile-spacing">
    <!-- Search Bar -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        @input="debounceSearch"
        type="text"
        placeholder="Search products..."
        class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <div v-if="isLoading" class="mt-2 mb-2 text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"
        ></div>
      </div>
    </div>

    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold mb-4">Select a Product</h1>
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

    <Teleport to="body">
      <!-- Add Product Modal -->
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-center min-h-screen px-4">
          <div
            class="fixed inset-0 bg-gray-900 bg-opacity-50"
            @click="showAddModal = false"
          ></div>
          <div class="relative bg-white rounded-lg w-full max-w-2xl mx-auto">
            <AddSubProduct
              :business="businessName"
              @close="handleProductAdded"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Product Form -->
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
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700"
            >Price</label
          >
          <input
            type="text"
            id="price"
            v-model="form.price"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="image" class="block text-sm font-medium text-gray-700">
            Image (Max 15KB)
          </label>
          <input
            @change="handleFileChange"
            type="file"
            id="image"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p v-if="imageError" class="text-red-500 text-xs mt-1">
            {{ imageError }}
          </p>
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
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Discount Field -->
        <div>
          <label for="discount" class="block text-sm font-medium text-gray-700">
            Discount (%)
          </label>
          <input
            type="number"
            id="discount"
            v-model="discount"
            min="0"
            max="100"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter discount percentage"
          />
        </div>

        <!-- Buttons -->
        <div class="flex space-x-4">
          <button
            type="submit"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            Update Product
          </button>
          <button
            type="button"
            @click="applyDiscountToProduct"
            class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150 ease-in-out"
          >
            Apply Discount
          </button>
          <button
            type="button"
            @click="clearForm"
            class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Product List -->
    <div v-else>
      <h1 class="text-2xl font-semibold mb-4">Product List</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="product in productStore.products"
          :key="product.id"
          class="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between"
        >
          <div class="p-4 flex-grow">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-xl font-semibold">{{ product.title }}</h2>
                <div
                  v-html="product.description"
                  class="prose text-sm lg:text-base text-gray-600 mt-1"
                ></div>
              </div>
              <div class="mt-1 text-right">
                <span class="text-lg font-bold block">{{ product.price }}</span>
                <span
                  v-if="product.discount > 0"
                  class="text-sm text-green-600"
                >
                  {{ product.discount }}% OFF
                </span>
              </div>
            </div>
          </div>
          <div class="p-4">
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
</template>

<style scoped>
.mobile-spacing {
  @apply px-4 py-6;
}
</style>
