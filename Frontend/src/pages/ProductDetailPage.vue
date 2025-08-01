<template>
  <div v-if="product" class="mobile-spacing lg:px-20 xl:px-32 py-10">
    <!-- Back Arrow -->
    <div class="flex items-center mt-6 lg:mt-0">
      <button @click="goBack" class="h-4 w-4 lg:h-6 lg:w-6">
        <!-- Back Arrow Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-full w-full text-gray-900 hover:text-gray-700 transition duration-150"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Responsive Container for Product Details -->
    <div class="flex flex-col lg:flex-row lg:gap-10 mt-6 lg:mt-10">
      <!-- Product Image -->
      <div class="lg:w-1/2 flex justify-center items-center">
        <div
          class="rounded-lg overflow-hidden w-full max-w-sm lg:w-96 lg:h-96 bg-transparent"
        >
          <img
            ref="productImage"
            class="object-contain w-full h-full image"
            :src="product.image_url"
            alt="Product image"
          />
        </div>
      </div>

      <!-- Product Information -->
      <div
        class="bg-white p-4 lg:p-8 rounded-lg shadow-lg lg:w-1/2 mt-6 lg:mt-0 relative"
      >
      <!-- Stock Badge -->
        <div
          v-if="
            product.is_active === 0"
          class="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md transform -rotate-6"
        >
          Out of Stock
        </div>
        <div
          class="text-center mt-2 lg:text-left flex justify-between items-center"
        >
          <h2
            class="text-2xl text-left lg:text-3xl lg:max-w-full font-semibold text-gray-900"
          >
            {{ product.title }}
          </h2>
          <div v-if="product.type.toLowerCase() !== 'services'">
            <p v-if="product.discount > 0" class="text-sm lg:text-lg mb-1">
              <span class="text-gray-500 line-through text-base lg:text-sm">
                Rs:{{ product.price }}
              </span>
              <span class="text-red-600 font-bold text-xl ml-2 lg:text-2xl">
                Rs:{{ product.final_price }}
              </span>
            </p>
            <p v-else class="text-lg lg:text-xl text-gray-800 font-semibold">
              Rs:{{ product.price }}
            </p>
          </div>
        </div>

        <!-- Description and Quantity Controls -->
        <div class="mt-6 space-y-4">
          <div>
            <label class="font-semibold text-gray-900">Description</label>
            <div
              v-html="product.description"
              class="prose text-sm lg:text-base text-gray-600 mt-1"
            ></div>
          </div>
        </div>

        <!-- Buttons for Order and Add to Cart -->
        <div
          v-if="product.type.toLowerCase() === 'prescription'"
          class="mt-8 flex items-center"
        >
        <!-- Prescription Button -->
        <!-- <button
          @click.prevent="openPrescriptionModal(product)"
          class="group w-full mt-2 lg:mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white font-semibold text-sm rounded-full shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>

          <span class="hidden sm:inline">Upload Prescription</span>
          <span class="sm:hidden">Prescription</span>
        </button> -->
        </div>

        <div v-else-if="product.type.toLowerCase() !== 'services'"
          :disabled="product.is_active === 0"
          class="mt-8 flex flex-col items-center lg:items-start space-y-3"
        >
          <button
            :disabled="product.is_active === 0"
            :class="{'cursor-not-allowed': product.is_active === 0}"
            class="button"
            @click="handleOrderNow"
          >
            Order Now
          </button>
          <button
            :disabled="product.is_active === 0"
            :class="{'cursor-not-allowed': product.is_active === 0}"
            class="button-border"
            @click="addToCart"
          >
            Add To Cart
          </button>
        </div>

        <div v-else class="mt-8 flex items-center">
          <button class="button" @click.prevent="openContactPopup(product)">
            Appointment Now
          </button>
        </div>
      </div>
    </div>

    <!-- Prescription Modal -->
    <!-- <div
      v-if="showPrescriptionModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click="closePrescriptionModal"
    >
      <div
        class="bg-white prescription-modal w-full max-w-md rounded-lg shadow-xl p-6"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Upload Prescription</h2>
          <button
            @click="closePrescriptionModal"
            class="text-gray-600 hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form @submit.prevent="addToCart">
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-600 block mb-2">
              Prescription Image
            </label>
            <div
              class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-yellow-400 transition-colors duration-200"
            >
              <div class="space-y-2 text-center">
                <div v-if="imagePreview" class="mb-4">
                  <img
                    :src="imagePreview"
                    alt="Preview"
                    class="mx-auto h-32 w-auto rounded-lg shadow-sm"
                  />
                </div>
                <div class="flex text-sm text-gray-600">
                  <label
                    for="image"
                    class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500"
                  >
                    <span>Upload a file</span>
                    <input
                      @change="handleFileChange"
                      id="image"
                      type="file"
                      class="sr-only"
                      accept="image/*"
                      capture="environment"
                      required
                    />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF</p>
                <p v-if="imageError" class="text-xs text-red-500 mt-1">
                  {{ imageError }}
                </p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-gray-600 font-semibold mb-2">
              Description
            </label>
            <textarea
              v-model="description"
              class="w-full border rounded p-2"
              rows="3"
              placeholder="Enter additional details..."
              required
            ></textarea>
          </div>

                  <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2"
            >Important *</label
          >
          <div
            class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md"
          >
            <p class="flex items-center font-medium">
              <svg
                class="w-5 h-5 mr-2 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.766-1.36 2.72-1.36 3.486 0l6.588 11.7c.75 1.33-.213 3-1.743 3H3.415c-1.53 0-2.493-1.67-1.743-3l6.585-11.7zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v4a1 1 0 01-1 1z"
                  clip-rule="evenodd"
                />
              </svg>
              Prescription payment will be confirmed on call.
            </p>
          </div>
        </div>
        
          <div class="flex justify-end">
            <button
              type="submit"
              class="group w-full mt-2 lg:mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span class="hidden sm:inline">Add to Cart</span>
              <span class="sm:hidden">Add</span>
            </button>
          </div>
        </form>
      </div>
    </div> -->
  </div>

   <div v-if="isLoading" class="loader loading-overlay">
        <span></span>
        <span></span>
        <span></span>
      </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const quantity = ref(1);
