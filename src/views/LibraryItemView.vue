<template>
  <div class="page-container">
    <!-- Reading progress bar -->
    <div class="fixed top-0 left-0 h-0.5 z-50 transition-all duration-150" :style="{ width: progressPercent + '%', background: 'var(--color-primary)' }" />

    <div class="container mx-auto px-6 py-12 max-w-4xl">
      <button @click="goBack" class="btn-ghost mb-8">
        <Icon name="solar:arrow-left-bold" size="sm" /><span>返回</span>
      </button>

      <!-- Item Header -->
      <div v-if="item" class="mb-10">
        <div class="flex gap-4 items-start">
          <div class="w-20 h-28 md:w-28 md:h-36 rounded-2xl overflow-hidden flex-shrink-0">
            <img v-if="item.cover_image" :src="item.cover_image" :alt="item.title" class="w-full h-full object-cover" loading="lazy" />
            <div v-else class="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style="background: var(--color-primary);">{{ item.title.charAt(0) }}</div>
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-bold mb-1" style="color: var(--color-text);">{{ item.title }}</h1>
            <p v-if="item.description" class="text-sub text-sm mb-2">{{ item.description }}</p>
            <div class="flex items-center gap-3 text-xs" style="color: var(--color-text-caption);">
              <span>{{ allArticles.length }} 篇</span>
              <span v-if="totalWords">· {{ totalWords.toLocaleString() }} 字</span>
              <span v-if="totalReadingTime">· 约 {{ totalReadingTime }} 分钟</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main reading area - full width -->
      <main ref="contentRef">
        <div v-if="isLoading" class="flex justify-center py-20">
          <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>

        <div v-else-if="currentArticle" class="article-body">
          <h2 class="article-title">{{ currentArticle.title }}</h2>
          <div class="article-meta">
            <span>{{ formatDate(currentArticle.created_at) }}</span>
            <span>· {{ currentArticle.word_count || 0 }} 字</span>
            <span>· 约 {{ readingTime }} 分钟</span>
            <button v-if="currentArticle.is_downloadable" @click="downloadArticle" class="btn-ghost text-xs ml-auto">
              <Icon name="solar:download-bold-duotone" size="sm" /><span>下载</span>
            </button>
          </div>
          <div class="article-content prose dark:prose-invert" :style="{ fontSize: fontSizePx + 'px', lineHeight: lineHeightPx }">
            <div v-if="currentArticle.content_type !== 'txt'" v-html="renderedContent" />
            <pre v-else class="whitespace-pre-wrap font-mono rounded-xl p-6" :style="{ fontSize: (fontSizePx * 0.875) + 'px', background: 'var(--color-surface)', color: 'var(--color-text-dim)' }">{{ currentArticle.content }}</pre>
          </div>

          <!-- Prev/Next -->
          <div class="article-nav">
            <button v-if="prevArticle" @click="loadArticle(prevArticle.id)" class="article-nav-btn text-left">
              <span class="text-caption">上一篇</span>
              <span class="text-sm truncate block" style="color: var(--color-text-dim);">{{ prevArticle.title }}</span>
            </button>
            <span v-else class="flex-1" />
            <button v-if="nextArticle" @click="loadArticle(nextArticle.id)" class="article-nav-btn text-right">
              <span class="text-caption">下一篇</span>
              <span class="text-sm truncate block" style="color: var(--color-text-dim);">{{ nextArticle.title }}</span>
            </button>
            <span v-else class="flex-1" />
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="solar:document-text-bold-duotone" size="xl" color="#4a525e" class="mb-4 empty-state-icon" />
          <h3 class="text-lg font-semibold mb-2" style="color: var(--color-text);">请选择内容</h3>
          <p class="text-sub text-sm">从右侧目录中选择一篇开始阅读</p>
        </div>
      </main>
    </div>

    <!-- Mobile TOC Side Tab -->
    <template v-if="allArticles.length > 0">
      <!-- Side toggle tab -->
      <button
        @click="showMobileToc = !showMobileToc"
        class="lg:hidden fixed top-1/3 right-0 z-40 w-8 h-20 rounded-l-xl flex flex-col items-center justify-center gap-0.5 shadow-lg transition-transform duration-300"
        :class="showMobileToc ? 'translate-x-full opacity-0' : ''"
        style="background: var(--color-surface-raised); border: 1px solid var(--color-border-subtle); border-right: none; color: var(--color-primary);"
      >
        <Icon name="solar:list-bold" size="sm" />
        <span class="text-[0.5rem] font-medium vertical-text" style="color: var(--color-text-caption);">目录</span>
      </button>

      <!-- Side drawer + backdrop -->
      <Teleport to="body">
        <Transition name="toc-slide">
          <div v-if="showMobileToc" class="lg:hidden fixed inset-0 z-[70] flex">
            <div @click="showMobileToc = false" class="flex-1 bg-black/40 backdrop-blur-sm" />
            <div class="w-[75vw] max-w-[320px] flex flex-col shadow-2xl" style="background: var(--color-bg-deep); border-left: 1px solid var(--color-border-subtle);">
              <div class="flex items-center justify-between p-4 border-b flex-shrink-0" style="border-color: var(--color-border-subtle);">
                <h3 class="font-semibold text-sm" style="color: var(--color-text);">目录 ({{ allArticles.length }})</h3>
                <button @click="showMobileToc = false" class="p-1 rounded-lg hover:bg-white/5">
                  <Icon name="solar:close-circle-bold" size="md" :style="{ color: 'var(--color-text-dim)' }" />
                </button>
              </div>
              <nav class="flex-1 overflow-y-auto p-3 space-y-0.5">
                <button
                  v-for="art in allArticles"
                  :key="art.id"
                  @click="loadArticle(art.id); showMobileToc = false"
                  class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
                  :style="activeArticleId === art.id ? { color: 'var(--color-primary)', background: 'var(--color-primary) / 0.08' } : { color: 'var(--color-text-dim)' }"
                >
                  <div class="line-clamp-1">{{ art.title }}</div>
                  <div class="text-caption mt-0.5">{{ art.word_count || 0 }} 字</div>
                </button>
              </nav>
              <!-- Prev/Next in drawer footer -->
              <div class="flex items-center gap-2 p-3 border-t flex-shrink-0" style="border-color: var(--color-border-subtle);">
                <button
                  v-if="prevArticle"
                  @click="loadArticle(prevArticle.id); showMobileToc = false"
                  class="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                  style="color: var(--color-text-dim);"
                >
                  <Icon name="solar:arrow-left-bold" size="xs" /> 上一章
                </button>
                <div v-else class="flex-1" />
                <button
                  v-if="nextArticle"
                  @click="loadArticle(nextArticle.id); showMobileToc = false"
                  class="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
                  style="color: var(--color-text-dim);"
                >
                  下一章 <Icon name="solar:arrow-right-bold" size="xs" />
                </button>
                <div v-else class="flex-1" />
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { itemAPI } from '@/utils/apiClient'
import { marked } from 'marked'
import Icon from '@/components/ui/Icon.vue'
import { readerState } from '@/stores/readerState'

