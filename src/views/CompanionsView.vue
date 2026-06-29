<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12">
      <div class="text-center mb-10 animate-fade-in">
        <SectionHeader
          gradient-title="OC 社区"
          description="分享你的原创角色、人设、故事与图片"
          :cover-image="coverImage"
          :stats="headerStats"
        />
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else>
        <!-- Tab Switcher -->
        <div class="flex justify-center gap-2 mb-10">
          <button @click="activeTab = 'cards'" class="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
            :style="activeTab === 'cards' ? { background: 'var(--color-primary)', color: '#fff' } : { background: 'var(--color-surface)', color: 'var(--color-text-dim)' }">
            <Icon name="solar:users-group-rounded-bold-duotone" size="sm" class="mr-1" />OC 列表
          </button>
          <button @click="activeTab = 'wall'" class="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
            :style="activeTab === 'wall' ? { background: 'var(--color-primary)', color: '#fff' } : { background: 'var(--color-surface)', color: 'var(--color-text-dim)' }">
            <Icon name="solar:gallery-wide-bold-duotone" size="sm" class="mr-1" />全站图廊
            <span v-if="allImages.length" class="ml-1 text-xs opacity-70">({{ allImages.length }})</span>
          </button>
        </div>

        <!-- OC Cards Tab -->
        <div v-if="activeTab === 'cards'">
          <div v-if="companionCollections.length > 0">
            <div v-for="col in companionCollections" :key="col.id" class="mb-14">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h2 class="section-title mb-1">{{ col.name }}</h2>
                  <p v-if="col.description" class="text-sub text-sm">{{ col.description }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <div v-for="(oc, idx) in getCollectionItems(col.id)" :key="oc.id"
                  role="link" tabindex="0"
                  @click="$router.push(`/companions/${oc.id}`)"
                  @keydown.enter="$router.push(`/companions/${oc.id}`)"
                  @keydown.space.prevent="$router.push(`/companions/${oc.id}`)"
                  class="oc-card group cursor-pointer" :style="{ animationDelay: `${idx * 60}ms` }">
                  <div class="oc-card-cover">
                    <img v-if="oc.cover_image" :src="oc.cover_image" :alt="oc.title" class="w-full h-full object-cover" loading="lazy" />
                    <div v-else class="w-full h-full flex items-center justify-center" style="background: var(--color-primary);">
                      <Icon name="solar:star-shine-bold-duotone" size="xl" color="#fff" />
                    </div>
                    <div class="oc-card-overlay"><Icon name="solar:eye-bold" size="sm" color="#fff" /></div>
                  </div>
                  <div class="oc-card-body">
                    <h3 class="oc-card-title">{{ oc.title }}</h3>
                    <p class="text-caption line-clamp-1">{{ oc.description || '暂无介绍' }}</p>
                    <div v-if="oc.tags" class="flex flex-wrap gap-1 mt-2">
                      <span v-for="tag in parseJSON(oc.tags)" :key="tag" class="text-[0.5625rem] px-1.5 py-0.5 rounded-full" style="background: var(--color-surface); color: var(--color-text-caption);">{{ tag }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <Icon name="solar:star-shine-bold-duotone" size="xl" color="#4a525e" class="mb-4 empty-state-icon" />
            <h3 class="text-xl font-semibold mb-2" style="color: var(--color-text);">暂无 OC</h3>
            <p class="text-sub text-sm">还没有人分享原创角色</p>
            <p class="text-caption mt-3">前往 <router-link to="/cms" class="hover:underline" style="color: var(--color-primary);">管理后台</router-link> 分享你的第一个 OC</p>
          </div>
        </div>

        <!-- Image Wall Tab -->
        <div v-if="activeTab === 'wall'">
          <OCWall v-if="allImages.length > 0" :images="allImages" />
          <div v-else class="text-center py-12">
            <Icon name="solar:gallery-wide-bold-duotone" size="xl" color="#4a525e" class="mb-4 empty-state-icon" />
            <h3 class="text-xl font-semibold mb-2" style="color: var(--color-text);">暂无图廊</h3>
            <p class="text-sub text-sm">还没有 OC 图片，去 OC 详情页上传吧</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collectionAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'
import OCWall from '@/components/OCWall.vue'
import SectionHeader from '@/components/SectionHeader.vue'
import { fetchCoverImage } from '@/utils/coverImage'

const collections = ref<any[]>([])
const collectionItems = ref<Record<number, any[]>>({})
const allImages = ref<any[]>([])
const isLoading = ref(true)
const activeTab = ref<'cards' | 'wall'>('cards')
const coverImage = ref('')

const companionCollections = computed(() => collections.value.filter(c => c.type === 'companion_group' && c.is_visible))
const ocCount = computed(() => Object.values(collectionItems.value).reduce((s, items) => s + items.length, 0))
const groupCount = computed(() => companionCollections.value.length)
const headerStats = computed(() => [
  { label: 'OC', value: ocCount.value },
  { label: '图片', value: allImages.value.length },
  { label: '分组', value: groupCount.value },
])
const getCollectionItems = (id: number) => collectionItems.value[id] || []
const parseJSON = (str: string | null): string[] => { if (!str) return []; try { return JSON.parse(str) } catch { return [] } }

onMounted(async () => {
  coverImage.value = await fetchCoverImage('companions')

  try {
    const [colRes, imgRes] = await Promise.all([
      collectionAPI.getAll({ type: 'companion_group', visible: 'true' }),
      fetch('/api/oc-images').then(r => r.json())
    ])
    const cols = colRes.collections || []
    collections.value = cols
    allImages.value = imgRes.images || []

    const itemsMap: Record<number, any[]> = {}
    await Promise.all(cols.map(async (col: any) => {
      try { const r = await fetch(`/api/collections/${col.id}/items`); const d = await r.json(); itemsMap[col.id] = (d.items || []).filter((i: any) => i.status === 'published') }
      catch { itemsMap[col.id] = [] }
    }))
    collectionItems.value = itemsMap
  } catch (e) { console.error('加载失败:', e) }
  finally { isLoading.value = false }
})
</script>

<style scoped>
.oc-card { border-radius: 1rem; overflow: hidden; background: var(--color-surface); border: 1px solid var(--color-border-subtle); transition: all 0.35s ease; }
.oc-card:hover { transform: translateY(-4px); border-color: var(--color-border-glow); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
.oc-card-cover { aspect-ratio: 2/3; overflow: hidden; position: relative; }
@media (min-width: 640px) { .oc-card-cover { aspect-ratio: 3/4; } }
.oc-card-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.oc-card:hover .oc-card-cover img { transform: scale(1.06); }
.oc-card-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; }
.oc-card:hover .oc-card-overlay { opacity: 1; }
.oc-card-body { padding: 0.75rem 1rem; }
.oc-card-title { font-weight: 600; font-size: 0.9375rem; color: var(--color-text); transition: color 0.3s; }
.oc-card:hover .oc-card-title { color: var(--color-primary); }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
</style>
