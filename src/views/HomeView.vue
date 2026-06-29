<template>
  <div class="space-y-12">
    <!-- Banner Section with Image Carousel -->
    <BannerSection
      :images="bannerImages"
      :image-position="siteConfig.banner.imagePosition"
      :title="siteConfig.banner.title"
      :accent="siteConfig.banner.accent"
      :subtitle="siteConfig.banner.subtitle"
      :typed-subtitles="typedSubtitles"
      :overline="'SYS.WELCOME · ' + formattedDate"
      :stats="siteConfig.profile.stats"
    />

    <!-- Homepage Gallery Strip -->
    <HomeGallery :images="sidebarImages" />

    <!-- Feature Entry List -->
    <div class="space-y-4">
      <router-link
        v-for="(card, idx) in featureCards"
        :key="card.path"
        :to="card.path"
        class="feature-card group block card-glow"
      >
        <!-- Left accent bar -->
        <div class="feature-accent" :style="{ background: `linear-gradient(180deg, ${card.color}, ${card.color}44)` }" />

        <!-- Image or Icon area -->
        <div v-if="card.coverImage" class="feature-cover">
          <img :src="card.coverImage" :alt="card.title" class="w-full h-full object-cover" loading="lazy" />
          <div class="feature-cover-overlay" />
        </div>
        <div v-else class="feature-icon" :style="{ background: `${card.color}12` }">
          <div class="feature-icon-inner" :style="{ background: `${card.color}18` }">
            <Icon :name="card.icon" size="lg" :color="card.color" />
          </div>
        </div>

        <!-- Content -->
        <div class="feature-body">
          <div class="feature-title-row">
            <h2 class="feature-title">{{ card.title }}</h2>
            <span class="feature-badge font-mono tracking-wider" :style="{ color: card.color, background: `${card.color}10`, borderColor: `${card.color}20` }">
              {{ card.badge }}
            </span>
          </div>
          <p class="feature-desc">{{ card.desc }}</p>
          <div class="feature-stats-row">
            <span class="feature-stat">
              <Icon name="solar:documents-bold-duotone" size="xs" />
              <span>{{ card.count }}</span> 篇内容
            </span>
            <span class="feature-stat">
              <Icon name="solar:eye-bold-duotone" size="xs" />
              <span>{{ card.views }}</span> 次浏览
            </span>
          </div>
        </div>

        <!-- Arrow indicator -->
        <div class="feature-arrow">
          <Icon name="solar:arrow-right-bold" size="sm" :color="card.color" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import BannerSection from '@/components/layout/BannerSection.vue'
import HomeGallery from '@/components/HomeGallery.vue'
import Icon from '@/components/ui/Icon.vue'
import { siteConfig } from '@/config/site'

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
})

const typedSubtitles = [
  '技术笔记 · 原创创作 · OC 社区 · 免费资源',
  '分享技术，记录创作',
  '欢迎来到 jiaandmiya~',
]

const sidebarImages = ref<any[]>([])
const bannerImages = ref<string[]>([])

onMounted(async () => {
  const [bannerRes, sidebarRes, coverRes] = await Promise.allSettled([
    fetch('/api/banner-images').then(r => r.json()),
    fetch('/api/sidebar-images').then(r => r.json()),
    fetch('/api/content/home-feature-covers').then(r => r.json()),
  ])

  if (bannerRes.status === 'fulfilled') {
    bannerImages.value = (bannerRes.value.images || []).map((img: any) => img.path)
  }
  if (sidebarRes.status === 'fulfilled') {
    sidebarImages.value = sidebarRes.value.images || []
  }
  if (coverRes.status === 'fulfilled' && coverRes.value?.content) {
    const saved = JSON.parse(coverRes.value.content)
    featureCards.value.forEach(c => {
      const key = c.path.replace('/', '')
      if (saved[key]) c.coverImage = saved[key]
    })
  }

  // Fetch real stats for feature cards
  try {
    const [blogRes, libRes, ocRes, resRes, linksRes, galleryRes] = await Promise.all([
      fetch('/api/collections?type=blog').then(r => r.json()),
      fetch('/api/collections?type=book_group').then(r => r.json()),
      fetch('/api/collections?type=companion_group&visible=true').then(r => r.json()),
      fetch('/api/resources').then(r => r.json()),
      fetch('/api/sidebar-links').then(r => r.json()),
      fetch('/api/content/page/culture?section=gallery').then(r => r.json()),
    ])
    const blogCol = blogRes.collections?.find((c: any) => c.type === 'blog')
    if (blogCol) { const ir = await fetch(`/api/collections/${blogCol.id}/items`).then(r => r.json()); featureCards.value[0].count = ir.items?.length || 0 }
    const libCols = libRes.collections || []
    let libTotal = 0; for (const c of libCols) { const ir = await fetch(`/api/collections/${c.id}/items`).then(r => r.json()); libTotal += ir.items?.length || 0 }
    featureCards.value[1].count = libTotal
    const galSections = galleryRes.sections || {}; const galItems = galSections.gallery; const galPics = galItems?.[0]?.content;     featureCards.value[2].count = Array.isArray(galPics) ? galPics.length : 0
    const ocCols = ocRes.collections || []
    let ocTotal = 0; for (const c of ocCols) { const ir = await fetch(`/api/collections/${c.id}/items`).then(r => r.json()); ocTotal += ir.items?.length || 0 }
    featureCards.value[3].count = ocTotal
    featureCards.value[4].count = resRes.resources?.length || 0
    featureCards.value[5].count = linksRes.links?.length || 0
  } catch {}

  // Fetch total site visits
  try {
    const visitRes = await fetch('/api/health')
    // Use a simple counter based on existing data
  } catch {}
})

