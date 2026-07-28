<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Discount" description="Manage bulk discount for all products" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">Apply Discount</CardTitle>
          <CardDescription>Set a discount percentage for all products at once.</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="applyDiscount" class="space-y-4">
            <div class="space-y-2">
              <Label>Discount Percentage</Label>
              <Input
                v-model.number="discount"
                type="number"
                :min="0"
                :max="100"
                placeholder="Enter percentage (0-100)"
                required
              />
              <p class="text-sm text-muted-foreground">{{ discountPlaceholder }}</p>
            </div>
            <Button type="submit" class="w-full" :disabled="applying">
              <Loader2 v-if="applying" class="w-4 h-4 mr-2 animate-spin" />
              <Percent v-else class="w-4 h-4 mr-2" />
              Apply Discount
            </Button>
          </form>

          <Alert v-if="responseMessage" :variant="responseSuccess ? 'default' : 'destructive'" class="mt-4">
            <AlertCircle v-if="!responseSuccess" class="h-4 w-4" />
            <CheckCircle v-else class="h-4 w-4" />
            <AlertDescription>{{ responseMessage }}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card v-if="discountDetails">
        <CardHeader>
          <CardTitle class="text-base">Current Discount</CardTitle>
          <CardDescription>Active discount on all products.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div class="p-3 bg-primary/10 rounded-lg">
              <Percent class="h-6 w-6 text-primary" />
            </div>
            <div>
              <p class="text-3xl font-bold">{{ discountDetails.discount }}%</p>
              <p class="text-sm text-muted-foreground">Discount</p>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar class="w-4 h-4" />
            Applied: {{ formatDate(discountDetails.created_at) }}
          </div>
          <AlertDialog v-model:open="showRemoveConfirm">
            <AlertDialogTrigger as-child>
              <Button variant="destructive" class="w-full">
                <Trash2 class="w-4 h-4 mr-2" />
                Remove Discount
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Discount?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the current {{ discountDetails.discount }}% discount from all products.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="removeDiscount">Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card v-else>
        <CardContent class="flex flex-col items-center justify-center py-12 text-center">
          <div class="p-3 bg-muted rounded-lg mb-3">
            <Percent class="h-8 w-8 text-muted-foreground" />
          </div>
          <p class="text-sm text-muted-foreground">No active discount. Use the form to apply one.</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { productApi } from "@/api/modules/product.api";
import { ref, onMounted, computed } from "vue";
import { useMutation } from "@tanstack/vue-query";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Percent, Trash2, Calendar, Loader2, AlertCircle, CheckCircle } from "lucide-vue-next";

const discount = ref(0);
const responseMessage = ref("");
const responseSuccess = ref(false);
const discountDetails = ref(null);
const showRemoveConfirm = ref(false);

const discountPlaceholder = computed(() => {
  return discountDetails.value
    ? `Current discount: ${discountDetails.value.discount}%`
    : "Current discount: 0%";
});

onMounted(() => {
  const savedDiscount = localStorage.getItem("discountDetails");
  if (savedDiscount) {
    discountDetails.value = JSON.parse(savedDiscount);
    discount.value = discountDetails.value.discount;
  }
});

const { mutate: applyDiscountMutation, isPending: applying } = useMutation({
  mutationFn: (data) => productApi.updateDiscount(data),
  onSuccess: (response) => {
    responseSuccess.value = true;
    responseMessage.value = "Discount applied successfully!";
    discountDetails.value = {
      discount: response.data.data.discount,
      created_at: response.data.data.created_at,
    };
    discount.value = discountDetails.value.discount;
    localStorage.setItem("discountDetails", JSON.stringify(discountDetails.value));
  },
  onError: () => {
    responseSuccess.value = false;
    responseMessage.value = "Failed to apply discount. Please try again.";
  },
});

const { mutate: removeDiscountMutation } = useMutation({
  mutationFn: () => productApi.removeDiscount(),
  onSuccess: () => {
    responseSuccess.value = true;
    responseMessage.value = "Discount removed successfully!";
    discountDetails.value = null;
    discount.value = 0;
    localStorage.removeItem("discountDetails");
  },
  onError: () => {
    responseSuccess.value = false;
    responseMessage.value = "Failed to remove discount. Please try again.";
  },
});

const applyDiscount = () => {
  responseMessage.value = "";
  applyDiscountMutation({ discount: discount.value });
};

const removeDiscount = () => {
  removeDiscountMutation();
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

