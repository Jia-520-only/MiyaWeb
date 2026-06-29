<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="section-title !mb-0">免费资源链接</h2>
      <button @click="showModal = true" class="btn-primary">
        <Icon name="solar:add-circle-bold" size="sm" class="mr-1" />
        添加资源
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="res in resources" :key="res.id" class="glass-card !p-4 flex items-center justify-between group">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <Icon v-if="res.icon" :name="res.icon" size="lg" />
            <Icon v-else name="solar:link-round-bold-duotone" size="lg" />
          </div>
          <div class="min-w-0">
            <h3 class="font-semibold text-white text-sm truncate">{{ res.title }}</h3>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <span v-if="res.category">{{ res.category }}</span>
              <span v-if="res.category">·</span>
              <a :href="res.url" target="_blank" class="truncate max-w-[200px] hover:text-primary-500">{{ res.url }}</a>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span :class="['badge', res.is_visible ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500']">
            {{ res.is_visible ? '显示' : '隐藏' }}
          </span>
          <button @click="editResource(res)" class="btn-ghost !px-2 !py-1 text-xs">编辑</button>
          <button @click="removeResource(res.id)" class="btn-ghost !px-2 !py-1 text-xs text-red-500">删除</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="showModal = false">
        <div class="glass-panel p-8 max-w-lg w-full animate-slide-up">
          <h2 class="text-xl font-bold text-white mb-6">{{ editingId ? '编辑资源' : '添加资源' }}</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">标题</label>
              <input v-model="form.title" class="input-field" placeholder="资源名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">链接 URL</label>
              <input v-model="form.url" class="input-field" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">描述</label>
              <textarea v-model="form.description" class="input-field !h-20 resize-none" placeholder="简短描述" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">分类</label>
                <input v-model="form.category" class="input-field" placeholder="如：工具、教程" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Icon (Iconify)</label>
                <input v-model="form.icon" class="input-field" placeholder="solar:..." />
              </div>
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.is_visible" class="rounded border-gray-300 text-primary-500" />
              <span class="text-gray-300">显示</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModal" class="btn-secondary">取消</button>
            <button @click="save" class="btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { resourceAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const resources = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ title: '', url: '', description: '', icon: '', category: '', cover_image: '', sort_order: 0, is_visible: true })

const load = async () => {
  loading.value = true
  try {
    const res = await resourceAPI.getAll()
    resources.value = res.resources || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const editResource = (r: any) => {
  editingId.value = r.id
  form.value = { title: r.title, url: r.url, description: r.description || '', icon: r.icon || '', category: r.category || '', cover_image: r.cover_image || '', sort_order: r.sort_order, is_visible: !!r.is_visible }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false; editingId.value = null
  form.value = { title: '', url: '', description: '', icon: '', category: '', cover_image: '', sort_order: 0, is_visible: true }
}

const save = async () => {
  if (!form.value.title || !form.value.url) return
  saving.value = true
  try {
    if (editingId.value) await resourceAPI.update(editingId.value, form.value)
    else await resourceAPI.create(form.value)
    closeModal(); await load()
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const removeResource = async (id: number) => {
  if (!confirm('确定删除？')) return
  try { await resourceAPI.delete(id); await load() } catch (e) { alert('删除失败') }
}

onMounted(load)
</script>
