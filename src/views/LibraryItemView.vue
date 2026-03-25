<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-5xl">
      <!-- Back -->
      <button @click="$router.push(`/library/${route.params.collectionId}`)" class="btn-ghost mb-8 animate-fade-in">
        <Icon name="solar:arrow-left-bold" size="sm" />
        <span>返回</span>
      </button>

      <!-- Book Header -->
      <div v-if="item" class="glass-card p-8 mb-10 animate-fade-in">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="w-32 h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-glass">
            <img v-if="item.cover_image" :src="item.cover_image" :alt="item.title" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-primary-500">
              {{ item.title.charAt(0) }}
            </div>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {{ item.title }}
            </h1>
            <p v-if="item.description" class="text-gray-500 dark:text-gray-400 mb-4">{{ item.description }}</p>
            <div v-if="item.tags" class="flex flex-wrap gap-2">
              <span v-for="tag in parseJSON(item.tags)" :key="tag" class="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">#{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TOC Sidebar + Content Area -->
      <div class="flex gap-8 animate-slide-up">
        <!-- TOC -->
        <aside class="hidden lg:block w-64 flex-shrink-0">
          <div class="sticky top-24">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">目录</h3>
            <nav class="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
              <!-- Volumes -->
              <div v-for="vol in toc.volumes" :key="vol.id" class="mb-3">
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 px-2">{{ vol.title }}</p>
                <div v-for="ch in vol.chapters" :key="ch.id" class="space-y-0.5">
                  <button
                    @click="selectChapter(ch)"
                    :class="[
                      'w-full text-left px-2 py-1.5 rounded-lg text-sm transition-all',
                      activeChapterId === ch.id
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    ]"
                  >
                    {{ ch.title }}
                    <span v-if="ch.articles?.length" class="text-xs text-gray-400 ml-1">({{ ch.articles.length }})</span>
                  </button>
                </div>
              </div>
              <!-- Orphan chapters -->
              <div v-if="toc.orphanChapters?.length">
                <div v-for="ch in toc.orphanChapters" :key="ch.id" class="space-y-0.5">
                  <button
                    @click="selectChapter(ch)"
                    :class="[
                      'w-full text-left px-2 py-1.5 rounded-lg text-sm transition-all',
                      activeChapterId === ch.id
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    ]"
                  >
                    {{ ch.title }}
                    <span v-if="ch.articles?.length" class="text-xs text-gray-400 ml-1">({{ ch.articles.length }})</span>
                  </button>
                </div>
              </div>
              <!-- Direct articles (no chapter) -->
              <div v-if="toc.directArticles?.length">
                <p class="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 mt-4 px-2">正文</p>
                <div v-for="art in toc.directArticles" :key="art.id" class="space-y-0.5">
                  <button
                    @click="selectArticle(art)"
                    :class="[
                      'w-full text-left px-2 py-1.5 rounded-lg text-sm transition-all',
                      activeArticleId === art.id
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    ]"
                  >
                    {{ art.title }}
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        <!-- Content Area -->
        <main class="flex-1 min-w-0">
          <div v-if="isLoading" class="flex justify-center py-20">
            <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>

          <!-- Article View -->
          <div v-else-if="currentArticle" class="glass-card p-8">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ currentArticle.title }}</h2>
            <div class="flex items-center gap-4 mb-6 text-sm text-gray-400">
              <span>{{ currentArticle.content_type === 'markdown' ? 'Markdown' : 'TXT' }}</span>
              <span>{{ currentArticle.word_count || 0 }} 字</span>
              <span>{{ currentArticle.view_count || 0 }} 阅读</span>
              <button
                v-if="currentArticle.is_downloadable"
                @click="downloadArticle"
                class="btn-ghost text-xs"
              >
                <Icon name="solar:download-bold-duotone" size="sm" />
                <span>下载</span>
              </button>
            </div>
            <div class="prose dark:prose-invert max-w-none">
              <div v-if="currentArticle.content_type === 'markdown'" v-html="renderedContent" class="article-content" />
              <pre v-else class="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">{{ currentArticle.content }}</pre>
            </div>
          </div>

          <!-- Chapter Articles List -->
          <div v-else-if="currentChapter && chapterArticles.length > 0">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">{{ currentChapter.title }}</h2>
            <div class="space-y-3">
              <button
                v-for="art in chapterArticles"
                :key="art.id"
                @click="loadArticle(art.id)"
                class="w-full text-left glass-card p-5 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all group"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ art.title }}</h3>
                    <p v-if="art.summary" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{{ art.summary }}</p>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                    <span>{{ art.content_type === 'markdown' ? 'MD' : 'TXT' }}</span>
                    <Icon name="solar:arrow-right-bold" size="sm" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Empty -->
          <div v-else class="glass-card p-12 text-center">
            <Icon name="solar:document-text-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">请选择章节</h3>
            <p class="text-gray-500 dark:text-gray-400">从左侧目录中选择一个章节开始阅读</p>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { itemAPI } from '@/utils/apiClient'
