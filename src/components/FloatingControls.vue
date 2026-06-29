<template>
  <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
    <TransitionGroup name="fab" tag="div" class="flex flex-col items-end gap-3">
      <button
        v-if="showToc"
        key="toc"
        @click="$emit('toc')"
        class="fab-btn group"
        :title="'目录'"
      >
        <Icon name="solar:list-bold-duotone" size="md" />
        <span class="fab-tooltip">目录</span>
      </button>

      <button
        v-if="showBackTop"
        key="top"
        @click="scrollToTop"
        class="fab-btn group"
        title="回到顶部"
      >
        <Icon name="solar:arrow-up-bold-duotone" size="md" />
        <span class="fab-tooltip">回到顶部</span>
      </button>

      <button
        v-if="showTheme"
        key="theme"
        @click="$emit('theme')"
        class="fab-btn group"
        title="切换主题"
      >
        <Icon name="solar:sun-bold-duotone" size="md" />
        <span class="fab-tooltip">主题</span>
      </button>

      <button
        v-if="showHue"
        key="hue"
        @click="showHuePicker = !showHuePicker"
        class="fab-btn group"
        :class="{ '!border-[var(--color-primary)]': showHuePicker }"
        title="调整色调"
      >
        <Icon name="solar:palette-round-bold-duotone" size="md" />
        <span class="fab-tooltip">色调</span>
      </button>
    </TransitionGroup>

    <!-- Hue picker popup -->
    <Transition name="fab">
      <div
        v-if="showHuePicker"
        class="glass-panel p-4 w-56 animate-slide-up"
      >
        <p class="text-caption mb-3">主题色调</p>
        <div class="relative h-4 rounded-full cursor-pointer mb-2 hue-slider"
          @mousedown="startHueDrag"
          @touchstart.prevent="startHueDrag"
          ref="sliderRef"
        >
          <div
            class="absolute top-0 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing transition-transform"
            :style="{ left: ((currentHue / 360) * 100) + '%', background: `oklch(0.65 0.14 ${currentHue})` }"
          />
        </div>
        <div class="flex justify-between text-caption">
          <span>0°</span>
          <span class="font-mono text-xs" style="color: var(--color-primary);">{{ currentHue }}°</span>
          <span>360°</span>
        </div>
        <div class="flex gap-2 mt-3">
          <button v-for="preset in presets" :key="preset.hue" @click="setHue(preset.hue)"
            class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
            :class="currentHue === preset.hue ? 'border-white' : 'border-transparent'"
            :style="{ background: `oklch(0.6 0.14 ${preset.hue})` }"
            :title="preset.label"
          />
        </div>
        <button @click="resetHue" class="btn-ghost w-full mt-2 text-xs justify-center">
          恢复默认
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'

defineProps<{
  showToc?: boolean
  showBackTop?: boolean
  showTheme?: boolean
  showHue?: boolean
}>()

defineEmits<{
  toc: []
  theme: []
}>()

const currentHue = ref(185)
const showHuePicker = ref(false)
const sliderRef = ref<HTMLDivElement | null>(null)

const presets = [
  { hue: 185, label: '青' },
  { hue: 260, label: '紫' },
  { hue: 340, label: '粉' },
  { hue: 30, label: '橙' },
  { hue: 120, label: '绿' },
]

function setHue(h: number) {
  currentHue.value = h
  document.documentElement.style.setProperty('--hue', String(h))
  localStorage.setItem('theme_hue', String(h))
}

function resetHue() {
  setHue(185)
}

function startHueDrag(e: MouseEvent | TouchEvent) {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()

  const update = (clientX: number) => {
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setHue(Math.round(ratio * 360))
  }

  const onMove = (ev: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX
    update(clientX)
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  document.addEventListener('touchmove', onMove)
  document.addEventListener('touchend', onUp)

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  update(clientX)
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  const saved = localStorage.getItem('theme_hue')
  if (saved) {
    currentHue.value = Number(saved)
    document.documentElement.style.setProperty('--hue', saved)
  }
})
</script>

<style scoped>
.fab-btn {
  @apply w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-dim);
  backdrop-filter: blur(16px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  position: relative;
}
.fab-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-border-glow);
  transform: scale(1.08);
}
.fab-tooltip {
  @apply absolute right-full mr-3 px-2 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200;
  background: var(--color-surface-raised);
  color: var(--color-text);
  border: 1px solid var(--color-border-subtle);
}
.group:hover .fab-tooltip {
  opacity: 1;
}

.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.hue-slider {
  background: linear-gradient(to right,
    oklch(0.6 0.14 0), oklch(0.6 0.14 60), oklch(0.6 0.14 120),
    oklch(0.6 0.14 180), oklch(0.6 0.14 240), oklch(0.6 0.14 300), oklch(0.6 0.14 360)
  );
}
</style>
