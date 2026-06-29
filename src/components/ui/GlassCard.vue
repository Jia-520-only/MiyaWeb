<template>
  <div
    :class="cn(
      'relative border transition-all duration-500 overflow-hidden',
      cyber ? pgrClasses : standardClasses,
      hover && !cyber ? 'hover:-translate-y-0.5' : '',
      hover && cyber ? 'hover:-translate-y-1' : '',
      className
    )"
  >
    <div
      v-if="cyber"
      class="absolute inset-0 pointer-events-none z-10"
    >
      <div
        :class="[
          'absolute top-[-15%] w-[5px] h-[130%] rounded-[2px] bg-white/15 blur-[4px] -skew-x-[20deg]',
          glossSweep ? 'animate-gloss-sweep' : 'hidden'
        ]"
        style="box-shadow: 0 0 20px rgba(255,255,255,0.2)"
      />
    </div>

    <div v-if="cyber && cornerBrackets" class="absolute inset-0 pointer-events-none z-10">
      <span class="bracket-tl" />
      <span class="bracket-tr" />
      <span class="bracket-bl" />
      <span class="bracket-br" />
    </div>

    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  strength?: 'light' | 'strong'
  hover?: boolean
  cyber?: boolean
  glossSweep?: boolean
  cornerBrackets?: boolean
}

withDefaults(defineProps<Props>(), {
  className: '',
  strength: 'light',
  hover: true,
  cyber: false,
  glossSweep: false,
  cornerBrackets: false,
})

const standardClasses = cn(
  'rounded-2xl backdrop-blur-xl',
  'bg-glass-light dark:bg-glass-dark',
  'border-glass-border dark:border-glass-borderDark',
  'shadow-sm hover:shadow-md'
)

const pgrClasses = cn(
  'rounded-lg',
  'bg-hud-surface',
  'border-hud-border',
  'shadow-cyber hover:shadow-cyber-lg',
  'hover:border-cyber-cyan/30',
  'hover:rotateY-[-0.5deg] hover:rotateX-[0.15deg]',
  'active:scale-[0.985]'
)
</script>

<style scoped>
@keyframes gloss-sweep {
  0%   { left: -30%; opacity: 0; }
  8%   { opacity: 1; }
  40%  { left: 120%; opacity: 1; }
  42%  { opacity: 0; }
  100% { left: 120%; opacity: 0; }
}

.animate-gloss-sweep {
  animation: gloss-sweep 3s ease-in-out infinite;
}

.bracket-tl {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-top: 2px solid rgba(0, 255, 245, 0.35);
  border-left: 2px solid rgba(0, 255, 245, 0.35);
  opacity: 0.45;
  transition: all 0.4s ease;
}
.bracket-tr {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-top: 1px solid rgba(0, 255, 245, 0.2);
  border-right: 1px solid rgba(0, 255, 245, 0.2);
  opacity: 0.35;
  transition: all 0.4s ease;
}
.bracket-bl {
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-bottom: 2px solid rgba(0, 255, 245, 0.25);
  border-left: 2px solid rgba(0, 255, 245, 0.25);
  opacity: 0.4;
  transition: all 0.4s ease;
}
.bracket-br {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-bottom: 1px solid rgba(0, 255, 245, 0.3);
  border-right: 1px solid rgba(0, 255, 245, 0.3);
  opacity: 0.45;
  transition: all 0.4s ease;
}
</style>
