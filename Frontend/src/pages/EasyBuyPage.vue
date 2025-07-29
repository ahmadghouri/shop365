<template>

    <div class=" px-5 lg:mt-4 lg:px-32">

        <!-- Category Title -->
        <div class="relative mb-6">
            <button @click="goBack" class="absolute left-0 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-[#1E293B] hover:text-gray-500 transition duration-150" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <h1 class="text-2xl font-bold text-center tracking-wide sm:text-3xl md:text-4xl lg:text-5xl text-[#1E293B]">
                EasyBuy
            </h1>
        </div>

        <!-- Admin Phone Number -->
        <div class="mb-6 text-center">
            <a
                class="inline-flex items-center justify-center px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                03278784988
            </a>
        </div>

        <!-- Search Bar -->
        <!-- <div class="mb-6" ref="searchContainer">
            <div class="relative max-w-md mx-auto">
                <input v-model="searchTerm" type="text" placeholder="Search products..."
                    class="w-full px-4 py-2 pl-10 pr-4 text-[#1E293B] bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </div> -->

        <!-- Easy Buy Items -->
        <div class="flex flex-col gap-3 md:flex-row md:gap-6 relative">

            <div v-for="item in groceryItems" :key="item.id" class="w-full mb-4 bg-white 
            rounded-xl md:rounded-2xl p-4 shadow-lg mx-auto">

                <!-- Product Header -->
                <div class="flex items-center gap-4 mb-6">
                    <div class="max-w-10 max-h-10 md:max-w-16 md:max-h-16 rounded-lg flex items-center justify-center">
                        <img src="/Groccery1.png" alt="product image" class="w-full h-full object-cover rounded-lg" />
                    </div>

                    <div class="flex justify-between items-center w-full">
                        <h2 class="text-base font-semibold md:text-2xl md:font-bold text-[#1E293B]">{{ item.title }}
                        </h2>

                        <span class="text-base font-semibold">{{ getPrice(item) }}</span>

                    </div>

                </div>

                <!-- Brand Selection -->
                <div class="ml-[52px] mb-2">
                    <div class="flex gap-2">

                        <button v-for="(weights, brand) in item.payload" :key="brand"
                            class="py-1 px-3 md:px-4 md:py-2 border border-[#ECEDEF] rounded-full text-sm md:font-medium"
                            :class="{
                                'bg-[#1E293B] text-white': selectedBrands[item.id] === brand
                            }" @click="() => {
                                selectedBrands[item.id] = brand
                                selectedSizes[item.id] = null // Reset size on brand change
                            }">
                            {{ brand }}
                        </button>
                    </div>
                </div>

                <!-- Weight Section -->
                <div class="ml-[52px] mb-3"
                    v-if="item.payload[selectedBrands[item.id]] || item.payload[defaultBrands[item.id]]">
                    <h3 class="text-xs font-semibold text-[#1E293B] mb-3">Weight</h3>
                    <div class="flex gap-2">
                        <button
                            v-for="(price, weight) in item.payload[selectedBrands[item.id] || defaultBrands[item.id]]"
                            :key="weight" :disabled="!selectedBrands[item.id]" @click="selectedSizes[item.id] = weight"
                            :class="[
                                'py-1 px-3 border border-[#ECEDEF] rounded-full text-sm font-medium',
                                selectedSizes[item.id] === weight ? 'bg-[#1E293B] text-white' : 'text-[#1E293B]'
                            ]">
                            {{ weight }}
                        </button>
                    </div>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center justify-end mb-4">
                    <div class="flex items-center gap-3">
                        <button class="w-10 h-10 rounded flex items-center justify-center bg-[#ECEDEF]">
                            <span class="text-xl font-semibold">−</span>
                        </button>
                        <span class="text-xl font-semibold text-[#1E293B] text-center">
                            00
                        </span>
                        <button class="w-10 h-10 rounded flex items-center justify-center bg-[#ECEDEF]">
                            <span class="text-xl font-semibold">+</span>
                        </button>
                    </div>
                </div>

                <!-- Add more items -->
                <div class="ml-[52px]" v-if="showMore[item.id]">
                    <!-- Brand Selection -->
                    <div class="mb-2">
                        <div class="flex gap-2">

                            <button v-for="(weights, brand) in item.payload" :key="brand"
                                class="py-1 px-3 md:px-4 md:py-2 border border-[#ECEDEF] rounded-full text-sm md:font-medium"
                                :class="{
                                    'bg-[#1E293B] text-white': selectedBrands[item.id] === brand
                                }" @click="() => {
                                    selectedBrands[item.id] = brand
                                    selectedSizes[item.id] = null // Reset size on brand change
                                }">
                                {{ brand }}
                            </button>
                        </div>
                    </div>

                    <!-- Weight Section -->
                    <div v-if="item.payload[selectedBrands[item.id]] || item.payload[defaultBrands[item.id]]"
                        class="mb-3">
                        <h3 class="text-xs font-semibold text-[#1E293B] mb-3">Weight</h3>
                        <div class="flex gap-2">
                            <button
                                v-for="(price, weight) in item.payload[selectedBrands[item.id] || defaultBrands[item.id]]"
                                :key="weight" :disabled="!selectedBrands[item.id]"
                                @click="selectedSizes[item.id] = weight" :class="[
                                    'py-1 px-3 border border-[#ECEDEF] rounded-full text-sm font-medium',
                                    selectedSizes[item.id] === weight ? 'bg-[#1E293B] text-white' : 'text-[#1E293B]'
                                ]">
                                {{ weight }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Add More Button -->
                <div class="flex justify-end">
                    <button @click="toggleMore(item.id)" class="bg-[#1E293B] text-white rounded-lg py-1 px-6 
                        font-semibold hover:bg-slate-800 transition-colors">
                        Add More
                    </button>
                </div>

            </div>

            <!-- Add to Cart -->
            <button class="bg-yellow-500 text-white fixed z-10 bottom-5 right-5 px-6 py-2.5 
                    rounded text-base font-medium flex justify-end items-center gap-3">
                <svg class="size-5 invert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z" />
                </svg>
                Add to Cart
            </button>

        </div>

    </div>

</template>


<script setup>
import axios from 'axios'
import { ref, reactive, watch } from 'vue'
import { API_BASE_URL } from '../config/api'
import { useRouter } from 'vue-router';
import { useCartStore } from '../store/cartStore';

const router = useRouter()
const cartStore = useCartStore()

const showMore = reactive({})
const selectedSizes = reactive({})
const selectedItems = ref([]);

const goBack = () => {
    router.back();
};

const groceryItems = ref({})
const selectedBrands = reactive({})
const defaultBrands = reactive({})
const payload = reactive({})

const fetchGroceryItems = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/easy-buy`)

    if (response.data) {
        groceryItems.value = response.data
        groceryItems.value.forEach(item => {
            const brands = Object.keys(item.payload)
            if (brands.length > 0) {
                defaultBrands[item.id] = brands[0]
                selectedBrands[item.id] = null
            }
        })
    } else {
        console.error('Failed to fetch grocery items')
    }
}
fetchGroceryItems()

const getPrice = (item) => {
    const brand = selectedBrands[item.id] || defaultBrands[item.id];
    const size = selectedSizes[item.id];

    if (brand && size && item.payload[brand] && item.payload[brand][size]) {
        return `Rs. ${item.payload[brand][size]}`;
    }
    return ''; // Return empty string if no selection
};

const getQuantity = (selectedItems) => {
    console.log('Selected Items:', selectedItems);
    return selectedItems.length || '00';
};

const toggleMore = (itemId) => {
    showMore[itemId] = !showMore[itemId]
}

const addSelectedItem = (itemId) => {
    const brand = selectedBrands[itemId];
    const size = selectedSizes[itemId];

    if (brand && size) {
        selectedItems.value.push({ [brand]: size });

        getSelectedPayload();
    } else {
        console.warn("Please select both brand and size");
    }
};

const getSelectedPayload = () => {
    console.log('Selected Payload:', JSON.stringify(selectedItems.value));
    return selectedItems.value;
};

watch([selectedBrands, selectedSizes], ([newBrands, newSizes]) => {
    for (const itemId in groceryItems.value) {
        const brand = selectedBrands[itemId];
        const size = selectedSizes[itemId];
        if (brand && size) {
            addSelectedItem(itemId);
        }
    }
});

</script>