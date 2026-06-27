<template>
  <div class="min-h-screen pt-20">
    <div class="container mx-auto px-6 py-12">
      <div class="max-w-5xl mx-auto">
        <!-- Page Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ isEdit ? '编辑' : '创建' }}{{ contentType === 'note' ? '笔记' : '文章' }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ contentType === 'note' ? '记录你的技术学习与心得' : '分享你的技术见解与经验' }}
          </p>
        </div>

        <!-- Content Type Toggle (仅创建时显示) -->
        <div v-if="!isEdit" class="flex justify-center gap-4 mb-12">
          <button
            @click="contentType = 'note'"
            :class="[
              'px-8 py-3 rounded-xl font-medium transition-all duration-300',
              contentType === 'note'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25 transform scale-105'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70 backdrop-blur-sm'
            ]"
          >
            📖 笔记
          </button>
          <button
            @click="contentType = 'article'"
            :class="[
              'px-8 py-3 rounded-xl font-medium transition-all duration-300',
              contentType === 'article'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25 transform scale-105'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70 backdrop-blur-sm'
            ]"
          >
            📝 文章
          </button>
        </div>

        <GlassCard class="p-8 space-y-6">
          <!-- 标题 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标题
            </label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all"
              placeholder="输入标题..."
            />
          </div>

          <!-- 分类 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              分类
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat.id"
                @click="form.category = cat.id"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  form.category === cat.id
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
              >
                {{ cat.icon }} {{ cat.name }}
              </button>
            </div>
          </div>

          <!-- 封面设置 (仅笔记) -->
          <div v-if="contentType === 'note'" class="space-y-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              封面设置
            </label>
            <div class="flex gap-4">
              <!-- 封面图片上传 -->
              <div class="flex-1">
                <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-pink-500 transition-colors">
                  <input
                    ref="coverFileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleCoverUpload"
                  />
                  <div
                    v-if="form.cover"
                    class="relative"
                  >
                    <img
                      :src="form.cover"
                      alt="封面预览"
                      class="max-h-48 mx-auto rounded-lg mb-3"
                    />
                    <button
                      @click="removeCover"
                      class="absolute top-0 right-0 p-2 bg-red-500 text-white rounded-full"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <label
                    v-else
                    class="cursor-pointer block"
                  >
                    <div class="text-gray-500">
                      <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p class="text-sm">点击上传封面图片</p>
                      <p class="text-xs text-gray-400 mt-1">或选择颜色作为封面</p>
                    </div>
                  </label>
                </div>
              </div>
              <!-- 颜色选择 -->
              <div class="w-32">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">或选择颜色</p>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="color in coverColors"
                    :key="color.value"
                    @click="selectColor(color.value)"
                    :class="[
                      'w-12 h-12 rounded-lg transition-transform hover:scale-110',
                      form.color === color.value ? 'ring-2 ring-pink-500 ring-offset-2' : ''
                    ]"
                    :style="{ backgroundColor: color.value }"
                    :title="color.name"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 摘要 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              摘要
            </label>
            <textarea
              v-model="form.summary"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all resize-none"
              placeholder="简要描述内容..."
            />
          </div>

          <!-- 标签 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              标签（用逗号分隔）
            </label>
            <input
              v-model="tagsInput"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all"
              placeholder="例如: Vue, TypeScript, 前端"
            />
            <!-- 已选择的标签 -->
            <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="(tag, index) in form.tags"
                :key="index"
                class="px-3 py-1 bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 rounded-full text-sm"
              >
                {{ tag }}
                <button
                  @click="removeTag(index)"
                  class="ml-1 hover:text-pink-700 dark:hover:text-pink-300"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <!-- Markdown 编辑器 -->
          <div class="space-y-4">
            <TextEditor
              v-model="form.content"
              label="内容"
              :rows="20"
              :default-format="'markdown'"
              @format-change="handleFormatChange"
            />
          </div>

          <!-- 选项 -->
          <div class="flex flex-wrap gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.featured"
                type="checkbox"
                class="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">设为精选</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.published"
                type="checkbox"
                class="w-4 h-4 text-pink-500 rounded focus:ring-pink-500"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">立即发布</span>
            </label>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="saveContent"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/25"
            >
              {{ isEdit ? '更新' : '保存' }}
            </button>
            <button
              @click="resetForm"
              class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-xl font-medium transition-colors"
            >
              重置
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GlassCard from '@/components/ui/GlassCard.vue'
import TextEditor from '@/components/TextEditor.vue'
import {
  type ContentType,
  type ContentData,
  noteCategories,
  articleCategories,
  coverColors
} from '@/content/editor-config'

