<template>
  <button
    @click="isOpen = true"
    class="fixed bottom-6 right-6 z-40 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
    title="自定义背景"
  >
    <svg class="w-6 h-6 text-gray-700 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
  </button>

  <!-- 背景编辑弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white/95 backdrop-blur-xl rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">自定义背景</h2>
              <button @click="isOpen = false" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="space-y-6">
              <!-- 背景类型选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">背景类型</label>
                <div class="flex gap-3">
                  <button
                    @click="backgroundType = 'default'"
                    :class="[
                      'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                      backgroundType === 'default'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    ]"
                  >
                    <span class="text-2xl mb-1 block">🎨</span>
                    默认背景
                  </button>
                  <button
                    @click="backgroundType = 'custom'"
                    :class="[
                      'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                      backgroundType === 'custom'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    ]"
                  >
                    <span class="text-2xl mb-1 block">🖼️</span>
                    自定义图片
                  </button>
                  <button
                    @click="backgroundType = 'text-only'"
                    :class="[
                      'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                      backgroundType === 'text-only'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    ]"
                  >
                    <span class="text-2xl mb-1 block">✏️</span>
                    仅文字背景
                  </button>
                </div>
              </div>

              <!-- 默认背景选择 -->
              <div v-if="backgroundType === 'default'">
                <label class="block text-sm font-medium text-gray-700 mb-3">选择默认背景</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="bg in defaultBackgrounds"
                    :key="bg.id"
                    @click="selectDefaultBackground(bg)"
                    :class="[
                      'relative rounded-lg overflow-hidden border-2 transition-all aspect-video',
                      currentDefaultBg === bg.id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    ]"
                    :style="{
                      backgroundImage: bg.preview
                    }"
                  >
                    <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span class="text-white text-sm font-medium">{{ bg.name }}</span>
                    </div>
                    <div
                      v-if="currentDefaultBg === bg.id"
                      class="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                    >
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <!-- 自定义图片上传 -->
              <div v-if="backgroundType === 'custom'" class="space-y-6">
                <!-- 当前页面 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">当前页面</label>
                  <div class="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
                    {{ pageName }}
                  </div>
                </div>

                <!-- 背景预览 -->
                <div v-if="localBackground.imageUrl" class="relative rounded-lg overflow-hidden aspect-video">
                  <img
                    :src="localBackground.imageUrl"
                    alt="背景预览"
                    class="w-full h-full object-cover"
                    :style="{
                      filter: `blur(${localBackground.blur}px)`,
                      opacity: localBackground.opacity / 100
                    }"
                  />
                  <!-- 边缘淡化效果预览 -->
                  <div
                    class="absolute inset-0"
                    style="backgroundImage: radial-gradient(ellipse at center, transparent 60%, rgba(255,255,255,0.5) 100%);"
                  ></div>
                </div>
                <div v-else class="relative rounded-lg overflow-hidden aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span class="text-gray-400">暂无背景图片</span>
                </div>

                <!-- 图片上传 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">背景图片</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      @change="handleImageUpload"
                      accept="image/*"
                      class="hidden"
                      id="background-upload"
                    />
                    <label
                      for="background-upload"
                      class="cursor-pointer block"
                    >
                      <div v-if="!localBackground.imageUrl" class="text-gray-500">
                        <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-sm">点击上传图片</p>
                        <p class="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF (最大 5MB)</p>
                      </div>
                      <div v-else class="text-primary-600">
                        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p class="text-sm">点击更换图片</p>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- 模糊度调节 -->
                <div v-if="localBackground.imageUrl">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    模糊度: {{ localBackground.blur }}px
                  </label>
                  <input
                    v-model.number="localBackground.blur"
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0px</span>
                    <span>10px</span>
                    <span>20px</span>
                  </div>
                </div>

                <!-- 透明度调节 -->
                <div v-if="localBackground.imageUrl">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    透明度: {{ localBackground.opacity }}%
                  </label>
                  <input
                    v-model.number="localBackground.opacity"
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div class="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>55%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <!-- 仅文字背景模式提示 -->
              <div v-if="backgroundType === 'text-only'" class="text-center py-8 bg-gray-50 rounded-lg">
                <span class="text-4xl mb-3 block">✏️</span>
                <p class="text-gray-600">仅文字背景模式</p>
                <p class="text-sm text-gray-500 mt-2">在此模式下，不会设置页面背景图片，只会为文字区域设置半透明背景</p>
              </div>

              <!-- 文字区域背景设置 -->
              <div class="border-t pt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">文字区域背景设置</h3>
                <div class="space-y-4">
                  <!-- 背景颜色选择 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">文字区域背景颜色</label>
                    <div class="flex gap-3">
                      <button
                        @click="localBackground.contentOverlayColor = 'none'"
                        :class="[
                          'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                          localBackground.contentOverlayColor === 'none'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        ]"
                      >
                        <span class="text-xl mb-1 block">🚫</span>
                        无背景
                      </button>
                      <button
                        @click="localBackground.contentOverlayColor = 'white'"
                        :class="[
                          'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                          localBackground.contentOverlayColor === 'white'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        ]"
                      >
                        <span class="text-xl mb-1 block">⬜</span>
                        白色背景
                      </button>
                      <button
                        @click="localBackground.contentOverlayColor = 'black'"
                        :class="[
                          'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                          localBackground.contentOverlayColor === 'black'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        ]"
                      >
                        <span class="text-xl mb-1 block">⬛</span>
                        黑色背景
                      </button>
                    </div>
                  </div>

                  <!-- 背景透明度调节 -->
                  <div v-if="localBackground.contentOverlayColor !== 'none'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      文字区域背景透明度: {{ localBackground.contentOverlayOpacity }}%
                    </label>
                    <input
                      v-model.number="localBackground.contentOverlayOpacity"
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50% (半透明)</span>
                      <span>75%</span>
                      <span>100% (不透明)</span>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                      💡 建议：浅色页面背景使用白色背景，深色页面背景使用黑色背景，透明度建议 85%-95%
                    </p>
                  </div>

                  <!-- 预览卡片 -->
                  <div
                    v-if="localBackground.contentOverlayColor !== 'none'"
                    class="p-4 rounded-lg transition-all"
                    :style="{
                      backgroundColor: localBackground.contentOverlayColor === 'white'
                        ? `rgba(255, 255, 255, ${localBackground.contentOverlayOpacity / 100})`
                        : `rgba(0, 0, 0, ${localBackground.contentOverlayOpacity / 100})`,
                      color: localBackground.contentOverlayColor === 'white' ? '#1f2937' : '#f9fafb'
                    }"
                  >
                    <p class="text-sm font-medium mb-2">预览效果</p>
                    <p class="text-sm">这是文字区域的预览效果。你可以看到在不同背景色和透明度下的文字可读性。</p>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex gap-3">
                <button
                  v-if="backgroundType === 'custom' && localBackground.imageUrl"
                  @click="deleteBackground"
                  class="flex-1 px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  删除背景
                </button>
                <button
                  v-if="backgroundType === 'custom' || backgroundType === 'text-only'"
                  @click="saveCustomBackground"
                  class="flex-1 btn-primary"
                >
                  应用设置
                </button>
                <button
                  v-else
                  @click="isOpen = false"
                  class="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </div>

              <!-- 清理存储空间 -->
              <div class="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <button
                  @click="printAllBackgrounds"
                  class="w-full px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  📋 查看所有页面背景设置（控制台）
                </button>
                <button
                  @click="checkStorage"
                  class="w-full px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  💾 查看存储使用情况（控制台）
                </button>
                <button
                  @click="clearAllImages"
                  class="w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  🗑️ 清理所有背景图片（释放存储空间）
                </button>
                <button
                  @click="forceClearAll"
                  class="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                >
                  ⚠️ 强制清空所有数据（谨慎使用）
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPageBackground, savePageBackground, deletePageBackground, clearAllBackgroundImages, printAllBackgrounds, clearAllBackgrounds, getStorageUsage } from '@/utils/backgroundStorage'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const isOpen = ref(false)
const backgroundType = ref<'default' | 'custom' | 'text-only'>('default')
const currentDefaultBg = ref<string | null>(null)
const localBackground = ref({
  imageUrl: null as string | null,
  blur: 0,
  opacity: 80,
  contentOverlayColor: 'none' as 'white' | 'black' | 'none',
  contentOverlayOpacity: 90
})

