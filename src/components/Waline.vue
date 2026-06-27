<template>
  <div ref="walineRef" class="waline-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { init } from '@waline/client'
import type { WalineInstance } from '@waline/client'
import { useThemeStore } from '../stores/theme'

interface Props {
  serverURL: string
  path: string
  lang?: string
  dark?: string | boolean
}

const props = withDefaults(defineProps<Props>(), {
  lang: 'zh-CN',
  dark: false
})

const walineRef = ref<HTMLElement>()
const themeStore = useThemeStore()
let walineInstance: WalineInstance | null = null

const initWaline = () => {
  if (!walineRef.value) return

  // 检查是否配置了 serverURL
  if (!props.serverURL || props.serverURL.trim() === '') {
    return
  }

  // 销毁旧实例
  if (walineInstance) {
    walineInstance.destroy()
  }

  // 创建新实例
  walineInstance = init({
    el: walineRef.value,
    serverURL: props.serverURL,
    path: props.path,
    lang: props.lang,
    dark: themeStore.isDark,
    emoji: [
      'https://unpkg.com/@waline/emojis@1.2.0/weibo',
      'https://unpkg.com/@waline/emojis@1.2.0/bilibili'
    ],
    search: false,
    imageUploader: false,
    requiredMeta: ['nick'],
    locale: {
      admin: 'Miya',
      placeholder: '欢迎留言！Miya 会认真阅读每一条评论 ✨'
    }
  })
}

onMounted(() => {
  initWaline()
})

// 监听主题变化，重新初始化 Waline
watch(() => themeStore.isDark, () => {
  initWaline()
})

onBeforeUnmount(() => {
  if (walineInstance) {
    walineInstance.destroy()
    walineInstance = null
  }
})
</script>

<style scoped>
.waline-container {
  margin-top: 2rem;
}
</style>

/* Waline 主题覆盖 */
<style>
:root {
  --waline-theme-color: #0d9488;
  --waline-theme-color-light: #2dd4bf;
  --waline-active-color: #0f766e;
}

/* 浅色模式 */
.wl-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.wl-btn-primary {
  background-color: #0d9488 !important;
}

.wl-btn-primary:hover {
  background-color: #0f766e !important;
}

/* 深色模式 */
.dark .wl-card {
  background: rgba(31, 41, 55, 0.8) !important;
  border-color: rgba(75, 85, 99, 0.5);
}

.dark .wl-editor,
.dark .wl-header,
.dark .wl-header-item,
.dark .wl-textarea {
  color: #e5e7eb !important;
}

.dark .wl-textarea {
  background-color: rgba(55, 65, 81, 0.5) !important;
}

.dark .wl-meta,
.dark .wl-nick,
.dark .wl-mail,
.dark .wl-link {
  background-color: rgba(55, 65, 81, 0.5) !important;
  border-color: rgba(75, 85, 99, 0.5);
}

.dark .wl-input {
  background-color: transparent !important;
}

.dark .wl-header label {
  color: #9ca3af !important;
}

.dark .wl-card-item {
  border-color: rgba(75, 85, 99, 0.3);
}
</style>
