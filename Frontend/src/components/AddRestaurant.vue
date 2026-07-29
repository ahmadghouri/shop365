<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2 md:col-span-2">
        <Label for="name">Business Name</Label>
        <Input
          id="name"
          v-model="form.name"
          placeholder="Enter business name"
          required
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="type">Business Type</Label>
        <Input
          id="type"
          v-model="form.type"
          placeholder="e.g. Restaurant, Grocery, Cafe"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="opening_time">Opening Time</Label>
        <Input
          id="opening_time"
          v-model="form.opening_time"
          type="time"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="closing_time">Closing Time</Label>
        <Input
          id="closing_time"
          v-model="form.closing_time"
          type="time"
          required
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label>Parent Business</Label>
        <Select v-model="form.parent_id" placeholder="No Parent Business">
          <SelectItem value="">No Parent Business</SelectItem>
          <SelectItem
            v-for="business in businessStore.businesses"
            :key="business.id"
            :value="business.id"
          >
            {{ business.name }}
          </SelectItem>
        </Select>
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label>Business Image</Label>
        <div
          class="relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors"
          :class="imagePreview ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'"
        >
          <div v-if="imagePreview" class="mb-3">
            <img
              :src="imagePreview"
              alt="Preview"
              class="h-28 w-auto rounded-md object-contain"
            />
            <button
              type="button"
              @click="removeImage"
              class="absolute top-2 right-2 rounded-full bg-destructive/10 p-1 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div v-else class="text-center">
            <Upload class="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p class="text-sm text-muted-foreground mb-1">
              <label
                for="image"
                class="relative cursor-pointer font-medium text-primary hover:underline"
              >
                Click to upload
                <input
                  @change="handleFileChange"
                  id="image"
                  type="file"
                  class="sr-only"
                  accept="image/*"
                  required
                />
              </label>
              or drag and drop
            </p>
            <p class="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
          </div>

          <p v-if="imageError" class="mt-2 text-xs text-destructive">
            {{ imageError }}
          </p>
        </div>
      </div>
    </div>

    <Separator />

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="$emit('close')">
        Cancel
      </Button>
      <Button type="submit" :disabled="submitting">
        <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
        <Store v-else class="mr-2 h-4 w-4" />
        Create Business
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useBusinessStore } from "@/store/businessStore.js";
import { useRouter } from "vue-router";
import { uploadApi } from "@/api/modules/upload.api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectItem } from "@/components/ui/select";
import { Upload, X, Store, Loader2 } from "lucide-vue-next";

const businessStore = useBusinessStore();
const router = useRouter();
const emit = defineEmits(["close"]);

const imagePreview = ref(null);
const imageError = ref(null);
const submitting = ref(false);
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const form = ref({
  name: "",
  type: "",
  image: null,
  opening_time: "",
  closing_time: "",
  parent_id: "",
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  imageError.value = null;
  form.value.image = null;
  imagePreview.value = null;

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageError.value = "Please select a valid image file.";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    imageError.value = `Image size must be less than 15KB. Current size: ${(
      file.size / 1024
    ).toFixed(1)}KB`;
    return;
  }

  form.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
};

const removeImage = () => {
  form.value.image = null;
  imagePreview.value = null;
  imageError.value = null;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.value.name);
    formData.append("type", form.value.type);
    formData.append("image", form.value.image);
    formData.append("opening_time", form.value.opening_time);
    formData.append("closing_time", form.value.closing_time);
    formData.append("parent_id", form.value.parent_id);

    await businessStore.addBusiness(formData);
    router.push("/admin/restaurantAdmin");
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await businessStore.getBusinesses();
});
</script>
