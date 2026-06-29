<template>
  <div class="section-header">
    <!-- Cover Image -->
    <div v-if="coverImage" class="section-cover">
      <img :src="coverImage" :alt="title" class="w-full h-full object-cover" loading="lazy" />
      <div class="section-cover-overlay" />
    </div>

    <!-- Title + Description -->
    <div class="section-header-content" :class="{ 'has-cover': coverImage }">
      <h1 class="section-header-title">
        <span v-if="gradientTitle" class="text-gradient">{{ gradientTitle }}</span>
        <span v-else-if="title" style="color: var(--color-text);">{{ title }}</span>
      </h1>
      <p v-if="description" class="section-header-desc">{{ description }}</p>

      <!-- Stats Bar -->
      <div v-if="stats && stats.length > 0" class="section-stats">
        <div v-for="s in stats" :key="s.label" class="section-stat">
          <span class="section-stat-value">{{ s.value }}</span>
          <span class="section-stat-label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Slot for filters/actions -->
      <div v-if="$slots.actions" class="section-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  coverImage?: string
  title?: string
  gradientTitle?: string
  description?: string
  stats?: { label: string; value: string | number }[]
}>()
</script>

<style scoped>
.section-header { position: relative; margin-bottom: 2.5rem; }
.section-cover {
  width: 100%; max-height: 280px; overflow: hidden;
  border-radius: 1.5rem;
  background: var(--color-surface);
}
.section-cover img { width: 100%; height: 100%; object-fit: cover; }
.section-cover-overlay {
  position: absolute; inset: 0; border-radius: 1.5rem;
  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%);
}
.section-header-content { text-align: center; padding-top: 1rem; }
.section-header-content.has-cover {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 2rem 1.5rem; text-align: center;
}
.section-header-title { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; margin-bottom: 0.5rem; }
.section-header-desc { font-size: 0.9375rem; color: var(--color-text-dim); max-width: 32rem; margin: 0 auto; }
.section-header-content.has-cover .section-header-desc { color: rgba(255,255,255,0.7); }

.section-stats {
  display: flex; justify-content: center; gap: 2rem;
  margin-top: 1rem; padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-subtle);
}
.section-header-content.has-cover .section-stats { border-color: rgba(255,255,255,0.15); }
.section-stat { text-align: center; }
.section-stat-value { font-size: 1.25rem; font-weight: 700; color: var(--color-primary); font-family: 'JetBrains Mono', monospace; }
.section-header-content.has-cover .section-stat-value { color: var(--color-primary-glow); }
.section-stat-label { font-size: 0.6875rem; color: var(--color-text-caption); display: block; }

.section-actions { margin-top: 1.25rem; display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
</style>
