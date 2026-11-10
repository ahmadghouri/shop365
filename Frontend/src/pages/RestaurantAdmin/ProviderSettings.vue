<template>
  <div class="container mx-auto px-4 py-6 pb-28">
    <PageHeader title="Business Settings"
      description="How customers see your business, when you take orders and how you deliver" />

    <!-- Loading -->
    <div v-if="loading" class="mt-6 grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <Skeleton class="h-56 w-full rounded-xl" />
        <Skeleton class="h-40 w-full rounded-xl" />
        <Skeleton class="h-40 w-full rounded-xl" />
      </div>
      <Skeleton class="h-80 w-full rounded-xl" />
    </div>

    <form v-else class="mt-6 grid gap-6 lg:grid-cols-3" novalidate @submit.prevent="saveSettings">
      <!-- ========== Left: settings ========== -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Business image -->
        <Card class="overflow-hidden">
          <SectionHead :icon="Store" title="Business image" subtitle="Shown on your shop card and page in the app." />
          <CardContent class="pt-0">
            <label for="provider-image"
              class="group relative flex aspect-[16/7] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors"
              :class="imagePreview ? 'border-transparent' : 'border-muted-foreground/25 hover:bg-muted/40'">
              <img v-if="imagePreview" :src="imagePreview" alt="Business" class="h-full w-full object-cover" />
              <div v-if="imagePreview"
                class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <span class="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
                  <ImageIcon class="h-4 w-4" /> Change image
                </span>
              </div>
              <div v-else class="text-center">
                <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImageIcon class="h-6 w-6" />
                </div>
                <p class="text-sm font-medium">Upload business image</p>
                <p class="mt-1 text-xs text-muted-foreground">PNG, JPG or WebP · up to 2MB · wide images look best</p>
              </div>
              <input id="provider-image" type="file" accept="image/*" class="sr-only" @change="handleImageChange" />
            </label>
            <p v-if="selectedImage" class="mt-2 text-xs text-muted-foreground">
              New image selected — it will upload when you save.
            </p>
          </CardContent>
        </Card>

        <!-- Opening hours -->
        <Card>
          <SectionHead :icon="Clock" title="Opening hours" subtitle="Customers can order while you're open.">
            <span v-if="form.opening_time && form.closing_time"
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="isOpenNow ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted text-muted-foreground'">
              <span class="h-1.5 w-1.5 rounded-full" :class="isOpenNow ? 'bg-emerald-500' : 'bg-muted-foreground'" />
              {{ isOpenNow ? 'Open now' : 'Closed now' }}
            </span>
          </SectionHead>
          <CardContent class="pt-0 space-y-3">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Opens at" :error="errors.opening_time">
                <Input v-model="form.opening_time" type="time" :class="errClass('opening_time')" />
              </Field>
              <Field label="Closes at" :error="errors.closing_time">
                <Input v-model="form.closing_time" type="time" :class="errClass('closing_time')" />
              </Field>
            </div>
            <p v-if="hoursSummary" class="text-xs text-muted-foreground">{{ hoursSummary }}</p>
          </CardContent>
        </Card>

        <!-- Orders & delivery -->
        <Card>
          <SectionHead :icon="Bike" title="Orders & delivery" subtitle="Order limits, delivery fee and how long delivery takes." />
          <CardContent class="pt-0 space-y-5">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Minimum order" :error="errors.minimum_order"
                :hint="Number(form.minimum_order) > 0 ? '' : 'No minimum — any amount can be ordered.'">
                <PrefixInput prefix="Rs">
                  <Input v-model.number="form.minimum_order" type="number" min="0" step="1" placeholder="0"
                    class="pl-10" :class="errClass('minimum_order')" />
                </PrefixInput>
              </Field>
              <Field label="Delivery fee" :error="errors.delivery_fee"
                :hint="Number(form.delivery_fee) > 0 ? '' : 'Free delivery.'">
                <PrefixInput prefix="Rs">
                  <Input v-model.number="form.delivery_fee" type="number" min="0" step="1" placeholder="0"
                    class="pl-10" :class="errClass('delivery_fee')" />
                </PrefixInput>
              </Field>
            </div>

            <Field label="Estimated delivery time" hint="Shown to customers before they order.">
              <Input v-model="form.delivery_time" type="text" placeholder="e.g. 30-45 min" />
              <div class="mt-2 flex flex-wrap gap-2">
                <Chip v-for="t in DELIVERY_TIMES" :key="t" :active="form.delivery_time === t" @click="form.delivery_time = t">
                  {{ t }}
                </Chip>
              </div>
            </Field>
          </CardContent>
        </Card>

        <!-- Delivery area -->
        <Card>
          <SectionHead :icon="MapPin" title="Delivery area (your own riders)"
            subtitle="Orders farther than this go to platform riders automatically. No riders? Every order goes to platform riders." />
          <CardContent class="pt-0 space-y-5">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <Field label="Latitude" :error="errors.latitude">
                    <Input v-model="form.latitude" type="number" step="any" placeholder="33.6844" :class="errClass('latitude')" />
                  </Field>
                  <Field label="Longitude" :error="errors.longitude">
                    <Input v-model="form.longitude" type="number" step="any" placeholder="73.0479" :class="errClass('longitude')" />
                  </Field>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" size="sm" :disabled="locating" @click="useCurrentLocation">
                    <Loader2 v-if="locating" class="mr-2 h-4 w-4 animate-spin" />
                    <LocateFixed v-else class="mr-2 h-4 w-4" />
                    Use my current location
                  </Button>
                  <a v-if="hasLocation" :href="mapsLink" target="_blank" rel="noopener"
                    class="text-sm font-medium text-primary hover:underline">Open in Google Maps</a>
                  <button v-if="hasLocation" type="button" class="text-sm text-muted-foreground hover:text-destructive"
                    @click="clearLocation">Clear</button>
                </div>
                <p class="text-xs text-muted-foreground">
                  Tip: stand at your shop and use “current location”, or copy the coordinates from Google Maps.
                </p>
              </div>

              <!-- Map preview -->
              <div class="overflow-hidden rounded-xl border bg-muted/40">
                <iframe v-if="hasLocation" :src="embedLink" title="Business location" class="h-48 w-full" loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade" />
                <div v-else class="flex h-48 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <MapPin class="h-6 w-6" />
                  Set your location to see it on the map
                </div>
              </div>
            </div>

            <Field label="Your riders deliver up to" :error="errors.rider_radius_km"
              hint="Leave empty if your riders deliver everywhere. You can also send any single order to platform riders from the Orders page.">
              <div class="flex flex-wrap items-center gap-2">
                <div class="relative w-36">
                  <Input v-model="form.rider_radius_km" type="number" min="0" step="0.5" placeholder="No limit"
                    class="pr-10" :class="errClass('rider_radius_km')" />
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
                </div>
                <Chip v-for="km in RADIUS_PRESETS" :key="km" :active="Number(form.rider_radius_km) === km"
                  @click="form.rider_radius_km = km">{{ km }} km</Chip>
                <Chip :active="form.rider_radius_km === '' || form.rider_radius_km === null" @click="form.rider_radius_km = ''">
                  No limit
                </Chip>
              </div>
            </Field>
          </CardContent>
        </Card>
      </div>

      <!-- ========== Right: preview + checklist ========== -->
      <aside class="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card class="overflow-hidden">
          <div class="border-b px-5 py-3">
            <p class="text-sm font-semibold">Customer preview</p>
            <p class="text-xs text-muted-foreground">How your shop appears in the app</p>
          </div>
          <div class="p-4">
            <div class="overflow-hidden rounded-xl border">
              <div class="relative aspect-[16/9] bg-muted">
                <img v-if="imagePreview" :src="imagePreview" alt="" class="h-full w-full object-cover" />
                <div v-else class="flex h-full items-center justify-center text-muted-foreground">
                  <Store class="h-8 w-8" />
                </div>
                <span v-if="form.opening_time && form.closing_time"
                  class="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="isOpenNow ? 'bg-emerald-500 text-white' : 'bg-slate-800/80 text-white'">
                  {{ isOpenNow ? 'Open' : 'Closed' }}
                </span>
              </div>
              <div class="space-y-2 p-3">
                <p class="truncate font-semibold">{{ businessName || 'Your business' }}</p>
                <div class="flex flex-wrap gap-1.5 text-[11px]">
                  <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                    <Clock class="h-3 w-3" /> {{ form.delivery_time || '—' }}
                  </span>
                  <span class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                    <Bike class="h-3 w-3" />
                    {{ Number(form.delivery_fee) > 0 ? `Rs ${Number(form.delivery_fee).toLocaleString()}` : 'Free delivery' }}
                  </span>
                  <span v-if="Number(form.minimum_order) > 0" class="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                    Min Rs {{ Number(form.minimum_order).toLocaleString() }}
                  </span>
                </div>
                <p v-if="form.opening_time && form.closing_time" class="text-xs text-muted-foreground">
                  {{ formatTime(form.opening_time) }} – {{ formatTime(form.closing_time) }}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="border-b px-5 py-3">
            <p class="text-sm font-semibold">Setup checklist</p>
            <p class="text-xs text-muted-foreground">{{ doneCount }} of {{ checklist.length }} done</p>
          </div>
          <ul class="space-y-2.5 p-5">
            <li v-for="item in checklist" :key="item.label" class="flex items-start gap-2.5 text-sm">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                :class="item.done ? 'bg-emerald-500 text-white' : 'border-2 border-muted-foreground/30'">
                <Check v-if="item.done" class="h-3 w-3" />
              </span>
              <span :class="item.done ? 'text-muted-foreground line-through' : ''">{{ item.label }}</span>
            </li>
          </ul>
        </Card>
      </aside>

      <!-- ========== Save bar ========== -->
      <div class="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur transition-transform duration-200"
        :class="isDirty || errorMessage ? 'translate-y-0' : 'translate-y-full'">
        <div class="container mx-auto flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
          <p class="flex-1 text-sm" :class="errorMessage ? 'text-destructive' : 'text-muted-foreground'" role="status">
            {{ errorMessage || 'You have unsaved changes.' }}
          </p>
          <div class="flex gap-2">
            <Button type="button" variant="outline" :disabled="saving || !isDirty" @click="discardChanges">Discard</Button>
            <Button type="submit" :disabled="saving || !isDirty">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              <Save v-else class="mr-2 h-4 w-4" />
              {{ saving ? 'Saving…' : 'Save changes' }}
            </Button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { businessApi } from '@/api/modules/business.api';
