<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader
      title="Business Settings"
      description="Add your business image and operating hours"
    />

    <Card class="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Provider Profile</CardTitle>
        <CardDescription>These details are shown to customers.</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="py-10 text-center text-sm text-muted-foreground">
          Loading business settings...
        </div>

        <form v-else class="space-y-6" @submit.prevent="saveSettings">
          <div class="space-y-2">
            <Label>Business Image</Label>
            <div class="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
              <img
                v-if="imagePreview"
                :src="imagePreview"
                alt="Business preview"
                class="mx-auto mb-4 h-40 w-full rounded-md object-contain"
              />
              <ImageIcon v-else class="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <label for="provider-image" class="cursor-pointer text-sm font-medium text-primary hover:underline">
                {{ imagePreview ? "Change business image" : "Upload business image" }}
              </label>
              <input
                id="provider-image"
                type="file"
                accept="image/*"
                class="sr-only"
                @change="handleImageChange"
              />
              <p class="mt-2 text-xs text-muted-foreground">PNG, JPG or WebP up to 2MB</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="opening-time">Opening Time</Label>
              <Input id="opening-time" v-model="form.opening_time" type="time" required />
            </div>
            <div class="space-y-2">
              <Label for="closing-time">Closing Time</Label>
              <Input id="closing-time" v-model="form.closing_time" type="time" required />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="delivery-fee">Delivery Fee (Rs)</Label>
              <Input id="delivery-fee" v-model.number="form.delivery_fee" type="number" min="0" placeholder="150" />
            </div>
            <div class="space-y-2">
              <Label for="min-order-price">Minimum Order Price (Rs)</Label>
              <Input id="min-order-price" v-model.number="form.min_order_price" type="number" min="0" placeholder="0" />
            </div>
          </div>

          <p v-if="errorMessage" class="text-sm text-destructive" role="alert">
            {{ errorMessage }}
          </p>

          <div class="flex justify-end">
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              <Save v-else class="mr-2 h-4 w-4" />
              {{ saving ? "Saving..." : "Save Settings" }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { businessApi } from "@/api/modules/business.api";
import { uploadApi } from "@/api/modules/upload.api";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader2, Save } from "lucide-vue-next";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const selectedImage = ref(null);
const imagePreview = ref("");
const form = ref({ opening_time: "", closing_time: "", delivery_fee: 150, min_order_price: 0 });

const handleImageChange = (event) => {
  const file = event.target.files[0];
  errorMessage.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    errorMessage.value = "Please select a valid image file.";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = "Business image must be less than 2MB.";
    return;
  }
  selectedImage.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const loadSettings = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await businessApi.getOwn();
    const business = response.data.data;
    form.value.opening_time = business.opening_time || "";
    form.value.closing_time = business.closing_time || "";
    form.value.delivery_fee = business.delivery_fee ?? 150;
    form.value.min_order_price = business.min_order_price ?? 0;
    imagePreview.value = business.image_url || business.image || "";
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Unable to load business settings.";
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  errorMessage.value = "";
  if (!imagePreview.value) {
    errorMessage.value = "Please add a business image.";
    return;
  }

  saving.value = true;
  try {
    let image;
    if (selectedImage.value) {
      const uploadData = new FormData();
      uploadData.append("image", selectedImage.value);
      uploadData.append("folder", "providers");
      const uploadResponse = await uploadApi.image(uploadData);
      image = uploadResponse.data.data.url;
    }

    const response = await businessApi.updateOwn({
      opening_time: form.value.opening_time,
      closing_time: form.value.closing_time,
      delivery_fee: form.value.delivery_fee,
      min_order_price: form.value.min_order_price,
      ...(image ? { image } : {}),
    });
    const business = response.data.data;
    imagePreview.value = business.image_url || business.image || imagePreview.value;
    selectedImage.value = null;
    toast.success("Business settings updated successfully");
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Unable to update business settings.";
  } finally {
    saving.value = false;
  }
};

onMounted(loadSettings);
</script>
