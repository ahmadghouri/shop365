<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader :title="title || 'Products'" description="Manage this provider's products">
      <template #actions>
        <Button @click="addProduct">
          <Plus class="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </template>
    </PageHeader>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <StatCard title="Total Products" :value="productStore.adminProducts.length" :icon="Package"
        description="in this provider" />
      <StatCard title="Avg. Price" :value="`PKR ${avgPrice}`" :icon="DollarSign" description="per product" />
      <StatCard title="Showing" :value="filteredProducts.length" :icon="LayoutGrid" description="after search" />
    </div>

    <!-- Search -->
    <div class="relative mt-6 mb-6">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input v-model="searchQuery" placeholder="Search products…" class="pl-9" />
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Add Product Modal -->
      <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
        aria-modal="true">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50" @click="showForm = false"></div>
          <div class="relative bg-card rounded-lg w-full max-w-2xl mx-auto">
            <AddProduct @close="showForm = false" />
          </div>
        </div>
      </div>

      <!-- Edit Product Modal -->
      <div v-if="editFormVisible" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
        aria-modal="true">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50" @click="editFormVisible = false"></div>
          <div class="relative bg-card rounded-lg w-full max-w-2xl mx-auto">
            <EditProduct :product="selectedProduct" @close="editFormVisible = false" @save="handleProductUpdate" />
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title"
        role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen px-4">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-50" @click="cancelDelete"></div>
          <div class="relative bg-card rounded-lg w-full max-w-md mx-auto p-6">
            <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p class="mb-6">Are you sure you want to delete this product?</p>
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <button @click="cancelDelete"
                class="w-full sm:w-auto px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors">
                Cancel
              </button>
              <button @click="confirmDelete"
                class="w-full sm:w-auto px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Empty state -->
    <EmptyState v-if="filteredProducts.length === 0" title="No Products"
      :description="searchQuery ? 'No products match your search.' : 'This provider has no products yet.'"
      :icon="Package" actionLabel="Add Product" @action="addProduct" />

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card v-for="product in filteredProducts" :key="product.id"
        class="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <div class="relative flex h-40 items-center justify-center bg-muted/40 p-3">
          <img v-if="productImageUrl(product)" :src="productImageUrl(product)" :alt="product.title"
            class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
          <Package v-else class="h-12 w-12 text-muted-foreground/40" />
        </div>
        <CardHeader class="pb-2">
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="truncate text-base">{{ product.title }}</CardTitle>
            <span class="shrink-0 text-lg font-bold">PKR {{ parseFloat(product.price).toFixed(0) }}</span>
          </div>
        </CardHeader>
        <CardContent class="flex-1 pb-3">
          <div class="prose prose-sm line-clamp-2 max-w-none text-sm text-muted-foreground"
            v-html="product.description">
          </div>
        </CardContent>
        <CardFooter>
          <div class="grid w-full grid-cols-2 gap-2">
            <Button variant="outline" size="sm" @click="editProduct(product)">
              <Pencil class="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" @click="showDeleteConfirmation(product.id)">
              <Trash2 class="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useProductStore } from "../../store/productStore.js";
import { API_BASE_URL } from "@/config/api";
import AddProduct from "../../components/AddProduct.vue";
import EditProduct from "../../components/EditProduct.vue";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Package, DollarSign, LayoutGrid, Search } from "lucide-vue-next";

const route = useRoute();
const productStore = useProductStore();
const showForm = ref(false);
const searchQuery = ref("");

const productImageUrl = (product) => {
  const image = product?.image || product?.image_url;
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;
  let path = String(image).replace(/^\/be\/uploads\//, "/uploads/");
  path = path.replace(/^\/uploads\/uploads\//, "/uploads/");
  if (!path.startsWith("/")) path = `/uploads/${path}`;
  return `${API_BASE_URL}${path}`;
};

const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = productStore.adminProducts || [];
  if (!q) return list;
  return list.filter((p) => (p.title || "").toLowerCase().includes(q));
});

const avgPrice = computed(() => {
  const list = productStore.adminProducts || [];
  if (!list.length) return "0";
  const sum = list.reduce((s, p) => s + Number(p.price || 0), 0);
  return Math.round(sum / list.length).toLocaleString();
});
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
