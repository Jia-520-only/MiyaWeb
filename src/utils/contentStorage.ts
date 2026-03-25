/**
 * 通用内容存储系统
 * 支持存储所有页面的文本内容、链接、图片等
 */

export interface ContentItem {
  id: string
  type: 'text' | 'markdown' | 'link' | 'image' | 'array' | 'object'
  title: string
  content: string
  metadata?: Record<string, any>
  page: string
  section: string
  updatedAt: string
}

const CONTENT_STORAGE_KEY = 'jiaandmiya_contents'

// 默认内容模板
export const defaultContents: ContentItem[] = [
  // 首页内容
  {
    id: 'home-hero',
    type: 'object',
    title: '首页 - 顶部区域',
    content: JSON.stringify({
      title: '欢迎来到 jiaandmiya',
      subtitle: '简约 · 技术 · 二次元 · 社区',
      description: '以我的路程视角出发，分享技术、记录生活、传递温度\nMiya 在线当管家 ✨',
      features: [
        {
          icon: '💻',
          title: '技术分享',
          description: 'Linux、网络安全、AI、单片机等技术教程与实战经验',
          link: '/notes'
        },
        {
          icon: '📚',
          title: '文化区',
          description: '生活日记、原创小说、书单推荐、美图收藏',
          link: '/culture'
        },
        {
          icon: '🎁',
          title: '免费资源',
          description: '为爱发电，提供软件、教程、数据集等免费资源',
          link: '/free-resources'
        }
      ]
    }),
    page: 'home',
    section: 'hero',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'home-quotes',
    type: 'array',
    title: '首页 - 金句',
    content: JSON.stringify([
      '技术改变世界，但温度成就美好。',
      '在代码的世界里，我们用逻辑编织梦想。',
      '每一行代码，都是向未来的问好。',
      '保持热爱，奔赴山海。',
      '为爱发电，光芒万丈。'
    ]),
    page: 'home',
    section: 'quotes',
    updatedAt: new Date().toISOString()
  },

  // 导航栏内容
  {
    id: 'nav-items',
    type: 'array',
    title: '导航栏 - 菜单项',
    content: JSON.stringify([
      { name: '文章', path: '/articles' },
      { name: '技术笔记', path: '/notes' },
      { name: '文化区', path: '/culture' },
      { name: '关于 Miya', path: '/about-miya' },
      { name: '社区', path: '/community' },
      { name: '免费资源', path: '/free-resources' }
    ]),
    page: 'global',
    section: 'navigation',
    updatedAt: new Date().toISOString()
  },

  // 页脚内容
  {
    id: 'footer-info',
    type: 'object',
    title: '页脚 - 基本信息',
    content: JSON.stringify({
      title: 'jiaandmiya',
      subtitle: '简约 · 技术 · 二次元 · 社区',
      description: '以我的路程视角出发',
      miyaText: 'Miya 在线当管家 ✨'
    }),
    page: 'global',
    section: 'footer',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'footer-links',
    type: 'array',
    title: '页脚 - 快速链接',
    content: JSON.stringify([
      { label: '技术笔记', path: '/notes' },
      { label: '文化区', path: '/culture' },
      { label: '社区', path: '/community' }
    ]),
    page: 'global',
    section: 'footer',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'footer-external',
    type: 'array',
    title: '页脚 - 外部链接',
    content: JSON.stringify([
      { name: 'B站', url: 'https://space.bilibili.com' }
    ]),
    page: 'global',
    section: 'footer',
    updatedAt: new Date().toISOString()
  },

  // 关于页面
  {
    id: 'about-content',
    type: 'markdown',
    title: '关于页面',
    content: `# 关于

## 关于我

### 个人简介

我是一名热爱技术的开发者，专注于前端开发和用户体验设计。

### 技术栈

- **前端框架**: Vue 3, React
- **构建工具**: Vite, Webpack
- **样式方案**: Tailwind CSS, CSS-in-JS
- **开发语言**: TypeScript, JavaScript

## 关于网站

### 网站理念

打造一个简洁、优雅的个人空间，分享技术见解和个人思考。

### 联系方式

- Email: 1523878699@qqq.com
- GitHub: @yourusername
- 微博: @yourusername

## 关于 Miya

### 角色介绍

Miya 是网站中的虚拟角色，陪伴大家一起探索技术的世界。

### 喜好

- ☕ 喜欢喝椰奶
- 📚 热爱阅读
- 💻 对编程充满热情`,
    page: 'about',
    section: 'main',
    updatedAt: new Date().toISOString()
  },

  // 社区页面
  {
    id: 'community-intro',
    type: 'text',
    title: '社区 - 介绍文字',
    content: '加入我们的社区，与志同道合的朋友交流技术、分享生活。',
    page: 'community',
    section: 'intro',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'communities',
    type: 'array',
    title: '社区 - 社区列表',
    content: JSON.stringify([
      {
        id: 1,
        icon: '💬',
        name: '微信群',
        description: '技术交流群，讨论编程、学习、生活',
        link: '#'
      },
      {
        id: 2,
        icon: '📱',
        name: 'QQ群',
        description: '学习讨论群，分享资源、互相帮助',
        link: '#'
      },
      {
        id: 3,
        icon: '🎮',
        name: 'Discord',
        description: '国际社区，连接全球开发者',
        link: null
      },
      {
        id: 4,
        icon: '📺',
        name: 'Telegram',
        description: '消息群组，快速交流',
        link: null
      }
    ]),
    page: 'community',
    section: 'communities',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'community-stats',
    type: 'array',
    title: '社区 - 统计数据',
    content: JSON.stringify([
      { label: '会员数量', value: '1000+' },
      { label: '群组数量', value: '10+' },
      { label: '每日活跃', value: '50+' },
      { label: '帖子数量', value: '5000+' }
    ]),
    page: 'community',
    section: 'stats',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'community-miya',
    type: 'text',
    title: '社区 - Miya 欢迎语',
    content: '无论你是来学习技术、分享生活，还是只是随便逛逛，Miya 都很欢迎你的到来！在这里，我们共同学习、共同进步、共同成长。',
    page: 'community',
    section: 'miya',
    updatedAt: new Date().toISOString()
  },

  // 文化区页面
  {
    id: 'culture-diary',
    type: 'array',
    title: '文化区 - 日记',
    content: JSON.stringify([
      {
        id: 1,
        date: '2025-12-20',
        weather: '☀️ 晴',
        title: '今天是个好天气',
        content: '阳光明媚，心情也很好。今天学习了 Vue 3 的新特性，感觉收获很大。晚上去吃了火锅，满足！'
      },
      {
        id: 2,
        date: '2025-12-19',
        weather: '🌧️ 雨',
        title: '雨天心情',
        content: '下雨天最适合待在家里写代码了。完成了一个小项目，很有成就感。希望能保持这个状态继续努力。'
      },
      {
        id: 3,
        date: '2025-12-18',
        weather: '❄️ 雪',
        title: '初雪',
        content: '今年的第一场雪！站在窗边看着雪花飘落，感觉世界都安静了。Miya 说要堆个雪人，可惜雪太小了。'
      }
    ]),
    page: 'culture',
    section: 'diary',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'culture-novels',
    type: 'array',
    title: '文化区 - 小说',
    content: JSON.stringify([
      {
        id: 1,
        title: '程序员的奇幻之旅',
        description: '一个程序员在异世界用编程解决问题的故事',
        status: '连载中',
        chapters: 12
      },
      {
        id: 2,
        title: 'Miya 的日记',
        description: '记录 Miya 和伙伴们的日常故事',
        status: '连载中',
        chapters: 24
      }
    ]),
    page: 'culture',
    section: 'novels',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'culture-books',
    type: 'array',
    title: '文化区 - 书单',
    content: JSON.stringify([
      {
        id: 1,
        title: '代码整洁之道',
        author: 'Robert C. Martin',
        review: '程序员必读经典，教你写出优雅的代码。',
        tags: ['编程', '经典', '必读']
      },
      {
        id: 2,
        title: '人月神话',
        author: 'Frederick P. Brooks Jr.',
        review: '软件工程领域的经典著作，对项目管理的深入思考。',
        tags: ['管理', '经典', '软件工程']
      }
    ]),
    page: 'culture',
    section: 'books',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'culture-gallery',
    type: 'array',
    title: '文化区 - 美图',
    content: JSON.stringify([
      {
        id: 1,
        emoji: '🌸',
        title: '春日樱花',
        date: '2025-03-15',
        groupId: 'nature',
        imageUrl: null
      },
      {
        id: 2,
        emoji: '🌊',
        title: '海边日落',
        date: '2025-04-20',
        groupId: 'nature',
        imageUrl: null
      },
      {
        id: 3,
        emoji: '🏔️',
        title: '雪山日出',
        date: '2025-05-10',
        groupId: 'nature',
        imageUrl: null
      }
    ]),
    page: 'culture',
    section: 'gallery',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gallery-groups',
    type: 'array',
    title: '美图分组',
    content: JSON.stringify([
      {
        id: 'nature',
        name: '自然风景',
        emoji: '🌿',
        description: '大自然的美景',
        order: 1
      },
      {
        id: 'cityscape',
        name: '城市风光',
        emoji: '🏙️',
        description: '城市的美丽瞬间',
        order: 2
      },
      {
        id: 'anime',
        name: '动漫二次元',
        emoji: '🎌',
        description: '精美的二次元插画',
        order: 3
      },
      {
        id: 'travel',
        name: '旅行记录',
        emoji: '✈️',
        description: '旅行中的美好回忆',
        order: 4
      }
    ]),
    page: 'culture',
    section: 'gallery',
    updatedAt: new Date().toISOString()
  },

  // 免费资源页面
  {
    id: 'free-resources-intro',
    type: 'text',
    title: '免费资源 - 介绍',
    content: '为爱发电，免费分享优质资源。希望这些资源能够帮助到有需要的人。',
    page: 'free-resources',
    section: 'intro',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'free-resources',
    type: 'array',
    title: '免费资源 - 资源列表',
    content: JSON.stringify([
      {
        id: 1,
        title: 'Linux 常用命令速查表',
        category: '教程文档',
        description: 'Linux 系统常用命令合集，包含详细说明和示例',
        size: '2.5 MB',
        downloads: 1234,
        link: '#'
      },
      {
        id: 2,
        title: 'VS Code 插件推荐配置',
        category: '软件工具',
        description: '前端开发常用的 VS Code 插件和配置文件',
        size: '156 KB',
        downloads: 856,
        link: '#'
      },
      {
        id: 3,
        title: 'Python 数据分析示例代码',
        category: '教程文档',
        description: 'Pandas 和 NumPy 实战示例，可直接运行学习',
        size: '1.2 MB',
        downloads: 678,
        link: '#'
      },
      {
        id: 4,
        title: '机器学习入门数据集',
        category: '数据集',
        description: '包含分类、回归、聚类等多种类型的入门数据集',
        size: '25 MB',
        downloads: 432,
        link: null
      }
    ]),
    page: 'free-resources',
    section: 'resources',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'free-resources-notice',
    type: 'markdown',
    title: '免费资源 - 使用说明',
    content: `- 所有资源仅供学习交流使用，请勿用于商业用途
- 部分资源来源于互联网，版权归原作者所有
- 如有版权问题，请联系删除
- 下载后请及时备份，资源链接可能会失效`,
    page: 'free-resources',
    section: 'notice',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'free-resources-miya',
    type: 'text',
    title: '免费资源 - Miya 寄语',
    content: '"为爱发电，光芒万丈。希望这些资源能够帮助到你！✨"',
    page: 'free-resources',
    section: 'miya',
    updatedAt: new Date().toISOString()
  }
]

