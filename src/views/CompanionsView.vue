<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12">
      <!-- Page Header -->
      <div class="text-center mb-16 animate-fade-in">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          <span class="text-gradient">伴侣社区</span>
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          分享你的 AI 伴侣、人设、故事与图片
        </p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Companion Groups -->
      <template v-else>
        <!-- Group: Companion -->
        <div v-if="companionCollections.length > 0">
          <div
            v-for="col in companionCollections"
            :key="col.id"
            class="mb-14"
          >
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="section-title mb-1">{{ col.name }}</h2>
                <p v-if="col.description" class="text-sm text-gray-500 dark:text-gray-400">{{ col.description }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <div
                v-for="companion in getCollectionItems(col.id)"
                :key="companion.id"
                @click="$router.push(`/companions/${companion.id}`)"
                class="group glass-card overflow-hidden cursor-pointer hover:scale-[1.01] transition-all duration-300 animate-slide-up"
                :style="{ animationDelay: `${getCollectionItems(col.id).indexOf(companion) * 60}ms` }"
              >
                <!-- Cover Image -->
                <div class="aspect-[4/3] overflow-hidden">
                  <img
                    v-if="companion.cover_image"
                    :src="companion.cover_image"
                    :alt="companion.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div v-else class="w-full h-full bg-gradient-to-br from-primary-200 to-secondary-200 dark:from-primary-800 dark:to-secondary-800 flex items-center justify-center">
                    <Icon name="solar:star-shine-bold-duotone" size="xl" color="#fff" />
                  </div>
                </div>

                <!-- Info -->
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                    {{ companion.title }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {{ companion.description || '暂无介绍' }}
                  </p>
                  <div v-if="companion.tags" class="flex flex-wrap gap-1.5 mt-3">
                    <span v-for="tag in parseJSON(companion.tags)" :key="tag" class="text-xs px-2 py-0.5 rounded-full bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-24 animate-fade-in">
          <Icon name="solar:star-shine-bold-duotone" size="xl" color="#a5b4c8" class="mb-4" />
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无伴侣</h3>
          <p class="text-gray-500 dark:text-gray-400">还没有人分享 AI 伴侣</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collectionAPI } from '@/utils/apiClient'
import type { collectionAPI as _ } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const collections = ref<any[]>([])
const isLoading = ref(true)

const companionCollections = computed(() =>
  collections.value.filter(c => c.type === 'companion_group' && c.is_visible)
)

const getCollectionItems = (collectionId: number) => {
  const col = collections.value.find(c => c.id === collectionId)
  return col?.items || []
}

const parseJSON = (str: string | null): string[] => {
  if (!str) return []
  try { return JSON.parse(str) } catch { return [] }
}

onMounted(async () => {
  try {
    const res = await collectionAPI.getAll({ type: 'companion_group', visible: 'true' })
    collections.value = res.collections || []
  } catch (e) {
    console.error('加载伴侣社区失败:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
