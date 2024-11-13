<template>
  <Transition name="fade">
    <div
      v-if="showAnnouncement"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
    >
      <div
        class="relative w-full max-w-md transform bg-white rounded-2xl shadow-2xl"
        :class="{
          'scale-100 opacity-100': showContent,
          'scale-95 opacity-0': !showContent,
        }"
      >
        <!-- Decorative elements -->
        <div class="absolute -top-10 -left-10 w-20 h-20 animate-float-slow">
          <div
            class="w-full h-full bg-yellow-500 rounded-full opacity-20"
          ></div>
        </div>
        <div class="absolute -bottom-8 -right-8 w-16 h-16 animate-float">
          <div
            class="w-full h-full bg-yellow-400 rounded-full opacity-20"
          ></div>
        </div>

        <!-- Close button with animation -->
        <button
          @click="closeAnnouncement"
          class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-all hover:rotate-90 duration-300"
        >
          <span class="text-2xl">&times;</span>
        </button>

        <!-- Content -->
        <div class="p-8 text-center">
          <!-- Animated rocket container -->
          <div class="relative w-24 h-24 mx-auto mb-6">
            <div
              class="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full animate-pulse-slow"
            ></div>
            <div
              class="absolute inset-2 bg-white rounded-full flex items-center justify-center"
            >
              <span class="text-4xl animate-bounce-slow">🚀</span>
            </div>
          </div>

          <!-- Text content with animation -->
          <div class="space-y-4 animate-fade-in-up">
            <h2 class="text-3xl font-bold text-gray-900">
              We're Taking Off Soon!
            </h2>

            <p class="text-lg text-gray-600">Join us on our grand launch</p>

            <!-- Countdown Timer -->
            <div class="flex justify-center gap-4 my-6">
              <div
                v-for="(value, unit) in countdown"
                :key="unit"
                class="bg-gray-50 rounded-lg p-3 animate-fade-in-up shadow-sm"
              >
                <div class="text-2xl font-bold text-yellow-500">
                  {{ value }}
                </div>
                <div class="text-xs text-gray-500 uppercase">{{ unit }}</div>
              </div>
            </div>

            <!-- Launch Perks -->
            <div class="space-y-3 my-6">
              <div
                class="animate-fade-in-up bg-yellow-50 rounded-lg p-4"
                style="animation-delay: 0.6s"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-yellow-800"
                    >Early Bird Discount</span
                  >
                  <span class="text-yellow-600">50% OFF</span>
                </div>
              </div>
              <div
                class="animate-fade-in-up bg-yellow-50 rounded-lg p-4"
                style="animation-delay: 0.8s"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-yellow-800"
                    >Free Delivery</span
                  >
                  <span class="text-yellow-600">First Month</span>
                </div>
              </div>
            </div>

            <!-- Reminder Toggle -->
            <div
              class="flex items-center justify-center gap-2 animate-fade-in-up"
              style="animation-delay: 1s"
            >
              <button
                @click="toggleReminder"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                :class="
                  reminder
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                <span>🔔</span>
                {{ reminder ? "Reminder Set!" : "Set Reminder" }}
              </button>
            </div>

            <!-- CTA Button -->
            <button
              @click="closeAnnouncement"
              class="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-white font-semibold py-4 px-6 rounded-full hover:from-yellow-600 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 mt-6 shadow-lg animate-fade-in-up"
              style="animation-delay: 1.2s"
            >
              Can't Wait!
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from "vue";

const showAnnouncement = ref(false);
const showContent = ref(false);
const reminder = ref(false);
const launchDate = new Date("2024-11-15T00:00:00");

// Reactive countdown ref
const countdown = ref({
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
});

// Function to update countdown every second
const updateCountdown = () => {
  const now = new Date();
  const difference = launchDate - now;

  if (difference > 0) {
    countdown.value.days = String(
      Math.floor(difference / (1000 * 60 * 60 * 24))
    ).padStart(2, "0");
    countdown.value.hours = String(
      Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    ).padStart(2, "0");
    countdown.value.minutes = String(
      Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    ).padStart(2, "0");
    countdown.value.seconds = String(
      Math.floor((difference % (1000 * 60)) / 1000)
    ).padStart(2, "0");
  } else {
    clearInterval(countdownInterval);
    // Handle the event after countdown finishes
  }
};

// Start the countdown on component mount
let countdownInterval;
onMounted(() => {
  showAnnouncement.value = true;
  setTimeout(() => {
    showContent.value = true;
  }, 100);

  countdownInterval = setInterval(updateCountdown, 1000);
});

const toggleReminder = () => {
  reminder.value = !reminder.value;
};

const closeAnnouncement = () => {
  showContent.value = false;
  setTimeout(() => {
    showAnnouncement.value = false;
  }, 300);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}
</style>
