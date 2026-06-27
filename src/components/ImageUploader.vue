<template>
  <div class="image-uploader">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @click="triggerFileInput"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleFileSelect"
        class="hidden"
      />
      
      <!-- 预览区域 -->
      <div v-if="images.length > 0" class="preview-grid">
        <div
          v-for="(img, index) in images"
          :key="index"
          class="preview-item"
        >
          <img :src="img" :alt="`Image ${index + 1}`" />
          <button
            type="button"
            @click.stop="removeImage(index)"
            class="remove-btn"
            title="删除"
          >
            ×
          </button>
        </div>
        
        <!-- 添加更多按钮 -->
        <div class="add-more-btn">
          <span class="text-3xl">+</span>
          <span class="text-sm">添加</span>
        </div>
      </div>
      
      <!-- 上传提示 -->
      <div v-else class="upload-prompt">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="upload-text">点击或拖拽图片到这里上传</p>
        <p class="upload-hint">支持 JPG、PNG、GIF 等格式</p>
      </div>
    </div>
    
    <!-- 图片数量提示 -->
    <div v-if="maxImages > 0" class="image-count">
      已选择 {{ images.length }} / {{ maxImages }} 张图片
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: string[]
  maxImages?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxImages: 9
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'upload': [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const images = ref<string[]>([...props.modelValue])

const triggerFileInput = () => {
  if (props.maxImages > 0 && images.value.length >= props.maxImages) {
    alert(`最多只能上传 ${props.maxImages} 张图片`)
    return
  }
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
  target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer?.files || [])
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  processFiles(imageFiles)
}

const processFiles = (files: File[]) => {
  if (props.maxImages > 0) {
    const remaining = props.maxImages - images.value.length
    if (remaining <= 0) {
      alert(`最多只能上传 ${props.maxImages} 张图片`)
      return
    }
    files = files.slice(0, remaining)
  }

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      images.value.push(result)
      emit('update:modelValue', images.value)
    }
    reader.readAsDataURL(file)
  })

  emit('upload', files)
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
  emit('update:modelValue', images.value)
}

// 监听外部 modelValue 变化
import { watch } from 'vue'
watch(() => props.modelValue, (newVal) => {
  images.value = [...newVal]
}, { deep: true })
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #f9fafb;
  min-height: 200px;
}

.dark .upload-area {
  border-color: #4b5563;
  background: #1f2937;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

.dark .upload-area:hover,
.dark .upload-area.drag-over {
  background: rgba(139, 92, 246, 0.1);
}

.upload-prompt {
  text-align: center;
}

.upload-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.dark .upload-icon {
  color: #6b7280;
}

.upload-text {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .upload-text {
  color: #d1d5db;
}

.upload-hint {
  font-size: 0.875rem;
  color: #9ca3af;
}

.dark .upload-hint {
  color: #6b7280;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  width: 100%;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.add-more-btn {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.add-more-btn:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.dark .add-more-btn {
  border-color: #4b5563;
}

.image-count {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.dark .image-count {
  color: #9ca3af;
}
</style>
