import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─── 新版路由 ───
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    // 图书组（统一的图书入口）
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue')
    },
    {
      path: '/library/:collectionId',
      name: 'library-collection',
      component: () => import('../views/LibraryCollectionView.vue')
    },
    {
      path: '/library/:collectionId/:itemId',
      name: 'library-item',
      component: () => import('../views/LibraryItemView.vue')
    },
    // 伴侣社区（新版）
    {
      path: '/companions',
      name: 'companions',
      component: () => import('../views/CompanionsView.vue')
    },
    {
      path: '/companions/:id',
      name: 'companion-detail',
      component: () => import('../views/CompanionDetailView.vue')
    },
    // 免费资源导航
    {
      path: '/resources',
      name: 'resources',
      component: () => import('../views/ResourcesView.vue')
    },
    // 文化区
    {
      path: '/culture',
      name: 'culture',
      component: () => import('../views/CultureView.vue')
    },
    // 关于
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/about-miya',
      name: 'about-miya',
      component: () => import('../views/AboutMiyaView.vue')
    },

    // ─── 功能页面 ───
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/UserView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cms',
      name: 'cms',
      component: () => import('../views/CMSView.vue'),
      meta: { requiresAuth: true }
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
      meta: { requiresAuth: true }
    },
    {
      path: '/editor/:id',
      name: 'editor-edit',
      component: () => import('../components/UnifiedEditor.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/saved-articles',
      name: 'saved-articles',
      component: () => import('../views/SavedArticlesView.vue'),
      meta: { requiresAuth: true }
    },
    // 旧版伴侣路由重定向
    { path: '/companions/create', redirect: '/cms?section=companions' },
    { path: '/companions/:id/edit', redirect: to => ({ path: '/cms', query: { section: 'companions', edit: to.params.id } }) },
    { path: '/companions/:id/chapters', redirect: to => ({ path: '/companions', query: { tab: 'chapters', id: to.params.id } }) },
    { path: '/companions/:id/dialogues', redirect: to => ({ path: '/companions', query: { tab: 'dialogues', id: to.params.id } }) },
    { path: '/fantasy/create', redirect: '/cms?section=library' },
    { path: '/novel/create', redirect: '/cms?section=library' },
  ]
})

// 路由守卫 - 保护需要认证的页面
router.beforeEach((to, from) => {
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
