<template>
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="bg-white shadow rounded-lg p-5 w-full max-w-2xl">
            <h2 class="text-xl font-medium text-gray-900 mb-4 text-center">
                Add Easy Buy Product
            </h2>

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
                    <input type="file" id="image" @change="handleFileUpload"
                        class="block text-sm border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
                        required />
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
                        <button @click="removeBrand(brandIndex)" class="text-red-500">Delete</button>
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
                                <button @click="removeVariant(brandIndex, varIndex)" class="text-red-500">X</button>
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
                <button @click="submitProduct"
                    class="w-full bg-blue-500 text-white text-sm font-medium py-2 rounded focus:outline-none 
                    focus:ring-2 focus:ring-blue-300 hover:bg-blue-600 transition">
                    Add EasyBuy Product
                </button>
            </div>
        </div>
    </div>
</template>


<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import { API_BASE_URL } from '../../config/api';

const router = useRouter();

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
    brands.value.splice(index, 1);
};

const addVariant = (brandIndex) => {
    brands.value[brandIndex].variants.push({ weight: '', price: null });
};

const removeVariant = (brandIndex, varIndex) => {
    brands.value[brandIndex].variants.splice(varIndex, 1);
};

const submitProduct = async () => {

    if (!image.value) {
        imageError.value = "Please upload a valid image.";
        return;
    }

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

    const finalProduct = {
        title: title.value,
        image: image.value,
        business_id: 4, // Replace with actual business ID in production
        payload
    };

    console.log(finalProduct);

    try {

        const response = await axios.post(
            `${API_BASE_URL}/api/easy-buy`,
            finalProduct,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        toast.success("Product added successfully");
        // router.push("/admin/restaurantAdminDashboard");
        
    } catch (error) {
        console.error(error);
        toast.error("Failed to add easy buy product.");
    }

};
</script>
