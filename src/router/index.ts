import { createRouter, createWebHistory } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─── 新版路由 ───
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'jiaandmiya · 分享站', description: 'jiaandmiya.com - 分享技术、记录生活' }
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogView.vue'),
      meta: { title: '技术博客 - jiaandmiya' }
    },
    {
      path: '/blog/:id',
      name: 'blog-post',
      component: () => import('../views/LibraryItemView.vue'),
      meta: { title: '文章详情 - jiaandmiya' }
    },
    // 图书组（统一的图书入口）
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue'),
      meta: { title: '创作 - jiaandmiya', description: '原创小说、幻想世界、文字创作' }
    },
    {
      path: '/library/:collectionId',
      name: 'library-collection',
      component: () => import('../views/LibraryCollectionView.vue'),
      meta: { title: '合集 - jiaandmiya' }
    },
    {
      path: '/library/:collectionId/:itemId',
      name: 'library-item',
      component: () => import('../views/LibraryItemView.vue'),
      meta: { title: '作品详情 - jiaandmiya' }
    },
    // OC 社区（新版）
    {
      path: '/companions',
      name: 'companions',
      component: () => import('../views/CompanionsView.vue'),
      meta: { title: 'OC 社区 - jiaandmiya', description: '分享你的原创角色、人设、故事与图片' }
    },
    {
      path: '/companions/:id',
      name: 'companion-detail',
      component: () => import('../views/CompanionDetailView.vue'),
      meta: { title: 'OC 详情 - jiaandmiya' }
    },
    // 免费资源导航
    {
      path: '/resources',
      name: 'resources',
      component: () => import('../views/ResourcesView.vue'),
      meta: { title: '免费资源 - jiaandmiya', description: '为爱发电，分享优质资源链接' }
    },
    {
      path: '/resources/:id',
      name: 'resource-detail',
      component: () => import('../views/ResourceDetailView.vue'),
      meta: { title: '资源详情 - jiaandmiya' }
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('../views/CultureView.vue'),
      meta: { title: '图库 - jiaandmiya', description: '美图收藏、生活日记、书单推荐、视听分享' }
    },
    // 文化区 (保留向后兼容)
    {
      path: '/culture',
      redirect: '/gallery'
    },
    // 关于
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { title: '关于 - jiaandmiya' }
    },
    {
      path: '/about-miya',
      name: 'about-miya',
      component: () => import('../views/AboutMiyaView.vue'),
      meta: { title: '关于 Miya - jiaandmiya' }
    },
    {
      path: '/links',
      name: 'links',
      component: () => import('../views/LinksView.vue'),
      meta: { title: '推荐链接 - jiaandmiya' }
    },

    // ─── 功能页面 ───
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登录 - jiaandmiya' }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/UserView.vue'),
      meta: { requiresAuth: true, title: '用户中心 - jiaandmiya' }
    },
    {
      path: '/cms',
      name: 'cms',
      component: () => import('../views/CMSView.vue'),
      meta: { requiresAuth: true, title: '内容管理 - jiaandmiya' }
    },

    // ─── 旧版路由（保留重定向，后续清理） ───
    { path: '/notes', redirect: '/library' },
    { path: '/notes/:id', redirect: to => ({ path: '/library', query: { from: 'notes', id: to.params.id } }) },
    { path: '/articles', redirect: '/library' },
    { path: '/articles/:id', redirect: to => ({ path: '/library', query: { from: 'articles', id: to.params.id } }) },
    { path: '/novel', redirect: '/library' },
    { path: '/novel/:id', redirect: to => ({ path: '/library', query: { from: 'novel', id: to.params.id } }) },
    { path: '/fantasy', redirect: '/library' },
    { path: '/fantasy/:id', redirect: to => ({ path: '/library', query: { from: 'fantasy', id: to.params.id } }) },
    { path: '/free-resources', redirect: '/resources' },
    { path: '/community', redirect: '/companions' },
    // 编辑器保留
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../components/UnifiedEditor.vue'),
      meta: { requiresAuth: true, title: '编辑器 - jiaandmiya' }
    },
    {
      path: '/editor/:id',
      name: 'editor-edit',
      component: () => import('../components/UnifiedEditor.vue'),
      meta: { requiresAuth: true, title: '编辑 - jiaandmiya' }
    },
    {
      path: '/saved-articles',
      name: 'saved-articles',
      component: () => import('../views/SavedArticlesView.vue'),
      meta: { requiresAuth: true, title: '已保存的文章 - jiaandmiya' }
    },
    // 旧版 OC 路由重定向
    { path: '/companions/create', redirect: '/cms?section=companions' },
    { path: '/companions/:id/edit', redirect: to => ({ path: '/cms', query: { section: 'companions', edit: to.params.id } }) },
    { path: '/companions/:id/chapters', redirect: to => ({ path: '/companions', query: { tab: 'chapters', id: to.params.id } }) },
    { path: '/companions/:id/dialogues', redirect: to => ({ path: '/companions', query: { tab: 'dialogues', id: to.params.id } }) },
    { path: '/fantasy/create', redirect: '/cms?section=library' },
    { path: '/novel/create', redirect: '/cms?section=library' },
    // 404 catch-all
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: '404 - 页面未找到 - jiaandmiya' }
    }
  ]
})

router.afterEach((to) => {
  useHead({
    title: (to.meta.title as string) || 'jiaandmiya · 分享站',
    meta: to.meta.description
      ? [{ name: 'description', content: to.meta.description as string }]
      : []
  })
})

// 路由守卫 - 保护需要认证的页面
router.beforeEach((to, _from) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.canEdit) {
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  return true
})

export default router
