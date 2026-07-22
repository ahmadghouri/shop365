<template>
  <div class="relative min-h-screen flex flex-col">
    <NavBar class="sticky overflow-hidden top-0 z-50" />

    <div class="flex-grow">
      <router-view />
    </div>

    <Footer class="hidden lg:block w-full" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";

function forceLightMode() {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
}

onMounted(() => {
  forceLightMode()
})

onUnmounted(() => {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
})
</script>

<style scoped></style>
