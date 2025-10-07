<template>
  <div class="p-6 space-y-6">
    <!-- Filters -->
    <div class="flex flex-wrap justify-between items-center gap-4">
      <!-- Left side filters -->
      <div class="flex flex-wrap gap-4 items-center">
        <!-- Shop / Warehouse -->
        <select v-model="filters.locno" @change="loadProducts"
                class="border rounded-md px-3 py-2">
          <option value="0">Shop</option>
          <option value="1">Warehouse</option>
        </select>

        <!-- Sort -->
        <select v-model="filters.sort" @change="loadProducts"
                class="border rounded-md px-3 py-2">
          <option value="">Default</option>
          <option value="price_asc">Price Low → High</option>
          <option value="price_desc">Price High → Low</option>
        </select>

        <!-- Quantity -->
        <input type="number" v-model="filters.max_quantity"
               @input="debouncedLoad"
               placeholder="Min Qty"
               class="border rounded-md px-3 py-2 w-40" />

        <!-- Import Button -->
        <button @click="handleImport"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
          Import Products
        </button>

        <!-- View toggle buttons -->
        <div class="flex items-center border rounded-md overflow-hidden">
          <button @click="isTableView = true"
                  :class="['px-3 py-2 flex items-center gap-1', isTableView ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50']">
            <Icon icon="mdi:table" class="w-5 h-5" />
          </button>
          <button @click="isTableView = false"
                  :class="['px-3 py-2 flex items-center gap-1', !isTableView ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50']">
            <Icon icon="mdi:view-grid" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Right side search -->
      <div>
        <input type="text"
               v-model="filters.search"
               @input="debouncedLoad"
               placeholder="Search products..."
               class="border rounded-md px-3 py-2 w-64" />
      </div>
    </div>

    
    <div v-if="loading" class="text-center py-10 text-gray-500">
      Loading products...
    </div>

    <!-- Table View -->
    <div v-else-if="isTableView" class="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-100 text-gray-700 text-left sticky top-0 z-10">
          <tr>
            <!-- <th class="p-3 border-b">Image</th> -->
            <th class="p-3 border-b">#</th>
            <th class="p-3 border-b">Name</th>
            <th class="p-3 border-b">Barcode</th>
            <th class="p-3 border-b">Department / Group</th>
            <th class="p-3 border-b">Price</th>
            <th class="p-3 border-b">Qty</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(product, index) in products" :key="product.id"
              class="hover:bg-gray-50">
            <!-- <td class="p-3 border-b">
              <img v-if="product.image_path"
                   :src="product.image_path"
                   alt="product"
                   class="h-12 w-12 object-contain rounded" />
              <span v-else class="text-gray-400 text-sm">No Image</span>
            </td> -->
            <td class="p-3 border-b text-sm text-gray-500">
              {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
            </td>
            <td class="p-3 border-b font-medium">{{ product.name }}</td>
            <td class="p-3 border-b text-sm text-gray-600">{{ product.bar_code }}</td>
            <td class="p-3 border-b text-sm text-gray-600">
              {{ product.department }} / {{ product.group }}
            </td>
            <td class="p-3 border-b text-sm text-gray-700">
              Rs. {{ product.price }}
              <span v-if="product.discount_price && product.discount_price < product.price"
                    class="text-red-500 line-through ml-1 text-xs">
                Rs. {{ product.discount_price }}
              </span>
            </td>
            <td class="p-3 border-b">{{ product.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="product in products" :key="product.id"
           class="border rounded-lg shadow-sm hover:shadow-md transition p-4 bg-white">
        <!-- Image -->
        <div class="h-40 flex items-center justify-center bg-gray-50 rounded-md mb-3">
          <img v-if="product.image_path"
               :src="product.image_path"
               alt="product"
               class="h-full object-contain" />
          <span v-else class="text-gray-400">No Image</span>
        </div>

        <!-- Info -->
        <h3 class="font-semibold text-lg line-clamp-2">{{ product.name }}</h3>
        <p class="text-sm text-gray-500">{{ product.department }} / {{ product.group }}</p>
        <p class="mt-2 text-gray-700">
          <span class="font-bold">Rs. {{ product.price }}</span>
          <span v-if="product.discount_price && product.discount_price < product.price"
                class="ml-2 text-red-500 line-through text-sm">
            Rs. {{ product.discount_price }}
          </span>
        </p>
        <p class="text-sm text-gray-600">Qty: {{ product.quantity }}</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > pagination.per_page"
         class="flex justify-center items-center gap-2 mt-6">
      <button @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-2 border rounded disabled:opacity-50">
        Prev
      </button>

      <span>Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>

      <button @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page"
              class="px-3 py-2 border rounded disabled:opacity-50">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchProducts, importProducts } from '../../services/posProductApi'
import debounce from 'lodash.debounce'
import { Icon } from '@iconify/vue'

const isTableView = ref(true)
const products = ref<any[]>([])
const loading = ref(false)
const pagination = ref({
  total: 0,
  per_page: 20,
  current_page: 1,
  last_page: 1
})

const filters = ref({
  locno: 0,
  sort: '',
  max_quantity: null,
  search: '',
  page: 1
})

async function loadProducts() {
  loading.value = true
  try {
    const { data } = await fetchProducts(filters.value)
    products.value = data.data
    pagination.value = {
      total: data.total,
      per_page: data.per_page,
      current_page: data.current_page,
      last_page: data.last_page
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  filters.value.page = page
  loadProducts()
}

async function handleImport() {
  loading.value = true
  try {
    await importProducts(filters.value.locno)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    await loadProducts()
  }
}

// Debounce quantity filter input
const debouncedLoad = debounce(loadProducts, 500)

onMounted(loadProducts)
</script>

<style>
/* optional line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>