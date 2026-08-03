<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
  >
    <div
      class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col"
    >
      <div class="p-6 overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">Edit Product</h2>
          <button
            @click="$emit('close')"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          @submit.prevent="handleSubmit"
          enctype="multipart/form-data"
          class="space-y-6"
        >
          <div>
            <label for="name" class="text-sm font-medium text-gray-700"
              >Product Name</label
            >
            <input
              v-model="form.title"
              type="text"
              id="name"
              class="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700">Description</label>
            <div class="border border-gray-200 rounded-lg mt-1">
              <div class="flex flex-wrap gap-2 p-2 border-b border-gray-200">
                <div class="flex gap-1 border-r pr-2">
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleBold().run()"
                    :class="{ 'bg-gray-200': editor.isActive('bold') }"
                    class="p-1 rounded hover:bg-gray-100"
                  >
                    <Bold class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleItalic().run()"
                    :class="{ 'bg-gray-200': editor.isActive('italic') }"
                    class="p-1 rounded hover:bg-gray-100"
                  >
                    <Italic class="w-5 h-5" />
                  </button>
                </div>

                <div class="flex gap-1 border-r pr-2">
                  <button
                    type="button"
                    @click="insertTable"
                    class="p-1 rounded hover:bg-gray-100"
                    title="Insert Table"
                  >
                    <TableIcon class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().addColumnBefore().run()"
                    class="p-1 rounded hover:bg-gray-100"
                    title="Add Column"
                  >
                    <Columns2Icon class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().addRowBefore().run()"
                    class="p-1 rounded hover:bg-gray-100"
                    title="Add Row"
                  >
                    <Rows2Icon class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().deleteTable().run()"
                    class="p-1 rounded hover:bg-gray-100 text-red-500"
                    title="Delete Table"
                  >
                    <Trash class="w-5 h-5" />
                  </button>
                </div>

                <div class="flex gap-1">
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleBulletList().run()"
                    :class="{ 'bg-gray-200': editor.isActive('bulletList') }"
                    class="p-1 rounded hover:bg-gray-100"
                  >
                    <List class="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    @click="editor.chain().focus().toggleOrderedList().run()"
                    :class="{ 'bg-gray-200': editor.isActive('orderedList') }"
                    class="p-1 rounded hover:bg-gray-100"
                  >
                    <ListOrdered class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <editor-content
                :editor="editor"
                class="prose max-w-none p-4 min-h-[200px]"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="type" class="text-sm font-medium text-gray-700"
                >Type</label
              >
              <input
                v-model="form.type"
                type="text"
                id="type"
                class="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label for="price" class="text-sm font-medium text-gray-700"
                >Price</label
              >
              <input
                v-model="form.price"
                type="number"
                id="price"
                step="0.01"
                class="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700"
              >Product Image</label
            >
            <div
              class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg relative"
            >
              <div class="space-y-1 text-center" v-if="!imagePreview">
                <img
                  v-if="product.image"
                  :src="product.image"
                  alt="Current product image"
                  class="max-h-40 mx-auto object-contain mb-4"
                />
                <div class="flex text-sm text-gray-600">
                  <label
                    class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Upload new image</span>
                    <input
                      @change="handleFileChange"
                      type="file"
                      class="sr-only"
                      accept="image/*"
                    />
                  </label>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF</p>
              </div>
              <div v-else class="relative w-full">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="max-h-40 mx-auto object-contain"
                />
                <button
                  @click="clearImage"
                  type="button"
                  class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p v-if="imageError" class="mt-2 text-sm text-red-600">
              {{ imageError }}
            </p>
          </div>

          <div class="sticky bottom-0 bg-white pt-4 border-t mt-6">
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { useProductStore } from "../store/productStore";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Table as TableIcon,
  Trash,
  Rows2Icon,
  Columns2Icon,
} from "lucide-vue-next";
import { toast } from "vue3-toastify";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "save"]);
const productStore = useProductStore();
const imageError = ref("");
const imagePreview = ref("");

const editor = new Editor({
  extensions: [
    StarterKit,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  content: props.product.description,
  autofocus: true,
});

const insertTable = () => {
  editor
    .chain()
    .focus()
    .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
    .run();
};

const form = ref({
  title: props.product.title,
  type: props.product.type,
  price: props.product.price,
  image: null,
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageError.value = "";
    form.value.image = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const clearImage = () => {
  form.value.image = null;
  imagePreview.value = "";
  imageError.value = "";
};

const handleSubmit = async () => {
  if (imageError.value) {
    toast.error("Please fix the image error before submitting.");
    return;
  }

  const formData = new FormData();
  formData.append("title", form.value.title);
  formData.append("description", editor.getHTML());
  formData.append("type", form.value.type);
  formData.append("price", form.value.price);
  formData.append("_method", "PUT");

  if (form.value.image) {
    formData.append("image", form.value.image);
  }

  try {
    await productStore.updateProduct(formData, props.product.id);
    toast.success("Product updated successfully!");
    emit("save");
    emit("close");
  } catch (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update the product.");
  }
};

onBeforeUnmount(() => {
  editor.destroy();
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

<style>
.ProseMirror {
  min-height: 100px;
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.ProseMirror td,
.ProseMirror th {
  border: 2px solid #ced4da;
  box-sizing: border-box;
  min-width: 1em;
  padding: 3px 5px;
  position: relative;
  vertical-align: top;
}

.ProseMirror th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.ProseMirror .selectedCell:after {
  background: rgba(200, 200, 255, 0.4);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}
</style>
