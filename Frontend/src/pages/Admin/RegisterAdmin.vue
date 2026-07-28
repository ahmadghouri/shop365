<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl">Register Admin</CardTitle>
        <CardDescription>Create a new restaurant admin account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="registerAdmin" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" type="text" v-model="form.name" placeholder="Enter admin name" required />
          </div>
          <div class="space-y-2">
            <Label for="phone_no">Phone Number</Label>
            <Input id="phone_no" type="text" v-model="form.phone_no" placeholder="Enter phone number" required />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" v-model="form.password" placeholder="Enter password" required />
          </div>
          <div class="space-y-2">
            <Label for="restaurant">Restaurant</Label>
            <select
              id="restaurant"
              v-model="form.business"
              required
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>Select a restaurant</option>
              <option v-for="restaurant in businessStore.businesses" :key="restaurant.id" :value="restaurant.name">
                {{ restaurant.name }}
              </option>
            </select>
          </div>
          <Button type="submit" class="w-full">
            <UserPlus class="w-4 h-4 mr-2" />
            Register
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { userApi } from "@/api/modules/user.api";
import { ref, onMounted } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { useBusinessStore } from "@/store/businessStore";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-vue-next";

const businessStore = useBusinessStore();
const form = ref({
  name: "",
  phone_no: "",
  password: "",
  business: "",
});

const closeForm = () => {
  form.value.name = "";
  form.value.phone_no = "";
  form.value.password = "";
  form.value.business = "";
};

const { mutate: registerAdminMutation } = useMutation({
  mutationFn: (data) => userApi.createAdmin(data),
  onSuccess: (response) => {
    closeForm();
    if (response.status === 200 || response.status === 201) {
      toast.success("Admin registered successfully");
    }
  },
  onError: (error) => {
    if (error.response) {
      toast.error(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      toast.error("Network error. Please try again.");
    } else {
      toast.error("An unexpected error occurred.");
    }
  },
});

const registerAdmin = () => {
  registerAdminMutation(form.value);
};

onMounted(async () => {
  await businessStore.getBusinesses();
});
</script>

