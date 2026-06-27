<template>
  <div class="min-h-screen pt-20">
    <div class="container mx-auto px-6 py-12">
      <div class="text-center mb-16 animate-fade-in">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          关于
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          了解这个网站、创作者和 Miya 的故事
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else>
        <section v-if="profileContent" class="mb-20 animate-fade-in">
          <GlassCard class="p-8 md:p-12 max-w-4xl mx-auto glow-hover">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg shadow-glow-teal">
                👤
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ profileContent.title || '个人介绍' }}
              </h2>
            </div>
            <div class="prose prose-lg dark:prose-invert max-w-none" v-html="renderMarkdown(profileContent.content)" />
          </GlassCard>
        </section>

        <section v-if="websiteContent" class="mb-20 animate-fade-in" style="animation-delay: 0.1s">
          <GlassCard class="p-8 md:p-12 max-w-4xl mx-auto glow-hover">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-lg shadow-glow-cyan">
                🌐
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ websiteContent.title || '网站信息' }}
              </h2>
            </div>
            <div class="prose prose-lg dark:prose-invert max-w-none" v-html="renderMarkdown(websiteContent.content)" />
          </GlassCard>
        </section>

        <section v-if="miyaContent" class="mb-20 animate-fade-in" style="animation-delay: 0.2s">
          <GlassCard class="p-8 md:p-12 max-w-4xl mx-auto glow-hover">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                M
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ miyaContent.title || '关于 Miya' }}
              </h2>
            </div>
            <div class="prose prose-lg dark:prose-invert max-w-none" v-html="renderMarkdown(miyaContent.content)" />
          </GlassCard>
        </section>

        <section v-if="statsContent || defaultStats.length" class="mb-12 animate-fade-in" style="animation-delay: 0.3s">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <GlassCard v-for="(stat, idx) in displayStats" :key="stat.label" class="p-6 text-center glow-hover" :style="{ animationDelay: `${0.3 + idx * 0.08}s` }">
              <div class="text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-110" :class="stat.color">
                {{ stat.value }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wide">
                {{ stat.label }}
              </div>
            </GlassCard>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import GlassCard from '@/components/ui/GlassCard.vue'
import { contentAPI } from '@/utils/apiClient'

const loading = ref(true)
const contents = ref<any[]>([])

const profileContent = computed(() => contents.value.find(c => c.page === 'about' && c.section === 'profile'))
const websiteContent = computed(() => contents.value.find(c => c.page === 'about' && c.section === 'website'))
const miyaContent = computed(() => contents.value.find(c => c.page === 'about-miya' && c.section === 'main'))
const statsContent = computed(() => contents.value.find(c => c.page === 'about' && c.section === 'stats'))

const defaultStats = [
  { value: '50+', label: '技术笔记', color: 'text-primary-600 dark:text-primary-400' },
  { value: '100+', label: '文化内容', color: 'text-secondary-600 dark:text-secondary-400' },
  { value: '20+', label: 'AI 伴侣', color: 'text-purple-600 dark:text-purple-400' },
  { value: '1000+', label: '社区互动', color: 'text-pink-600 dark:text-pink-400' },
]

const displayStats = computed(() => {
  if (!statsContent.value) return defaultStats
  const lines = (statsContent.value.content || '').split('\n')
  const rows: { value: string; label: string; color: string }[] = []
  const colors = ['text-primary-600 dark:text-primary-400', 'text-secondary-600 dark:text-secondary-400', 'text-purple-600 dark:text-purple-400', 'text-pink-600 dark:text-pink-400']
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line || (line.startsWith('|') && line.includes('---'))) continue
    if (line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length >= 2 && !cells[0].includes('---')) {
        rows.push({ value: cells[0], label: cells[1], color: colors[rows.length % colors.length] })
      }
    }
  }
  return rows.length > 0 ? rows : defaultStats
})

const renderMarkdown = (text: string) => {
  if (!text) return ''
  try {
    const { marked } = require('marked')
    return marked(text)
  } catch {
    return text.replace(/\n/g, '<br>')
  }
}

onMounted(async () => {
  try {
    const res = await contentAPI.getPageContents('about')
    const sections = res.sections || {}
    const aboutContents = Object.values(sections).flatMap((items: any) => items || [])

    let miyaContents: any[] = []
    try {
      const miyaRes = await contentAPI.getPageContents('about-miya')
      const miyaSections = miyaRes.sections || {}
      miyaContents = Object.values(miyaSections).flatMap((items: any) => items || [])
    } catch { /* ignore */ }

    contents.value = [...aboutContents, ...miyaContents].filter(Boolean)
  } catch {
    try {
      const res = await contentAPI.getAllContents()
      contents.value = (res.items || res || []).filter((c: any) =>
        c.page === 'about' || c.page === 'about-miya'
      )
    } catch {
      contents.value = []
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.prose { color: #374151; line-height: 1.8; }
.prose :deep(h1), .prose :deep(h2), .prose :deep(h3) { color: #111827; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
.prose :deep(h1) { font-size: 1.5rem; }
.prose :deep(h2) { font-size: 1.25rem; }
.prose :deep(p) { margin-bottom: 1em; }
.prose :deep(ul), .prose :deep(ol) { margin-bottom: 1em; padding-left: 1.5em; }
.prose :deep(li) { margin-bottom: 0.35em; }
.prose :deep(a) { color: #0d9488; text-decoration: underline; }
.prose :deep(code) { background-color: #f3f4f6; padding: 0.15em 0.35em; border-radius: 0.25em; font-size: 0.875em; }
.prose :deep(pre) { background-color: #1f2937; color: #e5e7eb; padding: 1em; border-radius: 0.5em; overflow-x: auto; margin-bottom: 1em; }
.prose :deep(pre code) { background-color: transparent; padding: 0; color: inherit; }
.prose :deep(blockquote) { border-left: 4px solid #0d9488; padding-left: 1em; margin-bottom: 1em; color: #6b7280; }
.prose :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
.prose :deep(th), .prose :deep(td) { border: 1px solid #e5e7eb; padding: 0.5rem 1rem; }
.prose :deep(th) { background: #f9fafb; font-weight: 600; }
.prose :deep(strong) { color: #111827; }
.prose :deep(img) { max-width: 100%; border-radius: 0.5rem; margin: 1rem 0; }
.dark .prose { color: #d1d5db; }
.dark .prose :deep(h1), .dark .prose :deep(h2), .dark .prose :deep(h3) { color: #f9fafb; }
.dark .prose :deep(a) { color: #2dd4bf; }
.dark .prose :deep(code) { background-color: #374151; }
.dark .prose :deep(pre) { background-color: #111827; }
.dark .prose :deep(blockquote) { color: #9ca3af; }
.dark .prose :deep(th) { background: #1f2937; }
.dark .prose :deep(th), .dark .prose :deep(td) { border-color: #374151; }
.dark .prose :deep(strong) { color: #f9fafb; }
</style>
