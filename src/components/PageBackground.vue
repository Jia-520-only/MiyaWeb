<template>
  <!-- 自定义背景图片层 -->
  <div
    v-if="background.imageUrl"
    class="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
    :style="{
      backgroundImage: `url(${background.imageUrl})`,
      filter: `blur(${background.blur}px)`,
      opacity: background.opacity / 100
    }"
  ></div>

  <!-- 默认渐变背景层 -->
  <div
    v-else-if="defaultBackground"
    class="fixed inset-0 pointer-events-none z-0"
    :style="{
      backgroundImage: defaultBackground
    }"
  ></div>

  <!-- 边缘磨砂层 (只在屏幕边缘应用,不遮挡内容) -->
  <div
    v-if="background.imageUrl || defaultBackground"
    class="fixed inset-0 pointer-events-none z-0"
    :style="{
      backgroundImage: 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.4) 100%)',
      backdropFilter: 'blur(0px)',
      WebkitBackdropFilter: 'blur(0px)'
    }"
  ></div>

  <!-- 用于触发样式的隐藏元素 -->
  <div
    v-show="false"
    :data-content-overlay-color="background.contentOverlayColor"
    :data-content-overlay-opacity="background.contentOverlayOpacity"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPageBackground } from '@/utils/backgroundStorage'

const route = useRoute()

const background = ref({
  imageUrl: null as string | null,
  blur: 0,
  opacity: 0,
  contentOverlayColor: 'none' as 'white' | 'black' | 'none',
  contentOverlayOpacity: 90
})

const defaultBackground = ref<string | null>(null)

const loadBackground = () => {
  const bg = getPageBackground(route.path)
  background.value = {
    imageUrl: bg.imageUrl,
    blur: bg.blur || 0,
    opacity: bg.opacity || 0,
    contentOverlayColor: bg.contentOverlayColor || 'none',
    contentOverlayOpacity: bg.contentOverlayOpacity || 90
  }

  // 设置 CSS 变量供全局使用（即使没有背景图片也要设置）
  updateContentOverlayStyle()

  // 检查默认背景
  const defaultBg = localStorage.getItem(`default_bg_${route.path}`)
  if (defaultBg) {
    const gradients: Record<string, string> = {
      'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'gradient-sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'gradient-ocean': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'gradient-forest': 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
      'gradient-purple': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'gradient-dark': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    }
    defaultBackground.value = gradients[defaultBg] || null
  } else {
    defaultBackground.value = null
  }
}

// 更新文字区域背景样式
const updateContentOverlayStyle = () => {
  const root = document.documentElement
  if (background.value.contentOverlayColor === 'white') {
    root.style.setProperty('--content-overlay-bg', `rgba(255, 255, 255, ${background.value.contentOverlayOpacity / 100})`)
    root.style.setProperty('--content-overlay-text', '#1f2937')
  } else if (background.value.contentOverlayColor === 'black') {
    root.style.setProperty('--content-overlay-bg', `rgba(0, 0, 0, ${background.value.contentOverlayOpacity / 100})`)
    root.style.setProperty('--content-overlay-text', '#f9fafb')
  } else {
    root.style.setProperty('--content-overlay-bg', 'transparent')
    root.style.setProperty('--content-overlay-text', 'inherit')
  }
}

onMounted(() => {
  loadBackground()

  // 监听背景更新事件
  window.addEventListener('background-updated', handleBackgroundUpdated)
})

// 处理背景更新事件
const handleBackgroundUpdated = (event: CustomEvent) => {
  if (event.detail?.path === route.path) {
    loadBackground()
  }
}

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('background-updated', handleBackgroundUpdated)
})

watch(() => route.path, () => {
  loadBackground()
})

// 监听背景变化，实时更新样式
watch(() => background.value.contentOverlayColor, updateContentOverlayStyle)
watch(() => background.value.contentOverlayOpacity, updateContentOverlayStyle)
</script>
