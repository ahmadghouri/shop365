<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="POS Products" description="Browse and manage point-of-sale products" />

    <Card class="mb-6">
      <CardContent class="pt-6">
        <div class="flex flex-wrap justify-between items-center gap-4">
          <div class="flex flex-wrap gap-3 items-center">
            <select v-model="filters.locno" @change="loadProducts" class="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="0">Shop</option>
              <option value="1">Warehouse</option>
            </select>

            <select v-model="filters.sort" @change="loadProducts" class="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Default</option>
              <option value="price_asc">Price Low to High</option>
              <option value="price_desc">Price High to Low</option>
            </select>

            <Input type="number" v-model="filters.max_quantity" @input="debouncedLoad" placeholder="Min Qty" class="w-40" />

            <Button @click="handleImport">
              <Download class="w-4 h-4 mr-2" />
              Import Products
            </Button>

            <div class="flex items-center border rounded-md overflow-hidden">
              <Button variant="ghost" size="sm" :class="isTableView ? 'bg-muted' : ''" @click="isTableView = true">
                <Table class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" :class="!isTableView ? 'bg-muted' : ''" @click="isTableView = false">
                <LayoutGrid class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input v-model="filters.search" @input="debouncedLoad" placeholder="Search products..." class="pl-9 w-64" />
          </div>
        </div>
      </CardContent>
    </Card>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <Card v-for="i in 8" :key="i">
        <CardHeader>
          <Skeleton class="h-40 w-full rounded-md mb-2" />
          <Skeleton class="h-5 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-1/2 mb-2" />
          <Skeleton class="h-4 w-1/3" />
        </CardContent>
      </Card>
    </div>

    <div v-else-if="isTableView" class="overflow-x-auto">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Department / Group</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(product, index) in products" :key="product.id">
              <TableCell class="text-muted-foreground">
                {{ (pagination.current_page - 1) * pagination.per_page + index + 1 }}
              </TableCell>
              <TableCell class="font-medium">{{ product.name }}</TableCell>
              <TableCell class="text-muted-foreground">{{ product.bar_code }}</TableCell>
              <TableCell class="text-muted-foreground">{{ product.department }} / {{ product.group }}</TableCell>
              <TableCell>
                Rs. {{ product.price }}
                <span v-if="product.discount_price && product.discount_price < product.price" class="text-destructive line-through ml-1 text-xs">
                  Rs. {{ product.discount_price }}
                </span>
              </TableCell>
              <TableCell>{{ product.quantity }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <Card v-for="product in products" :key="product.id">
        <div class="h-40 flex items-center justify-center bg-muted rounded-t-lg">
          <img v-if="product.image_path" :src="product.image_path" alt="product" class="h-full object-contain" />
          <ImageOff v-else class="w-8 h-8 text-muted-foreground" />
        </div>
        <CardContent class="pt-4">
          <h3 class="font-semibold text-lg truncate">{{ product.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ product.department }} / {{ product.group }}</p>
          <p class="mt-2">
            <span class="font-bold">Rs. {{ product.price }}</span>
            <span v-if="product.discount_price && product.discount_price < product.price" class="ml-2 text-destructive line-through text-sm">
              Rs. {{ product.discount_price }}
            </span>
          </p>
          <p class="text-sm text-muted-foreground">Qty: {{ product.quantity }}</p>
        </CardContent>
      </Card>
    </div>

    <div v-if="pagination.total > pagination.per_page" class="flex justify-center items-center gap-2 mt-6">
      <Button variant="outline" size="sm" :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">
        <ChevronLeft class="w-4 h-4" />
        Prev
      </Button>
      <span class="text-sm text-muted-foreground">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
      <Button variant="outline" size="sm" :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">
        Next
        <ChevronRight class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { posProductApi } from '@/api/modules/pos-product.api'
import debounce from 'lodash.debounce'
import PageHeader from '@/components/dashboard/PageHeader.vue'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Table as TableIcon, LayoutGrid, ChevronLeft, ChevronRight, ImageOff } from 'lucide-vue-next'

const isTableView = ref(true)
const products = ref([])
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
    const { data } = await posProductApi.getAll(filters.value)
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

function changePage(page) {
  filters.value.page = page
  loadProducts()
}

async function handleImport() {
  loading.value = true
  try {
    await posProductApi.import({ locno: filters.value.locno })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
    await loadProducts()
  }
}

const debouncedLoad = debounce(loadProducts, 500)

onMounted(loadProducts)
</script>
