<template>

    <div class="mobile-spacing lg:mt-4 lg:px-32">

        <!-- Category Title -->
        <div class="relative mb-6">
            <button @click="goBack" class="absolute left-0 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-gray-800 hover:text-gray-500 transition duration-150" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <h1 class="text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800">
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
        <div class="mb-6" ref="searchContainer">
            <div class="relative max-w-md mx-auto">
                <input v-model="searchTerm" type="text" placeholder="Search products..."
                    class="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>

        

        <div v-for="item in groceryItems" :key="item.id" class="max-w-lg mb-4 bg-white 
            rounded-2xl p-6 shadow-lg mx-auto">

                <!-- Product Header -->
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-16 h-16 rounded-lg flex items-center justify-center">
                        <img src="/Groccery1.png" alt="">
                    </div>

                    <h2 class="text-2xl font-bold text-gray-800">{{ item.title }}</h2>
                </div>

                <!-- Brand Selection -->
                <div class="mb-6">
                    <div class="flex gap-2">

                        <button v-for="(weights, brand) in item.payload" :key="brand"
                            class="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
                            :class="{ 'bg-slate-700 text-white': selectedBrands[item.id] === brand }"
                            @click="selectBrand(item.id, brand)">
                            {{ brand }}
                        </button>
                    </div>
                </div>

                <!-- Weight Section -->
                <div v-if="selectedBrands[item.id]" class="mb-6">

                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Weight</h3>
                    <div class="flex gap-2">
                        <button v-for="(price, weight) in item.payload[selectedBrands[item.id]]" :key="weight"
                            class="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                            {{ weight }}
                        </button>
                    </div>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center justify-end mb-6">
                    <div class="flex items-center gap-3">
                        <button
                            class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span class="text-xl font-semibold">−</span>
                        </button>
                        <span class="text-xl font-semibold text-gray-800 text-center">00</span>
                        <button
                            class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span class="text-xl font-semibold">+</span>
                        </button>
                    </div>
                </div>

                <!-- Add More Button -->
                <div class="flex justify-end">
                    <button class=" bg-slate-700 text-white rounded-lg py-1 px-6 font-semibold 
                hover:bg-slate-800 transition-colors">
                        Add More
                    </button>
                </div>
        </div>

    </div>

</template>


<script setup>
import axios from 'axios'
import { ref, reactive } from 'vue'
import { API_BASE_URL } from '../config/api'

const groceryItems = ref([])
const selectedBrands = reactive({})

const fetchGroceryItems = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/easy-buy`)

    if (response.data) {
        groceryItems.value = response.data
        groceryItems.value.forEach(item => {
            const brands = Object.keys(item.payload)
            if (brands.length > 0) {
                selectedBrands[item.id] = brands[0]
            }
        })
    } else {
        console.error('Failed to fetch grocery items')
    }
}

const selectBrand = (itemId, brand) => {
    selectedBrands[itemId] = brand
}

fetchGroceryItems()

</script>