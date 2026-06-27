<template>
  <header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-glass-light dark:bg-glass-dark border-b border-glass-border dark:border-glass-borderDark">
    <!-- Status bar line -->
    <div class="h-0.5 bg-gradient-to-r from-cyber-cyan/40 via-cyber-teal/20 to-transparent"></div>

    <nav class="container mx-auto px-6 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 bg-gradient-to-br from-cyber-cyan to-cyber-teal rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-glow-cyan group-hover:shadow-cyber-lg transition-all duration-300">
            M
          </div>
          <span class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">jiaandmiya</span>
          <span class="hidden sm:inline font-mono text-[10px] tracking-widest text-cyber-teal/50 dark:text-cyber-cyan/40">SYS.ONLINE</span>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-white/40 dark:hover:bg-gray-700/40 transition-all duration-200 skew-hover"
            active-class="!text-primary-600 dark:!text-primary-400 !bg-primary-50/50 dark:!bg-primary-900/20"
          >
            <Icon :name="item.icon" size="sm" />
            <span>{{ item.name }}</span>
          </router-link>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          <ThemeToggle />

          <div class="hidden md:flex items-center gap-2">
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/login"
              class="btn-ghost"
            >
              <Icon name="solar:login-2-bold-duotone" size="sm" />
              <span>登录</span>
            </router-link>
            <template v-else>
              <span class="badge" :class="roleBadgeClasses">
                {{ authStore.roleName }}
              </span>
              <router-link
                v-if="authStore.canEdit"
                to="/cms"
                class="btn-ghost"
              >
                <Icon name="solar:settings-bold-duotone" size="sm" />
                <span>管理</span>
              </router-link>
              <button @click="handleLogout" class="btn-ghost">
                <Icon name="solar:logout-2-bold-duotone" size="sm" />
              </button>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="toggleMobileMenu" class="md:hidden p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-white/40 dark:hover:bg-gray-700/40 transition-all">
            <Icon v-if="!isMobileMenuOpen" name="solar:hamburger-menu-bold-duotone" size="md" />
            <Icon v-else name="solar:close-circle-bold-duotone" size="md" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-show="isMobileMenuOpen" class="md:hidden mt-3 pt-3 border-t border-glass-border dark:border-glass-borderDark">
          <div class="flex flex-col gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-white/40 dark:hover:bg-gray-700/40 transition-all"
              @click="closeMobileMenu"
            >
              <Icon :name="item.icon" size="sm" />
              <span>{{ item.name }}</span>
            </router-link>

            <div class="pt-2 mt-1 border-t border-glass-border dark:border-glass-borderDark">
              <template v-if="!authStore.isAuthenticated">
                <router-link to="/login" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg" @click="closeMobileMenu">
                  <Icon name="solar:login-2-bold-duotone" size="sm" />
                  <span>登录</span>
                </router-link>
              </template>
              <template v-else>
                <div class="flex items-center gap-2 px-3 py-2">
                  <span class="badge" :class="roleBadgeClasses">{{ authStore.roleName }}</span>
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ authStore.user?.username }}</span>
                </div>
                <router-link v-if="authStore.canEdit" to="/cms" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg" @click="closeMobileMenu">
                  <Icon name="solar:settings-bold-duotone" size="sm" />
                  <span>管理后台</span>
                </router-link>
                <button @click="handleLogout" class="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg w-full text-left">
                  <Icon name="solar:logout-2-bold-duotone" size="sm" />
                  <span>退出</span>
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'
import Icon from '@/components/ui/Icon.vue'

const router = useRouter()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

const navItems = [
  { name: '图书组', path: '/library', icon: 'solar:notebook-bold-duotone' },
  { name: '伴侣社区', path: '/companions', icon: 'solar:star-shine-bold-duotone' },
  { name: '免费资源', path: '/resources', icon: 'solar:gift-bold-duotone' },
  { name: '关于', path: '/about', icon: 'solar:info-circle-bold-duotone' },
]

const roleBadgeClasses = computed(() => {
  if (authStore.isSuperAdmin) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  if (authStore.isAdmin) return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
})

const toggleMobileMenu = () => { isMobileMenuOpen.value = !isMobileMenuOpen.value }
const closeMobileMenu = () => { isMobileMenuOpen.value = false }
const handleLogout = () => { authStore.logout(); router.push('/'); closeMobileMenu() }
</script>
