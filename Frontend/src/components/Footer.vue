<template>
  <footer
    class="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-6 lg:px-16 mt-12"
  >
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
        <!-- Logo and Tagline -->
        <div class="space-y-6">
          <h1 class="text-4xl font-bold text-yellow-500 tracking-wide">
            Shop365
          </h1>
          <p class="text-gray-300 text-xl font-light leading-relaxed">
            Empowering Your Needs, Every Day of the Year
          </p>
          <div class="pt-6">
            <p class="text-sm text-gray-400">
              &copy; 2024 Shop365. All rights reserved.
            </p>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold text-yellow-500 mb-6">
            Quick Links
          </h2>
          <nav class="flex flex-col space-y-4">
            <router-link
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="text-gray-300 hover:text-yellow-500 transition-colors duration-300 ease-in-out text-lg flex items-center group"
            >
              <span
                class="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                &rarr;
              </span>
              {{ link.text }}
            </router-link>
          </nav>
        </div>

        <!-- Contact Information -->
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold text-yellow-500 mb-6">
            Contact Us
          </h2>
          <div class="space-y-4">
            <p class="text-gray-300 text-lg">Reach out to us:</p>
            <a
              v-for="email in emails"
              :key="email"
              :href="`mailto:${email}`"
              class="text-yellow-500 hover:text-yellow-400 transition-colors duration-300 ease-in-out block text-lg hover:translate-x-2 transform transition-transform"
            >
              {{ email }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";

const links = ref([
  { to: "/", text: "Home" },
  { to: "/about", text: "About" },
  { to: "/services", text: "Services" },
  { to: "/contact", text: "Contact" },
]);

const emails = ref(["shop365@example.com", "nbthub@gmail.com"]);
</script>

<style scoped>
/* Add any scoped styles here if needed */
</style>
