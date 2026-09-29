<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Restaurant Orders" description="Manage incoming and past orders">
      <template #actions>
        <Button variant="outline" @click="refreshOrders" :disabled="loading">
          <RefreshCw class="w-4 h-4 mr-2" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </Button>
      </template>
    </PageHeader>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard title="Total Orders" :value="stats.total" :icon="ShoppingCart" :loading="loading"
        description="all statuses" />
      <StatCard title="Revenue" :value="formatCurrency(stats.revenue)" :icon="Wallet" :loading="loading"
        description="delivered orders" />
      <StatCard title="New / Pending" :value="stats.pending" :icon="Circle" :loading="loading"
        :trend="stats.pending > 0 ? 'up' : ''" :trendValue="stats.pending > 0 ? 'needs action' : ''"
        description="awaiting review" />
      <StatCard title="Delivered" :value="stats.delivered" :icon="CheckCircle2" :loading="loading"
        description="completed" />
    </div>

    <!-- Toolbar: search + sort -->
    <div class="flex flex-col sm:flex-row gap-3 mt-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Search by order #, customer name, or phone…" class="pl-9" />
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
          <DropdownMenuLabel>Sort orders</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem v-for="opt in sortOptions" :key="opt.value" @click="sortBy = opt.value"
            class="flex items-center justify-between">
            {{ opt.label }}
            <Check v-if="sortBy === opt.value" class="w-4 h-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Status tabs -->
    <div class="flex items-center gap-2 mt-4 mb-6 overflow-x-auto pb-2">
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
      :description="searchQuery ? 'No orders match your search.' : 'No orders found for this status.'"
      :icon="ShoppingCart" />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="order in ordersListSortedAndFiltered" :key="order.id"
        class="group relative overflow-hidden transition-all duration-300 cursor-pointer"
        :class="order.newOrder ? 'ring-2 ring-red-500/80 shadow-lg shadow-red-500/10' : 'hover:shadow-md hover:-translate-y-0.5'"
        @click="openModal(order)">
        <span v-if="order.newOrder"
          class="absolute top-0 right-0 flex items-center gap-1 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded-bl-lg">
          <span class="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          NEW
        </span>

        <CardHeader class="pb-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <Avatar class="h-10 w-10 shrink-0">
                <AvatarFallback class="bg-primary/10 text-primary text-xs font-semibold">
                  {{ initials(order.user?.name) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <CardTitle class="text-base leading-tight">
                  #{{ order.id.slice(-6).toUpperCase() }}
                </CardTitle>
                <CardDescription class="flex items-center gap-1 mt-0.5 text-xs">
                  <Clock class="w-3 h-3 shrink-0" />
                  {{ formatDate(order.created_at) }}
                </CardDescription>
              </div>
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
              <span class="truncate">{{ orderAddress(order) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 mt-3">
            <Badge variant="secondary" class="gap-1 text-[11px]">
              <Package class="w-3 h-3" />
              {{ order.items?.length || 0 }} item{{ (order.items?.length || 0) === 1 ? '' : 's' }}
            </Badge>
            <Badge v-if="order.rider" variant="outline" class="gap-1 text-[11px]">
              <Bike class="w-3 h-3" />
              {{ order.rider.name }}
            </Badge>
            <Badge v-else-if="needsRider(order.status)" variant="outline"
              class="gap-1 text-[11px] text-yellow-600 border-yellow-300">
              <Bike class="w-3 h-3" />
              No rider
            </Badge>
          </div>

          <Separator class="my-3" />

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Total</span>
            <span class="text-lg font-bold">{{ formatCurrency(order.total_price) }}</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button class="w-full" variant="outline" @click.stop="openModal(order)">
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
              <DialogTitle>Order #{{ selectedOrder.id.slice(-6).toUpperCase() }}</DialogTitle>
              <DialogDescription>{{ formatDate(selectedOrder.created_at) }}</DialogDescription>
            </div>
            <OrderStatusBadge :status="selectedOrder.status" />
          </div>
        </DialogHeader>

        <!-- Cancelled banner -->
        <div v-if="selectedOrder.status === 'cancelled'"
          class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          <XCircle class="w-4 h-4" />
          This order was cancelled.
        </div>

        <!-- Progress stepper -->
        <div v-else class="flex items-center justify-between px-1">
          <template v-for="(step, idx) in flowSteps" :key="step.value">
            <div class="flex flex-col items-center gap-1 shrink-0">
              <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors" :class="stepState(step.value) === 'done'
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : stepState(step.value) === 'current'
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-muted border-muted text-muted-foreground'">
                <Check v-if="stepState(step.value) === 'done'" class="w-4 h-4" />
                <component :is="step.icon" v-else class="w-4 h-4" />
              </div>
              <span class="text-[10px] font-medium text-center max-w-[64px] leading-tight"
                :class="stepState(step.value) === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'">
                {{ step.label }}
              </span>
            </div>
            <div v-if="idx < flowSteps.length - 1" class="flex-1 h-0.5 mx-1 mb-4 rounded"
              :class="stepIndex(selectedOrder.status) > idx ? 'bg-emerald-500' : 'bg-muted'" />
          </template>
        </div>

        <!-- Primary next-step action -->
        <div v-if="selectedOrder.status !== 'cancelled'" class="flex flex-col sm:flex-row gap-2">
          <Button v-if="nextStep" class="flex-1" :class="nextStep.activeClass"
            :disabled="nextStep.value === 'picked_up' && !selectedOrder.rider_id"
            @click="updateOrderStatus(nextStep.value)">
            <component :is="nextStep.icon" class="w-4 h-4 mr-1.5" />
            {{ nextStepLabel }}
          </Button>
          <div v-else
            class="flex-1 flex items-center justify-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-medium py-2">
            <CheckCircle2 class="w-4 h-4" />
            Order delivered
          </div>
          <Button v-if="canCancel" variant="outline" class="text-red-600 border-red-200 hover:bg-red-50"
            @click="updateOrderStatus('cancelled')">
            <XCircle class="w-4 h-4 mr-1.5" />
            Cancel
          </Button>
        </div>
        <p v-if="nextStep?.value === 'picked_up' && !selectedOrder.rider_id" class="text-xs text-yellow-600 -mt-1">
          Assign a rider below before marking as picked up.
        </p>

        <Separator />

        <div class="flex items-center gap-2 text-sm">
          <Bike class="w-4 h-4 text-muted-foreground" />
          <span class="text-muted-foreground">Rider:</span>
          <span v-if="selectedOrder.rider" class="font-medium">
            {{ selectedOrder.rider.name }} ({{ selectedOrder.rider.phone_no }})
          </span>
          <span v-else class="text-muted-foreground">Not assigned</span>
        </div>
        <div v-if="canAssignRider" class="flex items-center gap-2">
          <Select v-model="assignRiderId" class="flex-1" placeholder="Select a rider">
            <SelectItem v-for="rider in riders" :key="rider._id" :value="rider._id">
              {{ rider.name }} · {{ rider.phone_no }}
            </SelectItem>
          </Select>
          <Button size="sm" variant="outline" @click="assignOrderRider" :disabled="!assignRiderId">
            Assign
          </Button>
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
          <div class="flex items-start gap-2">
            <MapPin class="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <span class="text-muted-foreground">Address:</span>
            <span class="font-medium">
              <span v-if="(selectedOrder.delivery_address || selectedOrder.address_id)?.label"
                class="text-muted-foreground">
                {{ (selectedOrder.delivery_address || selectedOrder.address_id).label }} —
              </span>
              {{ orderAddress(selectedOrder) }}
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
                  <span class="text-sm font-semibold">{{ formatCurrency(item.price) }}</span>
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
          <span class="text-xl font-bold">{{ formatCurrency(selectedOrder.total_price) }}</span>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { orderApi } from "@/api/modules/order.api";
import { riderApi } from "@/api/modules/rider.api";
import { ref, onMounted, computed, watch } from "vue";
import { useOrderStore } from "../../store/orderStore";
import { toast } from "vue3-toastify";
import { storeToRefs } from "pinia";
import { useIntersectionObserver } from "@vueuse/core";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import OrderStatusBadge from "@/components/dashboard/StatusBadge.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw, Clock, User, Phone, MapPin, ShoppingCart, Eye,
  AlertCircle, Circle, Timer, CheckCircle2, XCircle, Bike,
  Search, ArrowDownUp, ChevronDown, Check, Wallet, Package,
} from "lucide-vue-next";

const target = ref(null);
const orderStore = useOrderStore();
const { ordersList } = storeToRefs(useOrderStore());
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const selectedOrder = ref(null);
const selectedStatus = ref("pending");
const riders = ref([]);
const assignRiderId = ref("");
const searchQuery = ref("");
const sortBy = ref("newest");

const I = new Audio("/notification.mp3");
I.volume = 0.25;

const statusTabs = [
  { value: "pending", label: "New Orders", icon: Circle, activeClass: "bg-red-500 hover:bg-red-600 text-white", inactiveClass: "text-red-500 border-red-200 hover:bg-red-50" },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle2, activeClass: "bg-sky-500 hover:bg-sky-600 text-white", inactiveClass: "text-sky-600 border-sky-200 hover:bg-sky-50" },
  { value: "preparing", label: "Preparing", icon: Timer, activeClass: "bg-yellow-500 hover:bg-yellow-600 text-white", inactiveClass: "text-yellow-600 border-yellow-200 hover:bg-yellow-50" },
  { value: "picked_up", label: "Picked Up", icon: Timer, activeClass: "bg-purple-500 hover:bg-purple-600 text-white", inactiveClass: "text-purple-600 border-purple-200 hover:bg-purple-50" },
  { value: "out_for_delivery", label: "Out for Delivery", icon: Timer, activeClass: "bg-orange-500 hover:bg-orange-600 text-white", inactiveClass: "text-orange-600 border-orange-200 hover:bg-orange-50" },
  { value: "delivered", label: "Delivered", icon: CheckCircle2, activeClass: "bg-green-500 hover:bg-green-600 text-white", inactiveClass: "text-green-600 border-green-200 hover:bg-green-50" },
  { value: "cancelled", label: "Cancelled", icon: XCircle, activeClass: "bg-blue-500 hover:bg-blue-600 text-white", inactiveClass: "text-blue-500 border-blue-200 hover:bg-blue-50" },
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total_high", label: "Total: high → low" },
  { value: "total_low", label: "Total: low → high" },
];

const activeSort = computed(
  () => sortOptions.find((o) => o.value === sortBy.value) || sortOptions[0]
);

// --- Guided order workflow ---
// Linear happy-path steps (cancelled is handled separately).
const flowSteps = [
  { value: "pending", label: "Pending", icon: Circle, action: "Confirm Order", activeClass: "bg-sky-500 hover:bg-sky-600 text-white" },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle2, action: "Start Preparing", activeClass: "bg-yellow-500 hover:bg-yellow-600 text-white" },
  { value: "preparing", label: "Preparing", icon: Timer, action: "Mark Picked Up", activeClass: "bg-purple-500 hover:bg-purple-600 text-white" },
  { value: "picked_up", label: "Picked Up", icon: Bike, action: "Out for Delivery", activeClass: "bg-orange-500 hover:bg-orange-600 text-white" },
  { value: "out_for_delivery", label: "On the way", icon: Timer, action: "Mark Delivered", activeClass: "bg-green-500 hover:bg-green-600 text-white" },
  { value: "delivered", label: "Delivered", icon: CheckCircle2, action: "", activeClass: "" },
];

const stepIndex = (status) => flowSteps.findIndex((s) => s.value === status);

const stepState = (stepValue) => {
  const current = stepIndex(selectedOrder.value?.status);
  const idx = flowSteps.findIndex((s) => s.value === stepValue);
  if (current < 0) return "upcoming";
  if (idx < current) return "done";
  if (idx === current) return "current";
  return "upcoming";
};

// Next step in the flow after the current status (null once delivered).
const nextStep = computed(() => {
  const current = stepIndex(selectedOrder.value?.status);
  if (current < 0 || current >= flowSteps.length - 1) return null;
  return flowSteps[current + 1];
});

const nextStepLabel = computed(() => {
  const current = stepIndex(selectedOrder.value?.status);
  return current >= 0 ? flowSteps[current]?.action || "Advance" : "Advance";
});

// Can cancel until the rider has picked it up.
const canCancel = computed(() =>
  ["pending", "confirmed", "preparing"].includes(selectedOrder.value?.status)
);

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

const needsRider = (status) =>
  ["preparing", "picked_up", "out_for_delivery"].includes(status);

const stats = computed(() => {
  const list = ordersList.value;
  const revenue = list
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  return {
    total: list.length,
    revenue,
    pending: list.filter((o) => o.status === "pending").length,
    delivered: list.filter((o) => o.status === "delivered").length,
  };
});

const ordersListSortedAndFiltered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = ordersList.value
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
      if (selectedStatus.value && order.status !== selectedStatus.value) return false;
      if (!q) return true;
      const idMatch = String(order.id).toLowerCase().includes(q);
      const nameMatch = (order.user?.name || "").toLowerCase().includes(q);
      const phoneMatch = (order.user?.phone_no || "").toLowerCase().includes(q);
      return idMatch || nameMatch || phoneMatch;
    });

  const byDate = (o) => new Date(o.created_at).getTime() || 0;
  const byTotal = (o) => Number(o.total_price) || 0;

  return list.sort((a, b) => {
    switch (sortBy.value) {
      case "oldest": return byDate(a) - byDate(b);
      case "total_high": return byTotal(b) - byTotal(a);
      case "total_low": return byTotal(a) - byTotal(b);
      case "newest":
      default: return byDate(b) - byDate(a);
    }
  });
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
    assignRiderId.value = selectedOrder.value.rider_id || "";
    await loadRiders();
  } catch (err) {
    console.error("Error fetching order details:", err);
    toast.error("Failed to load order details");
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

const loadRiders = async () => {
  try {
    const res = await riderApi.getRiders();
    riders.value = (res.data?.data || []).filter((r) => r.status === "active");
  } catch (err) {
    riders.value = [];
  }
};

const canAssignRider = computed(() => {
  return ["preparing", "picked_up", "out_for_delivery"].includes(selectedOrder.value?.status);
});

const assignOrderRider = async () => {
  if (!assignRiderId.value) return;
  try {
    const res = await orderApi.assignRider(selectedOrder.value.id, assignRiderId.value);
    const result = res.data?.data || {};
    const rider = result.rider || riders.value.find((r) => r._id === assignRiderId.value);
    selectedOrder.value.rider_id = rider?._id || assignRiderId.value;
    selectedOrder.value.rider = rider
      ? { id: rider._id, name: rider.name, phone_no: rider.phone_no, image: rider.image || "" }
      : selectedOrder.value.rider;
    if (result.order?.status) selectedOrder.value.status = result.order.status;
    ordersList.value = ordersList.value.map((o) =>
      o.id === selectedOrder.value.id ? { ...o, ...selectedOrder.value } : o
    );
    toast.success(`Rider assigned — order ${selectedOrder.value.status === 'picked_up' ? 'picked up' : 'updated'}`);
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to assign rider");
  }
};

// Address shown for an order: prefer the delivery address chosen at checkout,
// fall back to the customer's saved household address.
const orderAddress = (order) => {
  // List payload sends a flat `delivery_address`; the detail payload sends a
  // populated `address_id`. Support both.
  const da = order?.delivery_address || order?.address_id;
  if (da && da.address) {
    return [da.address, da.area, da.city].filter(Boolean).join(", ");
  }
  const h = order?.user?.household;
  const parts = [h?.address, h?.town?.town_name].filter(Boolean);
  return parts.length ? parts.join(", ") : "No Address";
};

const initials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
};

const formatCurrency = (value) => {
  const n = Number(value) || 0;
  return `Rs ${n.toLocaleString("en-PK")}`;
};

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
