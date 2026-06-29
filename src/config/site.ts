/**
 * 站点全局配置
 * 修改此文件即可更改网站设置
 */

export const siteConfig = {
  name: 'jiaandmiya',
  tagline: '技术笔记 · 原创创作 · OC 社区 · 免费资源',

  banner: {
    images: [] as string[],
    imagePosition: '50% 30%',
    title: 'jiaandmiya',
    accent: '· 分享站',
    subtitle: '技术笔记 · 原创创作 · OC 社区 · 免费资源',
  },

  profile: {
    name: 'jiaandmiya',
    bio: '分享技术、记录创作',
    stats: [
      { label: '技术笔记', value: '0' },
      { label: '创作', value: '0' },
      { label: '资源', value: '0' },
      { label: 'OC', value: '0' },
    ],
    announcement: '欢迎来到 jiaandmiya~',
  },

  sidebar: {
    categories: [
      { label: '技术笔记', path: '/blog', count: 0 },
      { label: '原创创作', path: '/library', count: 0 },
      { label: '人文', path: '/gallery', count: 0 },
      { label: 'OC 社区', path: '/companions', count: 0 },
      { label: '免费资源', path: '/resources', count: 0 },
      { label: '推荐链接', path: '/links', count: 0 },
    ],
    tags: [
      { name: '前端' }, { name: 'Vue' }, { name: 'TypeScript' },
      { name: 'Node.js' }, { name: 'Python' }, { name: 'AI' },
      { name: '二次元' }, { name: '小说' }, { name: '教程' },
      { name: '工具' }, { name: '设计' }, { name: '游戏' },
    ],
  },

  background: {
    images: [] as string[],
    opacity: 22,
    blur: 4,
  },
}
