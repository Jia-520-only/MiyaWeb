<template>
  <!-- 浮窗按钮 -->
  <transition name="fade">
    <button
      v-if="!isOpen"
      @click="handleClick"
      class="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl shadow-glow-cyan hover:shadow-cyber-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      title="问弥娅"
    >
      <div class="absolute inset-0 rounded-2xl ring-2 ring-cyan-400/30 animate-glow-pulse pointer-events-none" />
      <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-teal-600 font-bold text-lg">
        弥
      </div>
      <span class="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono">
        > 问弥娅
      </span>
    </button>
  </transition>

  <!-- 聊天窗口 -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
      >
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-cyan-500 to-teal-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">
                弥
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold">弥娅</h3>
                  <span class="status-dot online w-2 h-2" />
                </div>
                <p class="text-xs text-white/70 font-mono tracking-wider">SYS.管家·在线</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="clearChat"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="清空对话"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
              <button
                @click="chatStore.closeChat"
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="关闭"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800" ref="msgList">
          <!-- AI 配置提示 -->
          <div v-if="!isConfigured" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm">
            <p class="text-yellow-800 dark:text-yellow-200 text-xs font-mono">
              ⚠ AI 尚未配置，请联系管理员配置 API Key
            </p>
          </div>

          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="text-center py-8 animate-fade-in">
            <div class="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-glow-teal">
              弥
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              你好！我是弥娅，很高兴为你服务~<br>
              有什么我可以帮你的吗？
            </p>
          </div>

          <!-- 消息 -->
          <TransitionGroup name="msg">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              ]"
            >
              <!-- 头像 -->
              <div
                :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0',
                  message.role === 'user'
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    : 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white'
                ]"
              >
                {{ message.role === 'user' ? '你' : '弥' }}
              </div>

              <!-- 消息气泡 -->
              <div
                :class="[
                  'max-w-[75%] px-4 py-2 rounded-2xl',
                  message.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                ]"
              >
                <img
                  v-if="message.image"
                  :src="message.image"
                  alt="上传的图片"
                  class="max-w-full rounded-lg mb-2"
                />
                <p class="whitespace-pre-wrap text-sm">{{ message.content }}</p>
                <p
                  :class="[
                    'text-[10px] mt-1 font-mono',
                    message.role === 'user' ? 'text-white/60' : 'text-gray-400'
                  ]"
                >
                  {{ formatTime(message.timestamp) }}
                </p>
              </div>
            </div>
          </TransitionGroup>

          <!-- 加载动画 -->
          <div v-if="isLoading" class="flex gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              弥
            </div>
            <div class="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div class="flex gap-1.5">
                <span class="loading-dot" />
                <span class="loading-dot" style="animation-delay: 0.15s" />
                <span class="loading-dot" style="animation-delay: 0.3s" />
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div v-if="previewImage" class="relative inline-block mb-2">
            <img
              :src="previewImage"
              alt="预览"
              class="max-w-32 max-h-32 rounded-lg object-cover"
            />
            <button
              @click="removePreviewImage"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>

          <div class="flex gap-2 items-end">
            <button
              @click="triggerImageUpload"
              :disabled="isLoading || !isConfigured"
              class="p-2 text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="上传图片"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </button>

            <input
              ref="imageInput"
              type="file"
              @change="handleImageUpload"
              accept="image/*"
              class="hidden"
            />

            <!-- 终端风格输入框 -->
            <div class="flex-1 relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-sm pointer-events-none">></span>
              <input
                v-model="userInput"
                @keypress.enter="sendMessage"
                :disabled="isLoading || !isConfigured"
                placeholder="输入消息..."
                class="w-full pl-7 pr-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-transparent focus:border-cyan-400/50 dark:focus:border-cyan-400/30 focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 outline-none"
              />
            </div>

            <button
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim() || !isConfigured"
              class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed hover:shadow-glow-cyan active:scale-95"
            >
              <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatStore } from '@/stores/chat'
import { askMiya, isAIConfigured } from '@/utils/aiService'

const chatStore = useChatStore()
const { messages, isLoading, isOpen } = storeToRefs(chatStore)

const userInput = ref('')
const previewImage = ref<string | null>(null)
const selectedImage = ref<string | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

const isConfigured = isAIConfigured()

const handleClick = () => {
  chatStore.openChat()
}

const clearChat = () => {
  if (confirm('确定要清空对话吗？')) {
    chatStore.clearMessages()
  }
}

const triggerImageUpload = () => {
  imageInput.value?.click()
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string
      selectedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

const removePreviewImage = () => {
  previewImage.value = null
  selectedImage.value = null
}

const sendMessage = async () => {
  if (!userInput.value.trim() && !selectedImage.value) return
  if (!isConfigured) {
    alert('AI 尚未配置，请联系管理员配置 API Key')
    return
  }

  const message = userInput.value.trim()
  const image = selectedImage.value

  chatStore.addUserMessage(message || '分析这张图片', image)

  userInput.value = ''
  previewImage.value = null
  selectedImage.value = null

  chatStore.setLoading(true)

  try {
    const response = await askMiya(message, image)
    chatStore.addAssistantMessage(response)
  } catch (error) {
    console.error('AI 问答失败:', error)
    chatStore.addAssistantMessage('抱歉，我现在无法回答你的问题。请稍后再试。')
  } finally {
    chatStore.setLoading(false)
  }
}

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  else if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  else if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  else return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Message entrance */
.msg-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.msg-leave-active {
  transition: all 0.2s ease-in;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
.msg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Loading dots */
.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  display: inline-block;
  animation: dotBounce 0.6s ease-in-out infinite;
}
@keyframes dotBounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-6px); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
