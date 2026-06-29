<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg border backdrop-blur-sm transition-all duration-300"
    :class="isDark
      ? 'bg-black/30 border-white/8 hover:border-cyber-cyan/25'
      : 'bg-white/60 border-black/8 hover:border-[var(--color-primary)]/30'"
    :title="isDark ? '切换至亮色模式' : '切换至暗色模式'"
    aria-label="切换主题"
  >
    <!-- Sun icon (light mode) -->
    <svg
      v-if="!isDark"
      class="w-5 h-5"
      :style="{ color: 'var(--color-primary-deep)' }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    <!-- Moon icon (dark mode) -->
    <svg
      v-else
      class="w-5 h-5"
      :style="{ color: 'var(--color-primary-glow)' }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>
