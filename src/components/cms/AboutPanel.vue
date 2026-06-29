<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">关于页面</h2>
      <button @click="addCard" class="btn-primary text-sm">
        <Icon name="solar:add-circle-linear" size="xs" /> 添加卡片
      </button>
    </div>
    <p class="text-caption">自由编辑关于页面的内容卡片，支持 Markdown。可添加、编辑、删除、排序。</p>

    <div v-if="cards.length === 0" class="text-caption text-center py-12">暂无卡片，点击「添加卡片」开始编辑</div>

    <div v-else class="space-y-4">
      <div v-for="(card, idx) in cards" :key="card.id" class="glass-card !p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400">卡片 {{ idx + 1 }}</span>
          <div class="flex items-center gap-1">
            <button @click="moveUp(idx)" :disabled="idx === 0" class="p-1 text-gray-400 hover:text-white disabled:opacity-20"><Icon name="solar:alt-arrow-up-linear" size="xs" /></button>
            <button @click="moveDown(idx)" :disabled="idx === cards.length - 1" class="p-1 text-gray-400 hover:text-white disabled:opacity-20"><Icon name="solar:alt-arrow-down-linear" size="xs" /></button>
            <button @click="removeCard(idx)" class="p-1 text-gray-400 hover:text-red-400"><Icon name="solar:trash-bin-trash-linear" size="xs" /></button>
          </div>
        </div>
        <input v-model="card.title" class="input-field text-sm" placeholder="卡片标题（可选）" />
        <textarea v-model="card.content" class="input-field !h-40 resize-y text-sm font-mono" placeholder="Markdown 内容..." />
        <button @click="saveCard(idx)" class="btn-primary text-sm" :disabled="saving === idx">{{ saving === idx ? '保存中...' : '保存' }}</button>
      </div>
    </div>

    <div class="flex gap-3">
      <button @click="saveAll" class="btn-primary" :disabled="saving !== null">{{ saving !== null ? '保存中...' : '全部保存' }}</button>
    </div>
    <p v-if="msg" class="text-xs" :class="ok ? 'text-emerald-400' : 'text-red-400'">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { contentAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

interface Card { id: string; title: string; content: string }

const cards = ref<Card[]>([])
const saving = ref<number | null>(null)
const msg = ref('')
const ok = ref(true)

onMounted(async () => {
  try {
    const res = await contentAPI.getPageContents('about')
    const secs = res.sections || {}
    const items = secs.main
    if (items && items.length > 0) {
      const raw = items[0].content
      if (Array.isArray(raw)) cards.value = raw
      else if (typeof raw === 'string') { try { cards.value = JSON.parse(raw) } catch { cards.value = [] } }
    }
  } catch {}
})

function addCard() { cards.value.push({ id: 'c' + Date.now(), title: '', content: '' }) }
function removeCard(idx: number) { cards.value.splice(idx, 1) }
function moveUp(idx: number) { if (idx > 0) { [cards.value[idx - 1], cards.value[idx]] = [cards.value[idx], cards.value[idx - 1]] } }
function moveDown(idx: number) { if (idx < cards.value.length - 1) { [cards.value[idx], cards.value[idx + 1]] = [cards.value[idx + 1], cards.value[idx]] } }

async function saveCard(idx: number) {
  saving.value = idx; msg.value = ''
  try {
    await doSave()
    msg.value = '已保存'; ok.value = true
  } catch (e: any) { msg.value = e.error || '保存失败'; ok.value = false }
  finally { saving.value = null }
}

async function saveAll() {
  saving.value = -1; msg.value = ''
  try {
    await doSave()
    msg.value = `已保存 ${cards.value.length} 张卡片`; ok.value = true
  } catch (e: any) { msg.value = e.error || '保存失败'; ok.value = false }
  finally { saving.value = null }
}

async function doSave() {
  const payload = {
    id: 'about-content',
    type: 'object',
    title: '关于页面',
    content: JSON.stringify(cards.value),
    page: 'about',
    section: 'main',
  }
  try { await contentAPI.updateContent(payload.id, payload) }
  catch { await contentAPI.createContent(payload) }
}
</script>
