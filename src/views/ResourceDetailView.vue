<template>
  <div class="page-container">
    <div class="container mx-auto px-6 py-12 max-w-3xl">
      <button @click="$router.push('/resources')" class="btn-ghost mb-8">
        <Icon name="solar:arrow-left-bold" size="sm" /><span>返回资源列表</span>
      </button>

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-3 border-primary-400 border-t-transparent rounded-full animate-spin" />
      </div>

      <template v-else-if="resource">
        <!-- Cover -->
        <div v-if="resource.cover_image" class="rounded-2xl overflow-hidden mb-8">
          <img :src="resource.cover_image" :alt="resource.title" class="w-full max-h-[400px] object-cover" loading="lazy" />
        </div>

        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <span v-if="resource.category" class="px-2 py-0.5 rounded-full text-xs font-medium"
              style="background: var(--color-primary); color: #fff;">{{ resource.category }}</span>
            <span class="text-caption font-mono">{{ resource.download_count || 0 }} 次访问</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold mb-2" style="color: var(--color-text);">{{ resource.title }}</h1>
          <p v-if="resource.description" class="text-sub leading-relaxed">{{ resource.description }}</p>
        </div>

        <!-- Icon + URL card -->
        <div class="glass-card p-6 mb-8">
          <div class="flex items-start gap-4">
            <div v-if="resource.icon" class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: var(--color-primary);">
              <Icon :name="resource.icon" size="md" color="#fff" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium mb-1" style="color: var(--color-text);">资源链接</p>
              <p class="text-caption text-sm break-all mb-3">{{ resource.url }}</p>
              <a :href="resource.url" target="_blank" rel="noopener noreferrer" class="btn-primary text-sm">
                <Icon name="solar:arrow-right-up-bold" size="sm" />
                访问资源
              </a>
            </div>
          </div>
        </div>

        <!-- Back -->
        <router-link to="/resources" class="flex items-center justify-center gap-2 text-sm hover:underline" style="color: var(--color-primary);">
          <Icon name="solar:arrow-left-bold" size="sm" /> 返回资源列表
        </router-link>
      </template>

      <div v-else class="text-center py-20">
        <h3 class="text-xl font-semibold mb-2" style="color: var(--color-text);">资源不存在</h3>
        <router-link to="/resources" class="btn-ghost mt-4">返回资源列表</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { resourceAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const route = useRoute()
const resource = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const res = await resourceAPI.getById(id)
    resource.value = res.resource
  } catch (e) { resource.value = null }
  finally { isLoading.value = false }
})
</script>
