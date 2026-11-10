<template>
    <div class="container mx-auto px-4 py-6">
        <PageHeader title="EasyBuy Products" description="Manage your EasyBuy product catalog">
            <template #actions>
                <router-link to="/admin/store-easybuy-product">
                    <Button>
                        <Plus class="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </router-link>
            </template>
        </PageHeader>

        <div v-if="!selectedProduct" class="grid grid-cols-2 gap-4 mt-6 mb-6">
            <StatCard title="Total Products" :value="easyBuyProducts.length" :icon="Package" description="in catalog"
                :loading="isLoading" />
            <StatCard title="Total Brands" :value="totalBrands" :icon="LayoutGrid" description="across products"
                :loading="isLoading" />
        </div>

        <!-- Update form -->
        <Card v-if="selectedProduct" class="w-full max-w-2xl">
            <CardHeader class="flex flex-row items-center justify-between space-y-0">
                <CardTitle class="text-xl">Update Easy Buy Product</CardTitle>
                <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="cancelUpdate">
                    <X class="w-4 h-4 mr-1" />
                    Cancel
                </Button>
            </CardHeader>

            <CardContent class="space-y-6">
                <!-- Product Title & Image -->
                <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                    <div class="w-full space-y-2">
                        <Label for="title">Title</Label>
                        <Input id="title" v-model="title" placeholder="Enter title" required />
                    </div>

                    <div class="w-full space-y-2">
                        <Label for="image">Image</Label>
                        <Input type="file" id="image" accept="image/*" @change="handleFileUpload" />
                        <p v-if="imageError" class="text-destructive text-xs">
                            {{ imageError }}
                        </p>
                    </div>
                </div>

                <!-- Brands Section -->
                <div v-for="(brand, brandIndex) in brands" :key="brandIndex" class="border border-border p-4 rounded-lg space-y-3">
                    <div class="space-y-2">
                        <Label :for="`brand-name-${brandIndex}`">Brand Name</Label>
                        <div class="flex items-center gap-2">
                            <Input :id="`brand-name-${brandIndex}`" v-model="brand.name" placeholder="Brand Name" class="flex-1" />
                            <Button v-if="brands.length > 1" variant="outline" size="sm"
                                class="text-destructive hover:text-destructive" @click="removeBrand(brandIndex)">
                                <Trash2 class="w-4 h-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    <!-- Variants -->
                    <div v-for="(variant, varIndex) in brand.variants" :key="varIndex"
                        class="grid grid-cols-2 gap-2 items-end">
                        <div class="space-y-2">
                            <Label :for="`weight-${brandIndex}-${varIndex}`">Weight</Label>
                            <Input :id="`weight-${brandIndex}-${varIndex}`" v-model="variant.weight" placeholder="e.g. 1-Kg" />
                        </div>
                        <div class="space-y-2">
                            <Label :for="`price-${brandIndex}-${varIndex}`">Price</Label>
                            <div class="flex items-center gap-2">
                                <Input :id="`price-${brandIndex}-${varIndex}`" type="number" placeholder="e.g. 500"
                                    :model-value="variant.price"
                                    @update:model-value="setVariantPrice(variant, $event)" />
                                <Button v-if="brand.variants.length > 1" variant="ghost" size="icon"
                                    class="shrink-0 text-destructive hover:text-destructive"
                                    @click="removeVariant(brandIndex, varIndex)">
                                    <X class="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" class="text-primary" @click="addVariant(brandIndex)">
                        <Plus class="w-4 h-4 mr-1" />
                        Add Variant
                    </Button>
                </div>

                <Button variant="secondary" @click="addBrand">
                    <Plus class="w-4 h-4 mr-2" />
                    Add Brand
                </Button>

                <Button class="w-full" :disabled="isSubmitting" @click="submitProduct">
                    {{ isSubmitting ? "Updating..." : "Update EasyBuy Product" }}
                </Button>
            </CardContent>
        </Card>

        <!-- Product List -->
        <div v-else>
            <EmptyState v-if="!isLoading && easyBuyProducts.length === 0" title="No Products"
                description="Add your first EasyBuy product to get started." :icon="Package" />
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card v-for="product in easyBuyProducts" :key="product.id"
                    class="overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md">
                    <CardContent class="p-4 flex-grow">
                        <div class="flex items-center gap-3">
                            <img :src="product.image_url" alt="Product Image"
                                class="h-16 w-16 object-cover rounded-lg border border-border shrink-0" />
                            <h2 class="text-lg font-semibold truncate">{{ product.title }}</h2>
                        </div>

                        <div class="mt-4">
                            <h3 class="font-semibold text-sm mb-2">Variants</h3>
                            <div v-for="(weights, brand) in product.payload" :key="brand" class="mb-2">
                                <Badge variant="secondary" class="mb-1">{{ brand }}</Badge>
                                <ul class="pl-4 list-disc text-sm text-muted-foreground">
                                    <li v-for="(price, weight) in weights" :key="weight">{{ weight }} – Rs. {{ price }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter class="p-4 pt-0 flex gap-3">
                        <Button class="w-full" @click="openFormForUpdate(product)">
                            <Pencil class="w-4 h-4 mr-2" />
                            Update
                        </Button>
                        <Button variant="outline" class="w-full text-destructive hover:text-destructive"
                            @click="handleDelete(product)">
                            <Trash2 class="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div v-if="isLoading" class="flex justify-center py-4">
                <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { easyBuyApi } from "@/api/modules/easy-buy.api";
import { onMounted, ref, computed } from "vue";
import { toast } from "vue3-toastify";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Package, LayoutGrid, X, Trash2, Pencil, Loader2 } from "lucide-vue-next";

