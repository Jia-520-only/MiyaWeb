<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">Banner 轮播图</h2>
      <label class="btn-primary text-sm cursor-pointer">
        <Icon name="solar:add-circle-linear" size="xs" />
        <span>上传</span>
        <input type="file" accept="image/*" multiple class="hidden" @change="handleUpload" />
      </label>
    </div>
    <p class="text-caption">首页顶部 Banner 轮播背景图。建议 1920×800 以上。</p>

    <div v-if="images.length === 0" class="text-caption text-center py-8">暂无 Banner 图</div>
    <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div v-for="img in images" :key="img.id" class="relative group rounded-lg overflow-hidden aspect-video">
        <img :src="img.thumb_path || img.path" class="w-full h-full object-cover" />
        <div class="absolute bottom-1 left-1 right-1 text-[0.5rem] truncate text-white/60 bg-black/30 rounded px-1 py-0.5">
          {{ img.original_name }}
        </div>
        <button @click="removeImage(img.id)"
          class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ✕
        </button>
      </div>
    </div>
    <p v-if="msg" class="text-xs" :class="ok ? 'text-emerald-400' : 'text-red-400'">{{ msg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'

const images = ref<any[]>([])
const msg = ref('')
const ok = ref(true)

async function load() {
  const res = await fetch('/api/banner-images').then(r => r.json())
  images.value = res.images || []
}

async function handleUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  for (const file of Array.from(files)) {
    const fd = new FormData(); fd.append('file', file)
    const token = localStorage.getItem('auth_token')
    const res = await fetch('/api/banner-images', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd })
    if (!res.ok) { msg.value = (await res.json()).error || '失败'; ok.value = false; return }
  }
  msg.value = '上传成功'; ok.value = true; await load()
}

async function removeImage(id: number) {
  if (!confirm('删除？')) return
  const token = localStorage.getItem('auth_token')
  await fetch(`/api/banner-images/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} })
  await load()
}

onMounted(load)
</script>
