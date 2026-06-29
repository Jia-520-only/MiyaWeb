<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative" :style="{ background: `radial-gradient(ellipse at 50% 0%, oklch(0.65 var(--hue-sat) var(--hue) / 0.06) 0%, transparent 50%), linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg-base) 100%)` }">
    <div class="max-w-sm w-full">
      <!-- Card -->
      <div class="card p-8">
        <!-- Logo -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 rounded-2xl overflow-hidden mx-auto ring-1 ring-white/10 shadow-lg"
            style="box-shadow: 0 4px 24px var(--color-primary);">
            <img src="/miya-icon.png" alt="Miya" class="w-full h-full object-cover" />
          </div>
          <h1 class="text-xl font-bold mt-4 tracking-tight" style="color: var(--color-text);">欢迎回来</h1>
          <p class="text-caption mt-1">登录以管理内容和互动</p>
        </div>

        <!-- Success -->
        <div v-if="successMessage" class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-4" style="background: oklch(0.65 0.14 142 / 0.1); border: 1px solid oklch(0.65 0.14 142 / 0.2); color: oklch(0.65 0.14 142);">
          <Icon name="solar:check-circle-bold" size="sm" />
          {{ successMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="username" class="block text-xs font-medium mb-1.5" style="color: var(--color-text-dim);">用户名</label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              autocomplete="username"
              class="input-field"
              placeholder="请输入用户名"
            />
          </div>

          <div>
            <label for="password" class="block text-xs font-medium mb-1.5" style="color: var(--color-text-dim);">密码</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="input-field"
              placeholder="请输入密码"
            />
          </div>

          <!-- Error -->
          <div v-if="errorMessage" class="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style="background: oklch(0.55 0.18 10 / 0.1); border: 1px solid oklch(0.55 0.18 10 / 0.2); color: oklch(0.55 0.18 10);">
            <Icon name="solar:danger-circle-bold" size="sm" />
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full justify-center"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>

        <div class="mt-6 pt-4 border-t text-center" style="border-color: var(--color-border-subtle);">
          <router-link
            to="/"
            class="btn-ghost text-xs"
          >
            <Icon name="solar:arrow-left-bold" size="xs" /> 返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/ui/Icon.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
let redirectTimer: ReturnType<typeof setTimeout> | null = null

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  const result = await authStore.login(username.value, password.value)

  if (result.success) {
    successMessage.value = result.message

    redirectTimer = setTimeout(() => {
      const redirect = router.currentRoute.value.query.redirect as string || '/'
      router.push(redirect)
    }, 1500)
  } else {
    errorMessage.value = result.message
  }

  isLoading.value = false
}

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
})
</script>
