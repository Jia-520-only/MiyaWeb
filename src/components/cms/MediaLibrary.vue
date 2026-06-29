<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="section-title !mb-1">资源管理中心</h2>
        <p class="text-sm text-gray-400">集中管理所有资源，精准分发到网站各处</p>
      </div>
      <div class="relative">
        <Icon name="solar:upload-bold" size="sm" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="file" accept="image/*" multiple class="absolute inset-0 opacity-0 cursor-pointer" @change="handleFileSelect" />
        <button class="btn-primary !pl-10">上传文件</button>
      </div>
    </div>

    <!-- Sub Tabs -->
    <div class="flex gap-2 border-b border-white/6 pb-2">
      <button v-for="tab in subTabs" :key="tab.id" @click="activeSubTab = tab.id"
        :class="['px-4 py-2 rounded-lg text-sm font-medium transition-all', activeSubTab === tab.id ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white']"
      >{{ tab.label }}</button>
    </div>

    <!-- Media Files -->
    <div v-if="activeSubTab === 'media'">
      <div class="flex items-center gap-3 flex-wrap mb-4">
        <div class="relative flex-1 max-w-xs">
          <Icon name="solar:search-linear" size="sm" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="search" @input="debouncedSearch" class="input-field !pl-10 !py-2 text-sm" placeholder="搜索文件名..." />
        </div>
        <select v-model="filter" @change="loadFiles(true)" class="input-field w-28 !py-2 text-sm">
          <option value="">全部类型</option><option value="image">图片</option><option value="application">文档</option><option value="text">文本</option>
        </select>
        <button @click="loadFiles(true)" class="btn-ghost text-sm"><Icon name="solar:refresh-linear" size="sm" class="mr-1" /> 刷新</button>
      </div>

      <div v-if="mediaLoading" class="flex justify-center py-16"><div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>

      <div v-else-if="files.length === 0" class="text-center py-16 text-gray-400">
        <Icon name="solar:gallery-wide-bold-duotone" size="xl" color="#6b7280" class="mb-4 mx-auto" />
        <p>暂无资源文件</p>
        <p class="text-xs mt-1">放入 content/incoming-images/ 或 content/incoming/ 的图片会自动出现</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div v-for="file in files" :key="file.id"
          :class="['glass-card !p-3 group relative cursor-pointer transition-all duration-200', selectedIds.has(file.id) ? 'ring-2 ring-primary-500 bg-primary-500/10' : 'hover:border-white/10']"
          @click="selectedIds.has(file.id) ? selectedIds.delete(file.id) : selectedIds.add(file.id)">
          <div class="aspect-square rounded-lg overflow-hidden bg-black/30 mb-3 flex items-center justify-center">
            <img v-if="isImage(file.mimeType) && (file.thumbUrl || file.url)" :src="file.thumbUrl || file.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            <div v-else class="flex flex-col items-center gap-2 text-gray-500"><Icon :name="fileIcon(file.mimeType)" size="xl" /><span class="text-[10px] uppercase">{{ fileExt(file.mimeType) }}</span></div>
          </div>
          <p class="text-xs text-white truncate mb-1" :title="file.originalName">{{ file.originalName }}</p>
          <div class="flex items-center justify-between text-[10px] text-gray-400"><span>{{ formatSize(file.size) }}</span><span v-if="file.width">{{ file.width }}×{{ file.height }}</span></div>
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
            <button @click.stop="openDistribute(file)" class="w-7 h-7 rounded-lg bg-primary-500/90 text-white flex items-center justify-center hover:bg-primary-600" title="分发"><Icon name="solar:routing-bold" size="xs" /></button>
            <button @click.stop="copyLink(file.url)" class="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20" title="复制链接"><Icon name="solar:copy-bold" size="xs" /></button>
            <button @click.stop="deleteFile(file)" class="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40" title="删除"><Icon name="solar:trash-bin-trash-bold" size="xs" /></button>
          </div>
          <div v-if="selectedIds.has(file.id)" class="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"><Icon name="solar:check-read-bold" size="xs" color="#fff" /></div>
        </div>
      </div>

      <div v-if="pagTotal > 1 && !mediaLoading" class="flex justify-center gap-2 pt-4">
        <button @click="page--; loadFiles()" :disabled="page <= 1" class="btn-ghost text-sm">上一页</button>
        <button @click="page++; loadFiles()" :disabled="page >= pagTotal" class="btn-ghost text-sm">下一页</button>
      </div>
    </div>

    <!-- Imported Articles -->
    <div v-if="activeSubTab === 'articles'">
      <div v-if="articlesLoading" class="flex justify-center py-16"><div class="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" /></div>
      <div v-else-if="articles.length === 0" class="text-center py-16 text-gray-400">
        <Icon name="solar:document-text-bold-duotone" size="xl" color="#6b7280" class="mb-4 mx-auto" />
        <p>暂无导入文章</p><p class="text-xs mt-1">放入 content/incoming/ 的 .md / .txt 会自动导入</p>
      </div>
      <div v-else class="space-y-2">
        <div v-for="item in articles" :key="item.id" class="glass-card !p-4 flex items-center justify-between group">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
              <Icon :name="item.content_type === 'markdown' ? 'solar:document-bold-duotone' : 'solar:document-text-bold-duotone'" size="lg" />
            </div>
            <div class="min-w-0">
              <h3 class="font-semibold text-white text-sm truncate">{{ item.title }}</h3>
              <div class="flex items-center gap-2 text-xs text-gray-400">
                <span>{{ item.collection_name || '未分类' }}</span>
                <span>· {{ item.content_type }}</span>
                <span>· {{ item.status === 'published' ? '已发布' : item.status === 'draft' ? '草稿' : item.status }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openArticleDistribute(item)" class="btn-ghost !px-2 !py-1 text-xs text-primary-400" title="分发">分发</button>
            <button v-if="item.status !== 'published'" @click="publishArticle(item)" :disabled="publishingId === item.id" class="btn-ghost !px-2 !py-1 text-xs text-green-400">{{ publishingId === item.id ? '...' : '发布' }}</button>
            <button @click="deleteArticle(item)" :disabled="deletingId === item.id" class="btn-ghost !px-2 !py-1 text-xs text-red-400">{{ deletingId === item.id ? '...' : '删除' }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Action Bar -->
    <div v-if="selectedIds.size > 0 && activeSubTab === 'media'" class="fixed bottom-6 left-1/2 -translate-x-1/2 glass-card !p-3 flex items-center gap-4 z-50 shadow-xl">
      <span class="text-sm text-white">已选 {{ selectedIds.size }} 项</span>
      <button @click="batchDistribute" class="btn-primary !py-1.5 text-sm"><Icon name="solar:routing-bold" size="xs" class="mr-1" /> 批量分发</button>
      <button @click="selectedIds.clear()" class="btn-ghost !py-1.5 text-sm">取消</button>
    </div>

    <!-- ============ DISTRIBUTE MODAL ============ -->
    <Teleport to="body">
      <div v-if="distModal.show" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" @click.self="distModal.show = false; batchFiles = []">
        <div class="glass-panel p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto animate-slide-up">
          <h2 class="text-lg font-bold text-white mb-1">分发资源</h2>
          <p class="text-sm text-gray-400 mb-4 truncate">{{ distFile?.originalName || distFile?.title || '' }}</p>

          <div v-if="distFile && isImage(distFile.mimeType) && distFile.url" class="aspect-video rounded-lg overflow-hidden bg-black/30 mb-4 flex items-center justify-center">
            <img :src="distFile.url" class="w-full h-full object-contain" />
          </div>

          <!-- Step 1: Pick destination -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">分发到</label>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="dest in availableDestinations" :key="dest.key"
                @click="distTarget = dest.key"
                :class="['p-3 rounded-xl text-left transition-all border', distTarget === dest.key ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10']">
                <div class="flex items-center gap-2 mb-1">
                  <Icon :name="dest.icon" size="sm" />
                  <span class="text-sm font-medium">{{ dest.label }}</span>
                </div>
                <span class="text-[11px] opacity-60">{{ dest.desc }}</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Destination-specific fields -->
          <div class="space-y-3">
            <!-- Gallery -->
            <template v-if="distTarget === 'gallery'">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">标题</label>
                <input v-model="distForm.title" class="input-field text-sm" placeholder="图片标题" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">归属分组</label>
                <div class="flex flex-wrap gap-2">
                  <button @click="distForm.groupId = null" :class="['px-3 py-1.5 rounded-full text-xs', distForm.groupId === null ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10']">无分组</button>
                  <button v-for="g in galleryGroups" :key="g.id" @click="distForm.groupId = g.id" :class="['px-3 py-1.5 rounded-full text-xs', distForm.groupId === g.id ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10']">{{ g.emoji }} {{ g.name }}</button>
                </div>
              </div>
            </template>

            <!-- Collection Cover -->
            <template v-if="distTarget === 'collection_cover'">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">选择合集</label>
                <select v-model="distForm.collectionId" class="input-field text-sm">
                  <option :value="null">— 请选择 —</option>
                  <option v-for="c in allCollections" :key="c.id" :value="c.id">{{ c.name }} <span class="text-gray-500">({{ c.type }})</span></option>
                </select>
              </div>
            </template>

            <!-- Item Cover -->
            <template v-if="distTarget === 'item_cover'">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">选择合集（先筛选）</label>
                <select v-model="distForm.collectionId" @change="loadCollectionItems" class="input-field text-sm">
                  <option :value="null">— 全部合集 —</option>
                  <option v-for="c in allCollections" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div v-if="distForm.collectionId">
                <label class="block text-sm font-medium text-gray-300 mb-1">选择条目</label>
                <select v-model="distForm.itemId" class="input-field text-sm">
                  <option :value="null">— 请选择 —</option>
                  <option v-for="it in collectionItems" :key="it.id" :value="it.id">{{ it.title }}</option>
                </select>
              </div>
            </template>

            <!-- Profile / About -->
            <template v-if="distTarget === 'profile'">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">目标字段</label>
                <select v-model="distForm.profileField" class="input-field text-sm">
                  <option value="avatar">头像 (avatar)</option>
                  <option value="cover_image">封面图 (cover_image)</option>
                </select>
              </div>
            </template>

            <!-- OC 图廊 -->
            <template v-if="distTarget === 'oc_gallery'">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">选择 OC 条目</label>
                <select v-model="distForm.itemId" class="input-field text-sm">
                  <option :value="null">— 请选择 —</option>
                  <option v-for="oc in ocItems" :key="oc.id" :value="oc.id">{{ oc.title }}</option>
                </select>
              </div>
            </template>

            <!-- Resource Link -->
            <template v-if="distTarget === 'resource'">
              <div><label class="block text-sm font-medium text-gray-300 mb-1">标题</label><input v-model="distForm.title" class="input-field text-sm" placeholder="资源名称" /></div>
              <div><label class="block text-sm font-medium text-gray-300 mb-1">链接 URL</label><input v-model="distForm.url" class="input-field text-sm" placeholder="https://..." /></div>
              <div><label class="block text-sm font-medium text-gray-300 mb-1">分类</label><input v-model="distForm.category" class="input-field text-sm" placeholder="如：工具、教程" /></div>
            </template>

            <!-- Resource Cover -->
            <template v-if="distTarget === 'resource_cover'">
              <div><label class="block text-sm font-medium text-gray-300 mb-1">选择资源</label><select v-model="distForm.resourceId" class="input-field text-sm"><option :value="null">— 请选择 —</option><option v-for="r in existingResources" :key="r.id" :value="r.id">{{ r.title }}</option></select></div>
            </template>

            <!-- Feature Card Cover -->
            <template v-if="distTarget === 'feature_card'">
              <div><label class="block text-sm font-medium text-gray-300 mb-1">选择卡片</label>
              <select v-model="distForm.cardKey" class="input-field text-sm"><option :value="null">— 请选择 —</option><option value="blog">技术笔记</option><option value="library">创作</option><option value="gallery">人文</option><option value="companions">OC 社区</option><option value="resources">免费资源</option><option value="links">推荐链接</option><option value="about">关于</option></select></div>
            </template>

            <!-- Section Cover -->
            <template v-if="distTarget === 'section_cover'">
              <div><label class="block text-sm font-medium text-gray-300 mb-1">选择板块</label>
              <select v-model="distForm.cardKey" class="input-field text-sm"><option :value="null">— 请选择 —</option><option value="blog">技术笔记</option><option value="library">创作</option><option value="gallery">人文</option><option value="companions">OC 社区</option><option value="resources">免费资源</option><option value="links">推荐链接</option><option value="about">关于</option></select></div>
            </template>

            <!-- Blog / Library (article) -->
            <template v-if="distTarget === 'blog' || distTarget === 'library'">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">发布到合集</label>
                <select v-model="distForm.collectionId" class="input-field text-sm">
                  <option :value="null">— 新建合集 —</option>
                  <option v-for="c in filteredCollections(distTarget === 'blog' ? 'blog' : 'book_group')" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div v-if="!distForm.collectionId">
                <label class="block text-sm font-medium text-gray-300 mb-1">新合集名称</label>
                <input v-model="distForm.newCollectionName" class="input-field text-sm" :placeholder="distTarget === 'blog' ? '如：技术笔记' : '如：小说收藏'" />
              </div>
            </template>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="distModal.show = false; batchFiles = []" class="btn-secondary text-sm">取消</button>
            <button @click="confirmDistribute" class="btn-primary text-sm" :disabled="saving">{{ saving ? '分发中...' : '确认分发' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div v-if="toast.show" class="fixed top-6 right-6 z-[200] animate-slide-up">
        <div :class="['px-4 py-3 rounded-xl text-sm font-medium shadow-lg', toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white']">{{ toast.msg }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { uploadAPI, contentAPI, itemAPI, collectionAPI, resourceAPI, profileAPI } from '@/utils/apiClient'
import Icon from '@/components/ui/Icon.vue'

const subTabs = [
  { id: 'media', label: '媒体文件' },
  { id: 'articles', label: '导入文章' },
]
const activeSubTab = ref('media')

const files = ref<any[]>([])
const mediaLoading = ref(true)
const saving = ref(false)
const selectedIds = ref(new Set<number>())
const search = ref('')
const filter = ref('')
const page = ref(1)
const pagTotal = ref(1)
const limit = 30

const articles = ref<any[]>([])
const articlesLoading = ref(true)
const publishingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)

const galleryGroups = ref<any[]>([])
const allCollections = ref<any[]>([])
const collectionItems = ref<any[]>([])
const ocItems = ref<any[]>([])
const existingResources = ref<any[]>([])

const distModal = ref({ show: false })
const distFile = ref<any>(null)
const batchFiles = ref<any[]>([])  // For batch distribution
const distTarget = ref('')
const distForm = ref<Record<string, any>>({})

const toast = ref<{ show: boolean; msg: string; type: string }>({ show: false, msg: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout> | null = null
const showToast = (msg: string, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 2500)
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => { if (searchTimer) clearTimeout(searchTimer); searchTimer = setTimeout(() => loadFiles(true), 400) }

const isImage = (mime: string) => mime?.startsWith('image/')
const formatSize = (bytes: number) => { if (!bytes) return '0 B'; const u = ['B','KB','MB','GB']; let i = 0, s = bytes; while (s >= 1024 && i < 3) { s /= 1024; i++ }; return s.toFixed(i ? 1 : 0) + ' ' + u[i] }
const fileIcon = (mime: string) => { if (mime?.startsWith('image/')) return 'solar:gallery-wide-bold-duotone'; if (mime?.includes('pdf')) return 'solar:document-bold-duotone'; if (mime?.startsWith('text/')) return 'solar:document-text-bold-duotone'; return 'solar:file-bold-duotone' }
const fileExt = (mime: string) => { const m: Record<string, string> = { 'image/jpeg':'jpg','image/png':'png','image/gif':'gif','image/webp':'webp','application/pdf':'pdf','text/plain':'txt','text/markdown':'md' }; return m[mime] || 'file' }

const imageDestinations = [
  { key: 'gallery', label: '人文画廊', icon: 'solar:gallery-wide-bold-duotone', desc: '添加到人文板块的美图收藏' },
  { key: 'collection_cover', label: '合集封面', icon: 'solar:folder-with-files-bold-duotone', desc: '设为创作/技术笔记的合集封图' },
  { key: 'item_cover', label: '条目封面', icon: 'solar:notebook-bold-duotone', desc: '设为图书/OC 卡片的封面' },
  { key: 'profile', label: '个人页', icon: 'solar:user-circle-bold-duotone', desc: '设为头像或封面图' },
  { key: 'oc_gallery', label: 'OC 图廊', icon: 'solar:star-shine-bold-duotone', desc: '分配给某个 OC 作为图廊展示' },
  { key: 'resource_cover', label: '资源封面', icon: 'solar:folder-with-files-bold-duotone', desc: '设为已有资源的封面图' },
  { key: 'feature_card', label: '首页卡片', icon: 'solar:widget-2-bold-duotone', desc: '设为首页功能卡片的封面' },
  { key: 'sidebar_image', label: '侧栏/Banner', icon: 'solar:images-bold-duotone', desc: '加入侧栏图库，用于Banner和侧边栏展示' },
  { key: 'banner_image', label: 'Banner 轮播', icon: 'solar:gallery-wide-bold-duotone', desc: '加入首页 Banner 轮播背景图' },
  { key: 'bg_image', label: '背景图', icon: 'solar:background-bold-duotone', desc: '设为全站页面背景图' },
  { key: 'section_cover', label: '板块封面', icon: 'solar:widget-2-bold-duotone', desc: '设为某个板块顶部的封面大图' },
  { key: 'resource', label: '资源链接', icon: 'solar:link-round-bold-duotone', desc: '创建带封面的资源链接' },
]

const articleDestinations = [
  { key: 'blog', label: '技术笔记', icon: 'solar:document-text-bold-duotone', desc: '发布到博客合集' },
  { key: 'library', label: '创作', icon: 'solar:notebook-bold-duotone', desc: '加入创作合集' },
]

const availableDestinations = computed(() => {
  if (!distFile.value) return []
  if (isImage(distFile.value.mimeType)) return imageDestinations
  return articleDestinations
})

const filteredCollections = (type: string) => allCollections.value.filter((c: any) => c.type === type)

const loadFiles = async (reset = false) => {
  if (reset) { page.value = 1; files.value = [] }
  mediaLoading.value = true
  try { const params: any = { page: page.value, limit }; if (filter.value) params.mimeType = filter.value; if (search.value) params.search = search.value; const res = await uploadAPI.getFiles(params); files.value = res.files || []; pagTotal.value = res.pagination?.totalPages || 1 } catch { files.value = [] }
  finally { mediaLoading.value = false }
}

const loadArticles = async () => { articlesLoading.value = true; try { articles.value = (await itemAPI.getImported()).items || [] } catch { articles.value = [] } finally { articlesLoading.value = false } }

const loadGroups = async () => { try { const res = await contentAPI.getPageContents('culture'); const items = res.sections?.['gallery-groups']; if (items?.length) { const raw = items[0].content; galleryGroups.value = Array.isArray(raw) ? raw : (typeof raw === 'string' ? JSON.parse(raw) : []) } } catch { galleryGroups.value = [] } }

const loadCollections = async () => { try { allCollections.value = (await collectionAPI.getAll()).collections || [] } catch { allCollections.value = [] } }
const loadOCItems = async () => {
  try {
    const res = await collectionAPI.getAll({ type: 'companion_group' })
    const cols = res.collections || []
    const items: any[] = []
    for (const col of cols) {
      const itemRes = await fetch(`/api/collections/${col.id}/items`).then(r => r.json())
      items.push(...(itemRes.items || []))
    }
    ocItems.value = items
  } catch { ocItems.value = [] }
}

const loadCollectionItems = async () => {
  if (!distForm.value.collectionId) { collectionItems.value = []; return }
  try { const res = await collectionAPI.getItems(distForm.value.collectionId); collectionItems.value = res.items || [] } catch { collectionItems.value = [] }
}

const openDistribute = (file: any) => {
  distFile.value = file
  distTarget.value = ''
  distForm.value = { title: file.originalName?.replace(/\.[^.]+$/, '') || '', groupId: null, collectionId: null, itemId: null, profileField: 'avatar', url: '', category: '', newCollectionName: '' }
  distModal.value.show = true
}

const openArticleDistribute = (item: any) => {
  distFile.value = item
  distTarget.value = ''
  distForm.value = { collectionId: null, newCollectionName: '' }
  distModal.value.show = true
}

const confirmDistribute = async () => {
  if (!distTarget.value || !distFile.value) { showToast('请选择分发目标', 'error'); return }
  saving.value = true
  try {
    const action = distributionActions[distTarget.value]
    if (!action) { showToast('未知分发目标', 'error'); return }
    const files = batchFiles.value.length > 0 ? batchFiles.value : [distFile.value]
    for (const file of files) {
      await action(file, distForm.value)
    }
    showToast(`已分发 ${files.length} 张图片`)
    batchFiles.value = []
    distModal.value.show = false
    selectedIds.value.clear()
  } catch (err: any) { showToast(err.error || err.message || '分发失败', 'error') }
  finally { saving.value = false }
}

const distributionActions: Record<string, Function> = {
  async gallery(file: any, form: any) {
    const newImage = { id: Date.now(), title: form.title || '未命名', date: new Date().toISOString().split('T')[0], emoji: '', imageUrl: file.url, groupId: form.groupId }
    let existing: any[] = []
    try { const res = await contentAPI.getContent('culture-gallery'); const raw = res?.content || res?.parsedContent; if (Array.isArray(raw)) existing = raw; else if (typeof raw === 'string') { try { existing = JSON.parse(raw) } catch { existing = [] } } } catch { existing = [] }
    existing.unshift(newImage)
    const payload = { id: 'culture-gallery', type: 'array', title: '人文画廊', content: JSON.stringify(existing), page: 'culture', section: 'gallery' }
    try { await contentAPI.updateContent('culture-gallery', payload) } catch { await contentAPI.createContent(payload) }
    const glabel = form.groupId ? galleryGroups.value.find((g: any) => g.id === form.groupId)?.name || '分组' : '无分组'
    showToast(`「${newImage.title}」已分发到人文画廊 · ${glabel}`)
  },

  async collection_cover(file: any, form: any) {
    if (!form.collectionId) { showToast('请选择合集', 'error'); return }
    await collectionAPI.update(form.collectionId, { cover_image: file.url })
    const c = allCollections.value.find((x: any) => x.id === form.collectionId)
    showToast(`已设为「${c?.name || '合集'}」封面`)
  },

  async item_cover(file: any, form: any) {
    if (!form.itemId) { showToast('请选择条目', 'error'); return }
    await itemAPI.update(form.itemId, { cover_image: file.url })
    const it = collectionItems.value.find((x: any) => x.id === form.itemId)
    showToast(`已设为「${it?.title || '条目'}」封面`)
  },

  async profile(file: any, form: any) {
    const field = form.profileField || 'avatar'
    const data: any = {}
    data[field] = file.url
    await profileAPI.updateMyProfile(data)
    showToast(`已设为个人页${field === 'avatar' ? '头像' : '封面图'}`)
  },

  async oc_gallery(file: any, form: any) {
    if (!form.itemId) { showToast('请选择 OC 条目', 'error'); return }
    const token = localStorage.getItem('auth_token')
    const res = await fetch('/api/oc-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ item_id: Number(form.itemId), upload_id: file.id })
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: '未知错误' }))
      showToast(data.error || '分发失败', 'error')
      return
    }
    const oc = ocItems.value.find((x: any) => x.id === Number(form.itemId))
    showToast(`已添加到「${oc?.title || 'OC'}」图廊`)
  },

  async resource_cover(file: any, form: any) {
    if (!form.resourceId) { showToast('请选择资源', 'error'); return }
    await resourceAPI.update(Number(form.resourceId), { cover_image: file.url })
    const r = existingResources.value.find((x: any) => x.id === Number(form.resourceId))
    showToast(`已设为「${r?.title || '资源'}」封面`)
  },

  async feature_card(file: any, form: any) {
    if (!form.cardKey) { showToast('请选择卡片', 'error'); return }
    try {
      let data: Record<string, string> = {}
      try { const res = await contentAPI.getContent('home-feature-covers'); if (res?.content) data = JSON.parse(res.content) } catch {}
      data[form.cardKey] = file.url
      const payload = { id: 'home-feature-covers', type: 'text', title: '首页卡片封面', content: JSON.stringify(data), page: 'home', section: 'feature-covers' }
      try { await contentAPI.updateContent('home-feature-covers', payload) } catch { await contentAPI.createContent(payload) }
      const labels: Record<string, string> = { blog: '技术笔记', library: '创作', gallery: '人文', companions: 'OC 社区', resources: '免费资源', links: '推荐链接', about: '关于' }
      showToast(`已设为「${labels[form.cardKey]}」封面`)
    } catch (e: any) { showToast(e.error || '保存失败', 'error') }
  },

  async banner_image(file: any) {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/banner-images/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ upload_id: file.id })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'add failed')
      showToast('已加入 Banner 轮播')
    } catch (e: any) { showToast(e.error || 'add failed', 'error') }
  },

  async sidebar_image(file: any) {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/sidebar-images/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ upload_id: file.id })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'add failed')
      showToast('已加入侧栏图库')
    } catch (e: any) { showToast(e.error || 'add failed', 'error') }
  },

  async bg_image(file: any) {
    try {
      let config: any = { images: [], blur: 0, opacity: 30 }
      try {
        const res = await contentAPI.getContent('site-background-config')
        if (res?.content) { try { config = JSON.parse(res.content) } catch {} }
        else if (res?.parsedContent) { config = res.parsedContent }
      } catch {}
      if (!config.images) config.images = []
      config.images.push(file.url)
      const payload = { id: 'site-background-config', type: 'object', title: 'bg', content: JSON.stringify(config), page: 'site', section: 'background' }
      try { await contentAPI.updateContent('site-background-config', payload) }
      catch { await contentAPI.createContent(payload) }
      showToast('已加入全站背景图')
    } catch (e: any) { showToast(e.error || '添加失败', 'error') }
  },

  async section_cover(file: any, form: any) {
    if (!form.cardKey) { showToast('请选择板块', 'error'); return }
    const labels: Record<string, string> = { blog: '技术笔记', library: '创作', gallery: '人文', companions: 'OC 社区', resources: '免费资源', links: '推荐链接' }
    try {
      let data: Record<string, string> = {}
      try { const res = await contentAPI.getContent('section-covers'); if (res?.content) data = JSON.parse(res.content) } catch {}
      data[form.cardKey] = file.url
      const payload = { id: 'section-covers', type: 'object', title: '板块封面', content: JSON.stringify(data), page: 'site', section: 'covers' }
      try { await contentAPI.updateContent('section-covers', payload) } catch { await contentAPI.createContent(payload) }
      showToast(`已设为「${labels[form.cardKey]}」封面`)
    } catch (e: any) { showToast(e.error || '保存失败', 'error') }
  },

  async resource(file: any, form: any) {
    if (!form.title || !form.url) { showToast('请填写资源名称和链接', 'error'); return }
    await resourceAPI.create({ title: form.title, url: form.url, cover_image: file.url, description: '', icon: '', category: form.category || '', sort_order: 0, is_visible: true })
    showToast(`资源「${form.title}」已创建`)
  },

  async blog(article: any, form: any) {
    if (form.collectionId) {
      await itemAPI.update(article.id, { status: 'published', collection_id: form.collectionId, type: 'post' })
    } else if (form.newCollectionName) {
      const slug = form.newCollectionName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
      const r = await collectionAPI.create({ name: form.newCollectionName, slug, type: 'blog', description: '' })
      await itemAPI.update(article.id, { status: 'published', collection_id: r.collection?.id || r.collection?.lastID, type: 'post' })
    }
    showToast(`「${article.title}」已发布到博客`)
    await loadArticles()
  },

  async library(article: any, form: any) {
    if (form.collectionId) {
      await itemAPI.update(article.id, { status: 'published', collection_id: form.collectionId, type: 'book' })
    } else if (form.newCollectionName) {
      const slug = form.newCollectionName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '')
      const r = await collectionAPI.create({ name: form.newCollectionName, slug, type: 'book_group', description: '' })
      await itemAPI.update(article.id, { status: 'published', collection_id: r.collection?.id || r.collection?.lastID, type: 'book' })
    }
    showToast(`「${article.title}」已加入创作`)
    await loadArticles()
  },
}

