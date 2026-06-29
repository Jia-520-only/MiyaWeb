<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-0"
    :style="{ width: '100vw', height: '100vh' }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let animId = 0
const MAX_PARTICLES = 30
let cachedHue = '185'

type ParticleType = 'sakura' | 'firefly' | 'star'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type: ParticleType
  life: number
  maxLife: number
  rotation: number
  rotSpeed: number
}

function spawnParticle(): Particle {
  const isDark = document.documentElement.classList.contains('dark')
  const types: ParticleType[] = isDark ? ['firefly', 'star'] : ['sakura', 'star']
  const type = types[Math.floor(Math.random() * types.length)]

  const w = window.innerWidth
  const h = window.innerHeight

  switch (type) {
    case 'sakura':
      return {
        x: Math.random() * w,
        y: -20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 0.5 + Math.random() * 1.5,
        size: 6 + Math.random() * 8,
        opacity: 0.3 + Math.random() * 0.4,
        type,
        life: 0,
        maxLife: 400 + Math.random() * 200,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
      }
    case 'firefly':
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 2 + Math.random() * 3,
        opacity: 0,
        type,
        life: 0,
        maxLife: 200 + Math.random() * 150,
        rotation: 0,
        rotSpeed: 0,
      }
    case 'star':
      return {
        x: Math.random() * w,
        y: Math.random() * h * 0.6,
        vx: 0,
        vy: 0,
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.5,
        type,
        life: 0,
        maxLife: 300 + Math.random() * 400,
        rotation: 0,
        rotSpeed: 0,
      }
  }
}

function drawSakura(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.fillStyle = `oklch(0.85 0.1 ${Number(cachedHue) + 160} / ${p.opacity})`

  const s = p.size
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.5, s * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.25, s * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2)
  ctx.fillStyle = `oklch(0.9 0.08 ${Number(cachedHue) + 100} / ${p.opacity * 0.7})`
  ctx.fill()

  ctx.restore()
}

function drawFirefly(ctx: CanvasRenderingContext2D, p: Particle) {
  const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
  glow.addColorStop(0, `oklch(0.82 0.18 ${cachedHue} / ${p.opacity})`)
  glow.addColorStop(0.4, `oklch(0.7 0.15 ${cachedHue} / ${p.opacity * 0.5})`)
  glow.addColorStop(1, `oklch(0.7 0.15 ${cachedHue} / 0)`)

  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = `oklch(0.9 0.1 ${cachedHue} / ${p.opacity})`
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}

function drawStar(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.fillStyle = `oklch(0.95 0.02 ${cachedHue} / ${p.opacity})`
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fill()
}

function animate() {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  if (particles.length < MAX_PARTICLES && Math.random() < 0.25) {
    particles.push(spawnParticle())
  }

  particles = particles.filter(p => {
    p.life++
    if (p.life > p.maxLife) return false

    switch (p.type) {
      case 'sakura':
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        if (p.y > window.innerHeight + 30) return false
        break
      case 'firefly': {
        p.x += p.vx + Math.sin(p.life * 0.05) * 0.3
        p.y += p.vy + Math.cos(p.life * 0.07) * 0.3
        const lifeRatio = p.life / p.maxLife
        p.opacity = Math.sin(lifeRatio * Math.PI) * 0.7
        if (p.x < -30 || p.x > window.innerWidth + 30 || p.y < -30 || p.y > window.innerHeight + 30) return false
        break
      }
      case 'star': {
        const lifeRatio = p.life / p.maxLife
        p.opacity = 0.2 + Math.sin(lifeRatio * Math.PI * 2) * 0.3 + 0.2
        break
      }
    }
    return true
  })

  for (const p of particles) {
    switch (p.type) {
      case 'sakura': drawSakura(ctx!, p); break
      case 'firefly': drawFirefly(ctx!, p); break
      case 'star': drawStar(ctx!, p); break
    }
  }

  animId = requestAnimationFrame(animate)
}

function initCanvas() {
  if (!canvasRef.value) return
  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
  ctx = canvasRef.value.getContext('2d')
  cachedHue = getComputedStyle(document.documentElement).getPropertyValue('--hue').trim() || '185'
}

function handleVisibilityChange() {
  if (document.hidden) {
    cancelAnimationFrame(animId)
  } else {
    animId = requestAnimationFrame(animate)
  }
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  cancelAnimationFrame(animId)
})
</script>