import { uploadApi } from '@/api/modules/upload.api';
import PageHeader from '@/components/dashboard/PageHeader.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Bike, Check, Clock, Image as ImageIcon, Loader2, LocateFixed, MapPin, Save, Store } from 'lucide-vue-next';

// ---- Small layout pieces used only on this page ----
const SectionHead = defineComponent({
  props: { icon: Object, title: String, subtitle: String },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'flex items-start gap-3 p-6 pb-4' }, [
        h('div', { class: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary' },
          [h(props.icon, { class: 'h-4 w-4' })]),
        h('div', { class: 'min-w-0 flex-1' }, [
          h('p', { class: 'font-semibold' }, props.title),
          props.subtitle ? h('p', { class: 'mt-0.5 text-xs text-muted-foreground' }, props.subtitle) : null,
        ]),
        slots.default ? h('div', { class: 'shrink-0' }, slots.default()) : null,
      ]);
  },
});

const Field = defineComponent({
  props: { label: String, error: String, hint: String },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'space-y-1.5' }, [
        h(Label, null, () => props.label),
        slots.default?.(),
        props.error
          ? h('p', { class: 'text-xs text-destructive' }, props.error)
          : props.hint
            ? h('p', { class: 'text-xs text-muted-foreground' }, props.hint)
            : null,
      ]);
  },
});

