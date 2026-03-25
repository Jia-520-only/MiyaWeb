<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="close"
    >
      <!-- 背景遮罩 -->
      <div class="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>

      <!-- 图片容器 -->
      <div class="relative max-w-7xl max-h-[90vh] px-4 w-full">
        <img
          :src="imageUrl"
          :alt="title"
          class="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
          @click.stop
        />

        <!-- 标题 -->
        <div v-if="title" class="text-center mt-4">
          <h3 class="text-white text-xl font-semibold">{{ title }}</h3>
          <p v-if="description" class="text-gray-300 text-sm mt-1">{{ description }}</p>
        </div>

        <!-- 关闭按钮 -->
        <button
          @click="close"
          class="absolute -top-12 right-4 text-white hover:text-gray-300 transition-colors"
          title="关闭"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- 导航按钮 (多图模式) -->
        <button
          v-if="showPrev"
          @click="prev"
          class="absolute top-1/2 -left-16 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
          title="上一张"
        >
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <button
          v-if="showNext"
          @click="next"
          class="absolute top-1/2 -right-16 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
          title="下一张"
        >
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <!-- 图片计数 -->
        <div v-if="currentIndex !== undefined && totalImages !== undefined" class="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
          {{ currentIndex + 1 }} / {{ totalImages }}
        </div>
      </div>

      <!-- 键盘事件监听 -->
      <div class="sr-only" tabindex="-1" @keydown="handleKeydown"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  imageUrl: string
  title?: string
  description?: string
  currentIndex?: number
  totalImages?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  prev: []
  next: []
}>()

const close = () => {
  emit('close')
}

const prev = () => {
  emit('prev')
}

const next = () => {
  emit('next')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.show) return

  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      if (props.showPrev) prev()
      break
    case 'ArrowRight':
      if (props.showNext) next()
      break
  }
}

// 计算是否显示导航按钮
const showPrev = computed(() => props.currentIndex !== undefined && props.currentIndex > 0)
const showNext = computed(() => props.currentIndex !== undefined && props.totalImages !== undefined && props.currentIndex < props.totalImages - 1)

// 监听键盘事件
import { onMounted, onUnmounted, computed } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
