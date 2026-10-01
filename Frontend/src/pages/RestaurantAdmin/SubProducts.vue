<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRoute, useRouter } from "vue-router";
import debounce from "lodash/debounce";
import AddSubProduct from "../../components/AddSubProduct.vue";
import { toast } from "vue3-toastify";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Search, Loader2, Package } from "lucide-vue-next";

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
  if (imageError.value) {
    toast.error("Please fix the errors before submitting.");
    return;
  }

  if (selectedProduct.value) {
    const formData = new FormData();
    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null) {
        formData.append(key, form.value[key]);
      }
    });
    if (form.value.image) {
      formData.append("image", form.value.image);
    }

    formData.append("_method", "PUT");
    await productStore.updateProduct(formData, selectedProduct.value.id);
    clearForm();
    toast.success("Product updated successfully.");
    await productStore.getProducts(businessId);
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
  <div class="container mx-auto px-4 py-6">
    <PageHeader :title="businessName || 'Products'" description="Manage this business's products">
      <template #actions>
        <Button @click="addProduct">
          <Plus class="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </template>
    </PageHeader>

    <!-- Search -->
    <div class="relative mt-6 mb-6">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input v-model="searchQuery" @input="debounceSearch" placeholder="Search products…" class="pl-9" />
    </div>

    <div v-if="isLoading" class="flex justify-center py-6">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <Teleport to="body">
      <!-- Add Product Modal -->
      <div v-if="showAddModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
        aria-modal="true">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50" @click="showAddModal = false"></div>
          <div class="relative bg-card rounded-lg w-full max-w-2xl mx-auto">
            <AddSubProduct :business="businessName" @close="handleProductAdded" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Product Form -->
    <div v-if="selectedProduct" class="mt-4">
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium text-muted-foreground">Title</label>
          <input type="text" id="title" v-model="form.title"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-muted-foreground">Price</label>
          <input type="text" id="price" v-model="form.price"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label for="image" class="block text-sm font-medium text-muted-foreground">
            Image
          </label>
          <input @change="handleFileChange" type="file" id="image"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p v-if="imageError" class="text-red-500 text-xs mt-1">
            {{ imageError }}
          </p>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-muted-foreground">
            Description
          </label>
          <textarea id="description" v-model="form.description"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <div>
          <label for="type" class="block text-sm font-medium text-muted-foreground">Type</label>
          <input type="text" id="type" v-model="form.type"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <!-- Discount Field -->
        <div>
          <label for="discount" class="block text-sm font-medium text-muted-foreground">
            Discount (%)
          </label>
          <input type="number" id="discount" v-model="discount" min="0" max="100"
            class="mt-1 p-2 block w-full border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter discount percentage" />
        </div>

        <!-- Buttons -->
        <div class="flex space-x-4">
          <button type="submit"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-150 ease-in-out">
            Update Product
          </button>
          <button type="button" @click="applyDiscountToProduct"
            class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150 ease-in-out">
            Apply Discount
          </button>
          <button type="button" @click="clearForm"
            class="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-150 ease-in-out">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Product List -->
    <div v-else>
      <EmptyState v-if="!isLoading && (productStore.currentProducts || []).length === 0" title="No Products"
        :description="searchQuery ? 'No products match your search.' : 'This business has no products yet.'"
        :icon="Package" actionLabel="Add Product" @action="addProduct" />
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card v-for="product in productStore.currentProducts" :key="product.id"
          class="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <CardContent class="flex-grow pt-5">
            <div class="flex items-start justify-between gap-2">
              <h2 class="text-base font-semibold truncate">{{ product.title }}</h2>
              <div class="shrink-0 text-right">
                <span class="text-lg font-bold block">Rs {{ product.price }}</span>
                <span v-if="product.discount > 0" class="text-xs font-medium text-emerald-600">
                  {{ product.discount }}% OFF
                </span>
              </div>
            </div>
            <div v-html="product.description"
              class="prose prose-sm line-clamp-2 max-w-none text-sm text-muted-foreground mt-2"></div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" class="w-full" @click="openFormForUpdate(product)">
              <Pencil class="w-4 h-4 mr-2" />
              Update
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-spacing {
  @apply px-4 py-6;
}
</style>