const route = useRoute()
const router = useRouter()

const item = ref<any>(null)
const isLoading = ref(true)
const currentArticle = ref<any>(null)
const activeArticleId = ref<number | null>(null)
const allArticles = ref<any[]>([])
const progressPercent = ref(0)
const fontSize = ref<'md' | 'lg' | 'xl'>('md')
const showMobileToc = ref(false)
const contentRef = ref<HTMLElement | null>(null)

const fontSizePx = computed(() => fontSize.value === 'lg' ? 20 : fontSize.value === 'xl' ? 25 : 16)
const lineHeightPx = computed(() => fontSize.value === 'lg' ? 2.0 : fontSize.value === 'xl' ? 2.2 : 1.85)

const totalWords = computed(() => allArticles.value.reduce((s, a) => s + (a.word_count || 0), 0))
const totalReadingTime = computed(() => Math.max(1, Math.ceil(totalWords.value / 400)))
const readingTime = computed(() => Math.max(1, Math.ceil((currentArticle.value?.word_count || 0) / 400)))

const renderedContent = computed(() => {
  if (!currentArticle.value || currentArticle.value.content_type === 'txt') return ''
  try { return marked(currentArticle.value.content || '') } catch { return currentArticle.value.content }
})

const prevArticle = computed(() => {
  if (!currentArticle.value) return null
  const idx = allArticles.value.findIndex((a: any) => a.id === currentArticle.value.id)
  return idx > 0 ? allArticles.value[idx - 1] : null
})
const nextArticle = computed(() => {
  if (!currentArticle.value) return null
  const idx = allArticles.value.findIndex((a: any) => a.id === currentArticle.value.id)
  return idx < allArticles.value.length - 1 ? allArticles.value[idx + 1] : null
})

const formatDate = (d: string) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Sync local state ↔ shared readerState
watch([allArticles, activeArticleId, fontSize, progressPercent], () => {
  readerState.articles = allArticles.value.map(a => ({ id: a.id, title: a.title, word_count: a.word_count }))
  readerState.activeId = activeArticleId.value
  readerState.fontSize = fontSize.value
  readerState.progress = progressPercent.value
})

// Listen to font size changes from right sidebar
watch(() => readerState.fontSize, (v) => {
  if (v && v !== fontSize.value) fontSize.value = v
})

async function loadArticle(articleId: number) {
  try {
    const itemId = Number(route.params.itemId || route.params.id)
    const res = await itemAPI.getArticle(itemId, articleId)
    currentArticle.value = res.article
    activeArticleId.value = articleId
    window.scrollTo({ top: 0 })
  } catch (e) { console.error('加载失败:', e) }
}

