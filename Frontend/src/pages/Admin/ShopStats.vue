<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Business Statistics" description="View sales data across all businesses" />

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="i in 3" :key="i">
        <CardHeader>
          <Skeleton class="h-6 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-1/2 mb-2" />
          <Skeleton class="h-4 w-1/3" />
        </CardContent>
      </Card>
    </div>

    <template v-else>
      <div class="flex flex-wrap gap-2 mb-8">
        <Button
          v-for="filter in filters"
          :key="filter.value"
          :variant="selectedFilter === filter.value ? 'default' : 'outline'"
          @click="applyFilter(filter.value)"
        >
          {{ filter.label }}
        </Button>
      </div>

      <EmptyState
        v-if="businesses.length === 0"
        title="No Data"
        description="No sales data available for this period."
        :icon="BarChart3"
      />

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="business in businesses"
          :key="business.id"
          class="cursor-pointer transition-shadow hover:shadow-md"
          @click="showBusinessOrders(business.id)"
        >
          <CardHeader>
            <CardTitle>{{ business.name }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground flex items-center gap-2">
                  <ShoppingCart class="w-4 h-4" />
                  Total Orders
                </span>
                <span class="font-semibold">{{ business.total_orders }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground flex items-center gap-2">
                  <DollarSign class="w-4 h-4" />
                  Total Revenue
                </span>
                <span class="font-semibold">PKR {{ business.total_revenue.toLocaleString() }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>

    <Dialog v-model:open="showModal">
      <DialogContent class="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Today's Orders</DialogTitle>
        </DialogHeader>
        <ScrollArea class="h-[60vh]">
          <div v-if="orderStore.adminOrders.length === 0" class="text-center py-12">
            <PackageX class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p class="text-muted-foreground">No orders found for this business.</p>
          </div>
          <div v-else class="space-y-4 pr-4">
            <Card v-for="order in orderStore.adminOrders" :key="order.id">
              <CardContent class="pt-6">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-lg">Order #{{ order.id }}</span>
                    <StatusBadge :status="order.status" />
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
                  <p><span class="font-medium text-muted-foreground">Total:</span> PKR {{ order.total_price.toLocaleString() }}</p>
                  <p><span class="font-medium text-muted-foreground">Customer:</span> {{ order.user.name }}</p>
                  <p><span class="font-medium text-muted-foreground">Contact:</span> {{ order.user.phone_no }}</p>
                  <p class="text-muted-foreground">{{ new Date(order.created_at).toLocaleString() }}</p>
                </div>
                <div class="border-t pt-3">
                  <p class="text-sm font-semibold mb-2">Order Items:</p>
                  <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm py-1">
                    <span>
                      {{ item.product ? item.product.title : "Unknown Product" }}
                      <span class="text-muted-foreground">x {{ item.quantity }}</span>
                    </span>
                    <span class="font-medium">PKR {{ item.price.toLocaleString() }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useOrderStore } from "@/store/orderStore";
import { API_BASE_URL } from "@/config/api";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatusBadge from "@/components/dashboard/StatusBadge.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, DollarSign, PackageX, BarChart3 } from "lucide-vue-next";

const businesses = ref([]);
const loading = ref(true);
const selectedFilter = ref("all");
const showModal = ref(false);
const orderStore = useOrderStore();

const filters = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
];

const fetchBusinessStats = async (filter = "all") => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/business-stats?filter=${filter}`
    );
    businesses.value = response.data.data;
  } catch (error) {
    console.error("Error fetching business stats:", error);
  } finally {
    loading.value = false;
  }
};

const applyFilter = (filter) => {
  selectedFilter.value = filter;
  fetchBusinessStats(filter);
};

const showBusinessOrders = async (businessId) => {
  try {
    await orderStore.getAdminOrders(businessId);
    orderStore.adminOrders.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching business orders:", error);
  }
};

onMounted(() => {
  fetchBusinessStats();
});
</script>
