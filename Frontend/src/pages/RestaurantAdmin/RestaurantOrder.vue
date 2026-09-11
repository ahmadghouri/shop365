<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Restaurant Orders" description="Manage incoming and past orders">
      <template #actions>
        <Button variant="outline" @click="refreshOrders">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </template>
    </PageHeader>

    <div class="flex items-center gap-2 mt-6 mb-6 overflow-x-auto pb-2">
      <Button v-for="tab in statusTabs" :key="tab.value" :variant="selectedStatus === tab.value ? 'default' : 'outline'"
        :class="selectedStatus === tab.value ? tab.activeClass : tab.inactiveClass" size="sm"
        @click="selectedStatus = tab.value">
        <component :is="tab.icon" class="w-4 h-4 mr-1.5" />
        {{ tab.label }}
        <Badge v-if="getStatusCount(tab.value) > 0" variant="secondary" class="ml-1.5 text-[10px] px-1.5 py-0">
          {{ getStatusCount(tab.value) }}
        </Badge>
      </Button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="i in 6" :key="i">
        <CardHeader>
          <Skeleton class="h-5 w-1/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent class="space-y-2">
          <Skeleton class="h-4 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-4 w-3/4" />
        </CardContent>
        <CardFooter>
          <Skeleton class="h-9 w-full" />
        </CardFooter>
      </Card>
    </div>

    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>Error loading orders: {{ error }}</AlertDescription>
    </Alert>

    <EmptyState v-else-if="ordersListSortedAndFiltered.length === 0" title="No Orders"
      description="No orders found for this status." :icon="ShoppingCart" />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="order in ordersListSortedAndFiltered" :key="order.id"
        class="relative overflow-hidden transition-all duration-300"
        :class="order.newOrder ? 'ring-2 ring-red-500/80 shadow-lg shadow-red-500/10' : 'hover:shadow-md'">
        <Badge v-if="order.newOrder" class="absolute top-3 right-3 bg-red-500 hover:bg-red-500">
          New
        </Badge>

        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-base">Order #{{ order.id }}</CardTitle>
              <CardDescription class="flex items-center gap-1 mt-0.5">
                <Clock class="w-3 h-3" />
                {{ formatDate(order.created_at) }}
              </CardDescription>
            </div>
            <OrderStatusBadge :status="order.status" />
          </div>
        </CardHeader>

        <CardContent class="pb-3">
          <div class="space-y-1.5 text-sm">
            <div class="flex items-center gap-2 text-muted-foreground">
              <User class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ order.user?.name || "No name" }}</span>
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <Phone class="w-3.5 h-3.5 shrink-0" />
              <span>{{ order.user?.phone_no || "No phone" }}</span>
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <MapPin class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">
                {{ order.address?.address || order.user?.household?.address || "No Address" }}
                <span v-if="order.address?.city || order.user?.household?.town?.town_name">,
                  {{ order.address?.city || order.user?.household?.town?.town_name }}</span>
              </span>
            </div>
          </div>

          <Separator class="my-3" />

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Total</span>
            <span class="text-lg font-bold">{{ order.total_price }}</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button class="w-full" @click="openModal(order)">
            <Eye class="w-4 h-4 mr-2" />
            View Order
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div ref="target" class="h-4 my-4"></div>

    <!-- Order Detail Dialog -->
    <Dialog v-model:open="isModalOpen">
      <DialogContent v-if="selectedOrder" class="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div class="flex items-center justify-between">
            <div>
              <DialogTitle>Order #{{ selectedOrder.id }}</DialogTitle>
              <DialogDescription>{{ formatDate(selectedOrder.created_at) }}</DialogDescription>
            </div>
            <OrderStatusBadge :status="selectedOrder.status" />
          </div>
        </DialogHeader>

        <div class="flex flex-wrap gap-2">
          <Button v-for="status in statusOptions" :key="status.value" size="sm"
            :variant="selectedOrder.status === status.value ? 'default' : 'outline'"
            :class="selectedOrder.status === status.value ? status.activeClass : ''"
            @click="updateOrderStatus(status.value)">
            <component :is="status.icon" class="w-3.5 h-3.5 mr-1" />
            {{ status.label }}
          </Button>
        </div>

        <div v-if="selectedOrder.status === 'preparing'" class="mt-3 flex items-center gap-2">
          <select v-model="selectedRider" class="p-2 border rounded">
            <option value="">-- Assign Rider --</option>
            <option v-for="r in ridersList" :key="r._id" :value="r._id">{{ r.name || r.phone_no }}</option>
          </select>
          <Button size="sm" @click="assignRiderToOrder" :disabled="!selectedRider">Assign</Button>
        </div>
        <div v-else-if="selectedOrder.delivery_rider_id" class="mt-3">
          <div class="text-sm text-muted">Assigned Rider:</div>
          <div class="font-medium">{{(ridersList.find(r => r._id === selectedOrder.delivery_rider_id) || {}).name ||
            selectedOrder.delivery_rider_id }}</div>
        </div>

        <Separator />

        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <User class="w-4 h-4 text-muted-foreground" />
            <span class="text-muted-foreground">Name:</span>
            <span class="font-medium">{{ selectedOrder.user?.name || "No Name" }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="w-4 h-4 text-muted-foreground" />
            <span class="text-muted-foreground">Phone:</span>
            <span class="font-medium">{{ selectedOrder.user?.phone_no || "No phone" }}</span>
          </div>
          <div class="flex items-center gap-2">
            <MapPin class="w-4 h-4 text-muted-foreground" />
            <span class="text-muted-foreground">Address:</span>
            <span class="font-medium">
              {{ selectedOrder.address?.address || selectedOrder.user?.household?.address || "No Address" }}
              <span v-if="selectedOrder.address?.city || selectedOrder.user?.household?.town?.town_name">,
                {{ selectedOrder.address?.city || selectedOrder.user?.household?.town?.town_name }}</span>
            </span>
          </div>
        </div>

        <Separator />

        <ScrollArea class="max-h-[40vh]">
          <div v-if="selectedOrder.items?.length > 0" class="space-y-3">
            <div v-for="item in selectedOrder.items" :key="item.id" class="flex gap-3 p-3 rounded-lg bg-muted/50">
              <div class="shrink-0">
                <img :src="selectedOrder.perscription?.full_image_url || item.product?.image_url" alt="Product"
                  class="w-16 h-16 object-cover rounded-md border" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm">{{ item.product?.title }}</p>
                <p class="text-xs text-muted-foreground line-clamp-1">
                  {{ selectedOrder.perscription?.description || item.product?.description }}
                </p>
                <div class="flex items-center justify-between mt-1.5">
                  <span class="text-xs text-muted-foreground">Qty: {{ item.quantity }}</span>
                  <span class="text-sm font-semibold">{{ item.price }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-sm text-muted-foreground py-4">
            No items in this order.
          </div>
        </ScrollArea>

        <Separator />

        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">Total Price</span>
          <span class="text-xl font-bold">{{ selectedOrder.total_price }}</span>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { orderApi } from "@/api/modules/order.api";
import restaurantAdminApi from '@/api/modules/restaurantAdmin.api'
import { ref, onMounted, computed, watch, h } from "vue";
import { useOrderStore } from "../../store/orderStore";
import { toast } from "vue3-toastify";
import { storeToRefs } from "pinia";
import { useIntersectionObserver } from "@vueuse/core";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import OrderStatusBadge from "@/components/dashboard/StatusBadge.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw, Clock, User, Phone, MapPin, ShoppingCart, Eye,
  AlertCircle, Circle, Timer, CheckCircle2, XCircle, Truck
} from "lucide-vue-next";

const target = ref(null);
const orderStore = useOrderStore();
const { ordersList } = storeToRefs(useOrderStore());
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const selectedOrder = ref(null);
const selectedStatus = ref("pending");
const ridersList = ref([])
const selectedRider = ref('')

const I = new Audio("/notification.mp3");
I.volume = 0.25;

const statusTabs = [
  { value: "pending", label: "New Orders", icon: Circle, activeClass: "bg-red-500 hover:bg-red-600 text-white", inactiveClass: "text-red-500 border-red-200 hover:bg-red-50" },
  { value: "preparing", label: "Preparing", icon: Timer, activeClass: "bg-yellow-500 hover:bg-yellow-600 text-white", inactiveClass: "text-yellow-600 border-yellow-200 hover:bg-yellow-50" },
  { value: "on_way", label: "On Way", icon: Truck, activeClass: "bg-indigo-500 hover:bg-indigo-600 text-white", inactiveClass: "text-indigo-600 border-indigo-200 hover:bg-indigo-50" },
  { value: "delivered", label: "Delivered", icon: CheckCircle2, activeClass: "bg-green-500 hover:bg-green-600 text-white", inactiveClass: "text-green-600 border-green-200 hover:bg-green-50" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, activeClass: "bg-blue-500 hover:bg-blue-600 text-white", inactiveClass: "text-blue-500 border-blue-200 hover:bg-blue-50" },
];

const statusOptions = [
  { value: "pending", label: "Pending", icon: Circle, activeClass: "bg-red-500 hover:bg-red-600 text-white" },
  { value: "preparing", label: "Preparing", icon: Timer, activeClass: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  { value: "on_way", label: "On Way", icon: Truck, activeClass: "bg-indigo-500 hover:bg-indigo-600 text-white" },
  { value: "delivered", label: "Delivered", icon: CheckCircle2, activeClass: "bg-green-500 hover:bg-green-600 text-white" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, activeClass: "bg-blue-500 hover:bg-blue-600 text-white" },
];

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting && orderStore.isLoaded) {
      orderStore.addToOrderList();
    }
  }
);

