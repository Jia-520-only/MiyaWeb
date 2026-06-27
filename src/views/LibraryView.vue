<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12">
      <!-- Page Header -->
      <div class="text-center mb-16 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          <span class="text-gradient">图书组</span>
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          技术笔记、文章、小说与幻想 — 所有内容，一本收藏
        </p>
      </div>

      <!-- Collections Grid -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="collections.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="col in collections"
          :key="col.id"
          :to="`/library/${col.id}`"
          class="group glass-card p-6 hover:scale-[1.02] transition-all duration-300 animate-slide-up"
          :style="{ animationDelay: `${collections.indexOf(col) * 80}ms` }"
        >
          <div class="flex items-start gap-4">
            <!-- Cover -->
            <div class="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-glass" :style="{ backgroundColor: getCollectionColor(col.type) }">
              <img v-if="col.cover_image" :src="col.cover_image" :alt="col.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-white">
                <Icon :name="col.type === 'book_group' ? 'solar:notebook-bold-duotone' : 'solar:star-shine-bold-duotone'" size="xl" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  {{ col.type === 'book_group' ? '图书' : '伴侣' }}
                </span>
                <span class="text-xs text-gray-400">{{ col.item_count || 0 }} 项</span>
              </div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {{ col.name }}
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                {{ col.description || '暂无描述' }}
              </p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24 animate-fade-in">
        <Icon name="solar:notebook-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无图书组</h3>
        <p class="text-gray-500 dark:text-gray-400">管理员还没有创建任何图书组</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collectionAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const collections = ref<any[]>([])
const isLoading = ref(true)

const getCollectionColor = (type: string) => {
  return type === 'book_group' ? '#14b8a6' : '#a78bfa'
}

onMounted(async () => {
  try {
    const res = await collectionAPI.getAll()
    collections.value = res.collections || []
  } catch (e) {
    console.error('加载图书组失败:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
