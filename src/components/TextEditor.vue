<template>
  <div class="text-editor-container">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
      <div v-else />
      <div class="flex items-center gap-3">
        <!-- Format Toggle -->
        <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button v-for="f in formats" :key="f.value" @click="setFormat(f.value)" :class="['px-3 py-1 rounded-md text-xs font-medium transition-all', format === f.value ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500']">
            {{ f.label }}
          </button>
        </div>
        <!-- View Toggle (markdown only) -->
        <div v-if="format === 'markdown'" class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button v-for="m in viewModes" :key="m.value" @click="viewMode = m.value" :class="['px-2 py-1 rounded-md text-xs transition-all', viewMode === m.value ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500']" :title="m.label">
            <Icon :name="m.icon" size="xs" />
          </button>
        </div>
        <span class="text-xs text-gray-400">{{ content.length }} 字</span>
      </div>
    </div>

    <!-- WYSIWYG Mode -->
    <WysiwygEditor v-if="format === 'richtext'" :model-value="content" @update:model-value="content = $event; emit('update:modelValue', $event); emit('format-change', 'richtext')" />

    <!-- Non-WYSIWYG Mode -->
    <template v-else>
    <!-- Markdown Toolbar -->
    <div v-if="format === 'markdown'" class="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700 mb-2">
      <button v-for="tool in markdownTools" :key="tool.name" @click="applyTool(tool)" class="px-2 py-1.5 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-xs transition-colors" :title="tool.title">
        <Icon v-if="tool.icon" :name="tool.icon" size="sm" />
        <span v-else>{{ tool.label }}</span>
      </button>
      <div class="flex-grow" />
      <button @click="triggerUpload" class="px-2 py-1.5 bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-xs transition-colors" title="上传图片">
        <Icon name="solar:gallery-add-bold" size="sm" />
      </button>
      <button @click="showImageManager = true" class="px-2 py-1.5 bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg text-xs transition-colors" title="图片管理器">
        <Icon name="solar:gallery-bold" size="sm" />
      </button>
    </div>

    <!-- Action Bar -->
    <div class="flex items-center gap-2 mb-2">
      <button @click="importFile" class="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors" title="导入文件">
        <Icon name="solar:upload-minimalistic-bold" size="xs" />
        导入
      </button>
      <button @click="exportFile" class="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors" title="导出文件">
        <Icon name="solar:download-minimalistic-bold" size="xs" />
        导出
      </button>
    </div>

    <!-- Editor Area -->
    <div class="relative rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Edit Only -->
      <textarea
        v-if="viewMode === 'edit' || format === 'txt'"
        ref="textareaRef"
        v-model="content"
        :rows="rows"
        :placeholder="format === 'markdown' ? mdPlaceholder : txtPlaceholder"
        class="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm leading-relaxed resize-y outline-none"
        :class="format === 'markdown' ? 'font-mono' : 'font-sans'"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @paste="handlePaste"
      />

      <!-- Split View -->
      <div v-else-if="viewMode === 'split'" class="grid grid-cols-2 h-full">
        <textarea
          ref="textareaRef"
          v-model="content"
          :rows="rows"
          :placeholder="mdPlaceholder"
          class="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm leading-relaxed resize-y outline-none border-r border-gray-200 dark:border-gray-700 font-mono"
          @drop.prevent="handleDrop"
          @dragover.prevent
          @paste="handlePaste"
        />
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900 overflow-auto" :style="{ minHeight: `${rows * 1.5}rem` }">
          <div class="markdown-preview prose prose-sm dark:prose-invert max-w-none" v-html="renderedContent" />
        </div>
      </div>

      <!-- Preview Only -->
      <div v-else class="px-6 py-4 bg-gray-50 dark:bg-gray-900 overflow-auto" :style="{ minHeight: `${rows * 1.5}rem` }">
        <div class="markdown-preview prose prose-sm dark:prose-invert max-w-none" v-html="renderedContent" />
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="flex items-center gap-2 mt-2 text-xs text-gray-500">
      <div class="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      上传图片中...
    </div>

    <!-- File Inputs (hidden) -->
    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
    <input ref="fileImportInput" type="file" accept=".md,.markdown,.txt,.text" class="hidden" @change="handleFileImport" />

    <!-- Image Manager Modal -->
    <div v-if="showImageManager" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="showImageManager = false">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col mx-4">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">图片管理器</h3>
          <button @click="showImageManager = false" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Icon name="solar:close-circle-bold" size="md" />
          </button>
        </div>
        <!-- Search -->
        <div class="px-6 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <input v-model="imageSearch" class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-400 dark:text-gray-100" placeholder="搜索图片..." />
        </div>
        <!-- Image Grid -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="loadingImages" class="flex items-center justify-center py-12">
            <div class="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div v-else-if="images.length === 0" class="text-center py-12 text-gray-400 text-sm">
            暂无图片
          </div>
          <div v-else class="grid grid-cols-4 gap-3">
            <div
              v-for="img in images" :key="img.id"
              @click="insertImage(img)"
              class="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-400 transition-all aspect-square"
            >
              <img :src="img.thumbUrl || img.url" :alt="img.altText || img.originalName" class="w-full h-full object-cover" loading="lazy" />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Icon name="solar:add-circle-bold" size="lg" class="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p class="text-xs text-white truncate">{{ img.originalName }}</p>
              </div>
            </div>
          </div>
          <!-- Load More -->
          <div v-if="hasMoreImages" class="text-center py-3">
            <button @click="loadMoreImages" class="text-sm text-primary-500 hover:text-primary-600">加载更多</button>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import WysiwygEditor from '@/components/WysiwygEditor.vue'
