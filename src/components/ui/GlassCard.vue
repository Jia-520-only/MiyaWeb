<template>
  <div
    :class="cn(
      'relative backdrop-blur-md border transition-all duration-300',
      cyber ? cyberClasses : standardClasses,
      className
    )"
  >
    <!-- Gloss sweep effect -->
    <div v-if="cyber && glossSweep" class="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none z-10">
      <div class="gloss-bar"></div>
    </div>

    <!-- Corner brackets -->
    <div v-if="cyber && cornerBrackets" class="absolute inset-0 pointer-events-none z-0">
      <span class="bracket-tl"></span>
      <span class="bracket-br"></span>
    </div>

    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  strength?: 'light' | 'strong'
  hover?: boolean
  cyber?: boolean
  glossSweep?: boolean
  cornerBrackets?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  strength: 'light',
  hover: true,
  cyber: false,
  glossSweep: false,
  cornerBrackets: false,
})

const isDark = typeof document !== 'undefined'
  ? document.documentElement.classList.contains('dark')
  : false

const standardClasses = computed(() => {
  const bg = props.strength === 'strong'
    ? (isDark ? 'bg-glass-darkStrong' : 'bg-glass-lightStrong')
    : (isDark ? 'bg-glass-dark' : 'bg-glass-light')
  const borderColor = isDark ? 'border-glass-borderDark' : 'border-glass-border'
  const shadow = props.hover ? 'shadow-sm hover:shadow-lg' : 'shadow-sm'
  return cn('rounded-2xl', bg, borderColor, shadow)
})

const cyberClasses = computed(() => {
  return cn(
    'rounded-lg',
    'bg-hud-surface border-hud-border',
    'shadow-cyber hover:shadow-cyber-lg hover:border-cyber-cyan/30',
    'transition-all duration-500'
  )
})
</script>

<style scoped>
/* Gloss sweep bar */
.gloss-bar {
  position: absolute;
  top: -20%;
  width: 8px;
  height: 140%;
  background: rgba(255, 255, 255, 0.18);
  transform: skewX(-25deg);
  filter: blur(4px);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.15);
  animation: glossSweep 3s ease-in-out infinite;
}

/* Corner brackets */
.bracket-tl {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-top: 2px solid rgba(0, 255, 245, 0.4);
  border-left: 2px solid rgba(0, 255, 245, 0.4);
  opacity: 0.5;
  transition: opacity 0.3s;
}

.bracket-br {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-bottom: 2px solid rgba(0, 255, 245, 0.4);
  border-right: 2px solid rgba(0, 255, 245, 0.4);
  opacity: 0.5;
  transition: opacity 0.3s;
}

.cyber-card:hover .bracket-tl,
.cyber-card:hover .bracket-br {
  opacity: 1;
}

@keyframes glossSweep {
  0% { left: -30%; opacity: 0; }
  8% { opacity: 1; }
  35% { left: 120%; opacity: 1; }
  37% { opacity: 0; }
  100% { left: 120%; opacity: 0; }
}
</style>
