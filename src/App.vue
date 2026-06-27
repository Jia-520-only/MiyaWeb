<template>
  <div class="min-h-screen flex flex-col relative z-10">
    <PageBackground />
    <Header />
    <main class="flex-grow pt-20">
      <router-view v-slot="{ Component }">
        <Transition
          name="page-transition"
          mode="out-in"
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          @leave="onLeave"
        >
          <component :is="Component" :key="$route.path" />
        </Transition>
      </router-view>
    </main>
    <Footer />
    <BackgroundEditor v-if="authStore.canEdit" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import PageBackground from './components/PageBackground.vue'
import BackgroundEditor from './components/BackgroundEditor.vue'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const themeStore = useThemeStore()
const authStore = useAuthStore()

let unwatchSystemTheme: (() => void) | undefined

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  unwatchSystemTheme = themeStore.watchSystemTheme()
})

onUnmounted(() => {
  // 清理系统主题监听
  if (unwatchSystemTheme) {
    unwatchSystemTheme()
  }
})

// 页面切换动画回调
const onBeforeEnter = () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
}

const onEnter = (el: Element) => {
  (el as HTMLElement).style.opacity = '1'
}

const onLeave = (el: Element) => {
  (el as HTMLElement).style.opacity = '0'
}
</script>

<style>
/* 页面切换动画 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.8);
}

/* 暗黑模式滚动条 */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.8);
}
</style>
