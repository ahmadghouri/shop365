<template>
  <div class="container mx-auto max-w-6xl px-4 py-6">
    <!-- Top bar -->
    <div class="mb-6 flex items-center gap-3">
      <button class="flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-muted"
        @click="$router.push('/admin/rider-applications')">
        <ArrowLeft class="h-4 w-4" />
      </button>
      <div>
        <h1 class="text-xl font-bold">Rider Application</h1>
        <p class="text-sm text-muted-foreground">Review documents and decide</p>
      </div>
      <Badge v-if="application" :class="statusClass(application.status)" class="ml-auto capitalize">
        {{ application.status }}
      </Badge>
    </div>

    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-40 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="!application" class="py-20 text-center text-muted-foreground">
      Application not found.
    </div>

    <template v-else>
      <!-- Hero summary -->
      <Card class="mb-6 overflow-hidden">
        <CardContent class="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
          <Avatar class="h-20 w-20 shrink-0">
            <AvatarImage v-if="application.photo_image" :src="application.photo_image" :alt="application.name" />
            <AvatarFallback class="text-lg">{{ initials(application.name) }}</AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="truncate text-lg font-bold">{{ application.name }}</h2>
              <Badge variant="outline" class="gap-1">
                <Bike class="h-3 w-3" /> {{ application.vehicle_type }}
              </Badge>
            </div>
            <div class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <button class="flex items-center gap-1.5 hover:text-foreground" title="Copy phone"
                @click="copy(application.phone_no)">
                <Phone class="h-3.5 w-3.5" /> {{ application.phone_no }}
              </button>
              <button class="flex items-center gap-1.5 hover:text-foreground" title="Copy CNIC"
                @click="copy(application.cnic)">
                <CreditCard class="h-3.5 w-3.5" /> {{ application.cnic }}
              </button>
              <span class="flex items-center gap-1.5">
                <Calendar class="h-3.5 w-3.5" /> Applied {{ formatDate(application.createdAt) }}
              </span>
            </div>
          </div>

          <!-- Verification ring -->
          <div class="flex shrink-0 items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
            <div class="relative h-14 w-14">
              <svg viewBox="0 0 36 36" class="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" class="stroke-muted" stroke-width="4" />
                <circle cx="18" cy="18" r="16" fill="none" class="stroke-green-500 transition-all" stroke-width="4"
                  stroke-linecap="round" :stroke-dasharray="`${(docProgress.percent / 100) * circ} ${circ}`" />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {{ docProgress.percent }}%
              </span>
            </div>
            <div class="text-sm">
              <p class="font-semibold">{{ docProgress.approved }}/{{ docProgress.total }} docs</p>
              <p class="text-xs text-muted-foreground">verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left: applicant + account + documents -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Applicant details -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <User class="h-5 w-5" /> Applicant Details
              </CardTitle>
            </CardHeader>
            <CardContent class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <InfoRow :icon="User" label="Name" :value="application.name" />
              <InfoRow :icon="Phone" label="Phone" :value="application.phone_no" />
              <InfoRow :icon="CreditCard" label="CNIC" :value="application.cnic" />
              <InfoRow :icon="Bike" label="Vehicle" :value="application.vehicle_type" />
              <InfoRow :icon="Hash" label="Vehicle Number" :value="application.vehicle_no" />
              <InfoRow class="sm:col-span-2" :icon="MapPin" label="Address" :value="application.address" />
            </CardContent>
          </Card>

          <!-- Linked account -->
          <Card v-if="account">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <ShieldCheck class="h-5 w-5" /> Linked Account
              </CardTitle>
            </CardHeader>
            <CardContent class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <InfoRow :icon="Mail" label="Account Email" :value="account.email" />
              <InfoRow :icon="User" label="Account Role" :value="account.role" />
              <InfoRow :icon="MapPin" label="City / Area" :value="accountLocation" />
              <InfoRow :icon="Star" label="Loyalty Points"
                :value="account.points != null ? String(account.points) : '—'" />
              <InfoRow :icon="Calendar" label="Member Since" :value="formatDate(account.createdAt)" />
              <InfoRow v-if="account.latitude != null && account.longitude != null" :icon="MapPin" label="Coordinates"
                :value="`${account.latitude}, ${account.longitude}`" />
            </CardContent>
          </Card>

          <!-- Documents -->
          <Card>
            <CardHeader class="flex flex-row items-center justify-between">
              <CardTitle>Documents Verification</CardTitle>
              <span class="text-xs text-muted-foreground">{{ docProgress.approved }} of {{ docProgress.total }}
                approved</span>
            </CardHeader>
            <CardContent class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div v-for="doc in docs" :key="doc.key" class="overflow-hidden rounded-xl border-2 transition-colors"
                :class="docBorderClass(doc.status)">
                <a :href="doc.url || undefined" target="_blank" rel="noopener" class="block bg-muted">
                  <img v-if="doc.url" :src="doc.url" :alt="doc.label" class="h-44 w-full object-cover" />
                  <div v-else class="flex h-44 w-full items-center justify-center text-sm text-muted-foreground">
                    Not uploaded
                  </div>
                </a>
                <div class="space-y-2 p-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold">{{ doc.label }}</span>
                    <Badge :class="statusClass(doc.status)" class="capitalize">{{ doc.status }}</Badge>
                  </div>
                  <input v-model="doc.note" type="text" placeholder="Add a note (e.g. blurry, re-upload)"
                    class="w-full rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                  <div class="flex gap-2">
                    <Button size="sm" variant="outline" class="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                      :disabled="savingDoc === doc.key" @click="saveDoc(doc, 'approved')">
                      <Check class="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" class="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                      :disabled="savingDoc === doc.key" @click="saveDoc(doc, 'rejected')">
                      <X class="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" class="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    :disabled="savingDoc === doc.key" @click="saveDoc(doc, 'resend')">
                    <RotateCcw class="mr-1 h-3.5 w-3.5" /> Re-send (ask to re-upload)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right: verification checklist + message + decision -->
        <div class="space-y-6">
          <!-- Verification checklist -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <ListChecks class="h-5 w-5" /> Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2.5">
              <div v-for="doc in docs" :key="doc.key" class="flex items-center justify-between text-sm">
                <span class="flex items-center gap-2">
                  <component :is="doc.url ? CheckCircle2 : Circle" class="h-4 w-4"
                    :class="doc.url ? 'text-green-600' : 'text-muted-foreground'" />
                  {{ doc.label }}
                </span>
                <Badge :class="statusClass(doc.status)" class="capitalize">{{ doc.status }}</Badge>
              </div>
              <div class="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <span v-if="allDocsApproved" class="font-medium text-green-700">All documents approved — ready to
                  approve.</span>
                <span v-else-if="anyDocRejected" class="font-medium text-red-700">Some documents were rejected.</span>
                <span v-else-if="anyDocResend" class="font-medium text-amber-700">Waiting on re-uploaded
                  documents.</span>
                <span v-else>Review each document before deciding.</span>
              </div>
            </CardContent>
          </Card>

          <!-- Message -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <MessageSquare class="h-5 w-5" /> Message to Applicant
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <textarea v-model="adminMessage" rows="5" maxlength="500"
                placeholder="Write a message the rider will see (optional)…"
                class="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"></textarea>
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">{{ adminMessage.length }}/500</span>
                <span v-if="messageDirty" class="text-xs text-amber-600">Unsaved changes</span>
              </div>
              <Button class="w-full" variant="outline" :disabled="savingMessage || !messageDirty" @click="saveMessage">
                {{ savingMessage ? 'Saving…' : 'Save Message' }}
              </Button>
            </CardContent>
          </Card>

          <!-- Decision -->
          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <Button class="w-full" :disabled="savingStatus" @click="saveStatus('approved')">
                <Check class="mr-1 h-4 w-4" />
                {{ application.status === 'approved' ? 'Approved' : 'Approve Application' }}
              </Button>
              <Button class="w-full" variant="destructive" :disabled="savingStatus" @click="saveStatus('rejected')">
                <X class="mr-1 h-4 w-4" />
                {{ application.status === 'rejected' ? 'Rejected' : 'Reject Application' }}
              </Button>
              <Button class="w-full" variant="outline" :disabled="application.status === 'pending' || savingStatus"
                @click="saveStatus('pending')">
                Reset to Pending
              </Button>
              <p v-if="allDocsApproved && application.status !== 'approved'"
                class="text-center text-xs font-medium text-green-700">
                All documents verified — you can approve this application.
              </p>
              <p v-else-if="!allDocsApproved && application.status !== 'approved'"
                class="text-center text-xs text-muted-foreground">
                Tip: approve all documents before approving the application.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { riderApplicationApi } from "@/api/modules/riderApplication.api";