// Input's v-model is string-based; keep numeric prices like v-model.number did.
const setVariantPrice = (variant, val) => {
    variant.price = val === "" || val == null ? null : Number(val);
};

const isLoading = ref(false);
const isSubmitting = ref(false);
const easyBuyProducts = ref([]);
const selectedProduct = ref(null);
const title = ref("");
let image = ref(null);
const imageError = ref("");
const brands = ref([
    {
        name: "",
        variants: [{ weight: "", price: null }],
    },
]);

const totalBrands = computed(() =>
    easyBuyProducts.value.reduce(
        (s, p) => s + Object.keys(p.payload || {}).length,
        0,
    ),
);

onMounted(async () => {
    await fetchProducts();
});

const fetchProducts = async () => {
    try {
        isLoading.value = true;
        const response = await easyBuyApi.getAll();
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
    imageError.value = "";
    image.value = file;
};

const addBrand = () => {
    brands.value.push({
        name: "",
        variants: [{ weight: "", price: null }],
    });
};

const removeBrand = (index) => {
    if (brands.value.length > 1) {
        brands.value.splice(index, 1);
    }
};

const addVariant = (brandIndex) => {
    brands.value[brandIndex].variants.push({ weight: "", price: null });
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
            price: parseFloat(price),
        })),
    }));
};

const resetForm = () => {
    title.value = "";
    image.value = null;
    imageError.value = "";
    brands.value = [
        {
            name: "",
            variants: [{ weight: "", price: null }],
        },
    ];

    // Reset file input manually
    const fileInput = document.getElementById("image");
    if (fileInput) {
        fileInput.value = "";
    }
};

const submitProduct = async () => {
    if (!title.value.trim()) {
        toast.error("Title is required");
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
        image: image.value || null,
        existing_image: selectedProduct.value.image || null,
        payload,
    };

    console.log("Update payload:", finalProduct);

    try {
        isSubmitting.value = true;

        const response = await easyBuyApi.updateWithFormData(selectedProduct.value.id,
            {
                ...finalProduct,
                _method: "PUT",
            },
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        toast.success("EasyBuy product updated successfully!");

        // Refresh the products list
        await fetchProducts();

        // Close the form
        cancelUpdate();
    } catch (error) {
        console.error("Update error:", error);

        if (error.response?.data?.errors) {
            // Handle validation errors
            Object.values(error.response.data.errors)
                .flat()
                .forEach((err) => {
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

        const response = await easyBuyApi.delete(product.id);

        toast.success(response.data.data);
        // Refresh the products list
        await fetchProducts();
    } catch (error) {
        console.error("Delete error:", error);
    } finally {
        isLoading.value = false;
    }
};
</script>
