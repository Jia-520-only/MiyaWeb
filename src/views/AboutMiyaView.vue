<template>
  <div class="min-h-screen">
    <!-- 封面区域 -->
    <div class="relative h-64 md:h-80 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-sky-200 via-cyan-100 to-teal-200 dark:from-sky-900 dark:via-cyan-800 dark:to-teal-900">
        <img
          v-if="profile?.cover_image"
          :src="profile.cover_image"
          alt="cover"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-gray-900/60 to-transparent" />
      <div class="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6">
        <div class="flex items-end gap-6">
          <div class="w-24 h-24 md:w-28 md:h-28 rounded-2xl shadow-lg overflow-hidden ring-4 ring-white dark:ring-gray-800 bg-white dark:bg-gray-700">
            <img
              v-if="profile?.avatar"
              :src="profile.avatar"
              alt="Miya"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-cyan-300 to-teal-400 flex items-center justify-center text-4xl text-white">
              M
            </div>
          </div>
          <div class="pb-2">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
              {{ profile?.display_name || 'Miya' }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">
              虚拟管家 · AI 助手
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 md:px-8 py-8">
      <!-- 操作栏 -->
      <div v-if="authStore.canEdit" class="flex justify-end mb-6">
        <button
          @click="toggleEdit"
          class="btn-ghost flex items-center gap-2 text-sm"
        >
          <Icon :name="isEditing ? 'solar:check-circle-linear' : 'solar:pen-linear'" size="sm" />
          {{ isEditing ? '保存' : '编辑资料' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：简介 + 社交链接 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 角色卡片 -->
          <div class="glass-panel p-6 rounded-2xl">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Icon name="solar:star-bold" size="sm" class="text-amber-500" />
              角色设定
            </h3>
            <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-3">
                <Icon name="solar:cupcake-linear" size="sm" class="text-rose-400" />
                <span>生日：2025-01-01</span>
              </div>
              <div class="flex items-center gap-3">
                <Icon name="solar:heart-linear" size="sm" class="text-pink-400" />
                <span>性格：温柔、细心、偶尔调皮</span>
              </div>
              <div class="flex items-center gap-3">
                <Icon name="solar:palette-linear" size="sm" class="text-violet-400" />
                <span>喜好：技术分享、阅读、咖啡</span>
              </div>
              <div class="flex items-center gap-3">
                <Icon name="solar:rocket-linear" size="sm" class="text-sky-400" />
                <span>特长：网站管理、内容整理、陪伴</span>
              </div>
            </div>
          </div>

          <!-- 联系方式 -->
          <div class="glass-panel p-6 rounded-2xl">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Icon name="solar:link-round-linear" size="sm" class="text-cyan-500" />
              联系方式
            </h3>
            <div class="space-y-3">
              <template v-if="socialLinks && socialLinks.length > 0">
                <a
                  v-for="(link, i) in socialLinks"
                  :key="i"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <Icon :name="link.icon || 'solar:link-linear'" size="sm" />
                  <span>{{ link.label }}</span>
                </a>
              </template>
              <template v-else>
                <a
                  href="mailto:contact@jiaandmiya.com"
                  class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <Icon name="solar:letter-linear" size="sm" />
                  <span>contact@jiaandmiya.com</span>
                </a>
              </template>
            </div>
          </div>
        </div>

        <!-- 右侧：详细介绍 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 编辑模式 -->
          <div v-if="isEditing" class="glass-panel p-6 rounded-2xl space-y-5">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">编辑弥娅资料</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">显示名称</label>
                <input
                  v-model="editForm.display_name"
                  class="input-field w-full"
                  placeholder="Miya"
                />
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
              <input
                v-model="editForm.avatar"
                class="input-field w-full"
                placeholder="https://..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">封面图URL</label>
              <input
                v-model="editForm.cover_image"
                class="input-field w-full"
                placeholder="https://..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">详细介绍</label>
              <textarea
                v-model="editForm.bio"
                class="input-field w-full h-64 font-mono text-sm"
                placeholder="在这里写弥娅的介绍..."
              />
            </div>

            <div class="flex gap-3 justify-end">
              <button @click="cancelEdit" class="btn-ghost">取消</button>
              <button @click="saveProfile" class="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
                保存
              </button>
            </div>
          </div>

          <!-- 展示模式 -->
          <template v-else>
            <div class="glass-panel p-6 md:p-8 rounded-2xl">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Icon name="solar:document-text-linear" size="sm" class="text-teal-500" />
                {{ profile?.bio_type === 'txt' ? '简介' : '介绍' }}
              </h3>
              <div
                v-if="profile?.bio"
                class="prose prose-sky dark:prose-invert max-w-none text-gray-700 dark:text-gray-200 leading-relaxed"
              >
                <div v-if="profile.bio_type === 'markdown'" v-html="renderedBio" />
                <pre v-else class="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">{{ profile.bio }}</pre>
              </div>
              <div v-else class="text-gray-400 dark:text-gray-500 italic">
                还没有介绍内容，等待管理员编辑...
              </div>
            </div>

            <!-- Miya 寄语 -->
            <div class="glass-panel p-6 md:p-8 rounded-2xl text-center">
              <Icon name="solar:stars-minimalistic-linear" size="lg" class="text-amber-400 mb-3" />
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">Miya 想说</h3>
              <p class="text-gray-600 dark:text-gray-300 text-base italic leading-relaxed mb-4">
                "很高兴在这里遇见你！无论是技术探讨，还是生活分享，Miya 都会用心陪伴。让我们一起成长，一起创造美好的回忆吧！"
              </p>
              <div class="text-cyan-500 dark:text-cyan-400 text-sm font-medium">
                — Miya 在线当管家
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/ui/Icon.vue'

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
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-500 hover:text-cyan-600 underline" target="_blank" rel="noopener">$1</a>')
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
  html = html.replace(/\n\n/g, '</p><p class="mt-3">')
  html = html.replace(/\n/g, '<br>')
  return `<p>${html}</p>`
}

async function loadProfile() {
  try {
    const res = await fetch('/api/profiles/miya')
    if (res.ok) {
      const data = await res.json()
      profile.value = data.profile
    } else {
      const res2 = await fetch('/api/profiles/user/1')
      if (res2.ok) {
        const data = await res2.json()
        profile.value = data.profile
      }
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
      display_name: profile.value?.display_name || 'Miya',
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
    const res = await fetch('/api/profiles/user/1/profile', {
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

onMounted(loadProfile)
</script>
