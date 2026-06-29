<template>
  <div class="space-y-4">
    <!-- Sidebar Banner Image -->
    <SidebarBanner />

    <!-- Profile Widget -->
    <div class="widget">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-white/10 shadow-lg"
          style="box-shadow: 0 4px 16px var(--color-primary);">
          <img src="/miya.png" alt="Miya" class="w-full h-full object-cover" />
        </div>
        <div>
          <h3 class="font-semibold text-sm tracking-tight" style="color: var(--color-text);">{{ siteConfig.profile.name }}</h3>
          <p class="text-caption mt-0.5">{{ siteConfig.profile.bio }}</p>
        </div>
      </div>
      <p class="text-sub text-[0.75rem] leading-relaxed border-t pt-3" style="border-color: var(--color-border-subtle);">
        {{ siteConfig.profile.bio }}
      </p>
      <div class="flex items-center gap-4 mt-3 pt-3 border-t" style="border-color: var(--color-border-subtle);">
        <div v-for="s in profileStats" :key="s.label" class="text-center flex-1">
          <div class="text-sm font-bold" style="color: var(--color-primary);">{{ s.value }}</div>
          <div class="text-caption mt-0.5">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Announcement Widget -->
    <div v-if="announcementText" class="widget" style="border-color: var(--color-border-glow);">
      <div class="widget-header">公告</div>
      <p class="text-sub text-[0.75rem] leading-relaxed">{{ announcementText }}</p>
    </div>

    <!-- Nav Widget -->
    <div class="widget">
      <div class="widget-header">快捷导航</div>
      <nav class="nav-scroll space-y-0.5">
        <router-link
          v-for="(link, idx) in links"
          :key="link.path"
          :to="link.path"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 group"
          :class="route.path === link.path ? 'nav-active' : 'nav-link'"
        >
          <Icon :name="link.icon" size="sm" class="transition-transform duration-200 group-hover:scale-110" />
          <span class="flex-1">{{ link.label }}</span>
          <span v-if="route.path === link.path" class="w-1 h-1 rounded-full" style="background: var(--color-primary);" />
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { siteConfig } from '@/config/site'
import Icon from '@/components/ui/Icon.vue'
import SidebarBanner from '@/components/SidebarBanner.vue'

const route = useRoute()

const announcementText = ref(siteConfig.profile.announcement)
const profileStats = ref([...siteConfig.profile.stats])

onMounted(async () => {
  // Fetch announcement and stats
  try {
    const [annRes, blogRes, libRes, ocRes, resRes] = await Promise.all([
      fetch('/api/content/page/site?section=announcement').then(r => r.json()),
      fetch('/api/collections?type=blog').then(r => r.json()),
      fetch('/api/collections?type=book_group').then(r => r.json()),
      fetch('/api/collections?type=companion_group&visible=true').then(r => r.json()),
      fetch('/api/resources').then(r => r.json()),
    ])
    // Announcement
    const sections = annRes.sections || {}; const items = sections.announcement
    if (items && items.length > 0 && items[0].content) announcementText.value = items[0].content
    // Stats
    const blogCol = blogRes.collections?.find((c: any) => c.type === 'blog')
    if (blogCol) { const ir = await fetch(`/api/collections/${blogCol.id}/items`).then(r => r.json()); profileStats.value[0].value = String(ir.items?.length || 0) }
    const libCols = libRes.collections || []
    let libTotal = 0; for (const c of libCols) { const ir = await fetch(`/api/collections/${c.id}/items`).then(r => r.json()); libTotal += ir.items?.length || 0 }
    profileStats.value[1].value = String(libTotal)
    profileStats.value[2].value = String(resRes.resources?.length || 0)
    const ocCols = ocRes.collections || []
    let ocTotal = 0; for (const c of ocCols) { const ir = await fetch(`/api/collections/${c.id}/items`).then(r => r.json()); ocTotal += ir.items?.length || 0 }
    profileStats.value[3].value = String(ocTotal)
  } catch { /* use defaults */ }
})

withDefaults(defineProps<{
  stats?: { label: string; value: string }[]
  announcement?: string
}>(), {
  stats: () => siteConfig.profile.stats,
  announcement: siteConfig.profile.announcement,
})

const links = [
  { path: '/', label: '首页', icon: 'solar:home-2-bold-duotone' },
  { path: '/blog', label: '技术笔记', icon: 'solar:document-text-bold-duotone' },
  { path: '/library', label: '创作', icon: 'solar:notebook-bold-duotone' },
  { path: '/gallery', label: '人文', icon: 'solar:gallery-wide-bold-duotone' },
  { path: '/companions', label: 'OC 社区', icon: 'solar:star-shine-bold-duotone' },
  { path: '/resources', label: '免费资源', icon: 'solar:gift-bold-duotone' },
  { path: '/links', label: '推荐链接', icon: 'solar:link-round-bold-duotone' },
  { path: '/about', label: '关于', icon: 'solar:info-circle-bold-duotone' },
]
</script>

<style scoped>
.nav-link { color: var(--color-text-dim); }
.nav-link:hover { color: var(--color-text); background: rgba(255,255,255,0.03); }
.nav-active { color: var(--color-primary); background: oklch(0.65 var(--hue-sat) var(--hue) / 0.1); }

.nav-scroll { max-height: 260px; overflow-y: auto; padding-right: 2px; }
.nav-scroll::-webkit-scrollbar { width: 3px; }
.nav-scroll::-webkit-scrollbar-track { background: transparent; }
.nav-scroll::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
</style>
