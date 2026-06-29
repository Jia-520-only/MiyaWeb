<template>
  <div class="space-y-6">
    <h2 class="section-title">旧版内容管理</h2>
    <p class="text-sm text-gray-400">这里管理原有的页面内容项（content_items 表），后续可迁移到新版系统。</p>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in contents" :key="item.id" class="glass-card !p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="badge bg-white/5 text-gray-400 text-xs">{{ item.type }}</span>
              <span class="text-xs text-gray-400">{{ item.page }} / {{ item.section }}</span>
            </div>
            <h3 class="text-sm font-semibold text-white">{{ item.title }}</h3>
            <p class="text-xs text-gray-400 mt-1">{{ item.updated_at }}</p>
          </div>
          <button @click="editItem(item)" class="btn-ghost !px-2 !py-1 text-xs">编辑</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal && editingContent" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="showModal = false">
        <div class="glass-panel p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-slide-up">
          <h2 class="text-xl font-bold text-white mb-6">编辑内容</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">标题</label>
              <input v-model="editingContent.title" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">内容</label>
              <textarea v-model="editingContent.content" class="input-field !h-60 font-mono text-sm" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showModal = false" class="btn-secondary">取消</button>
            <button @click="save" class="btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { contentAPI } from '@/utils/apiClient'

const contents = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const editingContent = ref<any>(null)

const load = async () => {
  loading.value = true
  try {
    const res = await contentAPI.getAllContents()
    contents.value = res.items || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const editItem = (item: any) => {
  editingContent.value = { ...item }
  showModal.value = true
}

const save = async () => {
  if (!editingContent.value) return
  saving.value = true
  try {
    await contentAPI.updateContent(editingContent.value.id, editingContent.value)
    showModal.value = false; await load()
  } catch (e: any) { alert('保存失败') }
  finally { saving.value = false }
}

onMounted(load)
</script>