const batchDistribute = () => {
  const imgFiles = files.value.filter(f => selectedIds.value.has(f.id) && isImage(f.mimeType))
  if (imgFiles.length === 0) { showToast('请选择至少一张图片', 'error'); return }
  if (imgFiles.length === 1) { openDistribute(imgFiles[0]); return }
  // Batch distribute: open modal once, apply to all selected
  distFile.value = imgFiles[0]
  batchFiles.value = imgFiles
  distTarget.value = ''
  distForm.value = { title: '', groupId: null, collectionId: null, itemId: null, profileField: 'avatar', url: '', category: '', newCollectionName: '', cardKey: null, resourceId: null }
  distModal.value.show = true
}

const handleFileSelect = async (e: Event) => { const input = e.target as HTMLInputElement; if (!input.files?.length) return; try { await uploadAPI.uploadMultipleFiles(Array.from(input.files)); showToast('上传成功'); await loadFiles(true) } catch (err: any) { showToast(err.error || '上传失败', 'error') } finally { input.value = '' } }

const publishArticle = async (item: any) => { publishingId.value = item.id; try { await itemAPI.publish(item.id, 'published'); showToast(`「${item.title}」已发布`); await loadArticles() } catch (err: any) { showToast(err.error || '发布失败', 'error') } finally { publishingId.value = null } }

const deleteArticle = async (item: any) => { if (!confirm(`确认删除「${item.title}」？`)) return; deletingId.value = item.id; try { await itemAPI.delete(item.id); showToast('已删除'); await loadArticles() } catch (err: any) { showToast(err.error || '删除失败', 'error') } finally { deletingId.value = null } }

const copyLink = async (url: string) => { try { await navigator.clipboard.writeText(url.startsWith('http') ? url : location.origin + url); showToast('链接已复制') } catch { showToast('复制失败', 'error') } }

const deleteFile = async (file: any) => { if (!confirm(`确认删除「${file.originalName}」？`)) return; try { await uploadAPI.deleteFile(file.id); showToast('已删除'); await loadFiles(true) } catch (err: any) { showToast(err.error || '删除失败', 'error') } }

onMounted(() => { loadFiles(true); loadArticles(); loadGroups(); loadCollections(); loadOCItems(); loadExistingResources() })

const loadExistingResources = async () => {
  try { const res = await resourceAPI.getAll(); existingResources.value = res.resources || [] }
  catch { existingResources.value = [] }
}
</script>
