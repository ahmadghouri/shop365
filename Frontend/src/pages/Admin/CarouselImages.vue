<template>
  <div class="space-y-6">
    <PageHeader title="Carousel Images" description="Manage your homepage carousel images">
      <template #actions>
        <Button variant="outline" @click="fetchImages" :disabled="loadingList">
          <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingList }" />
          Refresh
        </Button>
      </template>
    </PageHeader>

    <!-- Upload Card -->
    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2">
          <UploadCloud class="w-4 h-4" />
          Upload New Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col sm:flex-row gap-6">
          <!-- Drop zone -->
          <div class="flex-1">
            <label
              for="image-upload"
              class="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors bg-muted/30"
            >
              <div v-if="previewUrl" class="w-full h-full p-2">
                <img :src="previewUrl" alt="Preview" class="w-full h-full object-cover rounded-md" />
              </div>
              <div v-else class="flex flex-col items-center gap-2">
                <div class="p-3 bg-muted rounded-full">
                  <ImagePlus class="w-6 h-6 text-muted-foreground" />
                </div>
                <span class="text-sm text-muted-foreground">Click to select image</span>
                <span class="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
              </div>
            </label>
            <input id="image-upload" type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
          </div>

          <!-- Form -->
          <div class="flex-1 space-y-3">
            <div class="space-y-1.5">
              <Label>Title</Label>
              <Input v-model="newImage.title" type="text" placeholder="Image title" />
            </div>
            <div class="space-y-1.5">
              <Label>Description</Label>
              <textarea
                v-model="newImage.description"
                rows="3"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Image description"
              ></textarea>
            </div>
            <Alert v-if="uploadError" variant="destructive" class="py-2">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>{{ uploadError }}</AlertDescription>
            </Alert>
            <Alert v-if="uploadSuccess" class="py-2">
              <CheckCircle class="h-4 h-4" />
              <AlertDescription>{{ uploadSuccess }}</AlertDescription>
            </Alert>
            <Button @click="uploadImage" :disabled="!newImage.file || uploading" class="w-full">
              <Loader2 v-if="uploading" class="w-4 h-4 mr-2 animate-spin" />
              <UploadCloud v-else class="w-4 h-4 mr-2" />
              {{ uploading ? 'Uploading...' : 'Upload Image' }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Current Images -->
    <div class="space-y-3">
      <h2 class="text-lg font-semibold">Current Images</h2>

      <!-- Loading -->
      <div v-if="loadingList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="i in 3" :key="i" class="overflow-hidden">
          <Skeleton class="h-48 w-full rounded-none" />
          <CardContent class="pt-4 space-y-2">
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-3 w-full" />
          </CardContent>
        </Card>
      </div>

      <!-- Empty -->
      <EmptyState
        v-else-if="carouselImages.length === 0"
        title="No Images"
        description="Upload your first carousel image above."
        :icon="Image"
      />

      <!-- Grid -->
      <TransitionGroup v-else name="image-list" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="(image, index) in carouselImages" :key="image.id" class="overflow-hidden transition-all duration-200 hover:shadow-md">
          <div class="relative h-48">
            <img :src="image.image_url" :alt="image.title" class="w-full h-full object-cover" />
            <Badge class="absolute top-2 left-2" variant="secondary">
              #{{ index + 1 }}
            </Badge>
          </div>
          <CardContent class="pt-4 space-y-2">
            <h3 class="font-medium text-sm">{{ image.title }}</h3>
            <p class="text-xs text-muted-foreground line-clamp-2">{{ image.description }}</p>
            <Separator />
            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  :disabled="index === 0"
                  @click="moveImage(image.id, 'up')"
                >
                  <ChevronUp class="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  :disabled="index === carouselImages.length - 1"
                  @click="moveImage(image.id, 'down')"
                >
                  <ChevronDown class="w-4 h-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" @click="confirmDelete(image.id)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </TransitionGroup>
    </div>

    <!-- Delete Confirmation -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Image</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this carousel image? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="executeDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import PageHeader from "@/components/dashboard/PageHeader.vue";
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
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel
} from "@/components/ui/alert-dialog";
import {
  UploadCloud, ChevronUp, ChevronDown, Trash2, ImagePlus, RefreshCw,
  Loader2, AlertCircle, CheckCircle, Image
} from "lucide-vue-next";

const carouselImages = ref([]);
const loadingList = ref(true);
const uploading = ref(false);
const uploadError = ref("");
const uploadSuccess = ref("");
const showDeleteDialog = ref(false);
const imageToDelete = ref(null);
const previewUrl = ref(null);

const newImage = ref({
  title: "",
  description: "",
  file: null,
});

const fetchImages = async () => {
  loadingList.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/header-images`);
    carouselImages.value = response.data;
  } catch (error) {
    console.error("Failed to fetch images:", error);
  } finally {
    loadingList.value = false;
  }
};

onMounted(fetchImages);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    newImage.value.file = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const uploadImage = async () => {
  uploading.value = true;
  uploadError.value = "";
  uploadSuccess.value = "";

  try {
    const formData = new FormData();
    formData.append("image", newImage.value.file);
    formData.append("title", newImage.value.title);
    formData.append("description", newImage.value.description);
    formData.append("order", carouselImages.value.length);

    const response = await axios.post(`${API_BASE_URL}/api/header-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    carouselImages.value.push(response.data.data);
    newImage.value = { title: "", description: "", file: null };
    previewUrl.value = null;
    document.getElementById("image-upload").value = "";
    uploadSuccess.value = "Image uploaded successfully";
  } catch (error) {
    uploadError.value = error.response?.data?.message || "Failed to upload image";
  } finally {
    uploading.value = false;
  }
};

const confirmDelete = (id) => {
  imageToDelete.value = id;
  showDeleteDialog.value = true;
};

const executeDelete = async () => {
  if (!imageToDelete.value) return;
  try {
    await axios.delete(`${API_BASE_URL}/api/header-images/${imageToDelete.value}`);
    carouselImages.value = carouselImages.value.filter((img) => img.id !== imageToDelete.value);
  } catch (error) {
    console.error("Failed to delete image:", error);
  } finally {
    showDeleteDialog.value = false;
    imageToDelete.value = null;
  }
};

const moveImage = async (id, direction) => {
  const currentIndex = carouselImages.value.findIndex((img) => img.id === id);
  const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (newIndex < 0 || newIndex >= carouselImages.value.length) return;

  try {
    const orders = carouselImages.value.map((img, index) => ({
      id: img.id,
      order: index === currentIndex ? newIndex : index === newIndex ? currentIndex : index,
    }));

    await axios.post(`${API_BASE_URL}/api/header-images/reorder`, { orders });

    const images = [...carouselImages.value];
    [images[currentIndex], images[newIndex]] = [images[newIndex], images[currentIndex]];
    carouselImages.value = images;
  } catch (error) {
    console.error("Failed to reorder images:", error);
  }
};
</script>

<style scoped>
.image-list-move {
  transition: transform 0.5s ease;
}
.image-list-enter-active,
.image-list-leave-active {
  transition: all 0.5s ease;
}
.image-list-enter-from,
.image-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
