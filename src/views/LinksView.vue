<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-3xl">
      <SectionHeader
        gradient-title="推荐链接"
        description="精心挑选的优质资源"
        :cover-image="coverImage"
      />

      <div v-if="links.length === 0" class="text-center py-12 text-caption">暂无链接</div>
      <div v-else class="space-y-3">
        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="glass-card p-5 flex items-center gap-4 group hover:border-[var(--color-border-glow)] transition-all duration-300"
        >
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background: var(--color-primary);">
            <Icon name="solar:link-round-bold" size="md" color="#fff" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold group-hover:text-[var(--color-primary)] transition-colors" style="color: var(--color-text);">{{ link.label }}</h3>
            <p class="text-caption truncate">{{ link.url }}</p>
          </div>
          <Icon name="solar:arrow-right-up-bold" size="sm" class="opacity-0 group-hover:opacity-100 transition-opacity" style="color: var(--color-primary);" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'

import SectionHeader from '@/components/SectionHeader.vue'
import { fetchCoverImage } from '@/utils/coverImage'

const links = ref<any[]>([])
const coverImage = ref('')

onMounted(async () => {
  coverImage.value = await fetchCoverImage('links')

  try {
    const res = await fetch('/api/sidebar-links').then(r => r.json())
    links.value = res.links || []
  } catch { links.value = [] }
})
</script>
