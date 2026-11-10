<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Orders" description="Confirm, prepare and dispatch your orders">
      <template #actions>
        <Button variant="outline" @click="refreshOrders" :disabled="loading">
          <RefreshCw class="w-4 h-4 mr-2" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </Button>
      </template>
    </PageHeader>

    <!-- Workflow stats (click to jump to that list) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <button type="button" class="text-left rounded-xl transition hover:-translate-y-0.5"
        :class="stats.needsAction ? 'ring-2 ring-amber-500/50' : ''" @click="selectedStatus = 'active'">
        <StatCard title="Needs action" :value="stats.needsAction" :icon="AlertCircle" :loading="loading"
          :trend="stats.needsAction > 0 ? 'up' : ''" :trendValue="stats.needsAction > 0 ? 'act now' : ''"
          description="new · no rider · rider cancelled" />
      </button>
      <button type="button" class="text-left rounded-xl transition hover:-translate-y-0.5" @click="selectedStatus = 'preparing'">
        <StatCard title="In kitchen" :value="stats.kitchen" :icon="ChefHat" :loading="loading"
          description="confirmed & preparing" />
      </button>
      <button type="button" class="text-left rounded-xl transition hover:-translate-y-0.5" @click="selectedStatus = 'out_for_delivery'">
        <StatCard title="On the way" :value="stats.onTheWay" :icon="Truck" :loading="loading"
          description="with a rider" />
      </button>
      <button type="button" class="text-left rounded-xl transition hover:-translate-y-0.5" @click="selectedStatus = 'delivered'">
        <StatCard title="Revenue" :value="formatCurrency(stats.revenue)" :icon="Wallet" :loading="loading"
          :description="`${stats.delivered} delivered`" />
      </button>
    </div>

    <!-- Deliveries dropped by riders: need a decision -->
    <div v-if="riderCancelled.length" class="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
      <div class="flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-red-600">
          <AlertCircle class="h-4 w-4" />
        </span>
        <p class="font-semibold">
          {{ riderCancelled.length }} order{{ riderCancelled.length === 1 ? '' : 's' }} cancelled by rider
          <span class="font-normal text-muted-foreground">— choose a new rider or cancel</span>
        </p>
      </div>
      <div class="mt-3 grid gap-2 sm:grid-cols-2">
        <button v-for="o in riderCancelled" :key="o.id" type="button"
          class="flex items-center gap-3 rounded-lg border bg-background p-3 text-left hover:bg-muted/50"
          @click="openModal(o)">
          <span class="text-sm font-semibold">#{{ o.id.slice(-6).toUpperCase() }}</span>
          <span class="min-w-0 flex-1 truncate text-sm text-muted-foreground">
            {{ o.rider_cancel.rider_name }}: “{{ o.rider_cancel.reason }}”
          </span>
          <span class="text-sm font-medium text-primary">Review →</span>
        </button>
      </div>
    </div>

    <!-- Toolbar: tabs + search + sort -->
    <div class="mt-6 rounded-xl border bg-card p-3 space-y-3">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Search order #, customer name or phone…" class="pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" class="w-full sm:w-52 justify-between">
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

      <div class="flex items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        <button v-for="tab in statusTabs" :key="tab.value" type="button"
          class="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="selectedStatus === tab.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
          @click="selectedStatus = tab.value">
          <span class="h-2 w-2 rounded-full" :class="STATUS_STYLE[tab.value]?.dot || 'bg-primary'" />
          {{ tab.label }}
          <span v-if="getStatusCount(tab.value) > 0"
            class="rounded-full px-1.5 text-[11px] font-semibold"
            :class="selectedStatus === tab.value ? 'bg-primary text-primary-foreground' : 'bg-background'">
            {{ getStatusCount(tab.value) }}
          </span>
        </button>
      </div>
    </div>

    <!-- List -->
    <div v-if="loading" class="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="i in 6" :key="i" class="p-5 space-y-3">
        <Skeleton class="h-5 w-1/3" />
        <Skeleton class="h-4 w-2/3" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-9 w-full" />
      </Card>
    </div>

    <Alert v-else-if="error" variant="destructive" class="mt-6">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>Error loading orders: {{ error }}</AlertDescription>
    </Alert>

    <div v-else-if="ordersListSortedAndFiltered.length === 0" class="mt-6">
      <EmptyState title="No orders here"
        :description="searchQuery ? 'No orders match your search.' : 'Orders in this stage will show up here.'"
        :icon="ShoppingCart" />
    </div>

    <div v-else class="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="order in ordersListSortedAndFiltered" :key="order.id"
        class="group relative flex flex-col overflow-hidden border-l-4 transition-all duration-200 cursor-pointer"
        :class="[STATUS_STYLE[order.status]?.border || 'border-l-muted',
          order.newOrder ? 'ring-2 ring-destructive shadow-lg' : 'hover:shadow-md hover:-translate-y-0.5']"
        @click="openModal(order)">
        <span v-if="order.newOrder"
          class="absolute top-0 right-0 flex items-center gap-1 bg-destructive text-destructive-foreground text-[10px] font-semibold px-2 py-1 rounded-bl-lg">
          <span class="h-1.5 w-1.5 rounded-full bg-destructive-foreground animate-pulse" />
          NEW
        </span>

        <div class="flex-1 p-4 space-y-3">
          <!-- Order # + status -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold leading-tight">#{{ order.id.slice(-6).toUpperCase() }}</p>
              <p class="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock class="w-3 h-3" /> {{ timeAgo(order.created_at) }}
              </p>
            </div>
            <OrderStatusBadge :status="order.status" />
          </div>

          <!-- Customer -->
          <div class="flex items-center gap-3">
            <Avatar class="h-9 w-9 shrink-0">
              <AvatarFallback class="bg-primary/10 text-primary text-xs font-semibold">
                {{ initials(order.user?.name) }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{{ order.user?.name || 'No name' }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ order.user?.phone_no || 'No phone' }}</p>
            </div>
          </div>
          <p class="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin class="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span class="line-clamp-2">{{ orderAddress(order) }}</span>
          </p>

          <!-- Items preview -->
          <div class="rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <p class="truncate"><span class="font-medium">{{ itemPreview(order) }}</span></p>
          </div>

          <!-- Delivery -->
          <div class="flex flex-wrap items-center gap-1.5">
            <Badge v-if="order.rider" variant="outline" class="gap-1 text-[11px]">
              <Bike class="w-3 h-3" /> {{ order.rider.name }}
            </Badge>
            <Badge v-else-if="order.rider_cancel?.status === 'pending'" variant="outline"
              class="gap-1 text-[11px] border-red-500/40 bg-red-500/10 text-red-600">
              <AlertCircle class="w-3 h-3" /> Rider cancelled
            </Badge>
            <Badge v-else-if="order.delivery_mode === 'platform'" variant="outline" class="gap-1 text-[11px]">
              <Truck class="w-3 h-3" /> Platform riders
            </Badge>
            <Badge v-else-if="needsRider(order.status)" variant="outline"
              class="gap-1 text-[11px] border-dashed border-amber-500/50 text-amber-600">
              <Bike class="w-3 h-3" /> Needs a rider
            </Badge>
          </div>
        </div>

        <!-- Footer: total + one-click next step -->
        <div class="flex items-center gap-3 border-t bg-muted/30 px-4 py-3">
          <div class="flex-1">
            <p class="text-[11px] text-muted-foreground">Total</p>
            <p class="text-lg font-bold leading-tight">{{ formatCurrency(order.total_price) }}</p>
          </div>
          <Button v-if="quickActionFor(order)" size="sm" :disabled="quickBusyId === order.id"
            @click.stop="runQuickAction(order)">
            <Loader2 v-if="quickBusyId === order.id" class="w-4 h-4 mr-1.5 animate-spin" />
            <component :is="quickActionFor(order).icon" v-else class="w-4 h-4 mr-1.5" />
            {{ quickActionFor(order).label }}
          </Button>
          <Button v-else size="sm" variant="outline" @click.stop="openModal(order)">
            <Eye class="w-4 h-4 mr-1.5" /> Details
          </Button>
        </div>
      </Card>
    </div>

    <div ref="target" class="h-4 my-4"></div>

    <!-- Order Detail Dialog -->
    <Dialog v-model:open="isModalOpen">
      <DialogContent v-if="selectedOrder" class="sm:max-w-2xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col">
        <!-- Header -->
        <DialogHeader class="px-6 pt-6 pb-4 border-b">
          <div class="flex items-start justify-between gap-3 pr-6">
            <div class="min-w-0">
              <DialogTitle class="text-lg">Order #{{ selectedOrder.id.slice(-6).toUpperCase() }}</DialogTitle>
              <DialogDescription class="mt-0.5">
                {{ formatDate(selectedOrder.created_at) }} · {{ selectedOrder.items?.length || 0 }}
                item{{ (selectedOrder.items?.length || 0) === 1 ? '' : 's' }}
              </DialogDescription>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              <OrderStatusBadge :status="selectedOrder.status" />
              <span class="text-lg font-bold">{{ formatCurrency(selectedOrder.total_price) }}</span>
            </div>
          </div>

          <!-- Progress -->
          <div v-if="selectedOrder.status !== 'cancelled'" class="mt-5 flex items-center">
            <template v-for="(step, idx) in flowSteps" :key="step.value">
              <div class="flex flex-col items-center gap-1 shrink-0 w-14">
                <div class="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors" :class="stepState(step.value) === 'done'
                  ? 'bg-primary border-primary text-primary-foreground'
                  : stepState(step.value) === 'current'
                    ? 'bg-primary/10 border-primary text-primary ring-4 ring-primary/15'
                    : 'bg-muted border-muted text-muted-foreground'">
                  <Check v-if="stepState(step.value) === 'done'" class="w-4 h-4" />
                  <component :is="step.icon" v-else class="w-4 h-4" />
                </div>
                <span class="text-[10px] font-medium text-center leading-tight"
                  :class="stepState(step.value) === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'">
                  {{ step.label }}
                </span>
              </div>
              <div v-if="idx < flowSteps.length - 1" class="flex-1 h-0.5 mb-4 rounded"
                :class="stepIndex(selectedOrder.status) > idx ? 'bg-primary' : 'bg-muted'" />
            </template>
          </div>
        </DialogHeader>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <!-- Rider dropped this delivery -->
          <Alert v-if="selectedOrder.rider_cancel?.status === 'pending'" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>
              <p class="font-semibold">
                {{ selectedOrder.rider_cancel.rider_name }}
                ({{ selectedOrder.rider_cancel.rider_kind === 'platform' ? 'platform rider' : 'your rider' }})
                cancelled this delivery
              </p>
              <p class="mt-1">Reason: “{{ selectedOrder.rider_cancel.reason }}”</p>
              <p class="mt-1 text-xs">Choose a new rider below, send it to platform riders, or cancel the order.</p>
            </AlertDescription>
          </Alert>

          <!-- ===== What to do now ===== -->
          <div class="rounded-xl border p-4" :class="stagePanel.tone">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" :class="stagePanel.iconBg">
                <component :is="stagePanel.icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold">{{ stagePanel.title }}</p>
                <p class="mt-0.5 text-sm text-muted-foreground">{{ stagePanel.text }}</p>
              </div>
            </div>

            <!-- Preparing: choose who delivers -->
            <div v-if="selectedOrder.status === 'preparing'" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Own rider -->
              <div class="rounded-lg border bg-background p-3"
                :class="selectedOrder.delivery_mode !== 'platform' ? 'border-primary/50' : ''">
                <p class="flex items-center gap-1.5 text-sm font-semibold"><Bike class="h-4 w-4" /> Your rider</p>
                <p class="mt-0.5 text-xs text-muted-foreground">Assigning marks the order as picked up.</p>
                <div v-if="riders.length" class="mt-3 space-y-2">
                  <Select v-model="assignRiderId" placeholder="Select a rider">
                    <SelectItem v-for="rider in riders" :key="rider._id" :value="rider._id">
                      {{ rider.name }} · {{ rider.phone_no }}
                    </SelectItem>
                  </Select>
                  <Button class="w-full" size="sm" :disabled="!assignRiderId || assigning" @click="assignOrderRider">
                    <Loader2 v-if="assigning" class="w-4 h-4 mr-1.5 animate-spin" />
                    <Bike v-else class="w-4 h-4 mr-1.5" />
                    Assign rider
                  </Button>
                </div>
                <p v-else class="mt-3 text-xs text-muted-foreground">
                  No active riders. Add one on the Riders page or use platform riders.
                </p>
              </div>

              <!-- Platform riders -->
              <div class="rounded-lg border bg-background p-3"
                :class="selectedOrder.delivery_mode === 'platform' ? 'border-primary/50' : ''">
                <p class="flex items-center gap-1.5 text-sm font-semibold"><Truck class="h-4 w-4" /> Platform riders</p>
                <template v-if="selectedOrder.delivery_mode === 'platform'">
                  <p class="mt-0.5 text-xs text-muted-foreground">Sent — waiting for a platform rider to accept.</p>
                  <div class="mt-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
                    <Loader2 class="h-3.5 w-3.5 animate-spin" /> Looking for a rider…
                  </div>
                </template>
                <template v-else>
                  <p class="mt-0.5 text-xs text-muted-foreground">For addresses outside your riders' area.</p>
                  <Button class="mt-3 w-full" size="sm" variant="outline"
                    :disabled="!canSendToPlatform || sendingToPlatform" @click="sendOrderToPlatform">
                    <Loader2 v-if="sendingToPlatform" class="w-4 h-4 mr-1.5 animate-spin" />
                    <Truck v-else class="w-4 h-4 mr-1.5" />
                    Send to platform riders
                  </Button>
                </template>
              </div>
            </div>

            <!-- With a rider: who has it -->
            <div v-if="selectedOrder.rider && ['picked_up', 'out_for_delivery', 'delivered'].includes(selectedOrder.status)"
              class="mt-4 flex items-center gap-3 rounded-lg border bg-background p-3">
              <Avatar class="h-10 w-10">
                <AvatarFallback>{{ (selectedOrder.rider.name || 'R').charAt(0).toUpperCase() }}</AvatarFallback>
              </Avatar>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold">{{ selectedOrder.rider.name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ selectedOrder.delivery_mode === 'platform' ? 'Platform rider' : 'Your rider' }}
                </p>
              </div>
              <a v-if="selectedOrder.rider.phone_no" :href="`tel:${selectedOrder.rider.phone_no}`"
                class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                <Phone class="h-4 w-4" /> {{ selectedOrder.rider.phone_no }}
              </a>
            </div>
          </div>

          <!-- ===== Customer ===== -->
          <section>
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
            <div class="rounded-xl border divide-y">
              <div class="flex items-center gap-3 p-3">
                <User class="h-4 w-4 text-muted-foreground shrink-0" />
                <span class="flex-1 text-sm font-medium">{{ selectedOrder.user?.name || 'No name' }}</span>
                <a v-if="selectedOrder.user?.phone_no" :href="`tel:${selectedOrder.user.phone_no}`"
                  class="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Phone class="h-4 w-4" /> {{ selectedOrder.user.phone_no }}
                </a>
              </div>
              <div class="flex items-start gap-3 p-3">
                <MapPin class="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div class="min-w-0 flex-1 text-sm">
                  <p v-if="(selectedOrder.delivery_address || selectedOrder.address_id)?.label"
                    class="text-xs font-semibold text-muted-foreground">
                    {{ (selectedOrder.delivery_address || selectedOrder.address_id).label }}
                  </p>
                  <p class="font-medium">{{ orderAddress(selectedOrder) }}</p>
                </div>
                <a v-if="mapsLink" :href="mapsLink" target="_blank" rel="noopener"
                  class="shrink-0 text-sm font-medium text-primary hover:underline">Map</a>
              </div>
            </div>
          </section>

          <!-- ===== Items ===== -->
          <section>
            <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h3>
            <div v-if="selectedOrder.items?.length" class="rounded-xl border divide-y">
              <div v-for="item in selectedOrder.items" :key="item.id" class="flex items-center gap-3 p-3">
                <img :src="selectedOrder.perscription?.full_image_url || item.product?.image_url" alt=""
                  class="h-12 w-12 shrink-0 rounded-md border object-cover" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{{ item.product?.title }}</p>
                  <p class="text-xs text-muted-foreground">{{ item.quantity }} × {{ formatCurrency(item.price) }}</p>
                </div>
                <span class="text-sm font-semibold">{{ formatCurrency(item.price * item.quantity) }}</span>
              </div>
            </div>
            <p v-else class="rounded-xl border py-4 text-center text-sm text-muted-foreground">No items in this order.</p>

            <div class="mt-3 space-y-1.5 text-sm">
              <div class="flex justify-between text-muted-foreground">
                <span>Items</span><span>{{ formatCurrency(itemsSubtotal) }}</span>
              </div>
              <div v-if="selectedOrder.delivery_fee" class="flex justify-between text-muted-foreground">
                <span>Delivery fee</span><span>{{ formatCurrency(selectedOrder.delivery_fee) }}</span>
              </div>
              <div v-if="discountAmount > 0" class="flex justify-between text-muted-foreground">
                <span>Discount</span><span>− {{ formatCurrency(discountAmount) }}</span>
              </div>
              <Separator />
              <div class="flex justify-between text-base font-bold">
                <span>Total</span><span>{{ formatCurrency(selectedOrder.total_price) }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Footer: the one main action + cancel -->
        <div v-if="primaryAction || canCancel" class="flex flex-col-reverse sm:flex-row gap-2 border-t bg-muted/30 px-6 py-4">
          <Button v-if="canCancel" variant="outline" class="text-destructive hover:text-destructive"
            :disabled="updatingStatus" @click="showCancelConfirm = true">
            <XCircle class="w-4 h-4 mr-1.5" />
            Cancel Order
          </Button>
          <Button v-if="primaryAction" class="flex-1" :disabled="updatingStatus"
            @click="updateOrderStatus(primaryAction.status)">
            <Loader2 v-if="updatingStatus" class="w-4 h-4 mr-1.5 animate-spin" />
            <component :is="primaryAction.icon" v-else class="w-4 h-4 mr-1.5" />
            {{ primaryAction.label }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Cancel confirmation -->
    <AlertDialog v-model:open="showCancelConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            Order #{{ selectedOrder?.id?.slice(-6).toUpperCase() }} will be cancelled and the customer will be
            notified. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="updateOrderStatus('cancelled')">Cancel order</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
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
  Search, ArrowDownUp, ChevronDown, Check, Wallet, Package, Truck,
  Loader2, ChefHat, Navigation,
} from "lucide-vue-next";

const target = ref(null);
const orderStore = useOrderStore();
const { ordersList } = storeToRefs(useOrderStore());
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const selectedOrder = ref(null);
const selectedStatus = ref("active");
const riders = ref([]);
const assignRiderId = ref("");
const updatingStatus = ref(false);
const assigning = ref(false);
const showCancelConfirm = ref(false);
const searchQuery = ref("");
const sortBy = ref("newest");

const I = new Audio("/notification.mp3");
I.volume = 0.25;

// Orders still moving through the workflow.
const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "picked_up", "out_for_delivery"];

