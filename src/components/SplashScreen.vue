<template>
  <Teleport to="body">
    <Transition name="splash">
      <div v-if="visible" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center" style="background: var(--color-bg-deep);">
        <!-- Rotating gradient ring -->
        <div class="relative mb-10">
          <div class="w-24 h-24 rounded-full animate-[spin_2s_linear_infinite]"
            style="background: conic-gradient(from 0deg, var(--color-primary-glow), var(--color-primary), var(--color-primary-deep), var(--color-primary-glow));">
          </div>
          <div class="absolute inset-2 rounded-full flex items-center justify-center" style="background: var(--color-bg-deep);">
            <img src="/miya.png" alt="Miya" class="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>

        <!-- Loading text -->
        <p class="text-sm font-mono tracking-[0.3em] mb-6" style="color: var(--color-text-dim);">
          {{ bootText }}
        </p>

        <!-- Progress bar -->
        <div class="w-56 h-1 rounded-full overflow-hidden" style="background: var(--color-surface);">
          <div
            class="h-full rounded-full transition-all duration-300 ease-out"
            :style="{ width: progress + '%', background: 'var(--color-primary)' }"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)
const progress = ref(0)
const bootText = ref('INITIALIZING SYSTEM')

const messages = ['INITIALIZING SYSTEM', 'LOADING MODULES', 'ESTABLISHING LINK', 'RENDERING UI']

onMounted(() => {
  const seen = sessionStorage.getItem('splash_seen')
  if (seen) return

  visible.value = true

  let p = 0
  const msgIdx = ref(0)
  const interval = setInterval(() => {
    p += Math.random() * 15 + 5
    if (p > 95) p = 95
    progress.value = Math.min(p, 95)

    if (p > 30 && msgIdx.value === 0) { bootText.value = messages[1]; msgIdx.value++ }
    if (p > 55 && msgIdx.value === 1) { bootText.value = messages[2]; msgIdx.value++ }
    if (p > 75 && msgIdx.value === 2) { bootText.value = messages[3]; msgIdx.value++ }
  }, 200)

  setTimeout(() => {
    clearInterval(interval)
    progress.value = 100
    setTimeout(() => {
      visible.value = false
      sessionStorage.setItem('splash_seen', '1')
    }, 400)
  }, 1800)
})
</script>

<style scoped>
.splash-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.splash-leave-to {
  opacity: 0;
  transform: scale(1.05);
  filter: blur(8px);
}
</style>
