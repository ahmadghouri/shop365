<template>
  <div class="container mx-auto px-4 py-6">
    <PageHeader title="Menu & Products" description="What customers can order from your shop">
      <template #actions>
        <Button variant="outline" @click="refreshProducts">
          <RefreshCw class="w-4 h-4 mr-2" :class="isLoading ? 'animate-spin' : ''" />
          Refresh
        </Button>
        <Button @click="showAddDialog = true">
          <Plus class="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </template>
    </PageHeader>

    <!-- Stats (click to filter) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <button v-for="s in statFilters" :key="s.key" type="button"
        class="rounded-xl text-left transition hover:-translate-y-0.5"
        :class="statusFilter === s.key ? 'ring-2 ring-primary' : ''" @click="statusFilter = s.key">
        <StatCard :title="s.title" :value="s.value" :icon="s.icon" :description="s.description" />
      </button>
    </div>

    <!-- Toolbar -->
    <div class="mt-6 rounded-xl border bg-card p-3 space-y-3">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Search products…" class="pl-9" />
        </div>
        <div class="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="flex-1 sm:w-48 justify-between">
                <span class="flex items-center gap-2">
                  <ArrowDownUp class="w-4 h-4" />
                  {{ activeSort.label }}
                </span>
                <ChevronDown class="w-4 h-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-52">
              <DropdownMenuLabel>Sort products</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="opt in sortOptions" :key="opt.value" class="flex items-center justify-between"
                @click="sortBy = opt.value">
                {{ opt.label }}
                <Check v-if="sortBy === opt.value" class="w-4 h-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div class="flex rounded-md border p-0.5">
            <button type="button" class="rounded px-2.5" title="Grid view"
              :class="viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'" @click="setView('grid')">
              <LayoutGrid class="h-4 w-4" />
            </button>
            <button type="button" class="rounded px-2.5" title="List view"
              :class="viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'" @click="setView('list')">
              <List class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Category chips (from product type) -->
      <div v-if="productTypes.length > 1" class="flex items-center gap-2 overflow-x-auto pb-0.5">
        <button type="button" class="shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="!typeFilter ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'"
          @click="typeFilter = ''">All</button>
        <button v-for="t in productTypes" :key="t.name" type="button"
          class="shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition"
          :class="typeFilter === t.name ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'"
          @click="typeFilter = t.name">
          {{ t.name }} <span class="opacity-70">{{ t.count }}</span>
        </button>
      </div>
    </div>

    <div class="mt-6">
      <!-- ===== Grid view ===== -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
        <Card v-for="product in visibleProducts" :key="product.id || product._id"
          class="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div class="relative aspect-[4/3] overflow-hidden bg-muted/50">
            <img v-if="productImageUrl(product)" :src="productImageUrl(product)" :alt="product.title"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              :class="!isLive(product) ? 'grayscale-[60%] opacity-70' : ''" />
            <div v-else class="flex h-full items-center justify-center">
              <Package class="h-12 w-12 text-muted-foreground/40" />
            </div>
            <span v-if="product.discount > 0"
              class="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {{ discountLabel(product) }}
            </span>
            <span class="absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              :class="liveBadge(product).class">{{ liveBadge(product).label }}</span>
          </div>

          <div class="flex flex-1 flex-col p-4">
            <div class="flex items-start justify-between gap-2">
              <p class="min-w-0 flex-1 truncate font-semibold">{{ product.title }}</p>
              <div class="shrink-0 text-right leading-tight">
                <p class="font-bold">Rs {{ formatPrice(finalPrice(product)) }}</p>
                <p v-if="finalPrice(product) < Number(product.price)" class="text-xs text-muted-foreground line-through">
                  Rs {{ formatPrice(product.price) }}
                </p>
              </div>
            </div>
            <p v-if="plainText(product.description)" class="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {{ plainText(product.description) }}
            </p>
            <div class="mt-2 flex flex-wrap gap-1">
              <Badge v-if="product.type" variant="secondary" class="text-[11px]">{{ product.type }}</Badge>
              <Badge v-if="product.sizes?.length" variant="outline" class="text-[11px]">
                {{ product.sizes.length }} size{{ product.sizes.length === 1 ? '' : 's' }}
              </Badge>
              <Badge v-if="product.extras?.length" variant="outline" class="text-[11px]">
                {{ product.extras.length }} extra{{ product.extras.length === 1 ? '' : 's' }}
              </Badge>
            </div>

            <div class="mt-auto pt-4 space-y-2">
              <label class="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span class="flex items-center gap-2"><PackageCheck class="h-4 w-4 text-muted-foreground" /> In stock</span>
                <Switch :checked="!!product.status" @update:checked="() => handleStatusToggle(product)" />
              </label>
              <label class="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span class="flex items-center gap-2"><Eye class="h-4 w-4 text-muted-foreground" /> Show in app</span>
                <Switch :checked="!!product.is_active" @update:checked="() => handleActiveToggle(product)" />
              </label>
            </div>
          </div>

          <div class="flex gap-2 border-t bg-muted/30 px-4 py-3">
            <Button variant="outline" size="sm" class="flex-1" @click="openFormForUpdate(product)">
              <Pencil class="w-4 h-4 mr-1.5" /> Edit
            </Button>
            <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive"
              @click="confirmDelete(product.id || product._id)">
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      <!-- ===== List view ===== -->
      <Card v-else-if="visibleProducts.length" class="overflow-hidden">
        <div class="hidden md:grid grid-cols-[1fr_120px_110px_110px_110px] gap-3 border-b bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Product</span><span class="text-right">Price</span><span class="text-center">In stock</span>
          <span class="text-center">Show in app</span><span class="text-right">Actions</span>
        </div>
        <div v-for="product in visibleProducts" :key="product.id || product._id"
          class="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_120px_110px_110px_110px] items-center gap-3 border-b px-4 py-3 last:border-b-0">
          <div class="flex min-w-0 items-center gap-3">
            <img v-if="productImageUrl(product)" :src="productImageUrl(product)" alt=""
              class="h-12 w-12 shrink-0 rounded-lg border object-cover" />
            <div v-else class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Package class="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{{ product.title }}</p>
              <p class="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span v-if="product.type">{{ product.type }}</span>
                <span class="rounded-full px-1.5 font-semibold" :class="liveBadge(product).class">{{ liveBadge(product).label }}</span>
                <span v-if="product.discount > 0" class="font-semibold text-red-500">{{ discountLabel(product) }}</span>
              </p>
            </div>
          </div>
          <div class="text-right leading-tight">
            <p class="text-sm font-bold">Rs {{ formatPrice(finalPrice(product)) }}</p>
            <p v-if="finalPrice(product) < Number(product.price)" class="text-xs text-muted-foreground line-through">
              Rs {{ formatPrice(product.price) }}
            </p>
          </div>
          <div class="hidden md:flex justify-center">
            <Switch :checked="!!product.status" @update:checked="() => handleStatusToggle(product)" />
          </div>
          <div class="hidden md:flex justify-center">
            <Switch :checked="!!product.is_active" @update:checked="() => handleActiveToggle(product)" />
          </div>
          <div class="col-span-2 md:col-span-1 flex justify-end gap-1">
            <Button variant="ghost" size="sm" @click="openFormForUpdate(product)">
              <Pencil class="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive"
              @click="confirmDelete(product.id || product._id)">
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div v-if="productStore.isLoading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <div ref="loadMoreTrigger" class="h-4 my-4"></div>

      <EmptyState v-if="!productStore.isLoading && (productStore.currentProducts || []).length === 0"
        title="No Products" description="Get started by adding your first product." :icon="Package"
        actionLabel="Add Product" @action="showAddDialog = true" />
      <div v-else-if="!productStore.isLoading && !visibleProducts.length"
        class="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        No products match these filters.
        <button type="button" class="ml-1 font-medium text-primary hover:underline" @click="clearFilters">Clear filters</button>
      </div>
    </div>

    <AlertDialog v-model:open="showConfirmModal">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="deleteProduct(confirmDeleteId)">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog v-model:open="showAddDialog">
      <DialogContent class="sm:max-w-3xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader class="border-b px-6 py-4">
          <div class="flex items-center gap-3 pr-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package class="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add product</DialogTitle>
              <DialogDescription>Add a new item to your menu.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="add-product-form" novalidate class="flex-1 overflow-y-auto" @submit.prevent="handleAddProduct">
          <div class="grid gap-6 p-6 md:grid-cols-[240px_1fr]">
            <!-- ===== Left: image + preview ===== -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label>Product image *</Label>
                <label for="add-product-image"
                  class="group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors"
                  :class="addImagePreview ? 'border-transparent' : addImageError ? 'border-destructive bg-destructive/5' : 'border-muted-foreground/25 bg-muted/30 hover:border-primary/50'">
                  <img v-if="addImagePreview" :src="addImagePreview" alt="Preview" class="h-full w-full object-cover" />
                  <div v-if="addImagePreview"
                    class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <span class="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-900">
                      <ImageIcon class="h-3.5 w-3.5" /> Change
                    </span>
                  </div>
                  <div v-else class="flex flex-col items-center px-4 text-center text-muted-foreground">
                    <ImageIcon class="mb-2 h-8 w-8" />
                    <span class="text-sm font-medium text-primary">Upload image</span>
                    <span class="mt-0.5 text-xs">PNG, JPG or WebP · up to 2MB</span>
                  </div>
                </label>
                <input id="add-product-image" type="file" accept="image/*" class="hidden" @change="handleAddFileChange" />
                <p v-if="addImageError" class="text-xs text-destructive">{{ addImageError }}</p>
              </div>

              <!-- Customer preview -->
              <div class="rounded-xl border p-3">
                <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer sees</p>
                <p class="truncate text-sm font-semibold">{{ addForm.title || 'Product name' }}</p>
                <p v-if="addForm.type" class="text-xs text-muted-foreground">{{ addForm.type }}</p>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="text-lg font-bold">Rs {{ formatPrice(addFinalPrice) }}</span>
                  <span v-if="addFinalPrice < Number(addForm.price)" class="text-xs text-muted-foreground line-through">
                    Rs {{ formatPrice(addForm.price) }}
                  </span>
                </div>
                <span v-if="Number(addDiscount) > 0"
                  class="mt-1 inline-block rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {{ addDiscountType === 'flat' ? `Rs ${formatPrice(addDiscount)} OFF` : `${addDiscount}% OFF` }}
                </span>
                <p class="mt-2 text-xs" :class="addPublish ? 'text-emerald-600' : 'text-muted-foreground'">
                  {{ addPublish ? '● Goes live as soon as you add it' : '● Saved hidden — publish it later' }}
                </p>
              </div>
            </div>

            <!-- ===== Right: fields ===== -->
            <div class="space-y-6">
              <!-- Basic info -->
              <section class="space-y-4">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic info</h4>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="space-y-1.5 sm:col-span-2">
                    <Label for="add-title">Name *</Label>
                    <Input id="add-title" v-model="addForm.title" placeholder="e.g. Zinger Burger"
                      :class="addErrors.title ? 'border-destructive' : ''" @input="addErrors.title = ''" />
                    <p v-if="addErrors.title" class="text-xs text-destructive">{{ addErrors.title }}</p>
                  </div>
                  <div class="space-y-1.5 sm:col-span-2">
                    <Label for="add-product-type">Category / type *</Label>
                    <Input id="add-product-type" v-model="addForm.type" placeholder="e.g. Burger, Pizza, Drinks"
                      list="add-type-options" :class="addErrors.type ? 'border-destructive' : ''" @input="addErrors.type = ''" />
                    <datalist id="add-type-options">
                      <option v-for="t in productTypes" :key="t.name" :value="t.name" />
                    </datalist>
                    <div v-if="productTypes.length" class="flex flex-wrap gap-1.5">
                      <button v-for="t in productTypes.slice(0, 8)" :key="t.name" type="button"
                        class="rounded-full border px-2.5 py-0.5 text-xs transition"
                        :class="addForm.type === t.name ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted'"
                        @click="addForm.type = t.name; addErrors.type = ''">{{ t.name }}</button>
                    </div>
                    <p v-if="addErrors.type" class="text-xs text-destructive">{{ addErrors.type }}</p>
                  </div>
                  <div class="space-y-1.5 sm:col-span-2">
                    <Label for="add-description">Description *</Label>
                    <Textarea id="add-description" v-model="addForm.description" rows="3"
                      placeholder="What's in it, portion size, spice level…"
                      :class="addErrors.description ? 'border-destructive' : ''" @input="addErrors.description = ''" />
                    <p v-if="addErrors.description" class="text-xs text-destructive">{{ addErrors.description }}</p>
                  </div>
                </div>
              </section>

              <Separator />

              <!-- Pricing & discount -->
              <section class="space-y-4">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price & discount</h4>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="space-y-1.5">
                    <Label for="add-price">Price *</Label>
                    <div class="relative">
                      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs</span>
                      <Input id="add-price" v-model="addForm.price" type="number" min="0" step="1" placeholder="0" class="pl-10"
                        :class="addErrors.price ? 'border-destructive' : ''" @input="addErrors.price = ''" />
                    </div>
                    <p v-if="addErrors.price" class="text-xs text-destructive">{{ addErrors.price }}</p>
                  </div>

                  <div class="space-y-1.5">
                    <Label for="add-discount">Discount (optional)</Label>
                    <div class="flex">
                      <div class="flex shrink-0 rounded-l-md border border-r-0 bg-muted p-0.5">
                        <button type="button" class="rounded px-2.5 text-sm font-medium"
                          :class="addDiscountType === 'percentage' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
                          @click="addDiscountType = 'percentage'; addErrors.discount = ''">%</button>
                        <button type="button" class="rounded px-2.5 text-sm font-medium"
                          :class="addDiscountType === 'flat' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
                          @click="addDiscountType = 'flat'; addErrors.discount = ''">Rs</button>
                      </div>
                      <Input id="add-discount" v-model="addDiscount" type="number" min="0"
                        :max="addDiscountType === 'percentage' ? 100 : undefined" placeholder="0"
                        class="rounded-l-none" :class="addErrors.discount ? 'border-destructive' : ''"
                        @input="addErrors.discount = ''" />
                    </div>
                    <p v-if="addErrors.discount" class="text-xs text-destructive">{{ addErrors.discount }}</p>
                    <p v-else class="text-xs text-muted-foreground">Leave 0 for no discount</p>
                  </div>
                </div>

                <div v-if="Number(addForm.price) > 0" class="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3 text-sm">
                  <span class="text-muted-foreground">Customer pays</span>
                  <span class="font-bold">
                    Rs {{ formatPrice(addFinalPrice) }}
                    <span v-if="addFinalPrice < Number(addForm.price)" class="ml-1 text-xs font-medium text-emerald-600">
                      saves Rs {{ formatPrice(Number(addForm.price) - addFinalPrice) }}
                    </span>
                  </span>
                </div>
              </section>

              <!-- Sizes / extras -->
              <template v-if="isGroceryProvider || isFoodProvider">
                <Separator />
                <section class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {{ isGroceryProvider ? 'Sizes / variants' : 'Extra items' }}
                      </h4>
                      <p class="text-xs text-muted-foreground">
                        {{ isGroceryProvider ? 'Each size has its own full price.' : 'Add-ons charged on top of the price.' }}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" @click="isGroceryProvider ? addSize() : addExtra()">
                      <Plus class="h-4 w-4 mr-1" /> {{ isGroceryProvider ? 'Add size' : 'Add extra' }}
                    </Button>
                  </div>

                  <div v-for="(row, index) in (isGroceryProvider ? addForm.sizes : addForm.extras)" :key="index"
                    class="flex items-center gap-2">
                    <Input v-model="row.name" :placeholder="isGroceryProvider ? 'e.g. 1 KG, Large' : 'e.g. Extra Cheese'" class="flex-1" />
                    <div class="relative w-32">
                      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {{ isGroceryProvider ? 'Rs' : '+Rs' }}
                      </span>
                      <Input v-model.number="row.price" type="number" min="0" step="1" placeholder="0" class="pl-11" />
                    </div>
                    <Button type="button" variant="ghost" size="icon"
                      class="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                      @click="isGroceryProvider ? removeSize(index) : removeExtra(index)">
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                  <p v-if="!(isGroceryProvider ? addForm.sizes : addForm.extras).length"
                    class="rounded-lg border border-dashed py-3 text-center text-xs text-muted-foreground">
                    {{ isGroceryProvider ? 'No sizes — the single price above is used.' : 'No extra items.' }}
                  </p>
                </section>
              </template>

              <Separator />

              <!-- Publish -->
              <label class="flex items-center justify-between rounded-lg border px-4 py-3">
                <span>
                  <span class="flex items-center gap-2 text-sm font-medium"><Eye class="h-4 w-4" /> Publish now</span>
                  <span class="text-xs text-muted-foreground">Off = save it hidden and show it in the app later.</span>
                </span>
                <Switch :checked="addPublish" @update:checked="(v) => (addPublish = v)" />
              </label>
            </div>
          </div>
        </form>

        <!-- Footer -->
        <div class="flex flex-col-reverse gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" :disabled="addingProduct" @click="showAddDialog = false">Cancel</Button>
          <Button type="submit" form="add-product-form" :disabled="addingProduct">
            <Loader2 v-if="addingProduct" class="w-4 h-4 mr-2 animate-spin" />
            <Plus v-else class="w-4 h-4 mr-2" />
            {{ addingProduct ? 'Adding…' : 'Add product' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="selectedProduct">
      <DialogContent v-if="selectedProduct" class="sm:max-w-3xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader class="border-b px-6 py-4">
          <div class="flex items-center gap-3 pr-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pencil class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <DialogTitle class="truncate">Edit {{ selectedProduct.title || 'product' }}</DialogTitle>
              <DialogDescription>Changes show in the customer app after you save.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="edit-product-form" novalidate class="flex-1 overflow-y-auto" @submit.prevent="submitForm">
          <div class="grid gap-6 p-6 md:grid-cols-[240px_1fr]">
            <!-- ===== Left: image + preview ===== -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label>Product image</Label>
                <label for="edit-product-image"
                  class="group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors"
                  :class="editImagePreview ? 'border-transparent' : 'border-muted-foreground/25 bg-muted/30 hover:border-primary/50'">
                  <img v-if="editImagePreview" :src="editImagePreview" alt="Preview" class="h-full w-full object-cover" />
                  <div v-if="editImagePreview"
                    class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <span class="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-900">
                      <ImageIcon class="h-3.5 w-3.5" /> Change
                    </span>
                  </div>
                  <div v-else class="flex flex-col items-center text-muted-foreground">
                    <ImageIcon class="mb-2 h-8 w-8" />
                    <span class="text-sm font-medium text-primary">Upload image</span>
                  </div>
                </label>
                <input id="edit-product-image" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
                <p v-if="imageError" class="text-xs text-destructive">{{ imageError }}</p>
                <p v-else-if="form.image" class="text-xs text-muted-foreground">New image — uploads when you save.</p>
              </div>

              <!-- Customer preview -->
              <div class="rounded-xl border p-3">
                <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer sees</p>
                <p class="truncate text-sm font-semibold">{{ form.title || 'Product name' }}</p>
                <div class="mt-1 flex items-baseline gap-2">
                  <span class="text-lg font-bold">Rs {{ formatPrice(editFinalPrice) }}</span>
                  <span v-if="editFinalPrice < Number(form.price)" class="text-xs text-muted-foreground line-through">
                    Rs {{ formatPrice(form.price) }}
                  </span>
                </div>
                <span v-if="Number(discount) > 0"
                  class="mt-1 inline-block rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {{ discountType === 'flat' ? `Rs ${formatPrice(discount)} OFF` : `${discount}% OFF` }}
                </span>
                <p class="mt-2 text-xs" :class="isLive(selectedProduct) ? 'text-emerald-600' : 'text-amber-600'">
                  {{ isLive(selectedProduct) ? '● Live — customers can order' : !selectedProduct.is_active ? '● Hidden from the app' : '● Out of stock' }}
                </p>
              </div>
            </div>

            <!-- ===== Right: fields ===== -->
            <div class="space-y-6">
              <!-- Basic info -->
              <section class="space-y-4">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Basic info</h4>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="space-y-1.5 sm:col-span-2">
                    <Label for="edit-title">Name *</Label>
                    <Input id="edit-title" v-model="form.title" placeholder="e.g. Zinger Burger"
                      :class="editErrors.title ? 'border-destructive' : ''" @input="editErrors.title = ''" />
                    <p v-if="editErrors.title" class="text-xs text-destructive">{{ editErrors.title }}</p>
                  </div>
                  <div class="space-y-1.5 sm:col-span-2">
                    <Label for="edit-type">Category / type</Label>
                    <Input id="edit-type" v-model="form.type" placeholder="e.g. Burger, Pizza, Drinks" list="edit-type-options" />
                    <datalist id="edit-type-options">
                      <option v-for="t in productTypes" :key="t.name" :value="t.name" />
                    </datalist>
                  </div>
                  <div class="space-y-1.5 sm:col-span-2">
                    <Label for="edit-description">Description</Label>
                    <Textarea id="edit-description" v-model="form.description" rows="3"
                      placeholder="What's in it, portion size, spice level…" />
                  </div>
                </div>
              </section>

              <Separator />

              <!-- Pricing & discount -->
              <section class="space-y-4">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price & discount</h4>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div class="space-y-1.5">
                    <Label for="edit-price">Price *</Label>
                    <div class="relative">
                      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rs</span>
                      <Input id="edit-price" v-model="form.price" type="number" min="0" step="1" placeholder="0" class="pl-10"
                        :class="editErrors.price ? 'border-destructive' : ''" @input="editErrors.price = ''" />
                    </div>
                    <p v-if="editErrors.price" class="text-xs text-destructive">{{ editErrors.price }}</p>
                  </div>

                  <div class="space-y-1.5">
                    <Label for="edit-discount">Discount</Label>
                    <div class="flex">
                      <div class="flex shrink-0 rounded-l-md border border-r-0 bg-muted p-0.5">
                        <button type="button" class="rounded px-2.5 text-sm font-medium"
                          :class="discountType === 'percentage' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
                          @click="discountType = 'percentage'; editErrors.discount = ''">%</button>
                        <button type="button" class="rounded px-2.5 text-sm font-medium"
                          :class="discountType === 'flat' ? 'bg-background shadow-sm' : 'text-muted-foreground'"
                          @click="discountType = 'flat'; editErrors.discount = ''">Rs</button>
                      </div>
                      <Input id="edit-discount" v-model="discount" type="number" min="0"
                        :max="discountType === 'percentage' ? 100 : undefined" placeholder="0"
                        class="rounded-l-none" :class="editErrors.discount ? 'border-destructive' : ''"
                        @input="editErrors.discount = ''" />
                    </div>
                    <p v-if="editErrors.discount" class="text-xs text-destructive">{{ editErrors.discount }}</p>
                    <p v-else class="text-xs text-muted-foreground">0 = no discount</p>
                  </div>
                </div>

                <div class="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3 text-sm">
                  <span class="text-muted-foreground">Customer pays</span>
                  <span class="font-bold">
                    Rs {{ formatPrice(editFinalPrice) }}
                    <span v-if="editFinalPrice < Number(form.price)" class="ml-1 text-xs font-medium text-emerald-600">
                      saves Rs {{ formatPrice(Number(form.price) - editFinalPrice) }}
                    </span>
                  </span>
                </div>
              </section>

              <!-- Sizes / extras -->
              <template v-if="isGroceryProvider || isFoodProvider">
                <Separator />
                <section class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {{ isGroceryProvider ? 'Sizes / variants' : 'Extra items' }}
                      </h4>
                      <p class="text-xs text-muted-foreground">
                        {{ isGroceryProvider ? 'Each size has its own full price.' : 'Add-ons charged on top of the price.' }}
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm"
                      @click="isGroceryProvider ? addEditSize() : addEditExtra()">
                      <Plus class="h-4 w-4 mr-1" /> {{ isGroceryProvider ? 'Add size' : 'Add extra' }}
                    </Button>
                  </div>

                  <div v-for="(row, index) in (isGroceryProvider ? form.sizes : form.extras)" :key="index"
                    class="flex items-center gap-2">
                    <Input v-model="row.name" :placeholder="isGroceryProvider ? 'e.g. 1 KG, Large' : 'e.g. Extra Cheese'" class="flex-1" />
                    <div class="relative w-32">
                      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {{ isGroceryProvider ? 'Rs' : '+Rs' }}
                      </span>
                      <Input v-model.number="row.price" type="number" min="0" step="1" placeholder="0" class="pl-11" />
                    </div>
                    <Button type="button" variant="ghost" size="icon"
                      class="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                      @click="isGroceryProvider ? removeEditSize(index) : removeEditExtra(index)">
                      <X class="h-4 w-4" />
                    </Button>
                  </div>
                  <p v-if="!(isGroceryProvider ? form.sizes : form.extras).length"
                    class="rounded-lg border border-dashed py-3 text-center text-xs text-muted-foreground">
                    {{ isGroceryProvider ? 'No sizes — the single price above is used.' : 'No extra items.' }}
                  </p>
                </section>
              </template>

              <Separator />

              <!-- Visibility -->
              <section class="space-y-2">
                <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visibility</h4>
                <label class="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span>
                    <span class="flex items-center gap-2 text-sm font-medium"><PackageCheck class="h-4 w-4" /> In stock</span>
                    <span class="text-xs text-muted-foreground">Turn off when you run out — customers can't order it.</span>
                  </span>
                  <Switch :checked="!!selectedProduct.status" @update:checked="() => handleStatusToggle(selectedProduct)" />
                </label>
                <label class="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span>
                    <span class="flex items-center gap-2 text-sm font-medium"><Eye class="h-4 w-4" /> Show in app</span>
                    <span class="text-xs text-muted-foreground">Hide it from your menu without deleting it.</span>
                  </span>
                  <Switch :checked="!!selectedProduct.is_active" @update:checked="() => handleActiveToggle(selectedProduct)" />
                </label>
                <p class="text-xs text-muted-foreground">Visibility changes save immediately.</p>
              </section>
            </div>
          </div>
        </form>

        <!-- Footer -->
        <div class="flex flex-col-reverse gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row sm:items-center">
          <Button type="button" variant="ghost" class="text-destructive hover:text-destructive sm:mr-auto"
            :disabled="savingEdit" @click="confirmDelete(selectedProduct.id || selectedProduct._id)">
            <Trash2 class="w-4 h-4 mr-1.5" /> Delete
          </Button>
          <Button type="button" variant="outline" :disabled="savingEdit" @click="closeForm">Cancel</Button>
          <Button type="submit" form="edit-product-form" :disabled="savingEdit">
            <Loader2 v-if="savingEdit" class="w-4 h-4 mr-2 animate-spin" />
            <Save v-else class="w-4 h-4 mr-2" />
            {{ savingEdit ? 'Saving…' : 'Save changes' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { productApi } from "@/api/modules/product.api";
import { businessApi } from "@/api/modules/business.api";
import { API_BASE_URL } from "@/config/api";
import { computed, ref, onMounted, watch, onUnmounted } from "vue";
import { useProductStore } from "../../store/productStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import debounce from "lodash/debounce";
import PageHeader from "@/components/dashboard/PageHeader.vue";
import EmptyState from "@/components/dashboard/EmptyState.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import {
  RefreshCw, Plus, Pencil, X, Search, Save, Percent, Package, Loader2, Trash2,
  CheckCircle2, EyeOff, ArrowDownUp, ChevronDown, Check, Image as ImageIcon,
  LayoutGrid, List, PackageCheck, Eye,
} from "lucide-vue-next";

const router = useRouter();
const productStore = useProductStore();

const productImageUrl = (product) => {
  const image = product?.image || product?.image_url;
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;

  let path = String(image).replace(/^\/be\/uploads\//, "/uploads/");
  path = path.replace(/^\/uploads\/uploads\//, "/uploads/");
  if (!path.startsWith("/")) path = `/uploads/${path}`;
  return `${API_BASE_URL}${path}`;
};

const selectedProduct = ref(null);
const providerType = ref("");
const isFoodProvider = computed(() => providerType.value === "food");
const isGroceryProvider = computed(() => providerType.value === "grocery");
const imageError = ref("");
const editImagePreview = ref("");
const form = ref({
  title: "",
  price: "",
  description: "",
  type: "",
  image: null,
  sizes: [],
  extras: [],
});
const discount = ref(0);
const discountType = ref("percentage");
const savingEdit = ref(false);
const editErrors = ref({});
const showConfirmModal = ref(false);
const confirmDeleteId = ref(null);
const searchQuery = ref("");
const loadMoreTrigger = ref(null);
const isLoading = ref(true);
const currentPage = ref(1);
const sortBy = ref("newest");

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "price_high", label: "Price: high → low" },
  { value: "price_low", label: "Price: low → high" },
  { value: "discounted", label: "Discounted first" },
];

const activeSort = computed(
  () => sortOptions.find((o) => o.value === sortBy.value) || sortOptions[0]
);

// A product shows in the customer app only when it's both visible and in stock.
const isLive = (p) => !!p.is_active && !!p.status;
const liveBadge = (p) =>
  !p.is_active
    ? { label: "Hidden", class: "bg-slate-800/80 text-white" }
    : !p.status
      ? { label: "Out of stock", class: "bg-amber-500 text-white" }
      : { label: "Live", class: "bg-emerald-500 text-white" };

const finalPrice = (p) => {
  if (typeof p.final_price === "number") return p.final_price;
  const price = Number(p.price) || 0;
  const d = Number(p.discount) || 0;
  if (!d) return price;
  return Math.max(0, p.discount_type === "flat" ? price - d : price - (price * d) / 100);
};
const formatPrice = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const discountLabel = (p) => (p.discount_type === "flat" ? `Rs ${formatPrice(p.discount)} OFF` : `${p.discount}% OFF`);
// Descriptions may hold HTML from the rich editor — show plain text on cards.
const plainText = (html) => String(html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// Summary counts for the stat cards.
const stats = computed(() => {
  const list = productStore.currentProducts || [];
  return {
    total: list.length,
    live: list.filter(isLive).length,
    hidden: list.filter((p) => !isLive(p)).length,
    discounted: list.filter((p) => Number(p.discount) > 0).length,
  };
});

// ---- Filters (client-side on the loaded products) ----
const statusFilter = ref("all");
const typeFilter = ref("");
const VIEW_KEY = "products_view_mode";
const viewMode = ref((() => {
  try { return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid"; } catch { return "grid"; }
})());
const setView = (mode) => {
  viewMode.value = mode;
  try { localStorage.setItem(VIEW_KEY, mode); } catch { /* storage unavailable */ }
};

const statFilters = computed(() => [
  { key: "all", title: "All products", value: stats.value.total, icon: Package, description: "in your menu" },
  { key: "live", title: "Live in app", value: stats.value.live, icon: CheckCircle2, description: "customers can order" },
  { key: "discount", title: "On discount", value: stats.value.discounted, icon: Percent, description: "running offers" },
  { key: "hidden", title: "Hidden / out of stock", value: stats.value.hidden, icon: EyeOff, description: "not orderable" },
]);

const productTypes = computed(() => {
  const counts = {};
  for (const p of productStore.currentProducts || []) {
    const t = String(p.type || "").trim();
    if (t) counts[t] = (counts[t] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
});

const clearFilters = () => {
  statusFilter.value = "all";
  typeFilter.value = "";
  searchQuery.value = "";
};

// Client-side sort of the already-loaded products (does not affect paging).
const sortedProducts = computed(() => {
  const list = [...(productStore.currentProducts || [])];
  const price = (p) => Number(p.price) || 0;
  return list.sort((a, b) => {
    switch (sortBy.value) {
      case "name_asc":
        return String(a.title || "").localeCompare(String(b.title || ""));
      case "price_high":
        return price(b) - price(a);
      case "price_low":
        return price(a) - price(b);
      case "discounted":
        return (Number(b.discount) > 0 ? 1 : 0) - (Number(a.discount) > 0 ? 1 : 0);
      case "newest":
      default:
        return 0; // keep backend order (already newest-first)
    }
  });
});

const visibleProducts = computed(() =>
  sortedProducts.value.filter((p) => {
    if (statusFilter.value === "live" && !isLive(p)) return false;
    if (statusFilter.value === "hidden" && isLive(p)) return false;
    if (statusFilter.value === "discount" && !(Number(p.discount) > 0)) return false;
    if (typeFilter.value && String(p.type || "").trim() !== typeFilter.value) return false;
    return true;
  })
);

// Price the customer pays with the discount currently typed in the edit form.
const editFinalPrice = computed(() => {
  const price = Number(form.value.price) || 0;
  const d = Number(discount.value) || 0;
  if (!d) return price;
  return Math.max(0, discountType.value === "flat" ? price - d : price - (price * d) / 100);
});

const showAddDialog = ref(false);
const addingProduct = ref(false);
const addForm = ref({ title: "", description: "", price: "", type: "", image: null, sizes: [], extras: [] });
const addImageError = ref("");
const addImagePreview = ref("");
const addErrors = ref({});
const addDiscount = ref(0);
const addDiscountType = ref("percentage");
const addPublish = ref(true);
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // backend limit

const addFinalPrice = computed(() => {
  const price = Number(addForm.value.price) || 0;
  const d = Number(addDiscount.value) || 0;
  if (!d) return price;
  return Math.max(0, addDiscountType.value === "flat" ? price - d : price - (price * d) / 100);
});

const resetAddForm = () => {
  addForm.value = { title: "", description: "", price: "", type: "", image: null, sizes: [], extras: [] };
  addImageError.value = "";
  addImagePreview.value = "";
  addErrors.value = {};
  addDiscount.value = 0;
  addDiscountType.value = "percentage";
  addPublish.value = true;
};

const loadProviderType = async () => {
  try {
    const response = await businessApi.getOwn();
    providerType.value = String(response?.data?.data?.type || "").trim().toLowerCase();
  } catch (error) {
    providerType.value = "";
    console.error("Error loading provider type:", error);
    toast.error("Unable to load provider type. Product options are hidden, but products can still be managed.");
  }
};

const setupIntersectionObserver = () => {
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !productStore.isLoading &&
        currentPage.value < productStore.totalPages
      ) {
        loadMoreProducts();
      }
    });
  }, options);

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }

  return observer;
};

const refreshProducts = async () => {
  currentPage.value = 1;
  isLoading.value = true;
  try {
    await productStore.getRestaurantProducts(searchQuery.value, 1);
  } catch (error) {
    toast.error("Failed to refresh products");
  } finally {
    isLoading.value = false;
  }
};

const handleStatusToggle = async (product) => {
  try {
    const newStatus = product.status ? false : true;
    await productStore.updateProductStatus(product.id || product._id, newStatus);
    product.status = newStatus;
    toast.success(newStatus ? "Marked in stock" : "Marked out of stock");
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error("Failed to update product status");
  }
};

const handleActiveToggle = async (product) => {
  try {
    await productStore.updateProductActive(product.id || product._id);
    // Optimistically flip local card state
    product.is_active = product.is_active ? false : true;
    toast.success(product.is_active ? "Now visible in the app" : "Hidden from the app");
  } catch (error) {
    console.error("Error updating active status:", error);
    toast.error("Failed to update active status");
  }
};

const loadMoreProducts = async () => {
  if (!productStore.isLoading) {
    currentPage.value += 1;
    try {
      await productStore.getRestaurantProducts(
        searchQuery.value,
        currentPage.value
      );
    } catch (error) {
      console.error("Error loading more products:", error);
      toast.error("Failed to load more products");
      currentPage.value -= 1;
    }
  }
};

const handleFileChange = (e) => {
  imageError.value = "";
  const file = e.target.files[0] || null;
  form.value.image = file;
  if (file) editImagePreview.value = URL.createObjectURL(file);
};

const searchProducts = async () => {
  isLoading.value = true;
  currentPage.value = 1;
  try {
    await productStore.getRestaurantProducts(searchQuery.value);
  } catch (error) {
    console.error("Error searching products:", error);
    toast.error("Failed to search products.");
  } finally {
    isLoading.value = false;
  }
};

const debounceSearch = debounce(() => {
  searchProducts();
}, 300);

watch(searchQuery, () => {
  debounceSearch();
});

const closeForm = () => {
  selectedProduct.value = null;
  form.value = {
    title: "",
    price: "",
    description: "",
    type: "",
    image: null,
    sizes: [],
    extras: [],
  };
  imageError.value = "";
  editImagePreview.value = "";
  discount.value = 0;
  router.push({ path: router.currentRoute.value.fullPath });
};

const openFormForUpdate = (product) => {
  selectedProduct.value = product;
  loadProductDetails();
};

const loadProductDetails = () => {
  form.value = {
    title: selectedProduct.value.title,
    price: selectedProduct.value.price,
    description: selectedProduct.value.description,
    type: selectedProduct.value.type,
    image: null,
    sizes: (selectedProduct.value.sizes || []).map((size) => ({
      name: size.name || "",
      price: size.price ?? "",
    })),
    extras: (selectedProduct.value.extras || []).map((extra) => ({
      name: extra.name || "",
      price: extra.price ?? "",
    })),
  };
  discount.value = selectedProduct.value.discount || 0;
  discountType.value = selectedProduct.value.discount_type || "percentage";
  editErrors.value = {};
  // Show the product's current image until the user picks a new one.
  editImagePreview.value = productImageUrl(selectedProduct.value);
};

const addEditSize = () => {
  form.value.sizes.push({ name: "", price: "" });
};

const removeEditSize = (index) => {
  form.value.sizes.splice(index, 1);
};

const addEditExtra = () => {
  form.value.extras.push({ name: "", price: "" });
};

const removeEditExtra = (index) => {
  form.value.extras.splice(index, 1);
};

const cleanOptionRows = (rows, label) => {
  const cleaned = [];
  for (const row of rows) {
    const name = String(row.name || "").trim();
    const hasPrice = row.price !== "" && row.price !== null && row.price !== undefined;
    if (!name && !hasPrice) continue;
    if (!name || !hasPrice) {
      toast.error(`Please enter both name and price for every ${label}.`);
      return null;
    }

    const price = Number(row.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error(`Every ${label} price must be a finite, nonnegative number.`);
      return null;
    }
    cleaned.push({ name, price });
  }
  return cleaned;
};

const validateEdit = () => {
  const next = {};
  if (!String(form.value.title || "").trim()) next.title = "Name is required";
  const price = Number(form.value.price);
  if (form.value.price === "" || !Number.isFinite(price) || price <= 0) next.price = "Enter a price above 0";
  const d = Number(discount.value) || 0;
  if (d < 0) next.discount = "Discount can't be negative";
  else if (discountType.value === "percentage" && d > 100) next.discount = "Percentage must be 0–100";
  else if (discountType.value === "flat" && Number.isFinite(price) && d >= price && d > 0)
    next.discount = "Flat discount must be less than the price";
  editErrors.value = next;
  return Object.keys(next).length === 0;
};

const submitForm = async () => {
  if (imageError.value) {
    toast.error("Please fix the image error first.");
    return;
  }
  if (!validateEdit()) return;

  const sizes = isGroceryProvider.value ? cleanOptionRows(form.value.sizes, "size") : [];
  if (sizes === null) return;
  const extras = isFoodProvider.value ? cleanOptionRows(form.value.extras, "extra item") : [];
  if (extras === null) return;

  const product = selectedProduct.value;
  const productId = product.id || product._id;
  const formData = new FormData();
  formData.append("title", String(form.value.title).trim());
  formData.append("description", form.value.description || "");
  formData.append("price", String(form.value.price));
  formData.append("type", form.value.type || "");
  formData.append("sizes", JSON.stringify(sizes));
  formData.append("extras", JSON.stringify(extras));
  if (form.value.image) formData.append("image", form.value.image);
  formData.append("_method", "PUT");

  const newDiscount = Number(discount.value) || 0;
  const discountChanged =
    newDiscount !== (Number(product.discount) || 0) ||
    (newDiscount > 0 && discountType.value !== (product.discount_type || "percentage"));

  savingEdit.value = true;
  try {
    await productStore.updateProduct(formData, productId);
    if (discountChanged) {
      await productStore.applyDiscount(productId, newDiscount, discountType.value);
    }
    closeForm();
    toast.success("Product saved");
    await productStore.getRestaurantProducts();
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error(error?.response?.data?.message || "Failed to save product.");
  } finally {
    savingEdit.value = false;
  }
};

const applyDiscountToProduct = async () => {
  if (
    discountType.value === "percentage" &&
    (discount.value < 0 || discount.value > 100)
  ) {
    toast.error("Percentage discount must be between 0 and 100");
    return;
  }

  if (discountType.value === "flat" && discount.value < 0) {
    toast.error("Flat discount cannot be negative");
    return;
  }

  try {
    await productStore.applyDiscount(
      selectedProduct.value.id,
      discount.value,
      discountType.value
    );
    toast.success("Discount applied successfully!");
    selectedProduct.value.discount = discount.value;
    selectedProduct.value.discount_type = discountType.value;
  } catch (error) {
    console.error("Error applying discount:", error);
    toast.error("Failed to apply discount.");
  }
};

const confirmDelete = (productId) => {
  confirmDeleteId.value = productId;
  showConfirmModal.value = true;
};

const cancelDelete = () => {
  showConfirmModal.value = false;
  confirmDeleteId.value = null;
};

const deleteProduct = async (productId) => {
  await productStore.deleteProduct(productId);
  showConfirmModal.value = false;
  confirmDeleteId.value = null;
  const open = selectedProduct.value;
  if (open && (open.id || open._id) === productId) closeForm();
  toast.success("Product deleted successfully!");
};

const handleAddFileChange = (e) => {
  addImageError.value = "";
  const file = e.target.files[0] || null;
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    addImageError.value = "Please choose an image file.";
    return;
  }
  if (file.size > MAX_IMAGE_SIZE) {
    addImageError.value = "Image must be smaller than 2MB.";
    return;
  }
  addForm.value.image = file;
  addImagePreview.value = URL.createObjectURL(file);
};

