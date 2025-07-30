<template>

    <div :class="{ 'blur-sm': isLoading }" class="px-5 lg:mt-4 lg:px-32">

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

        <!-- Easy Buy Items -->
        <div class="flex flex-col gap-3 md:flex-row md:gap-6 relative">

            <div v-for="item in groceryItems" :key="item.id"
                class="w-full mb-4 bg-white rounded-xl md:rounded-2xl p-4 shadow-lg mx-auto">

                <!-- Product Header -->
                <div class="flex items-center gap-4 mb-6">
                    <div class="max-w-10 max-h-10 md:max-w-16 md:max-h-16 rounded-lg flex items-center justify-center">
                        <img src="/Groccery1.png" alt="product image" class="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div class="flex justify-between items-center w-full">
                        <h2 class="text-base font-semibold md:text-2xl md:font-bold text-[#1E293B]">{{ item.title }}
                        </h2>
                        <span class="text-base font-semibold">Rs. {{ getBasePrice(item) || '0' }}</span>
                    </div>
                </div>

                <!-- Main Selection (Always Visible) -->
                <div class="selection-section mb-4">

                    <!-- Brand Selection -->
                    <div class="ml-[52px] mb-2">
                        <div class="flex gap-2 flex-wrap">
                            <button v-for="(weights, brand) in item.payload" :key="brand"
                                class="py-1 px-3 md:px-4 md:py-2 border border-[#ECEDEF] rounded-full text-sm md:font-medium"
                                :class="{
                                    'bg-[#1E293B] text-white': getSelectedBrand(item.id, 0) === brand
                                }" @click="selectBrand(item.id, 0, brand)">
                                {{ brand }}
                            </button>
                        </div>
                    </div>

                    <!-- Weight Section -->
                    <div class="ml-[52px] mb-3" v-if="getSelectedBrand(item.id, 0)">
                        <h3 class="text-xs text-[#1E293B] mb-3">Weight</h3>
                        <div class="flex gap-2 flex-wrap">
                            <button v-for="(price, weight) in item.payload[getSelectedBrand(item.id, 0)]" :key="weight"
                                @click="selectWeight(item.id, 0, weight)" :class="[
                                    'py-1 px-3 border border-[#ECEDEF] rounded-full text-sm font-medium',
                                    getSelectedWeight(item.id, 0) === weight ? 'bg-[#1E293B] text-white' : 'text-[#1E293B]'
                                ]">
                                {{ weight }}
                            </button>
                        </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center justify-end mb-4">
                        <div class="flex items-center gap-2">
                            <button @click="decrementQuantity(item.id, 0)"
                                class="w-10 h-10 rounded flex items-center justify-center bg-[#ECEDEF] hover:bg-gray-300 transition-colors">
                                <span class="text-xl font-semibold">−</span>
                            </button>

                            <span class="text-xl font-semibold text-[#1E293B] text-center">
                                {{ getQuantity(item.id, 0) }}
                            </span>

                            <button @click="incrementQuantity(item.id, 0)"
                                class="w-10 h-10 rounded flex items-center justify-center bg-[#ECEDEF] hover:bg-gray-300 transition-colors">
                                <span class="text-xl font-semibold">+</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Additional Selection Sections (Expandable) -->
                <div v-for="(section, index) in getAdditionalSections(item.id)" :key="`${item.id}-${index + 1}`"
                    class="selection-section mb-4 border-t pt-4">

                    <div class="flex justify-between items-start">

                        <!-- Brand Selection for Additional Section -->
                        <div class="ml-[52px] mb-2">
                            <div class="flex gap-2 flex-wrap">
                                <button v-for="(weights, brand) in item.payload" :key="brand"
                                    class="py-1 px-3 md:px-4 md:py-2 border border-[#ECEDEF] rounded-full text-sm md:font-medium"
                                    :class="{
                                        'bg-[#1E293B] text-white': getSelectedBrand(item.id, index + 1) === brand
                                    }" @click="selectBrand(item.id, index + 1, brand)">
                                    {{ brand }}
                                </button>
                            </div>
                        </div>

                        <span class="text-base font-semibold whitespace-nowrap">
                            Rs. {{ getSelectedPrice(item.id, index + 1) || '0' }}
                        </span>

                    </div>

                    <!-- Weight Section for Additional Section -->
                    <div class="ml-[52px] mb-3" v-if="getSelectedBrand(item.id, index + 1)">
                        <h3 class="text-xs text-[#1E293B] mb-3">Weight</h3>
                        <div class="flex gap-2 flex-wrap">
                            <button v-for="(price, weight) in item.payload[getSelectedBrand(item.id, index + 1)]"
                                :key="weight" @click="selectWeight(item.id, index + 1, weight)" :class="[
                                    'py-1 px-3 border border-[#ECEDEF] rounded-full text-sm font-medium',
                                    getSelectedWeight(item.id, index + 1) === weight ? 'bg-[#1E293B] text-white' : 'text-[#1E293B]'
                                ]">
                                {{ weight }}
                            </button>
                        </div>
                    </div>

                    <!-- Quantity Controls for Additional Section -->
                    <div class="flex items-center justify-end mb-4">
                        <div class="flex items-center gap-3">
                            <button @click="decrementQuantity(item.id, index + 1)"
                                class="w-10 h-10 rounded flex items-center justify-center bg-[#ECEDEF] hover:bg-gray-300 transition-colors">
                                <span class="text-xl font-semibold">−</span>
                            </button>

                            <span class="text-xl font-semibold text-[#1E293B] text-center min-w-[3ch]">
                                {{ getQuantity(item.id, index + 1) }}
                            </span>

                            <button @click="incrementQuantity(item.id, index + 1)"
                                class="w-10 h-10 rounded flex items-center justify-center bg-[#ECEDEF] hover:bg-gray-300 transition-colors">
                                <span class="text-xl font-semibold">+</span>
                            </button>
                        </div>
                    </div>

                    <!-- Remove Section Button -->
                    <div class="flex justify-end mb-2">
                        <button @click="removeSection(item.id, index + 1)"
                            class="text-red-500 text-sm hover:text-red-700 transition-colors">
                            Remove
                        </button>
                    </div>
                </div>

                <!-- Add More Button -->
                <div class="flex justify-end">
                    <button @click="addMoreSection(item.id)"
                        class="bg-[#1E293B] text-white rounded-lg py-1 px-6 font-semibold">
                        Add More
                    </button>
                </div>

                <!-- Total for this item -->
                <div class="flex justify-between items-center mt-4 pt-4 border-t font-semibold">
                    <span>Total Items: {{ getTotalItemQuantity(item.id) }}</span>
                    <span>Total Price: Rs. {{ getTotalItemPrice(item.id) }}</span>
                </div>

            </div>

            <!-- Add to Cart -->
            <button @click="addAllToCart"
                class="bg-yellow-500 text-white fixed z-10 bottom-5 right-5 px-6 py-2.5 rounded text-base font-medium flex justify-end items-center gap-3 hover:bg-yellow-600 transition-colors">
                <svg class="size-5 invert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M24 48C10.7 48 0 58.7 0 72C0 85.3 10.7 96 24 96L69.3 96C73.2 96 76.5 98.8 77.2 102.6L129.3 388.9C135.5 423.1 165.3 448 200.1 448L456 448C469.3 448 480 437.3 480 424C480 410.7 469.3 400 456 400L200.1 400C188.5 400 178.6 391.7 176.5 380.3L171.4 352L475 352C505.8 352 532.2 330.1 537.9 299.8L568.9 133.9C572.6 114.2 557.5 96 537.4 96L124.7 96L124.3 94C119.5 67.4 96.3 48 69.2 48L24 48zM208 576C234.5 576 256 554.5 256 528C256 501.5 234.5 480 208 480C181.5 480 160 501.5 160 528C160 554.5 181.5 576 208 576zM432 576C458.5 576 480 554.5 480 528C480 501.5 458.5 480 432 480C405.5 480 384 501.5 384 528C384 554.5 405.5 576 432 576z" />
                </svg>
                Add to Cart ({{ getTotalCartQuantity() }})
            </button>

        </div>

    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex justify-center items-center">
        <div class="loader">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>

