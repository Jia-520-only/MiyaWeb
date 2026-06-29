<template>
  <div v-if="images && images.length > 0" class="footer-gallery">
    <div class="footer-gallery-track" ref="trackRef">
      <div v-for="(img, idx) in doubled" :key="idx" class="footer-gallery-item">
        <img :src="img.thumb_path || img.path" :alt="img.original_name" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Image { id: number; path: string; thumb_path?: string; original_name: string; }

const props = defineProps<{ images: Image[] }>()
const trackRef = ref<HTMLDivElement | null>(null)

const doubled = computed(() =>
  props.images.length < 8 ? [...props.images, ...props.images, ...props.images, ...props.images] : [...props.images, ...props.images]
)

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    if (!trackRef.value) return
    trackRef.value.scrollLeft += 0.5
    if (trackRef.value.scrollLeft >= trackRef.value.scrollWidth / 2) {
      trackRef.value.scrollLeft = 0
    }
  }, 30)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.footer-gallery {
  overflow: hidden;
  border-top: 1px solid var(--color-border-subtle);
  padding: 0.5rem 0;
}
.footer-gallery-track {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.footer-gallery-track::-webkit-scrollbar { display: none; }
.footer-gallery-item {
  flex-shrink: 0;
  width: 64px; height: 48px;
  border-radius: 0.375rem;
  overflow: hidden;
  opacity: 0.5;
  transition: opacity 0.3s;
}
.footer-gallery-item:hover { opacity: 1; }
.footer-gallery-item img {
  width: 100%; height: 100%;
  object-fit: cover;
}
</style>
