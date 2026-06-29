<template>
  <div
    v-if="bgImage"
    class="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
    :style="{
      backgroundImage: `url(${bgImage})`,
      filter: `blur(${bgBlur}px)`,
      opacity: isDark ? bgOpacity / 100 : (bgOpacity / 100) * 0.6,
    }"
  />
  <div
    v-if="bgImage"
    class="fixed inset-0 pointer-events-none z-0"
    :style="{
      background: isDark
        ? 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
        : 'radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,0.3) 100%)'
    }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const bgImage = ref<string | null>(null)
const bgBlur = ref(0)
const bgOpacity = ref(0)
const isDark = ref(document.documentElement.classList.contains('dark'))

let observer: MutationObserver | null = null

async function loadBackground() {
  try {
    const res = await fetch('/api/content/site-background-config').then(r => r.json())
    let config: any = {}
    if (res?.content) { try { config = JSON.parse(res.content) } catch {} }
    else if (res?.parsedContent) { config = res.parsedContent }

    if (config.images && config.images.length > 0) {
      bgImage.value = config.images[Math.floor(Math.random() * config.images.length)]
      bgBlur.value = config.blur || 0
      bgOpacity.value = config.opacity || 30
    } else {
      bgImage.value = null
    }
  } catch {
    bgImage.value = null
  }
}

onMounted(() => {
  loadBackground()
  observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(() => route.path, loadBackground)
</script>
