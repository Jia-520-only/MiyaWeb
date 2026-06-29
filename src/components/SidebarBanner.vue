<template>
  <div v-if="images.length > 0" class="widget !p-0 overflow-hidden">
    <div class="aspect-[21/9] overflow-hidden relative group">
      <img
        :src="currentImage.path"
        :alt="'侧边栏横幅'"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)]/80 to-transparent pointer-events-none" />
      <div class="absolute bottom-2 right-2 flex gap-1">
        <button
          v-for="(img, idx) in images"
          :key="idx"
          @click="currentIdx = idx"
          class="w-1.5 h-1.5 rounded-full transition-all duration-300"
          :class="idx === currentIdx ? 'bg-white w-3' : 'bg-white/40 hover:bg-white/60'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

let timer: ReturnType<typeof setInterval>

onMounted(async () => {
  try {
    const res = await fetch('/api/sidebar-images')
    const data = await res.json()
    images.value = data.images || []
  } catch { /* silent */ }

  timer = setInterval(() => {
    if (images.value.length > 1) {
      currentIdx.value = (currentIdx.value + 1) % images.value.length
    }
  }, 5000)
})

onUnmounted(() => clearInterval(timer))
</script>
