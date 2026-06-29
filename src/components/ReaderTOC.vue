<template>
  <div v-if="readerState.articles.length > 0" class="space-y-4">
    <!-- Reader TOC Widget -->
    <div class="widget">
      <div class="widget-header">
        目录
        <span class="ml-auto text-caption font-normal normal-case tracking-normal">
          {{ filteredArticles.length }}/{{ readerState.articles.length }}
        </span>
      </div>

      <!-- Search filter -->
      <input
        v-model="searchQuery"
        class="input-field !py-1.5 !px-3 !text-xs mb-2"
        placeholder="搜索章节..."
      />

      <!-- Article list with custom scrollbar -->
      <div class="toc-scroll">
        <button
          v-for="art in filteredArticles"
          :key="art.id"
          @click="selectArticle(art.id)"
          class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
          :class="readerState.activeId === art.id ? 'reader-toc-active' : 'reader-toc-link'"
        >
          <div class="truncate">{{ art.title }}</div>
          <div class="text-[0.625rem] mt-0.5" style="color: var(--color-text-caption);">{{ art.word_count || 0 }} 字</div>
        </button>
        <div v-if="filteredArticles.length === 0" class="text-caption text-center py-4">无匹配章节</div>
      </div>
    </div>

    <!-- Font size -->
    <div class="widget">
      <div class="widget-header">字体</div>
      <div class="flex gap-1">
        <button
          v-for="size in sizes"
          :key="size.value"
          @click="setFontSize(size.value)"
          class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="readerState.fontSize === size.value ? 'reader-toc-active' : 'reader-toc-link'"
        >
          {{ size.label }}
        </button>
      </div>
    </div>

    <!-- Progress -->
    <div class="widget">
      <div class="widget-header">阅读进度</div>
      <div class="h-1.5 rounded-full overflow-hidden" style="background: var(--color-border-subtle);">
        <div class="h-full rounded-full transition-all duration-300" :style="{ width: readerState.progress + '%', background: 'var(--color-primary)' }" />
      </div>
      <div class="text-caption text-right mt-1">{{ readerState.progress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { readerState } from '@/stores/readerState'

const searchQuery = ref('')

const filteredArticles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return readerState.articles
  return readerState.articles.filter(a => a.title.toLowerCase().includes(q))
})

const sizes = [
  { label: '标准', value: 'md' as const },
  { label: '大号', value: 'lg' as const },
  { label: '特大', value: 'xl' as const },
]

function selectArticle(id: number) {
  readerState.activeId = id
  window.dispatchEvent(new CustomEvent('reader:navigate', { detail: { id } }))
}

function setFontSize(size: 'md' | 'lg' | 'xl') {
  readerState.fontSize = size
  localStorage.setItem('font_size', size)
}
</script>

<style scoped>
.toc-scroll {
  max-height: 40vh;
  overflow-y: auto;
  padding-right: 4px;
}
.toc-scroll::-webkit-scrollbar {
  width: 3px;
}
.toc-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.toc-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}
.toc-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

.reader-toc-link {
  color: var(--color-text-dim);
  background: transparent;
}
.reader-toc-link:hover {
  color: var(--color-text);
  background: rgba(255,255,255,0.03);
}
.reader-toc-active {
  color: var(--color-primary);
  background: oklch(0.65 var(--hue-sat) var(--hue) / 0.1);
}
</style>
