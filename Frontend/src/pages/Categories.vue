<template>
  <div class="mobile-spacing relative lg:px-16">
    <!-- <button
      @click="handleSearch"
      class="fixed bottom-6 left-1/2 lg:left-[95%] transform -translate-x-1/2 z-50 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-4 shadow-lg"
    >
      <img src="/search.png" alt="" />
    </button> -->

    <section class="lg:hidden mb-2">
      <div>
        <span class="text-[#888888] text-xl mb-2">
          Hi {{ name || "Loading..." }}
        </span>
        <h1 class="text-yellow-500 text-3xl font-bold">Welcome To SHOP365</h1>
        <button @click="showFormModal" class="my-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out">Apply Now</button>
      </div>
    </section>

    <div class="lg:hidden">
      <Carousel />
    </div>

    <section class="hidden lg:block">
      <!-- Desktop Carousel First -->

      <!-- Welcome Section -->
      <div class="flex items-center py-12 px-20 gap-5 bg-white rounded-lg">
        <div class="max-w-full flex flex-col justify-center">
          <div class="text-left">
            <span class="text-[#888888] text-xl mb-2 block">
              Hi {{ name || "Loading..." }}
            </span>
            <h1 class="text-yellow-500 text-4xl font-bold mb-4">
              Welcome To SHOP365
            </h1>
            <p class="text-gray-600 text-lg">
              Too busy to shop? Let us handle it! Groceries and your favorite
              foods delivered straight to you with a single tap!
            </p>
            <button
              @click="scrollToShops"
              class="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out"
            >
              Discover More
            </button>
             <button @click="showFormModal" class="mt-6  ml-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out">Apply Now</button>
          </div>
        </div>
        <div class="w-full">
          <Carousel class="mb-8" />
        </div>
      </div>
    </section>

    <!-- Hero Image Section -->
    <!-- <section class="flex justify-center lg:hidden">
      <div
        class="h-[180px] w-[374px] shadow-md flex justify-center items-center p-5 mt-8 gap-4 bg-yellow-500/15 rounded-lg"
      >
        <div class="flex-1 h-full flex items-center">
          <img
            src="/hero.svg"
            alt="Hero Image"
            class="h-full w-full object-contain rounded-lg"
          />
        </div>
        <div
          class="flex-1 flex flex-col items-center justify-center text-center"
        >
          <span class="text-xl font-semibold">Free Delivery</span>
          <p class="text-sm text-[#888888]">All Over the city.</p>
          <button
            class="mt-4 rounded-full bg-yellow-500 px-4 py-1 text-sm text-white"
            @click="scrollToShops"
          >
            Order Now
          </button>
        </div>
      </div>
    </section> -->

    <!-- Services Component -->
    <Services @serviceSelected="filterByService" />

    <section ref="shopsSection" class="lg:px-16">
      <div v-if="isLoading" class="flex justify-center mt-6">
        <div class="loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <!-- <div
        v-if="isLoading"
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="animate-pulse bg-white shadow-lg rounded-lg overflow-hidden"
          style="height: 250px"
        >
          <div class="h-2/5 bg-gray-300"></div>
          <div class="p-4">
            <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div> -->
      <!-- <h1
        class="mt-3 text-2xl font-bold text-left sm:text-3xl md:text-4xl lg:text-5xl text-gray-800"
      >
        {{ selectedService.toLocaleUpperCase() || "FOOD" }}
      </h1> -->

      <!-- Filters -->
      <!-- <div class="overflow-x-auto whitespace-nowrap py-4 mb-4">
        <button
          v-for="filter in filters"
          :key="filter"
          @click="filterProducts(filter)"
          :class="[
            'inline-block px-4 py-2 mx-2 text-sm font-medium rounded-full cursor-pointer',
            filter === selectedFilter
              ? 'bg-yellow-500 text-white hover:bg-yellow-500'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ filter }}
        </button>
      </div> -->

      <!-- Restaurant Categories -->
      <div
        v-if="!isLoading && filteredRestaurants.length"
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6"
      >
        <router-link
          v-for="category in filteredRestaurants"
          :key="category.id"
          :to="'#'"
          @click.prevent="handleBusinessClick(category)"
          class="relative bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl category-link"
        >
          <div class="relative category-image-container">
            <img
              class="category-image"
              :src="category.image_url"
              alt="Category Image"
              loading="lazy"
            />
            <!-- Discount Badge -->
            <!-- <div
              v-if="category.type == 'Grocery'"
              class="absolute top-3 left-0 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-1.5 py-0.5 shadow-md transform"
            >
              Upto 15% OFF
            </div> -->
            <div
              v-if="category.discount > 0"
              class="absolute top-5 left-0 -rotate-45 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-1.5 py-0.5 shadow-md transform"
            >
              {{ category.discount }}% OFF
            </div>
          </div>
          <div class="p-4 flex flex-col justify-between h-[60%]">
            <div>
              <h1
                class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14 lg:h-auto"
              >
                {{ category.name }}
              </h1>

              <!-- Rating Component -->
              <div class="flex items-center mb-2">
                <!-- Star Rating -->
                <div class="flex items-center mr-2">
                  <template v-for="n in 5" :key="n">
                    <svg
                      v-if="n <= Math.round(category.reviews_avg_rating || 0)"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="w-4 h-4 text-yellow-500 fill-current"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="w-4 h-4 text-gray-300 fill-current"
                    >
                      <path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  </template>
                </div>

                <!-- Rating Text -->
                <span class="text-sm text-gray-600">
                  {{
                    category.reviews_avg_rating
                      ? category.reviews_avg_rating.toFixed(1)
                      : "0.0"
                  }}
                </span>

                <span class="text-sm text-gray-600 ml-1">
                  ({{ category.reviews_count }})</span
                >
              </div>
              <div class="flex items-center mb-2">
                <!-- Dot Indicator for Open/Closed -->
                <span
                  :class="{
                    'bg-green-500': isOpen(
                      category.opening_time,
                      category.closing_time
                    ),
                    'bg-red-500': !isOpen(
                      category.opening_time,
                      category.closing_time
                    ),
                  }"
                  class="w-3 h-3 rounded-full mr-2"
                ></span>
                <span class="text-sm">
                  {{
                    isOpen(category.opening_time, category.closing_time)
                      ? "Opened"
                      : "Closed"
                  }}
                </span>
              </div>
            </div>
            <div class="mt-auto text-center">
              <span
                :class="[
                  isOpen(category.opening_time, category.closing_time)
                    ? 'text-yellow-500 hover:text-yellow-700'
                    : 'text-gray-400',
                ]"
                class="font-semibold"
              >
                {{
                  isOpen(category.opening_time, category.closing_time)
                    ? "View Details"
                    : "Closed"
                }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
      <div v-else-if="!isLoading" class="mt-8 text-center text-gray-600">
        Coming Soon
      </div>
    </section>

    <StoreClosedPopUp
      :show="showStoreClosedPopup"
      @confirm="handleStoreClosedConfirm"
      @cancel="handleStoreClosedCancel"
    />
  </div>

  <!-- Internship Form Modal -->
  <div
    v-show="showformmodal"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click=""
  >
    <div class="bg-white internship-modal w-full max-w-md rounded-lg shadow-xl p-6" @click.stop>
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">📢 Internship Opportunity</h2>
        <button
          @click="closeformmodal"
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

      <!-- View Details Button -->
      <div class="mb-4">
        <button
          @click="showinfoModal"
          class="text-yellow-500 hover:text-yellow-700 font-semibold"
        >
          View details
        </button>
      </div>

      <!-- Internship Form -->
      <form @submit.prevent="submitInternshipApplication">
        <!-- Full Name -->
        <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2">Full Name</label>
          <input
            v-model="formData.full_name"
            type="text"
            class="w-full border rounded p-2"
            placeholder="Enter your full name"
            required
          />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2">Email Address</label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full border rounded p-2"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <!-- Phone Number -->
        <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2">Phone Number</label>
          <input
            v-model="formData.phone"
            type="tel"
            class="w-full border rounded p-2"
            placeholder="Enter your phone number"
            required
          />
        </div>

        <!-- Portfolio Website / GitHub (optional, URL) -->
        <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2">Portfolio Website / GitHub</label>
          <input
            v-model="formData.portfolio_url"
            type="url"
            class="w-full border rounded p-2"
            placeholder="Enter your portfolio or GitHub URL (optional)"
          />
        </div>

        <!-- Academic Information(optional) -->
         <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2">Academic Information</label>
          <input
            v-model="formData.academic_info"
            type="text"
            class="w-full border rounded p-2"
            placeholder="Enter your Academic Information (optional)"
          />
        </div>

        <!-- Important Note -->
        <div class="mb-4">
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
              We will contact shortlisted candidates via email/phone.
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            class="group w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span class="hidden sm:inline">Submit Application</span>
            <span class="sm:hidden">Apply</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Internship Details Modal -->
  <div
    v-show="showInternshipDetails"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
  >
    <div
      class="bg-white internship-modal w-full max-w-lg rounded-lg shadow-xl p-6"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">
          📋 Internship Opportunity (Details)
        </h2>
        <button
          @click="closeinfomodal"
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

      <!-- Language Toggle -->
      <div class="flex justify-center mb-4">
        <button
          @click="currentLanguage = 'en'"
          :class="[
            'px-4 py-2 font-semibold rounded-full',
            currentLanguage === 'en'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          ]"
        >
          English
        </button>
        <button
          @click="currentLanguage = 'ur'"
          :class="[
            'px-4 py-2 font-semibold rounded-full ml-2',
            currentLanguage === 'ur'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
          ]"
        >
          اردو
        </button>
      </div>

      <!-- Modal Content -->
      <div v-if="currentLanguage === 'en'" class="text-gray-700 space-y-4">
        <p>
          We have <strong>3 to 5 internship slots</strong> available for
          developers. The complete process and criteria are as follows:
        </p>

        <h3 class="text-lg font-semibold text-gray-800">Internship Process (Step-by-Step)</h3>
        <ol class="list-decimal list-inside space-y-2">
          <li><strong>Step 1: Application</strong> - Submit your application through the provided form or email.</li>
          <li><strong>Step 2: Initial Review</strong> - We will review your resume/CV and qualification details.</li>
          <li><strong>Step 3: Contact</strong> - Shortlisted candidates will be contacted via phone call or email.</li>
          <li><strong>Step 4: Interview</strong> - You will be invited for an online or on-site interview.</li>
          <li><strong>Step 5: Final Selection</strong> - Selected candidates will receive an official internship offer.</li>
          <li><strong>Step 6: Training Program</strong> - Selected interns will undergo training to enhance their skills.</li>
        </ol>

        <h3 class="text-lg font-semibold text-gray-800">Internship Criteria</h3>
        <ul class="list-disc list-inside space-y-2">
          <li>Fresh graduates or final year students are encouraged to apply.</li>
          <li>Good communication skills are a plus.</li>
          <li>Eagerness to learn and grow professionally.</li>
          <li>Available for the internship period (duration will be informed during the process).</li>
        </ul>
      </div>

      <div dir="rtl"v-if="currentLanguage === 'ur'" class="text-gray-700 space-y-4 text-right">
        <p>
          ہمارے پاس <strong>3 سے 5</strong> ڈویلپرز کے لیے انٹرن شپ کی جگہیں دستیاب ہیں۔ مکمل عمل اور معیار درج ذیل ہے:
        </p>

    <h3 class="text-lg font-semibold text-gray-800">انٹرن شپ کا عمل</h3>
    <ul class="list-disc list-inside space-y-2">
      <li><strong>درخواست دینا</strong> - فارم یا ای میل کے ذریعے اپنی درخواست جمع کروائیں۔</li>
      <li><strong>ابتدائی جانچ پڑتال</strong> - آپ کے ریزیومے/سی وی اور تعلیمی قابلیت کا جائزہ لیا جائے گا۔</li>
      <li><strong>رابطہ کرنا</strong> - شارٹ لسٹ ہونے والے امیدواروں سے فون کال یا ای میل کے ذریعے رابطہ کیا جائے گا۔</li>
      <li><strong>انٹرویو</strong> - آن لائن یا آفس میں انٹرویو کے لیے بلایا جائے گا۔</li>
      <li><strong>حتمی انتخاب</strong> - منتخب امیدواروں کو انٹرن شپ آفر دی جائے گی۔</li>
      <li><strong>تربیتی پروگرام</strong> - منتخب انٹرنز کو مہارت بڑھانے کے لیے تربیت دی جائے گی۔</li>
    </ul>

    <h3 class="text-lg font-semibold text-gray-800 mt-6">انٹرن شپ کا معیار</h3>
    <ul class="list-disc list-inside space-y-2">
      <li>تازہ گریجویٹس یا آخری سال کے طلبہ درخواست دے سکتے ہیں۔</li>
      <li>اچھی کمیونیکیشن اسکلز ہونا اضافی خوبی ہے۔</li>
      <li>سیکھنے اور پروفیشنل گروتھ کا جذبہ ہونا چاہیے۔</li>
      <li>انٹرن شپ کے دورانیے کے لیے دستیاب ہونا ضروری ہے (مدت انٹرویو کے دوران بتائی جائے گی)۔</li>
    </ul>
      </div>

      <!-- Close Button -->
      <div class="flex justify-end mt-6">
        <button
          @click="closeinfomodal"
          class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out"
        >
          Close
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { useBusinessStore } from "../store/businessStore";
import { ref, computed, onMounted } from "vue";
import moment from "moment-timezone";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import Services from "../components/Services.vue";
import { useRouter } from "vue-router";
import Launchment from "./Launchment.vue";
import StoreClosedPopUp from "../components/StoreClosedPopUp.vue";
import { useAuthStore } from "../stores/authStore";
import Carousel from "../components/Carousel.vue";
import { toast } from "vue3-toastify";