</template>

<script setup>
import axios from 'axios'
import { ref, reactive, onMounted } from 'vue'
import { API_BASE_URL } from '../config/api'
import { useRouter } from 'vue-router'
import { useCartStore } from '../store/cartStore'
import { toast } from 'vue3-toastify'

const router = useRouter()
const cartStore = useCartStore()

const isLoading = ref(false)
const groceryItems = ref([])

// Store selections for each item and each section
// Structure: { itemId: { sectionIndex: { brand: 'brandName', weight: 'weightValue', quantity: number } } }
const itemSelections = reactive({})

// Store additional sections count for each item
const additionalSections = reactive({})

const goBack = () => {
    router.back()
}

const fetchGroceryItems = async () => {
    try {
        isLoading.value = true

        const response = await axios.get(`${API_BASE_URL}/api/easy-buy`)
        if (response.data) {
            groceryItems.value = response.data
            // Initialize selections for each item
            groceryItems.value.forEach(item => {
                initializeItemSelections(item.id)
            })
        }
    } catch (error) {
        console.error('Failed to fetch grocery items:', error)
    } finally {
        isLoading.value = false
    }
}

const initializeItemSelections = (itemId) => {
    if (!itemSelections[itemId]) {
        itemSelections[itemId] = {
            0: { brand: null, weight: null, quantity: 0 } // Section 0 is the main section
        }
    }
    if (!additionalSections[itemId]) {
        additionalSections[itemId] = 0
    }
}