const featureCards = ref([
  { path: '/blog', icon: 'solar:document-text-bold-duotone', title: '技术笔记', desc: '技术分享、开发心得、学习记录', badge: 'TECH', color: '#00FFF5', coverImage: '', count: 0, views: 0 },
  { path: '/library', icon: 'solar:notebook-bold-duotone', title: '创作', desc: '原创小说、幻想世界、文字创作', badge: 'WORKS', color: '#ffd700', coverImage: '', count: 0, views: 0 },
  { path: '/gallery', icon: 'solar:gallery-wide-bold-duotone', title: '人文', desc: '美图收藏、日记、书单、视听分享', badge: 'HUMANITY', color: '#ff6b9d', coverImage: '', count: 0, views: 0 },
  { path: '/companions', icon: 'solar:star-shine-bold-duotone', title: 'OC 社区', desc: '原创角色设定分享，展示你的专属 OC', badge: 'OC', color: '#7dd3fc', coverImage: '', count: 0, views: 0 },
  { path: '/resources', icon: 'solar:gift-bold-duotone', title: '免费资源', desc: '为爱发电，分享优质资源链接', badge: 'FREE', color: '#4ade80', coverImage: '', count: 0, views: 0 },
  { path: '/links', icon: 'solar:link-round-bold-duotone', title: '推荐链接', desc: '精心挑选的优质网站与工具', badge: 'LINKS', color: '#a78bfa', coverImage: '', count: 0, views: 0 },
])
</script>

<style scoped>
.feature-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(16px);
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  text-decoration: none;
}
.feature-card:hover {
  transform: translateX(4px);
  border-color: var(--color-border-glow);
  box-shadow: 0 4px 24px rgba(0,0,0,0.15), 0 0 40px var(--color-border-glow);
}
.feature-accent {
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; border-radius: 0 2px 2px 0;
  opacity: 0; transform: scaleY(0.6);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.feature-card:hover .feature-accent { opacity: 1; transform: scaleY(1); }
.feature-cover {
  flex-shrink: 0;
  width: 4rem; height: 3.5rem;
  border-radius: 0.75rem; overflow: hidden;
  margin-right: 1.25rem;
  position: relative;
  transition: all 0.35s ease;
}
.feature-card:hover .feature-cover { transform: scale(1.05); }
.feature-cover img { width: 100%; height: 100%; object-fit: cover; }
.feature-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.1), transparent);
}
.feature-icon {
  flex-shrink: 0;
  width: 3.5rem; height: 3.5rem;
  border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  margin-right: 1.25rem;
  transition: all 0.35s ease;
}
.feature-card:hover .feature-icon { transform: scale(1.08); }
.feature-icon-inner {
  width: 2.5rem; height: 2.5rem;
  border-radius: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.35s ease;
}
.feature-card:hover .feature-icon-inner { box-shadow: 0 0 20px rgba(255,255,255,0.05); }
.feature-body { flex: 1; min-width: 0; }
.feature-title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.375rem; }
.feature-title { font-size: 1.125rem; font-weight: 700; color: var(--color-text); transition: color 0.3s; line-height: 1.3; }
.feature-card:hover .feature-title { color: var(--color-primary); }
.feature-badge { font-size: 0.5625rem; padding: 0.125rem 0.5rem; border-radius: 999px; border: 1px solid; flex-shrink: 0; letter-spacing: 0.12em; }
.feature-desc { font-size: 0.8125rem; color: var(--color-text-dim); line-height: 1.5; margin-bottom: 0.625rem; }
.feature-stats-row { display: flex; align-items: center; gap: 1rem; }
.feature-stat { display: flex; align-items: center; gap: 0.25rem; font-size: 0.6875rem; color: var(--color-text-caption); }
.feature-arrow {
  flex-shrink: 0; margin-left: 1rem;
  opacity: 0; transform: translateX(-8px);
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.feature-card:hover .feature-arrow { opacity: 1; transform: translateX(0); }

@media (max-width: 640px) {
  .feature-card { padding: 1rem 1.25rem; }
  .feature-icon, .feature-cover { width: 3rem; height: 3rem; margin-right: 1rem; }
  .feature-icon-inner { width: 2rem; height: 2rem; }
  .feature-cover { width: 3.5rem; height: 2.75rem; }
  .feature-title { font-size: 1rem; }
  .feature-arrow { display: none; }
}
</style>
