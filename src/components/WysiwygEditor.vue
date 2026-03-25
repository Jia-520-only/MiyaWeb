<template>
  <div class="wysiwyg-editor">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800/80 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700">
      <button v-for="tool in tools" :key="tool.name" @click="tool.action()" class="px-2 py-1.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-xs transition-colors" :title="tool.title" :class="{ 'bg-primary-50 dark:bg-primary-900/30 text-primary-600': tool.isActive?.() }">
        <Icon v-if="tool.icon" :name="tool.icon" size="sm" />
        <span v-else>{{ tool.label }}</span>
      </button>
      <div class="flex-grow" />
      <button @click="triggerUpload" class="px-2 py-1.5 bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-xs transition-colors" title="插入图片">
        <Icon name="solar:gallery-add-bold" size="sm" />
      </button>
      <button @click="showImageManager = true" class="px-2 py-1.5 bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-xs transition-colors" title="图片管理器">
        <Icon name="solar:gallery-bold" size="sm" />
      </button>
    </div>

    <!-- Editor -->
    <div class="rounded-b-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <EditorContent :editor="editor" class="wysiwyg-content" />
    </div>

    <!-- Hidden inputs -->
    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />

    <!-- Image Manager Modal (reuse) -->
    <div v-if="showImageManager" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showImageManager = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">图片管理器</h3>
          <button @click="showImageManager = false" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Icon name="solar:close-circle-bold" size="md" />
          </button>
        </div>
        <div class="px-6 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <input v-model="imageSearch" class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-400 dark:text-gray-100" placeholder="搜索图片..." />
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="loadingImages" class="flex items-center justify-center py-12">
            <div class="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div v-else-if="images.length === 0" class="text-center py-12 text-gray-400 text-sm">暂无图片</div>
          <div v-else class="grid grid-cols-4 gap-3">
            <div v-for="img in images" :key="img.id" @click="insertImageFromManager(img)" class="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-400 transition-all aspect-square">
              <img :src="img.thumbUrl || img.url" :alt="img.altText || img.originalName" class="w-full h-full object-cover" loading="lazy" />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Icon name="solar:add-circle-bold" size="lg" class="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p class="text-xs text-white truncate">{{ img.originalName }}</p>
              </div>
            </div>
          </div>
          <div v-if="hasMoreImages" class="text-center py-3">
            <button @click="loadMoreImages" class="text-sm text-primary-500 hover:text-primary-600">加载更多</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, shallowRef, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Icon from '@/components/ui/Icon.vue'
import { uploadAPI } from '@/utils/apiClient'

interface Props {
  modelValue: string
  label?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const imageInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const showImageManager = ref(false)
const images = ref<any[]>([])
const loadingImages = ref(false)
const imageSearch = ref('')
const imagePage = ref(1)
const imageTotalPages = ref(1)

const hasMoreImages = computed(() => imagePage.value < imageTotalPages.value)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false, allowBase64: true }),
    Placeholder.configure({ placeholder: '在此处开始写作...' }),
  ],
  onUpdate: ({ editor: ed }) => {
    const html = ed.getHTML()
    emit('update:modelValue', html)
  },
})

watch(() => props.modelValue, (v) => {
  if (editor.value && v !== editor.value.getHTML()) {
    editor.value.commands.setContent(v || '')
  }
})

onBeforeUnmount(() => { editor.value?.destroy() })

