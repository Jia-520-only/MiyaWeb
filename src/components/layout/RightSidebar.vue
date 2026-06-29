<template>
  <div class="space-y-4">
    <!-- Sidebar Image Card -->
    <SidebarImageCard />

    <!-- Site Stats Widget (Firefly-style) -->
    <div class="widget">
      <div class="widget-header">站点统计</div>
      <div class="grid grid-cols-2 gap-2">
        <div class="stat-item">
          <div class="stat-value">{{ stats.articles }}</div>
          <div class="stat-label">文章</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.ocs }}</div>
          <div class="stat-label">OC</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.resources }}</div>
          <div class="stat-label">资源</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.visits }}</div>
          <div class="stat-label">访问</div>
        </div>
      </div>
    </div>

    <!-- Links Widget -->
    <div class="widget">
      <div class="widget-header">推荐链接</div>
      <div class="links-scroll space-y-0.5">
        <a
          v-for="link in visibleLinks"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8125rem] transition-all duration-200 cat-link"
        >
          <Icon name="solar:link-round-bold" size="sm" />
          {{ link.label }}
        </a>
        <router-link
          v-if="sidebarLinks.length > 3"
          to="/links"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.8125rem] transition-all duration-200 cat-link"
        >
          <Icon name="solar:arrow-right-bold" size="sm" />
          查看全部 ({{ sidebarLinks.length }})
        </router-link>
        <div v-if="sidebarLinks.length === 0" class="text-caption text-center py-2">暂无推荐链接</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Icon from '@/components/ui/Icon.vue'
import SidebarImageCard from '@/components/SidebarImageCard.vue'

const sidebarLinks = ref<any[]>([])
const visibleLinks = computed(() => sidebarLinks.value.slice(0, 3))

const stats = ref({ articles: 0, ocs: 0, resources: 0, visits: 0 })

onMounted(async () => {
  try { const res = await fetch('/api/sidebar-links').then(r => r.json()); sidebarLinks.value = res.links || [] } catch {}
  try {
    const [articlesRes, ocsRes, resourcesRes, linksRes, visitRes] = await Promise.all([
      fetch('/api/collections?type=blog').then(r => r.json()),
      fetch('/api/collections?type=companion_group&visible=true').then(r => r.json()),
      fetch('/api/resources').then(r => r.json()),
      fetch('/api/sidebar-links').then(r => r.json()),
      fetch('/api/analytics').then(r => r.json()),
    ])
    const blogCol = articlesRes.collections?.find((c: any) => c.type === 'blog')
    if (blogCol) {
      const items = await fetch(`/api/collections/${blogCol.id}/items`).then(r => r.json())
      stats.value.articles = items.items?.length || 0
    }
    const ocCols = ocsRes.collections || []
    let ocTotal = 0
    for (const c of ocCols) {
      try { const ir = await fetch(`/api/collections/${c.id}/items`).then(r => r.json()); ocTotal += ir.items?.length || 0 } catch {}
    }
    stats.value.ocs = ocTotal
    stats.value.resources = resourcesRes.resources?.length || 0
    stats.value.visits = visitRes?.total || 0
  } catch {}
})
</script>

<style scoped>
.cat-link { color: var(--color-text-dim); }
.cat-link:hover { color: var(--color-text); background: rgba(255, 255, 255, 0.03); }

.stat-item {
  text-align: center; padding: 0.5rem;
  border-radius: 0.5rem; background: var(--color-surface);
  transition: background 0.2s;
}
.stat-item:hover { background: oklch(0.65 var(--hue-sat) var(--hue) / 0.08); }
.stat-value {
  font-size: 1.125rem; font-weight: 700; color: var(--color-primary);
  font-family: 'JetBrains Mono', monospace;
}
.stat-label { font-size: 0.625rem; color: var(--color-text-caption); margin-top: 0.125rem; }

.links-scroll { max-height: 160px; overflow-y: auto; padding-right: 2px; }
.links-scroll::-webkit-scrollbar { width: 3px; }
.links-scroll::-webkit-scrollbar-track { background: transparent; }
.links-scroll::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
.links-scroll::-webkit-scrollbar-thumb:hover { background: var(--color-primary); }
</style>
