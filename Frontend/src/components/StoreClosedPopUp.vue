<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h2 class="text-xl font-bold text-gray-900 mb-4 text-right">
        دکان فی الحال بند ہے
      </h2>
      <p class="text-gray-600 mb-6 text-right">
        یہ دکان اس وقت بند ہے۔ آپ کا آرڈر پروسیس کیا جائے گا اور کل صبح آپ کو
        پہنچا دیا جائے گا۔ کیا آپ آگے بڑھنا چاہیں گے؟
      </p>
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["confirm", "cancel"]);
</script>
