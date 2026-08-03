<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="space-y-2 md:col-span-2">
        <Label for="name">Provider Name</Label>
        <Input id="name" v-model="form.name" placeholder="Enter provider name" required />
      </div>

      <div class="space-y-2">
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

      <div class="space-y-2">
        <Label for="phone_no">Phone Number</Label>
        <Input
          id="phone_no"
          v-model="form.phone_no"
          type="tel"
          placeholder="Enter login phone number"
          autocomplete="tel"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          v-model="form.email"
          type="email"
          placeholder="provider@example.com"
          autocomplete="email"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="Minimum 6 characters"
          autocomplete="new-password"
          minlength="6"
          required
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label>Parent Business</Label>
        <Select v-model="form.parent_id" placeholder="No Parent Business">
          <SelectItem value="none">No Parent Business</SelectItem>
          <SelectItem
            v-for="business in businessStore.businesses"
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
      <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
      <Button type="submit" :disabled="submitting || categoriesLoading">
        <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
        <Store v-else class="mr-2 h-4 w-4" />
        Create Provider
      </Button>
    </div>
  </form>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useBusinessStore } from "@/store/businessStore.js";
import { useActiveCategoriesQuery } from "@/api/queries/category.queries";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectItem } from "@/components/ui/select";
import { Loader2, Store } from "lucide-vue-next";

const businessStore = useBusinessStore();
const emit = defineEmits(["close"]);
const { data: categoryData, isLoading: categoriesLoading, isError: categoriesError } = useActiveCategoriesQuery();

const categories = computed(() => categoryData.value || []);
const formError = ref("");
const submitting = ref(false);
const form = ref({
  name: "",
  category_id: "",
  phone_no: "",
  email: "",
  password: "",
  parent_id: "none",
});

const handleSubmit = async () => {
  formError.value = "";
  if (!form.value.category_id) {
    formError.value = "Please select a provider type.";
    return;
  }

  submitting.value = true;
  try {
    const selectedCategory = categories.value.find(
      (category) => (category.id || category._id) === form.value.category_id
    );
    if (!selectedCategory) {
      formError.value = "Please select a valid provider type.";
      return;
    }

    await businessStore.addProvider({
      name: form.value.name.trim(),
      type: selectedCategory.name,
      category_id: form.value.category_id,
      phone_no: form.value.phone_no.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
      parent_id: form.value.parent_id === "none" ? undefined : form.value.parent_id,
    });
    emit("close");
  } catch (error) {
    formError.value = error?.response?.data?.message || error?.message || "Unable to create provider.";
  } finally {
    submitting.value = false;
  }
};

onMounted(() => businessStore.getBusinesses());
</script>