import { ref, computed, watch, defineComponent, h } from "vue";
import { useRoute } from "vue-router";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { QUERY_KEYS } from "@/api/queries/query-keys";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  User,
  Phone,
  CreditCard,
  MapPin,
  Bike,
  Mail,
  Calendar,
  MessageSquare,
  Check,
  X,
  RotateCcw,
  ShieldCheck,
  Star,
  ListChecks,
  CheckCircle2,
  Circle,
  Hash,
} from "lucide-vue-next";

const circ = 2 * Math.PI * 16; // circumference of the progress ring

// Small inline info row
const InfoRow = defineComponent({
  props: { icon: Object, label: String, value: String, class: String },
  setup(props) {
    return () =>
      h("div", { class: `flex items-start gap-2 ${props.class || ""}` }, [
        props.icon ? h(props.icon, { class: "w-4 h-4 mt-0.5 text-muted-foreground shrink-0" }) : null,
        h("div", {}, [
          h("div", { class: "text-xs text-muted-foreground" }, props.label),
          h("div", { class: "font-medium break-words" }, props.value || "—"),
        ]),
      ]);
  },
});

const route = useRoute();
const queryClient = useQueryClient();
const id = route.params.id;

const savingDoc = ref(null);
const savingMessage = ref(false);
const savingStatus = ref(false);

