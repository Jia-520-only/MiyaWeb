<template>
  <div
    :class="cn(
      'backdrop-blur-md border transition-all duration-300',
      'rounded-2xl shadow-sm hover:shadow-lg',
      darkModeClasses,
      borderClasses,
      className
    )"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  strength?: 'light' | 'strong'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  strength: 'light',
  hover: true
})

const darkModeClasses = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')

  if (props.strength === 'strong') {
    return isDark ? 'bg-glass-darkStrong' : 'bg-glass-lightStrong'
  }
  return isDark ? 'bg-glass-dark' : 'bg-glass-light'
})

const borderClasses = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? 'border-glass-borderDark' : 'border-glass-border'
})
</script>
