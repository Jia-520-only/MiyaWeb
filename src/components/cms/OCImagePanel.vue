<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">🖼 OC 图片管理</h2>
    </div>

    <!-- Upload -->
    <div class="glass-card !p-5">
      <h3 class="text-sm font-semibold text-white mb-3">上传图片</h3>
      <div class="flex items-center gap-3">
        <label class="btn-primary text-sm cursor-pointer">
          <Icon name="solar:upload-bold-duotone" size="sm" />
          <span>选择图片</span>
          <input type="file" accept="image/*" class="hidden" @change="handleUpload" />
        </label>
        <span class="text-caption">或丢到 content/incoming-images/ 自动导入，再到资源中心分发</span>
      </div>
      <p v-if="uploadMsg" class="text-xs mt-2" :class="uploadOk ? 'text-emerald-400' : 'text-red-400'">{{ uploadMsg }}</p>
    </div>

    <!-- Assigned images -->
    <div class="glass-card !p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white">已关联图片 ({{ assigned.length }})</h3>
        <button @click="loadImages" class="text-xs text-[var(--color-text-caption)] hover:text-[var(--color-primary)]">
          <Icon name="solar:refresh-bold" size="xs" /> 刷新
        </button>
      </div>
      <div v-if="assigned.length === 0" class="text-caption text-center py-8">
        暂无图片。上传图片或从资源中心分发到此 OC。
      </div>
      <div v-else class="grid grid-cols-3 md:grid-cols-4 gap-3">
        <div v-for="img in assigned" :key="img.id" class="relative group rounded-lg overflow-hidden aspect-square bg-white/[0.02]">
          <img :src="img.thumb_path || img.path" class="w-full h-full object-cover" />
          <button @click="removeImage(img.id)"
            class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{ itemId: number; itemTitle: string }>()

const assigned = ref<any[]>([])
const uploadMsg = ref('')
const uploadOk = ref(true)

async function loadImages() {
  try {
    const res = await fetch(`/api/oc-images/item/${props.itemId}`).then(r => r.json())
    assigned.value = res.images || []
  } catch { assigned.value = [] }
}

async function handleUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const formData = new FormData()
  formData.append('file', file)
  uploadMsg.value = '上传中...'
  try {
    const token = localStorage.getItem('auth_token')
    const upRes = await fetch('/api/upload/single', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })
    const upData = await upRes.json()
    if (!upRes.ok) throw new Error(upData.error || '上传失败')
    const uploadId = upData.file?.id
    if (!uploadId) throw new Error('未获取到上传 ID')

    await fetch('/api/oc-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ item_id: props.itemId, upload_id: uploadId })
    })
    uploadMsg.value = '上传成功！'
    uploadOk.value = true
    await loadImages()
  } catch (err: any) {
    uploadMsg.value = err.message || '上传失败'
    uploadOk.value = false
  }
}

async function removeImage(id: number) {
  if (!confirm('取消关联此图片？')) return
  try {
    const token = localStorage.getItem('auth_token')
    await fetch(`/api/oc-images/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    await loadImages()
  } catch (e: any) { alert(e.message) }
}

onMounted(loadImages)
watch(() => props.itemId, loadImages)
</script>
