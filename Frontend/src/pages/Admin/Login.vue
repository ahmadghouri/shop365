<template>
  <div class="min-h-screen flex items-center justify-center bg-muted/30 px-4">
    <div class="w-full max-w-sm">
      <Card>
        <CardHeader class="text-center">
          <div class="flex justify-center mb-2">
            <Store class="w-10 h-10 text-primary" />
          </div>
          <CardTitle class="text-2xl">Shop365</CardTitle>
          <CardDescription>Admin Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="login" class="space-y-4">
            <div class="space-y-2">
              <Label for="phone">Phone Number</Label>
              <Input
                id="phone"
                type="text"
                v-model="phone"
                placeholder="Enter 11-digit phone number"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                type="password"
                v-model="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <Alert v-if="error" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
            <Button type="submit" class="w-full">
              <LogIn class="w-4 h-4 mr-2" />
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, LogIn, AlertCircle } from "lucide-vue-next";

const phone = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const authStore = useAuthStore();

const login = async () => {
  if (phone.value.length !== 11 || password.value.length < 6) {
    error.value = "Please enter a valid phone number (11 digits) and password (at least 6 characters).";
    return;
  }

  const result = await authStore.login(phone.value, password.value);

  if (result.success) {
    if (result.role === "admin") {
      router.push("/admin/dashboard");
    } else if (result.role === "restaurant_admin") {
      router.push("/admin/restaurantAdminDashboard");
    } else {
      router.push("/admin");
    }
  } else {
    error.value = result.error;
  }
};
</script>