const PrefixInput = defineComponent({
  props: { prefix: String },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'relative' }, [
        h('span', { class: 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground' }, props.prefix),
        slots.default?.(),
      ]);
  },
});

const Chip = defineComponent({
  props: { active: Boolean },
  emits: ['click'],
  setup(props, { slots, emit }) {
    return () =>
      h('button', {
        type: 'button',
        class: [
          'rounded-full border px-3 py-1 text-xs font-medium transition',
          props.active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
        ],
        onClick: () => emit('click'),
      }, slots.default?.());
  },
});

// ---- State ----
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const DELIVERY_TIMES = ['20-30 min', '30-45 min', '45-60 min', '60-90 min'];
const RADIUS_PRESETS = [2, 3, 5, 10];

const loading = ref(true);
const saving = ref(false);
const locating = ref(false);
const errorMessage = ref('');
const errors = ref({});
const selectedImage = ref(null);
const imagePreview = ref('');
const savedImage = ref('');
const businessName = ref('');
const savedSnapshot = ref('');
const form = ref(emptyForm());

function emptyForm() {
  return {
    opening_time: '',
    closing_time: '',
    minimum_order: 0,
    delivery_fee: 0,
    delivery_time: '',
    latitude: '',
    longitude: '',
    rider_radius_km: '',
  };
}