// 默认背景列表
const defaultBackgrounds = [
  {
    id: 'gradient-blue',
    name: '蓝色渐变',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient-sunset',
    name: '日落渐变',
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 'gradient-ocean',
    name: '海洋渐变',
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'gradient-forest',
    name: '森林渐变',
    preview: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)'
  },
  {
    id: 'gradient-purple',
    name: '紫色梦幻',
    preview: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
  },
  {
    id: 'gradient-dark',
    name: '深邃夜空',
    preview: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
  }
]

const pageNames: Record<string, string> = {
  '/': '首页',
  '/notes': '技术笔记',
  '/articles': '文章',
  '/culture': '文化区',
  '/community': '社区',
  '/free-resources': '免费资源',
  '/about': '关于'
}

const pageName = computed(() => {
  return pageNames[route.path] || route.path
})

const loadBackground = () => {
  const bg = getPageBackground(route.path)
  localBackground.value = {
    imageUrl: bg.imageUrl,
    blur: bg.blur,
    opacity: bg.opacity || 80,
    contentOverlayColor: bg.contentOverlayColor || 'none',
    contentOverlayOpacity: bg.contentOverlayOpacity || 90
  }

  const defaultBg = localStorage.getItem(`default_bg_${route.path}`)
  if (defaultBg) {
    currentDefaultBg.value = defaultBg
    backgroundType.value = 'default'
  } else if (bg.imageUrl) {
    backgroundType.value = 'custom'
  } else if (bg.contentOverlayColor && bg.contentOverlayColor !== 'none') {
    // 如果没有图片但有文字区域背景设置，使用 text-only 模式
    backgroundType.value = 'text-only'
  } else {
    backgroundType.value = 'default'
  }
}

