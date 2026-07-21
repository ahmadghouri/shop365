<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import ThemeToggle from './ThemeToggle.vue'
import { Menu, User, LogOut, Settings } from 'lucide-vue-next'

const emit = defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { user, role } = storeToRefs(authStore)

const initials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const pageTitle = computed(() => {
  if (route.meta?.title) return route.meta.title
  if (route.name) return route.name
  return 'Dashboard'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/userLogin')
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
    <Button variant="ghost" size="icon" class="shrink-0" @click="emit('toggle-sidebar')">
      <Menu class="h-5 w-5" />
      <span class="sr-only">Toggle sidebar</span>
    </Button>

    <div class="flex-1">
      <h1 class="text-lg font-semibold tracking-tight">{{ pageTitle }}</h1>
    </div>

    <ThemeToggle />

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="relative h-9 w-9 rounded-full">
          <Avatar class="h-9 w-9">
            <AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">
              {{ initials }}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="end">
        <DropdownMenuLabel class="font-normal">
          <div class="flex flex-col gap-1">
            <p class="text-sm font-medium leading-none">{{ user?.name || 'User' }}</p>
            <Badge variant="secondary" class="mt-1 w-fit text-[10px]">
              {{ role === 'admin' ? 'Administrator' : 'Restaurant Admin' }}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="router.push('/admin/profile')">
          <User class="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="handleLogout" class="text-destructive focus:text-destructive">
          <LogOut class="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>
