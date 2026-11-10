<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Riders" description="Manage delivery riders for your business">
      <template #actions>
        <Button variant="outline" @click="loadAll">
          <RefreshCw class="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button @click="openAddDialog">
          <Plus class="w-4 h-4 mr-2" />
          Add Rider
        </Button>
      </template>
    </PageHeader>

    <!-- Summary stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 mb-6">
      <StatCard title="Total Riders" :value="riders.length" :icon="Bike" description="approved riders" :loading="loading" />
      <StatCard title="Active" :value="activeCount" :icon="CheckCircle2" description="on duty" :loading="loading" />
      <StatCard title="Inactive" :value="inactiveCount" :icon="PauseCircle" description="off duty" :loading="loading" />
      <StatCard title="Pending Approval" :value="pendingCount" :icon="Clock" description="waiting for admin" :loading="loading" />
    </div>

    <!-- Requests sent to admin (pending / rejected) -->
    <div v-if="requests.length" class="mb-8">
      <h2 class="mb-3 text-lg font-semibold">Rider Requests</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card v-for="req in requests" :key="req._id" class="overflow-hidden">
          <CardHeader class="pb-3">
            <div class="flex items-start gap-3">
              <img v-if="req.photo_image" :src="req.photo_image" alt=""
                class="h-14 w-14 shrink-0 rounded-2xl object-cover" />
              <div v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <Bike class="h-6 w-6 text-muted-foreground" />
              </div>
              <div class="min-w-0 flex-1">
                <CardTitle class="truncate text-base">{{ req.name }}</CardTitle>
                <CardDescription class="mt-0.5 text-sm">{{ req.phone_no }}</CardDescription>
                <div class="mt-2 flex flex-wrap gap-1">
                  <Badge v-if="req.status === 'pending'" variant="outline"
                    class="gap-1 text-xs border-amber-300 bg-amber-50 text-amber-700">
                    <Clock class="h-3 w-3" /> Pending approval
                  </Badge>
                  <Badge v-else variant="outline" class="gap-1 text-xs border-red-300 bg-red-50 text-red-700">
                    <XCircle class="h-3 w-3" /> Rejected
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-1.5 pb-4 text-sm text-muted-foreground">
            <p>{{ req.vehicle_type }}<span v-if="req.vehicle_no"> · {{ req.vehicle_no }}</span></p>
            <p>CNIC: {{ req.cnic }}</p>
            <p>Sent {{ formatDate(req.createdAt) }}</p>
            <p v-if="req.admin_message" class="rounded-md bg-muted px-3 py-2 text-foreground">
              <span class="font-medium">Admin:</span> {{ req.admin_message }}
            </p>
            <p v-if="req.status === 'pending'" class="text-xs">
              The rider can log in once the admin approves this request.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>

    <h2 v-if="requests.length && riders.length" class="mb-3 text-lg font-semibold">Approved Riders</h2>
    <div v-if="riders.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Card v-for="rider in riders" :key="rider._id"
        class="group overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
        <CardHeader class="pb-3">
          <div class="flex items-start gap-3">
            <img v-if="rider.image" :src="riderImageUrl(rider.image)" alt=""
              class="h-14 w-14 shrink-0 rounded-2xl object-cover" />
            <div v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted">
              <Bike class="h-6 w-6 text-muted-foreground" />
            </div>
            <div class="min-w-0 flex-1">
              <CardTitle class="truncate text-base">{{ rider.name }}</CardTitle>
              <CardDescription class="mt-0.5 text-sm">{{ rider.phone_no }}</CardDescription>
              <div class="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" class="gap-1 text-xs border-emerald-300 bg-emerald-50 text-emerald-700">
                  <CheckCircle2 class="h-3 w-3" /> Approved
                </Badge>
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
              <Bike class="w-4 h-4" /> {{ rider.vehicle_type === 'car' ? 'Car' : 'Bike' }}<span v-if="rider.vehicle_no"> · {{ rider.vehicle_no }}</span>
            </p>
            <p v-if="rider.license_no" class="text-sm text-muted-foreground">License: {{ rider.license_no }}</p>
            <p v-if="rider.cnic" class="text-sm text-muted-foreground">CNIC: {{ rider.cnic }}</p>
            <div class="flex items-center justify-between pt-2">
              <span class="text-sm text-muted-foreground">Active Status</span>
              <Switch :checked="rider.status === 'active'" @update:checked="() => toggleRider(rider)" />
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

    <div v-else-if="!loading && !requests.length" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="rounded-full bg-muted p-4 mb-4">
        <Bike class="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold mb-1">No Riders</h3>
      <p class="text-sm text-muted-foreground max-w-sm mb-6">
        Add your first delivery rider. The request goes to the admin for approval.
      </p>
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
      <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ editingRider ? 'Edit Rider' : 'Add Rider' }}</DialogTitle>
          <DialogDescription>{{ dialogDescription }}</DialogDescription>
        </DialogHeader>

        <form novalidate class="space-y-4" @submit.prevent="submitRider">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <Label>Full Name *</Label>
              <Input v-model="form.name" placeholder="Rider name" :class="errClass('name')" @input="clearError('name')" />
              <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
            </div>
            <div class="space-y-1.5">
              <Label>Phone Number *</Label>
              <Input v-model="form.phone_no" placeholder="03XXXXXXXXX" inputmode="numeric" maxlength="11"
                :class="errClass('phone_no')" @input="onPhoneInput" />
              <p v-if="errors.phone_no" class="text-xs text-destructive">{{ errors.phone_no }}</p>
            </div>
          </div>

          <div class="space-y-1.5">
            <Label>{{ editingRider ? 'New Password (optional)' : 'Login Password *' }}</Label>
            <div class="relative">
              <Input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                :placeholder="editingRider ? 'Leave empty to keep current password' : 'At least 6 characters'"
                class="pr-10" :class="errClass('password')" @input="clearError('password')" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
            <p v-else-if="!editingRider" class="text-xs text-muted-foreground">
              The rider logs into the rider app with this phone number and password.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <Label>CNIC {{ editingRider ? '' : '*' }}</Label>
              <Input v-model="form.cnic" placeholder="35202-1234567-1" inputmode="numeric" maxlength="15"
                :class="errClass('cnic')" @input="onCnicInput" />
              <p v-if="errors.cnic" class="text-xs text-destructive">{{ errors.cnic }}</p>
            </div>
            <div class="space-y-1.5">
              <Label>License No</Label>
              <Input v-model="form.license_no" placeholder="Optional" />
            </div>
          </div>

          <div v-if="!editingRider" class="space-y-1.5">
            <Label>Home Address *</Label>
            <Textarea v-model="form.address" rows="2" placeholder="House, street, area, city"
              :class="errClass('address')" @input="clearError('address')" />
            <p v-if="errors.address" class="text-xs text-destructive">{{ errors.address }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-if="!editingRider" class="space-y-1.5">
              <Label>Vehicle Type *</Label>
              <Select v-model="form.vehicle_type" placeholder="Select vehicle">
                <SelectItem v-for="v in VEHICLES" :key="v" :value="v">{{ v }}</SelectItem>
              </Select>
              <p v-if="errors.vehicle_type" class="text-xs text-destructive">{{ errors.vehicle_type }}</p>
            </div>
            <div class="space-y-1.5">
              <Label>Vehicle Number {{ needsVehicleNo ? '*' : '' }}</Label>
              <Input v-model="form.vehicle_no" :placeholder="needsVehicleNo ? 'e.g. LEB-1234' : 'Not needed for a bicycle'"
                :disabled="!needsVehicleNo" :class="errClass('vehicle_no')" @input="onVehicleNoInput" />
              <p v-if="errors.vehicle_no" class="text-xs text-destructive">{{ errors.vehicle_no }}</p>
            </div>
          </div>

          <!-- Documents (new rider requests only) -->
          <div v-if="!editingRider" class="space-y-2">
            <Label>Documents *</Label>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="doc in DOCS" :key="doc.key"
                class="flex h-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed text-center transition-colors hover:bg-muted/40"
                :class="errors[doc.key] ? 'border-destructive' : 'border-muted-foreground/25'">
                <img v-if="previews[doc.key]" :src="previews[doc.key]" alt="" class="h-full w-full object-cover" />
                <template v-else>
                  <Upload class="mb-1 h-5 w-5 text-muted-foreground" />
                  <span class="px-2 text-xs font-medium">{{ doc.label }}</span>
                </template>
                <input type="file" accept="image/*" class="sr-only" @change="(e) => onDocChange(doc.key, e)" />
              </label>
            </div>
            <p v-if="docErrors" class="text-xs text-destructive">{{ docErrors }}</p>
            <p v-else class="text-xs text-muted-foreground">JPG or PNG, up to 5MB each.</p>
          </div>

          <!-- Photo (edit only) -->
          <div v-else class="space-y-1.5">
            <Label>Photo</Label>
            <div class="flex items-center gap-3">
              <img v-if="form.imagePreview" :src="form.imagePreview" alt="" class="h-14 w-14 rounded-2xl object-cover" />
              <Input type="file" accept="image/*" @change="handleImageChange" />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" @click="showDialog = false">Cancel</Button>
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
              <Send v-else-if="!editingRider" class="w-4 h-4 mr-2" />
              <Save v-else class="w-4 h-4 mr-2" />
              {{ editingRider ? 'Update Rider' : saving ? 'Sending…' : 'Send for Approval' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { toast } from "vue3-toastify";
import { riderApi } from "@/api/modules/rider.api";
import { API_BASE_URL } from "@/config/api";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import {
  RefreshCw, Plus, Pencil, Save, Send, Trash2, Loader2, Bike, CheckCircle2, PauseCircle,
  Clock, XCircle, Upload, Eye, EyeOff,
} from "lucide-vue-next";

// Same options / rules the backend validates against.
const VEHICLES = ["Bike", "Scooter", "Bicycle"];
const DOCS = [
  { key: "cnic_front_image", label: "CNIC Front" },
  { key: "cnic_back_image", label: "CNIC Back" },
  { key: "photo_image", label: "Rider Photo" },
  { key: "vehicle_image", label: "Vehicle Photo" },
];
const MAX_DOC_SIZE = 5 * 1024 * 1024;

const riders = ref([]);
const requests = ref([]);
const loading = ref(false);
const saving = ref(false);
const showDialog = ref(false);
const showConfirmModal = ref(false);
const showPassword = ref(false);
const editingRider = ref(null);
const deletingRider = ref(null);
const errors = ref({});
const previews = ref({});

const activeCount = computed(() => riders.value.filter((r) => r.status === "active").length);
const inactiveCount = computed(() => riders.value.filter((r) => r.status !== "active").length);
const pendingCount = computed(() => requests.value.filter((r) => r.status === "pending").length);
const dialogDescription = computed(() =>
  editingRider.value
    ? "Update rider details below."
    : "Fill in the rider's details. The request goes to the admin; the rider can log in once approved.",
);

const emptyForm = () => ({
  name: "", phone_no: "", password: "", cnic: "", license_no: "", address: "",
  vehicle_type: "Bike", vehicle_no: "", image: null, imagePreview: "",
  cnic_front_image: null, cnic_back_image: null, photo_image: null, vehicle_image: null,
});
const form = ref(emptyForm());

// Editing an existing rider keeps its vehicle number requirement simple.
const needsVehicleNo = computed(() => editingRider.value || form.value.vehicle_type !== "Bicycle");
const docErrors = computed(() => {
  const missing = DOCS.filter((d) => errors.value[d.key]).map((d) => d.label);
  return missing.length ? `Required: ${missing.join(", ")}` : "";
});

const riderImageUrl = (image) => {
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;
  let path = String(image).replace(/^\/be\/uploads\//, "/uploads/");
  path = path.replace(/^\/uploads\/uploads\//, "/uploads/");
  if (!path.startsWith("/")) path = `/uploads/${path}`;
  return `${API_BASE_URL}${path}`;
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

// ---- Input helpers ----
const errClass = (key) => (errors.value[key] ? "border-destructive focus-visible:ring-destructive" : "");
const clearError = (key) => {
  if (errors.value[key]) {
    const next = { ...errors.value };
    delete next[key];
    errors.value = next;
  }
};

// Digits only, max 11 ("03XXXXXXXXX"); "+92 3…" / "92 3…" become "03…".
const onPhoneInput = () => {
  let d = String(form.value.phone_no).replace(/\D/g, "");
  if (d.startsWith("0092")) d = `0${d.slice(4)}`;
  else if (d.startsWith("92")) d = `0${d.slice(2)}`;
  else if (d.startsWith("3")) d = `0${d}`;
  form.value.phone_no = d.slice(0, 11);
  clearError("phone_no");
};

// Auto-format "3520212345671" -> "35202-1234567-1".
const onCnicInput = () => {
  const d = String(form.value.cnic).replace(/\D/g, "").slice(0, 13);
  form.value.cnic = [d.slice(0, 5), d.slice(5, 12), d.slice(12, 13)].filter(Boolean).join("-");
  clearError("cnic");
};

const onVehicleNoInput = () => {
  form.value.vehicle_no = String(form.value.vehicle_no).toUpperCase();
  clearError("vehicle_no");
};

const onDocChange = (key, e) => {
  const file = e.target.files?.[0] || null;
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    errors.value = { ...errors.value, [key]: "Must be an image" };
    return;
  }
  if (file.size > MAX_DOC_SIZE) {
    toast.error("Each document must be smaller than 5MB");
    return;
  }
  form.value[key] = file;
  previews.value = { ...previews.value, [key]: URL.createObjectURL(file) };
  clearError(key);
};

const handleImageChange = (e) => {
  const file = e.target.files[0] || null;
  form.value.image = file;
  form.value.imagePreview = file ? URL.createObjectURL(file) : "";
};

// ---- Validation (mirrors the backend) ----
const validate = () => {
  const f = form.value;
  const next = {};
  const name = f.name.trim();
  if (!name) next.name = "Name is required";
  else if (name.length < 3) next.name = "Name must be at least 3 characters";
  else if (!/^[a-zA-Z\s.]+$/.test(name)) next.name = "Name can only contain letters";

  if (!f.phone_no) next.phone_no = "Phone number is required";
  else if (!/^03\d{9}$/.test(f.phone_no)) next.phone_no = "Enter a valid number like 03001234567";

  if (!editingRider.value) {
    if (!f.password) next.password = "Password is required";
    else if (f.password.length < 6) next.password = "Password must be at least 6 characters";
  } else if (f.password && f.password.length < 6) {
    next.password = "Password must be at least 6 characters";
  }

  const cnicDigits = f.cnic.replace(/\D/g, "");
  if (!editingRider.value && !cnicDigits) next.cnic = "CNIC is required";
  else if (cnicDigits && cnicDigits.length !== 13) next.cnic = "CNIC must be 13 digits";

  if (!editingRider.value) {
    if (!f.address.trim()) next.address = "Address is required";
    else if (f.address.trim().length < 10) next.address = "Enter a more complete address";
    if (!VEHICLES.includes(f.vehicle_type)) next.vehicle_type = "Select a vehicle type";
    DOCS.forEach((d) => {
      if (!f[d.key]) next[d.key] = "Required";
    });
  }

  if (needsVehicleNo.value) {
    const vn = f.vehicle_no.trim();
    if (!editingRider.value && !vn) next.vehicle_no = "Vehicle number is required";
    else if (vn && vn.length < 3) next.vehicle_no = "Enter a valid vehicle number";
  }

  errors.value = next;
  return Object.keys(next).length === 0;
};

// ---- Data ----
const loadAll = async () => {
  loading.value = true;
  try {
    const [ridersRes, requestsRes] = await Promise.all([
      riderApi.getRiders(),
      riderApi.getRequests().catch(() => null),
    ]);
    riders.value = ridersRes.data?.data || [];
    requests.value = requestsRes?.data?.data || [];
  } catch (error) {
    toast.error("Failed to load riders");
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  editingRider.value = null;
  form.value = emptyForm();
  errors.value = {};
  previews.value = {};
  showPassword.value = false;
  showDialog.value = true;
};

const openEditDialog = (rider) => {
  editingRider.value = rider;
  form.value = {
    ...emptyForm(),
    name: rider.name,
    phone_no: rider.phone_no,
    cnic: rider.cnic || "",
    license_no: rider.license_no || "",
    vehicle_no: rider.vehicle_no || "",
    image: typeof rider.image === "string" ? rider.image : null,
    imagePreview: rider.image ? riderImageUrl(rider.image) : "",
  };
  errors.value = {};
  showPassword.value = false;
  showDialog.value = true;
};

const submitRider = async () => {
  if (!validate()) {
    toast.error("Please fix the highlighted fields");
    return;
  }
  saving.value = true;
  try {
    const f = form.value;
    if (editingRider.value) {
      const payload = {
        name: f.name.trim(),
        phone_no: f.phone_no,
        cnic: f.cnic,
        license_no: f.license_no.trim(),
        vehicle_no: f.vehicle_no.trim(),
        ...(f.password ? { password: f.password } : {}),
      };
      let body = payload;
      if (f.image instanceof File) {
        body = new FormData();
        Object.entries(payload).forEach(([k, v]) => body.append(k, v));
        body.append("image", f.image);
      }
      await riderApi.updateRider(editingRider.value._id, body);
      toast.success("Rider updated successfully");
    } else {
      const body = new FormData();
      body.append("name", f.name.trim());
      body.append("phone_no", f.phone_no);
      body.append("password", f.password);
      body.append("cnic", f.cnic);
      body.append("license_no", f.license_no.trim());
      body.append("address", f.address.trim());
      body.append("vehicle_type", f.vehicle_type);
      body.append("vehicle_no", needsVehicleNo.value ? f.vehicle_no.trim() : "");
      DOCS.forEach((d) => body.append(d.key, f[d.key]));
      await riderApi.createRider(body);
      toast.success("Request sent — the rider can log in once the admin approves it");
    }
    showDialog.value = false;
    await loadAll();
  } catch (error) {
    // Show server-side field errors inline when provided.
    const serverErrors = error.response?.data?.errors;
    if (serverErrors && typeof serverErrors === "object") errors.value = { ...serverErrors };
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
    await loadAll();
  } catch (error) {
    toast.error("Failed to remove rider");
  }
};

onMounted(loadAll);
</script>