const addMoreSection = (itemId) => {
    additionalSections[itemId]++
    const newSectionIndex = additionalSections[itemId]

    if (!itemSelections[itemId]) {
        itemSelections[itemId] = {}
    }

    itemSelections[itemId][newSectionIndex] = {
        brand: null,
        weight: null,
        quantity: 0
    }
}

const removeSection = (itemId, sectionIndex) => {
    if (itemSelections[itemId] && itemSelections[itemId][sectionIndex]) {
        delete itemSelections[itemId][sectionIndex]
        additionalSections[itemId]--

        // Reorganize section indices to maintain continuity
        const sections = Object.keys(itemSelections[itemId])
            .map(Number)
            .filter(index => index > 0)
            .sort((a, b) => a - b)

        const newSelections = { 0: itemSelections[itemId][0] } // Keep main section
        sections.forEach((oldIndex, newIndex) => {
            if (oldIndex !== sectionIndex) {
                const actualNewIndex = newIndex + 1 - (oldIndex > sectionIndex ? 1 : 0)
                newSelections[actualNewIndex] = itemSelections[itemId][oldIndex]
            }
        })

        itemSelections[itemId] = newSelections
        additionalSections[itemId] = Math.max(0, additionalSections[itemId])
    }
}

const getAdditionalSections = (itemId) => {
    return Array.from({ length: additionalSections[itemId] || 0 }, (_, i) => i)
}

const selectBrand = (itemId, sectionIndex, brand) => {
    if (!itemSelections[itemId]) {
        initializeItemSelections(itemId)
    }
    if (!itemSelections[itemId][sectionIndex]) {
        itemSelections[itemId][sectionIndex] = { brand: null, weight: null, quantity: 0 }
    }

    itemSelections[itemId][sectionIndex].brand = brand
    itemSelections[itemId][sectionIndex].weight = null // Reset weight when brand changes
}

const selectWeight = (itemId, sectionIndex, weight) => {
    if (!itemSelections[itemId] || !itemSelections[itemId][sectionIndex]) return

    itemSelections[itemId][sectionIndex].weight = weight

    const section = itemSelections[itemId][sectionIndex]
    if (section.brand && section.weight && section.quantity === 0) {
        section.quantity = 1
    }
}

const getSelectedBrand = (itemId, sectionIndex) => {
    return itemSelections[itemId]?.[sectionIndex]?.brand || null
}

const getSelectedWeight = (itemId, sectionIndex) => {
    return itemSelections[itemId]?.[sectionIndex]?.weight || null
}

