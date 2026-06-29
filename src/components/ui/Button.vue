<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-300',
      'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.97]',
      sizeClasses,
      variantClasses,
      className
    )"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cyber'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  className: '',
  disabled: false
})

const variantClasses = {
  primary: [
    'rounded-md font-semibold',
    'bg-gradient-to-r from-[#00ADB5] to-[#00FFF5]',
    'text-[#0a0a1a]',
    'shadow-[0_0_20px_rgba(0,173,181,0.25)]',
    'hover:shadow-[0_0_35px_rgba(0,255,245,0.4)]',
    'hover:scale-[1.02]',
    'border border-transparent',
  ].join(' '),

  secondary: [
    'rounded-md',
    'bg-black/40 border border-white/8',
    'text-cyber-cyan hover:text-cyber-cyan/90',
    'hover:bg-cyber-cyan/8 hover:border-cyber-cyan/25',
    'hover:shadow-[0_0_25px_rgba(0,255,245,0.08)]',
  ].join(' '),

  outline: [
    'rounded-md',
    'border border-cyber-cyan/30',
    'text-cyber-cyan',
    'hover:bg-cyber-cyan/10 hover:border-cyber-cyan/60',
    'hover:shadow-glow-cyan',
  ].join(' '),

  ghost: [
    'rounded-lg',
    'text-hud-dim',
    'hover:text-cyber-cyan hover:bg-cyber-cyan/6',
  ].join(' '),

  cyber: [
    'rounded-md',
    'bg-transparent border border-cyber-cyan/40',
    'text-cyber-cyan',
    'font-mono tracking-wider',
    'hover:bg-cyber-cyan/10 hover:border-cyber-cyan/80',
    'hover:shadow-glow-cyan',
    'hover:skew-x-[-4deg]',
  ].join(' '),
}

const sizeClasses = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}
</script>
