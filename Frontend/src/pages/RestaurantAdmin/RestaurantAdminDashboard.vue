<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Products" description="Manage your restaurant products">
      <template #actions>
        <Button variant="outline" @click="refreshProducts">
          <RefreshCw class="w-4 h-4 mr-2" :class="isLoading ? 'animate-spin' : ''" />
          Refresh
        </Button>
        <Button @click="showAddDialog = true">
          <Plus class="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </template>
    </PageHeader>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard title="Total Products" :value="stats.total" :icon="Package" description="in this store" />
      <StatCard title="Active" :value="stats.active" :icon="CheckCircle2" description="visible to customers" />
      <StatCard title="On Discount" :value="stats.discounted" :icon="Percent" description="running offers" />
      <StatCard title="Inactive" :value="stats.inactive" :icon="EyeOff" description="hidden / disabled" />
    </div>

    <!-- Toolbar: search + sort -->
    <div class="flex flex-col sm:flex-row gap-3 mt-6 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Search products..." class="pl-9" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" class="sm:w-52 justify-between">
            <span class="flex items-center gap-2">
              <ArrowDownUp class="w-4 h-4" />
              {{ activeSort.label }}
            </span>
            <ChevronDown class="w-4 h-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-52">
          <DropdownMenuLabel>Sort products</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem v-for="opt in sortOptions" :key="opt.value" class="flex items-center justify-between"
            @click="sortBy = opt.value">
            {{ opt.label }}
            <Check v-if="sortBy === opt.value" class="w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="product in sortedProducts" :key="product.id"
          class="group overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          :class="!product.is_active ? 'opacity-70' : ''">
          <div class="relative flex h-44 items-center justify-center bg-muted/40 p-3">
            <img v-if="productImageUrl(product)" :src="productImageUrl(product)" :alt="product.title"
              class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
            <Package v-else class="h-12 w-12 text-muted-foreground/40" />

            <Badge v-if="product.discount > 0" variant="destructive" class="absolute top-2 left-2 text-[11px]">
              {{ product.discount }}{{ product.discount_type === 'flat' ? ' PKR' : '%' }} OFF
            </Badge>
            <span v-if="!product.is_active"
              class="absolute top-2 right-2 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-white">
              Inactive
            </span>
          </div>
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <CardTitle class="truncate text-base">{{ product.title }}</CardTitle>
              </div>
              <div class="text-right shrink-0">
                <p class="text-lg font-bold">Rs {{ product.price }}</p>
              </div>
            </div>
            <div v-if="product.type" class="mt-2">
              <Badge variant="secondary" class="text-xs">{{ product.type }}</Badge>
            </div>
            <CardDescription class="line-clamp-2" v-html="product.description"></CardDescription>
            <!-- Sizes / Extras -->
            <div v-if="product.sizes && product.sizes.length" class="mt-2 flex flex-wrap gap-1">
              <Badge v-for="(size, i) in product.sizes" :key="`size-${i}`" variant="outline" class="text-xs">
                {{ size.name }} - Rs {{ size.price }}
              </Badge>
            </div>
            <div v-if="product.extras && product.extras.length" class="mt-2 flex flex-wrap gap-1">
              <Badge v-for="(extra, i) in product.extras" :key="`extra-${i}`" variant="outline" class="text-xs">
                {{ extra.name }} + Rs {{ extra.price }}
              </Badge>
            </div>
          </CardHeader>

          <CardContent class="flex-1 pb-3">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Product Status</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" :checked="!!product.status"
                    @change="() => handleStatusToggle(product)" />
                  <div
                    class="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-foreground after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500">
                  </div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Active Status</span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" :checked="!!product.is_active"
                    @change="() => handleActiveToggle(product)" />
                  <div
                    class="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-foreground after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500">
                  </div>
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <div class="grid w-full grid-cols-2 gap-2">
              <Button variant="outline" @click="openFormForUpdate(product)">
                <Pencil class="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" @click="confirmDelete(product.id || product._id)">
                <Trash2 class="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div v-if="productStore.isLoading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <div ref="loadMoreTrigger" class="h-4 my-4"></div>

      <EmptyState v-if="!productStore.isLoading && (productStore.currentProducts || []).length === 0"
        title="No Products" description="Get started by adding your first product." :icon="Package"
        actionLabel="Add Product" @action="showAddDialog = true" />
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
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package class="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Product</DialogTitle>
              <DialogDescription>Create a new product for your store.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form @submit.prevent="handleAddProduct" class="space-y-4">
          <!-- Image uploader with preview -->
          <div class="space-y-2">
            <Label>Product Image</Label>
            <label for="add-product-image"
              class="flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/50">
              <img v-if="addImagePreview" :src="addImagePreview" alt="Preview" class="h-full w-full object-contain" />
              <div v-else class="flex flex-col items-center text-muted-foreground">
                <ImageIcon class="mb-2 h-8 w-8" />
                <span class="text-sm font-medium text-primary">Upload product image</span>
                <span class="mt-0.5 text-xs">PNG, JPG or WEBP</span>
              </div>
            </label>
            <input id="add-product-image" type="file" accept="image/*" class="hidden" @change="handleAddFileChange" />
            <p v-if="addImageError" class="text-sm text-destructive">{{ addImageError }}</p>
          </div>

          <div class="space-y-2">
            <Label>Title</Label>
            <Input v-model="addForm.title" placeholder="Product title" required />
          </div>
          <div class="space-y-2">
            <Label>Description</Label>
            <textarea v-model="addForm.description" placeholder="Product description"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Price (Rs)</Label>
              <Input v-model="addForm.price" type="number" placeholder="0.00" required />
            </div>
            <div class="space-y-2">
              <Label for="add-product-type">Product Type</Label>
              <Input id="add-product-type" v-model="addForm.type" placeholder="e.g. Burger, Pizza" required />
            </div>
          </div>

          <!-- Provider-specific options -->
          <div v-if="isGroceryProvider" class="space-y-2 rounded-md border border-border p-3">
            <div class="flex items-center justify-between">
              <Label>Sizes / Variants</Label>
              <button type="button" @click="addSize"
                class="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
                <Plus class="w-4 h-4" /> Add Size
              </button>
            </div>
            <div v-for="(size, index) in addForm.sizes" :key="index" class="flex items-center gap-2">
              <Input v-model="size.name" placeholder="e.g. 1 KG, Large" class="flex-1" />
              <Input v-model.number="size.price" type="number" min="0" step="0.01" placeholder="Absolute price"
                class="w-28" />
              <button type="button" @click="removeSize(index)" class="text-destructive hover:text-destructive/80 p-1">
                <X class="w-4 h-4" />
              </button>
            </div>
            <p v-if="addForm.sizes.length === 0" class="text-xs text-muted-foreground">No sizes added. Product will use
              single price above.</p>
          </div>
          <div v-else-if="isFoodProvider" class="space-y-2 rounded-md border border-border p-3">
            <div class="flex items-center justify-between">
              <Label>Extra Items</Label>
              <button type="button" @click="addExtra"
                class="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
                <Plus class="w-4 h-4" /> Add Extra
              </button>
            </div>
            <div v-for="(extra, index) in addForm.extras" :key="index" class="flex items-center gap-2">
              <Input v-model="extra.name" placeholder="e.g. Extra Cheese" class="flex-1" />
              <Input v-model.number="extra.price" type="number" min="0" step="0.01" placeholder="Add-on price"
                class="w-28" />
              <button type="button" @click="removeExtra(index)" class="text-destructive hover:text-destructive/80 p-1">
                <X class="w-4 h-4" />
              </button>
            </div>
            <p v-if="addForm.extras.length === 0" class="text-xs text-muted-foreground">No extra items added.</p>
          </div>
          <p v-else class="rounded-md border border-border p-3 text-xs text-muted-foreground">
            Provider type could not be identified. Sizes and extra items are unavailable.
          </p>
          <div class="flex justify-end gap-2 pt-2">
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
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pencil class="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the product details below.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Image uploader with preview (shows current image until changed) -->
          <div class="space-y-2">
            <Label>Product Image</Label>
            <label for="edit-product-image"
              class="flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 transition-colors hover:border-primary/50">
              <img v-if="editImagePreview" :src="editImagePreview" alt="Preview" class="h-full w-full object-contain" />
              <div v-else class="flex flex-col items-center text-muted-foreground">
                <ImageIcon class="mb-2 h-8 w-8" />
                <span class="text-sm font-medium text-primary">Change product image</span>
                <span class="mt-0.5 text-xs">Tap to upload a new one</span>
              </div>
            </label>
            <input id="edit-product-image" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            <p v-if="imageError" class="text-sm text-destructive">{{ imageError }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Title</Label>
              <Input v-model="form.title" placeholder="Product title" />
            </div>
            <div class="space-y-2">
              <Label>Price (Rs)</Label>
              <Input v-model="form.price" type="number" placeholder="0.00" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Description</Label>
            <textarea v-model="form.description"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
          </div>

          <div class="space-y-2">
            <Label>Product Type</Label>
            <Input v-model="form.type" placeholder="e.g. Veg, Non-Veg" />
          </div>

          <div v-if="isGroceryProvider" class="space-y-2 rounded-md border border-border p-3">
            <div class="flex items-center justify-between">
              <Label>Sizes / Variants</Label>
              <button type="button" class="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                @click="addEditSize">
                <Plus class="h-4 w-4" /> Add Size
              </button>
            </div>
            <div v-for="(size, index) in form.sizes" :key="index" class="flex items-center gap-2">
              <Input v-model="size.name" placeholder="e.g. 1 KG, Large" class="flex-1" />
              <Input v-model.number="size.price" type="number" min="0" step="0.01" placeholder="Absolute price"
                class="w-28" />
              <button type="button" class="p-1 text-destructive hover:text-destructive/80"
                @click="removeEditSize(index)">
                <X class="h-4 w-4" />
              </button>
            </div>
            <p v-if="form.sizes.length === 0" class="text-xs text-muted-foreground">
              No sizes added. Product will use the single price above.
            </p>
          </div>

          <div v-else-if="isFoodProvider" class="space-y-2 rounded-md border border-border p-3">
            <div class="flex items-center justify-between">
              <Label>Extra Items</Label>
              <button type="button" class="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                @click="addEditExtra">
                <Plus class="h-4 w-4" /> Add Extra
              </button>
            </div>
            <div v-for="(extra, index) in form.extras" :key="index" class="flex items-center gap-2">
              <Input v-model="extra.name" placeholder="e.g. Extra Cheese" class="flex-1" />
              <Input v-model.number="extra.price" type="number" min="0" step="0.01" placeholder="Add-on price"
                class="w-28" />
              <button type="button" class="p-1 text-destructive hover:text-destructive/80"
                @click="removeEditExtra(index)">
                <X class="h-4 w-4" />
              </button>
            </div>
            <p v-if="form.extras.length === 0" class="text-xs text-muted-foreground">
              No extra items added.
            </p>
          </div>

          <p v-else class="rounded-md border border-border p-3 text-xs text-muted-foreground">
            Provider type could not be identified. Sizes and extra items are unavailable.
          </p>

          <Separator />

          <div class="space-y-3">
            <Label>Discount</Label>
            <div class="flex gap-4">
              <Button type="button" :variant="discountType === 'percentage' ? 'default' : 'outline'" size="sm"
                @click="discountType = 'percentage'">
                Percentage (%)
              </Button>
              <Button type="button" :variant="discountType === 'flat' ? 'default' : 'outline'" size="sm"
                @click="discountType = 'flat'">
                Flat Amount
              </Button>
            </div>
            <Input v-model="discount" type="number" :min="0" :max="discountType === 'percentage' ? 100 : undefined"
              :placeholder="discountType === 'percentage' ? 'Enter percentage (0-100)' : 'Enter amount'" />
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
import { productApi } from "@/api/modules/product.api";
import { businessApi } from "@/api/modules/business.api";
import { API_BASE_URL } from "@/config/api";
import { computed, ref, onMounted, watch, onUnmounted } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import debounce from "lodash/debounce";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import {
  RefreshCw, Plus, Pencil, X, Search, Save, Percent, Package, Loader2, Trash2,
  CheckCircle2, EyeOff, ArrowDownUp, ChevronDown, Check, Image as ImageIcon,
} from "lucide-vue-next";

const router = useRouter();
const productStore = useProductStore();

const productImageUrl = (product) => {
  const image = product?.image || product?.image_url;
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;

  let path = String(image).replace(/^\/be\/uploads\//, "/uploads/");
  path = path.replace(/^\/uploads\/uploads\//, "/uploads/");
  if (!path.startsWith("/")) path = `/uploads/${path}`;
  return `${API_BASE_URL}${path}`;
};

const selectedProduct = ref(null);
const providerType = ref("");
const isFoodProvider = computed(() => providerType.value === "food");
const isGroceryProvider = computed(() => providerType.value === "grocery");
const imageError = ref("");
const editImagePreview = ref("");
const form = ref({
  title: "",
  price: "",
  description: "",
  type: "",
  image: null,
  sizes: [],
  extras: [],
});
const discount = ref(0);
const discountType = ref("percentage");
const showConfirmModal = ref(false);
const confirmDeleteId = ref(null);
const searchQuery = ref("");
const loadMoreTrigger = ref(null);
const isLoading = ref(true);
const currentPage = ref(1);
const sortBy = ref("newest");

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "price_high", label: "Price: high → low" },
  { value: "price_low", label: "Price: low → high" },
  { value: "discounted", label: "Discounted first" },
];

const activeSort = computed(
  () => sortOptions.find((o) => o.value === sortBy.value) || sortOptions[0]
);

// Summary counts for the stat cards.
const stats = computed(() => {
  const list = productStore.currentProducts || [];
  return {
    total: list.length,
    active: list.filter((p) => p.is_active).length,
    inactive: list.filter((p) => !p.is_active).length,
    discounted: list.filter((p) => Number(p.discount) > 0).length,
  };
});

// Client-side sort of the already-loaded products (does not affect paging).
const sortedProducts = computed(() => {
  const list = [...(productStore.currentProducts || [])];
  const price = (p) => Number(p.price) || 0;
  return list.sort((a, b) => {
    switch (sortBy.value) {
      case "name_asc":
        return String(a.title || "").localeCompare(String(b.title || ""));
      case "price_high":
        return price(b) - price(a);
      case "price_low":
        return price(a) - price(b);
      case "discounted":
        return (Number(b.discount) > 0 ? 1 : 0) - (Number(a.discount) > 0 ? 1 : 0);
      case "newest":
      default:
        return 0; // keep backend order (already newest-first)
    }
  });
});

const showAddDialog = ref(false);
const addingProduct = ref(false);
const addForm = ref({ title: "", description: "", price: "", type: "", image: null, sizes: [], extras: [] });
const addImageError = ref("");
const addImagePreview = ref("");

const loadProviderType = async () => {
  try {
    const response = await businessApi.getOwn();
    providerType.value = String(response?.data?.data?.type || "").trim().toLowerCase();
  } catch (error) {
    providerType.value = "";
    console.error("Error loading provider type:", error);
    toast.error("Unable to load provider type. Product options are hidden, but products can still be managed.");
  }
};

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
    const newStatus = product.status ? false : true;
    await productStore.updateProductStatus(product.id || product._id, newStatus);
    product.status = newStatus;
    toast.success(newStatus ? "Product status enabled" : "Product status disabled");
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error("Failed to update product status");
  }
};

