<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-xl font-bold text-white mb-2">背景设置</h2>
      <p class="text-sm text-hud-dim">管理全站页面背景图。也可从资源中心分发图片到此。</p>
    </div>

    <div class="card p-6">
      <h3 class="text-sm font-semibold text-white mb-4">当前背景图片 ({{ images.length }} 张)</h3>
      <div v-if="images.length === 0" class="text-caption text-center py-8">暂无背景图。上传或从资源中心分发。</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div v-for="(img, i) in images" :key="i"
          class="relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200 group cursor-pointer"
          :class="selectedImg === i ? 'border-[var(--color-primary)] scale-[1.02]' : 'border-white/6 hover:border-white/20'"
          @click="selectedImg = i">
          <img :src="img" class="w-full h-full object-cover" />
          <button @click="removeImage(i)"
            class="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
          <div class="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
            <span class="text-[0.625rem] text-white/70 truncate block">{{ getFileName(img) }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="triggerUpload" class="btn-secondary text-xs">+ 添加图片</button>
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleUpload" />
      </div>
    </div>

    <div class="card p-6 space-y-4">
      <h3 class="text-sm font-semibold text-white">显示设置</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-hud-dim mb-2">不透明度: {{ opacity }}%</label>
          <input v-model.number="opacity" type="range" min="0" max="100" step="5" class="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyber-teal" />
          <div class="flex justify-between text-[0.625rem] text-hud-dim mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <div>
          <label class="block text-xs text-hud-dim mb-2">模糊度: {{ blur }}px</label>
          <input v-model.number="blur" type="range" min="0" max="15" step="1" class="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyber-teal" />
        </div>
      </div>
    </div>

    <div class="flex gap-3">
      <button @click="saveSettings" class="btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存设置' }}</button>
      <button @click="clearAll" class="btn-secondary text-xs">清除所有背景</button>
    </div>
    <p v-if="saveMsg" class="text-xs" :class="saveOk ? 'text-emerald-400' : 'text-red-400'">{{ saveMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { contentAPI } from '@/utils/apiClient'

const images = ref<string[]>([])
const selectedImg = ref(-1)
const opacity = ref(30)
const blur = ref(0)
const saving = ref(false)
const saveMsg = ref('')
const saveOk = ref(true)
const fileInput = ref<HTMLInputElement>()

const getFileName = (p: string) => p.split('/').pop() || ''

const triggerUpload = () => fileInput.value?.click()

const handleUpload = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  saving.value = true; saveMsg.value = ''
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    const fd = new FormData(); fd.append('file', file)
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/upload/single', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      const data = await res.json()
      images.value.push(data.file.url)
    } catch (e: any) { saveMsg.value = e.message; saveOk.value = false; saving.value = false; return }
  }
  saving.value = false
  await saveToAPI()
}

const removeImage = (i: number) => { images.value.splice(i, 1); saveToAPI() }

const saveSettings = async () => {
  await saveToAPI()
  saveMsg.value = '已保存，刷新页面生效'
  saveOk.value = true
}

const saveToAPI = async () => {
  saving.value = true
  try {
    const config = { images: images.value, blur: blur.value, opacity: opacity.value }
    const payload = { id: 'site-background-config', type: 'object', title: 'bg', content: JSON.stringify(config), page: 'site', section: 'background' }
    try { await contentAPI.updateContent('site-background-config', payload) }
    catch { await contentAPI.createContent(payload) }
    saveMsg.value = '已保存'; saveOk.value = true
  } catch (e: any) {
    saveMsg.value = e.error || '保存失败'; saveOk.value = false
  }
  finally { saving.value = false }
}

const clearAll = () => { images.value = []; selectedImg.value = -1; blur.value = 0; opacity.value = 30; saveToAPI(); saveMsg.value = '已清除'; saveOk.value = true }

onMounted(async () => {
  try {
    const res = await contentAPI.getContent('site-background-config')
    let config: any = {}
    if (res?.content) { try { config = JSON.parse(res.content) } catch {} }
    else if (res?.parsedContent) { config = res.parsedContent }
    if (config.images) images.value = config.images
    if (config.blur !== undefined) blur.value = config.blur
    if (config.opacity !== undefined) opacity.value = config.opacity
  } catch { /* empty */ }
})
</script>
