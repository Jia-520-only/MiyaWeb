<template>
  <div class="not-found-page">
    <!-- Background image from sidebar images -->
    <div class="not-found-bg">
      <img v-if="bgImage" :src="bgImage" class="w-full h-full object-cover" loading="lazy" />
      <div v-else class="w-full h-full" style="background: var(--color-bg-deep);" />
    </div>

    <!-- Overlay -->
    <div class="not-found-overlay" />

    <!-- Content -->
    <div class="not-found-content">
      <div class="text-center">
        <h1 class="not-found-code">404</h1>
        <p class="not-found-message">页面迷失在星海之中</p>
        <p class="text-caption mb-8">你寻找的页面不存在或已被移动</p>
        <router-link to="/" class="btn-primary">
          <Icon name="solar:home-2-bold-duotone" size="sm" />
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'

const bgImage = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/sidebar-images')
    const data = await res.json()
    const images = data.images || []
    if (images.length > 0) {
      const rand = images[Math.floor(Math.random() * images.length)]
      bgImage.value = rand.path
    }
  } catch { /* silent */ }
})
</script>

<style scoped>
.not-found-page {
  position: fixed; inset: 0;
  z-index: 100;
}
.not-found-bg {
  position: absolute; inset: 0;
}
.not-found-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7));
  backdrop-filter: blur(2px);
}
.not-found-content {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  height: 100vh;
}
.not-found-code {
  font-size: clamp(6rem, 15vw, 10rem);
  font-weight: 900;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 0 80px var(--color-primary-glow);
  line-height: 1;
  margin-bottom: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
}
.not-found-message {
  font-size: 1.25rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.5rem;
}
</style>