const addSize = () => {
  addForm.value.sizes.push({ name: "", price: "" });
};

const removeSize = (index) => {
  addForm.value.sizes.splice(index, 1);
};

const addExtra = () => {
  addForm.value.extras.push({ name: "", price: "" });
};

const removeExtra = (index) => {
  addForm.value.extras.splice(index, 1);
};

const validateAdd = () => {
  const f = addForm.value;
  const next = {};
  if (!f.image) next.image = "Product image is required";
  if (!String(f.title || "").trim()) next.title = "Name is required";
  if (!String(f.type || "").trim()) next.type = "Category / type is required";
  if (!String(f.description || "").trim()) next.description = "Description is required";
  const price = Number(f.price);
  if (f.price === "" || !Number.isFinite(price) || price <= 0) next.price = "Enter a price above 0";
  const d = Number(addDiscount.value) || 0;
  if (d < 0) next.discount = "Discount can't be negative";
  else if (addDiscountType.value === "percentage" && d > 100) next.discount = "Percentage must be 0–100";
  else if (addDiscountType.value === "flat" && d > 0 && Number.isFinite(price) && d >= price)
    next.discount = "Flat discount must be less than the price";
  addErrors.value = next;
  if (next.image) addImageError.value = next.image;
  return Object.keys(next).length === 0;
};

