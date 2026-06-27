<template>
  <footer class="bg-gray-900/95 dark:bg-gray-950/95 backdrop-blur-lg text-white border-t border-gray-700/50 relative">
    <div class="h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent"></div>
    <div class="container mx-auto px-4 py-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-3">
        <!-- 左侧：网站信息 -->
        <div class="flex items-center gap-3">
          <div>
            <h3 class="text-base font-bold text-primary-400">{{ footerInfo.title }}</h3>
            <p class="text-gray-500 text-xs">{{ footerInfo.miyaText }}</p>
          </div>
        </div>

        <!-- 中间：快速导航 -->
        <div class="flex gap-4 text-xs">
          <router-link v-for="link in footerLinks" :key="link.label"
                       :to="link.path"
                       class="text-gray-400 hover:text-primary-400 transition-colors">
            {{ link.label }}
          </router-link>
        </div>

        <!-- 右侧：外部链接和版权 -->
        <div class="flex items-center gap-4">
          <a v-for="link in footerExternal" :key="link.name"
             :href="link.url"
             target="_blank" rel="noopener noreferrer"
             class="text-gray-400 hover:text-primary-400 transition-colors">
            {{ link.name }}
          </a>
          <span class="text-gray-500 text-xs">&copy; {{ currentYear }}</span>
        </div>
      </div>
      
      <!-- 备案信息 -->
      <div class="mt-4 pt-3 border-t border-gray-700/30">
        <div class="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">
          <div class="text-center md:text-left">
            <p>{{ serviceName }} - {{ domain }}</p>
          </div>
          <div class="flex flex-wrap justify-center md:justify-end items-center gap-4">
            <!-- 联网备案信息 -->
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=21078302000120"
               rel="noreferrer" target="_blank"
               class="flex items-center gap-1 text-gray-400 hover:text-primary-400 transition-colors">
              <img src="/beian-icon.png" alt="联网备案图标" class="w-4 h-4" />
              <span>辽公网安备21078302000120号</span>
            </a>
            <!-- ICP备案信息 -->
            <a :href="icpLink" target="_blank" rel="noopener noreferrer"
               class="text-gray-400 hover:text-primary-400 transition-colors">
              {{ icpNumber }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { getContent, parseContent } from '@/utils/contentStorage'

const currentYear = computed(() => new Date().getFullYear())

// 备案信息
const serviceName = '我的个人分享站'
const domain = 'jiaandmiya.com'
const icpNumber = '黔ICP备2026003662号-1'
const icpLink = 'https://beian.miit.gov.cn/'

const footerInfo = ref({
  title: 'jiaandmiya',
  subtitle: '简约 · 技术 · 二次元 · 社区',
  description: '以我的路程视角出发',
  miyaText: 'Miya 在线当管家 ✨'
})

const footerLinks = ref([
  { label: '技术笔记', path: '/notes' },
  { label: '文化区', path: '/culture' },
  { label: '社区', path: '/community' }
])

const footerExternal = ref([
  { name: 'B站', url: 'https://space.bilibili.com' }
])

onMounted(() => {
  const info = getContent('footer-info')
  if (info) {
    footerInfo.value = parseContent(info)
  }

  const links = getContent('footer-links')
  if (links) {
    footerLinks.value = parseContent(links)
  }

  const external = getContent('footer-external')
  if (external) {
    footerExternal.value = parseContent(external)
  }
})
</script>
