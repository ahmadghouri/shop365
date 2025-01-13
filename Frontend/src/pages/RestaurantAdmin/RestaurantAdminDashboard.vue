<!-- Product Management Template with Discount Feature -->
<template>
  <div class="container mx-auto mobile-spacing">
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

    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold mb-4">Product List</h1>
      <router-link
        class="bg-blue-500 px-5 py-1 mb-4 text-white rounded-md"
        to="/admin/store-product"
      >
        ADD
      </router-link>
    </div>

    <div class="relative mb-4"></div>

    <!-- Product Form -->
    <div v-if="selectedProduct" class="mt-4">
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Form Fields for Title, Price, Description, Image -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label for="type" class="block text-sm font-medium text-gray-700">
            Type
          </label>
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
            @click="closeForm"
            class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Product List -->
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="product in productStore.currentProducts"
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
import { ref, onMounted, watch } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import debounce from "lodash/debounce";

const router = useRouter();
const productStore = useProductStore();

const selectedProduct = ref(null);
const imageError = ref("");
const form = ref({
  title: "",
  price: "",
  description: "",
  type: "",
  image: null,
});
const discount = ref(0); // New discount field
const showConfirmModal = ref(false);
const confirmDeleteId = ref(null);
const searchQuery = ref("");
const isLoading = ref(false);

const loadProductDetails = () => {
  if (selectedProduct.value) {
    form.value = {
      title: selectedProduct.value.title,
      price: selectedProduct.value.price,
      description: selectedProduct.value.description,
      type: selectedProduct.value.type,
      image: null,
    };
    discount.value = selectedProduct.value.discount || 0; // Load existing discount if available
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size > 15 * 1024) {
    imageError.value = "Image Size must be less than 15KB";
    form.value.image = "";
  } else {
    imageError.value = "";
    form.value.image = file;
  }
};

const searchProducts = async () => {
  isLoading.value = true;
  try {
    await productStore.getRestaurantProducts(searchQuery.value);
  } catch (error) {
    console.error("Error searching products:", error);
    toast.error("Failed to search products.");
  } finally {
    isLoading.value = false;
  }
};

// Debounce the search function
const debounceSearch = debounce(() => {
  searchProducts();
}, 300);

// Watch for changes in the search query
watch(searchQuery, () => {
  debounceSearch();
});

const closeForm = () => {
  selectedProduct.value = null;
  form.value = {
    title: "",
    price: "",
    description: "",
    type: "",
  };
  discount.value = 0;
  router.push({ path: router.currentRoute.value.fullPath });
};

const openFormForUpdate = (product) => {
  selectedProduct.value = product;
  loadProductDetails();
};

const submitForm = async () => {
  if (imageError.value) {
    toast.error("Please fix the errors before submitting.");
    return;
  }

  if (form.value.image && form.value.image.size > 15 * 1024) {
    imageError.value = "Image size must be less than 15KB.";
    toast.error("Image size exceeds the limit.");
    return; // Prevent submission if the image is too large
  }

  const formData = new FormData();
  formData.append("title", form.value.title);
  formData.append("description", form.value.description);
  formData.append("price", form.value.price.toString());
  formData.append("type", form.value.type);

  if (form.value.image) {
    formData.append("image", form.value.image);
  }

  formData.append("_method", "PUT");

  try {
    await productStore.updateProduct(formData, selectedProduct.value.id);
    closeForm();
    toast.success("Product updated successfully.");
    await productStore.getRestaurantProducts();
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product.");
  }
};

const applyDiscountToProduct = async () => {
  if (discount.value === null || discount.value < 0 || discount.value > 100) {
    toast.error("Please enter a valid discount between 0 and 100.");
    return;
  }

  try {
    await productStore.applyDiscount(selectedProduct.value.id, discount.value);
    toast.success("Discount applied successfully!");
    // Update the discount in the selectedProduct
    selectedProduct.value.discount = discount.value;
  } catch (error) {
    console.error("Error applying discount:", error);
    toast.error("Failed to apply discount.");
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
.prose {
  max-width: none;
  width: 100%;
}

/* Table styling */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.prose th,
.prose td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.prose th {
  background-color: #f9fafb;
  font-weight: 600;
}

/* List styling */
.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

/* Maintain spacing */
.prose > * + * {
  margin-top: 1rem;
}
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
