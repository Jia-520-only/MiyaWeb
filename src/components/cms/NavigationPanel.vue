<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="section-title !mb-0">侧边栏导航</h2>
      <button @click="addNavItem()" class="btn-primary">
        <Icon name="solar:add-circle-bold" size="sm" class="mr-1" />
        添加导航项
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="glass-card !p-6 space-y-2">
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">拖拽排序功能开发中，目前可通过编辑调整排序值。</p>
      <div v-for="item in flatNav" :key="item.id" class="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
        <span class="text-xs text-gray-400 w-6 text-right">{{ item.sort_order }}</span>
        <Icon v-if="item.icon" :name="item.icon" size="sm" />
        <span class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{{ item.title }}</span>
        <span class="text-xs text-gray-400 truncate max-w-[200px]">{{ item.link || '-' }}</span>
        <span :class="['badge', item.is_visible ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500']">
          {{ item.is_visible ? '显示' : '隐藏' }}
        </span>
        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="editNavItem(item)" class="btn-ghost !px-2 !py-1 text-xs">编辑</button>
          <button @click="removeNavItem(item.id)" class="btn-ghost !px-2 !py-1 text-xs text-red-500">删除</button>
        </div>
      </div>
      <div v-if="flatNav.length === 0" class="text-center py-8 text-gray-400 text-sm">暂无导航项</div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="showModal = false">
        <div class="glass-panel p-8 max-w-lg w-full animate-slide-up">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">编辑导航项</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
              <input v-model="form.title" class="input-field" placeholder="导航标题" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon (Iconify 名称)</label>
              <input v-model="form.icon" class="input-field" placeholder="solar:home-2-bold-duotone" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">链接</label>
              <input v-model="form.link" class="input-field" placeholder="/library 或 https://..." />
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="form.is_visible" class="rounded border-gray-300 text-primary-500" />
                <span class="text-gray-700 dark:text-gray-300">显示</span>
              </label>
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="form.open_in_new_tab" class="rounded border-gray-300 text-primary-500" />
                <span class="text-gray-700 dark:text-gray-300">新标签打开</span>
              </label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">排序</label>
              <input v-model.number="form.sort_order" type="number" class="input-field" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showModal = false" class="btn-secondary">取消</button>
            <button @click="saveNavItem" class="btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { navigationAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const flatNav = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ title: '', icon: '', link: '', is_visible: true, open_in_new_tab: false, sort_order: 0 })

const load = async () => {
  loading.value = true
  try {
    const res = await navigationAPI.getAll()
    flatNav.value = (res.flat || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const addNavItem = () => {
  editingId.value = null
  form.value = { title: '', icon: '', link: '', is_visible: true, open_in_new_tab: false, sort_order: flatNav.value.length }
  showModal.value = true
}

const editNavItem = (item: any) => {
  editingId.value = item.id
  form.value = {
    title: item.title, icon: item.icon || '', link: item.link || '',
    is_visible: !!item.is_visible, open_in_new_tab: !!item.open_in_new_tab, sort_order: item.sort_order
  }
  showModal.value = true
}

const saveNavItem = async () => {
  if (!form.value.title) return
  saving.value = true
  try {
    if (editingId.value) {
      await navigationAPI.update(editingId.value, form.value)
    } else {
      await navigationAPI.create(form.value)
    }
    showModal.value = false; await load()
  } catch (e: any) { alert(e.error || '保存失败') }
  finally { saving.value = false }
}

const removeNavItem = async (id: number) => {
  if (!confirm('确定删除？')) return
  try { await navigationAPI.delete(id); await load() } catch (e) { alert('删除失败') }
}

onMounted(load)
</script>
