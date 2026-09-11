<script setup>
import { ref, onMounted } from 'vue'
import restaurantAdminApi from '@/api/modules/restaurantAdmin.api'
import { useRouter } from 'vue-router'

const name = ref('')
const phone_no = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const riders = ref([])
const message = ref('')
const router = useRouter()

async function fetchRiders() {
    try {
        const { data } = await restaurantAdminApi.getRiders()
        // API wraps payload as { status, message, data }
        riders.value = data?.data || []
    } catch (e) {
        console.error(e)
    }
}

async function submit() {
    loading.value = true
    message.value = ''
    try {
        const payload = { name: name.value, phone_no: phone_no.value, email: email.value, password: password.value }
        const { data } = await restaurantAdminApi.createRider(payload)
        message.value = 'Rider created successfully'
        name.value = phone_no.value = email.value = password.value = ''
        fetchRiders()
    } catch (err) {
        message.value = err?.response?.data?.message || 'Failed to create rider'
    } finally {
        loading.value = false
    }
}

onMounted(fetchRiders)

async function deleteRider(id) {
    if (!confirm('Delete this rider?')) return
    try {
        await restaurantAdminApi.deleteRider(id)
        fetchRiders()
    } catch (e) {
        alert(e?.response?.data?.message || 'Failed to delete')
    }
}
</script>

<template>
    <div class="p-6">
        <h2 class="text-xl font-semibold mb-4">Riders</h2>

        <div class="mb-6 max-w-md">
            <label class="block mb-1">Name</label>
            <input v-model="name" class="w-full p-2 border rounded mb-2" />

            <label class="block mb-1">Phone</label>
            <input v-model="phone_no" class="w-full p-2 border rounded mb-2" />

            <label class="block mb-1">Email</label>
            <input v-model="email" class="w-full p-2 border rounded mb-2" />

            <label class="block mb-1">Password (optional)</label>
            <input v-model="password" type="password" class="w-full p-2 border rounded mb-2" />

            <div class="flex items-center gap-2">
                <button @click.prevent="submit" :disabled="loading"
                    class="px-4 py-2 bg-primary text-white rounded">Create Rider</button>
                <span v-if="message" class="text-sm text-muted">{{ message }}</span>
            </div>
        </div>

        <div>
            <h3 class="font-medium mb-2">Existing Riders</h3>
            <ul>
                <li v-for="r in riders" :key="r._id" class="p-2 border-b">
                    <div class="font-semibold">{{ r.name || r.phone_no }}</div>
                    <div class="text-sm text-muted">{{ r.phone_no }} {{ r.email ? '| ' + r.email : '' }}</div>
                    <div class="mt-2 flex gap-2">
                        <button v-if="r._id" @click.prevent="router.push(`/admin/riders/${r._id}`)"
                            class="text-sm text-primary">View</button>
                        <button v-if="r._id" @click.prevent="deleteRider(r._id)"
                            class="text-sm text-destructive">Delete</button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>
