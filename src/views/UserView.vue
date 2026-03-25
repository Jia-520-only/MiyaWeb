<template>
  <div class="min-h-screen">
    <!-- 封面区域 -->
    <div class="relative h-48 md:h-64 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-100 to-sky-200 dark:from-indigo-900 dark:via-purple-800 dark:to-sky-900">
        <img
          v-if="profile?.cover_image"
          :src="profile.cover_image"
          alt="cover"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-gray-900/60 to-transparent" />
      <div class="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-5">
        <div class="flex items-end gap-5">
          <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg overflow-hidden ring-4 ring-white dark:ring-gray-800 bg-white dark:bg-gray-700">
            <img
              v-if="profile?.avatar"
              :src="profile.avatar"
              alt="avatar"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center text-3xl text-white font-bold">
              {{ (authStore.user?.username || 'U')[0].toUpperCase() }}
            </div>
          </div>
          <div class="pb-1">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
              {{ profile?.display_name || authStore.user?.username || '用户' }}
            </h1>
            <div class="flex items-center gap-3 mt-1">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="roleBadgeClasses"
              >
                {{ authStore.roleName }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                登录于 {{ formattedLoginTime }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 md:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 编辑资料按钮 -->
          <div class="glass-panel p-6 rounded-2xl">
            <button
              @click="toggleEdit"
              class="w-full btn-ghost flex items-center justify-center gap-2"
            >
              <Icon :name="isEditing ? 'solar:check-circle-linear' : 'solar:pen-linear'" size="sm" />
              {{ isEditing ? '保存资料' : '编辑资料' }}
            </button>
          </div>

          <!-- 权限 -->
          <div class="glass-panel p-6 rounded-2xl">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Icon name="solar:shield-check-linear" size="sm" class="text-emerald-500" />
              权限
            </h3>
            <div class="space-y-3">
              <div v-for="perm in permissions" :key="perm.label" class="flex items-center gap-3 text-sm">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center"
                  :class="perm.active
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'"
                >
                  <Icon :name="perm.active ? 'solar:check-circle-linear' : 'solar:close-circle-linear'" size="xs" />
                </div>
                <span class="text-gray-700 dark:text-gray-300">{{ perm.label }}</span>
              </div>
            </div>
          </div>

          <!-- 社交链接 -->
          <div v-if="socialLinks.length > 0" class="glass-panel p-6 rounded-2xl">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Icon name="solar:link-round-linear" size="sm" class="text-sky-500" />
              社交链接
            </h3>
            <div class="space-y-2">
              <a
                v-for="(link, i) in socialLinks"
                :key="i"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-sky-500 transition-colors"
              >
                <Icon :name="link.icon || 'solar:link-linear'" size="sm" />
                <span>{{ link.label }}</span>
              </a>
            </div>
          </div>
        </div>

        <!-- 右侧 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 编辑模式 -->
          <div v-if="isEditing" class="glass-panel p-6 rounded-2xl space-y-5">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">编辑个人资料</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">显示名称</label>
                <input v-model="editForm.display_name" class="input-field w-full" placeholder="你的昵称" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">内容格式</label>
                <select v-model="editForm.bio_type" class="input-field w-full">
                  <option value="markdown">Markdown</option>
                  <option value="txt">纯文本</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">头像URL</label>
              <input v-model="editForm.avatar" class="input-field w-full" placeholder="https://..." />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">封面图URL</label>
              <input v-model="editForm.cover_image" class="input-field w-full" placeholder="https://..." />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">个人简介</label>
              <textarea
                v-model="editForm.bio"
                class="input-field w-full h-48 font-mono text-sm"
                placeholder="介绍一下自己..."
              />
            </div>

            <div class="flex gap-3 justify-end">
              <button @click="cancelEdit" class="btn-ghost">取消</button>
              <button
                @click="saveProfile"
                class="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                保存
              </button>
            </div>
          </div>

          <!-- 展示模式：个人简介 -->
          <div v-if="profile?.bio && !isEditing" class="glass-panel p-6 md:p-8 rounded-2xl">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Icon name="solar:user-circle-linear" size="sm" class="text-indigo-500" />
              个人简介
            </h3>
            <div class="prose prose-sky dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 leading-relaxed">
              <div v-if="profile.bio_type === 'markdown'" v-html="renderedBio" />
              <pre v-else class="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">{{ profile.bio }}</pre>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="glass-panel p-6 rounded-2xl">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Icon name="solar:bolt-linear" size="sm" class="text-amber-500" />
              快捷操作
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <router-link
                v-for="action in quickActions"
                :key="action.to"
                :to="action.to"
                class="flex items-center gap-3 p-4 rounded-xl hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors group"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  :class="action.iconBg"
                >
                  <Icon :name="action.icon" size="md" :class="action.iconColor" />
                </div>
                <div>
                  <h4 class="font-medium text-gray-800 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {{ action.title }}
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ action.desc }}</p>
                </div>
              </router-link>
              <button
                @click="handleLogout"
                class="flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
              >
                <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg flex items-center justify-center">
                  <Icon name="solar:logout-2-linear" size="md" />
                </div>
                <div class="text-left">
                  <h4 class="font-medium text-gray-800 dark:text-white text-sm group-hover:text-red-500 transition-colors">
                    退出登录
                  </h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">安全退出当前账号</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/ui/Icon.vue'

