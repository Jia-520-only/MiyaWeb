<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-4xl">
      <!-- Section Header with Stats -->
      <SectionHeader
        gradient-title="技术笔记"
        description="技术分享、开发心得、学习记录"
        :cover-image="coverImage"
        :stats="headerStats"
      >
        <template #actions>
          <button @click="sortBy = 'newest'" class="filter-btn" :class="{ active: sortBy === 'newest' }">最新</button>
          <button @click="sortBy = 'popular'" class="filter-btn" :class="{ active: sortBy === 'popular' }">热门</button>
        </template>
      </SectionHeader>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Posts -->
      <div v-else-if="sortedPosts.length > 0" class="space-y-4">
        <article v-for="(post, idx) in sortedPosts" :key="post.id"
          class="card p-5 md:p-6 group cursor-pointer hover:border-[var(--color-border-glow)] transition-all duration-300 card-glow"
          :style="{ animationDelay: `${idx * 50}ms` }"
          role="link" tabindex="0"
          @click="$router.push(`/blog/${post.id}`)"
          @keydown.enter="$router.push(`/blog/${post.id}`)"
          @keydown.space.prevent="$router.push(`/blog/${post.id}`)"
        >
          <div class="flex items-start gap-5">
            <div class="hidden sm:block w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.02]">
              <img v-if="post.cover_image" :src="post.cover_image" :alt="post.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center" style="background: var(--color-primary); opacity: 0.15;">
                <Icon name="solar:document-text-bold-duotone" size="md" :style="{ color: 'var(--color-primary)' }" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-caption font-mono text-[0.625rem]">{{ formatDate(post.created_at) }}</span>
                <span v-if="post.tags" class="text-caption">·</span>
                <span v-for="tag in parseTags(post.tags)" :key="tag" class="text-[0.5625rem] px-1.5 py-0.5 rounded-full" style="background: var(--color-surface); color: var(--color-text-caption);">{{ tag }}</span>
              </div>
              <h2 class="text-base font-semibold group-hover:text-[var(--color-primary)] transition-colors mb-1" style="color: var(--color-text);">
                {{ post.title }}
              </h2>
              <p class="text-sub text-[0.8125rem] line-clamp-2">{{ post.description || '' }}</p>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-20">
        <Icon name="solar:document-text-bold-duotone" size="xl" color="#4a525e" class="mb-4 empty-state-icon" />
        <h3 class="text-lg font-semibold mb-2" style="color: var(--color-text);">还没有文章</h3>
        <p class="text-sub text-sm">前往 <router-link to="/cms" class="hover:underline" style="color: var(--color-primary);">管理后台</router-link> 创建第一篇技术笔记</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SectionHeader from '@/components/SectionHeader.vue'
import { fetchCoverImage } from '@/utils/coverImage'
import Icon from '@/components/ui/Icon.vue'

const posts = ref<any[]>([])
const isLoading = ref(true)
const sortBy = ref<'newest' | 'popular'>('newest')
const coverImage = ref('')

const headerStats = computed(() => [
  { label: '文章', value: posts.value.length },
  { label: '浏览', value: posts.value.reduce((s, p) => s + (p.view_count || 0), 0) },
])

const sortedPosts = computed(() => {
  const list = [...posts.value]
  if (sortBy.value === 'popular') list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
  return list
})

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
const parseTags = (tags: string) => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

onMounted(async () => {
  coverImage.value = await fetchCoverImage('blog')

  try {
    const res = await fetch('/api/collections?type=blog')
    const data = await res.json()
    const blogCol = data.collections?.find((c: any) => c.type === 'blog')
    if (blogCol) {
      const itemsRes = await fetch(`/api/collections/${blogCol.id}/items`)
      const itemsData = await itemsRes.json()
      posts.value = (itemsData.items || []).filter((i: any) => i.status === 'published')
    }
  } catch (e) { console.error('Failed to load posts:', e) }
  finally { isLoading.value = false }
})
</script>

<style scoped>
.filter-btn {
  padding: 0.35rem 1rem; border-radius: 999px; font-size: 0.8125rem; font-weight: 500;
  transition: all 0.2s;
  background: var(--color-surface); border: 1px solid var(--color-border-subtle);
  color: var(--color-text-dim);
}
.filter-btn:hover { border-color: var(--color-border-glow); color: var(--color-text); }
.filter-btn.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
