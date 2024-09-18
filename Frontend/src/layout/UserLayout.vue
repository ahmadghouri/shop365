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
import NavBar from "../components/NavBar.vue";
import Footer from "../components/Footer.vue";
</script>

<style scoped></style>