const getStatusCount = (status) => {
  return ordersList.value.filter((o) => o.status === status).length;
};

const ordersListSortedAndFiltered = computed(() => {
  return [...ordersList.value]
    .map((order) => ({
      ...order,
      user: {
        ...order.user,
        household: {
          ...order.user?.household,
          town: {
            ...order.user?.household?.town,
          },
        },
      },
    }))
    .filter((order) => {
      if (!selectedStatus.value) return true;
      return order.status === selectedStatus.value;
    })
    .sort((a, b) => b.id - a.id);
});

const fetchRestaurantOrders = async () => {
  try {
    await orderStore.getRestaurantOrders();
    ordersList.value = ordersList.value.map((order) => ({
      ...order,
      user: {
        ...order.user,
        household: {
          ...order.user?.household,
          town: {
            ...order.user?.household?.town,
          },
        },
      },
      perscription: order.perscription || null,
    }));
  } catch (err) {
    error.value = "Failed to fetch orders";
    console.error("Error fetching restaurant orders:", err);
  } finally {
    loading.value = false;
  }
};

const refreshOrders = async () => {
  loading.value = true;
  error.value = null;
  await fetchRestaurantOrders();
};

const updateOrderStatus = async (status) => {
  try {
    const currentOrder = { ...selectedOrder.value };
    await orderStore.updateStatus(selectedOrder.value.id, status);

    ordersList.value = ordersList.value.map((order) => {
      if (order.id === currentOrder.id) {
        return {
          ...order,
          status,
          user: currentOrder.user,
          items: currentOrder.items,
          perscription: currentOrder.perscription,
        };
      }
      return order;
    });

    closeModal();
    toast.success(`Order status updated to ${status}`);
  } catch (err) {
    console.error("Error updating order status:", err);
    toast.error("Failed to update order status");
  }
};