const router = useRouter()
const authStore = useAuthStore()
const isEditing = ref(false)
const profile = ref<any>(null)

const editForm = ref({
  display_name: '',
  bio: '',
  bio_type: 'markdown' as 'markdown' | 'txt',
  avatar: '',
  cover_image: ''
})

const roleBadgeClasses = computed(() => {
  if (authStore.isSuperAdmin) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  if (authStore.isAdmin) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
})

const formattedLoginTime = computed(() => {
  if (!authStore.user?.loginTime) return ''
  const date = new Date(authStore.user.loginTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const permissions = computed(() => [
  { label: '编辑内容', active: authStore.canEdit },
  { label: '发表评论', active: authStore.canComment },
  { label: '使用伴侣社区', active: authStore.canUseCompanions },
  { label: '管理后台', active: authStore.isAdmin }
])

const socialLinks = computed(() => {
  if (!profile.value?.social_links) return []
  try {
    const links = typeof profile.value.social_links === 'string'
      ? JSON.parse(profile.value.social_links)
      : profile.value.social_links
    return Array.isArray(links) ? links : []
  } catch {
    return []
  }
})

const quickActions = computed(() => {
  const actions: Array<{ to: string; title: string; desc: string; icon: string; iconBg: string; iconColor: string }> = []
  if (authStore.canEdit) {
    actions.push(
      { to: '/cms', title: '管理后台', desc: '查看和管理所有内容', icon: 'solar:settings-linear', iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500' }
    )
  }
  if (authStore.canUseCompanions) {
    actions.push(
      { to: '/cms?section=companions', title: '创建伴侣', desc: '在伴侣社区创建你的角色', icon: 'solar:users-group-rounded-linear', iconBg: 'bg-sky-100 dark:bg-sky-900/30', iconColor: 'text-sky-500' }
    )
  }
  if (authStore.canEdit) {
    actions.push(
      { to: '/library', title: '浏览图书组', desc: '查看技术笔记和文章', icon: 'solar:library-linear', iconBg: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-500' }
    )
  }
  return actions
})

const renderedBio = computed(() => {
  if (!profile.value?.bio || profile.value.bio_type !== 'markdown') return ''
  return renderMarkdown(profile.value.bio)
})

function renderMarkdown(text: string): string {
  let html = text
  html = html.replace(/^### (.+)$/gm, '<h4 class="text-lg font-semibold mt-5 mb-2">$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
  html = html.replace(/^# (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sky-500 hover:text-sky-600 underline" target="_blank" rel="noopener">$1</a>')
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
  html = html.replace(/\n\n/g, '</p><p class="mt-3">')
  html = html.replace(/\n/g, '<br>')
  return `<p>${html}</p>`
}

async function loadProfile() {
  try {
    const res = await fetch('/api/profiles/me/profile', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` }
    })
    if (res.ok) {
      const data = await res.json()
      profile.value = data.profile
    }
  } catch {
    // 静默处理
  }
}

function toggleEdit() {
  if (isEditing.value) {
    saveProfile()
  } else {
    editForm.value = {
      display_name: profile.value?.display_name || authStore.user?.username || '',
      bio: profile.value?.bio || '',
      bio_type: (profile.value?.bio_type as 'markdown' | 'txt') || 'markdown',
      avatar: profile.value?.avatar || '',
      cover_image: profile.value?.cover_image || ''
    }
    isEditing.value = true
  }
}

function cancelEdit() {
  isEditing.value = false
}

async function saveProfile() {
  try {
    const res = await fetch('/api/profiles/me/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: JSON.stringify(editForm.value)
    })
    if (res.ok) {
      const data = await res.json()
      profile.value = data.profile
      isEditing.value = false
    }
  } catch {
    // 静默处理
  }
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/')
  }
}

onMounted(loadProfile)
</script>
