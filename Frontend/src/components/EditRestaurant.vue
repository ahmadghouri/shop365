<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="space-y-2 md:col-span-2">
        <Label for="edit-provider-name">Provider Name</Label>
        <Input
          id="edit-provider-name"
          v-model="form.name"
          placeholder="Enter provider name"
          required
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label>Provider Type</Label>
        <Select
          v-model="form.category_id"
          :disabled="categoriesLoading || categories.length === 0"
          :placeholder="categoriesLoading ? 'Loading categories...' : 'Select a category'"
        >
          <SelectItem
            v-for="category in categories"
            :key="category.id || category._id"
            :value="category.id || category._id"
          >
            {{ category.name }}
          </SelectItem>
        </Select>
        <p v-if="categoriesError" class="text-xs text-destructive">
          Unable to load provider categories.
        </p>
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label>Parent Business</Label>
        <Select v-model="form.parent_id" placeholder="No Parent Business">
          <SelectItem value="none">No Parent Business</SelectItem>
          <SelectItem
            v-for="business in availableParentBusinesses"
            :key="business.id || business._id"
            :value="business.id || business._id"
          >
            {{ business.name }}
          </SelectItem>
        </Select>
      </div>
    </div>

    <p v-if="formError" class="text-sm text-destructive" role="alert">{{ formError }}</p>

    <Separator />

    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="emit('close')">Cancel</Button>
      <Button type="submit" :disabled="submitting || categoriesLoading">
        <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
        <Save v-else class="mr-2 h-4 w-4" />
        {{ submitting ? "Saving..." : "Save Changes" }}
      </Button>
    </div>
  </form>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useBusinessStore } from "@/store/businessStore.js";
import { useActiveCategoriesQuery } from "@/api/queries/category.queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-vue-next";

const props = defineProps({ restaurant: { type: Object, required: true } });
const emit = defineEmits(["close"]);
const businessStore = useBusinessStore();
const {
  data: categoryData,
  isLoading: categoriesLoading,
  isError: categoriesError,
} = useActiveCategoriesQuery();

const categories = computed(() => categoryData.value || []);
const currentProviderId = computed(() => props.restaurant.id || props.restaurant._id);
const availableParentBusinesses = computed(() =>
  businessStore.businesses.filter(
    (business) => (business.id || business._id) !== currentProviderId.value
  )
);
const formError = ref("");
const submitting = ref(false);
const categoryId = props.restaurant.category_id?._id || props.restaurant.category_id || "";
const parentId = props.restaurant.parent_id?._id || props.restaurant.parent_id || "";
const form = ref({
  name: props.restaurant.name,
  category_id: String(categoryId),
  parent_id: parentId ? String(parentId) : "none",
});

watch(
  categories,
  (items) => {
    if (form.value.category_id) return;
    const matchingCategory = items.find(
      (category) =>
        category.name.toLowerCase() === String(props.restaurant.type || "").toLowerCase()
    );
    if (matchingCategory) {
      form.value.category_id = matchingCategory.id || matchingCategory._id;
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  formError.value = "";
  if (!form.value.category_id) {
    formError.value = "Please select a provider type.";
    return;
  }

  submitting.value = true;
  try {
    await businessStore.editBusiness(currentProviderId.value, {
      name: form.value.name.trim(),
      category_id: form.value.category_id,
      parent_id: form.value.parent_id === "none" ? null : form.value.parent_id,
    });
    emit("close");
  } catch (error) {
    formError.value =
      error?.response?.data?.message || error?.message || "Unable to update provider.";
  } finally {
    submitting.value = false;
  }
};

onMounted(() => businessStore.getBusinesses());
</script>
