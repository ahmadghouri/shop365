<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Vouchers" description="Manage your discount vouchers">
      <template #actions>
        <Button @click="openCreateDialog">
          <Plus class="w-4 h-4 mr-2" />
          Create Voucher
        </Button>
      </template>
    </PageHeader>

    <!-- Summary stats -->
    <div class="grid grid-cols-3 gap-4 mt-6">
      <StatCard title="Total Vouchers" :value="vouchers.length" :icon="Ticket" description="all created"
        :loading="loading" />
      <StatCard title="Active" :value="activeCount" :icon="BadgeCheck" description="not yet used" :loading="loading" />
      <StatCard title="Used" :value="usedCount" :icon="CheckCircle" description="redeemed" :loading="loading" />
    </div>

    <!-- Search -->
    <div class="relative mt-6 mb-6">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input v-model="searchQuery" placeholder="Search by code…" class="pl-9" />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="i in 3" :key="i">
        <CardHeader>
          <Skeleton class="h-5 w-1/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-1/4" />
        </CardContent>
      </Card>
    </div>

    <!-- Empty State -->
    <EmptyState v-else-if="filteredVouchers.length === 0" title="No Vouchers"
      :description="searchQuery ? 'No vouchers match your search.' : 'Create your first voucher to get started.'"
      :icon="Ticket" actionLabel="Create Voucher" @action="openCreateDialog" />

    <!-- Vouchers Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="voucher in filteredVouchers" :key="voucher.id"
        class="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg font-mono">{{ voucher.code.toUpperCase() }}</CardTitle>
            <Badge :variant="voucher.is_used ? 'destructive' : 'default'">
              {{ voucher.is_used ? 'Used' : 'Active' }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Percent class="w-4 h-4" />
            <span>Discount: {{ voucher.discount_amount }}</span>
          </div>
          <div v-if="voucher.min_purchase_amount" class="flex items-center gap-2">
            <BadgeCheck class="w-4 h-4" />
            <span>Min purchase: {{ voucher.min_purchase_amount }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4" />
            <span>Expires: {{ formatDate(voucher.expiry_date) }}</span>
          </div>
          <Separator class="my-2" />
          <div class="flex justify-end">
            <Button variant="destructive" size="sm" @click="confirmDelete(voucher.id)">
              <Trash2 class="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Delete Confirmation -->
    <AlertDialog v-model:open="showDeleteConfirmation">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Voucher</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this voucher? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="executeDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Create Voucher Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Voucher</DialogTitle>
          <DialogDescription>Create a new discount voucher for a business.</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleCreate" class="space-y-4">
          <div class="space-y-2">
            <Label>Business</Label>
            <select v-model="voucherData.business_id" required
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="" disabled>Select Business</option>
              <option v-for="business in businesses" :key="business.id" :value="business.id">
                {{ business.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label>Voucher Code</Label>
            <Input v-model="voucherData.code" type="text" required maxlength="12" placeholder="e.g. SAVE20" />
            <p class="text-xs" :class="voucherData.code.length > 12 ? 'text-destructive' : 'text-muted-foreground'">
              {{ voucherData.code.length }}/12 characters
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Min Purchase</Label>
              <Input v-model.number="voucherData.min_purchase_amount" type="number" required min="0" placeholder="0" />
            </div>
            <div class="space-y-2">
              <Label>Discount Amount</Label>
              <Input v-model.number="voucherData.discount_amount" type="number" required min="0" placeholder="0" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Expiry Date</Label>
            <Input v-model="voucherData.expiry_date" type="date" required />
          </div>

          <Alert v-if="errorMessage" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertDescription>{{ errorMessage }}</AlertDescription>
          </Alert>

          <Alert v-if="successMessage">
            <CheckCircle class="h-4 w-4" />
            <AlertDescription>{{ successMessage }}</AlertDescription>
          </Alert>

          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" @click="closeCreateDialog">Cancel</Button>
            <Button type="submit" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isSubmitting ? 'Creating...' : 'Create' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useBusinessStore } from "@/store/businessStore";
import { useVoucherStore } from "@/store/voucherStore";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
} from "@/components/ui/alert-dialog";
import {
  Plus, Trash2, Percent, Calendar, BadgeCheck, Ticket, Loader2, CheckCircle, AlertCircle, Search
} from "lucide-vue-next";
import { computed } from "vue";

const voucherStore = useVoucherStore();
const businessStore = useBusinessStore();
const { vouchers } = storeToRefs(voucherStore);
const { businesses } = storeToRefs(businessStore);

const loading = ref(true);
const searchQuery = ref("");

const filteredVouchers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return vouchers.value;
  return vouchers.value.filter((v) => (v.code || "").toLowerCase().includes(q));
});
const activeCount = computed(() => vouchers.value.filter((v) => !v.is_used).length);
const usedCount = computed(() => vouchers.value.filter((v) => v.is_used).length);
const showDeleteConfirmation = ref(false);
const voucherToDelete = ref(null);
const showCreateDialog = ref(false);
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const voucherData = ref({
  business_id: null,
  code: "",
  min_purchase_amount: null,
  discount_amount: null,
  expiry_date: null,
});

onMounted(async () => {
  try {
    await Promise.all([
      voucherStore.fetchVouchers(),
      businessStore.getBusinesses(),
    ]);
  } catch (error) {
    console.error("Failed to fetch data", error);
  } finally {
    loading.value = false;
  }
});

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function openCreateDialog() {
  voucherData.value = {
    business_id: null,
    code: "",
    min_purchase_amount: null,
    discount_amount: null,
    expiry_date: null,
  };
  errorMessage.value = "";
  successMessage.value = "";
  showCreateDialog.value = true;
}

function closeCreateDialog() {
  showCreateDialog.value = false;
  errorMessage.value = "";
  successMessage.value = "";
}

async function handleCreate() {
  if (!voucherData.value.business_id) {
    errorMessage.value = "Please select a business";
    return;
  }
  if (voucherData.value.code.length > 12) {
    errorMessage.value = "Voucher code cannot be longer than 12 characters";
    return;
  }

  errorMessage.value = "";
  successMessage.value = "";
  isSubmitting.value = true;

  try {
    await voucherStore.createVoucher({
      business_id: voucherData.value.business_id,
      code: voucherData.value.code,
      discount_amount: voucherData.value.discount_amount,
      min_purchase_amount: voucherData.value.min_purchase_amount,
      expiry_date: voucherData.value.expiry_date,
    });
    successMessage.value = "Voucher created successfully";
    setTimeout(() => {
      closeCreateDialog();
    }, 1000);
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Failed to create voucher";
  } finally {
    isSubmitting.value = false;
  }
}

function confirmDelete(id) {
  voucherToDelete.value = id;
  showDeleteConfirmation.value = true;
}

async function executeDelete() {
  if (voucherToDelete.value) {
    try {
      await voucherStore.deleteVoucher(voucherToDelete.value);
    } catch (error) {
      console.error("Failed to delete voucher", error);
    } finally {
      showDeleteConfirmation.value = false;
      voucherToDelete.value = null;
    }
  }
}
</script>