const snapshot = () => JSON.stringify(form.value);
const isDirty = computed(() => !loading.value && (snapshot() !== savedSnapshot.value || !!selectedImage.value));

// ---- Derived ----
const toMinutes = (t) => {
  if (!/^\d{2}:\d{2}$/.test(t || '')) return null;
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
};

const formatTime = (t) => {
  const m = toMinutes(t);
  if (m == null) return t;
  const hh = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${((hh + 11) % 12) + 1}:${mm} ${hh < 12 ? 'AM' : 'PM'}`;
};

// Handles overnight hours, e.g. 18:00 – 02:00.
const isOpenNow = computed(() => {
  const open = toMinutes(form.value.opening_time);
  const close = toMinutes(form.value.closing_time);
  if (open == null || close == null) return false;
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  if (open === close) return true;
  return open < close ? m >= open && m < close : m >= open || m < close;
});

const hoursSummary = computed(() => {
  const open = toMinutes(form.value.opening_time);
  const close = toMinutes(form.value.closing_time);
  if (open == null || close == null) return '';
  if (open === close) return 'Open 24 hours.';
  const span = close > open ? close - open : 24 * 60 - open + close;
  const overnight = close < open ? ' (closes after midnight)' : '';
  return `Open ${formatTime(form.value.opening_time)} – ${formatTime(form.value.closing_time)}, ${Math.floor(span / 60)}h${span % 60 ? ` ${span % 60}m` : ''} a day${overnight}.`;
});

const hasLocation = computed(() => form.value.latitude !== '' && form.value.longitude !== ''
  && Number.isFinite(Number(form.value.latitude)) && Number.isFinite(Number(form.value.longitude)));
const mapsLink = computed(() => `https://www.google.com/maps/search/?api=1&query=${form.value.latitude},${form.value.longitude}`);
const embedLink = computed(() => `https://maps.google.com/maps?q=${form.value.latitude},${form.value.longitude}&z=15&output=embed`);

const checklist = computed(() => [
  { label: 'Add a business image', done: !!imagePreview.value },
  { label: 'Set opening hours', done: !!(form.value.opening_time && form.value.closing_time) },
  { label: 'Set delivery time', done: !!form.value.delivery_time },
  { label: 'Set your shop location', done: hasLocation.value },
]);
const doneCount = computed(() => checklist.value.filter((c) => c.done).length);

// ---- Helpers ----
const errClass = (key) => (errors.value[key] ? 'border-destructive focus-visible:ring-destructive' : '');

const applyBusiness = (business) => {
  businessName.value = business.name || '';
  form.value = {
    opening_time: business.opening_time || '',
    closing_time: business.closing_time || '',
    minimum_order: business.minimum_order || 0,
    delivery_fee: business.delivery_fee || 0,
    delivery_time: business.delivery_time || '',
    latitude: business.location?.latitude ?? '',
    longitude: business.location?.longitude ?? '',
    rider_radius_km: business.rider_radius_km ?? '',
  };
  savedImage.value = business.image_url || business.image || '';
  imagePreview.value = savedImage.value;
  selectedImage.value = null;
  savedSnapshot.value = snapshot();
};

const useCurrentLocation = () => {
  errorMessage.value = '';
  if (!navigator.geolocation) {
    errorMessage.value = 'Your browser cannot share its location. Enter latitude and longitude manually.';
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.latitude = Number(pos.coords.latitude.toFixed(6));
      form.value.longitude = Number(pos.coords.longitude.toFixed(6));
      locating.value = false;
    },
    () => {
      errorMessage.value = 'Could not get your location. Allow location access or enter it manually.';
      locating.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
};

const clearLocation = () => {
  form.value.latitude = '';
  form.value.longitude = '';
};

const handleImageChange = (event) => {
  const file = event.target.files[0];
  errorMessage.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select a valid image file.';
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'Business image must be less than 2MB.';
    return;
  }
  selectedImage.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const validate = () => {
  const f = form.value;
  const next = {};
  if (!f.opening_time) next.opening_time = 'Required';
  if (!f.closing_time) next.closing_time = 'Required';
  if (!(Number(f.minimum_order) >= 0)) next.minimum_order = 'Must be 0 or more';
  if (!(Number(f.delivery_fee) >= 0)) next.delivery_fee = 'Must be 0 or more';

  const latSet = f.latitude !== '' && f.latitude !== null;
  const lngSet = f.longitude !== '' && f.longitude !== null;
  if (latSet !== lngSet) {
    next[latSet ? 'longitude' : 'latitude'] = 'Enter both latitude and longitude';
  } else if (latSet) {
    if (Math.abs(Number(f.latitude)) > 90) next.latitude = 'Must be between -90 and 90';
    if (Math.abs(Number(f.longitude)) > 180) next.longitude = 'Must be between -180 and 180';
  }

  if (f.rider_radius_km !== '' && f.rider_radius_km !== null) {
    const km = Number(f.rider_radius_km);
    if (!(km > 0 && km <= 200)) next.rider_radius_km = 'Enter a distance between 0.5 and 200 km';
    else if (!latSet) next.rider_radius_km = 'Set your shop location first — the distance is measured from it';
  }

  errors.value = next;
  return Object.keys(next).length === 0;
};

// ---- Load / save ----
const loadSettings = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await businessApi.getOwn();
    applyBusiness(response.data.data);
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Unable to load business settings.';
  } finally {
    loading.value = false;
  }
};

