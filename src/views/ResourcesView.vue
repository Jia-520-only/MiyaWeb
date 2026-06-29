<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-6xl">
      <!-- Header -->
      <SectionHeader
        gradient-title="免费资源"
        description="为爱发电，分享优质资源链接"
        :cover-image="coverImage"
      />

      <!-- Category Filter -->
      <div v-if="categories.length > 0" class="flex flex-wrap justify-center gap-2 mb-10">
        <button
          @click="selectedCategory = null"
          class="filter-btn"
          :class="{ 'filter-active': !selectedCategory }"
        >全部</button>
        <button
          v-for="cat in categories" :key="cat"
          @click="selectedCategory = cat"
          class="filter-btn"
          :class="{ 'filter-active': selectedCategory === cat }"
        >{{ cat }}</button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Resource Cards -->
      <div v-else-if="filteredResources.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <router-link
          v-for="(res, idx) in filteredResources"
          :key="res.id"
          :to="`/resources/${res.id}`"
          class="res-card group"
          :style="{ animationDelay: `${idx * 60}ms` }"
        >
          <!-- Cover image -->
          <div class="res-cover">
            <img v-if="res.cover_image" :src="res.cover_image" :alt="res.title" class="w-full h-full object-cover" loading="lazy" />
            <div v-else class="w-full h-full flex items-center justify-center text-3xl"
              style="background: linear-gradient(135deg, var(--color-primary), var(--color-primary-deep));">
              <Icon :name="res.icon || 'solar:link-round-bold-duotone'" size="lg" color="#fff" />
            </div>
            <div class="res-category-badge" v-if="res.category">{{ res.category }}</div>
          </div>

          <!-- Body -->
          <div class="res-body">
            <h3 class="res-title">{{ res.title }}</h3>
            <p v-if="res.description" class="text-sub text-sm line-clamp-2 mt-1">{{ res.description }}</p>
            <div class="flex items-center justify-between mt-3 pt-3" style="border-top: 1px solid var(--color-border-subtle);">
              <span class="text-caption font-mono text-[0.625rem]">{{ res.download_count || 0 }} 次访问</span>
              <span class="res-visit">
                访问 <Icon name="solar:arrow-right-up-bold" size="xs" />
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-24">
        <Icon name="solar:gift-bold-duotone" size="xl" color="#4a525e" class="mb-4 empty-state-icon" />
        <h3 class="text-xl font-semibold mb-2" style="color: var(--color-text);">暂无资源</h3>
        <p class="text-sub text-sm">管理员还没有添加任何资源链接</p>
        <p class="text-caption mt-3">前往 <router-link to="/cms" class="hover:underline" style="color: var(--color-primary);">管理后台</router-link> 添加第一个免费资源</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { resourceAPI } from '@/utils/apiClient'
import SectionHeader from '@/components/SectionHeader.vue'
import { fetchCoverImage } from '@/utils/coverImage'
import Icon from '@/components/ui/Icon.vue'

const resources = ref<any[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref<string | null>(null)
const isLoading = ref(true)
const coverImage = ref('')

const filteredResources = computed(() => {
  if (!selectedCategory.value) return resources.value
  return resources.value.filter(r => r.category === selectedCategory.value)
})

onMounted(async () => {
  coverImage.value = await fetchCoverImage('resources')

  try {
    const [resData, catData] = await Promise.all([
      resourceAPI.getAll(),
      resourceAPI.getCategories()
    ])
    resources.value = resData.resources || []
    categories.value = catData.categories || []
  } catch (e) { console.error('加载资源失败:', e) }
  finally { isLoading.value = false }
})
</script>

<style scoped>
.res-card {
  display: flex; flex-direction: column;
  border-radius: 1rem; overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  text-decoration: none;
  animation: cardEnter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.res-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-border-glow);
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.res-cover {
  aspect-ratio: 16/9; overflow: hidden; position: relative;
}
.res-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.res-card:hover .res-cover img { transform: scale(1.06); }
.res-category-badge {
  position: absolute; top: 0.5rem; left: 0.5rem;
  padding: 0.15rem 0.5rem; border-radius: 999px;
  font-size: 0.625rem; font-weight: 500;
  background: rgba(0,0,0,0.5); color: rgba(255,255,255,0.8);
  backdrop-filter: blur(4px);
}
.res-body { padding: 1rem 1.25rem; flex: 1; display: flex; flex-direction: column; }
.res-title {
  font-size: 0.9375rem; font-weight: 600;
  color: var(--color-text);
  transition: color 0.3s;
  line-clamp: 1; overflow: hidden;
}
.res-card:hover .res-title { color: var(--color-primary); }
.res-visit {
  display: flex; align-items: center; gap: 0.25rem;
  font-size: 0.75rem; font-weight: 500;
  color: var(--color-primary);
  transition: transform 0.3s;
}
.res-card:hover .res-visit { transform: translateX(2px); }

.filter-btn {
  padding: 0.4rem 1rem; border-radius: 999px;
  font-size: 0.8125rem; font-weight: 500;
  transition: all 0.3s;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-dim);
}
.filter-btn:hover { border-color: var(--color-border-glow); color: var(--color-text); }
.filter-active {
  background: var(--color-primary); color: #fff;
  border-color: var(--color-primary);
}

.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(16px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
