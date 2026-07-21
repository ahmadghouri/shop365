<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Vendor Admins" description="Manage vendor administrator accounts">
      <template #actions>
        <Button variant="outline" @click="fetchVendors">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button @click="showRegisterDialog = true">
          <UserPlus class="w-4 h-4 mr-2" />
          Register Admin
        </Button>
      </template>
    </PageHeader>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="i in 3" :key="i">
        <CardHeader>
          <Skeleton class="h-6 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-3/4 mb-2" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>

    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertDescription>Error fetching vendor admins: {{ error }}</AlertDescription>
    </Alert>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="vendor in vendors" :key="vendor.id">
        <CardHeader>
          <CardTitle>{{ vendor.name }}</CardTitle>
          <CardDescription>{{ vendor.business_name }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone class="w-4 h-4" />
            {{ vendor.phone_no }}
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar class="w-4 h-4" />
            Created: {{ new Date(vendor.created_at).toLocaleDateString() }}
          </div>
          <div class="flex gap-2 pt-2">
            <Button variant="outline" size="sm" @click="openEditModal(vendor)">
              <Pencil class="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" @click="showDeleteConfirmation(vendor.id)">
              <Trash2 class="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <AlertDialog v-model:open="showDeleteConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this admin? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog v-model:open="showEditModal">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Admin</DialogTitle>
          <DialogDescription>Update admin details below.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="updateAdmin" class="space-y-4">
          <div class="space-y-2">
            <Label>Name</Label>
            <Input v-model="editVendor.name" type="text" />
          </div>
          <div class="space-y-2">
            <Label>Phone Number</Label>
            <Input v-model="editVendor.phone_no" type="text" @input="validatePhoneNumber" />
            <p v-if="phoneError" class="text-sm text-destructive">{{ phoneError }}</p>
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" @click="closeEditModal">Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="showRegisterDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register Admin</DialogTitle>
          <DialogDescription>Create a new restaurant admin account.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="registerAdmin" class="space-y-4">
          <div class="space-y-2">
            <Label for="reg-name">Name</Label>
            <Input id="reg-name" v-model="regForm.name" placeholder="Enter admin name" required />
          </div>
          <div class="space-y-2">
            <Label for="reg-phone">Phone Number</Label>
            <Input id="reg-phone" v-model="regForm.phone_no" placeholder="Enter phone number" required />
          </div>
          <div class="space-y-2">
            <Label for="reg-password">Password</Label>
            <Input id="reg-password" type="password" v-model="regForm.password" placeholder="Enter password" required />
          </div>
          <div class="space-y-2">
            <Label>Restaurant</Label>
            <Select v-model="regForm.business" placeholder="Select a restaurant">
              <SelectItem v-for="b in businessStore.businesses" :key="b.id" :value="b.name">
                {{ b.name }}
              </SelectItem>
            </Select>
          </div>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" @click="showRegisterDialog = false">Cancel</Button>
            <Button type="submit" :disabled="registering">
              <Loader2 v-if="registering" class="w-4 h-4 mr-2 animate-spin" />
              <UserPlus v-else class="w-4 h-4 mr-2" />
              Register
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useUserStore } from "@/store/userStore";
import { useBusinessStore } from "@/store/businessStore";
import { toast } from "vue3-toastify";
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Select, SelectItem } from "@/components/ui/select";
import { RefreshCw, Pencil, Trash2, Phone, Calendar, AlertCircle, UserPlus, Loader2 } from "lucide-vue-next";

const vendors = ref([]);
const loading = ref(false);
const error = ref(null);
const showEditModal = ref(false);
const editVendor = ref({ name: "", phone_no: "", id: null });
const phoneError = ref("");
const userStore = useUserStore();
const businessStore = useBusinessStore();
const showDeleteConfirm = ref(false);
const userId = ref("");

const showRegisterDialog = ref(false);
const registering = ref(false);
const regForm = ref({ name: "", phone_no: "", password: "", business: "" });

const authStore = useAuthStore();
const { token } = storeToRefs(authStore);

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
    toast.success("Admin Deleted Successfully");
  }
};

const fetchVendors = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/vendors`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    vendors.value = response.data.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    loading.value = false;
  }
};

const openEditModal = (vendor) => {
  editVendor.value = { ...vendor };
  showEditModal.value = true;
  phoneError.value = "";
};

const closeEditModal = () => {
  showEditModal.value = false;
  editVendor.value = { name: "", phone_no: "", id: null };
  phoneError.value = "";
};

const validatePhoneNumber = () => {
  const phoneNumber = editVendor.value.phone_no;
  if (phoneNumber.length !== 11) {
    phoneError.value = "Phone number must be 11 digits long.";
  } else {
    phoneError.value = "";
  }
};

const updateAdmin = async () => {
  validatePhoneNumber();
  if (phoneError.value) return;

  try {
    await axios.put(
      `${API_BASE_URL}/api/admin/admins/${editVendor.value.id}`,
      {
        name: editVendor.value.name,
        phone_no: editVendor.value.phone_no,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    fetchVendors();
    closeEditModal();
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  }
};

const registerAdmin = async () => {
  registering.value = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/createAdmins`,
      regForm.value,
    );
    if (response.status === 200 || response.status === 201) {
      toast.success("Admin registered successfully");
      regForm.value = { name: "", phone_no: "", password: "", business: "" };
      showRegisterDialog.value = false;
      fetchVendors();
    }
  } catch (err) {
    if (err.response) {
      toast.error(`Error: ${err.response.data.message}`);
    } else {
      toast.error("Network error. Please try again.");
    }
  } finally {
    registering.value = false;
  }
};

onMounted(() => {
  fetchVendors();
  businessStore.getBusinesses();
});
</script>
