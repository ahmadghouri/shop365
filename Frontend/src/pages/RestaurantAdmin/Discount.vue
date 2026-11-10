<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Store-wide Discount" description="Put every product on sale at once" />

    <div v-if="loading" class="mt-6 grid gap-6 lg:grid-cols-5">
      <Skeleton class="h-80 rounded-xl lg:col-span-3" />
      <Skeleton class="h-80 rounded-xl lg:col-span-2" />
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-5">
      <!-- ========== Left: current + set ========== -->
      <div class="space-y-6 lg:col-span-3">
        <!-- Current state -->
        <div v-if="currentDiscount > 0"
          class="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-6 text-slate-950">
          <Percent class="absolute -right-4 -top-4 h-32 w-32 opacity-15" />
          <p class="text-xs font-semibold uppercase tracking-wider opacity-80">Active now</p>
          <p class="mt-1 text-4xl font-extrabold">{{ currentDiscount }}% OFF</p>
          <p class="mt-1 text-sm opacity-90">
            on all {{ productCount }} product{{ productCount === 1 ? '' : 's' }}{{ businessName ? ` at ${businessName}` : '' }}
          </p>
          <Button variant="outline" size="sm" class="mt-4 border-slate-950/20 bg-white/70 hover:bg-white"
            :disabled="removing" @click="showRemoveConfirm = true">
            <Loader2 v-if="removing" class="w-4 h-4 mr-1.5 animate-spin" />
            <Trash2 v-else class="w-4 h-4 mr-1.5" />
            End discount
          </Button>
        </div>
        <div v-else class="flex items-center gap-4 rounded-xl border border-dashed p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Percent class="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p class="font-semibold">No store-wide discount</p>
            <p class="text-sm text-muted-foreground">Products sell at their own price
              <template v-if="ownDiscountCount"> ({{ ownDiscountCount }} have their own discount)</template>.
            </p>
          </div>
        </div>

        <!-- Set discount -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">{{ currentDiscount > 0 ? 'Change discount' : 'Start a discount' }}</CardTitle>
            <CardDescription>Applies the same percentage to every product in your menu.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="flex items-end gap-4">
              <div class="flex-1">
                <input v-model.number="discount" type="range" min="0" max="90" step="1"
                  class="w-full accent-[hsl(var(--primary))]" aria-label="Discount percentage" />
                <div class="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>0%</span><span>45%</span><span>90%</span>
                </div>
              </div>
              <div class="relative w-28">
                <Input v-model.number="discount" type="number" min="0" max="100" class="pr-8 text-right text-lg font-bold"
                  :class="error ? 'border-destructive' : ''" @input="error = ''" />
                <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <button v-for="p in PRESETS" :key="p" type="button"
                class="rounded-full border px-3 py-1 text-sm font-medium transition"
                :class="Number(discount) === p ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'"
                @click="discount = p; error = ''">{{ p }}%</button>
            </div>

            <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

            <!-- What happens -->
            <div v-if="Number(discount) > 0" class="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
              <p class="flex items-start gap-2">
                <Package class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                Every product ({{ productCount }}) gets <b>{{ discount }}% off</b>.
              </p>
              <p v-if="ownDiscountCount" class="flex items-start gap-2 text-amber-600">
                <AlertTriangle class="mt-0.5 h-4 w-4 shrink-0" />
                {{ ownDiscountCount }} product{{ ownDiscountCount === 1 ? ' has its' : 's have their' }} own discount —
                it will be replaced.
              </p>
              <p class="flex items-start gap-2">
                <Bell class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                All customers get a notification about the sale.
              </p>
            </div>

            <div class="flex gap-2">
              <Button class="flex-1" :disabled="applying || !canApply" @click="startApply">
                <Loader2 v-if="applying" class="w-4 h-4 mr-2 animate-spin" />
                <Percent v-else class="w-4 h-4 mr-2" />
                {{ applyLabel }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- ========== Right: price preview ========== -->
      <Card class="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle class="text-base">Price preview</CardTitle>
          <CardDescription>
            {{ Number(discount) > 0 ? `With ${discount}% off` : 'Pick a discount to see new prices' }}
          </CardDescription>
        </CardHeader>
        <CardContent class="pt-0">
          <div v-if="!products.length" class="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            No products yet.
          </div>
          <ul v-else class="divide-y rounded-lg border">
            <li v-for="p in previewProducts" :key="p._id || p.id" class="flex items-center gap-3 p-3">
              <img v-if="imageUrl(p)" :src="imageUrl(p)" alt="" class="h-10 w-10 shrink-0 rounded-md border object-cover" />
              <div v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <Package class="h-4 w-4 text-muted-foreground/60" />
              </div>
              <p class="min-w-0 flex-1 truncate text-sm">{{ p.title }}</p>
              <div class="text-right leading-tight">
                <p class="text-sm font-bold">Rs {{ money(priceAfter(p)) }}</p>
                <p v-if="Number(discount) > 0" class="text-xs text-muted-foreground line-through">Rs {{ money(p.price) }}</p>
              </div>
            </li>
          </ul>
          <p v-if="products.length > previewProducts.length" class="mt-2 text-center text-xs text-muted-foreground">
            + {{ products.length - previewProducts.length }} more product{{ products.length - previewProducts.length === 1 ? '' : 's' }}
          </p>
          <div v-if="Number(discount) > 0 && products.length" class="mt-4 flex justify-between rounded-lg bg-primary/5 px-4 py-3 text-sm">
            <span class="text-muted-foreground">Avg. saving per item</span>
            <span class="font-bold">Rs {{ money(avgSaving) }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Confirm apply -->
    <AlertDialog v-model:open="showApplyConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apply {{ discount }}% off to all products?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ productCount }} product{{ productCount === 1 ? '' : 's' }} will be discounted
            <template v-if="ownDiscountCount">and {{ ownDiscountCount }} individual discount{{ ownDiscountCount === 1 ? '' : 's' }} replaced</template>.
            All customers will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="applyDiscount">Apply discount</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Confirm remove -->
    <AlertDialog v-model:open="showRemoveConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End the {{ currentDiscount }}% discount?</AlertDialogTitle>
          <AlertDialogDescription>
            All products go back to their normal price. Individual product discounts are cleared as well.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep discount</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="removeDiscount">End discount</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { productApi } from "@/api/modules/product.api";
import { businessApi } from "@/api/modules/business.api";
import { API_BASE_URL } from "@/config/api";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Bell, Loader2, Package, Percent, Trash2 } from "lucide-vue-next";

const PRESETS = [5, 10, 15, 20, 25, 30, 50];
const PREVIEW_COUNT = 6;

const loading = ref(true);
const applying = ref(false);
const removing = ref(false);
const showApplyConfirm = ref(false);
const showRemoveConfirm = ref(false);
const error = ref("");

const businessName = ref("");
const currentDiscount = ref(0); // store-wide %, from the business record
const products = ref([]);
const productTotal = ref(0);
const discount = ref(0);

const productCount = computed(() => productTotal.value || products.value.length);

// Products with a discount that isn't the current store-wide one.
const ownDiscountCount = computed(() =>
  products.value.filter((p) => {
    const d = Number(p.discount) || 0;
    if (!d) return false;
    return !(currentDiscount.value > 0 && d === currentDiscount.value && (p.discount_type || "percentage") === "percentage");
  }).length
);

const canApply = computed(() => {
  const d = Number(discount.value);
  return Number.isFinite(d) && d > 0 && d <= 100 && d !== currentDiscount.value;
});
const applyLabel = computed(() => {
  const d = Number(discount.value) || 0;
  if (!d) return "Pick a discount";
  if (d === currentDiscount.value) return `${d}% is already active`;
  return currentDiscount.value > 0 ? `Change to ${d}% off` : `Apply ${d}% off to all products`;
});

const priceAfter = (p) => {
  const price = Number(p.price) || 0;
  const d = Number(discount.value) || 0;
  return d > 0 ? price - (price * d) / 100 : price;
};
const previewProducts = computed(() => products.value.slice(0, PREVIEW_COUNT));
const avgSaving = computed(() => {
  if (!products.value.length) return 0;
  const total = products.value.reduce((sum, p) => sum + ((Number(p.price) || 0) - priceAfter(p)), 0);
  return total / products.value.length;
});

const money = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const imageUrl = (p) => {
  const image = p?.image || p?.image_url;
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;
  let path = String(image).replace(/^\/be\/uploads\//, "/uploads/").replace(/^\/uploads\/uploads\//, "/uploads/");
  if (!path.startsWith("/")) path = `/uploads/${path}`;
  return `${API_BASE_URL}${path}`;
};

const load = async () => {
  loading.value = true;
  try {
    const [bizRes, prodRes] = await Promise.all([
      businessApi.getOwn(),
      productApi.getRestaurantProducts({ per_page: 200, page: 1 }),
    ]);
    const business = bizRes?.data?.data || {};
    businessName.value = business.name || "";
    currentDiscount.value = Number(business.discount) || 0;
    const page = prodRes?.data?.data || {};
    products.value = Array.isArray(page.data) ? page.data : [];
    productTotal.value = Number(page.total) || products.value.length;
    discount.value = currentDiscount.value || 0;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Could not load your discount details");
  } finally {
    loading.value = false;
  }
};

const startApply = () => {
  const d = Number(discount.value);
  if (!Number.isFinite(d) || d <= 0 || d > 100) {
    error.value = "Enter a discount between 1 and 100%.";
    return;
  }
  showApplyConfirm.value = true;
};

const applyDiscount = async () => {
  applying.value = true;
  try {
    await productApi.updateDiscount({ discount: Number(discount.value) });
    toast.success(`${discount.value}% off applied to all products`);
    localStorage.removeItem("discountDetails"); // old local-only state
    await load();
  } catch (err) {
    error.value = err?.response?.data?.message || "Failed to apply discount. Please try again.";
  } finally {
    applying.value = false;
  }
};

const removeDiscount = async () => {
  removing.value = true;
  try {
    await productApi.removeDiscount();
    toast.success("Discount ended — normal prices are back");
    localStorage.removeItem("discountDetails");
    await load();
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to remove discount.");
  } finally {
    removing.value = false;
  }
};

onMounted(load);
</script>
