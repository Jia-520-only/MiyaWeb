<template>
  <a href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-teal-500 focus:text-white focus:shadow-lg focus:outline-none">
    跳转到主要内容
  </a>

  <!-- Top gradient highlight -->
  <div class="fixed top-0 left-0 right-0 pointer-events-none z-0 h-[180px]"
    style="background: linear-gradient(180deg, oklch(0.9 0.01 var(--hue) / 0.04), transparent);" />

  <!-- Splash Screen -->
  <Suspense>
    <SplashScreen />
  </Suspense>

  <!-- Background particles -->
  <Suspense>
    <ParticleBackground />
  </Suspense>

  <!-- Click ripple effect -->
  <Suspense>
    <ClickRipple />
  </Suspense>

  <Suspense>
    <PageBackground />
  </Suspense>

  <!-- Full Layout (三栏) for public pages -->
  <MainLayout v-if="useFullLayout">
    <template #left>
      <LeftSidebar />
    </template>
    <div id="main-content">
      <router-view v-slot="{ Component }">
        <Transition
          name="page-transition"
          mode="out-in"
          @before-enter="onBeforeEnter"
        >
          <component :is="Component" :key="$route.path" />
        </Transition>
      </router-view>
    </div>
    <template #right>
      <DynamicRightSidebar />
    </template>
  </MainLayout>

  <!-- Minimal layout for login/cms/editor -->
  <div v-else class="min-h-screen flex flex-col relative z-10" id="main-content">
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="$route.path" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
import LeftSidebar from './components/layout/LeftSidebar.vue'
import DynamicRightSidebar from './components/DynamicRightSidebar.vue'
import { useThemeStore } from './stores/theme'

const SplashScreen = defineAsyncComponent(() => import('./components/SplashScreen.vue'))
const ParticleBackground = defineAsyncComponent(() => import('./components/ParticleBackground.vue'))
const PageBackground = defineAsyncComponent(() => import('./components/PageBackground.vue'))
const ClickRipple = defineAsyncComponent(() => import('./components/ClickRipple.vue'))

const themeStore = useThemeStore()
const route = useRoute()

const minimalRoutes = ['/login', '/cms', '/editor', '/saved-articles', '/user']
const useFullLayout = computed(() => {
  return !minimalRoutes.some(r => route.path.startsWith(r))
})

let unwatchSystemTheme: (() => void) | undefined

onMounted(() => {
  themeStore.initTheme()
  unwatchSystemTheme = themeStore.watchSystemTheme()
  // Track page view
  fetch('/api/analytics/hit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: window.location.pathname }) }).catch(() => {})
})

onUnmounted(() => {
  if (unwatchSystemTheme) {
    unwatchSystemTheme()
  }
})

const onBeforeEnter = () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
}
</script>

<style>
.page-transition-enter-active {
  transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.page-transition-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
.page-transition-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
