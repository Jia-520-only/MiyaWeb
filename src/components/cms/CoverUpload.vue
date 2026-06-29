<template>
  <div>
    <label class="block text-sm font-medium text-gray-400 mb-1">{{ label }}</label>
    <div class="flex gap-2">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="input-field flex-1"
        :placeholder="placeholder"
      />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        hidden
        @change="handleUpload"
      />
      <button
        type="button"
        class="btn-secondary !px-3"
        :disabled="uploading"
        @click="triggerUpload"
      >
        <span v-if="uploading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
        <Icon v-else name="solar:upload-minimalistic-bold" size="sm" class="mr-0.5" />
        {{ uploading ? '上传中' : '上传' }}
      </button>
    </div>
    <img
      v-if="modelValue && !uploadError"
      :src="modelValue"
      class="mt-2 w-24 h-24 object-cover rounded-lg border border-white/10"
      @error="uploadError = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadError = ref(false)

const triggerUpload = () => {
  uploadError.value = false
  fileInput.value?.click()
}

const handleUpload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  uploadError.value = false
  try {
    const res = await uploadAPI.uploadFile(file, { isPublic: true })
    const url = res.file?.url || res.file?.path || ''
    if (url) emit('update:modelValue', url)
  } catch {
    uploadError.value = true
  } finally {
    uploading.value = false
    if (input) input.value = ''
  }
}
</script>
