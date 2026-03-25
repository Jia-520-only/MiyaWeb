<template>
  <div class="min-h-screen pt-20">
    <!-- Hero Section -->
    <section class="py-20 md:py-32">
      <div class="container mx-auto px-6 text-center">
        <!-- Logo with Animation -->
        <div class="mb-8 relative inline-block">
          <div class="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-xl hover:scale-105 transition-transform">
            M
          </div>
          <div class="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm animate-bounce">
            ✨
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          探索 · 分享 · <span class="text-primary-600 dark:text-primary-400">成长</span>
        </h1>

        <!-- Subtitle -->
        <p class="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          一个简约而有温度的个人分享空间<br class="hidden md:block" />
          记录技术，分享生活，传递温暖
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="primary" size="lg" @click="$router.push('/notes')">
            开始探索
          </Button>
          <Button variant="outline" size="lg" @click="$router.push('/culture')">
            文化区
          </Button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 md:py-24 bg-gray-50/50 dark:bg-gray-900/50">
      <div class="container mx-auto px-6">
        <!-- Section Title -->
        <div class="text-center mb-16">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            特色内容
          </h2>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            探索多样化内容，发现更多可能
          </p>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard
            v-for="feature in features"
            :key="feature.title"
            class="p-8 group cursor-pointer hover:-translate-y-1"
            @click="$router.push(feature.link)"
          >
            <!-- Icon -->
            <div class="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xl">
              <Icon :name="feature.icon" size="lg" />
            </div>

            <!-- Title -->
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {{ feature.title }}
            </h3>

            <!-- Description -->
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {{ feature.description }}
            </p>

            <!-- Learn More -->
            <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:translate-x-2 transition-transform">
              了解更多
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>

    <!-- Latest Posts Section -->
    <section class="py-16 md:py-24">
      <div class="container mx-auto px-6">
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-12">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              最新内容
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              探索最新的技术笔记和生活分享
            </p>
          </div>
          <router-link
            to="/notes"
            class="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            查看全部
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GlassCard
            v-for="post in latestPosts"
            :key="post.id"
            class="p-6 group cursor-pointer hover:-translate-y-1"
          >
            <!-- Category -->
            <div class="text-xs font-medium text-primary-600 dark:text-primary-400 mb-3">
              {{ post.category }}
            </div>

            <!-- Title -->
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ post.title }}
            </h3>

            <!-- Excerpt -->
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
              {{ post.excerpt }}
            </p>

            <!-- Meta -->
            <div class="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <span class="text-xs text-gray-500">{{ post.date }}</span>
              <span class="text-xs text-gray-500">{{ post.readTime }}</span>
            </div>
          </GlassCard>
        </div>

        <!-- Mobile View All -->
        <div class="md:hidden text-center mt-8">
          <router-link to="/notes" class="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
            查看全部
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <div class="container mx-auto px-6 text-center">
        <GlassCard class="max-w-3xl mx-auto p-10 md:p-12">
          <div class="text-4xl mb-6">💭</div>
          <blockquote class="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic leading-relaxed mb-6">
            "{{ randomQuote }}"
          </blockquote>
          <p class="text-gray-500 dark:text-gray-400">— Miya</p>
        </GlassCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import GlassCard from '@/components/ui/GlassCard.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import { getContent, parseContent } from '@/utils/contentStorage'

const features = ref([
  {
    icon: 'solar:code-bold-duotone',
    title: '技术笔记',
    description: 'Linux、网络安全、AI、单片机等技术教程与实战经验分享',
    link: '/notes'
  },
  {
    icon: 'solar:pallete-2-bold-duotone',
    title: '文化区',
    description: '生活日记、原创小说、书单推荐、美图收藏',
    link: '/culture'
  },
  {
    icon: 'solar:star-shine-bold-duotone',
    title: '伴侣社区',
    description: 'AI 伴侣设定、幻想书创作、专属对话记录',
    link: '/companions'
  }
])

const latestPosts = ref<any[]>([])
const randomQuote = ref('')

const quotes = ref([
  '技术不是终点，而是通往更好生活的桥梁',
  '分享是最好的学习方式',
  '保持好奇心，永远在路上',
  '代码是逻辑的诗篇',
  '简单是复杂的极致'
])

onMounted(() => {
  // Load latest posts
  const content = getContent('articles')
  if (content) {
    const parsed = parseContent(content)
    latestPosts.value = parsed
      .map((item: any, index: number) => ({
        ...item,
        id: index,
        category: item.category || '技术',
        date: new Date().toLocaleDateString('zh-CN'),
        readTime: '5 分钟'
      }))
      .slice(0, 6)
  }

  // Random quote
  randomQuote.value = quotes.value[Math.floor(Math.random() * quotes.value.length)]
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
