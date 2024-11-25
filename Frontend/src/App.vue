<script setup>
import { useAuthStore } from "./stores/authStore";
import { onMounted, onUnmounted } from "vue";

const authStore = useAuthStore();

const refreshInterval = 10 * 60 * 1000; // 5 minutes in milliseconds
let refreshIntervalId;

onMounted(() => {
  authStore.refreshUser();
  refreshIntervalId = setInterval(() => {
    authStore.refreshUser();
  }, refreshInterval);
});

onUnmounted(() => {
  clearInterval(refreshIntervalId);
});
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
