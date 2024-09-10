<template>
  <div class="relative min-h-screen flex flex-col">
    <!-- Navbar at the top -->
    <NavBar />

    <!-- Main Content area with flex-grow to fill the remaining space -->
    <div class="flex-grow">
      <router-view />
    </div>

    <!-- Footer fixed at the bottom -->
    <Footer class="hidden lg:block w-full" />
  </div>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
</script>

<style scoped></style>