const businessStore = useBusinessStore();
const filters = ref(["All", "opened", "closed"]);
const selectedFilter = ref("All");
const selectedService = ref("Grocery");
const profile = ref(null);
const name = ref("");
const router = useRouter();
const shopsSection = ref(null);
const isLoading = ref(true);
const authStore = useAuthStore();

const showStoreClosedPopup = ref(false);
const pendingBusinessId = ref(null);
const pendingBusinessName = ref(null);
const showformmodal = ref(false);
const showInternshipDetails = ref(false);
const currentLanguage = ref('en'); 

const showFormModal = () => {
    showformmodal.value = true;
};

const closeformmodal = () => {
    showformmodal.value = false;
};

const showinfoModal = () => {
    showInternshipDetails.value = true;
};

const closeinfomodal = () => {
    showInternshipDetails.value = false;
};

const formData = ref({
  full_name: '',
  email: '',
  phone: '',
  portfolio_url: '',
  academic_info: '',
});

const submitInternshipApplication = async () => {
  //check if user is authenticated
  if (!authStore.isAuthenticated) {
    toast.error('Please log in to apply for the internship.');
    setTimeout(() => {
      router.push('/userlogin');
    }, 2000);
    return;
  }
    try {
        const response = await axios.post(`${API_BASE_URL}/api/internship/apply`, {
            full_name: formData.value.full_name,
            email: formData.value.email,
            phone: formData.value.phone,
            portfolio_url: formData.value.portfolio_url,
            academic_info: formData.value.academic_info,
        });
        toast.success(response.data.message);
        // Reset form data after submission
        formData.value = {
          full_name: '',
          email: '',
          phone: '',
          portfolio_url: '',
          academic_info: '',
        };
        closeformmodal();
    } catch (error) {
        console.error(error);
        toast.error('Failed to submit application. Please try again.');
    }
};

