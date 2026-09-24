<template>
  <div class="container mx-auto px-4 py-6 max-w-5xl">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button
        class="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-muted"
        @click="$router.push('/admin/rider-applications')"
      >
        <ArrowLeft class="w-4 h-4" />
      </button>
      <div>
        <h1 class="text-xl font-bold">Rider Application</h1>
        <p class="text-sm text-muted-foreground">Review documents and decide</p>
      </div>
      <span
        v-if="application"
        class="ml-auto text-xs font-semibold px-3 py-1 rounded-full"
        :class="statusClass(application.status)"
      >
        {{ application.status }}
      </span>
    </div>

    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-40 w-full" />
      <Skeleton class="h-64 w-full" />
    </div>

    <div v-else-if="!application" class="text-center text-muted-foreground py-20">
      Application not found.
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: applicant info + documents -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Applicant info -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <User class="w-5 h-5" /> Applicant Details
            </CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoRow :icon="User" label="Name" :value="application.name" />
            <InfoRow :icon="Phone" label="Phone" :value="application.phone_no" />
            <InfoRow :icon="CreditCard" label="CNIC" :value="application.cnic" />
            <InfoRow :icon="Bike" label="Vehicle" :value="application.vehicle_type" />
            <InfoRow class="sm:col-span-2" :icon="MapPin" label="Address" :value="application.address" />
            <InfoRow
              v-if="application.user_id?.email"
              :icon="Mail"
              label="Account Email"
              :value="application.user_id.email"
            />
            <InfoRow :icon="Calendar" label="Applied" :value="formatDate(application.createdAt)" />
          </CardContent>
        </Card>

        <!-- Documents -->
        <Card>
          <CardHeader>
            <CardTitle>Documents Verification</CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div v-for="doc in docs" :key="doc.key" class="border rounded-xl overflow-hidden">
              <a :href="doc.url || undefined" target="_blank" class="block bg-muted">
                <img
                  v-if="doc.url"
                  :src="doc.url"
                  :alt="doc.label"
                  class="w-full h-44 object-cover"
                />
                <div v-else class="w-full h-44 flex items-center justify-center text-sm text-muted-foreground">
                  Not uploaded
                </div>
              </a>
              <div class="p-3 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold">{{ doc.label }}</span>
                  <span
                    class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    :class="statusClass(doc.status)"
                  >
                    {{ doc.status }}
                  </span>
                </div>
                <input
                  v-model="doc.note"
                  type="text"
                  placeholder="Add a note (e.g. blurry, re-upload)"
                  class="w-full text-xs border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    class="flex-1 text-green-700 border-green-300 hover:bg-green-50"
                    :disabled="savingDoc === doc.key"
                    @click="saveDoc(doc, 'approved')"
                  >
                    <Check class="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    class="flex-1 text-red-700 border-red-300 hover:bg-red-50"
                    :disabled="savingDoc === doc.key"
                    @click="saveDoc(doc, 'rejected')"
                  >
                    <X class="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  class="w-full text-amber-700 border-amber-300 hover:bg-amber-50"
                  :disabled="savingDoc === doc.key"
                  @click="saveDoc(doc, 'resend')"
                >
                  <RotateCcw class="w-3.5 h-3.5 mr-1" /> Re-send (ask to re-upload)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right: message + overall decision -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <MessageSquare class="w-5 h-5" /> Message to Applicant
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <textarea
              v-model="adminMessage"
              rows="5"
              placeholder="Write a message the rider will see (optional)…"
              class="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            ></textarea>
            <Button class="w-full" variant="outline" :disabled="savingMessage" @click="saveMessage">
              {{ savingMessage ? 'Saving…' : 'Save Message' }}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button
              class="w-full"
              :disabled="application.status === 'approved' || savingStatus"
              @click="saveStatus('approved')"
            >
              <Check class="w-4 h-4 mr-1" /> Approve Application
            </Button>
            <Button
              class="w-full"
              variant="destructive"
              :disabled="application.status === 'rejected' || savingStatus"
              @click="saveStatus('rejected')"
            >
              <X class="w-4 h-4 mr-1" /> Reject Application
            </Button>
            <Button
              class="w-full"
              variant="outline"
              :disabled="application.status === 'pending' || savingStatus"
              @click="saveStatus('pending')"
            >
              Reset to Pending
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
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
} from "lucide-vue-next";

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

const statusClass = (status) => {
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "resend") return "bg-amber-100 text-amber-700";
  return "bg-yellow-100 text-yellow-700";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
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
