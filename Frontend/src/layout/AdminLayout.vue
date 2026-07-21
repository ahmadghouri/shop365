<template>
  <TooltipProvider>
    <div class="min-h-screen bg-background">
      <AppSidebar
        v-model:collapsed="sidebarCollapsed"
        class="hidden lg:flex"
      />

      <Sheet :open="mobileSidebarOpen" @update:open="mobileSidebarOpen = $event">
        <SheetContent side="left" class="w-64 p-0">
          <AppSidebar @update:collapsed="mobileSidebarOpen = false" />
        </SheetContent>
      </Sheet>

      <div
        :class="[
          'flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        ]"
      >
        <DashboardHeader @toggle-sidebar="handleToggleSidebar" />

        <main class="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <router-view />
        </main>
      </div>
    </div>
  </TooltipProvider>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import AppSidebar from '@/components/dashboard/AppSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'

const authStore = useAuthStore()
const router = useRouter()

const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const handleToggleSidebar = () => {
  if (window.innerWidth >= 1024) {
    sidebarCollapsed.value = !sidebarCollapsed.value
  } else {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  }
}

onMounted(() => {
  authStore.initializeStore()
})
</script>

<style scoped>
body {
  overflow-x: hidden;
}
</style>
