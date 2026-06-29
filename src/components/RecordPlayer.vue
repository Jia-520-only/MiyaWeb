<template>
  <div class="record-player" :class="{ playing: isPlaying }">
    <!-- Vinyl disc -->
    <div class="vinyl-disc" :class="{ spin: isPlaying }">
      <div class="disc-grooves" />
      <div class="disc-label" :style="{ background: labelColor }">
        <Icon name="solar:music-notes-bold" size="sm" color="rgba(255,255,255,0.7)" />
      </div>
      <div class="disc-shine" />
    </div>

    <!-- Tonearm -->
    <div class="tonearm" :class="{ on: isPlaying }">
      <div class="arm-base" />
      <div class="arm-stick" />
      <div class="arm-head" />
    </div>

    <!-- Controls -->
    <div class="mt-4 flex items-center justify-center gap-3">
      <button @click="togglePlay" class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        style="background: var(--color-primary); color: #fff;">
        <Icon :name="isPlaying ? 'solar:pause-bold' : 'solar:play-bold'" size="sm" />
      </button>
    </div>

    <!-- Now playing label -->
    <p class="text-caption text-center mt-2 font-mono text-[0.625rem] tracking-[0.2em]">
      {{ isPlaying ? 'NOW PLAYING' : 'PRESS PLAY' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/ui/Icon.vue'

const isPlaying = ref(false)
const labelColor = '#e04040'

function togglePlay() {
  isPlaying.value = !isPlaying.value
}
</script>

<style scoped>
.record-player {
  @apply relative flex flex-col items-center;
}

.vinyl-disc {
  @apply relative w-40 h-40 rounded-full;
  background: conic-gradient(from 0deg,
    #1a1a1a 0deg 2deg, #2a2a2a 2deg 4deg, #1a1a1a 4deg 6deg, #2a2a2a 6deg 8deg,
    #1a1a1a 8deg 10deg, #2a2a2a 10deg 12deg, #1a1a1a 12deg 14deg, #2a2a2a 14deg 16deg,
    #1a1a1a 16deg 18deg, #2a2a2a 18deg 20deg, #1a1a1a 20deg 22deg, #2a2a2a 22deg 24deg,
    #1a1a1a 24deg 26deg, #2a2a2a 26deg 28deg, #1a1a1a 28deg 30deg, #2a2a2a 30deg 32deg,
    #1a1a1a 32deg 34deg, #2a2a2a 34deg 36deg
  );
  box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 0 40px rgba(0,0,0,0.3);
}

.vinyl-disc.spin {
  animation: vinylSpin 3s linear infinite;
}

.disc-grooves {
  @apply absolute inset-2 rounded-full;
  border: 2px solid rgba(255,255,255,0.03);
  box-shadow: inset 0 0 8px rgba(255,255,255,0.02);
}

.disc-label {
  @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.disc-shine {
  @apply absolute inset-0 rounded-full pointer-events-none;
  background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%);
}

.tonearm {
  @apply absolute top-0 right-[-10px] origin-top-right transition-transform duration-500;
  transform: rotate(25deg);
}

.tonearm.on {
  transform: rotate(5deg);
}

.arm-base {
  @apply w-4 h-4 rounded-full;
  background: #444;
  border: 2px solid #555;
}

.arm-stick {
  @apply w-1 h-28 mx-auto;
  background: linear-gradient(180deg, #555, #333);
}

.arm-head {
  @apply w-3 h-2 rounded-sm;
  background: #666;
  margin: 0 auto;
}

@keyframes vinylSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