const { data: applicationData, isLoading: loading } = useQuery({
  queryKey: QUERY_KEYS.RIDER_APP(id),
  queryFn: async () => {
    const response = await riderApplicationApi.getOne(id);
    return response.data?.data ?? null;
  },
});

const application = computed(() => applicationData.value);

// The populated user account (present when the applicant has a linked account).
const account = computed(() => {
  const u = application.value?.user_id;
  return u && typeof u === "object" ? u : null;
});

const accountLocation = computed(() => {
  const a = account.value;
  if (!a) return "—";
  return [a.city, a.area].filter(Boolean).join(", ") || a.address || "—";
});

const DOC_DEFS = [
  { key: "cnic_front_image", label: "CNIC Front" },
  { key: "cnic_back_image", label: "CNIC Back" },
  { key: "photo_image", label: "Applicant Photo" },
  { key: "vehicle_image", label: "Vehicle Photo" },
];

// Local editable copy of documents (url + status + note)
const docs = ref([]);
const adminMessage = ref("");

watch(
  application,
  (a) => {
    if (!a) return;
    docs.value = DOC_DEFS.map((d) => ({
      key: d.key,
      label: d.label,
      url: a[d.key],
      status: a.documents?.[d.key]?.status ?? "pending",
      note: a.documents?.[d.key]?.note ?? "",
    }));
    adminMessage.value = a.admin_message ?? "";
  },
  { immediate: true }
);

const docProgress = computed(() => {
  const total = DOC_DEFS.length;
  const approved = docs.value.filter((d) => d.status === "approved").length;
  return { approved, total, percent: total ? Math.round((approved / total) * 100) : 0 };
});

const allDocsApproved = computed(
  () => docs.value.length > 0 && docs.value.every((d) => d.status === "approved")
);
const anyDocRejected = computed(() => docs.value.some((d) => d.status === "rejected"));
const anyDocResend = computed(() => docs.value.some((d) => d.status === "resend"));

const messageDirty = computed(
  () => adminMessage.value !== (application.value?.admin_message ?? "")
);

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const statusClass = (status) => {
  if (status === "approved") return "border-transparent bg-green-100 text-green-700 hover:bg-green-100";
  if (status === "rejected") return "border-transparent bg-red-100 text-red-700 hover:bg-red-100";
  if (status === "resend") return "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100";
  return "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
};

const docBorderClass = (status) => {
  if (status === "approved") return "border-green-200";
  if (status === "rejected") return "border-red-200";
  if (status === "resend") return "border-amber-200";
  return "border-border";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const copy = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(String(text));
  } catch {
    /* clipboard may be unavailable; ignore */
  }
};

const refresh = () =>
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RIDER_APP(id) });

const saveDoc = async (doc, status) => {
  savingDoc.value = doc.key;
  try {
    await riderApplicationApi.updateDocument(id, doc.key, status, doc.note);
    await refresh();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RIDER_APPS });
  } catch (error) {
    console.error("Failed to update document", error);
  } finally {
    savingDoc.value = null;
  }
};

const saveMessage = async () => {
  savingMessage.value = true;
  try {
    await riderApplicationApi.updateMessage(id, adminMessage.value);
    await refresh();
  } catch (error) {
    console.error("Failed to save message", error);
  } finally {
    savingMessage.value = false;
  }
};

const saveStatus = async (status) => {
  savingStatus.value = true;
  try {
    await riderApplicationApi.updateStatus(id, status);
    await refresh();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RIDER_APPS });
  } catch (error) {
    console.error("Failed to update status", error);
  } finally {
    savingStatus.value = false;
  }
};
</script>
