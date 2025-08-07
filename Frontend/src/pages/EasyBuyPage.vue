<template>
    <div :class="{ 'blur-sm': isLoading }" class="px-5 py-16 lg:mt-4 lg:px-32">
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

        <div class="mb-6" ref="searchContainer">
            <div class="relative max-w-md mx-auto">
                <input v-model="searchQuery" type="text" placeholder="Search products..."
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

        <!-- Horizontal Scrollable Filter Section -->
        <div class="overflow-x-auto whitespace-nowrap mb-8 md:flex justify-center items-center">
            <button v-for="item in filters" :key="item.id" @click="onFilterClick(item)" :class="[
                item === selectedFilter
                    ? 'inline-block px-4 py-2 mx-2 text-sm font-medium rounded-full cursor-pointer bg-yellow-500 text-white hover:bg-yellow-700'
                    : 'inline-block px-4 py-2 mx-2 text-sm font-medium rounded-full cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]">
                {{ item }}
            </button>
        </div>

        <!-- Easy Buy Items -->
        <div class="flex flex-col gap-3 md:gap-6 relative">
            <div v-for="item in groceryItems" :key="item.id"
                class="w-full md:w-2/3 xl:w-1/2 mb-4 bg-white rounded-xl md:rounded-2xl p-4 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] mx-auto">
                <!-- Product Header -->
                <div class="flex items-center gap-2.5 mb-2.5">
                    <div class="max-w-8 md:max-w-16 max-h-8 md:max-h-16 rounded-lg flex items-center justify-center">
                        <img :src="item.image_url" alt="product image" class="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div class="flex justify-between items-center w-full">
                        <h2 class="text-base font-semibold md:text-xl md:font-bold text-[#1E293B]">{{ item.title }}</h2>
                        <span class="text-base md:text-lg font-semibold">
                            Total: <span class="text-[#F50100]">{{ getTotalItemPrice(item.id) }}RS</span>
                        </span>
                    </div>
                </div>

                <!-- Main Selection -->
                <div class="selection-section flex justify-between gap-5 md:gap-10 items-center mb-2.5 md:mb-4">
                    <!-- Brand Selection -->
                    <div class="w-full max-w-36 sm:max-w-none flex flex-col gap-1.5">
                        <label for="brand" class="text-sm md:text-lg font-semibold">Brand</label>
                        <select :id="`brand-${item.id}`" v-model="currentSelections[item.id].selectedBrand"
                            @change="onBrandChange(item.id)"
                            class="border border-[#0000001A] rounded px-3 py-1 md:py-2 text-xs md:text-base leading-4 cursor-pointer">
                            <option value="" disabled>Choose Brand</option>
                            <option v-for="brand in Object.keys(item.payload)" :key="brand" :value="brand">
                                {{ brand }}
                            </option>
                        </select>
                    </div>

                    <!-- Quantity Selection -->
                    <div class="w-full max-w-36 sm:max-w-none flex flex-col gap-1.5">
                        <label for="quantity" class="text-sm md:text-lg font-semibold">Quantity</label>
                        <select :id="`quantity-${item.id}`" v-model="currentSelections[item.id].selectedQuantity"
                            :disabled="!currentSelections[item.id].selectedBrand"
                            class="border border-[#0000001A] rounded px-3 py-1 md:py-2 text-xs md:text-base leading-4 cursor-pointer disabled:bg-gray-100">
                            <option value="" disabled>Choose quantity</option>
                            <option v-for="quantity in getAvailableQuantities(item.id)" :key="quantity"
                                :value="quantity">
                                {{ quantity }}
                            </option>
                        </select>
                    </div>
                </div>

                <!-- Quantity Controls and Add Button -->
                <div class="flex justify-between items-center mb-2.5 md:mb-4">
                    <!-- Quantity Controls -->
                    <div class="flex justify-center items-center">
                        <div class="flex items-center gap-2">
                            <button @click="decrementCurrentQuantity(item.id)"
                                :disabled="currentSelections[item.id].quantity <= 1">
                                <svg class="md:size-8" xmlns="http://www.w3.org/2000/svg" width="21" height="21"
                                    viewBox="0 0 21 21" fill="none">
                                    <rect x="0.581787" y="0.5" width="20" height="20" rx="3.70909" fill="#ECEDEF" />
                                    <line x1="6.07275" y1="11.4909" x2="14.0728" y2="11.4909" stroke="#1E293B"
                                        stroke-width="0.927273" />
                                </svg>
                            </button>

                            <span class="text-xs md:text-lg font-medium text-[#1E293B] text-center min-w-[20px]">
                                {{ String(currentSelections[item.id].quantity).padStart(2, "0") }}
                            </span>

                            <button @click="incrementCurrentQuantity(item.id)">
                                <svg class="md:size-8" xmlns="http://www.w3.org/2000/svg" width="21" height="21"
                                    viewBox="0 0 21 21" fill="none">
                                    <rect x="0.418213" y="0.5" width="20" height="20" rx="3.70909" fill="#ECEDEF" />
                                    <line x1="7.07275" y1="11.4909" x2="15.0728" y2="11.4909" stroke="#1E293B"
                                        stroke-width="0.927273" />
                                    <line x1="11.6091" y1="15.9545" x2="11.6091" y2="7.95453" stroke="#1E293B"
                                        stroke-width="0.927273" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Add Button -->
                    <div class="flex justify-center items-center">
                        <button @click="addItemToList(item.id)" :disabled="!canAddItem(item.id)"
                            class="hover:bg-[#1E293B] hover:text-white border border-[#1E293B] rounded-[20px] px-4 py-1 disabled:opacity-50 disabled:cursor-not-allowed">
                            Add
                        </button>
                    </div>
                </div>

                <!-- Total Items List -->
                <div v-if="itemLists[item.id] && itemLists[item.id].length > 0">
                    <div class="text-sm md:text-lg font-semibold mb-2.5">Total Items</div>
                    <ul class="list-none flex flex-col gap-2.5 text-xs md:text-base text-[#8F9BA7]">
                        <li v-for="(listItem, index) in itemLists[item.id]" :key="index"
                            class="flex justify-between items-center">
                            <!-- Left: Item Name + Quantity -->
                            <div class="flex gap-3">
                                <span>{{ listItem.brand }} {{ listItem.quantity_type }}</span>
                                <span>X{{ listItem.quantity }}</span>
                            </div>

                            <!-- Right: Price + Delete Icon -->
                            <div class="flex items-center gap-3">
                                <span>PKR {{ parseFloat(listItem.totalPrice) || 0 }}</span>
                                <button @click="removeItemFromList(item.id, index)">
                                    <svg class="size-5" xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                        viewBox="0 0 12 12" fill="none">
                                        <path
                                            d="M6.70497 6.50002L8.85497 4.17627C8.94912 4.07427 9.00202 3.93593 9.00202 3.79169C9.00202 3.64744 8.94912 3.5091 8.85497 3.4071C8.76082 3.3051 8.63312 3.2478 8.49997 3.2478C8.36682 3.2478 8.23912 3.3051 8.14497 3.4071L5.99997 5.73627L3.85497 3.4071C3.76082 3.3051 3.63312 3.2478 3.49997 3.2478C3.36682 3.2478 3.23912 3.3051 3.14497 3.4071C3.05082 3.5091 2.99792 3.64744 2.99792 3.79169C2.99792 3.93593 3.05082 4.07427 3.14497 4.17627L5.29497 6.50002L3.14497 8.82377C3.09811 8.87412 3.06091 8.93403 3.03552 9.00004C3.01014 9.06605 2.99707 9.13685 2.99707 9.20835C2.99707 9.27986 3.01014 9.35066 3.03552 9.41666C3.06091 9.48267 3.09811 9.54258 3.14497 9.59294C3.19145 9.6437 3.24675 9.684 3.30768 9.7115C3.36861 9.739 3.43396 9.75316 3.49997 9.75316C3.56598 9.75316 3.63133 9.739 3.69226 9.7115C3.75319 9.684 3.80849 9.6437 3.85497 9.59294L5.99997 7.26377L8.14497 9.59294C3.19145 9.6437 8.24675 9.684 8.30768 9.7115C8.36861 9.739 8.43396 9.75316 8.49997 9.75316C8.56598 9.75316 8.63133 9.739 8.69226 9.7115C8.75319 9.684 8.80849 9.6437 8.85497 9.59294C8.90183 9.54258 8.93903 9.48267 8.96442 9.41666C8.9898 9.35066 9.00287 9.27986 9.00287 9.20835C9.00287 9.13685 8.9898 9.06605 8.96442 9.00004C8.93903 8.93403 8.90183 8.87412 8.85497 8.82377L6.70497 6.50002Z"
                                            fill="#F50100" />
                                    </svg>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>

                <!-- Add to Cart Button -->
                <div class="flex justify-center items-center mx-auto mt-6">
                    <button @click="addToCart(item.id)"
                        :disabled="!itemLists[item.id] || itemLists[item.id].length === 0"
                        class="bg-[#1E293B] text-white text-sm md:text-lg font-medium rounded-[20px] px-4 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- No Products Found Message -->
    <div v-if="groceryItems.length === 0 && !isLoading" class="text-center py-10">
        <p class="text-xl text-gray-600">No products found.</p>
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
import axios from "axios";
import { ref, reactive, onMounted, computed, watch } from "vue";
import { API_BASE_URL } from "../config/api";
import { useRouter } from "vue-router";
import { useCartStore } from "../store/cartStore";
import { toast } from "vue3-toastify";

