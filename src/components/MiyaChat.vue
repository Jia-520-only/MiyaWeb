<template>
  <!-- 浮窗按钮 -->
  <transition name="fade">
    <button
      v-if="!isOpen"
      @click="handleClick"
      class="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
      title="问弥娅"
    >
      <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
        弥
      </div>
      <span class="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        问弥娅
      </span>
    </button>
  </transition>

  <!-- 聊天窗口 -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="fixed bottom-24 right-6 z-50 w-96 max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                弥
              </div>
              <div>
                <h3 class="font-bold">弥娅</h3>
                <p class="text-xs text-white/80">在线当管家 ✨</p>
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
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
          <!-- AI 配置提示 -->
          <div v-if="!isConfigured" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
            <p class="text-yellow-800 dark:text-yellow-200">
              ⚠️ AI 尚未配置，请联系管理员配置 API Key
            </p>
          </div>

          <!-- 欢迎消息 -->
          <div v-if="messages.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              弥
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              你好！我是弥娅，很高兴为你服务~<br>
              有什么我可以帮你的吗？
            </p>
          </div>

          <!-- 消息 -->
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
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                message.role === 'user'
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  : 'bg-gradient-to-br from-primary-400 to-secondary-500 text-white'
              ]"
            >
              {{ message.role === 'user' ? '你' : '弥' }}
            </div>

            <!-- 消息内容 -->
            <div
              :class="[
                'max-w-[75%] px-4 py-2 rounded-2xl',
                message.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
              ]"
            >
              <!-- 图片 -->
              <img
                v-if="message.image"
                :src="message.image"
                alt="上传的图片"
                class="max-w-full rounded-lg mb-2"
              />

              <!-- 文字内容 -->
              <p class="whitespace-pre-wrap text-sm">{{ message.content }}</p>

              <!-- 时间 -->
              <p
                :class="[
                  'text-xs mt-1',
                  message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                ]"
              >
                {{ formatTime(message.timestamp) }}
              </p>
            </div>
          </div>

          <!-- 加载动画 -->
          <div v-if="isLoading" class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              弥
            </div>
            <div class="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div class="flex gap-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <!-- 图片预览 -->
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

          <div class="flex gap-2">
            <!-- 图片上传按钮 -->
            <button
              @click="triggerImageUpload"
              :disabled="isLoading || !isConfigured"
              class="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="上传图片"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <!-- 输入框 -->
            <input
              v-model="userInput"
              @keypress.enter="sendMessage"
              :disabled="isLoading || !isConfigured"
              placeholder="问我关于网站的问题..."
              class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <!-- 发送按钮 -->
            <button
              @click="sendMessage"
              :disabled="isLoading || !userInput.trim() || !isConfigured"
              class="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
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

// 清空对话
const clearChat = () => {
  if (confirm('确定要清空对话吗？')) {
    chatStore.clearMessages()
  }
}

// 触发图片上传
const triggerImageUpload = () => {
  imageInput.value?.click()
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }
    // 验证文件大小 (最大 5MB)
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

  // 清空 input，允许重复上传同一张图片
  target.value = ''
}

// 移除预览图片
const removePreviewImage = () => {
  previewImage.value = null
  selectedImage.value = null
}

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() && !selectedImage.value) return
  if (!isConfigured) {
    alert('AI 尚未配置，请联系管理员配置 API Key')
    return
  }

  const message = userInput.value.trim()
  const image = selectedImage.value

  // 添加用户消息
  chatStore.addUserMessage(message || '分析这张图片', image)

  // 清空输入
  userInput.value = ''
  previewImage.value = null
  selectedImage.value = null

  // 设置加载状态
  chatStore.setLoading(true)

  try {
    // 调用 AI
    const response = await askMiya(message, image)

    // 添加助手消息
    chatStore.addAssistantMessage(response)
  } catch (error) {
    console.error('AI 问答失败:', error)
    chatStore.addAssistantMessage('抱歉，我现在无法回答你的问题。请稍后再试。')
  } finally {
    chatStore.setLoading(false)
  }
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
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
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
