<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Rider Cancellations"
      description="Deliveries riders dropped. Cancel the order or hand it to platform riders.">
      <template #actions>
        <Button variant="outline" :disabled="loading" @click="load">
          <RefreshCw class="w-4 h-4 mr-2" :class="loading ? 'animate-spin' : ''" />
          Refresh
        </Button>
      </template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-4 mt-6 mb-6 sm:max-w-md">
      <StatCard title="Needs decision" :value="pending.length" :icon="AlertTriangle" :loading="loading"
        description="pending requests" />
      <StatCard title="Resolved" :value="resolved.length" :icon="CheckCircle2" :loading="loading"
        description="recent" />
    </div>

    <div v-if="loading && !items.length" class="flex justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <EmptyState v-else-if="!items.length" title="No rider cancellations"
      description="When a rider drops a delivery it shows up here." />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="item in items" :key="item.id" class="flex flex-col">
        <CardHeader class="pb-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <CardTitle class="text-base">Order #{{ item.id.slice(-6).toUpperCase() }}</CardTitle>
              <CardDescription class="truncate">{{ item.business?.name || 'Unknown business' }}</CardDescription>
            </div>
            <Badge v-if="item.rider_cancel.status === 'pending'" variant="outline"
              class="shrink-0 border-red-300 bg-red-50 text-red-700">Needs decision</Badge>
            <Badge v-else variant="outline" class="shrink-0 border-emerald-300 bg-emerald-50 text-emerald-700">
              {{ resolutionLabel(item.rider_cancel.resolution) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="flex-1 space-y-1.5 text-sm">
          <p>
            <span class="text-muted-foreground">Rider:</span>
            <span class="font-medium"> {{ item.rider_cancel.rider_name }}</span>
            <Badge variant="secondary" class="ml-1 text-[10px]">
              {{ item.rider_cancel.rider_kind === 'platform' ? 'Platform' : 'Restaurant' }}
            </Badge>
          </p>
          <p class="rounded-md bg-muted px-3 py-2">“{{ item.rider_cancel.reason }}”</p>
          <p class="text-muted-foreground">
            {{ formatDate(item.rider_cancel.at) }} · {{ formatCurrency(item.total_price) }}
          </p>
          <p v-if="item.customer" class="text-muted-foreground">
            Customer: {{ item.customer.name }}<span v-if="item.customer.phone_no"> · {{ item.customer.phone_no }}</span>
          </p>
        </CardContent>
        <CardFooter v-if="item.rider_cancel.status === 'pending'" class="gap-2">
          <Button variant="outline" class="flex-1" :disabled="busyId === item.id" @click="sendToPlatform(item)">
            <Truck class="w-4 h-4 mr-1.5" />
            Platform riders
          </Button>
          <Button variant="destructive" class="flex-1" :disabled="busyId === item.id" @click="cancelOrder(item)">
            <XCircle class="w-4 h-4 mr-1.5" />
            Cancel order
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import http from "@/api/http";
import { ENDPOINTS } from "@/api/endpoints";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Truck, XCircle } from "lucide-vue-next";

const items = ref([]);
const loading = ref(false);
const busyId = ref(null);

const pending = computed(() => items.value.filter((i) => i.rider_cancel?.status === "pending"));
const resolved = computed(() => items.value.filter((i) => i.rider_cancel?.status === "resolved"));

const resolutionLabel = (r) =>
  ({ cancelled: "Order cancelled", reassigned: "Rider reassigned", platform: "Sent to platform" })[r] || "Resolved";

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : "");
const formatCurrency = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

const load = async () => {
  loading.value = true;
  try {
    const res = await http.get(ENDPOINTS.ADMIN_RIDER_CANCELLATIONS);
    items.value = res.data?.data || [];
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to load rider cancellations");
  } finally {
    loading.value = false;
  }
};

const settle = (item, resolution) => {
  item.rider_cancel = { ...item.rider_cancel, status: "resolved", resolution };
};

const cancelOrder = async (item) => {
  if (!window.confirm(`Cancel order #${item.id.slice(-6).toUpperCase()}? The customer will be notified.`)) return;
  busyId.value = item.id;
  try {
    await http.put(ENDPOINTS.ADMIN_ORDER_CANCEL(item.id));
    settle(item, "cancelled");
    toast.success("Order cancelled");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to cancel order");
  } finally {
    busyId.value = null;
  }
};

const sendToPlatform = async (item) => {
  busyId.value = item.id;
  try {
    await http.put(ENDPOINTS.ADMIN_ORDER_SEND_TO_PLATFORM(item.id));
    settle(item, "platform");
    toast.success("Order sent to platform riders");
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send order");
  } finally {
    busyId.value = null;
  }
};

onMounted(load);
</script>
