<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-5xl">
      <!-- Back -->
      <button @click="$router.push('/companions')" class="btn-ghost mb-8 animate-fade-in">
        <Icon name="solar:arrow-left-bold" size="sm" />
        <span>返回伴侣社区</span>
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else-if="item">
        <!-- Companion Header Card -->
        <div class="glass-panel p-8 mb-8 animate-fade-in">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-glass-lg">
              <img v-if="item.cover_image" :src="item.cover_image" :alt="item.title" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-gradient-to-br from-primary-300 to-secondary-300 dark:from-primary-700 dark:to-secondary-700 flex items-center justify-center">
                <Icon name="solar:star-shine-bold-duotone" size="xl" color="#fff" />
              </div>
            </div>
            <div class="flex-1">
              <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                {{ item.title }}
              </h1>
              <p v-if="item.description" class="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{{ item.description }}</p>
              <div v-if="item.tags" class="flex flex-wrap gap-2">
                <span v-for="tag in parseJSON(item.tags)" :key="tag" class="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">#{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TOC + Content -->
        <div class="flex gap-8">
          <!-- Sidebar -->
          <aside class="hidden lg:block w-56 flex-shrink-0">
            <div class="sticky top-24">
              <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">导航</h3>
              <nav class="space-y-1">
                <button
                  v-for="art in allArticles"
                  :key="art.id"
                  @click="loadArticle(art.id)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                    activeArticleId === art.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                  ]"
                >
                  {{ art.title }}
                </button>
              </nav>
            </div>
          </aside>

          <!-- Content -->
          <main class="flex-1 min-w-0">
            <div v-if="currentArticle" class="glass-card p-8 animate-fade-in">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ currentArticle.title }}</h2>
              <div class="flex items-center gap-4 mb-6 text-sm text-gray-400">
                <span>{{ currentArticle.content_type === 'markdown' ? 'Markdown' : 'TXT' }}</span>
                <span>{{ currentArticle.word_count || 0 }} 字</span>
                <button v-if="currentArticle.is_downloadable" @click="downloadArticle" class="btn-ghost text-xs">
                  <Icon name="solar:download-bold-duotone" size="sm" />
                  <span>下载</span>
                </button>
              </div>
              <div class="prose dark:prose-invert max-w-none">
                <div v-if="currentArticle.content_type === 'markdown'" v-html="renderedContent" class="article-content" />
                <pre v-else class="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">{{ currentArticle.content }}</pre>
              </div>
            </div>
            <div v-else class="glass-card p-12 text-center animate-fade-in">
              <Icon name="solar:document-text-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">请选择内容</h3>
              <p class="text-gray-500 dark:text-gray-400">从左侧导航选择内容开始查看</p>
            </div>
          </main>
        </div>
      </template>

      <!-- Not Found -->
      <div v-else class="text-center py-24 animate-fade-in">
        <Icon name="solar:ghost-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">伴侣不存在</h3>
        <button @click="$router.push('/companions')" class="btn-ghost mt-4">返回伴侣社区</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { itemAPI } from '@/utils/apiClient'
import { marked } from 'marked'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const item = ref<any>(null)
const isLoading = ref(true)
const currentArticle = ref<any>(null)
const activeArticleId = ref<number | null>(null)
const allArticles = ref<any[]>([])

const renderedContent = computed(() => {
  if (!currentArticle.value || currentArticle.value.content_type !== 'markdown') return ''
  try { return marked(currentArticle.value.content) } catch { return currentArticle.value.content }
})

const parseJSON = (str: string | null): string[] => {
  if (!str) return []
  try { return JSON.parse(str) } catch { return [] }
}

const loadArticle = async (articleId: number) => {
  try {
    const itemId = Number(route.params.id)
    const res = await itemAPI.getArticle(itemId, articleId)
    currentArticle.value = res.article
    activeArticleId.value = articleId
  } catch (e) { console.error('加载内容失败:', e) }
}

const downloadArticle = () => {
  if (!currentArticle.value) return
  const ext = currentArticle.value.content_type === 'markdown' ? 'md' : 'txt'
  const blob = new Blob([currentArticle.value.content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${currentArticle.value.title}.${ext}`; a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const [detailRes, tocRes] = await Promise.all([itemAPI.getById(id), itemAPI.getTOC(id)])
    item.value = detailRes.item

    // Flatten all articles for sidebar nav
    const articles: any[] = []
    const pushArticles = (list: any[]) => list.forEach(a => articles.push(a))
    tocRes.volumes?.forEach((v: any) => v.chapters?.forEach((c: any) => pushArticles(c.articles || [])))
    pushArticles(tocRes.orphanChapters?.flatMap((c: any) => c.articles || []) || [])
    pushArticles(tocRes.directArticles || [])
    allArticles.value = articles

    if (articles.length > 0) await loadArticle(articles[0].id)
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.article-content { line-height: 1.8; }
.article-content :deep(h1), .article-content :deep(h2), .article-content :deep(h3) { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
.article-content :deep(p) { margin-bottom: 1em; }
.article-content :deep(code) { padding: 2px 6px; border-radius: 6px; font-size: 0.9em; }
.article-content :deep(pre) { padding: 1em; border-radius: 12px; overflow-x: auto; }
</style>
