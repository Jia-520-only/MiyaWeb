<template>
  <div v-if="images.length > 0" class="widget !p-0 overflow-hidden">
    <div class="relative group cursor-pointer" @click="shuffle">
      <div class="aspect-square overflow-hidden">
        <img
          :src="currentImage.path"
          :alt="'侧边栏图卡'"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
        <span class="text-white/0 group-hover:text-white/80 transition-all duration-300 text-xs font-mono tracking-wider">
          {{ currentIdx + 1 }} / {{ images.length }}
        </span>
      </div>
      <button @click.stop="prev" class="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 text-white/50 hover:text-white hover:bg-black/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
        ‹
      </button>
      <button @click.stop="next" class="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 text-white/50 hover:text-white hover:bg-black/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
        ›
      </button>
    </div>
    <div class="px-3 py-2 flex items-center justify-between">
      <span class="text-caption truncate max-w-[120px]">{{ currentImage.original_name }}</span>
      <span class="text-caption font-mono">{{ images.length }} 张</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface SidebarImage {
  id: number
  path: string
  thumb_path?: string
  sort_order: number
  original_name: string
}

const images = ref<SidebarImage[]>([])
const currentIdx = ref(0)

const currentImage = computed(() => images.value[currentIdx.value] || images.value[0])

function shuffle() {
  if (images.value.length > 1) {
    let next: number
    do { next = Math.floor(Math.random() * images.value.length) } while (next === currentIdx.value)
    currentIdx.value = next
  }
}
function prev() {
  currentIdx.value = (currentIdx.value - 1 + images.value.length) % images.value.length
}
function next() {
  currentIdx.value = (currentIdx.value + 1) % images.value.length
}

onMounted(async () => {
  try {
    const res = await fetch('/api/sidebar-images')
    const data = await res.json()
    images.value = data.images || []
  } catch { /* silent */ }
})
</script>