const handleBusinessClick = (category) => {
  if (!isOpen(category.opening_time, category.closing_time)) {
    showStoreClosedPopup.value = true;
    pendingBusinessId.value = category.id;
    pendingBusinessName.value = category.name;
    return;
  }

  // If store is open, navigate directly
  router.push({
    name: "CategoryPage",
    params: { id: category.id },
    query: { title: category.name },
  });
};

const handleStoreClosedConfirm = () => {
  showStoreClosedPopup.value = false;
  router.push({
    name: "CategoryPage",
    params: { id: pendingBusinessId.value },
    query: { title: pendingBusinessName.value },
  });
};

const handleStoreClosedCancel = () => {
  showStoreClosedPopup.value = false;
  pendingBusinessId.value = null;
  pendingBusinessName.value = null;
};

const scrollToShops = () => {
  if (shopsSection.value) {
    shopsSection.value.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

const handleSearch = () => {
  router.push("/home/search");
};

const isOpen = (openingTime, closingTime) => {
  const timezone = "Asia/Karachi";
  const currentTime = moment().tz(timezone);
  const parseTime = (time) => moment.tz(time, "hh:mm:ssA", timezone);

  const open = parseTime(openingTime);
  let close = parseTime(closingTime);

  if (close.isBefore(open)) {
    close.add(1, "day");
  }

  return currentTime.isAfter(open) && currentTime.isBefore(close);
};

const filteredRestaurants = computed(() => {
  if (!businessStore.businesses) return [];

  const typeFilter = selectedService.value.toLowerCase();

  // Filter by selected service type
  let filtered = businessStore.businesses;

  if (typeFilter) {
    filtered = filtered.filter(
      (business) =>
        business.type && business.type.toLowerCase().includes(typeFilter)
    );
  }

  // Apply the selected filter for "All", "opened", or "closed"
  if (selectedFilter.value === "opened") {
    filtered = filtered.filter((business) =>
      isOpen(business.opening_time, business.closing_time)
    );
  } else if (selectedFilter.value === "closed") {
    filtered = filtered.filter(
      (business) => !isOpen(business.opening_time, business.closing_time)
    );
  }

  return filtered.length ? filtered : [];
});

const filterProducts = (filter) => {
  selectedFilter.value = filter;
};

const filterByService = (service) => {
  selectedService.value = service;
  localStorage.setItem("selectedService", service);
};

async function getProfileData() {
  try {
    if (authStore.isAuthenticated) {
      const response = await axios.get(`${API_BASE_URL}/api/profile`, {});
      profile.value = response.data.data;
      name.value = response.data.data.user.name;
    }
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  const serviceFromStorage = localStorage.getItem("selectedService");
  if (serviceFromStorage) {
    selectedService.value = serviceFromStorage;
  }

  setInterval(() => {
    isLoading.value = false;
  }, 2000);

  try {
    await Promise.all([businessStore.getBusinesses(), getProfileData()]);
  } catch (error) {
    console.error("Error loading data:", error);
  }
});
</script>

<style scoped>
/* Responsive modal styles */
@media (max-width: 768px) {
  .internship-modal {
    width: 90%;
    max-height: 80vh; 
    overflow-y: auto; 
  }
}

@media (min-width: 769px) {
  .internship-modal {
    width: 50%;
    max-height: 70vh;
    overflow-y: auto; 
  }
}

/* Responsive Category Link Styles */
.category-link {
  height: 100%; /* Change from fixed height to full height */
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-link:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.category-image-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio for responsive image container */
  width: 100%;
}

.category-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Ensure content is flexible and doesn't overflow */
.category-link > div:last-child {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}

/* Improve text handling */
.category-link h1 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Make rating and status more flexible */
.category-link .rating-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-link .rating-container > * {
  margin-right: 0.25rem;
}

/* Responsive adjustments for small screens */
@media (max-width: 640px) {
  .category-link {
    height: auto; /* Allow natural height on small screens */
  }

  .category-image-container {
    padding-top: 66.66%; /* Slightly taller aspect ratio for mobile */
  }

  .category-link h1 {
    font-size: 1rem; /* Smaller font size on mobile */
    height: auto;
  }

  .category-link .rating-container {
    flex-wrap: nowrap;
    overflow-x: auto;
    max-width: 100%;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }

  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 1000px 100%;
}

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
  /* Change color as needed */
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
</style>
