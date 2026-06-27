<template>
  <div class="scifi-overlay" :class="{ 'hidden': !visible }">
    <!-- Corner brackets -->
    <div class="corner-tl">
      <div class="corner-line-h"></div>
      <div class="corner-line-v"></div>
    </div>
    <div class="corner-br">
      <div class="corner-line-h"></div>
      <div class="corner-line-v"></div>
    </div>

    <!-- Data drift particles - hex codes -->
    <div
      v-for="(hex, i) in hexChars"
      :key="'hex-' + i"
      class="drift-hex"
      :style="{
        left: hex.x + '%',
        top: hex.y + '%',
        fontSize: hex.size + 'px',
        animationDelay: hex.delay + 's',
        animationDuration: hex.duration + 's',
        opacity: hex.opacity,
      }"
    >{{ hex.char }}</div>

    <!-- Data drift - keywords -->
    <div
      v-for="(kw, i) in keywords"
      :key="'kw-' + i"
      class="drift-keyword"
      :style="{
        left: kw.x + '%',
        top: kw.y + '%',
        animationDelay: kw.delay + 's',
        animationDuration: kw.duration + 's',
        fontSize: kw.size + 'px',
      }"
    >{{ kw.text }}</div>

    <!-- Bottom scan lines -->
    <div
      v-for="(scan, i) in scanLines"
      :key="'scan-' + i"
      class="scan-line"
      :style="{
        left: scan.x + '%',
        animationDelay: scan.delay + 's',
        animationDuration: scan.duration + 's',
        height: scan.height + 'px',
      }"
    ></div>

    <!-- Pulsing dots -->
    <div
      v-for="(dot, i) in pulseDots"
      :key="'dot-' + i"
      class="pulse-dot"
      :style="{
        left: dot.x + '%',
        bottom: dot.y + '%',
        width: dot.size + 'px',
        height: dot.size + 'px',
        animationDelay: dot.delay + 's',
      }"
    ></div>

    <!-- Flow lines (bottom-right) -->
    <div
      v-for="(flow, i) in flowLines"
      :key="'flow-' + i"
      class="flow-line"
      :style="{
        right: (10 + flow.x * 8) + '%',
        bottom: (2 + flow.y * 2) + '%',
        width: flow.width + 'px',
        animationDelay: flow.delay + 's',
        animationDuration: flow.duration + 's',
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: true
})

const hexChars = computed(() =>
  Array.from({ length: 80 }, () => ({
    char: Math.random().toString(16).slice(2, 4).toUpperCase(),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 8 + Math.random() * 6,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.15,
  }))
)

const keywords = computed(() => {
  const words = ['SYS.OK', 'LINK', 'NODE', 'MIYA', 'ONLINE', 'DATA', 'SYNC', 'PING', 'HUB', 'CORE', 'FLOW', 'ECHO', 'PULSE', 'GRID', 'WAVE']
  return Array.from({ length: 20 }, () => ({
    text: words[Math.floor(Math.random() * words.length)],
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    delay: Math.random() * 8,
    duration: 4 + Math.random() * 5,
    size: 9 + Math.random() * 4,
  }))
})

const scanLines = computed(() =>
  Array.from({ length: 8 }, () => ({
    x: 5 + Math.random() * 90,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
    height: 40 + Math.random() * 120,
  }))
)

const pulseDots = computed(() =>
  Array.from({ length: 40 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 20,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 3,
  }))
)

const flowLines = computed(() =>
  Array.from({ length: 8 }, () => ({
    x: Math.random(),
    y: Math.random(),
    width: 20 + Math.random() * 60,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
  }))
)
</script>

<style scoped>
.scifi-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  overflow: hidden;
}

.scifi-overlay.hidden {
  display: none;
}

/* Corner brackets */
.corner-tl {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 60px;
  height: 60px;
  opacity: 0.4;
}
.corner-tl .corner-line-h {
  position: absolute;
  top: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: var(--hud-cyan, #00FFF5);
}
.corner-tl .corner-line-v {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 30px;
  background: var(--hud-cyan, #00FFF5);
}

.corner-br {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 60px;
  height: 60px;
  opacity: 0.4;
}
.corner-br .corner-line-h {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 2px;
  background: var(--hud-cyan, #00FFF5);
}
.corner-br .corner-line-v {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 2px;
  height: 30px;
  background: var(--hud-cyan, #00FFF5);
}

/* Drifting hex characters */
.drift-hex {
  position: absolute;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--hud-cyan, #00FFF5);
  animation: driftFlicker 4s steps(1) infinite;
  user-select: none;
}

/* Drifting keywords */
.drift-keyword {
  position: absolute;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10px;
  font-weight: 500;
  color: var(--hud-teal, #00ADB5);
  letter-spacing: 0.1em;
  animation: driftText 6s ease-in-out infinite;
  user-select: none;
}

/* Scan lines */
.scan-line {
  position: absolute;
  top: -2px;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(0, 255, 245, 0.3), transparent);
  animation: scanLine 3s linear infinite;
  opacity: 0.6;
}

/* Pulsing dots */
.pulse-dot {
  position: absolute;
  border-radius: 50%;
  background: var(--hud-cyan, #00FFF5);
  box-shadow: 0 0 6px var(--hud-cyan, #00FFF5);
  animation: dotBeat 1.5s ease-in-out infinite;
}

/* Flow lines */
.flow-line {
  position: absolute;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 255, 245, 0.25), transparent);
  animation: flowRight 2s linear infinite;
}

@keyframes driftFlicker {
  0%, 100% { opacity: 0.2; }
  8% { opacity: 0.7; }
  10% { opacity: 0.15; }
  20% { opacity: 0.5; }
  28% { opacity: 0.08; }
  35% { opacity: 0.8; }
  45% { opacity: 0.25; }
  60% { opacity: 0.6; }
  75% { opacity: 0.15; }
  90% { opacity: 0.7; }
}

@keyframes driftText {
  0%, 100% { opacity: 0.12; }
  15% { opacity: 0.5; }
  30% { opacity: 0.08; }
  48% { opacity: 0.6; }
  65% { opacity: 0.15; }
  82% { opacity: 0.45; }
}

@keyframes scanLine {
  0% { top: -2px; }
  100% { top: calc(100% + 2px); }
}

@keyframes dotBeat {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.8); }
}

@keyframes flowRight {
  0% { transform: translateX(-100%); opacity: 0; }
  20% { opacity: 0.6; }
  80% { opacity: 0.6; }
  100% { transform: translateX(200%); opacity: 0; }
}

@media (max-width: 768px) {
  .corner-tl, .corner-br { display: none; }
  .drift-hex, .drift-keyword { display: none; }
  .scan-line { opacity: 0.3; }
}
</style>
