<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="All Users" description="Browse and manage all registered users">
      <template #actions>
        <Button variant="outline" @click="refreshData">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <router-link to="/admin/users">
          <Button variant="secondary">
            <Users class="w-4 h-4 mr-2" />
            Today's Users
          </Button>
        </router-link>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Users class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Users</p>
              <p class="text-2xl font-bold">{{ userStore.totalUsersCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <UserPlus class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">New Users Today</p>
              <p class="text-2xl font-bold">{{ userStore.todayUsersCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Toolbar: search + sort -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Search by name or phone…" class="pl-9" />
      </div>
      <select v-model="sortOrder"
        class="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-52">
        <option value="desc">Highest Orders First</option>
        <option value="asc">Lowest Orders First</option>
      </select>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="(user, index) in sortedUsers" :key="user.id"
        class="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        :class="isTopThree(index) ? 'ring-2 ring-yellow-400' : ''">
        <!-- Rank ribbon for top 3 -->
        <div v-if="isTopThree(index)"
          class="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg bg-yellow-400 px-2 py-1 text-[11px] font-semibold text-yellow-900">
          <Crown class="h-3 w-3" />
          Top {{ index + 1 }}
        </div>

        <CardContent class="pt-6">
          <div class="flex items-center gap-3 mb-4">
            <Avatar class="h-11 w-11 shrink-0">
              <AvatarFallback
                :class="isTopThree(index) ? 'bg-yellow-100 text-yellow-800' : 'bg-primary/10 text-primary'"
                class="text-sm font-semibold">
                {{ initials(user.name) }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-base font-semibold">{{ user.name || "No Name" }}</p>
              <p class="truncate text-sm text-muted-foreground">{{ user.phone_no }}</p>
            </div>
          </div>

          <!-- Order + points chips -->
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <Badge :variant="isTopThree(index) ? 'default' : 'secondary'" class="gap-1">
              <ShoppingBag class="h-3 w-3" />
              {{ user.orders_count }} Order{{ user.orders_count !== 1 ? "s" : "" }}
            </Badge>
            <Badge variant="outline" class="gap-1">
              <Star class="h-3 w-3" />
              {{ user.points || 0 }} pts
            </Badge>
          </div>

          <div class="space-y-1.5 text-sm text-muted-foreground mb-4">
            <p class="flex items-center gap-2">
              <Calendar class="h-3.5 w-3.5 shrink-0" />
              Joined {{ formatDate(user) }}
            </p>
          </div>

          <Button variant="destructive" size="sm" @click="showDeleteConfirmation(user.id)">
            <Trash2 class="w-4 h-4 mr-1" />
            Delete
          </Button>
        </CardContent>
      </Card>
    </div>

    <div v-if="!userStore.loading && sortedUsers.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center">
      <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Users class="h-8 w-8 text-muted-foreground" />
      </div>
      <p class="text-sm text-muted-foreground">
        {{ searchQuery ? "No users match your search." : "No users found." }}
      </p>
    </div>

    <div v-if="userStore.loading" class="flex justify-center my-8">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div ref="loadMoreTrigger" class="h-4 w-full"></div>

    <AlertDialog v-model:open="showDeleteConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { toast } from "vue3-toastify";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { RefreshCw, Users, UserPlus, Trash2, Loader2, Search, Crown, ShoppingBag, Star, Calendar } from "lucide-vue-next";

const userStore = useUserStore();
const sortOrder = ref("desc");
const searchQuery = ref("");

// Robust date/address helpers so the card never shows "Invalid Date".
const formatDate = (user) => {
  const raw = user?.created_at || user?.createdAt;
  if (!raw) return "—";
  const d = new Date(raw);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
};
const showDeleteConfirm = ref(false);
const userId = ref("");
const loadMoreTrigger = ref(null);
let observer = null;

const showDeleteConfirmation = (id) => {
  userId.value = id;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  userId.value = null;
};

const confirmDelete = async () => {
  if (userId.value) {
    await userStore.deleteUser(userId.value);
    showDeleteConfirm.value = false;
    userId.value = null;
    toast.success("User Deleted Successfully");
  }
};

const setupIntersectionObserver = () => {
  const options = {
    root: null,
    rootMargin: "100px",
    threshold: 0.1,
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !userStore.loading &&
        userStore.currentPage < userStore.lastPage
      ) {
        loadMoreUsers();
      }
    });
  }, options);

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
};

const loadMoreUsers = async () => {
  const nextPage = userStore.currentPage + 1;
  await userStore.getUsers(nextPage, userStore.perPage);
};

const refreshData = async () => {
  userStore.users = [];
  await userStore.getUsers(1, userStore.perPage);
};

onMounted(() => {
  refreshData();
  setupIntersectionObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

const sortedUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = [...userStore.users].filter((u) => {
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.phone_no || "").toLowerCase().includes(q)
    );
  });
  return list.sort((a, b) =>
    sortOrder.value === "desc"
      ? b.orders_count - a.orders_count
      : a.orders_count - b.orders_count,
  );
});

const isTopThree = (index) => {
  return index < 3 && sortOrder.value === "desc";
};
</script>
