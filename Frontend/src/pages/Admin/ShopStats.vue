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
      <!-- Summary stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard title="Total Revenue" :value="`PKR ${totals.revenue.toLocaleString()}`" :icon="DollarSign" description="selected period" />
        <StatCard title="Total Orders" :value="totals.orders" :icon="ShoppingCart" description="selected period" />
        <StatCard title="Businesses" :value="businesses.length" :icon="Store" description="with activity" />
        <StatCard title="Avg. Order Value" :value="`PKR ${totals.avgOrder.toLocaleString()}`" :icon="TrendingUp" description="per order" />
      </div>

      <!-- Filters + search -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 mb-6">
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="filter in filters"
            :key="filter.value"
            size="sm"
            :variant="selectedFilter === filter.value ? 'default' : 'outline'"
            @click="applyFilter(filter.value)"
          >
            {{ filter.label }}
          </Button>
        </div>
        <div class="relative sm:ml-auto sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Search businesses…" class="pl-9" />
        </div>
      </div>

      <EmptyState
        v-if="filteredBusinesses.length === 0"
        title="No Data"
        :description="searchQuery ? 'No businesses match your search.' : 'No sales data available for this period.'"
        :icon="BarChart3"
      />

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="business in filteredBusinesses"
          :key="business.id"
          class="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
          @click="showBusinessOrders(business.id)"
        >
          <CardHeader class="pb-3">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store class="h-5 w-5" />
              </div>
              <CardTitle class="truncate">{{ business.name }}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div class="rounded-xl bg-muted/40 p-4 mb-3">
              <p class="text-xs text-muted-foreground">Total Revenue</p>
              <p class="text-2xl font-bold">PKR {{ (business.total_revenue || 0).toLocaleString() }}</p>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground flex items-center gap-2">
                <ShoppingCart class="w-4 h-4" />
                Orders
              </span>
              <span class="font-semibold">{{ business.total_orders || 0 }}</span>
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
import { businessApi } from "@/api/modules/business.api";
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { QUERY_KEYS } from "@/api/queries/query-keys";
import { useOrderStore } from "@/store/orderStore";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatusBadge from "@/components/dashboard/StatusBadge.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, DollarSign, PackageX, BarChart3, Store, TrendingUp, Search } from "lucide-vue-next";

const selectedFilter = ref("all");
const showModal = ref(false);
const searchQuery = ref("");
const orderStore = useOrderStore();

const filters = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
];

const { data: statsData, isLoading: loading, refetch } = useQuery({
  queryKey: computed(() => [...QUERY_KEYS.BUSINESS_STATS, selectedFilter.value]),
  queryFn: async () => {
    const response = await businessApi.getStats({ filter: selectedFilter.value });
    return response.data.data;
  },
});

const businesses = computed(() => statsData.value ?? []);

const filteredBusinesses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return businesses.value;
  return businesses.value.filter((b) => (b.name || "").toLowerCase().includes(q));
});

const totals = computed(() => {
  const list = businesses.value;
  const revenue = list.reduce((s, b) => s + Number(b.total_revenue || 0), 0);
  const orders = list.reduce((s, b) => s + Number(b.total_orders || 0), 0);
  return {
    revenue,
    orders,
    avgOrder: orders > 0 ? Math.round(revenue / orders) : 0,
  };
});

const applyFilter = (filter) => {
  selectedFilter.value = filter;
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
</script>

