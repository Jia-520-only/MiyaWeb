<template>
  <div v-if="images.length > 0" class="oc-wall">
    <div class="wall-masonry">
      <div v-for="img in images" :key="img.id" class="wall-item" @click="lightbox = img" @touchend.prevent="lightbox = img">
        <img :src="img.thumb_path || img.path" :alt="img.original_name" class="w-full h-auto block" loading="lazy" />
        <div class="wall-info">
          <span class="text-xs font-medium truncate">{{ img.item_title }}</span>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ images: any[] }>()
const lightbox = ref<any>(null)
</script>

<style scoped>
.wall-masonry {
  column-count: 2; column-gap: 0.5rem;
}
@media (min-width: 768px) { .wall-masonry { column-count: 3; } }
@media (min-width: 1024px) { .wall-masonry { column-count: 4; } }

.wall-item {
  break-inside: avoid;
  margin-bottom: 0.5rem;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: var(--color-surface);
}
.wall-item img { width: 100%; display: block; transition: transform 0.4s ease; }
.wall-item:hover img { transform: scale(1.03); }
.wall-info {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  color: rgba(255,255,255,0.85);
  opacity: 0; transition: opacity 0.3s;
}
.wall-item:hover .wall-info { opacity: 1; }

.lightbox-enter-active, .lightbox-leave-active { transition: opacity 0.3s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }
</style>