const openModal = async (order) => {
  try {
    if (order.newOrder) {
      const response = await orderApi.getById(order.id);
      selectedOrder.value = {
        ...response.data,
        user: {
          ...response.data.user,
          household: {
            ...response.data.user?.household,
            town: {
              ...response.data.user?.household?.town,
            },
          },
        },
      };
    } else {
      selectedOrder.value = { ...order };
    }
    isModalOpen.value = true;
    // load riders for assignment
    try {
      const { data } = await restaurantAdminApi.getRiders()
      ridersList.value = data?.data || []
    } catch (e) {
      ridersList.value = []
    }
  } catch (err) {
    console.error("Error fetching order details:", err);
    toast.error("Failed to load order details");
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
  selectedRider.value = ''
};

const assignRiderToOrder = async () => {
  if (!selectedRider.value) return toast.error('Select a rider first')
  try {
    const { data } = await orderApi.assignRider(selectedOrder.value.id, { rider_id: selectedRider.value })
    const order = data?.data || {}
    toast.success('Rider assigned')
    // update local order and status
    selectedOrder.value = { ...selectedOrder.value, ...order }
    // update the order in the store list so UI reflects new status
    const idx = orderStore.ordersList.findIndex(o => o.id === order.id)
    if (idx !== -1) {
      orderStore.ordersList.splice(idx, 1, order)
    }
    // refresh orders list (optional)
    await fetchRestaurantOrders()
  } catch (e) {
    console.error(e)
    toast.error('Failed to assign rider')
  }
}

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

watch(selectedStatus, async () => {
  await fetchRestaurantOrders();
});

onMounted(async () => {
  await fetchRestaurantOrders();
});
</script>
