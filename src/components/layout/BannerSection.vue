<template>
  <div class="relative overflow-hidden rounded-3xl mb-12" :style="{ height: bannerHeight }">
    <!-- Carousel images -->
    <template v-if="carouselImages.length > 1">
      <div
        v-for="(img, idx) in carouselImages"
        :key="img"
        class="absolute inset-0 transition-opacity duration-800"
        :class="currentIdx === idx ? 'opacity-100' : 'opacity-0'"
      >
          <img :src="img" :alt="title || ''" class="w-full h-full object-cover ken-burns" :style="{ objectPosition: position }" />
        </div>
      <!-- Dot indicators -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
        <button
          v-for="(_, idx) in carouselImages"
          :key="idx"
          @click="currentIdx = idx"
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="idx === currentIdx ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'"
        />
      </div>
    </template>

    <!-- Single image -->
    <div v-else-if="displayImage" class="absolute inset-0">
      <img :src="displayImage" :alt="title || ''" class="w-full h-full object-cover ken-burns" :style="{ objectPosition: position }" />
    </div>

    <!-- Fallback gradient -->
    <div v-else class="absolute inset-0" :style="{ background: gradientFallback }" />

    <!-- Dark overlay -->
    <div class="absolute inset-0 z-10" style="background: linear-gradient(180deg, rgba(34,40,49,0.15) 0%, rgba(34,40,49,0.35) 50%, rgba(34,40,49,0.75) 100%);" />

    <!-- Radial glow accent -->
    <div class="absolute z-10 pointer-events-none" style="top: -20%; right: -10%; width: 50%; height: 80%; background: radial-gradient(ellipse, oklch(0.65 var(--hue-sat) var(--hue) / 0.1) 0%, transparent 70%);" />

    <!-- Text overlay -->
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
      <p v-if="overline" class="font-mono text-[0.625rem] tracking-[0.25em] uppercase mb-4" style="color: var(--color-text-caption);">
        {{ overline }}
      </p>
      <h1 v-if="title" class="text-white font-bold tracking-tight leading-tight mb-3" :style="{ fontSize: titleSize }">
        {{ title }}
        <span v-if="accent" class="text-gradient">{{ accent }}</span>
      </h1>
      <p v-if="subtitle && !typedSubtitles?.length" class="text-sm md:text-base max-w-lg leading-relaxed" style="color: var(--color-text-dim);">
        {{ subtitle }}
      </p>
      <TypewriterText
        v-if="typedSubtitles?.length"
        :texts="typedSubtitles"
        :speed="60"
        :pause-ms="3000"
        class="text-sm md:text-base max-w-lg leading-relaxed"
        style="color: var(--color-text-dim);"
      />

      <!-- Stats row -->
      <div v-if="stats && stats.length" class="flex items-center gap-6 md:gap-10 mt-6">
        <div v-for="s in stats" :key="s.label" class="text-center">
          <div class="text-xl md:text-2xl font-bold font-mono" style="color: var(--color-primary-glow);">{{ s.value }}</div>
          <div class="text-caption mt-1">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Water wave SVG -->
    <svg class="absolute bottom-0 left-0 right-0 z-20 pointer-events-none w-full h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" preserveAspectRatio="none">
      <path class="wave wave-1" d="M0,30 C240,45 480,15 720,25 C960,35 1200,20 1440,30 L1440,60 L0,60 Z" />
      <path class="wave wave-2" d="M0,35 C240,25 480,45 720,35 C960,25 1200,40 1440,35 L1440,60 L0,60 Z" />
      <path class="wave wave-3" d="M0,40 C240,35 480,50 720,40 C960,30 1200,45 1440,40 L1440,60 L0,60 Z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import TypewriterText from '@/components/TypewriterText.vue'

const props = withDefaults(defineProps<{
  images?: string[]
  imageUrl?: string
  position?: string
  title?: string
  accent?: string
  subtitle?: string
  typedSubtitles?: string[]
  overline?: string
  titleSize?: string
  bannerHeight?: string
  stats?: { label: string; value: string }[]
}>(), {
  images: () => [],
  position: '50% 30%',
  titleSize: 'clamp(2rem, 5vw, 3rem)',
  bannerHeight: 'clamp(280px, 35vh, 420px)',
})

const currentIdx = ref(0)

const carouselImages = computed(() => {
  if (props.imageUrl) return []
  return props.images.length > 1 ? props.images : []
})

const displayImage = computed(() => {
  if (props.imageUrl) return props.imageUrl
  if (props.images.length === 0) return null
  if (props.images.length === 1) return props.images[0]
  return null
})

const gradientFallback = 'linear-gradient(135deg, oklch(0.18 0.015 var(--hue)) 0%, var(--color-bg-deep) 40%, oklch(0.18 0.015 var(--hue)) 100%)'

let timer: ReturnType<typeof setInterval> | null = null

function startCarousel() {
  if (timer) clearInterval(timer)
  if (carouselImages.value.length > 1) {
    timer = setInterval(() => {
      currentIdx.value = (currentIdx.value + 1) % carouselImages.value.length
    }, 5000)
  }
}

watch(carouselImages, startCarousel)
onMounted(() => { startCarousel() })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 0.8s ease;
}
.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
}

.ken-burns {
  animation: kenBurns 20s ease-in-out infinite alternate;
}
@keyframes kenBurns {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

.wave-1 { fill: #fff; opacity: 0.15; animation: wave1 8s ease-in-out infinite; }
.wave-2 { fill: #fff; opacity: 0.25; animation: wave2 6s ease-in-out infinite; }
.wave-3 { fill: #fff; opacity: 0.35; animation: wave3 10s ease-in-out infinite; }
@keyframes wave1 {
  0%   { d: path("M0,30 C240,45 480,15 720,25 C960,35 1200,20 1440,30 L1440,60 L0,60 Z"); }
  25%  { d: path("M0,20 C240,10 480,35 720,20 C960,10 1200,30 1440,20 L1440,60 L0,60 Z"); }
  50%  { d: path("M0,35 C240,50 480,20 720,35 C960,45 1200,15 1440,35 L1440,60 L0,60 Z"); }
  75%  { d: path("M0,25 C240,15 480,40 720,25 C960,15 1200,35 1440,25 L1440,60 L0,60 Z"); }
  100% { d: path("M0,30 C240,45 480,15 720,25 C960,35 1200,20 1440,30 L1440,60 L0,60 Z"); }
}
@keyframes wave2 {
  0%   { d: path("M0,40 C240,25 480,50 720,38 C960,28 1200,45 1440,40 L1440,60 L0,60 Z"); }
  33%  { d: path("M0,35 C240,50 480,28 720,42 C960,48 1200,30 1440,35 L1440,60 L0,60 Z"); }
  66%  { d: path("M0,45 C240,30 480,48 720,35 C960,25 1200,48 1440,45 L1440,60 L0,60 Z"); }
  100% { d: path("M0,40 C240,25 480,50 720,38 C960,28 1200,45 1440,40 L1440,60 L0,60 Z"); }
}
@keyframes wave3 {
  0%   { d: path("M0,45 C240,35 480,55 720,42 C960,32 1200,50 1440,45 L1440,60 L0,60 Z"); }
  50%  { d: path("M0,38 C240,50 480,32 720,45 C960,55 1200,35 1440,38 L1440,60 L0,60 Z"); }
  100% { d: path("M0,45 C240,35 480,55 720,42 C960,32 1200,50 1440,45 L1440,60 L0,60 Z"); }
}
</style>
