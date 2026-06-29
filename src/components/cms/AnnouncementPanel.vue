<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold text-white">网站公告</h2>
    <div class="glass-card !p-4 space-y-3">
      <textarea
        v-model="announcement"
        class="input-field !h-24 resize-none"
        placeholder="公告内容..."
        :disabled="saving"
      />
      <div class="flex gap-2">
        <button @click="save" class="btn-primary text-sm" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <p v-if="msg" class="text-xs self-center" :class="ok ? 'text-emerald-400' : 'text-red-400'">{{ msg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { contentAPI } from '@/utils/apiClient'

const announcement = ref('')
const saving = ref(false)
const msg = ref('')
const ok = ref(true)

onMounted(async () => {
  try {
    const res = await contentAPI.getContent('site-announcement')
    if (res?.content) announcement.value = res.content
    else if (res?.parsedContent) announcement.value = res.parsedContent
  } catch { /* use default */ }
})

async function save() {
  saving.value = true
  try {
    await contentAPI.updateContent('site-announcement', {
      id: 'site-announcement',
      type: 'text',
      title: '网站公告',
      content: announcement.value,
      page: 'site',
      section: 'announcement'
    }).catch(() => contentAPI.createContent({
      id: 'site-announcement',
      type: 'text',
      title: '网站公告',
      content: announcement.value,
      page: 'site',
      section: 'announcement'
    }))
    msg.value = '保存成功'
    ok.value = true
  } catch (e: any) {
    msg.value = e.error || e.message || '保存失败'
    ok.value = false
  }
  finally { saving.value = false }
}
</script>