onMounted(() => {
  loadBackground()
})

// 选择默认背景
const selectDefaultBackground = (bg: any) => {
  currentDefaultBg.value = bg.id
  // 保存默认背景到 localStorage
  localStorage.setItem(`default_bg_${route.path}`, bg.id)

  // 清除自定义背景
  deletePageBackground(route.path)

  alert('默认背景已应用!')
  window.location.reload()
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
      localBackground.value.imageUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 保存自定义背景
const saveCustomBackground = () => {
  const dataToSave = {
    page: route.path,
    imageUrl: backgroundType.value === 'text-only' ? null : localBackground.value.imageUrl,
    blur: backgroundType.value === 'text-only' ? 0 : localBackground.value.blur,
    opacity: backgroundType.value === 'text-only' ? 0 : localBackground.value.opacity,
    contentOverlayColor: localBackground.value.contentOverlayColor,
    contentOverlayOpacity: localBackground.value.contentOverlayOpacity,
    updatedAt: new Date().toISOString()
  }

  try {
    savePageBackground(dataToSave)

    // 清除默认背景
    localStorage.removeItem(`default_bg_${route.path}`)

    // 发送自定义事件通知 PageBackground 组件更新
    window.dispatchEvent(new CustomEvent('background-updated', { detail: { path: route.path } }))

    isOpen.value = false
    alert('背景已应用!')
  } catch (error) {
    console.error('保存背景失败:', error)
    alert('保存失败，请重试！')
  }
}

// 删除背景
const deleteBackground = () => {
  if (confirm('确定要删除当前页面的背景吗？')) {
    deletePageBackground(route.path)
    localStorage.removeItem(`default_bg_${route.path}`)
    localBackground.value = {
      imageUrl: null,
      blur: 0,
      opacity: 80,
      contentOverlayColor: 'none',
      contentOverlayOpacity: 90
    }
    isOpen.value = false
    alert('背景已删除!')
    window.location.reload()
  }
}

// 清理所有背景图片
const clearAllImages = () => {
  if (confirm('确定要清理所有背景图片吗？\n\n这将删除所有页面的背景图片，但保留文字区域背景设置。')) {
    try {
      clearAllBackgroundImages()
      alert('已清理所有背景图片!')
      window.location.reload()
    } catch (error) {
      console.error('清理失败:', error)
      alert('清理失败，请重试！')
    }
  }
}

// 打印所有页面背景设置
const printAllBackgrounds = () => {
  printAllBackgrounds()
  alert('已打印所有页面背景设置到控制台，请按 F12 查看')
}

// 查看存储使用情况
const checkStorage = () => {
  const usage = getStorageUsage()
  console.log('=== 存储使用情况 ===')
  console.log(`已使用: ${(usage.used / 1024 / 1024).toFixed(2)} MB`)
  console.log(`总容量: ${(usage.total / 1024 / 1024).toFixed(2)} MB`)
  console.log(`使用率: ${usage.percentage}%`)
  console.log('\n详细数据:')
  console.table(usage.details)
  console.log('====================')
  alert(`已使用 ${(usage.used / 1024 / 1024).toFixed(2)} MB / ${(usage.total / 1024 / 1024).toFixed(2)} MB (${usage.percentage}%)`)
}

// 强制清空所有数据
const forceClearAll = () => {
  if (confirm('⚠️ 警告：此操作将清空所有页面的背景设置和图片！\n\n确定要继续吗？')) {
    try {
      clearAllBackgrounds()
      alert('已强制清空所有数据！')
      window.location.reload()
    } catch (error) {
      console.error('清空失败:', error)
      alert('清空失败，请重试！')
    }
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
