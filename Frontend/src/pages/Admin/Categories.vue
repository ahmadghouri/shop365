<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Categories" description="Manage mobile app service categories">
      <template #actions>
        <Button @click="openCreateDialog">
          <Plus class="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </template>
    </PageHeader>

    <div class="mb-6 grid gap-4 sm:grid-cols-2">
      <StatCard
        title="Total Categories"
        :value="categories.length"
        :icon="LayoutGrid"
        description="Top-level app categories"
        :loading="isLoading"
      />
      <StatCard
        title="Active Categories"
        :value="activeCategories"
        :icon="CircleCheck"
        description="Visible to customers"
        :loading="isLoading"
      />
    </div>

    <div v-if="isLoading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card v-for="index in 4" :key="index" class="overflow-hidden">
        <Skeleton class="h-44 w-full" />
        <CardHeader><Skeleton class="h-6 w-2/3" /></CardHeader>
      </Card>
    </div>

    <div v-else-if="isError" class="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
      <p class="font-medium text-destructive">Unable to load categories.</p>
      <Button class="mt-3" variant="outline" @click="refetch">Try Again</Button>
    </div>

    <EmptyState
      v-else-if="categories.length === 0"
      title="No Categories"
      description="Create Grocery, Food, Hospital or another app category."
      :icon="LayoutGrid"
      action-label="Add Category"
      @action="openCreateDialog"
    />


    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card v-for="category in categories" :key="category.id || category._id" class="overflow-hidden">
        <div class="flex h-44 items-center justify-center bg-muted/50 p-4">
          <img
            v-if="category.image_url"
            :src="categoryImageUrl(category)"
            :alt="category.name"
            class="h-full w-full object-contain"
          />
          <LayoutGrid v-else class="h-14 w-14 text-muted-foreground/40" />
        </div>
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <CardTitle class="truncate">{{ category.name }}</CardTitle>
              <CardDescription class="truncate">{{ category.subtitle }}</CardDescription>
            </div>
            <Badge :variant="category.status === 'inactive' ? 'secondary' : 'default'">
              {{ category.status || 'active' }}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter class="flex gap-2">
          <Button class="flex-1" variant="outline" @click="openEditDialog(category)">
            <Pencil class="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            class="flex-1"
            variant="destructive"
            :disabled="deleteMutation.isPending.value"
            @click="removeCategory(category)"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>

    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editingCategory ? 'Edit Category' : 'Add Category' }}</DialogTitle>
          <DialogDescription>
            {{ editingCategory ? 'Update category details and image.' : 'This category will be available to the mobile and web apps.' }}
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-5" @submit.prevent="saveCategory">
          <div class="space-y-2">
            <Label for="category-name">Category Name</Label>
            <Input id="category-name" v-model.trim="form.name" placeholder="e.g. Grocery" required />
          </div>

          <div class="space-y-2">
            <Label for="category-subtitle">Subtitle</Label>
            <Input id="category-subtitle" v-model.trim="form.subtitle" placeholder="e.g. Daily Essentials" required />
            <p class="text-xs text-muted-foreground">Shown below the category name in the app.</p>
          </div>

          <div class="space-y-2">
            <Label for="category-status">Status</Label>
            <select
              id="category-status"
              v-model="form.status"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>


          <div class="space-y-2">
            <Label for="category-image">Category Image</Label>
            <div class="rounded-lg border-2 border-dashed border-muted-foreground/25 p-4">
              <div v-if="imagePreview" class="relative mx-auto h-32 w-32">
                <img :src="imagePreview" alt="Category preview" class="h-full w-full object-contain" />
                <Button type="button" size="icon" variant="destructive" class="absolute -right-3 -top-3 h-7 w-7" @click="clearImage">
                  <X class="h-4 w-4" />
                </Button>
              </div>
              <label v-else class="flex cursor-pointer flex-col items-center py-5 text-center">
                <Upload class="mb-2 h-8 w-8 text-muted-foreground" />
                <span class="text-sm font-medium">Choose image</span>
                <span class="text-xs text-muted-foreground">PNG, JPG, WebP or SVG</span>
                <input id="category-image" type="file" accept="image/*" class="sr-only" @change="selectImage" />
              </label>
            </div>
          </div>

          <p v-if="formError" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {{ formError }}
          </p>
          <p v-if="successMessage" class="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
            {{ successMessage }}
          </p>

          <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" @click="showCreateDialog = false">Cancel</Button>
            <Button type="submit" :disabled="submitting">
              <Loader2 v-if="submitting" class="mr-2 h-4 w-4 animate-spin" />
              <Pencil v-if="editingCategory && !submitting" class="mr-2 h-4 w-4" />
              <Plus v-else-if="!submitting" class="mr-2 h-4 w-4" />
              {{ editingCategory ? 'Update Category' : 'Create Category' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { LayoutGrid, CircleCheck, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-vue-next'
import { useCategoriesQuery } from '@/api/queries/category.queries'
import { useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from '@/api/mutations/category.mutations'
import { uploadApi } from '@/api/modules/upload.api'
import { API_BASE_URL } from '@/config/api'
import PageHeader from '@/components/dashboard/PageHeader.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import EmptyState from '@/components/dashboard/EmptyState.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

const showCreateDialog = ref(false)
const editingCategory = ref(null)
const selectedImage = ref(null)
const imagePreview = ref('')
const formError = ref('')
const successMessage = ref('')
const uploading = ref(false)
const form = reactive({ name: '', subtitle: '', status: 'active' })

const { data: categoryData, isLoading, isError, refetch } = useCategoriesQuery()
const createMutation = useCreateCategoryMutation()
const updateMutation = useUpdateCategoryMutation()
const deleteMutation = useDeleteCategoryMutation()

const categories = computed(() => categoryData.value || [])
const activeCategories = computed(() => categories.value.filter((category) => category.status !== 'inactive').length)
const submitting = computed(() => uploading.value || createMutation.isPending.value || updateMutation.isPending.value)

function categoryImageUrl(category) {
  const path = category.image_url || (category.image ? `/uploads/${category.image}` : '')
  if (!path) return ''
  return /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`
}

function resetForm() {
  form.name = ''
  form.subtitle = ''
  form.status = 'active'
  editingCategory.value = null
  clearImage()
  formError.value = ''
}

function openCreateDialog() {
  resetForm()
  successMessage.value = ''
  showCreateDialog.value = true
}

function openEditDialog(category) {
  resetForm()
  editingCategory.value = category
  form.name = category.name || ''
  form.subtitle = category.subtitle || ''
  form.status = category.status || 'active'
  imagePreview.value = categoryImageUrl(category)
  successMessage.value = ''
  showCreateDialog.value = true
}

function selectImage(event) {
  const file = event.target.files?.[0]
  formError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    formError.value = 'Please select a valid image file.'
    return
  }
  selectedImage.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function clearImage() {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  selectedImage.value = null
  imagePreview.value = ''
}

async function saveCategory() {
  formError.value = ''
  successMessage.value = ''
  try {
    let image
    if (selectedImage.value) {
      uploading.value = true
      const data = new FormData()
      data.append('image', selectedImage.value)
      data.append('folder', 'categories')
      const uploadResponse = await uploadApi.image(data)
      image = uploadResponse.data.data.url
    }

    const payload = {
      name: form.name,
      subtitle: form.subtitle,
      status: form.status,
      ...(image ? { image } : {}),
    }

    if (editingCategory.value) {
      await updateMutation.mutateAsync({
        id: editingCategory.value.id || editingCategory.value._id,
        data: payload,
      })
      successMessage.value = 'Category updated successfully.'
    } else {
      await createMutation.mutateAsync(payload)
      successMessage.value = 'Category created successfully.'
    }

    window.setTimeout(() => {
      showCreateDialog.value = false
      resetForm()
      successMessage.value = ''
    }, 600)
  } catch (error) {
    formError.value = error?.response?.data?.message || error?.message || 'Unable to save category.'
  } finally {
    uploading.value = false
  }
}

async function removeCategory(category) {
  if (!window.confirm(`Delete ${category.name}?`)) return
  try {
    await deleteMutation.mutateAsync(category.id || category._id)
  } catch (error) {
    window.alert(error?.response?.data?.message || error?.message || 'Unable to delete category.')
  }
}
</script>
