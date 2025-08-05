<template>
    <div class="container mx-auto mobile-spacing">

        <div class="flex justify-between items-center">
            <h1 class="text-xl font-semibold mb-4">EasyBuy Product List</h1>
            <router-link class="bg-blue-500 px-5 py-1 mb-4 text-white rounded-md" to="/admin/store-easybuy-product">
                ADD
            </router-link>
        </div>

        <!-- Update Form -->
        <div v-if="selectedProduct" class="bg-white shadow rounded-lg p-5 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-medium text-gray-900">
                    Update Easy Buy Product
                </h2>
                <button @click="cancelUpdate" class="text-red-500 hover:text-red-700">
                    ✕ Cancel
                </button>
            </div>

            <!-- Product Title & Image -->
            <div class="mb-6 flex justify-between items-center gap-4">
                <!-- Title -->
                <div class="w-full">
                    <label for="title" class="text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" v-model="title" placeholder="Enter title"
                        class="block w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500 text-sm"
                        required />
                </div>

                <!-- Image Upload -->
                <div>
                    <label for="image" class="text-sm font-medium text-gray-700">Image (Max 15KB)</label>
                    <input required type="file" id="image" @change="handleFileUpload"
                        class="block text-sm border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500" />
                    <p v-if="imageError" class="text-red-500 text-xs mt-1">
                        {{ imageError }}
                    </p>
                </div>
            </div>

            <!-- Brands Section -->
            <div v-for="(brand, brandIndex) in brands" :key="brandIndex" class="mb-6 border p-4 rounded-lg">
                <!-- Brand Name -->
                <div class="mb-3">
                    <label :for="`brand-name-${brandIndex}`" class="text-sm font-medium text-gray-700">Brand
                        Name</label>
                    <div class="flex items-center space-x-2 mt-1">
                        <input :id="`brand-name-${brandIndex}`" v-model="brand.name" placeholder="Brand Name"
                            class="flex-1 border rounded px-2 py-1" />
                        <button @click="removeBrand(brandIndex)"
                            class="text-red-500 hover:text-red-700 px-2 py-1 border border-red-300 rounded"
                            v-if="brands.length > 1">
                            Delete
                        </button>
                    </div>
                </div>

                <!-- Variants -->
                <div v-for="(variant, varIndex) in brand.variants" :key="varIndex" class="mb-2">
                    <div class="grid grid-cols-2 gap-2 items-center">
                        <!-- Weight -->
                        <div>
                            <label :for="`weight-${brandIndex}-${varIndex}`"
                                class="text-sm font-medium text-gray-700">Weight</label>
                            <input :id="`weight-${brandIndex}-${varIndex}`" v-model="variant.weight"
                                placeholder="e.g. 1-Kg" class="w-full border rounded px-2 py-1 mt-1" />
                        </div>
                        <!-- Price -->
                        <div>
                            <label :for="`price-${brandIndex}-${varIndex}`"
                                class="text-sm font-medium text-gray-700">Price</label>
                            <div class="flex items-center space-x-2 mt-1">
                                <input :id="`price-${brandIndex}-${varIndex}`" v-model.number="variant.price"
                                    type="number" placeholder="e.g. 500" class="w-full border rounded px-2 py-1" />
                                <button @click="removeVariant(brandIndex, varIndex)"
                                    class="text-red-500 hover:text-red-700 px-2 py-1" v-if="brand.variants.length > 1">
                                    X
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Variant Button -->
                <button @click="addVariant(brandIndex)" class="text-blue-500 text-sm mt-2">+ Add Variant</button>
            </div>

            <!-- Add Brand Button -->
            <div class="mb-4">
                <button @click="addBrand" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                    + Add Brand
                </button>
            </div>

            <!-- Submit Button -->
            <div class="text-right">
                <button @click="submitProduct" :disabled="isSubmitting" class="w-full bg-blue-500 text-white text-sm font-medium py-2 rounded focus:outline-none 
                        focus:ring-2 focus:ring-blue-300 hover:bg-blue-600 transition disabled:opacity-50">
                    {{ isSubmitting ? 'Updating...' : 'Update EasyBuy Product' }}
                </button>
            </div>
        </div>

        <!-- Product List -->
        <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="product in easyBuyProducts" :key="product.id"
                    class="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between">

                    <div class="p-4 flex-grow">
                        <div class="flex items-start justify-between">
                            <div>
                                <h2 class="text-xl font-semibold">{{ product.title }}</h2>
                                <img :src="product.image_url" alt="Product Image"
                                    class="mt-2 h-20 w-20 object-cover rounded" />
                            </div>
                        </div>

                        <div class="mt-4">
                            <h3 class="font-semibold text-sm mb-1">Variants</h3>
                            <div v-for="(weights, brand) in product.payload" :key="brand" class="mb-2">
                                <div class="font-semibold">{{ brand }}:</div>
                                <ul class="pl-4 list-disc text-sm text-gray-600">
                                    <li v-for="(price, weight) in weights" :key="weight">
                                        {{ weight }} – Rs. {{ price }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 flex justify-between items-center gap-4">
                        <button @click="openFormForUpdate(product)"
                            class="bg-yellow-500 text-white w-full font-bold rounded-lg px-4 py-2 hover:bg-yellow-600 transition duration-150 ease-in-out">
                            Update
                        </button>
                        <button @click="handleDelete(product)"
                            class="border border-yellow-500 text-yellow-500 w-full font-bold rounded-lg px-4 py-2 hover:bg-yellow-600 hover:text-white transition duration-150 ease-in-out">
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="text-center py-4">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue'
import { API_BASE_URL } from '../../config/api';
import { toast } from 'vue3-toastify';

const isLoading = ref(false);
const isSubmitting = ref(false);
const easyBuyProducts = ref([]);
const selectedProduct = ref(null);
const title = ref('');
let image = ref(null);
const imageError = ref("");
const brands = ref([
    {
        name: '',
        variants: [
            { weight: '', price: null }
        ]
    }
]);

onMounted(async () => {
    await fetchProducts();
});

const fetchProducts = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get(`${API_BASE_URL}/api/easy-buy`);
        easyBuyProducts.value = response.data;
    } catch (error) {
        console.error("Error loading easybuy products:", error);
        toast.error("Failed to load easybuy products");
    } finally {
        isLoading.value = false;
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.size > 15 * 1024) {
        imageError.value = "Image size must be less than 15KB.";
        image.value = null;
    } else {
        imageError.value = "";
        image.value = file;
    }
};