const router = useRouter();
const cartStore = useCartStore();

const isLoading = ref(false);
const allGroceryItems = ref([]);
const groceryItems = ref([]);
const filters = computed(() => {
    return ["All", ...new Set(allGroceryItems.value.map((item) => item.title))];
});
const selectedFilter = ref("All");
const searchQuery = ref("");
const debouncedSearch = ref("");
let searchTimeout = null;
// Store current selections for each item (for the dropdowns and quantity controls)
const currentSelections = reactive({});

// Store the list of added items for each product
const itemLists = reactive({});

const goBack = () => {
    router.back();
};

const fetchGroceryItems = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get(`${API_BASE_URL}/api/easy-buy`);
        if (response.data) {
            allGroceryItems.value = response.data;
            groceryItems.value = response.data;
            // Initialize selections for each item
            groceryItems.value.forEach((item) => {
                initializeItemSelections(item.id);
            });
        }
    } catch (error) {
        console.error("Failed to fetch grocery items:", error);
    } finally {
        isLoading.value = false;
    }
};

const onFilterClick = (filter) => {
    selectedFilter.value = filter;
};

const filterProducts = () => {
    let filtered = allGroceryItems.value;

    // Apply filter
    if (selectedFilter.value !== "All") {
        isLoading.value = true;
        filtered = filtered.filter((item) => item.title === selectedFilter.value);
        isLoading.value = false;
    }

    // Apply search
    if (debouncedSearch.value.trim() !== "") {
        isLoading.value = true;
        selectedFilter.value = "All"; // Reset filter when searching
        const searchLower = debouncedSearch.value.toLowerCase();
        filtered = filtered.filter(
            (item) => item.title.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower)
        );
        isLoading.value = false;
    }

    groceryItems.value = filtered;
};

