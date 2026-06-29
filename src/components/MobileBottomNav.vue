<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom" style="background: var(--color-bg-deep); border-top: 1px solid var(--color-border-subtle); backdrop-filter: blur(20px);">
    <div class="flex items-center justify-around h-14 px-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors duration-200"
        :style="{ color: route.path === item.path ? 'var(--color-primary)' : 'var(--color-text-caption)' }"
      >
        <Icon :name="item.icon" size="sm" />
        <span class="text-[0.5625rem] font-medium leading-none">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()

const navItems = [
  { name: '首页', path: '/', icon: 'solar:home-2-bold-duotone' },
  { name: '笔记', path: '/blog', icon: 'solar:document-text-bold-duotone' },
  { name: '创作', path: '/library', icon: 'solar:notebook-bold-duotone' },
  { name: '人文', path: '/gallery', icon: 'solar:gallery-wide-bold-duotone' },
  { name: 'OC', path: '/companions', icon: 'solar:star-shine-bold-duotone' },
]
</script>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
