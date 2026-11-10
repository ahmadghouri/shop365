<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRoute, useRouter } from "vue-router";
import debounce from "lodash/debounce";
import AddSubProduct from "../../components/AddSubProduct.vue";
import { toast } from "vue3-toastify";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

    <!-- Add Product Modal -->
    <Dialog :open="showAddModal" @update:open="showAddModal = $event">
      <DialogContent class="max-w-2xl p-0 max-h-[90vh] overflow-y-auto">
        <AddSubProduct :business="businessName" @close="handleProductAdded" />
      </DialogContent>
    </Dialog>

    <!-- Product Form -->
    <Card v-if="selectedProduct" class="mt-4">
      <CardHeader>
        <CardTitle>Update Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="space-y-2">
            <Label for="title">Title</Label>
            <Input type="text" id="title" v-model="form.title" />
          </div>

          <div class="space-y-2">
            <Label for="price">Price</Label>
            <Input type="text" id="price" v-model="form.price" />
          </div>

          <div class="space-y-2">
            <Label for="image">Image</Label>
            <Input @change="handleFileChange" type="file" id="image" accept="image/*" />
            <p v-if="imageError" class="text-destructive text-xs">
              {{ imageError }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="form.description" />
          </div>

          <div class="space-y-2">
            <Label for="type">Type</Label>
            <Input type="text" id="type" v-model="form.type" />
          </div>

          <!-- Discount Field -->
          <div class="space-y-2">
            <Label for="discount">Discount (%)</Label>
            <Input type="number" id="discount" v-model="discount" min="0" max="100"
              placeholder="Enter discount percentage" />
          </div>

          <!-- Buttons -->
          <div class="flex flex-wrap gap-3 pt-2">
            <Button type="submit">Update Product</Button>
            <Button type="button" variant="secondary" @click="applyDiscountToProduct">Apply Discount</Button>
            <Button type="button" variant="outline" @click="clearForm">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>

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
                <span v-if="product.discount > 0" class="text-xs font-medium text-green-600">
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