import { uploadAPI } from '@/utils/apiClient'

interface Props {
  modelValue: string
  label?: string
  rows?: number
  defaultFormat?: 'markdown' | 'txt'
}

const props = withDefaults(defineProps<Props>(), { rows: 20, defaultFormat: 'markdown' })
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'format-change', f: 'markdown' | 'txt' | 'richtext'): void
}>()

const format = ref<'markdown' | 'txt'>(props.defaultFormat)
const viewMode = ref<'edit' | 'split' | 'preview'>('edit')
const content = ref(props.modelValue)
const uploading = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const fileImportInput = ref<HTMLInputElement | null>(null)

const mdPlaceholder = `# 标题\n\n在这里开始写作...\n\n支持 Markdown 语法、拖拽/粘贴上传图片、工具栏快捷操作。\n可导入 .md/.txt 文件，也可导出为文件。`
const txtPlaceholder = `在这里开始写作...\n\n纯文本格式，适合简单的文本内容。\n可导入 .txt 文件，也可导出为文件。`

const formats = [
  { value: 'markdown' as const, label: 'Markdown' },
  { value: 'richtext' as const, label: '富文本' },
  { value: 'txt' as const, label: 'TXT' }
]

const viewModes = [
  { value: 'edit' as const, label: '编辑', icon: 'solar:pen-bold' },
  { value: 'split' as const, label: '分屏', icon: 'solar:widget-2-bold' },
  { value: 'preview' as const, label: '预览', icon: 'solar:eye-bold' }
]

const markdownTools = [
  { name: 'bold', icon: 'solar:text-bold-bold', title: '加粗', action: { before: '**', after: '**', placeholder: '加粗' } },
  { name: 'italic', icon: 'solar:text-italic-bold', title: '斜体', action: { before: '*', after: '*', placeholder: '斜体' } },
  { name: 'h2', label: 'H2', title: '二级标题', action: { prefix: '## ', placeholder: '标题' } },
  { name: 'h3', label: 'H3', title: '三级标题', action: { prefix: '### ', placeholder: '标题' } },
  { name: 'link', icon: 'solar:link-round-bold', title: '链接', action: { before: '[', after: '](url)', placeholder: '链接文字' } },
  { name: 'image', icon: 'solar:gallery-bold', title: '图片', action: { before: '![', after: '](url)', placeholder: '图片描述' } },
  { name: 'code', icon: 'solar:code-bold', title: '行内代码', action: { before: '`', after: '`', placeholder: 'code' } },
  { name: 'codeblock', icon: 'solar:programming-bold', title: '代码块', action: { prefix: '```\n', suffix: '\n```', placeholder: '代码' } },
  { name: 'quote', icon: 'solar:chat-square-like-bold', title: '引用', action: { prefix: '> ', placeholder: '引用' } },
  { name: 'ul', icon: 'solar:list-bold', title: '无序列表', action: { prefix: '- ', placeholder: '列表项' } },
  { name: 'ol', icon: 'solar:list-1-bold', title: '有序列表', action: { prefix: '1. ', placeholder: '列表项' } },
  { name: 'divider', label: '—', title: '分割线', action: { prefix: '\n---\n' } },
]

