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

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold">Users</h2>
      <select
        v-model="sortOrder"
        class="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="desc">Highest Orders First</option>
        <option value="asc">Lowest Orders First</option>
      </select>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="(user, index) in sortedUsers"
        :key="user.id"
        :class="isTopThree(index) ? 'border-2 border-yellow-400 bg-yellow-50' : ''"
      >
        <CardContent class="pt-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-lg font-semibold">
                {{ user.name || "No Name" }}
                <Badge v-if="isTopThree(index)" variant="secondary" class="ml-2 bg-yellow-300 text-yellow-900 border-yellow-400">
                  Top {{ index + 1 }}
                </Badge>
              </p>
              <p class="text-sm text-muted-foreground">{{ user.phone_no }}</p>
            </div>
            <Badge :variant="isTopThree(index) ? 'default' : 'secondary'">
              {{ user.orders_count }} Order{{ user.orders_count !== 1 ? "s" : "" }}
            </Badge>
          </div>

          <div class="space-y-1 text-sm text-muted-foreground mb-4">
            <p><span class="font-medium text-foreground">Created At:</span> {{ new Date(user.created_at).toLocaleDateString() }}</p>
            <p><span class="font-medium text-foreground">Points:</span> {{ user.points || 0 }}</p>
            <p><span class="font-medium text-foreground">Address:</span> {{ user.household?.address || "No Address" }}</p>
            <p><span class="font-medium text-foreground">Town:</span> {{ user.household?.town?.town_name || "No Town" }}</p>
          </div>

          <Button variant="destructive" size="sm" @click="showDeleteConfirmation(user.id)">
            <Trash2 class="w-4 h-4 mr-1" />
            Delete
          </Button>
        </CardContent>
      </Card>
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
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { RefreshCw, Users, UserPlus, Trash2, Loader2 } from "lucide-vue-next";

const userStore = useUserStore();
const sortOrder = ref("desc");
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
  return [...userStore.users].sort((a, b) => {
    if (sortOrder.value === "desc") {
      return b.orders_count - a.orders_count;
    } else {
      return a.orders_count - b.orders_count;
    }
  });
});

const isTopThree = (index) => {
  return index < 3 && sortOrder.value === "desc";
};
</script>