import { marked } from 'marked'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const item = ref<any>(null)
const toc = ref<{ volumes: any[], orphanChapters: any[], directArticles: any[] }>({ volumes: [], orphanChapters: [], directArticles: [] })
const isLoading = ref(true)
const currentChapter = ref<any>(null)
const currentArticle = ref<any>(null)
const chapterArticles = ref<any[]>([])
const activeChapterId = ref<number | null>(null)
const activeArticleId = ref<number | null>(null)

const renderedContent = computed(() => {
  if (!currentArticle.value || currentArticle.value.content_type !== 'markdown') return ''
  try { return marked(currentArticle.value.content) } catch { return currentArticle.value.content }
})

const parseJSON = (str: string | null): string[] => {
  if (!str) return []
  try { return JSON.parse(str) } catch { return [] }
}

const selectChapter = async (ch: any) => {
  activeChapterId.value = ch.id
  activeArticleId.value = null
  currentChapter.value = ch
  currentArticle.value = null
  if (ch.articles?.length === 1) {
    await loadArticle(ch.articles[0].id)
  } else {
    chapterArticles.value = ch.articles || []
  }
}

const selectArticle = (art: any) => {
  loadArticle(art.id)
}

const loadArticle = async (articleId: number) => {
  try {
    const itemId = Number(route.params.itemId)
    const res = await itemAPI.getArticle(itemId, articleId)
    currentArticle.value = res.article
    activeArticleId.value = articleId
    chapterArticles.value = []
  } catch (e) {
    console.error('加载文章失败:', e)
  }
}

const downloadArticle = () => {
  if (!currentArticle.value) return
  const content = currentArticle.value.content
  const ext = currentArticle.value.content_type === 'markdown' ? 'md' : 'txt'
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentArticle.value.title}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  try {
    const itemId = Number(route.params.itemId)
    const [detailRes, tocRes] = await Promise.all([
      itemAPI.getById(itemId),
      itemAPI.getTOC(itemId)
    ])
    item.value = detailRes.item
    toc.value = tocRes

    // Auto-select first content
    if (tocRes.directArticles?.length > 0) {
      await loadArticle(tocRes.directArticles[0].id)
    } else if (tocRes.orphanChapters?.length > 0 && tocRes.orphanChapters[0].articles?.length > 0) {
      await selectChapter(tocRes.orphanChapters[0])
    } else if (tocRes.volumes?.length > 0) {
      const firstVol = tocRes.volumes[0]
      if (firstVol.chapters?.length > 0) {
        await selectChapter(firstVol.chapters[0])
      }
    }
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.article-content { line-height: 1.8; }
.article-content :deep(h1), .article-content :deep(h2), .article-content :deep(h3) { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
.article-content :deep(p) { margin-bottom: 1em; }
.article-content :deep(code) { padding: 2px 6px; border-radius: 6px; font-size: 0.9em; }
.article-content :deep(pre) { padding: 1em; border-radius: 12px; overflow-x: auto; }
</style>
