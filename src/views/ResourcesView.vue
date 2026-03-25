<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-5xl">
      <!-- Page Header -->
      <div class="text-center mb-14 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          <span class="text-gradient">免费资源</span>
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          为爱发电，分享优质资源链接
        </p>
        <div class="mt-4 inline-block">
          <span class="badge bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 text-sm px-3 py-1">
            <Icon name="solar:heart-bold" size="sm" class="mr-1" />
            全部免费
          </span>
        </div>
      </div>

      <!-- Category Filter -->
      <div v-if="categories.length > 0" class="flex flex-wrap justify-center gap-2 mb-10">
        <button
          @click="selectedCategory = null"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            !selectedCategory
              ? 'bg-primary-500 text-white shadow-glass'
              : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70 backdrop-blur-sm'
          ]"
        >
          全部
        </button>
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
            selectedCategory === cat
              ? 'bg-primary-500 text-white shadow-glass'
              : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-800/70 backdrop-blur-sm'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Resources Grid -->
      <div v-else-if="filteredResources.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <a
          v-for="(res, index) in filteredResources"
          :key="res.id"
          :href="res.url"
          target="_blank"
          rel="noopener noreferrer"
          class="glass-card p-6 hover:scale-[1.01] transition-all duration-300 group animate-slide-up no-underline"
          :style="{ animationDelay: `${index * 60}ms` }"
        >
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 flex items-center justify-center flex-shrink-0">
              <Icon v-if="res.icon" :name="res.icon" size="lg" />
              <Icon v-else name="solar:link-round-bold-duotone" size="lg" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {{ res.title }}
              </h3>
              <span v-if="res.category" class="text-xs text-gray-400">{{ res.category }}</span>
            </div>
          </div>
          <p v-if="res.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
            {{ res.description }}
          </p>
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>{{ res.download_count || 0 }} 次访问</span>
            <span class="flex items-center gap-1 text-primary-500 group-hover:translate-x-0.5 transition-transform">
              访问 <Icon name="solar:arrow-right-up-bold" size="xs" />
            </span>
          </div>
        </a>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-24 animate-fade-in">
        <Icon name="solar:gift-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无资源</h3>
        <p class="text-gray-500 dark:text-gray-400">管理员还没有添加任何资源链接</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { resourceAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const resources = ref<any[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref<string | null>(null)
const isLoading = ref(true)

const filteredResources = computed(() => {
  if (!selectedCategory.value) return resources.value
  return resources.value.filter(r => r.category === selectedCategory.value)
})

onMounted(async () => {
  try {
    const [resData, catData] = await Promise.all([
      resourceAPI.getAll(),
      resourceAPI.getCategories()
    ])
    resources.value = resData.resources || []
    categories.value = catData.categories || []
  } catch (e) {
    console.error('加载资源失败:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
a { text-decoration: none; }
</style>
