<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">侧边栏图片</h2>
      <label class="btn-primary text-sm cursor-pointer">
        <Icon name="solar:add-circle-linear" size="xs" />
        <span>上传图片</span>
        <input type="file" accept="image/*" class="hidden" @change="handleUpload" />
      </label>
    </div>

    <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

    <div v-if="images.length === 0" class="text-center py-12 text-gray-400">
      <Icon name="solar:gallery-wide-bold-duotone" size="xl" color="#4a525e" class="mb-3 empty-state-icon" />
      <p class="text-sub text-sm">还没有侧边栏图片</p>
      <p class="text-caption mt-1">上传图片后将显示在左右侧边栏中</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="img in images"
        :key="img.id"
        class="glass-card !p-4 flex items-center gap-4 group"
      >
        <img :src="img.thumb_path || img.path" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-sm text-white truncate">{{ img.original_name }}</p>
          <p class="text-caption mt-0.5">{{ formatSize(img.size) }} · {{ img.width }}×{{ img.height }}</p>
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="moveUp(img)" :disabled="img.sort_order === 0" class="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition-all">
            <Icon name="solar:alt-arrow-up-linear" size="xs" />
          </button>
          <button @click="moveDown(img)" :disabled="img.sort_order >= images.length - 1" class="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition-all">
            <Icon name="solar:alt-arrow-down-linear" size="xs" />
          </button>
          <button @click="deleteImage(img.id)" class="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all ml-1">
            <Icon name="solar:trash-bin-trash-linear" size="xs" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'

interface SidebarImage {
  id: number
  path: string
  thumb_path?: string
  sort_order: number
  original_name: string
  size: number
  width: number
  height: number
}

const images = ref<SidebarImage[]>([])
const error = ref('')

function formatSize(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

async function loadImages() {
  try {
    const res = await fetch('/api/sidebar-images')
    const data = await res.json()
    images.value = data.images || []
  } catch (e: any) {
    error.value = e.message
  }
}

async function handleUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const token = localStorage.getItem('auth_token')
    const res = await fetch('/api/sidebar-images', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || '上传失败')
    }
    await loadImages()
  } catch (e: any) {
    error.value = e.message
  }
}

async function deleteImage(id: number) {
  if (!confirm('确定删除这张图片？')) return
  try {
    const token = localStorage.getItem('auth_token')
    await fetch(`/api/sidebar-images/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    await loadImages()
  } catch (e: any) {
    error.value = e.message
  }
}

async function reorder() {
  try {
    const token = localStorage.getItem('auth_token')
    await fetch('/api/sidebar-images/sort', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ ids: images.value.map(i => i.id) })
    })
  } catch (e: any) {
    error.value = e.message
  }
}

function moveUp(img: SidebarImage) {
  const idx = images.value.indexOf(img)
  if (idx <= 0) return
  ;[images.value[idx - 1], images.value[idx]] = [images.value[idx], images.value[idx - 1]]
  images.value.forEach((img, i) => img.sort_order = i)
  reorder()
}

function moveDown(img: SidebarImage) {
  const idx = images.value.indexOf(img)
  if (idx >= images.value.length - 1) return
  ;[images.value[idx], images.value[idx + 1]] = [images.value[idx + 1], images.value[idx]]
  images.value.forEach((img, i) => img.sort_order = i)
  reorder()
}

onMounted(loadImages)
</script>