/**
 * 初始化默认内容
 */
export function initDefaultContents(): void {
  if (!localStorage.getItem(CONTENT_STORAGE_KEY)) {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(defaultContents))
  }
}

/**
 * 获取所有内容
 */
export function getAllContents(): ContentItem[] {
  initDefaultContents()
  const data = localStorage.getItem(CONTENT_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

/**
 * 保存内容
 */
export function saveContent(content: ContentItem): void {
  const contents = getAllContents()
  const index = contents.findIndex(c => c.id === content.id)

  if (index >= 0) {
    contents[index] = { ...content, updatedAt: new Date().toISOString() }
  } else {
    contents.push({ ...content, updatedAt: new Date().toISOString() })
  }

  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(contents))
}

/**
 * 获取单个内容
 */
export function getContent(id: string): ContentItem | null {
  const contents = getAllContents()
  return contents.find(c => c.id === id) || null
}

/**
 * 删除内容
 */
export function deleteContent(id: string): void {
  const contents = getAllContents()
  const filtered = contents.filter(c => c.id !== id)
  localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * 获取指定页面的所有内容
 */
export function getPageContents(page: string): ContentItem[] {
  const contents = getAllContents()
  return contents.filter(c => c.page === page)
}

/**
 * 获取全局内容
 */
export function getGlobalContents(): ContentItem[] {
  return getPageContents('global')
}

/**
 * 解析内容
 */
export function parseContent(content: ContentItem): any {
  if (content.type === 'array' || content.type === 'object') {
    try {
      return JSON.parse(content.content)
    } catch (e) {
      console.error('解析内容失败:', e)
      return null
    }
  }
  return content.content
}
