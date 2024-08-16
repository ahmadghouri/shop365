<template>
  <section class="min-h-screen flex flex-col items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 class="text-3xl font-semibold text-yellow-600 mb-6">Thank You!</h1>
      <p class="text-gray-700 text-lg mb-6">
        Your order has been placed successfully.You will receive a confirmation
        call shortly.
      </p>

      <button
        @click="goToHome"
        class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
      >
        Back to Home
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "../store/orderStore.js";
import { laraEcho } from "../echo.config.js";

const router = useRouter();

const goToHome = () => {
  router.push("/home/categories");
};

onMounted(() => {
  laraEcho.channel("test-channel").listen("TestEvent", (event) => {
    console.log("The real time data is", event);
  });

  return () => {
    laraEcho.leave("test-channel");
  };
});
</script>

<style scoped>
/* Add any additional styles here */
</style>
