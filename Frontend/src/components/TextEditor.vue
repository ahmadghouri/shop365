<template>
  <div>
    <label class="text-sm font-medium text-gray-700">Description</label>
    <div class="border border-gray-200 rounded-lg mt-1">
      <!-- Editor Menu -->
      <div class="flex flex-wrap gap-2 p-2 border-b border-gray-200">
        <!-- Text Formatting -->
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
          <button
            type="button"
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="{
              'bg-gray-200': editor.isActive('heading', { level: 2 }),
            }"
            class="p-1 rounded hover:bg-gray-100"
          >
            <Heading class="w-5 h-5" />
          </button>
        </div>

        <!-- Table Controls -->
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

        <!-- Lists -->
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
</template>

<script setup></script>

<style lang="scss" scoped></style>
