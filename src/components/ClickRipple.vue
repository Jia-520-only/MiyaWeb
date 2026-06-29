<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-[9998]"
    :style="{ width: '100vw', height: '100vh' }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let ripples: Ripple[] = []
let animId = 0

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  velocity: number
}

function initCanvas() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
  ctx = canvasRef.value.getContext('2d')
}

function onClick(e: MouseEvent) {
  if (!ctx || !canvasRef.value) return
  ripples.push({
    x: e.clientX,
    y: e.clientY,
    radius: 0,
    maxRadius: 60 + Math.random() * 40,
    opacity: 0.6,
    velocity: 2.5 + Math.random() * 2,
  })
}

function animate() {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  ripples = ripples.filter(r => r.opacity > 0)
  for (const r of ripples) {
    r.radius += r.velocity
    r.velocity *= 0.96
    r.opacity -= 0.015

    ctx.beginPath()
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
    const hue = getComputedStyle(document.documentElement).getPropertyValue('--hue').trim() || '185'
    ctx.strokeStyle = `oklch(0.65 0.14 ${hue} / ${r.opacity})`
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2)
    ctx.strokeStyle = `oklch(0.82 0.18 ${hue} / ${r.opacity * 0.5})`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  initCanvas()
  document.addEventListener('click', onClick)
  window.addEventListener('resize', initCanvas)
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  document.removeEventListener('click', onClick)
  window.removeEventListener('resize', initCanvas)
  cancelAnimationFrame(animId)
})
</script>
