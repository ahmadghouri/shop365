<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Products" description="Manage your restaurant products">
      <template #actions>
        <Button variant="outline" @click="refreshProducts">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button @click="showAddDialog = true">
          <Plus class="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </template>
    </PageHeader>

    <div class="relative mb-6">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        v-model="searchQuery"
        placeholder="Search products..."
        class="pl-9"
      />
    </div>

    <div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="product in productStore.currentProducts" :key="product.id" class="overflow-hidden flex flex-col">
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <CardTitle class="truncate text-base">{{ product.title }}</CardTitle>
              </div>
              <div class="text-right shrink-0">
                <p class="text-lg font-bold">{{ product.price }}</p>
                <Badge v-if="product.discount > 0" variant="destructive" class="text-xs">
                  {{ product.discount }}{{ product.discount_type === 'flat' ? ' PKR' : '%' }} OFF
                </Badge>
              </div>
            </div>
            <CardDescription class="line-clamp-2" v-html="product.description"></CardDescription>
          </CardHeader>

          <CardContent class="flex-1 pb-3">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Product Status</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    :checked="product.status === 1"
                    @change="() => handleStatusToggle(product)"
                  />
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Active Status</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    :checked="product.is_active === 1"
                    @change="() => handleActiveToggle(product)"
                  />
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="outline" class="w-full" @click="openFormForUpdate(product)">
              <Pencil class="w-4 h-4 mr-2" />
              Edit Product
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div v-if="productStore.isLoading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <div ref="loadMoreTrigger" class="h-4 my-4"></div>

      <EmptyState
        v-if="!productStore.isLoading && productStore.currentProducts.length === 0"
        title="No Products"
        description="Get started by adding your first product."
        :icon="Package"
        actionLabel="Add Product"
        @action="showAddDialog = true"
      />
    </div>

    <AlertDialog v-model:open="showConfirmModal">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="deleteProduct(confirmDeleteId)">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog v-model:open="showAddDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Create a new product entry.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleAddProduct" class="space-y-4">
          <div class="space-y-2">
            <Label>Title</Label>
            <Input v-model="addForm.title" placeholder="Product title" required />
          </div>
          <div class="space-y-2">
            <Label>Description</Label>
            <textarea
              v-model="addForm.description"
              placeholder="Product description"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Price</Label>
              <Input v-model="addForm.price" type="number" placeholder="0.00" required />
            </div>
            <div class="space-y-2">
              <Label>Type</Label>
              <Input v-model="addForm.type" placeholder="e.g. Veg, Non-Veg" required />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Image (Max 15KB)</Label>
            <Input type="file" accept="image/*" @change="handleAddFileChange" required />
            <p v-if="addImageError" class="text-sm text-destructive">{{ addImageError }}</p>
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" @click="showAddDialog = false">Cancel</Button>
            <Button type="submit" :disabled="addingProduct">
              <Loader2 v-if="addingProduct" class="w-4 h-4 mr-2 animate-spin" />
              <Plus v-else class="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="selectedProduct">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details below.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Title</Label>
              <Input v-model="form.title" placeholder="Product title" />
            </div>
            <div class="space-y-2">
              <Label>Price</Label>
              <Input v-model="form.price" type="number" placeholder="0.00" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Description</Label>
            <textarea
              v-model="form.description"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Type</Label>
              <Input v-model="form.type" placeholder="e.g. Veg, Non-Veg" />
            </div>
            <div class="space-y-2">
              <Label>Image (Max 15KB)</Label>
              <Input type="file" accept="image/*" @change="handleFileChange" />
              <p v-if="imageError" class="text-sm text-destructive">{{ imageError }}</p>
            </div>
          </div>

          <Separator />

          <div class="space-y-3">
            <Label>Discount</Label>
            <div class="flex gap-4">
              <Button
                type="button"
                :variant="discountType === 'percentage' ? 'default' : 'outline'"
                size="sm"
                @click="discountType = 'percentage'"
              >
                Percentage (%)
              </Button>
              <Button
                type="button"
                :variant="discountType === 'flat' ? 'default' : 'outline'"
                size="sm"
                @click="discountType = 'flat'"
              >
                Flat Amount
              </Button>
            </div>
            <Input
              v-model="discount"
              type="number"
              :min="0"
              :max="discountType === 'percentage' ? 100 : undefined"
              :placeholder="discountType === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount'"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" @click="closeForm">Cancel</Button>
            <Button type="submit">
              <Save class="w-4 h-4 mr-2" />
              Update Product
            </Button>
            <Button type="button" variant="secondary" @click="applyDiscountToProduct">
              <Percent class="w-4 h-4 mr-2" />
              Apply Discount
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import debounce from "lodash/debounce";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { RefreshCw, Plus, Pencil, X, Search, Save, Percent, Package, Loader2 } from "lucide-vue-next";

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
const discount = ref(0);
const discountType = ref("percentage");
const showConfirmModal = ref(false);
const confirmDeleteId = ref(null);
const searchQuery = ref("");
const loadMoreTrigger = ref(null);
const isLoading = ref(true);
const currentPage = ref(1);