const discardChanges = () => {
  form.value = JSON.parse(savedSnapshot.value);
  imagePreview.value = savedImage.value;
  selectedImage.value = null;
  errors.value = {};
  errorMessage.value = '';
};

const saveSettings = async () => {
  errorMessage.value = '';
  if (!validate()) {
    errorMessage.value = 'Please fix the highlighted fields.';
    return;
  }
  saving.value = true;
  try {
    let image;
    if (selectedImage.value) {
      const uploadData = new FormData();
      uploadData.append('image', selectedImage.value);
      uploadData.append('folder', 'providers');
      const uploadResponse = await uploadApi.image(uploadData);
      image = uploadResponse.data.data.url;
    }

    const f = form.value;
    const response = await businessApi.updateOwn({
      opening_time: f.opening_time,
      closing_time: f.closing_time,
      minimum_order: Number(f.minimum_order) || 0,
      delivery_fee: Number(f.delivery_fee) || 0,
      delivery_time: f.delivery_time,
      latitude: f.latitude === '' ? null : f.latitude,
      longitude: f.longitude === '' ? null : f.longitude,
      rider_radius_km: f.rider_radius_km === '' ? null : f.rider_radius_km,
      ...(image ? { image } : {}),
    });
    applyBusiness(response.data.data);
    toast.success('Business settings saved');
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'Unable to update business settings.';
  } finally {
    saving.value = false;
  }
};

onMounted(loadSettings);
</script>
