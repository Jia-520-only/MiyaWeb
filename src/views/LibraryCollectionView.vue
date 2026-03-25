<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-6xl">
      <!-- Back -->
      <button @click="$router.push('/library')" class="btn-ghost mb-8 animate-fade-in">
        <Icon name="solar:arrow-left-bold" size="sm" />
        <span>返回图书组</span>
      </button>

      <!-- Collection Header -->
      <div v-if="collection" class="mb-12 animate-fade-in">
        <div class="flex items-center gap-3 mb-3">
          <span class="badge bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            {{ collection.type === 'book_group' ? '图书组' : '伴侣组' }}
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          {{ collection.name }}
        </h1>
        <p v-if="collection.description" class="text-gray-500 dark:text-gray-400 text-lg">{{ collection.description }}</p>
      </div>

      <!-- Items Grid -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="items.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          @click="$router.push(`/library/${$route.params.collectionId}/${item.id}`)"
          class="group cursor-pointer animate-slide-up"
          :style="{ animationDelay: `${index * 60}ms` }"
        >
          <div class="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-glass hover:shadow-glass-lg transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1">
            <img v-if="item.cover_image" :src="item.cover_image" :alt="item.title" class="w-full h-full object-cover" loading="lazy" />
            <div v-else class="w-full h-full flex items-center justify-center text-white text-3xl font-bold" :style="{ backgroundColor: itemColors[index % itemColors.length] }">
              {{ item.title.charAt(0) }}
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div class="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p class="text-white text-xs line-clamp-2">{{ item.description || item.title }}</p>
            </div>
          </div>
          <p class="mt-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 text-center line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {{ item.title }}
          </p>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="text-center py-24 animate-fade-in">
        <Icon name="solar:book-2-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无内容</h3>
        <p class="text-gray-500 dark:text-gray-400">这个图书组还没有添加任何内容</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { collectionAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const collection = ref<any>(null)
const items = ref<any[]>([])
const isLoading = ref(true)

const itemColors = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

onMounted(async () => {
  try {
    const id = Number(route.params.collectionId)
    const res = await collectionAPI.getById(id)
    collection.value = res.collection
    items.value = res.items || []
  } catch (e) {
    console.error('加载失败:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
