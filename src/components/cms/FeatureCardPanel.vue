<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold text-white">首页卡片封面</h2>
    <p class="text-caption">为首页功能卡片设置封面图。图片从侧边栏图库或资源中心选取。</p>

    <div class="space-y-3">
      <div v-for="card in cards" :key="card.key" class="glass-card !p-4 flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style="background: var(--color-surface);">
          <img v-if="card.cover" :src="card.cover" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center" :style="{ background: card.color + '30' }">
            <Icon :name="card.icon" size="sm" :color="card.color" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium" style="color: var(--color-text);">{{ card.title }}</p>
          <input v-model="card.cover" class="input-field !py-1 !px-2 !text-xs mt-1" placeholder="图片 URL（可从资源中心复制）" />
        </div>
        <button @click="saveCard(card)" class="btn-primary text-xs">保存</button>
      </div>
    </div>
    <p v-if="msg" class="text-xs" :class="ok ? 'text-emerald-400' : 'text-red-400'">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { contentAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const cards = ref([
  { key: 'blog', title: '技术笔记', icon: 'solar:document-text-bold-duotone', color: '#00FFF5', cover: '' },
  { key: 'library', title: '创作', icon: 'solar:notebook-bold-duotone', color: '#ffd700', cover: '' },
  { key: 'gallery', title: '人文', icon: 'solar:gallery-wide-bold-duotone', color: '#ff6b9d', cover: '' },
  { key: 'companions', title: 'OC 社区', icon: 'solar:star-shine-bold-duotone', color: '#7dd3fc', cover: '' },
  { key: 'resources', title: '免费资源', icon: 'solar:gift-bold-duotone', color: '#4ade80', cover: '' },
  { key: 'links', title: '推荐链接', icon: 'solar:link-round-bold-duotone', color: '#a78bfa', cover: '' },
])

const msg = ref('')
const ok = ref(true)

onMounted(async () => {
  try {
    const res = await contentAPI.getContent('home-feature-covers')
    if (res?.content) {
      const saved = JSON.parse(res.content)
      cards.value.forEach(c => {
        if (saved[c.key]) c.cover = saved[c.key]
      })
    }
  } catch { /* defaults */ }
})

async function saveCard(card: any) {
  msg.value = ''; ok.value = true
  try {
    const data: Record<string, string> = {}
    cards.value.forEach(c => { data[c.key] = c.cover })
    const payload = { id: 'home-feature-covers', type: 'text', title: '首页卡片封面', content: JSON.stringify(data), page: 'home', section: 'feature-covers' }
    try { await contentAPI.updateContent('home-feature-covers', payload) }
    catch { await contentAPI.createContent(payload) }
    msg.value = '保存成功'; ok.value = true
  } catch (e: any) { msg.value = e.error || '保存失败'; ok.value = false }
}
</script>