const showAddDialog = ref(false);
const addingProduct = ref(false);
const addForm = ref({ title: "", description: "", price: "", type: "", image: null });
const addImageError = ref("");

const setupIntersectionObserver = () => {
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !productStore.isLoading &&
        currentPage.value < productStore.totalPages
      ) {
        loadMoreProducts();
      }
    });
  }, options);

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }

  return observer;
};

const refreshProducts = async () => {
  currentPage.value = 1;
  isLoading.value = true;
  try {
    await productStore.getRestaurantProducts(searchQuery.value, 1);
  } catch (error) {
    toast.error("Failed to refresh products");
  } finally {
    isLoading.value = false;
  }
};

const handleStatusToggle = async (product) => {
  try {
    const newStatus = product.status === 1 ? 0 : 1;
    await productStore.updateProductStatus(product.id, newStatus);
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

const handleActiveToggle = async (product) => {
  try {
    await productStore.updateProductActive(product.id);
  } catch (error) {
    console.error("Error updating active status:", error);
  }
};

const loadMoreProducts = async () => {
  if (!productStore.isLoading) {
    currentPage.value += 1;
    try {
      await productStore.getRestaurantProducts(
        searchQuery.value,
        currentPage.value
      );
    } catch (error) {
      console.error("Error loading more products:", error);
      toast.error("Failed to load more products");
      currentPage.value -= 1;
    }
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
  currentPage.value = 1;
  try {
    await productStore.getRestaurantProducts(searchQuery.value);
  } catch (error) {
    console.error("Error searching products:", error);
    toast.error("Failed to search products.");
  } finally {
    isLoading.value = false;
  }
};

const debounceSearch = debounce(() => {
  searchProducts();
}, 300);

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

const loadProductDetails = () => {
  form.value = {
    title: selectedProduct.value.title,
    price: selectedProduct.value.price,
    description: selectedProduct.value.description,
    type: selectedProduct.value.type,
    image: null,
  };
  discount.value = selectedProduct.value.discount || 0;
  discountType.value = selectedProduct.value.discount_type || "percentage";
};

const submitForm = async () => {
  if (imageError.value) {
    toast.error("Please fix the errors before submitting.");
    return;
  }

  if (form.value.image && form.value.image.size > 15 * 1024) {
    imageError.value = "Image size must be less than 15KB.";
    toast.error("Image size exceeds the limit.");
    return;
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
    toast.success("Product updated successfully");
    await productStore.getRestaurantProducts();
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product.");
  }
};

const applyDiscountToProduct = async () => {
  if (
    discountType.value === "percentage" &&
    (discount.value < 0 || discount.value > 100)
  ) {
    toast.error("Percentage discount must be between 0 and 100");
    return;
  }

  if (discountType.value === "flat" && discount.value < 0) {
    toast.error("Flat discount cannot be negative");
    return;
  }

  try {
    await productStore.applyDiscount(
      selectedProduct.value.id,
      discount.value,
      discountType.value
    );
    toast.success("Discount applied successfully!");
    selectedProduct.value.discount = discount.value;
    selectedProduct.value.discount_type = discountType.value;
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

const handleAddFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size > 15 * 1024) {
    addImageError.value = "Image size must be less than 15KB.";
    addForm.value.image = null;
  } else {
    addImageError.value = "";
    addForm.value.image = file;
  }
};

const handleAddProduct = async () => {
  if (!addForm.value.image) {
    addImageError.value = "Please upload a valid image.";
    return;
  }

  addingProduct.value = true;
  try {
    const formData = new FormData();
    formData.append("title", addForm.value.title);
    formData.append("description", addForm.value.description);
    formData.append("price", addForm.value.price);
    formData.append("type", addForm.value.type);
    formData.append("image", addForm.value.image);

    await axios.post(`${API_BASE_URL}/api/restaurantAdmin/add-products`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Product added successfully");
    addForm.value = { title: "", description: "", price: "", type: "", image: null };
    addImageError.value = "";
    showAddDialog.value = false;
    await productStore.getRestaurantProducts();
  } catch (error) {
    console.error(error);
    toast.error("Failed to add product.");
  } finally {
    addingProduct.value = false;
  }
};

onMounted(async () => {
  currentPage.value = 1;
  try {
    await productStore.getRestaurantProducts();
    const observer = setupIntersectionObserver();

    onUnmounted(() => {
      if (observer && loadMoreTrigger.value) {
        observer.unobserve(loadMoreTrigger.value);
      }
    });
  } catch (error) {
    console.error("Error loading products:", error);
    toast.error("Failed to load products");
  }
});
</script>

<style scoped>
.prose {
  max-width: none;
  width: 100%;
}

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

.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

.prose > * + * {
  margin-top: 1rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