const addBrand = () => {
    brands.value.push({
        name: '',
        variants: [{ weight: '', price: null }]
    });
};

const removeBrand = (index) => {
    if (brands.value.length > 1) {
        brands.value.splice(index, 1);
    }
};

const addVariant = (brandIndex) => {
    brands.value[brandIndex].variants.push({ weight: '', price: null });
};

const removeVariant = (brandIndex, varIndex) => {
    if (brands.value[brandIndex].variants.length > 1) {
        brands.value[brandIndex].variants.splice(varIndex, 1);
    }
};

const openFormForUpdate = async (product) => {
    try {
        isLoading.value = true;

        selectedProduct.value = product;

        // Set title
        title.value = product.title;

        // Reset image
        image.value = null;
        imageError.value = "";

        // Transform payload to brands array (same as your store component structure)
        brands.value = transformPayloadForEdit(product.payload);

    } catch (error) {
        console.error("Error setting up update form:", error);
        toast.error("Failed to setup update form");
    } finally {
        isLoading.value = false;
    }
};

const transformPayloadForEdit = (payloadObj) => {
    return Object.entries(payloadObj).map(([brand, weights]) => ({
        name: brand,
        variants: Object.entries(weights).map(([weight, price]) => ({
            weight,
            price: parseFloat(price)
        }))
    }));
};

const resetForm = () => {
    title.value = '';
    image.value = null;
    imageError.value = '';
    brands.value = [
        {
            name: '',
            variants: [
                { weight: '', price: null }
            ]
        }
    ];

    // Reset file input manually
    const fileInput = document.getElementById("image");
    if (fileInput) {
        fileInput.value = '';
    }
};

const submitProduct = async () => {
    // Validation (same as your store component)
    if (!image.value) {
        toast.error("Image is required");
        return;
    }

    // Build payload exactly like your store component
    const payload = {};

    brands.value.forEach((brand) => {
        if (!brand.name) return;

        const variants = {};
        brand.variants.forEach((v) => {
            if (v.weight && v.price != null) {
                variants[v.weight] = v.price;
            }
        });

        if (Object.keys(variants).length > 0) {
            payload[brand.name] = variants;
        }
    });

    if (Object.keys(payload).length === 0) {
        toast.error("At least one brand with variants is required");
        return;
    }

    const finalProduct = {
        title: title.value,
        business_id: selectedProduct.value.business_id,
        image: image.value,
        payload
    };

    console.log('Update payload:', finalProduct);

    try {
        isSubmitting.value = true;

        const response = await axios.post(
            `${API_BASE_URL}/api/easy-buy/${selectedProduct.value.id}`,
            {
                ...finalProduct,
                _method: 'PUT' // Laravel method spoofing
            },
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        toast.success( "EasyBuy product updated successfully!");

        // Refresh the products list
        await fetchProducts();

        // Close the form
        cancelUpdate();

    } catch (error) {
        console.error('Update error:', error);

        if (error.response?.data?.errors) {
            // Handle validation errors
            Object.values(error.response.data.errors).flat().forEach(err => {
                toast.error(err);
            });
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        } else {
            toast.error("Failed to update easy buy product.");
        }
    } finally {
        isSubmitting.value = false;
    }
};

const cancelUpdate = () => {
    selectedProduct.value = null;
    resetForm();
};

const handleDelete = async (product) => {
   try {
    isLoading.value = true;

       const response = await axios.delete(`${API_BASE_URL}/api/easy-buy/${product.id}`);

           toast.success(response.data.data)
           // Refresh the products list
           await fetchProducts();

   } catch (error) {
       console.error('Delete error:', error);
   } finally {
    isLoading.value = false;
   }


}
</script> 