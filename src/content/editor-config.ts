// 编辑器配置 - 笔记和文章的统一类型定义

export type ContentType = 'note' | 'article'

export interface BaseContent {
  id: string
  type: ContentType
  title: string
  content: string
  summary?: string
  tags: string[]
  cover?: string
  color?: string // 笔记封面颜色
  featured: boolean
  published: boolean
  date: string
  readTime: string
  author: string
  createdAt: string
  updatedAt: string
}

export interface NoteData extends BaseContent {
  type: 'note'
  category: string // Linux, 网络安全, AI, 单片机等
}

export interface ArticleData extends BaseContent {
  type: 'article'
  category: string // linux, security, ai, microcontroller, frontend等
}

export type ContentData = NoteData | ArticleData

// 笔记分类配置
export const noteCategories = [
  { id: 'linux', name: 'Linux', icon: '🐧' },
  { id: 'security', name: '网络安全', icon: '🔒' },
  { id: 'ai', name: 'AI', icon: '🤖' },
  { id: 'microcontroller', name: '单片机', icon: '⚡' }
]

// 文章分类配置
export const articleCategories = [
  { id: 'linux', name: 'Linux', icon: '🐧' },
  { id: 'security', name: '网络安全', icon: '🔒' },
  { id: 'ai', name: 'AI & 机器学习', icon: '🤖' },
  { id: 'microcontroller', name: '单片机', icon: '⚡' },
  { id: 'frontend', name: '前端开发', icon: '🎨' },
  { id: 'backend', name: '后端开发', icon: '⚙️' },
  { id: 'database', name: '数据库', icon: '🗄️' },
  { id: 'devops', name: 'DevOps', icon: '🚀' }
]

// 封面颜色选项（用于笔记）
export const coverColors = [
  { name: '天空蓝', value: '#3B82F6' },
  { name: '薰衣草紫', value: '#8B5CF6' },
  { name: '玫瑰红', value: '#EC4899' },
  { name: '翡翠绿', value: '#10B981' },
  { name: '琥珀金', value: '#F59E0B' },
  { name: '珊瑚橙', value: '#F97316' },
  { name: '青色', value: '#06B6D4' },
  { name: '靛蓝', value: '#6366F1' }
]
