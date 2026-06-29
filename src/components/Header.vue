<template>
  <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-500"
    :style="{ background: scrolled ? `var(--color-bg-deep)` : 'transparent', borderColor: scrolled ? 'var(--color-border-subtle)' : 'transparent' }">
    <!-- Status bar line -->
    <div class="h-0.5" style="background: linear-gradient(90deg, var(--color-primary-glow), var(--color-primary), transparent);"></div>

    <nav class="container mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:shadow-[0_0_16px_var(--color-primary)] transition-all duration-300"
            style="border-color: oklch(0.65 var(--hue-sat) var(--hue) / 0.3);">
            <img src="/miya.png" alt="Miya" class="w-full h-full object-cover" />
          </div>
          <span class="text-lg font-bold tracking-tight" style="color: var(--color-text);">jiaandmiya</span>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-all duration-200 skew-hover"
            :style="{ color: $route.path === item.path ? 'var(--color-primary)' : 'var(--color-text-dim)' }"
            :active-class="''"
          >
            <Icon :name="item.icon" size="sm" />
            <span>{{ item.name }}</span>
          </router-link>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
          <!-- Back to top -->
          <button
            v-show="scrolled"
            @click="scrollToTop"
            class="p-1.5 rounded-lg hover:bg-white/5 transition-all"
            style="color: var(--color-text-dim);"
            title="回到顶部"
          >
            <Icon name="solar:arrow-up-bold-duotone" size="sm" />
          </button>

          <!-- Hue picker -->
          <div class="relative">
            <button
              @click="showHuePicker = !showHuePicker"
              class="p-1.5 rounded-lg hover:bg-white/5 transition-all"
              :class="{ '!text-[var(--color-primary)]': showHuePicker }"
              style="color: var(--color-text-dim);"
              title="调整色调"
            >
              <Icon name="solar:palette-round-bold-duotone" size="sm" />
            </button>
            <Transition name="hue-drop">
              <div
                v-if="showHuePicker"
                class="absolute right-0 top-full mt-2 p-4 w-56 rounded-2xl z-50"
                style="background: var(--color-surface-raised); border: 1px solid var(--color-border); backdrop-filter: blur(20px); box-shadow: 0 8px 32px rgba(0,0,0,0.3);"
              >
                <p class="text-caption mb-3">主题色调</p>
                <div class="relative h-4 rounded-full cursor-pointer mb-2 hue-slider"
                  @mousedown="startHueDrag"
                  @touchstart.prevent="startHueDrag"
                  ref="sliderRef"
                >
                  <div
                    class="absolute top-0 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing transition-transform"
                    :style="{ left: ((currentHue / 360) * 100) + '%', background: `oklch(0.65 0.14 ${currentHue})` }"
                  />
                </div>
                <div class="flex justify-between text-caption">
                  <span>0°</span>
                  <span class="font-mono text-xs" style="color: var(--color-primary);">{{ currentHue }}°</span>
                  <span>360°</span>
                </div>
                <div class="flex gap-2 mt-3">
                  <button v-for="preset in presets" :key="preset.hue" @click="setHue(preset.hue)"
                    class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    :class="currentHue === preset.hue ? 'border-white' : 'border-transparent'"
                    :style="{ background: `oklch(0.6 0.14 ${preset.hue})` }"
                    :title="preset.label"
                  />
                </div>
                <button @click="resetHue" class="btn-ghost w-full mt-2 text-xs justify-center">
                  恢复默认
                </button>
              </div>
            </Transition>
          </div>

          <ThemeToggle />

          <div class="hidden md:flex items-center gap-2">
            <router-link v-if="!authStore.isAuthenticated" to="/login" class="btn-ghost">
              <Icon name="solar:login-2-bold-duotone" size="sm" />
              <span>登录</span>
            </router-link>
            <template v-else>
              <span class="badge" :class="roleBadgeClasses">
                {{ authStore.roleName }}
              </span>
              <router-link v-if="authStore.canEdit" to="/cms" class="btn-ghost">
                <Icon name="solar:settings-bold-duotone" size="sm" />
                <span>管理</span>
              </router-link>
              <button @click="handleLogout" class="btn-ghost">
                <Icon name="solar:logout-2-bold-duotone" size="sm" />
              </button>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="toggleMobileMenu" class="md:hidden p-1.5 rounded-lg hover:bg-white/5 transition-all"
            style="color: var(--color-text-dim);">
            <Icon v-if="!isMobileMenuOpen" name="solar:hamburger-menu-bold-duotone" size="md" />
            <Icon v-else name="solar:close-circle-bold-duotone" size="md" />
          </button>
        </div>
      </div>

      <!-- Mobile Radial Menu -->
      <Teleport to="body">
        <Transition name="radial-overlay">
          <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[60] md:hidden" @click="closeMobileMenu"
            :style="{ background: `var(--color-bg-deep)`, backdropFilter: 'blur(16px)' }">
            <!-- Center logo -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex items-center justify-center"
              style="background: var(--color-surface-raised); border: 1px solid var(--color-border);">
              <img src="/miya.png" alt="Miya" class="w-10 h-10 rounded-xl object-cover" />
            </div>

            <!-- Radial items -->
            <div
              v-for="(item, idx) in navItems"
              :key="item.path"
              class="radial-item absolute w-16 h-16"
              :style="getRadialStyle(idx, navItems.length)"
            >
              <router-link
                :to="item.path"
                @click.stop="closeMobileMenu"
                class="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90"
                :style="{
                  background: $route.path === item.path ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                  border: '1px solid ' + ($route.path === item.path ? 'var(--color-primary)' : 'var(--color-border-subtle)'),
                  color: $route.path === item.path ? '#fff' : 'var(--color-text-dim)',
                  transitionDelay: (idx * 40) + 'ms',
                }"
              >
                <Icon :name="item.icon" size="sm" />
                <span class="text-[0.5625rem] font-medium leading-none">{{ item.name.substring(0, 2) }}</span>
              </router-link>
            </div>

            <!-- Extra items -->
            <div class="radial-item absolute w-16 h-16" :style="getExtraRadialStyle(0, navItems.length)">
              <router-link
                v-if="!authStore.isAuthenticated"
                to="/login" @click.stop="closeMobileMenu"
                class="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90"
                style="background: var(--color-surface-raised); border: 1px solid var(--color-border-subtle); color: var(--color-text-dim);"
              >
                <Icon name="solar:login-2-bold-duotone" size="sm" />
                <span class="text-[0.5625rem] font-medium">登录</span>
              </router-link>
              <router-link
                v-else-if="authStore.canEdit"
                to="/cms" @click.stop="closeMobileMenu"
                class="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-300 active:scale-90"
                style="background: var(--color-surface-raised); border: 1px solid var(--color-border-subtle); color: var(--color-text-dim);"
              >
                <Icon name="solar:settings-bold-duotone" size="sm" />
                <span class="text-[0.5625rem] font-medium">管理</span>
              </router-link>
              <ThemeToggle v-else />
            </div>
          </div>
        </Transition>
      </Teleport>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Icon from '@/components/ui/Icon.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)
