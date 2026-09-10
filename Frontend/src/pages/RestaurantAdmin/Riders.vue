<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Riders" description="Manage delivery riders for your business">
      <template #actions>
        <Button variant="outline" @click="loadRiders">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button @click="openAddDialog">
          <Plus class="w-4 h-4 mr-2" />
          Add Rider
        </Button>
      </template>
    </PageHeader>

    <div v-if="riders.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="rider in riders" :key="rider._id" class="overflow-hidden">
        <CardHeader class="pb-3">
          <div class="flex items-start gap-3">
            <img
              v-if="rider.image"
              :src="riderImageUrl(rider.image)"
              alt=""
              class="h-14 w-14 shrink-0 rounded-2xl object-cover"
            />
            <div v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted">
              <Bike class="h-6 w-6 text-muted-foreground" />
            </div>
            <div class="min-w-0 flex-1">
              <CardTitle class="truncate text-base">{{ rider.name }}</CardTitle>
              <CardDescription class="mt-0.5 text-sm">{{ rider.phone_no }}</CardDescription>
              <div class="mt-2 flex flex-wrap gap-1">
                <Badge variant="default" class="text-xs">Rider</Badge>
                <Badge variant="secondary" class="text-xs">
                  {{ rider.status === 'active' ? 'Active' : 'Inactive' }}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="pb-3">
          <div class="space-y-1.5">
            <p class="flex items-center gap-2 text-sm text-muted-foreground">
              <Bike class="w-4 h-4" /> Bike<span v-if="rider.vehicle_no"> · {{ rider.vehicle_no }}</span>
            </p>
            <p v-if="rider.license_no" class="text-sm text-muted-foreground">License: {{ rider.license_no }}</p>
            <p v-if="rider.cnic" class="text-sm text-muted-foreground">CNIC: {{ rider.cnic }}</p>
            <div class="flex items-center justify-between pt-2">
              <span class="text-sm text-muted-foreground">Active Status</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  class="sr-only peer"
                  :checked="rider.status === 'active'"
                  @change="() => toggleRider(rider)"
                />
                <div class="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-foreground after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter class="gap-2">
          <Button variant="outline" class="flex-1" @click="openEditDialog(rider)">
            <Pencil class="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" class="flex-1" @click="confirmDelete(rider)">
            <Trash2 class="w-4 h-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>

    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="rounded-full bg-muted p-4 mb-4">
        <Bike class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold mb-1">No Riders</h3>
      <p class="text-sm text-muted-foreground max-w-sm mb-6">Add your first delivery rider to get started.</p>
      <Button @click="openAddDialog">
        <Plus class="w-4 h-4 mr-2" />
        Add Rider
      </Button>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <AlertDialog v-model:open="showConfirmModal">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {{ deletingRider?.name }}? Their login will be deactivated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="deleteRider">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog v-model:open="showDialog">
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingRider ? 'Edit Rider' : 'Add Rider' }}</DialogTitle>
          <DialogDescription>
            {{ editingRider ? 'Update rider details below.' : 'Riders log into the mobile app with their phone and this password.' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitRider" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Name</Label>
              <Input v-model="form.name" placeholder="Rider name" required />
            </div>
            <div class="space-y-2">
              <Label>Phone</Label>
              <Input v-model="form.phone_no" placeholder="03xxxxxxxxx" required />
            </div>
          </div>

          <div v-if="!editingRider" class="space-y-2">
            <Label>Login Password</Label>
            <Input v-model="form.password" placeholder="Set mobile app login password" required />
            <p class="text-xs text-muted-foreground">The rider will log in with their phone number and this password.</p>
          </div>

          <div class="space-y-2">
            <Label>Image</Label>
            <div class="flex items-center gap-3">
              <img
                v-if="form.imagePreview"
                :src="form.imagePreview"
                alt=""
                class="h-14 w-14 rounded-2xl object-cover"
              />
              <Input type="file" accept="image/*" @change="handleImageChange" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>CNIC</Label>
              <Input v-model="form.cnic" placeholder="Optional" />
            </div>
            <div class="space-y-2">
              <Label>License No</Label>
              <Input v-model="form.license_no" placeholder="Optional" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Bike Number</Label>
            <Input v-model="form.vehicle_no" placeholder="e.g. LEB-1234" />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" @click="showDialog = false">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
              <Save v-else class="w-4 h-4 mr-2" />
              {{ editingRider ? 'Update Rider' : 'Add Rider' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { riderApi } from "@/api/modules/rider.api";
import { API_BASE_URL } from "@/config/api";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { RefreshCw, Plus, Pencil, Save, Trash2, Loader2, Bike } from "lucide-vue-next";

const riders = ref([]);
const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const showConfirmModal = ref(false);
const editingRider = ref(null);
const deletingRider = ref(null);

const emptyForm = () => ({ name: "", phone_no: "", password: "", cnic: "", license_no: "", vehicle_no: "", image: null, imagePreview: "" });
const form = ref(emptyForm());

const riderImageUrl = (image) => {
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;
  let path = String(image).replace(/^\/be\/uploads\//, "/uploads/");
  path = path.replace(/^\/uploads\/uploads\//, "/uploads/");
  if (!path.startsWith("/")) path = `/uploads/${path}`;
  return `${API_BASE_URL}${path}`;
};

const handleImageChange = (e) => {
  const file = e.target.files[0] || null;
  form.value.image = file;
  form.value.imagePreview = file ? URL.createObjectURL(file) : "";
};

const loadRiders = async () => {
  loading.value = true;
  try {
    const res = await riderApi.getRiders();
    riders.value = res.data?.data || [];
  } catch (error) {
    toast.error("Failed to load riders");
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  editingRider.value = null;
  form.value = emptyForm();
  showDialog.value = true;
};

const openEditDialog = (rider) => {
  editingRider.value = rider;
  form.value = {
    name: rider.name,
    phone_no: rider.phone_no,
    password: "",
    cnic: rider.cnic || "",
    license_no: rider.license_no || "",
    vehicle_no: rider.vehicle_no || "",
    image: typeof rider.image === 'string' ? rider.image : null,
    imagePreview: rider.image || "",
  };
  showDialog.value = true;
};

const submitRider = async () => {
  saving.value = true;
  try {
    const { imagePreview, ...payload } = form.value;
    if (editingRider.value && !payload.password) delete payload.password;
    const hasFile = payload.image instanceof File;
    const body = hasFile
      ? Object.entries(payload).reduce((fd, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") fd.append(key, value);
          return fd;
        }, new FormData())
      : payload;

    if (editingRider.value) {
      await riderApi.updateRider(editingRider.value._id, body);
      toast.success("Rider updated successfully");
    } else {
      await riderApi.createRider(body);
      toast.success("Rider added successfully");
    }
    showDialog.value = false;
    await loadRiders();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to save rider");
  } finally {
    saving.value = false;
  }
};

const toggleRider = async (rider) => {
  try {
    await riderApi.toggleRider(rider._id);
    rider.status = rider.status === "active" ? "inactive" : "active";
    toast.success(rider.status === "active" ? "Rider activated" : "Rider deactivated");
  } catch (error) {
    toast.error("Failed to update rider status");
  }
};

const confirmDelete = (rider) => {
  deletingRider.value = rider;
  showConfirmModal.value = true;
};

const deleteRider = async () => {
  if (!deletingRider.value) return;
  try {
    await riderApi.deleteRider(deletingRider.value._id);
    toast.success("Rider removed successfully");
    showConfirmModal.value = false;
    await loadRiders();
  } catch (error) {
    toast.error("Failed to remove rider");
  }
};

onMounted(loadRiders);
</script>