// ─── Toolbar ───
const tools = computed(() => [
  { name: 'bold', icon: 'solar:text-bold-bold', title: '加粗', action: () => editor.value?.chain().focus().toggleBold().run(), isActive: () => editor.value?.isActive('bold') },
  { name: 'italic', icon: 'solar:text-italic-bold', title: '斜体', action: () => editor.value?.chain().focus().toggleItalic().run(), isActive: () => editor.value?.isActive('italic') },
  { name: 'strike', icon: 'solar:text-strikethrough-bold', title: '删除线', action: () => editor.value?.chain().focus().toggleStrike().run(), isActive: () => editor.value?.isActive('strike') },
  { name: 'h2', label: 'H2', title: '标题2', action: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.value?.isActive('heading', { level: 2 }) },
  { name: 'h3', label: 'H3', title: '标题3', action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.value?.isActive('heading', { level: 3 }) },
  { name: 'ul', icon: 'solar:list-bold', title: '无序列表', action: () => editor.value?.chain().focus().toggleBulletList().run(), isActive: () => editor.value?.isActive('bulletList') },
  { name: 'ol', icon: 'solar:list-1-bold', title: '有序列表', action: () => editor.value?.chain().focus().toggleOrderedList().run(), isActive: () => editor.value?.isActive('orderedList') },
  { name: 'quote', icon: 'solar:chat-square-like-bold', title: '引用', action: () => editor.value?.chain().focus().toggleBlockquote().run(), isActive: () => editor.value?.isActive('blockquote') },
  { name: 'code', icon: 'solar:code-bold', title: '行内代码', action: () => editor.value?.chain().focus().toggleCode().run(), isActive: () => editor.value?.isActive('code') },
  { name: 'codeblock', icon: 'solar:programming-bold', title: '代码块', action: () => editor.value?.chain().focus().toggleCodeBlock().run(), isActive: () => editor.value?.isActive('codeBlock') },
  { name: 'hr', label: '—', title: '分割线', action: () => editor.value?.chain().focus().setHorizontalRule().run() },
  { name: 'undo', icon: 'solar:undo-left-bold', title: '撤销', action: () => editor.value?.chain().focus().undo().run() },
  { name: 'redo', icon: 'solar:undo-right-bold', title: '重做', action: () => editor.value?.chain().focus().redo().run() },
])

// ─── Image Upload ───
const triggerUpload = () => imageInput.value?.click()

const uploadAndInsert = async (file: File) => {
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_BASE}/upload/single`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })
    if (!res.ok) throw new Error('上传失败')
    const data = await res.json()
    const url = data.file?.url || `/uploads/${file.name}`
    editor.value?.chain().focus().setImage({ src: url, alt: file.name }).run()
  } catch {
    alert('图片上传失败')
  } finally {
    uploading.value = false
  }
}

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadAndInsert(file)
  if (imageInput.value) imageInput.value.value = ''
}

const insertImageFromManager = (img: any) => {
  editor.value?.chain().focus().setImage({ src: img.url, alt: img.altText || img.originalName || '' }).run()
  showImageManager.value = false
}

// ─── Image Manager ───
const loadImages = async (reset = false) => {
  if (reset) { imagePage.value = 1; images.value = [] }
  loadingImages.value = true
  try {
    const res = await uploadAPI.getFiles({ page: imagePage.value, limit: 16, mimeType: 'image', search: imageSearch.value || undefined })
    images.value = reset ? res.files : [...images.value, ...res.files]
    imageTotalPages.value = res.pagination.totalPages
  } catch {
    try {
      const res = await uploadAPI.getImageGallery({ limit: 50 })
      images.value = res.images; imageTotalPages.value = 1
    } catch { images.value = [] }
  } finally { loadingImages.value = false }
}

const loadMoreImages = () => { imagePage.value++; loadImages() }

watch(showImageManager, (v) => { if (v) loadImages(true) })

let searchTimer: ReturnType<typeof setTimeout>
watch(imageSearch, () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => loadImages(true), 300) })
</script>

<style scoped>
.wysiwyg-content :deep(.tiptap) {
  min-height: 400px;
  padding: 1rem 1.5rem;
  outline: none;
  font-size: 0.875rem;
  line-height: 1.7;
  color: #1f2937;
  background: white;
}

:deep(.dark) .wysiwyg-content .tiptap {
  color: #e5e7eb;
  background: #1f2937;
}

.wysiwyg-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

.wysiwyg-content :deep(.tiptap img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
}

.wysiwyg-content :deep(.tiptap pre) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: monospace;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.wysiwyg-content :deep(.tiptap blockquote) {
  border-left: 4px solid #0d9488;
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: #6b7280;
}

.wysiwyg-content :deep(.tiptap ul),
.wysiwyg-content :deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.wysiwyg-content :deep(.tiptap a) {
  color: #0d9488;
  text-decoration: underline;
}
</style>
