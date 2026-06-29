<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12">
      <SectionHeader
        gradient-title="创作"
        description="原创小说、幻想世界、文字创作"
        :cover-image="coverImage"
        :stats="headerStats"
      />

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="collections.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="(col, idx) in collections"
          :key="col.id"
          :to="`/library/${col.id}`"
          class="group relative glass-card p-6 card-enter glow-hover"
          :style="{ animationDelay: `${idx * 80}ms` }"
        >
          <!-- Top accent line on hover -->
          <div class="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 relative group/icon" :style="{ background: `linear-gradient(135deg, ${getCollectionColor(col.type)}, ${getCollectionColorDark(col.type)})` }">
              <img v-if="col.cover_image" :src="col.cover_image" :alt="col.name" class="w-full h-full object-cover" loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center text-white">
                <Icon :name="col.type === 'book_group' ? 'solar:notebook-bold-duotone' : 'solar:star-shine-bold-duotone'" size="xl" />
              </div>
              <div class="absolute inset-0 bg-white/0 group-hover/icon:bg-white/10 transition-colors duration-300" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge" :class="col.type === 'book_group' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'">
                  {{ col.type === 'book_group' ? '图书' : 'OC' }}
                </span>
                <span class="text-xs text-gray-400 font-mono">{{ (col.itemCount ?? col.item_count) || 0 }} 项</span>
              </div>
              <h2 class="text-lg font-semibold text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {{ col.name }}
              </h2>
              <p class="text-sm text-gray-400 line-clamp-2 mt-1">
                {{ col.description || '暂无描述' }}
              </p>
            </div>
          </div>
        </router-link>
      </div>

      <div v-else class="text-center py-24 animate-fade-in">
        <Icon name="solar:notebook-bold-duotone" size="xl" color="#a5b4c8" class="mb-4 empty-state-icon" />
        <h3 class="text-xl font-semibold text-white mb-2">暂无图书组</h3>
        <p class="text-sub text-sm">管理员还没有创建任何图书组</p>
        <p class="text-caption mt-3">前往 <router-link to="/cms" class="text-cyber-teal hover:underline">管理后台</router-link> 创建你的第一个创作集合</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collectionAPI } from '@/utils/apiClient'
import SectionHeader from '@/components/SectionHeader.vue'
import { fetchCoverImage } from '@/utils/coverImage'
import Icon from '@/components/ui/Icon.vue'

const collections = ref<any[]>([])
const isLoading = ref(true)
const coverImage = ref('')

const headerStats = computed(() => [
  { label: '图书组', value: collections.value.length },
  { label: '条目', value: collections.value.reduce((s: number, c: any) => s + ((c.itemCount ?? c.item_count) || 0), 0) },
])

const getCollectionColor = (type: string) => type === 'book_group' ? '#14b8a6' : '#a78bfa'
const getCollectionColorDark = (type: string) => type === 'book_group' ? '#0d9488' : '#7c3aed'

onMounted(async () => {
  coverImage.value = await fetchCoverImage('library')

  try {
    const res = await collectionAPI.getAll({ type: 'book_group' })
    collections.value = res.collections || []
  } catch (e) {
    console.error('加载图书组失败:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.card-enter {
  animation: cardEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
