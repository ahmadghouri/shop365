<template>
  <div class="min-h-full bg-white rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Carousel Images</h1>
      <p class="mt-2 text-sm text-gray-600">
        Manage your homepage carousel images
      </p>
    </div>

    <!-- Upload Section -->
    <div class="mb-8">
      <div
        class="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-center">
            <label
              for="image-upload"
              class="cursor-pointer flex flex-col items-center space-y-2"
            >
              <div class="p-4 bg-gray-50 rounded-full">
                <UploadCloud class="w-8 h-8 text-gray-400" />
              </div>
              <span class="text-sm font-medium text-gray-600"
                >Click to upload image</span
              >
              <span class="text-xs text-gray-500">PNG, JPG up to 5MB</span>
            </label>
            <input
              id="image-upload"
              type="file"
              class="hidden"
              accept="image/*"
              @change="handleImageUpload"
            />
          </div>

          <!-- Form fields -->
          <div class="space-y-4 max-w-md mx-auto">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Title</label
              >
              <input
                v-model="newImage.title"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Description</label
              >
              <textarea
                v-model="newImage.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
            <button
              @click="uploadImage"
              :disabled="!newImage.file"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Upload Image
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Images List -->
    <div class="space-y-6">
      <h2 class="text-lg font-medium text-gray-900">Current Images</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TransitionGroup name="image-list">
          <div
            v-for="image in carouselImages"
            :key="image.id"
            class="relative group bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <img
              :src="image.image_url"
              :alt="image.title"
              class="w-full h-48 object-cover"
            />
            <div class="p-4 space-y-2">
              <h3 class="font-medium text-gray-900">{{ image.title }}</h3>
              <p class="text-sm text-gray-500">{{ image.description }}</p>

              <div class="flex items-center justify-between pt-2">
                <div class="flex items-center space-x-2">
                  <button
                    @click="moveImage(image.id, 'up')"
                    class="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronUp class="w-5 h-5" />
                  </button>
                  <button
                    @click="moveImage(image.id, 'down')"
                    class="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown class="w-5 h-5" />
                  </button>
                </div>
                <button
                  @click="deleteImage(image.id)"
                  class="p-1 text-red-400 hover:text-red-600"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { UploadCloud, ChevronUp, ChevronDown, Trash2 } from "lucide-vue-next";
import { API_BASE_URL } from "../../config/api";

const carouselImages = ref([]);
const newImage = ref({
  title: "",
  description: "",
  file: null,
});

// Fetch images on component mount
onMounted(async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/header-images`);
    console.log(response.data);

    carouselImages.value = response.data;
  } catch (error) {
    console.error("Failed to fetch images:", error);
  }
});

const handleImageUpload = (event) => {
  newImage.value.file = event.target.files[0];
};

const uploadImage = async () => {
  try {
    const formData = new FormData();
    formData.append("image", newImage.value.file);
    formData.append("title", newImage.value.title);
    formData.append("description", newImage.value.description);
    formData.append("order", carouselImages.value.length);

    const response = await axios.post(
      `${API_BASE_URL}/api/header-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    carouselImages.value.push(response.data.data);
    newImage.value = { title: "", description: "", file: null };

    // Reset file input
    document.getElementById("image-upload").value = "";
  } catch (error) {
    console.error("Failed to upload image:", error);
  }
};

const deleteImage = async (id) => {
  if (!confirm("Are you sure you want to delete this image?")) return;

  try {
    await axios.delete(`${API_BASE_URL}/api/header-images/${id}`);
    carouselImages.value = carouselImages.value.filter((img) => img.id !== id);
  } catch (error) {
    console.error("Failed to delete image:", error);
  }
};

const moveImage = async (id, direction) => {
  const currentIndex = carouselImages.value.findIndex((img) => img.id === id);
  const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (newIndex < 0 || newIndex >= carouselImages.value.length) return;

  try {
    const orders = carouselImages.value.map((img, index) => ({
      id: img.id,
      order:
        index === currentIndex
          ? newIndex
          : index === newIndex
          ? currentIndex
          : index,
    }));

    await axios.post(`${API_BASE_URL}/api/header-images/reorder`, { orders });

    // Update local order
    const images = [...carouselImages.value];
    [images[currentIndex], images[newIndex]] = [
      images[newIndex],
      images[currentIndex],
    ];
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