// ─── Markdown Rendering ───
const renderedContent = computed(() => {
  if (format.value !== 'markdown' || !content.value) return '<p class="text-gray-400">暂无内容</p>'
  try {
    const { marked } = require('marked')
    return marked(content.value)
  } catch {
    return content.value.replace(/\n/g, '<br>')
  }
})

// ─── Format Switch ───
const setFormat = (f: 'markdown' | 'txt') => {
  format.value = f
  emit('format-change', f)
}

// ─── Text Tool Application ───
const getSelection = () => {
  const el = textareaRef.value
  if (!el) return { start: content.value.length, end: content.value.length, selected: '' }
  return { start: el.selectionStart, end: el.selectionEnd, selected: el.value.substring(el.selectionStart, el.selectionEnd) }
}

const applyTool = (tool: any) => {
  const { start, end, selected } = getSelection()
  const a = tool.action
  let insert: string
  let cursorOffset: number

  if (a.prefix !== undefined) {
    const suffix = a.suffix || ''
    const text = selected || a.placeholder || ''
    insert = a.prefix + text + suffix
    cursorOffset = a.prefix.length + text.length
  } else if (a.before !== undefined) {
    const text = selected || a.placeholder || ''
    insert = a.before + text + a.after
    cursorOffset = a.before.length + text.length
  } else {
    insert = a.text || ''
    cursorOffset = insert.length
  }

  content.value = content.value.substring(0, start) + insert + content.value.substring(end)
  const newCursor = start + cursorOffset

  setTimeout(() => {
    if (textareaRef.value) {
      textareaRef.value.selectionStart = newCursor
      textareaRef.value.selectionEnd = newCursor
      textareaRef.value.focus()
    }
  }, 0)
}

// ─── Image Upload ───
const triggerUpload = () => imageInput.value?.click()

const uploadImage = async (file: File) => {
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
    insertMarkdownImage(url, file.name)
  } catch {
    alert('图片上传失败，请检查网络或登录状态')
  } finally {
    uploading.value = false
  }
}

const insertMarkdownImage = (url: string, alt: string) => {
  const md = `![${alt}](${url})\n`
  const { start } = getSelection()
  content.value = content.value.substring(0, start) + md + content.value.substring(start)
}

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadImage(file)
  if (imageInput.value) imageInput.value.value = ''
}

const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) uploadImage(file)
}

// ─── Clipboard Paste (Image + Text) ───
const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of Array.from(items)) {
    // Image paste (Ctrl+V screenshot)
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) {
        const ext = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg'
        const named = new File([file], `paste-${Date.now()}.${ext}`, { type: file.type })
        uploadImage(named)
      }
      return
    }
  }
}

// ─── File Import (.md / .txt) ───
const importFile = () => fileImportInput.value?.click()

const handleFileImport = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    const text = ev.target?.result as string
    if (!text) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'md' || ext === 'markdown') {
      setFormat('markdown')
    } else {
      setFormat('txt')
    }

    content.value = text
  }
  reader.readAsText(file, 'utf-8')

  if (fileImportInput.value) fileImportInput.value.value = ''
}

