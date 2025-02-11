<template>
  <!-- Desktop Carousel -->
  <div class="hidden lg:block w-full mb-8">
    <div class="relative overflow-hidden rounded-xl">
      <div class="relative w-full aspect-[16/9]">
        <TransitionGroup name="fade">
          <div
            v-for="(image, index) in displayImages"
            :key="image.id"
            v-show="currentSlide === index"
            class="absolute inset-0"
          >
            <!-- Enhanced Desktop Skeleton -->
            <div
              v-if="!loadedImages[image.id]"
              class="absolute inset-0 overflow-hidden bg-gray-100"
            >
              <div class="absolute inset-0">
                <!-- Main Image Skeleton -->
                <div class="w-full h-full">
                  <div class="w-full h-full bg-gray-200 animate-pulse"></div>
                </div>

                <!-- Content Skeleton -->
                <div class="absolute inset-x-0 bottom-0 p-8 space-y-4">
                  <!-- Title Skeleton -->
                  <div class="skeleton-item h-8 w-2/3"></div>

                  <!-- Description Skeleton Lines -->
                  <div class="space-y-3">
                    <div class="skeleton-item h-4 w-full"></div>
                    <div class="skeleton-item h-4 w-4/5"></div>
                  </div>
                </div>

                <!-- Shimmer Overlay -->
                <div class="skeleton-shine"></div>
              </div>
            </div>

            <!-- Actual Image -->
            <img
              :src="image.image_url"
              :alt="image.title"
              class="w-full h-full object-cover transition-opacity duration-300"
              :class="{
                'opacity-0': !loadedImages[image.id],
                'opacity-100': loadedImages[image.id],
              }"
              @load="() => handleImageLoad(image.id)"
            />

            <!-- Content Overlay -->
            <div
              v-if="
                loadedImages[image.id] && (image.title || image.description)
              "
              class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"
            >
              <div class="absolute bottom-0 left-0 p-8 text-white max-w-2xl">
                <h2
                  v-if="image.title"
                  class="text-4xl font-bold mb-3 leading-tight text-white/90"
                >
                  {{ image.title }}
                </h2>
                <p
                  v-if="image.description"
                  class="text-lg leading-relaxed text-white/80"
                >
                  {{ image.description }}
                </p>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Navigation Arrows -->
        <button
          v-if="displayImages.length > 1"
          @click="prevSlide"
          class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-all"
        >
          <ChevronLeft class="w-6 h-6 text-white" />
        </button>
        <button
          v-if="displayImages.length > 1"
          @click="nextSlide"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/30 hover:bg-white/50 transition-all"
        >
          <ChevronRight class="w-6 h-6 text-white" />
        </button>

        <!-- Indicators -->
        <div
          v-if="displayImages.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2"
        >
          <button
            v-for="(_, index) in displayImages"
            :key="index"
            @click="currentSlide = index"
            :class="[
              'w-2 h-2 rounded-full transition-all',
              currentSlide === index ? 'bg-white w-4' : 'bg-white/50',
            ]"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Carousel -->
  <div class="lg:hidden w-full mb-6">
    <div class="relative overflow-hidden rounded-lg">
      <div class="relative w-full aspect-[16/9]">
        <TransitionGroup name="fade">
          <div
            v-for="(image, index) in displayImages"
            :key="image.id"
            v-show="currentSlide === index"
            class="absolute inset-0"
          >
            <!-- Enhanced Mobile Skeleton -->
            <div
              v-if="!loadedImages[image.id]"
              class="absolute inset-0 overflow-hidden bg-gray-100"
            >
              <div class="absolute inset-0">
                <!-- Main Image Skeleton -->
                <div class="w-full h-full">
                  <div class="w-full h-full bg-gray-200 animate-pulse"></div>
                </div>

                <!-- Mobile Content Skeleton -->
                <div class="absolute inset-x-0 bottom-0 p-4 space-y-2">
                  <div class="skeleton-item h-6 w-2/3"></div>
                  <div class="skeleton-item h-4 w-full"></div>
                </div>

                <!-- Shimmer Overlay -->
                <div class="skeleton-shine"></div>
              </div>
            </div>

            <!-- Actual Image -->
            <img
              :src="image.image_url"
              :alt="image.title"
              class="w-full h-full object-cover transition-opacity duration-300"
              :class="{
                'opacity-0': !loadedImages[image.id],
                'opacity-100': loadedImages[image.id],
              }"
              @load="() => handleImageLoad(image.id)"
            />

            <!-- Mobile Content Overlay -->
            <div
              v-if="
                loadedImages[image.id] && (image.title || image.description)
              "
              class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
            >
              <div class="absolute bottom-0 left-0 p-4 text-white w-full">
                <h2
                  v-if="image.title"
                  class="text-2xl font-bold mb-1 leading-tight text-white/90 line-clamp-2"
                >
                  {{ image.title }}
                </h2>
                <p
                  v-if="image.description"
                  class="text-sm leading-relaxed text-white/80 line-clamp-2"
                >
                  {{ image.description }}
                </p>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- Mobile Touch Swipe Area -->
        <div
          v-if="displayImages.length > 1"
          class="absolute inset-0"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        ></div>

        <!-- Mobile Indicators -->
        <div
          v-if="displayImages.length > 1"
          class="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1"
        >
          <div
            v-for="(_, index) in displayImages"
            :key="index"
            :class="[
              'w-1.5 h-1.5 rounded-full transition-all',
              currentSlide === index ? 'bg-white w-3' : 'bg-white/50',
            ]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { useCarouselStore } from "../store/useCarousel";
import { storeToRefs } from "pinia";

interface CarouselImage {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
}

const defaultImage: CarouselImage = {
  id: "default",
  image_url: "",
  title: "",
  description: "",
};

const carouselStore = useCarouselStore();
const { images } = storeToRefs(carouselStore);
const currentSlide = ref(0);
const loadedImages = ref<Record<string, boolean>>({});
let autoplayInterval: NodeJS.Timeout;

// Computed property for images with fallback
const displayImages = computed(() => {
  return images.value?.length ? images.value : [defaultImage];
});

// Touch handling variables and functions
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0].clientX;
};

const handleTouchMove = (event: TouchEvent) => {
  touchEndX = event.touches[0].clientX;
};

const handleTouchEnd = () => {
  const swipeThreshold = 50;
  const swipeDistance = touchEndX - touchStartX;

  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      prevSlide();
    } else {
      nextSlide();
    }
  }
};

const handleImageLoad = (imageId: string) => {
  setTimeout(() => {
    loadedImages.value[imageId] = true;
  }, 300);
};

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % displayImages.value.length;
};

const prevSlide = () => {
  currentSlide.value =
    currentSlide.value === 0
      ? displayImages.value.length - 1
      : currentSlide.value - 1;
};

const startAutoplay = () => {
  if (displayImages.value.length > 1) {
    autoplayInterval = setInterval(nextSlide, 5000);
  }
};

const stopAutoplay = () => {
  clearInterval(autoplayInterval);
};

onMounted(async () => {
  await carouselStore.fetchImages();
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<style scoped>
.skeleton-item {
  @apply rounded-lg bg-gray-200 overflow-hidden relative;
}

.skeleton-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shine 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes shine {
  to {
    left: 100%;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Smooth image transition */
img {
  transition: opacity 0.3s ease-in-out;
}
</style>