const scrolled = ref(false)

function onScroll() { scrolled.value = window.scrollY > 50 }
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  const saved = localStorage.getItem('theme_hue')
  if (saved) {
    currentHue.value = Number(saved)
    document.documentElement.style.setProperty('--hue', saved)
  }
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const navItems = [
  { name: '技术笔记', path: '/blog', icon: 'solar:document-text-bold-duotone' },
  { name: '创作', path: '/library', icon: 'solar:notebook-bold-duotone' },
  { name: '人文', path: '/gallery', icon: 'solar:gallery-wide-bold-duotone' },
  { name: 'OC 社区', path: '/companions', icon: 'solar:star-shine-bold-duotone' },
  { name: '免费资源', path: '/resources', icon: 'solar:gift-bold-duotone' },
  { name: '关于', path: '/about', icon: 'solar:info-circle-bold-duotone' },
]

function getRadialStyle(idx: number, total: number) {
  const radius = 130
  const startAngle = -90
  const angleStep = 360 / Math.max(total, 1)
  const angle = startAngle + idx * angleStep
  const rad = (angle * Math.PI) / 180
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: 'translate(-50%, -50%)',
    animationDelay: `${idx * 60}ms`,
  }
}

function getExtraRadialStyle(idx: number, total: number) {
  const radius = 130
  const startAngle = -90
  const angleStep = 360 / Math.max(total + 1, 1)
  const angle = startAngle + total * angleStep
  const rad = (angle * Math.PI) / 180
  const x = Math.cos(rad) * radius
  const y = Math.sin(rad) * radius
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: 'translate(-50%, -50%)',
    animationDelay: `${(total + idx) * 60}ms`,
  }
}

const roleBadgeClasses = computed(() => {
  if (authStore.isSuperAdmin) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  if (authStore.isAdmin) return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
  return 'bg-white/5 text-gray-400'
})

const currentHue = ref(185)
const showHuePicker = ref(false)
const sliderRef = ref<HTMLDivElement | null>(null)

const presets = [
  { hue: 185, label: '青' },
  { hue: 260, label: '紫' },
  { hue: 340, label: '粉' },
  { hue: 30, label: '橙' },
  { hue: 120, label: '绿' },
]

function setHue(h: number) {
  currentHue.value = h
  document.documentElement.style.setProperty('--hue', String(h))
  localStorage.setItem('theme_hue', String(h))
}

function resetHue() {
  setHue(185)
}

function startHueDrag(e: MouseEvent | TouchEvent) {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()

  const update = (clientX: number) => {
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setHue(Math.round(ratio * 360))
  }

  const onMove = (ev: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX
    update(clientX)
  }

  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    document.removeEventListener('touchmove', onMove)
    document.removeEventListener('touchend', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  document.addEventListener('touchmove', onMove)
  document.addEventListener('touchend', onUp)

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  update(clientX)
}

const toggleMobileMenu = () => { isMobileMenuOpen.value = !isMobileMenuOpen.value }
const closeMobileMenu = () => { isMobileMenuOpen.value = false }
const handleLogout = () => { authStore.logout(); router.push('/'); closeMobileMenu() }
</script>

<style scoped>
.radial-item {
  animation: radialIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.radial-overlay-enter-active {
  transition: opacity 0.3s ease-out;
}
.radial-overlay-leave-active {
  transition: opacity 0.25s ease-in;
}
.radial-overlay-enter-from,
.radial-overlay-leave-to {
  opacity: 0;
}

@keyframes radialIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.hue-slider {
  background: linear-gradient(to right,
    oklch(0.6 0.14 0), oklch(0.6 0.14 60), oklch(0.6 0.14 120),
    oklch(0.6 0.14 180), oklch(0.6 0.14 240), oklch(0.6 0.14 300), oklch(0.6 0.14 360)
  );
}

.hue-drop-enter-active {
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.hue-drop-leave-active {
  transition: all 0.15s ease-in;
}
.hue-drop-enter-from,
.hue-drop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
