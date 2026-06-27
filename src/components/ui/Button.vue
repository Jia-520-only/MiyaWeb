<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center gap-2',
      'font-medium',
      'transition-all duration-200',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variant === 'cyber' ? cyberClasses : standardClasses,
      hoverClasses,
      className
    )"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cyber'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  className: '',
  disabled: false
})

const standardClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 rounded-xl',
    outline: 'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-2 focus:ring-primary-500 rounded-xl',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 rounded-lg',
  }
  return variants[props.variant] || variants.primary
})

const cyberClasses = computed(() => {
  return cn(
    'rounded-md',
    'bg-transparent border',
    'text-cyber-cyan border-cyber-cyan/40',
    'hover:bg-cyber-cyan/10 hover:border-cyber-cyan/80',
    'hover:shadow-glow-cyan',
    'font-mono tracking-wider',
    'focus:ring-2 focus:ring-cyber-cyan/50'
  )
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  }
  return sizes[props.size]
})

const hoverClasses = computed(() => {
  if (props.disabled) return ''
  if (props.variant === 'cyber') return 'hover:scale-105 active:scale-95'
  return 'hover:-translate-y-0.5 hover:shadow-md active:scale-95'
})
</script>
