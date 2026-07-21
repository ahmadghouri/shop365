<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Internship Applications" description="Review incoming internship applications" />

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="i in 3" :key="i">
        <CardHeader>
          <Skeleton class="h-5 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-4 w-3/4 mb-2" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>

    <EmptyState
      v-else-if="applications.length === 0"
      title="No Applications"
      description="No internship applications have been submitted yet."
      :icon="GraduationCap"
    />

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="application in applications" :key="application.id">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <User class="w-5 h-5" />
            {{ application.full_name }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail class="w-4 h-4" />
            {{ application.email }}
          </div>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone class="w-4 h-4" />
            {{ application.phone }}
          </div>
          <div v-if="application.portfolio_url" class="text-sm">
            <a :href="application.portfolio_url" target="_blank" class="text-primary hover:underline flex items-center gap-1">
              <ExternalLink class="w-3 h-3" />
              View Portfolio
            </a>
          </div>
          <p v-if="application.academic_info" class="text-sm text-muted-foreground">
            Academic Info: {{ application.academic_info }}
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API_BASE_URL } from "@/config/api.js"
import axios from 'axios'
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, ExternalLink, GraduationCap } from "lucide-vue-next";

const applications = ref([])
const loading = ref(true)
const showDeleteConfirmation = ref(false)
const selectedApplicationId = ref(null)

const fetchApplications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/internship-applications`)
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
