<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutGrid, Users, Store, BarChart3, ShoppingBag, Ticket,
  GraduationCap, Image, Package, ShoppingCart, Building2, Zap,
  Percent, Star, LogOut, ChevronLeft, ChevronRight, ShoppingBasket,
  Settings, Bike
} from 'lucide-vue-next'

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:collapsed'])

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

const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
}

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const adminMenuItems = [
  { label: 'Providers', to: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Categories', to: '/admin/categories', icon: ShoppingBasket },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'View Vendors', to: '/admin/vendors', icon: Store },
  { label: 'Stats', to: '/admin/stats', icon: BarChart3 },
  { label: 'SHOP365 Store', to: '/admin/shop365/users', icon: ShoppingBag },
  { label: 'Voucher', to: '/admin/vouchers', icon: Ticket },
  { label: 'Intern Applications', to: '/admin/internship-applications', icon: GraduationCap },
  { label: 'Carousel', to: '/admin/carousel', icon: Image },
  { label: 'POS Products', to: '/admin/pos-products', icon: Package },
]

const restaurantAdminMenuItems = computed(() => {
  const items = [
    { label: 'Orders', to: '/admin/restaurantOrders', icon: ShoppingCart },
    { label: 'Riders', to: '/admin/riders', icon: Bike },
    { label: 'Business Settings', to: '/admin/provider-settings', icon: Settings },
    { label: 'Sub Businesses', to: '/admin/sub-business', icon: Building2 },
    { label: 'Products', to: '/admin/restaurantAdminDashboard', icon: Package },
  ]

  if (user.value?.phone_no === '62222222222') {
    items.push({ label: 'EasyBuy Products', to: '/admin/easyBuyAdminDashboard', icon: Zap })
  }
  if (user.value?.phone_no === '62222222222') {
    items.push({ label: 'POS Products', to: '/admin/pos-products', icon: Package })
  }

  items.push(
    { label: 'Discount', to: '/admin/discount', icon: Percent },
    { label: 'Reviews', to: '/admin/business-reviews', icon: Star },
  )

  return items
})

const menuItems = computed(() => {
  if (role.value === 'admin') return adminMenuItems
  if (role.value === 'restaurant_admin') return restaurantAdminMenuItems.value
  return []
})

const handleLogout = () => {
  authStore.logout()
  router.push('/userLogin')
}

const handleNavClick = () => {
  if (props.collapsed) return
  emit('update:collapsed', true)
}
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <div class="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
      <Avatar class="h-8 w-8 shrink-0">
        <AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">S3</AvatarFallback>
      </Avatar>
      <transition name="fade">
        <span v-if="!collapsed" class="text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden">
          Shop365
        </span>
      </transition>
    </div>

    <div class="flex items-center justify-center px-4 py-3 shrink-0">
      <transition name="fade">
        <Badge v-if="!collapsed" variant="secondary" class="w-full justify-center text-xs truncate">
          {{ role === 'admin' ? 'Administrator' : 'Restaurant Admin' }}
        </Badge>
        <Badge v-else variant="secondary" class="text-[10px] px-1.5 py-0.5">
          {{ role === 'admin' ? 'A' : 'RA' }}
        </Badge>
      </transition>
    </div>

    <Separator />

    <ScrollArea class="flex-1 py-2">
      <nav class="flex flex-col gap-1 px-2">
        <template v-for="item in menuItems" :key="item.to">
          <Tooltip :disabled="!collapsed">
            <TooltipTrigger as-child>
              <router-link
                :to="item.to"
                :class="[
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                ]"
                @click="handleNavClick"
              >
                <component :is="item.icon" class="h-5 w-5 shrink-0" />
                <transition name="fade">
                  <span v-if="!collapsed" class="whitespace-nowrap overflow-hidden">
                    {{ item.label }}
                  </span>
                </transition>
              </router-link>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="10" v-if="collapsed">
              {{ item.label }}
            </TooltipContent>
          </Tooltip>
        </template>
      </nav>
    </ScrollArea>

    <div class="mt-auto border-t border-border p-2 shrink-0">
      <Tooltip :disabled="!collapsed">
        <TooltipTrigger as-child>
          <button
            @click="handleLogout"
            class="flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut class="h-5 w-5 shrink-0" />
            <transition name="fade">
              <span v-if="!collapsed" class="whitespace-nowrap">Logout</span>
            </transition>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" :side-offset="10" v-if="collapsed">
          Logout
        </TooltipContent>
      </Tooltip>

      <Separator class="my-2" />

      <Tooltip :disabled="!collapsed">
        <TooltipTrigger as-child>
          <button
            @click="toggleCollapse"
            class="flex items-center justify-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <component :is="collapsed ? ChevronRight : ChevronLeft" class="h-5 w-5 shrink-0" />
            <transition name="fade">
              <span v-if="!collapsed" class="whitespace-nowrap">Collapse</span>
            </transition>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" :side-offset="10" v-if="collapsed">
          {{ collapsed ? 'Expand' : 'Collapse' }}
        </TooltipContent>
      </Tooltip>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
