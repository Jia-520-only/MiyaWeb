<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-4xl">
      <SectionHeader
        title="关于"
        description="了解这个网站、创作者和 Miya 的故事"
        :cover-image="coverImage"
        :stats="headerStats"
      />

      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else>
        <section v-for="(card, idx) in cards" :key="card.id" class="mb-8 animate-fade-in" :style="{ animationDelay: `${idx * 0.08}s` }">
          <div class="card p-8 md:p-10">
            <h2 v-if="card.title" class="text-xl font-bold mb-4" style="color: var(--color-text);">{{ card.title }}</h2>
            <div class="prose-custom" v-html="renderMarkdown(card.content)" />
          </div>
        </section>
        <div v-if="cards.length === 0" class="text-caption text-center py-12">暂无内容</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import SectionHeader from '@/components/SectionHeader.vue'
import { fetchCoverImage } from '@/utils/coverImage'
import { contentAPI } from '@/utils/apiClient'

const loading = ref(true)
const cards = ref<{ id: string; title: string; content: string }[]>([])
const coverImage = ref('')

const renderMarkdown = (text: string) => {
  if (!text) return ''
  try { return marked(text) } catch { return text.replace(/\n/g, '<br>') }
}

onMounted(async () => {
  coverImage.value = await fetchCoverImage('about')

  // Load cards from content API
  try {
    const res = await contentAPI.getPageContents('about')
    const secs = res.sections || {}
    const items = secs.main
    if (items && items.length > 0) {
      const raw = items[0].content
      if (Array.isArray(raw)) cards.value = raw
      else if (typeof raw === 'string') { try { cards.value = JSON.parse(raw) } catch { cards.value = [] } }
    }
  } catch { cards.value = [] }

  // Fetch real stats
  try {
    const [blogRes, libRes, ocRes, resRes] = await Promise.all([
      fetch('/api/collections?type=blog').then(r => r.json()),
      fetch('/api/collections?type=book_group').then(r => r.json()),
      fetch('/api/collections?type=companion_group&visible=true').then(r => r.json()),
      fetch('/api/resources').then(r => r.json()),
    ])
    const blogCol = blogRes.collections?.find((c: any) => c.type === 'blog')
    let articles = 0; let items = 0
    if (blogCol) { const ir = await fetch(`/api/collections/${blogCol.id}/items`).then(r => r.json()); articles = ir.items?.length || 0 }
    const libCols = libRes.collections || []
    for (const c of libCols) { const ir = await fetch(`/api/collections/${c.id}/items`).then(r => r.json()); items += ir.items?.length || 0 }
    const ocCols = ocRes.collections || []
    let ocTotal = 0; for (const c of ocCols) { const ir = await fetch(`/api/collections/${c.id}/items`).then(r => r.json()); ocTotal += ir.items?.length || 0 }
    headerStats.value = [
      { label: '文章', value: articles },
      { label: '创作', value: items },
      { label: 'OC', value: ocTotal },
      { label: '资源', value: resRes.resources?.length || 0 },
    ]
  } catch {}
  finally { loading.value = false }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.6s ease-out both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.prose-custom { line-height: 1.85; color: var(--color-text-dim); }
.prose-custom :deep(h1), .prose-custom :deep(h2), .prose-custom :deep(h3) { color: var(--color-text); font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
.prose-custom :deep(h1) { font-size: 1.5rem; }
.prose-custom :deep(h2) { font-size: 1.25rem; }
.prose-custom :deep(p) { margin-bottom: 1em; }
.prose-custom :deep(ul), .prose-custom :deep(ol) { margin-bottom: 1em; padding-left: 1.5em; }
.prose-custom :deep(li) { margin-bottom: 0.35em; }
.prose-custom :deep(a) { color: var(--color-primary); }
.prose-custom :deep(code) { background: var(--color-surface); padding: 0.15em 0.35em; border-radius: 0.25em; font-size: 0.875em; font-family: 'JetBrains Mono', monospace; color: var(--color-primary-glow); }
.prose-custom :deep(pre) { background: var(--color-surface); padding: 1em; border-radius: 0.5em; overflow-x: auto; margin-bottom: 1em; }
.prose-custom :deep(pre code) { background: none; padding: 0; color: var(--color-text-dim); }
.prose-custom :deep(blockquote) { border-left: 3px solid var(--color-primary); padding-left: 1em; margin-bottom: 1em; color: var(--color-text-caption); }
.prose-custom :deep(table) { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
.prose-custom :deep(th), .prose-custom :deep(td) { border: 1px solid var(--color-border-subtle); padding: 0.5rem 1rem; }
.prose-custom :deep(th) { background: var(--color-surface); font-weight: 600; color: var(--color-text); }
.prose-custom :deep(strong) { color: var(--color-text); }
.prose-custom :deep(img) { max-width: 100%; border-radius: 0.5rem; margin: 1rem 0; }
</style>
