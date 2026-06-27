/**
 * AI Chat Store - 管理弥娅 AI 问答状态
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  image?: string
  timestamp: Date
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isLoading = ref(false)
  const isOpen = ref(false)

  // 添加用户消息
  const addUserMessage = (content: string, image?: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      image,
      timestamp: new Date()
    }
    messages.value.push(message)
    return message
  }

  // 添加助手消息
  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    }
    messages.value.push(message)
    return message
  }

  // 清空对话
  const clearMessages = () => {
    messages.value = []
  }

  // 打开/关闭聊天窗口
  const toggleChat = () => {
    isOpen.value = !isOpen.value
  }

  const openChat = () => {
    isOpen.value = true
  }

  const closeChat = () => {
    isOpen.value = false
  }

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  return {
    messages,
    isLoading,
    isOpen,
    addUserMessage,
    addAssistantMessage,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
    setLoading
  }
})
