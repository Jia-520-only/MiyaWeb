<template>
  <span class="inline">
    <span>{{ displayedText }}</span>
    <span class="inline-block w-[2px] h-[1em] align-middle ml-0.5 animate-pulse" :style="{ background: cursorColor || 'var(--color-primary)' }" />
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  texts?: string[]
  speed?: number
  pauseMs?: number
  cursorColor?: string
}>(), {
  texts: () => [],
  speed: 80,
  pauseMs: 2000,
  cursorColor: '',
})

const displayedText = ref('')
let currentTextIdx = 0
let charIdx = 0
let isDeleting = false
let timer: ReturnType<typeof setInterval> | null = null

function type() {
  if (!props.texts.length) return
  const current = props.texts[currentTextIdx]

  if (!isDeleting) {
    displayedText.value = current.substring(0, charIdx)
    charIdx++
    if (charIdx > current.length) {
      setTimeout(() => { isDeleting = true }, props.pauseMs)
    }
  } else {
    displayedText.value = current.substring(0, charIdx)
    charIdx--
    if (charIdx < 0) {
      isDeleting = false
      charIdx = 0
      currentTextIdx = (currentTextIdx + 1) % props.texts.length
    }
  }
}

onMounted(() => {
  if (props.texts.length) {
    timer = setInterval(type, props.speed)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
