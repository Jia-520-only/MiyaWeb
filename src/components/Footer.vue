<template>
  <footer class="relative z-10 border-t" style="background: var(--color-bg-deep); border-color: var(--color-border-subtle);">
    <div class="h-0.5" style="background: linear-gradient(90deg, transparent, var(--color-primary), transparent);" />

    <div class="container mx-auto px-6 py-8">
      <!-- Main row: logo + links + social -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <router-link to="/" class="flex items-center gap-2.5 group flex-shrink-0">
          <div class="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:shadow-[0_0_12px_var(--color-primary)] transition-all duration-300">
            <img src="/miya.png" alt="Miya" class="w-full h-full object-cover" loading="lazy" />
          </div>
          <span class="font-bold tracking-tight" style="color: var(--color-text);">jiaandmiya</span>
          <span class="text-caption hidden sm:inline">· 分享站</span>
        </router-link>

        <div class="flex items-center gap-6 text-xs font-medium">
          <router-link v-for="link in footerLinks" :key="link.label"
            :to="link.path"
            class="footer-link">
            {{ link.label }}
          </router-link>
        </div>

        <div class="flex items-center gap-4 text-xs">
          <a v-for="link in footerExternal" :key="link.name"
            :href="link.url" target="_blank" rel="noopener noreferrer"
            class="footer-link">
            {{ link.name }}
          </a>
          <span class="text-caption">&copy; {{ currentYear }}</span>
        </div>
      </div>

      <!-- Footer bottom -->
      <div class="mt-6 pt-4 border-t flex justify-center items-center gap-3 text-caption" style="border-color: var(--color-border-subtle);">
        <span>Powered by Vue 3 + Express + SQLite</span>
        <span class="hidden md:inline">·</span>
        <span>&copy; {{ currentYear }} jiaandmiya.com</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { getContent, parseContent } from '@/utils/contentStorage'

const currentYear = computed(() => new Date().getFullYear())

const footerLinks = ref([
  { label: '技术笔记', path: '/blog' },
  { label: '创作', path: '/library' },
  { label: '人文', path: '/gallery' },
  { label: 'OC 社区', path: '/companions' },
  { label: '免费资源', path: '/resources' },
  { label: '关于', path: '/about' },
])

const footerExternal = ref([
  { name: 'B站', url: 'https://space.bilibili.com' }
])

onMounted(() => {
  const info = getContent('footer-info')
  const links = getContent('footer-links')
  if (links) footerLinks.value = parseContent(links)
  const external = getContent('footer-external')
  if (external) footerExternal.value = parseContent(external)
})
</script>

<style scoped>
.footer-link {
  color: var(--color-text-caption);
  transition: color 0.2s;
  text-decoration: none;
}
.footer-link:hover {
  color: var(--color-primary);
}
</style>
