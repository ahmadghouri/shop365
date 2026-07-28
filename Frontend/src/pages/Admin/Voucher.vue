<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Create Voucher" description="Create a new discount voucher for a business" />

    <div class="max-w-md mx-auto">
      <Card>
        <CardContent class="pt-6">
          <form @submit.prevent="createVoucher" class="space-y-4">
            <div class="space-y-2">
              <Label>Business</Label>
              <select
                v-model="voucherData.business_id"
                required
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>Select Business</option>
                <option
                  v-for="business in businessStore.businesses"
                  :key="business.id"
                  :value="business.id"
                >
                  {{ business.name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <Label>Voucher Code</Label>
              <Input
                v-model="voucherData.code"
                type="text"
                required
                maxlength="12"
                placeholder="Enter voucher code"
              />
              <p class="text-xs" :class="voucherData.code.length > 12 ? 'text-destructive' : 'text-muted-foreground'">
                {{ voucherData.code.length }}/12 characters
              </p>
            </div>

            <div class="space-y-2">
              <Label>Price Limit</Label>
              <Input
                v-model.number="voucherData.min_purchase_amount"
                type="number"
                required
                min="0"
                placeholder="Enter price limit amount"
              />
            </div>

            <div class="space-y-2">
              <Label>Discount Amount</Label>
              <Input
                v-model.number="voucherData.discount_amount"
                type="number"
                required
                min="0"
                placeholder="Enter discount amount"
              />
            </div>

            <div class="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                v-model="voucherData.expiry_date"
                type="date"
                required
              />
            </div>

            <Button type="submit" class="w-full" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isSubmitting ? 'Creating...' : 'Create Voucher' }}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Alert v-if="successMessage" class="mt-4">
        <CheckCircle class="h-4 w-4" />
        <AlertDescription>{{ successMessage }}</AlertDescription>
      </Alert>

      <Alert v-if="errorMessage" variant="destructive" class="mt-4">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>
    </div>
  </div>
</template>

<script setup>
import { voucherApi } from "@/api/modules/voucher.api";
import { ref, onMounted } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { useBusinessStore } from "@/store/businessStore";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-vue-next";

const businessStore = useBusinessStore();

const voucherData = ref({
  business_id: null,
  code: "",
  min_purchase_amount: null,
  discount_amount: null,
  expiry_date: null,
});

const successMessage = ref("");
const errorMessage = ref("");

const { mutate: createVoucherMutation, isPending: isSubmitting } = useMutation({
  mutationFn: (data) => voucherApi.create(data),
  onSuccess: () => {
    successMessage.value = "Voucher Created Successfully";
    voucherData.value = {
      business_id: null,
      code: "",
      discount_amount: null,
      expiry_date: null,
    };
  },
  onError: (error) => {
    errorMessage.value =
      error.response?.data?.message || "Failed to create voucher";
    console.error("Voucher creation error:", error);
  },
});

const createVoucher = () => {
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

  createVoucherMutation({
    business_id: voucherData.value.business_id,
    code: voucherData.value.code,
    discount_amount: voucherData.value.discount_amount,
    min_purchase_amount: voucherData.value.min_purchase_amount,
    expiry_date: voucherData.value.expiry_date,
  });
};

onMounted(async () => {
  try {
    await businessStore.getBusinesses();
  } catch (error) {
    errorMessage.value = "Failed to load businesses";
    console.error("Failed to load businesses:", error);
  }
});
</script>