const handleActiveToggle = async (product) => {
  try {
    await productStore.updateProductActive(product.id || product._id);
    // Optimistically flip local card state
    product.is_active = product.is_active ? false : true;
    toast.success(product.is_active ? "Product activated" : "Product deactivated");
  } catch (error) {
    console.error("Error updating active status:", error);
    toast.error("Failed to update active status");
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
  imageError.value = "";
  const file = e.target.files[0] || null;
  form.value.image = file;
  if (file) editImagePreview.value = URL.createObjectURL(file);
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
    image: null,
    sizes: [],
    extras: [],
  };
  imageError.value = "";
  editImagePreview.value = "";
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
    sizes: (selectedProduct.value.sizes || []).map((size) => ({
      name: size.name || "",
      price: size.price ?? "",
    })),
    extras: (selectedProduct.value.extras || []).map((extra) => ({
      name: extra.name || "",
      price: extra.price ?? "",
    })),
  };
  discount.value = selectedProduct.value.discount || 0;
  discountType.value = selectedProduct.value.discount_type || "percentage";
  // Show the product's current image until the user picks a new one.
  editImagePreview.value = productImageUrl(selectedProduct.value);
};

const addEditSize = () => {
  form.value.sizes.push({ name: "", price: "" });
};

const removeEditSize = (index) => {
  form.value.sizes.splice(index, 1);
};

