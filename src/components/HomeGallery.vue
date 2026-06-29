<template>
  <div v-if="images && images.length > 0" class="home-gallery">
    <div class="home-gallery-track" ref="trackRef" @mouseenter="pause" @mouseleave="resume">
      <div
        v-for="(img, idx) in doubledImages"
        :key="idx"
        class="home-gallery-item"
        @click="openLightbox(img)"
      >
        <img :src="img.thumb_path || img.path" :alt="img.original_name" loading="lazy" />
        <div class="home-gallery-overlay">
          <span class="text-[0.625rem] font-mono tracking-wider">{{ img.original_name?.split('.')[0] }}</span>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="lightbox" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" @click="lightbox = null">
          <img :src="lightbox.path" class="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" @click.stop />
          <button @click="lightbox = null" class="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Image {
  id: number; path: string; thumb_path?: string; original_name: string;
}

const props = defineProps<{ images: Image[] }>()

const doubledImages = computed(() => {
  if (props.images.length < 6) {
    return [...props.images, ...props.images, ...props.images]
  }
  return [...props.images, ...props.images]
})

const lightbox = ref<Image | null>(null)
const trackRef = ref<HTMLDivElement | null>(null)
let scrollTimer: ReturnType<typeof setInterval> | null = null

function pause() { if (scrollTimer) clearInterval(scrollTimer) }
function resume() { startScroll() }
function openLightbox(img: Image) { lightbox.value = img }

function startScroll() {
  if (!trackRef.value) return
  scrollTimer = setInterval(() => {
    if (!trackRef.value) return
    trackRef.value.scrollLeft += 1
    if (trackRef.value.scrollLeft >= trackRef.value.scrollWidth / 2) {
      trackRef.value.scrollLeft = 0
    }
  }, 30)
}

onMounted(startScroll)
onUnmounted(() => { if (scrollTimer) clearInterval(scrollTimer) })
</script>

<style scoped>
.home-gallery {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
}
.home-gallery-track {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0.75rem;
}
.home-gallery-track::-webkit-scrollbar { display: none; }
.home-gallery-item {
  flex-shrink: 0;
  width: 140px;
  height: 100px;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease;
}
.home-gallery-item:hover {
  transform: scale(1.05);
  z-index: 1;
}
.home-gallery-item img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.home-gallery-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
  display: flex; align-items: flex-end; justify-content: center;
  padding-bottom: 0.5rem;
  opacity: 0; transition: opacity 0.3s;
  color: rgba(255,255,255,0.8);
}
.home-gallery-item:hover .home-gallery-overlay { opacity: 1; }

.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.3s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
</style>
