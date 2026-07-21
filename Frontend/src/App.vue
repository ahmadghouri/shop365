<script setup>
import { useAuthStore } from "./stores/authStore";
import { useTheme } from "./composables/useTheme";
import { onMounted, onUnmounted } from "vue";

const authStore = useAuthStore();
useTheme();

const refreshInterval = 10 * 60 * 1000; // 5 minutes in milliseconds
let refreshIntervalId;

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.refreshUser();
    refreshIntervalId = setInterval(() => {
      authStore.refreshUser();
    }, refreshInterval);
  }
});

onUnmounted(() => {
  clearInterval(refreshIntervalId);
});
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