const route = useRoute()
const router = useRouter()

const isEdit = ref(false)
const contentType = ref<ContentType>('note')
const coverFileInput = ref<HTMLInputElement | null>(null)
const contentFormat = ref<'markdown' | 'txt'>('markdown')

const form = ref<ContentData>({
  id: '',
  type: 'note',
  title: '',
  content: '',
  summary: '',
  tags: [],
  cover: '',
  color: '#3B82F6',
  category: 'linux',
  featured: false,
  published: true,
  date: '',
  readTime: '',
  author: 'Miya',
  createdAt: '',
  updatedAt: ''
})

const categories = computed(() => {
  return contentType.value === 'note' ? noteCategories : articleCategories
})

const tagsInput = computed({
  get: () => form.value.tags.join(', '),
  set: (value: string) => {
    form.value.tags = value
      .split(',')
      .map(t => t.trim())
      .filter(t => t)
  }
})

const wordCount = computed(() => form.value.content.length)

const handleFormatChange = (format: 'markdown' | 'txt') => {
  contentFormat.value = format
}

const handleCoverUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.cover = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeCover = () => {
  form.value.cover = ''
}

const selectColor = (color: string) => {
  form.value.color = color
  form.value.cover = ''
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

const saveContent = () => {
  if (!form.value.title || !form.value.content) {
    alert('请填写标题和内容')
    return
  }

  const contentData: ContentData = {
    id: form.value.id || Date.now().toString(),
    type: contentType.value,
    title: form.value.title,
    category: form.value.category,
    summary: form.value.summary || '',
    tags: form.value.tags,
    cover: form.value.cover || '',
    color: form.value.color,
    featured: form.value.featured,
    published: form.value.published,
    date: new Date().toISOString().split('T')[0],
    readTime: `${Math.ceil(form.value.content.length / 500)} 分钟`,
    author: 'Miya',
    content: form.value.content,
    createdAt: form.value.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // 保存到 localStorage
  const storageKey = contentType.value === 'note' ? 'notes' : 'articles'
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]')
  const index = existing.findIndex((item: ContentData) => item.id === contentData.id)

  if (index >= 0) {
    existing[index] = contentData
  } else {
    existing.unshift(contentData)
  }

  localStorage.setItem(storageKey, JSON.stringify(existing))

  alert(`${contentType.value === 'note' ? '笔记' : '文章'}保存成功！`)
  router.push(contentType.value === 'note' ? '/notes' : '/articles')
}

const resetForm = () => {
  form.value = {
    id: '',
    type: contentType.value,
    title: '',
    content: '',
    summary: '',
    tags: [],
    cover: '',
    color: '#3B82F6',
    category: 'linux',
    featured: false,
    published: true,
    date: '',
    readTime: '',
    author: 'Miya',
    createdAt: '',
    updatedAt: ''
  }
}

onMounted(() => {
  if (route.params.id) {
    isEdit.value = true
    // 从 localStorage 加载内容
    const notes = JSON.parse(localStorage.getItem('notes') || '[]')
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    const content = [...notes, ...articles].find(
      (item: ContentData) => item.id === route.params.id
    )

    if (content) {
      contentType.value = content.type
      form.value = { ...content }
    }
  }
})
</script>