const initializeItemSelections = (itemId) => {
    if (!currentSelections[itemId]) {
        currentSelections[itemId] = {
            selectedBrand: "",
            selectedQuantity: "",
            quantity: 1,
        };
    }
    if (!itemLists[itemId]) {
        itemLists[itemId] = [];
    }
};

const onBrandChange = (itemId) => {
    // Reset quantity selection when brand changes
    currentSelections[itemId].selectedQuantity = "";
    currentSelections[itemId].quantity = 1;
};

const getAvailableQuantities = (itemId) => {
    const selectedBrand = currentSelections[itemId]?.selectedBrand;
    if (!selectedBrand) return [];

    const item = groceryItems.value.find((item) => item.id === itemId);
    if (!item || !item.payload[selectedBrand]) return [];

    return Object.keys(item.payload[selectedBrand]);
};

const incrementCurrentQuantity = (itemId) => {
    currentSelections[itemId].quantity++;
};

const decrementCurrentQuantity = (itemId) => {
    if (currentSelections[itemId].quantity > 1) {
        currentSelections[itemId].quantity--;
    }
};

const canAddItem = (itemId) => {
    const selection = currentSelections[itemId];
    return selection.selectedBrand && selection.selectedQuantity && selection.quantity > 0;
};

const addItemToList = (itemId) => {
    if (!canAddItem(itemId)) return;

    const selection = currentSelections[itemId];
    const item = groceryItems.value.find((item) => item.id === itemId);

    if (!item) return;

    const unitPrice = parseFloat(item.payload[selection.selectedBrand][selection.selectedQuantity]) || 0;

    console.log("Adding item:", {
        brand: selection.selectedBrand,
        quantity_type: selection.selectedQuantity,
        unitPrice: unitPrice,
        rawPrice: item.payload[selection.selectedBrand][selection.selectedQuantity],
    });

    // Add each quantity as separate items (as requested)
    for (let i = 0; i < selection.quantity; i++) {
        const listItem = {
            brand: selection.selectedBrand,
            quantity_type: selection.selectedQuantity,
            quantity: 1, // Each item has quantity 1
            unitPrice: unitPrice,
            totalPrice: unitPrice, // Since quantity is 1, totalPrice = unitPrice
            itemId: itemId,
            title: item.title,
        };
        itemLists[itemId].push(listItem);
    }

    // Reset current selections
    currentSelections[itemId] = {
        selectedBrand: "",
        selectedQuantity: "",
        quantity: 1,
    };
};

