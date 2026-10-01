<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Today's Users" description="View users from the last two days">
      <template #actions>
        <Button variant="outline" @click="refreshData">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <router-link to="/admin/total-users">
          <Button variant="secondary">
            <Users class="w-4 h-4 mr-2" />
            See All Users
          </Button>
        </router-link>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <UserPlus class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">New Users Today</p>
              <p class="text-2xl font-bold">{{ userStore.todayUsersCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-500/10 rounded-lg">
              <Users class="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Total Users</p>
              <p class="text-2xl font-bold">{{ userStore.users.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp class="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Top User Orders</p>
              <p class="text-2xl font-bold">{{ sortedUsers[0]?.orders_count || 0 }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-orange-500/10 rounded-lg">
              <Award class="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Total Points</p>
              <p class="text-2xl font-bold">{{ totalPoints }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="searchQuery" placeholder="Search by name or phone…" class="pl-9" />
      </div>
      <Select v-model="sortOrder" class="sm:w-60">
        <SelectItem value="desc">Highest Orders First</SelectItem>
        <SelectItem value="asc">Lowest Orders First</SelectItem>
      </Select>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="(user, index) in sortedUsers" :key="user.id"
        class="overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        :class="isTopThree(index) ? 'ring-2 ring-yellow-400/80' : ''">
        <CardHeader class="pb-3">
          <div class="flex items-center gap-3">
            <Avatar class="h-11 w-11 border-2" :class="isTopThree(index) ? 'border-yellow-400' : 'border-muted'">
              <AvatarFallback
                :class="isTopThree(index) ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'">
                {{ getInitials(user.name) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <CardTitle class="text-base truncate">{{ user.name || "No Name" }}</CardTitle>
                <Badge v-if="isTopThree(index)"
                  class="shrink-0 bg-yellow-400 text-yellow-900 border-yellow-400 hover:bg-yellow-400">
                  <Award class="w-3 h-3 mr-0.5" />
                  #{{ index + 1 }}
                </Badge>
              </div>
              <CardDescription class="flex items-center gap-1 mt-0.5">
                <Phone class="w-3 h-3" />
                {{ user.phone_no || "No phone" }}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent class="pb-3">
          <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50 mb-3">
            <div class="text-center">
              <p class="text-xs text-muted-foreground">Orders</p>
              <p class="text-lg font-bold">{{ user.orders_count }}</p>
            </div>
            <Separator orientation="vertical" class="h-8" />
            <div class="text-center">
              <p class="text-xs text-muted-foreground">Points</p>
              <p class="text-lg font-bold">{{ user.points || 0 }}</p>
            </div>
            <Separator orientation="vertical" class="h-8" />
            <div class="text-center">
              <p class="text-xs text-muted-foreground">Joined</p>
              <p class="text-sm font-semibold">{{ formatJoined(user) }}</p>
            </div>
          </div>

          <div class="space-y-1.5 text-sm">
            <div class="flex items-center gap-2 text-muted-foreground">
              <MapPin class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ user.household?.address || "No Address" }}</span>
            </div>
            <div class="flex items-center gap-2 text-muted-foreground">
              <Building2 class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ user.household?.town?.town_name || "No Town" }}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter class="pt-0">
          <Button variant="destructive" size="sm" class="w-full" @click="showDeleteConfirmation(user.id)">
            <Trash2 class="w-4 h-4 mr-1" />
            Delete User
          </Button>
        </CardFooter>
      </Card>
    </div>

    <EmptyState v-if="!userStore.loading && sortedUsers.length === 0" title="No Users Found"
      description="No users found in the last two days." :icon="Users" />

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
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/store/userStore";
import { toast } from "vue3-toastify";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectItem } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { RefreshCw, Users, UserPlus, Trash2, Award, Phone, MapPin, Building2, TrendingUp, Search } from "lucide-vue-next";

const userStore = useUserStore();
const sortOrder = ref("desc");
const searchQuery = ref("");
const showDeleteConfirm = ref(false);
const userId = ref("");

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const formatJoined = (user) => {
  const raw = user?.created_at || user?.createdAt;
  if (!raw) return "—";
  const d = new Date(raw);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const totalPoints = computed(() => {
  return userStore.users.reduce((sum, u) => sum + (u.points || 0), 0);
});

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

const fetchPreviousTwoDaysUsers = async () => {
  await userStore.getUsersPreviousTwoDays();
};

const refreshData = async () => {
  await fetchPreviousTwoDaysUsers();
};

onMounted(() => {
  fetchPreviousTwoDaysUsers();
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
