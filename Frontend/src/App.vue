<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  document.addEventListener('customEvent', function (e) {
    window.location.href = 'inapp://customEventTriggered?' + encodeURIComponent(JSON.stringify(e.detail));
  });

  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('customEvent', { detail: { key: 'test custom event: Application Loaded' } }));
  }, 10000)

  window?.webkit?.messageHandlers?.cordova_iab?.postMessage('Application Loaded');
  window?.parent?.postMessage('Application Loaded');
  window?.postMessage('Application Loaded');
  console.log("Application Loaded",);
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
