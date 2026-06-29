<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { renderMarkdown } from '@/utils/markdown'

interface Props {
  content: string
}

const props = defineProps<Props>()
const renderedContent = computed(() => DOMPurify.sanitize(renderMarkdown(props.content)))
</script>

<style scoped>
.markdown-content {
  line-height: 1.8;
  color: inherit;
}

.markdown-content :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.8em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid currentColor;
  opacity: 0.9;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.8em 0;
  padding-bottom: 0.3em;
  border-bottom: 1px solid;
  opacity: 0.8;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
  font-weight: bold;
  margin: 0.6em 0;
  opacity: 0.85;
}

.markdown-content :deep(h4) {
  font-size: 1em;
  font-weight: bold;
  margin: 0.5em 0;
}

.markdown-content :deep(p) {
  margin: 1em 0;
}

.markdown-content :deep(a) {
  color: #6366f1;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #4f46e5;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin: 0.3em 0;
}

.markdown-content :deep(blockquote) {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 4px solid #6366f1;
  background: rgba(99, 102, 241, 0.05);
  opacity: 0.9;
}

.markdown-content :deep(code) {
  padding: 0.2em 0.4em;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  padding: 1em;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.dark .markdown-content :deep(blockquote) {
  background: rgba(99, 102, 241, 0.1);
}

.dark .markdown-content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
}

.dark .markdown-content :deep(pre) {
  background: rgba(255, 255, 255, 0.05);
}
</style>