const incrementQuantity = (itemId, sectionIndex) => {
    if (!itemSelections[itemId] || !itemSelections[itemId][sectionIndex]) return

    const section = itemSelections[itemId][sectionIndex]
    if (section.brand && section.weight) {
        section.quantity++
    }
}

const decrementQuantity = (itemId, sectionIndex) => {
    if (!itemSelections[itemId] || !itemSelections[itemId][sectionIndex]) return

    const section = itemSelections[itemId][sectionIndex]
    if (section.quantity > 0) {
        section.quantity--
    }
}

const getQuantity = (itemId, sectionIndex) => {
    const quantity = itemSelections[itemId]?.[sectionIndex]?.quantity || 0
    return quantity.toString().padStart(2, '0')
}

const getBasePrice = (item) => {
    const section = itemSelections[item.id]?.[0]
    if (section?.brand && section?.weight) {
        const price = item.payload?.[section.brand]?.[section.weight]
        if (price !== undefined) {
            return price
        }
    }
}

const getSelectedPrice = (itemId, sectionIndex) => {
    const section = itemSelections[itemId]?.[sectionIndex]
    if (!section || !section.brand || !section.weight) return 0

    const item = groceryItems.value.find(i => i.id === itemId)
    if (!item) return 0

    return item.payload[section.brand]?.[section.weight] || 0
}


const getSectionPrice = (itemId, sectionIndex) => {
    const section = itemSelections[itemId]?.[sectionIndex]
    if (!section || !section.brand || !section.weight) return 0

    const item = groceryItems.value.find(item => item.id === itemId)
    if (!item) return 0

    const price = item.payload[section.brand]?.[section.weight] || 0
    return price * section.quantity
}

const getTotalItemQuantity = (itemId) => {
    if (!itemSelections[itemId]) return 0

    return Object.values(itemSelections[itemId])
        .reduce((total, section) => total + (section.quantity || 0), 0)
}

const getTotalItemPrice = (itemId) => {
    if (!itemSelections[itemId]) return 0

    return Object.keys(itemSelections[itemId])
        .reduce((total, sectionIndex) => total + getSectionPrice(itemId, parseInt(sectionIndex)), 0)
}

const getTotalCartQuantity = () => {
    return Object.keys(itemSelections)
        .reduce((total, itemId) => total + getTotalItemQuantity(itemId), 0)
}

// Add all selected items to cart
const addAllToCart = async () => {
    const cartItems = []

    Object.keys(itemSelections).forEach(itemId => {
        const item = groceryItems.value.find(item => item.id == itemId)
        if (!item) return

        Object.keys(itemSelections[itemId]).forEach(sectionIndex => {
            const section = itemSelections[itemId][sectionIndex]
            if (section.brand && section.weight && section.quantity > 0) {
                cartItems.push({
                    id: `${itemId}-${sectionIndex}`,
                    itemId: itemId,
                    title: item.title,
                    name: `${section.brand} ${section.weight}`,
                    weight: section.weight,
                    quantity: section.quantity,
                    price: item.payload[section.brand][section.weight],
                    totalPrice: item.payload[section.brand][section.weight] * section.quantity
                })
            }
        })
    })

    console.log(cartItems);

    if (cartItems.length === 0) {
        toast.error("Please select items before adding to cart");
        return;
    }

    try {
        isLoading.value = true;

        // API call to search matching regular products
        const response = await axios.post(`${API_BASE_URL}/api/search-regular-products`, {
            items: cartItems
        });

        const matchedProducts = response.data?.regularProducts || [];

        console.log("✅ Matched Products:", matchedProducts);

        // Add matched products to cart
        for (const product of matchedProducts) {
            const cartItem = {
                product_id: product.id,
                quantity: 1,
                product: {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    final_price: product.final_price,
                    image_url: product.image_url,
                    business_id: product.business_id,
                },
            };

            await cartStore.addToCart(cartItem);
        };
        
    } catch (error) {
        console.error("Failed to add EasyBuy items:", error);
        toast.error("Failed to add EasyBuy items to cart.");
    } finally {
        isLoading.value = false;
    }
}

// Initialize on component mount
onMounted(() => {
    fetchGroceryItems()
})
</script>

<style scoped>
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
</style>