const addEditExtra = () => {
  form.value.extras.push({ name: "", price: "" });
};

const removeEditExtra = (index) => {
  form.value.extras.splice(index, 1);
};

const cleanOptionRows = (rows, label) => {
  const cleaned = [];
  for (const row of rows) {
    const name = String(row.name || "").trim();
    const hasPrice = row.price !== "" && row.price !== null && row.price !== undefined;
    if (!name && !hasPrice) continue;
    if (!name || !hasPrice) {
      toast.error(`Please enter both name and price for every ${label}.`);
      return null;
    }

    const price = Number(row.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error(`Every ${label} price must be a finite, nonnegative number.`);
      return null;
    }
    cleaned.push({ name, price });
  }
  return cleaned;
};

const submitForm = async () => {
  if (imageError.value) {
    toast.error("Please fix the errors before submitting.");
    return;
  }

  const sizes = isGroceryProvider.value
    ? cleanOptionRows(form.value.sizes, "size")
    : [];
  if (sizes === null) return;
  const extras = isFoodProvider.value
    ? cleanOptionRows(form.value.extras, "extra item")
    : [];
  if (extras === null) return;

  const formData = new FormData();
  formData.append("title", form.value.title);
  formData.append("description", form.value.description);
  formData.append("price", form.value.price.toString());
  formData.append("type", form.value.type);
  formData.append("sizes", JSON.stringify(sizes));
  formData.append("extras", JSON.stringify(extras));

  if (form.value.image) {
    formData.append("image", form.value.image);
  }

  formData.append("_method", "PUT");

  try {
    await productStore.updateProduct(
      formData,
      selectedProduct.value.id || selectedProduct.value._id
    );
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
  addImageError.value = "";
  const file = e.target.files[0] || null;
  addForm.value.image = file;
  addImagePreview.value = file ? URL.createObjectURL(file) : "";
};

const addSize = () => {
  addForm.value.sizes.push({ name: "", price: "" });
};

const removeSize = (index) => {
  addForm.value.sizes.splice(index, 1);
};

const addExtra = () => {
  addForm.value.extras.push({ name: "", price: "" });
};

const removeExtra = (index) => {
  addForm.value.extras.splice(index, 1);
};

const handleAddProduct = async () => {
  if (!addForm.value.image) {
    addImageError.value = "Please upload a valid image.";
    return;
  }

  const sizes = isGroceryProvider.value
    ? cleanOptionRows(addForm.value.sizes, "size")
    : [];
  if (sizes === null) return;
  const extras = isFoodProvider.value
    ? cleanOptionRows(addForm.value.extras, "extra item")
    : [];
  if (extras === null) return;

  addingProduct.value = true;
  try {
    const formData = new FormData();
    formData.append("title", addForm.value.title);
    formData.append("description", addForm.value.description);
    formData.append("price", addForm.value.price);
    formData.append("type", addForm.value.type);
    formData.append("image", addForm.value.image);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("extras", JSON.stringify(extras));

    await productApi.addProduct(formData);

    toast.success("Product added successfully");
    addForm.value = { title: "", description: "", price: "", type: "", image: null, sizes: [], extras: [] };
    addImageError.value = "";
    addImagePreview.value = "";
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
  loadProviderType();
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

.prose>*+* {
  margin-top: 1rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
