<template>
  <div class="space-y-6">
    <!-- Actions Bar -->
    <div class="flex items-center justify-between">
      <h2 class="section-title !mb-0">图书组列表</h2>
      <button @click="showCreateModal = true" class="btn-primary">
        <Icon name="solar:add-circle-bold" size="sm" class="mr-1" />
        新建图书组
      </button>
    </div>

    <!-- Collections List -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="col in collections"
        :key="col.id"
        class="glass-card !p-4 flex items-center justify-between group"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: col.type === 'book_group' ? '#ccfbf1' : '#f3e8ff' }">
            <Icon :name="col.type === 'book_group' ? 'solar:notebook-bold-duotone' : 'solar:star-shine-bold-duotone'" size="lg" />
          </div>
          <div>
            <h3 class="font-semibold text-white text-sm">{{ col.name }}</h3>
            <p class="text-xs text-gray-400">{{ col.slug }} · {{ col.item_count || 0 }} 项</p>
          </div>
        </div>
        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="editCollection(col)" class="btn-ghost !px-2 !py-1 text-xs">编辑</button>
          <button @click="deleteCollection(col.id)" class="btn-ghost !px-2 !py-1 text-xs text-red-500 hover:!text-red-600">删除</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="closeModal">
        <div class="glass-panel p-8 max-w-lg w-full animate-slide-up">
          <h2 class="text-xl font-bold text-white mb-6">
            {{ showEditModal ? '编辑图书组' : '新建图书组' }}
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">名称</label>
              <input v-model="form.name" class="input-field" placeholder="输入图书组名称" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Slug</label>
              <input v-model="form.slug" class="input-field" placeholder="url-slug" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">描述</label>
              <textarea v-model="form.description" class="input-field !h-20 resize-none" placeholder="简短描述" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">封面图片 URL</label>
              <input v-model="form.cover_image" class="input-field" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">排序</label>
              <input v-model.number="form.sort_order" type="number" class="input-field" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="closeModal" class="btn-secondary">取消</button>
            <button @click="save" class="btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collectionAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const collections = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingId = ref<number | null>(null)

const form = ref({ name: '', slug: '', description: '', cover_image: '', sort_order: 0 })

const load = async () => {
  loading.value = true
  try {
    const res = await collectionAPI.getAll()
    collections.value = res.collections || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const editCollection = (col: any) => {
  editingId.value = col.id
  form.value = { name: col.name, slug: col.slug, description: col.description || '', cover_image: col.cover_image || '', sort_order: col.sort_order }
  showEditModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingId.value = null
  form.value = { name: '', slug: '', description: '', cover_image: '', sort_order: 0 }
}

const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')

const save = async () => {
  if (!form.value.name) return
  saving.value = true
  try {
    if (showEditModal.value && editingId.value) {
      await collectionAPI.update(editingId.value, form.value)
    } else {
      await collectionAPI.create({ ...form.value, type: 'book_group', slug: form.value.slug || generateSlug(form.value.name) })
    }
    closeModal()
    await load()
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const deleteCollection = async (id: number) => {
  if (!confirm('确定删除？关联的内容也会被删除。')) return
  try { await collectionAPI.delete(id); await load() }
  catch (e) { alert('删除失败') }
}

onMounted(load)
</script>