const productImageRef = ref(null);
const showPrescriptionModal = ref(false);
const isLoading = ref(false);


const imagePreview = ref(null);
const imageError = ref(null);
const description = ref("");
const MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes

const form = ref({
  image: null, // This will now store base64 instead of a File object
});

// const openPrescriptionModal = (product) => {
//   showPrescriptionModal.value = true;
// };

// const closePrescriptionModal = () => {
//   showPrescriptionModal.value = false;
// };

const handleFileChange = (event) => {
  const file = event.target.files[0];
  imageError.value = null;
  imagePreview.value = null;

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageError.value = "Please select a valid image file.";
    return;
  }

  // Optional: size limit
  // if (file.size > MAX_FILE_SIZE) {
  //   imageError.value = `Image size must be less than 50KB. Current size: ${(
  //     file.size / 1024
  //   ).toFixed(1)}KB`;
  //   return;
  // }

  // Convert to base64
  // const reader = new FileReader();
  // reader.onload = () => {
  //   form.value.image = reader.result; 
  //   imagePreview.value = reader.result; 
  // };
  // reader.onerror = () => {
  //   imageError.value = "Failed to read image file.";
  // };

  // reader.readAsDataURL(file); 
};


onMounted(async () => {
  const productId = route.params.id;
  const businessId = route.query.business_id;

  await productStore.getProduct(productId, businessId);
});

const product = computed(() => productStore.product);

const addToCart = async () => {
  const cartItem = {
    product_id: route.params.id,
    quantity: quantity.value,
    product: {
      id: product.value.id,
      title: product.value.title,
      price: product.value.price,
      final_price: product.value.final_price,
      image_url: product.value.image_url,
      business_id: product.value.business_id,
      // prescription:
      //   product.value.type.toLowerCase() === "prescription"
      //     ? {
      //         prescription_image: form.value.image,
      //         prescription_description: description.value,
      //       }
      //     : null,
    },
  };

  try {
    // if (product.value.type.toLowerCase() === "prescription") {
    //   closePrescriptionModal();
    // }
     isLoading.value = true;
    await cartStore.addToCart(cartItem);
  } catch (error) {
    console.log(error);
    toast.error("Failed to add product to cart.");
  }finally {
    isLoading.value = false;
  }
};

const handleOrderNow = async () => {
  await addToCart();
  router.push({ name: "Cart" });
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* .loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black; 
  backdrop-filter: blur(5px); 
  opacity: 0.5; 
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; 
} */

.loader {
  display: flex;
  justify-content: center;
}

.loader span {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 5px;
  background-color: rgb(234 179 8);
  border-radius: 50%;
  animation: bounce 0.6s infinite alternate;
}

.loader span:nth-child(2) {
  animation-delay: 0.2s;
}

.loader span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-15px);
  }
}

/* Add your styles here */
.prose {
  max-width: none;
  width: 100%;
}

/* Table styling */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.prose th,
.prose td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.prose th {
  background-color: #f9fafb;
  font-weight: 600;
}

/* List styling */
.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

/* Maintain spacing */
.prose > * + * {
  margin-top: 1rem;
}

/* Responsive modal styles */
/* @media (max-width: 768px) {
  .prescription-modal {
    width: 90%; 
    max-height: 80vh; 
    overflow-y: auto; 
  }
}

@media (min-width: 769px) {
  .prescription-modal {
    width: 50%; 
    max-height: 70vh;
    overflow-y: auto;
  }
} */
</style>