<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import restaurantAdminApi from '@/api/modules/restaurantAdmin.api'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const rider = ref(null)
const stats = ref({})
const recent = ref([])
const loading = ref(false)

async function fetch() {
    loading.value = true
    try {
        const { data } = await restaurantAdminApi.getRider(id)
        const payload = data?.data || {}
        rider.value = payload.rider
        stats.value = payload.stats || {}
        recent.value = payload.recent || []
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    if (!id || id === 'undefined') return router.push('/admin/riders')
    fetch()
})
</script>

<template>
    <div class="p-6">
        <button @click="$router.back()" class="mb-4 text-sm text-muted">Back</button>
        <h2 class="text-xl font-semibold">Rider Detail</h2>
        <div v-if="rider" class="mt-4">
            <div class="font-semibold">{{ rider.name || rider.phone_no }}</div>
            <div class="text-sm text-muted">{{ rider.phone_no }} {{ rider.email ? '| ' + rider.email : '' }}</div>

            <div class="mt-4 grid grid-cols-3 gap-4">
                <div class="p-3 border rounded">
                    <div class="text-sm text-muted">Total Orders</div>
                    <div class="text-lg font-bold">{{ stats.total }}</div>
                </div>
                <div class="p-3 border rounded">
                    <div class="text-sm text-muted">Delivered</div>
                    <div class="text-lg font-bold">{{ stats.delivered }}</div>
                </div>
                <div class="p-3 border rounded">
                    <div class="text-sm text-muted">Pending</div>
                    <div class="text-lg font-bold">{{ stats.pending }}</div>
                </div>
            </div>

            <div class="mt-6">
                <h3 class="font-medium mb-2">Recent Orders</h3>
                <ul>
                    <li v-for="o in recent" :key="o._id" class="p-2 border-b">
                        <div class="font-semibold">Order {{ o.display_id }}</div>
                        <div class="text-sm text-muted">Status: {{ o.status }} | Amount: {{ o.total_price }}</div>
                        <div class="text-sm mt-2">
                            <div v-for="it in o.items" :key="it._id">{{ it.product_id.name }} x {{ it.quantity }}</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else-if="loading">Loading...</div>
        <div v-else>No rider found.</div>
    </div>
</template>
