<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">推荐链接</h2>
      <button @click="showForm = true" class="btn-primary text-sm" v-if="!showForm">
        <Icon name="solar:add-circle-linear" size="xs" />
        <span>添加链接</span>
      </button>
    </div>

    <!-- Add form -->
    <div v-if="showForm" class="glass-card !p-4 space-y-3">
      <input v-model="form.label" class="input-field" placeholder="链接名称" />
      <input v-model="form.url" class="input-field" placeholder="URL" />
      <div class="flex gap-2">
        <button @click="saveLink" class="btn-primary text-sm" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        <button @click="showForm = false" class="btn-secondary text-sm">取消</button>
      </div>
    </div>

    <div v-if="links.length === 0" class="text-caption text-center py-8">暂无推荐链接</div>

    <div v-else class="space-y-2">
      <div v-for="link in links" :key="link.id" class="glass-card !p-3 flex items-center gap-3 group">
        <Icon name="solar:link-round-bold" size="sm" />
        <div class="flex-1 min-w-0">
          <p class="text-sm text-white truncate">{{ link.label }}</p>
          <p class="text-caption truncate">{{ link.url }}</p>
        </div>
        <button @click="deleteLink(link.id)" class="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
          <Icon name="solar:trash-bin-trash-linear" size="xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'

const links = ref<any[]>([])
const showForm = ref(false)
const saving = ref(false)
const form = ref({ label: '', url: '' })

async function load() {
  const res = await fetch('/api/sidebar-links').then(r => r.json())
  links.value = res.links || []
}

async function saveLink() {
  if (!form.value.label || !form.value.url) return
  saving.value = true
  try {
    const token = localStorage.getItem('auth_token')
    await fetch('/api/sidebar-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(form.value)
    })
    form.value = { label: '', url: '' }
    showForm.value = false
    await load()
  } catch (e: any) { alert(e.message) }
  finally { saving.value = false }
}

async function deleteLink(id: number) {
  if (!confirm('删除此链接？')) return
  const token = localStorage.getItem('auth_token')
  await fetch(`/api/sidebar-links/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  await load()
}

onMounted(load)
</script>