const handleAddProduct = async () => {
  if (!validateAdd()) return;

  const sizes = isGroceryProvider.value ? cleanOptionRows(addForm.value.sizes, "size") : [];
  if (sizes === null) return;
  const extras = isFoodProvider.value ? cleanOptionRows(addForm.value.extras, "extra item") : [];
  if (extras === null) return;

  addingProduct.value = true;
  try {
    const formData = new FormData();
    formData.append("title", String(addForm.value.title).trim());
    formData.append("description", addForm.value.description);
    formData.append("price", addForm.value.price);
    formData.append("type", String(addForm.value.type).trim());
    formData.append("image", addForm.value.image);
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("extras", JSON.stringify(extras));

    const response = await productApi.addProduct(formData);
    const created = response?.data?.data;
    const newId = created?._id || created?.id;

    // Extras chosen in the form that the create endpoint doesn't take.
    const followUps = [];
    if (newId && Number(addDiscount.value) > 0) {
      followUps.push(productStore.applyDiscount(newId, Number(addDiscount.value), addDiscountType.value));
    }
    if (newId && !addPublish.value) {
      followUps.push(productStore.updateProductActive(newId));
    }
    const results = await Promise.allSettled(followUps);
    if (results.some((r) => r.status === "rejected")) {
      toast.warning("Product added, but the discount / visibility couldn't be set. Edit it to try again.");
    } else {
      toast.success(addPublish.value ? "Product added and live" : "Product added (hidden)");
    }

    resetAddForm();
    showAddDialog.value = false;
    await productStore.getRestaurantProducts();
  } catch (error) {
    console.error(error);
    toast.error(error?.response?.data?.message || "Failed to add product.");
  } finally {
    addingProduct.value = false;
  }
};

// Fresh form every time the dialog opens.
watch(showAddDialog, (open) => {
  if (open) resetAddForm();
});

onMounted(async () => {
  currentPage.value = 1;
  loadProviderType();
  try {
    await productStore.getRestaurantProducts();
    const observer = setupIntersectionObserver();

    onUnmounted(() => {
      if (observer && loadMoreTrigger.value) {
        observer.unobserve(loadMoreTrigger.value);
      }
    });
  } catch (error) {
    console.error("Error loading products:", error);
    toast.error("Failed to load products");
  }
});
</script>

<style scoped>
.prose {
  max-width: none;
  width: 100%;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.prose th,
.prose td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.prose th {
  background-color: #f9fafb;
  font-weight: 600;
}

.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

.prose>*+* {
  margin-top: 1rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
