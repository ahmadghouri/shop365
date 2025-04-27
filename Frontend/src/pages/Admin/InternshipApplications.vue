<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Internship Applications</h1>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Loading applications...</p>
    </div>

    <div v-else-if="applications.length === 0" class="text-center py-8">
      <p class="text-gray-600">No applications found.</p>
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="application in applications"
        :key="application.id"
        class="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
      >
        <div>
          <p class="font-semibold text-gray-800">{{ application.full_name }}</p>
          <p class="text-sm text-gray-600">Email: {{ application.email }}</p>
          <p class="text-sm text-gray-600">Phone: {{ application.phone }}</p>
          <p v-if="application.portfolio_url" class="text-sm text-blue-600 underline">
            <a :href="application.portfolio_url" target="_blank">View Portfolio</a>
          </p>
          <p v-if="application.academic_info" class="text-sm text-gray-500">
            Academic Info: {{ application.academic_info }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from "../../config/api.js"
import axios from 'axios'

const applications = ref([])
const loading = ref(true)
const showDeleteConfirmation = ref(false)
const selectedApplicationId = ref(null)

const fetchApplications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/internship-applications`) // Adjust API route as needed
    applications.value = response.data
  } catch (error) {
    console.error('Failed to fetch applications', error)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (id) => {
  selectedApplicationId.value = id
  showDeleteConfirmation.value = true
}

const executeDelete = async () => {
  try {
    await axios.delete(`/api/internship-applications/${selectedApplicationId.value}`)
    applications.value = applications.value.filter(app => app.id !== selectedApplicationId.value)
    showDeleteConfirmation.value = false
  } catch (error) {
    console.error('Failed to delete application', error)
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<style scoped>
/* You can add scoped styles if needed */
</style>