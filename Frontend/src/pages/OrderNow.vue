<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div
      class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center relative overflow-hidden"
    >
      <div
        class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"
      ></div>

      <svg
        class="w-24 h-24 mx-auto mb-6 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>

      <h1 class="text-3xl font-bold text-gray-800 mb-4">Thank You!</h1>
      <p class="text-gray-600 text-lg mb-8">
        Your order has been placed successfully. We'll call you soon to confirm.
      </p>

      <button
        @click="continueShoppingWithConfetti"
        class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg text-lg px-6 py-3 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
      >
        Continue Shopping
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import confetti from "canvas-confetti";

const router = useRouter();

const continueShoppingWithConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
  setTimeout(() => {
    router.push("/home/categories");
  }, 1000);
};

onMounted(() => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
});
</script>
