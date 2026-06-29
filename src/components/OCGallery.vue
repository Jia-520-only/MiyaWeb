<template>
  <div v-if="images.length > 0" class="oc-gallery">
    <div class="gallery-masonry">
      <div
        v-for="img in images"
        :key="img.id"
        class="gallery-card"
        @click="lightbox = img"
        @touchend.prevent="lightbox = img"
      >
        <img :src="img.thumb_path || img.path" :alt="img.original_name" class="w-full h-auto block" loading="lazy" />
        <div class="gallery-overlay">
          <Icon name="solar:zoom-in-bold" size="sm" color="#fff" />
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="lightbox" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" @click="lightbox = null">
          <img :src="lightbox.path" class="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" @click.stop />
          <button @click="lightbox = null" class="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
        </div>
      </Transition>
    </Teleport>
  </div>
  <div v-else class="text-center py-12 text-caption">暂无图片</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/ui/Icon.vue'

defineProps<{ images: any[] }>()
const lightbox = ref<any>(null)
</script>

<style scoped>
.oc-gallery { margin-top: 0.5rem; }
.gallery-masonry {
  column-count: 2; column-gap: 0.5rem;
}
@media (min-width: 768px) { .gallery-masonry { column-count: 3; } }
@media (min-width: 1024px) { .gallery-masonry { column-count: 4; } }

.gallery-card {
  break-inside: avoid;
  margin-bottom: 0.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: var(--color-surface);
}
.gallery-card img {
  width: 100%; display: block;
  transition: transform 0.4s ease;
}
.gallery-card:hover img { transform: scale(1.04); }
.gallery-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
}
.gallery-card:hover .gallery-overlay { opacity: 1; }

.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.3s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
</style>