function downloadArticle() {
  if (!currentArticle.value) return
  const blob = new Blob([currentArticle.value.content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${currentArticle.value.title || 'article'}.txt`; a.click()
  URL.revokeObjectURL(url)
}

function goBack() {
  const path = route.path
  if (path.startsWith('/blog')) router.push('/blog')
  else if (path.startsWith('/companions')) router.push('/companions')
  else router.push(`/library/${route.params.collectionId}`)
}

function onScroll() {
  const h = document.documentElement.scrollHeight - document.documentElement.clientHeight
  progressPercent.value = h > 0 ? Math.round((window.scrollY / h) * 100) : 0
}

// Listen for navigation from right sidebar TOC
function onReaderNavigate(e: Event) {
  const detail = (e as CustomEvent).detail
  if (detail?.id) loadArticle(detail.id)
}

onMounted(async () => {
  try {
    const itemId = Number(route.params.itemId || route.params.id)
    const [detailRes, tocRes] = await Promise.all([itemAPI.getById(itemId), itemAPI.getTOC(itemId)])
    item.value = detailRes.item

    const articles: any[] = []
    if (tocRes.directArticles) articles.push(...tocRes.directArticles)
    if (tocRes.orphanChapters) for (const ch of tocRes.orphanChapters) if (ch.articles) articles.push(...ch.articles)
    if (tocRes.volumes) for (const vol of tocRes.volumes) if (vol.chapters) for (const ch of vol.chapters) if (ch.articles) articles.push(...ch.articles)
    allArticles.value = articles

    const saved = localStorage.getItem('font_size')
    if (saved) fontSize.value = saved as any

    if (articles.length > 0) await loadArticle(articles[0].id)
  } catch (e) { console.error('加载失败:', e) }
  finally { isLoading.value = false }

  window.addEventListener('scroll', onScroll)
  window.addEventListener('reader:navigate', onReaderNavigate)
})

watch(fontSize, (v) => { localStorage.setItem('font_size', v); readerState.fontSize = v })

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('reader:navigate', onReaderNavigate)
})
</script>

<style scoped>
.article-body {
  width: 100%; max-width: 48rem; margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: 1.5rem;
  padding: 2.5rem;
  backdrop-filter: blur(16px);
}

.article-title {
  font-size: 1.75rem; font-weight: 700; line-height: 1.3;
  margin-bottom: 0.75rem; color: var(--color-text);
}
.article-meta {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.8125rem; color: var(--color-text-caption);
  margin-bottom: 2rem; padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.article-content { line-height: 1.85; }

.article-content :deep(h2) { font-size: 1.4rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; color: var(--color-text); }
.article-content :deep(h3) { font-size: 1.15rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--color-text); }
.article-content :deep(p) { margin-bottom: 1rem; color: var(--color-text-dim); }
.article-content :deep(code) { background: var(--color-surface); padding: 0.15rem 0.4rem; border-radius: 0.375rem; font-size: 0.875em; font-family: 'JetBrains Mono', monospace; color: var(--color-primary-glow); }
.article-content :deep(pre) { background: var(--color-surface); padding: 1.25rem; border-radius: 0.75rem; overflow-x: auto; margin: 1.25rem 0; }
.article-content :deep(pre code) { background: none; padding: 0; color: var(--color-text-dim); }
.article-content :deep(blockquote) { border-left: 3px solid var(--color-primary); padding-left: 1rem; margin: 1rem 0; color: var(--color-text-caption); }
.article-content :deep(a) { color: var(--color-primary); }
.article-content :deep(img) { border-radius: 0.75rem; max-width: 100%; }
.article-content :deep(table) { width: 100%; border-collapse: collapse; margin: 1rem 0; }
.article-content :deep(th), .article-content :deep(td) { border: 1px solid var(--color-border-subtle); padding: 0.5rem 0.75rem; }
.article-content :deep(th) { background: var(--color-surface); }

.article-nav { display: flex; gap: 1rem; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border-subtle); }
.article-nav-btn {
  flex: 1; padding: 0.75rem 1rem; border-radius: 0.75rem; transition: all 0.2s;
  background: var(--color-surface); border: 1px solid var(--color-border-subtle);
}
.article-nav-btn:hover { border-color: var(--color-border-glow); background: var(--color-surface-raised); }

.toc-slide-enter-active, .toc-slide-leave-active { transition: all 0.3s ease; }
.toc-slide-enter-from, .toc-slide-leave-to { opacity: 0; }
.toc-slide-enter-from > :last-child { transform: translateX(100%); }
.toc-slide-enter-active > :last-child { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.toc-slide-leave-active > :last-child { transition: transform 0.25s ease-in; }
.toc-slide-leave-to > :last-child { transform: translateX(100%); }

.vertical-text { writing-mode: vertical-rl; }

.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

@media (max-width: 1024px) {
  .article-body, .article-body.text-sm, .article-body.text-lg { max-width: 100%; }
  .article-body { padding: 1.5rem; border-radius: 1rem; }
  .article-title { font-size: 1.35rem; }
}
</style>