const statusTabs = [
  { value: "active", label: "Active" },
  { value: "pending", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "picked_up", label: "Picked Up" },
  { value: "out_for_delivery", label: "On the way" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

// Colour per status: tab dot + card's left border.
const STATUS_STYLE = {
  active: { dot: "bg-primary" },
  pending: { dot: "bg-amber-500", border: "border-l-amber-500" },
  confirmed: { dot: "bg-sky-500", border: "border-l-sky-500" },
  preparing: { dot: "bg-violet-500", border: "border-l-violet-500" },
  picked_up: { dot: "bg-indigo-500", border: "border-l-indigo-500" },
  out_for_delivery: { dot: "bg-blue-500", border: "border-l-blue-500" },
  delivered: { dot: "bg-emerald-500", border: "border-l-emerald-500" },
  cancelled: { dot: "bg-red-500", border: "border-l-red-500" },
};

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
  { value: "pending", label: "Pending", icon: Circle, action: "Confirm Order" },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle2, action: "Start Preparing" },
  { value: "preparing", label: "Preparing", icon: Timer, action: "Mark Picked Up" },
  { value: "picked_up", label: "Picked Up", icon: Bike, action: "Out for Delivery" },
  { value: "out_for_delivery", label: "On the way", icon: Timer, action: "Mark Delivered" },
  { value: "delivered", label: "Delivered", icon: CheckCircle2, action: "" },
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

const isPlatformOrder = computed(() => selectedOrder.value?.delivery_mode === "platform");

// The single main action for the current stage. "preparing" has none — the
// restaurant picks who delivers instead. Once a platform rider has the order
// they update it from the rider app.
const nextActionFor = (order) => {
  const status = order?.status;
  if (status === "pending") return { label: "Confirm Order", status: "confirmed", icon: CheckCircle2 };
  if (status === "confirmed") return { label: "Start Preparing", status: "preparing", icon: ChefHat };
  if (order?.delivery_mode === "platform") return null;
  if (status === "picked_up") return { label: "Mark Out for Delivery", status: "out_for_delivery", icon: Navigation };
  if (status === "out_for_delivery") return { label: "Mark Delivered", status: "delivered", icon: CheckCircle2 };
  return null;
};
const primaryAction = computed(() => nextActionFor(selectedOrder.value));

// Card button: same next step, short label. "Preparing" without a rider opens
// the dialog to pick who delivers.
const SHORT_LABEL = {
  confirmed: "Confirm",
  preparing: "Start Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};
const quickActionFor = (order) => {
  if (order.status === "preparing" && !order.rider_id && order.delivery_mode !== "platform") {
    return { label: "Assign Rider", icon: Bike, open: true };
  }
  const next = nextActionFor(order);
  return next ? { ...next, label: SHORT_LABEL[next.status] || next.label } : null;
};

const quickBusyId = ref(null);
const runQuickAction = async (order) => {
  const action = quickActionFor(order);
  if (!action || action.open) return openModal(order);
  quickBusyId.value = order.id;
  try {
    await orderStore.updateStatus(order.id, action.status);
    const patch = {
      status: action.status,
      ...(action.status === "delivered" ? { delivered_at: new Date().toISOString() } : {}),
    };
    ordersList.value = ordersList.value.map((o) =>
      o.id === order.id
        ? { ...order, ...o, ...patch, user: order.user, items: order.items, perscription: order.perscription, newOrder: false }
        : o
    );
    toast.success(STATUS_TOAST[action.status] || "Order updated");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update order");
  } finally {
    quickBusyId.value = null;
  }
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return formatDate(iso);
};

// "Zinger Burger ×2, Fries +1 more"
const itemPreview = (order) => {
  const items = order.items || [];
  if (!items.length) return "No items";
  const names = items.slice(0, 2).map((i) => `${i.product?.title || "Item"} ×${i.quantity}`);
  const more = items.length - names.length;
  return more > 0 ? `${names.join(", ")} +${more} more` : names.join(", ");
};

const TONES = {
  amber: { tone: "bg-amber-500/10 border-amber-500/30", iconBg: "bg-amber-500/15 text-amber-600" },
  blue: { tone: "bg-sky-500/10 border-sky-500/30", iconBg: "bg-sky-500/15 text-sky-600" },
  green: { tone: "bg-emerald-500/10 border-emerald-500/30", iconBg: "bg-emerald-500/15 text-emerald-600" },
  red: { tone: "bg-red-500/10 border-red-500/30", iconBg: "bg-red-500/15 text-red-600" },
};

// What the restaurant should do right now, in plain words.
const stagePanel = computed(() => {
  const o = selectedOrder.value || {};
  const platform = isPlatformOrder.value;
  switch (o.status) {
    case "pending":
      return { ...TONES.amber, icon: ShoppingCart, title: "New order",
        text: "Check the items and confirm, so the customer knows you're on it." };
    case "confirmed":
      return { ...TONES.blue, icon: ChefHat, title: "Confirmed",
        text: "Start preparing when the kitchen begins working on it." };
    case "preparing":
      return { ...TONES.amber, icon: Bike, title: "Who will deliver?",
        text: o.rider_cancel?.status === "pending"
          ? "The previous rider dropped this order. Choose a new rider or send it to platform riders."
          : platform
            ? "This order is with platform riders. You can still assign one of your own riders instead."
            : "Assign one of your riders, or send it to platform riders if it's outside your area." };
    case "picked_up":
      return { ...TONES.blue, icon: Package, title: "Picked up",
        text: platform
          ? "The platform rider has the order and updates its status from the rider app."
          : "Your rider has the order. Mark it out for delivery when they leave." };
    case "out_for_delivery":
      return { ...TONES.blue, icon: Navigation, title: "On the way",
        text: platform
          ? "The platform rider will mark it delivered from the rider app."
          : "Mark it delivered once the customer has received it." };
    case "delivered":
      return { ...TONES.green, icon: CheckCircle2, title: "Delivered",
        text: o.delivered_at ? `Delivered ${formatDate(o.delivered_at)}.` : "This order is complete." };
    case "cancelled":
      return { ...TONES.red, icon: XCircle, title: "Cancelled", text: "This order was cancelled." };
    default:
      return { ...TONES.amber, icon: Circle, title: o.status || "Order", text: "" };
  }
});

const itemsSubtotal = computed(() =>
  (selectedOrder.value?.items || []).reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
);
const discountAmount = computed(() => {
  const o = selectedOrder.value;
  if (!o) return 0;
  const diff = itemsSubtotal.value + (Number(o.delivery_fee) || 0) - (Number(o.total_price) || 0);
  return diff > 0.5 ? diff : 0;
});
const mapsLink = computed(() => {
  const da = selectedOrder.value?.delivery_address || selectedOrder.value?.address_id;
  if (da && typeof da.latitude === "number" && typeof da.longitude === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${da.latitude},${da.longitude}`;
  }
  return "";
});

const { stop } = useIntersectionObserver(
  target,
  ([{ isIntersecting }]) => {
    if (isIntersecting && orderStore.isLoaded) {
      orderStore.addToOrderList();
    }
  }
);

const getStatusCount = (status) =>
  status === "active"
    ? ordersList.value.filter((o) => ACTIVE_STATUSES.includes(o.status)).length
    : ordersList.value.filter((o) => o.status === status).length;

// Orders a rider dropped that still need a decision.
const riderCancelled = computed(() =>
  ordersList.value.filter((o) => o.rider_cancel?.status === "pending")
);

// After cancel / reassign / send-to-platform the request is settled.
const resolveRiderCancel = (orderId, resolution) => {
  const settle = (o) =>
    o.rider_cancel?.status === "pending"
      ? { ...o, rider_cancel: { ...o.rider_cancel, status: "resolved", resolution } }
      : o;
  ordersList.value = ordersList.value.map((o) => (o.id === orderId ? settle(o) : o));
  if (selectedOrder.value?.id === orderId) selectedOrder.value = settle(selectedOrder.value);
};

const needsRider = (status) =>
  ["preparing", "picked_up", "out_for_delivery"].includes(status);

const stats = computed(() => {
  const list = ordersList.value;
  const revenue = list
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const needsAction = list.filter(
    (o) =>
      o.status === "pending" ||
      o.rider_cancel?.status === "pending" ||
      (o.status === "preparing" && !o.rider_id && o.delivery_mode !== "platform")
  ).length;
  return {
    total: list.length,
    revenue,
    needsAction,
    kitchen: list.filter((o) => ["confirmed", "preparing"].includes(o.status)).length,
    onTheWay: list.filter((o) => ["picked_up", "out_for_delivery"].includes(o.status)).length,
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
      if (selectedStatus.value === "active") {
        if (!ACTIVE_STATUSES.includes(order.status)) return false;
      } else if (selectedStatus.value && order.status !== selectedStatus.value) return false;
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

const STATUS_TOAST = {
  confirmed: "Order confirmed",
  preparing: "Preparing started",
  out_for_delivery: "Order is out for delivery",
  delivered: "Order delivered",
  cancelled: "Order cancelled",
};

const updateOrderStatus = async (status) => {
  if (!selectedOrder.value) return;
  updatingStatus.value = true;
  try {
    const currentOrder = { ...selectedOrder.value };
    await orderStore.updateStatus(currentOrder.id, status);

    const patch = { status, ...(status === "delivered" ? { delivered_at: new Date().toISOString() } : {}) };
    ordersList.value = ordersList.value.map((order) =>
      order.id === currentOrder.id
        ? { ...currentOrder, ...order, ...patch, user: currentOrder.user, items: currentOrder.items, perscription: currentOrder.perscription }
        : order
    );
    selectedOrder.value = { ...currentOrder, ...patch };

    if (status === "cancelled") resolveRiderCancel(currentOrder.id, "cancelled");
    showCancelConfirm.value = false;
    toast.success(STATUS_TOAST[status] || `Order status updated to ${status}`);
  } catch (err) {
    console.error("Error updating order status:", err);
    toast.error(err.response?.data?.message || "Failed to update order status");
  } finally {
    updatingStatus.value = false;
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
  assigning.value = true;
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
    resolveRiderCancel(selectedOrder.value.id, "reassigned");
    toast.success(`Rider assigned — order ${selectedOrder.value.status === 'picked_up' ? 'picked up' : 'updated'}`);
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to assign rider");
  } finally {
    assigning.value = false;
  }
};

// Hand an order to the platform rider pool (e.g. outside own riders' area).
// Only before any rider has it.
const sendingToPlatform = ref(false);
const canSendToPlatform = computed(() => {
  const o = selectedOrder.value;
  return (
    !!o &&
    o.delivery_mode !== "platform" &&
    !o.rider_id &&
    ["pending", "confirmed", "preparing"].includes(o.status)
  );
});

const sendOrderToPlatform = async () => {
  if (!selectedOrder.value) return;
  sendingToPlatform.value = true;
  try {
    await orderApi.sendToPlatform(selectedOrder.value.id);
    selectedOrder.value.delivery_mode = "platform";
    selectedOrder.value.rider_id = null;
    ordersList.value = ordersList.value.map((o) =>
      o.id === selectedOrder.value.id ? { ...o, delivery_mode: "platform", rider_id: null } : o
    );
    resolveRiderCancel(selectedOrder.value.id, "platform");
    toast.success("Order sent to platform riders");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send order to platform riders");
  } finally {
    sendingToPlatform.value = false;
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