// ─── File Export (.md / .txt) ───
const exportFile = () => {
  if (!content.value.trim()) {
    alert('没有可导出的内容')
    return
  }

  const ext = format.value === 'markdown' ? 'md' : 'txt'
  const mimeType = format.value === 'markdown' ? 'text/markdown' : 'text/plain'
  const filename = `content-${new Date().toISOString().slice(0, 10)}.${ext}`

  const blob = new Blob([content.value], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Image Manager ───
const showImageManager = ref(false)
const images = ref<any[]>([])
const loadingImages = ref(false)
const imageSearch = ref('')
const imagePage = ref(1)
const imageTotalPages = ref(1)

const hasMoreImages = computed(() => imagePage.value < imageTotalPages.value)

const loadImages = async (reset = false) => {
  if (reset) {
    imagePage.value = 1
    images.value = []
  }
  loadingImages.value = true
  try {
    const res = await uploadAPI.getFiles({
      page: imagePage.value,
      limit: 16,
      mimeType: 'image',
      search: imageSearch.value || undefined
    })
    if (reset) {
      images.value = res.files
    } else {
      images.value.push(...res.files)
    }
    imageTotalPages.value = res.pagination.totalPages
  } catch {
    // try gallery fallback (public images, no auth)
    try {
      const { uploadAPI: ua } = await import('@/utils/apiClient')
      const res = await ua.getImageGallery({ limit: 50, category: imageSearch.value || undefined })
      images.value = res.images
      imageTotalPages.value = 1
    } catch {
      images.value = []
    }
  } finally {
    loadingImages.value = false
  }
}

const loadMoreImages = () => {
  imagePage.value++
  loadImages()
}

const insertImage = (img: any) => {
  if (format.value === 'txt') {
    // In txt mode, just insert the URL
    const { start } = getSelection()
    content.value = content.value.substring(0, start) + img.url + content.value.substring(start)
  } else {
    insertMarkdownImage(img.url, img.altText || img.originalName || '')
  }
  showImageManager.value = false
}

watch(showImageManager, (v) => {
  if (v) loadImages(true)
})

let searchTimer: ReturnType<typeof setTimeout>
watch(imageSearch, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadImages(true), 300)
})

// ─── Sync ───
watch(content, (v) => emit('update:modelValue', v))
watch(() => props.modelValue, (v) => { if (v !== content.value) content.value = v })
</script>

<style scoped>
.markdown-preview { line-height: 1.8; }
.markdown-preview :deep(h1),.markdown-preview :deep(h2),.markdown-preview :deep(h3) { margin-top: 1.5rem; margin-bottom: .75rem; color: #1f2937; }
.markdown-preview :deep(p) { margin-bottom: .75rem; }
.markdown-preview :deep(pre) { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: .5rem; overflow-x: auto; margin-bottom: .75rem; }
.markdown-preview :deep(code) { background: #f3f4f6; color: #ef4444; padding: .15rem .35rem; border-radius: .25rem; font-size: .85rem; }
.markdown-preview :deep(pre code) { background: transparent; color: inherit; padding: 0; }
.markdown-preview :deep(ul),.markdown-preview :deep(ol) { margin-bottom: .75rem; padding-left: 1.5rem; }
.markdown-preview :deep(li) { margin-bottom: .35rem; }
.markdown-preview :deep(blockquote) { border-left: 4px solid #0d9488; padding-left: 1rem; margin-bottom: .75rem; color: #6b7280; }
.markdown-preview :deep(a) { color: #0d9488; text-decoration: underline; }
.markdown-preview :deep(img) { max-width: 100%; border-radius: .5rem; margin: .5rem 0; }
.markdown-preview :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: .75rem; }
.markdown-preview :deep(th),.markdown-preview :deep(td) { border: 1px solid #e5e7eb; padding: .5rem; }
.markdown-preview :deep(th) { background: #f9fafb; }
.dark .markdown-preview :deep(h1),.dark .markdown-preview :deep(h2),.dark .markdown-preview :deep(h3) { color: #e5e7eb; }
.dark .markdown-preview :deep(code) { background: #374151; color: #f472b6; }
.dark .markdown-preview :deep(blockquote) { color: #9ca3af; }
.dark .markdown-preview :deep(th) { background: #1f2937; }
.dark .markdown-preview :deep(th),.dark .markdown-preview :deep(td) { border-color: #374151; }
</style>