const removeItemFromList = (itemId, index) => {
    itemLists[itemId].splice(index, 1);
};

const getTotalItemPrice = (itemId) => {
    if (!itemLists[itemId] || itemLists[itemId].length === 0) return 0;

    let total = 0;
    itemLists[itemId].forEach((item) => {
        const price = parseFloat(item.totalPrice) || 0;
        total += price;
    });

    console.log(`Total for item ${itemId}:`, total, "Items:", itemLists[itemId]);
    return total;
};

const addToCart = async (itemId) => {
    const items = itemLists[itemId];
    if (!items || items.length === 0) {
        toast.error("No items to add to cart");
        return;
    }

    try {
        isLoading.value = true;

        // Prepare the payload
        const cartItems = items.map((item, index) => ({
            id: `${itemId}-${index}`,
            itemId: itemId,
            title: item.title,
            name: `${item.brand} ${item.quantity_type}`,
            weight: item.quantity_type,
            quantity: item.quantity,
            price: item.unitPrice,
            totalPrice: item.totalPrice,
        }));

        console.log("Adding to cart:", cartItems);

        // API call to search matching regular products
        const response = await axios.post(`${API_BASE_URL}/api/resolve-product`, {
            items: cartItems,
        });

        const matchedProducts = response.data?.regularProducts || [];
        console.log("✅ Matched Products:", matchedProducts);

        // Batch add all products to cart using Promise.all
        const cartPromises = matchedProducts.map((product) => {
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
            return cartStore.addToCart(cartItem);
        });

        // Execute all cart additions in parallel
        await Promise.all(cartPromises);

        // Clear the item list after successful addition to cart
        // itemLists[itemId] = []
    } catch (error) {
        console.error("Failed to add EasyBuy items:", error);
        toast.error("Failed to add items to cart");
    } finally {
        isLoading.value = false;
    }
};

watch(searchQuery, (newVal) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        debouncedSearch.value = newVal;
    }, 300); // 300ms debounce delay
});

watch([debouncedSearch, selectedFilter], () => {
    filterProducts();
});

// Initialize on component mount
onMounted(() => {
    fetchGroceryItems();
});
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
