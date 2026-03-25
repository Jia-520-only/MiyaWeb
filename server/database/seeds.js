const bcrypt = require('bcryptjs');
const { dbRun } = require('./db');

// 创建默认管理员账户
const createDefaultAdmin = async () => {
  try {
    // 检查是否已有管理员
    const adminCheck = await require('./db').dbGet('SELECT id FROM users WHERE username = ?', ['admin']);
    
    if (adminCheck) {
      console.log('✅ 管理员账户已存在');
      await seedDefaultContent();
      return;
    }
    
    // 从环境变量获取管理员凭据
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jiaandmiya.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    
    // 插入管理员账户
    await dbRun(
      `INSERT INTO users (username, email, password_hash, role, display_name, is_active) 
       VALUES (?, ?, ?, 'admin', ?, 1)`,
      [adminUsername, adminEmail, passwordHash, '网站管理员']
    );
    
    console.log(`✅ 已创建默认管理员账户`);
    console.log(`👤 用户名: ${adminUsername}`);
    console.log(`📧 邮箱: ${adminEmail}`);
    console.log(`🔑 密码: ${adminPassword}`);
    console.log('⚠️  请立即修改默认密码！');
    
    // 创建默认分类
    const defaultCategories = [
      ['技术笔记', 'notes', '技术相关的笔记和教程', '💻'],
      ['文章分享', 'articles', '深度文章和思考', '📚'],
      ['文化区', 'culture', '生活日记、小说和书单', '🎨'],
      ['免费资源', 'free-resources', '免费分享的资源', '🎁'],
      ['社区动态', 'community', '社区活动和讨论', '👥']
    ];
    
    for (const [name, slug, description, icon] of defaultCategories) {
      await dbRun(
        `INSERT INTO categories (name, slug, description, icon, is_active) 
         VALUES (?, ?, ?, ?, 1)`,
        [name, slug, description, icon]
      );
    }
    
    console.log('✅ 已创建默认文章分类');
    
    // 种入默认页面内容
    await seedDefaultContent();
    
  } catch (error) {
    console.error('❌ 创建默认数据失败:', error);
    throw error;
  }
};

// 初始化默认内容项（页面内容）
const seedDefaultContent = async () => {
  try {
    const defaultContents = [
      {
        id: 'about-profile',
        type: 'markdown',
        title: '个人介绍',
        page: 'about',
        section: 'profile',
        sort_order: 1,
        content: `# 关于我

## 个人简介

我是一名热爱技术的开发者，专注于前端开发和用户体验设计。

## 技术栈

- **前端框架**: Vue 3, React
- **构建工具**: Vite, Webpack
- **样式方案**: Tailwind CSS, CSS-in-JS
- **开发语言**: TypeScript, JavaScript

## 联系方式

- Email: 1523878699@qqq.com
- GitHub: @yourusername
- 微博: @yourusername`
      },
      {
        id: 'about-website',
        type: 'markdown',
        title: '关于网站',
        page: 'about',
        section: 'website',
        sort_order: 2,
        content: `# 网站理念

打造一个简洁、优雅的个人空间，分享技术见解和个人思考。

## 技术栈

- Vue 3.5 + TypeScript
- Vite + Tailwind CSS
- Pinia 状态管理
- Node.js + Express
- SQLite 数据库

## 联系方式

- GitHub: jiaandmiya
- Email: hello@jiaandmiya.com

## 网站定位

**简约 · 技术 · 二次元 · 社区**

一个以技术为核心，融合二次元文化和社区互动的个人分享平台`
      },
      {
        id: 'about-miya',
        type: 'markdown',
        title: '关于 Miya',
        page: 'about-miya',
        section: 'main',
        sort_order: 1,
        content: `# 关于 Miya

Miya 是这个网站的智能助手和虚拟角色。她不仅是一个 AI，更是这个空间的灵魂和陪伴者。

在这里，Miya 会：

- ✦ 为你提供技术建议和学习指导
- ✦ 陪伴你探索伴侣社区，创造属于你们的AI故事
- ✦ 在文化区与你一起分享生活感悟和创作灵感

Miya 不仅仅是一个工具，她是这个社区的一部分，是每个人都可以与之互动的伙伴。

## 角色介绍

Miya 是网站中的虚拟角色，陪伴大家一起探索技术的世界。

## 喜好

- ☕ 喜欢喝椰奶
- 📚 热爱阅读
- 💻 对编程充满热情`
      },
      {
        id: 'about-stats',
        type: 'markdown',
        title: '统计数据',
        page: 'about',
        section: 'stats',
        sort_order: 3,
        content: `| 指标 | 数量 |
|------|------|
| 技术笔记 | 50+ |
| 文化内容 | 100+ |
| AI 伴侣 | 20+ |
| 社区互动 | 1000+ |`
      }
    ];

    for (const item of defaultContents) {
      const existing = await require('./db').dbGet('SELECT id FROM content_items WHERE id = ?', [item.id]);
      if (!existing) {
        await dbRun(
          `INSERT INTO content_items (id, type, title, content, page, section, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [item.id, item.type, item.title, item.content, item.page, item.section, item.sort_order]
        );
      }
    }
    // 文化区种子数据
    const cultureContents = [
      // 日记
      {
        id: 'culture-diary',
        type: 'array',
        title: '文化区 - 日记',
        page: 'culture',
        section: 'diary',
        sort_order: 1,
        content: JSON.stringify([
          { id: 1, date: '2025-12-20', weather: '☀️ 晴', title: '新项目启动的第一天', content: '今天正式开始了 jiaandmiya 网站的项目搭建。选择 Vue 3 + Tailwind CSS 的技术栈，希望能够打造一个简约而有温度的个人网站。Miya 也说要好好当管家呢！' },
          { id: 2, date: '2025-12-18', weather: '🌧️ 小雨', title: '雨天的思考', content: '下雨天适合思考。在想技术笔记的内容规划，希望能分享一些真正有用的知识。从 Linux 开始吧，这是我最熟悉的技术领域。' },
          { id: 3, date: '2025-12-15', weather: '⛅ 多云', title: '初雪', content: '今年冬天的第一场雪终于来了。站在窗前看着雪花飘落，突然觉得应该把这些美好的瞬间记录下来。于是决定在文化区里增加日记功能。' }
        ])
      },
      // 小说
      {
        id: 'culture-novels',
        type: 'array',
        title: '文化区 - 小说',
        page: 'culture',
        section: 'novels',
        sort_order: 2,
        content: JSON.stringify([
          { id: 1, title: '星辰大海的约定', description: '一段跨越星际的冒险故事，讲述少年追寻梦想的旅程。', status: '连载中', chapters: 12 },
          { id: 2, title: '代码与咖啡', description: '程序员的日常故事，温暖治愈的职场轻小说。', status: '已完成', chapters: 24 }
        ])
      },
      // 书单
      {
        id: 'culture-books',
        type: 'array',
        title: '文化区 - 书单',
        page: 'culture',
        section: 'books',
        sort_order: 3,
        content: JSON.stringify([
          { id: 1, title: '黑客与画家', author: 'Paul Graham', review: '关于创造力、编程和创业的经典之作，值得反复阅读。', tags: ['技术', '随笔'] },
          { id: 2, title: '深度学习', author: 'Ian Goodfellow', review: 'AI 领域的圣经，系统性强，适合深入学习。', tags: ['AI', '教程'] }
        ])
      },
      // 美图分组
      {
        id: 'gallery-groups',
        type: 'array',
        title: '美图分组',
        page: 'culture',
        section: 'gallery-groups',
        sort_order: 4,
        content: JSON.stringify([
          { id: 'nature', name: '自然风景', emoji: '🌿', description: '大自然的美景', order: 1 },
          { id: 'cityscape', name: '城市风光', emoji: '🏙️', description: '城市的美丽瞬间', order: 2 },
          { id: 'anime', name: '动漫二次元', emoji: '🎌', description: '精美的二次元插画', order: 3 },
          { id: 'travel', name: '旅行记录', emoji: '✈️', description: '旅行中的美好回忆', order: 4 }
        ])
      },
      // 美图数据
      {
        id: 'culture-gallery',
        type: 'array',
        title: '文化区 - 美图',
        page: 'culture',
        section: 'gallery',
        sort_order: 5,
        content: JSON.stringify([
          { id: 1, emoji: '🌅', title: '清晨的阳光', date: '2025-12-01', groupId: 'nature', imageUrl: null },
          { id: 2, emoji: '🌸', title: '春日樱花', date: '2025-03-15', groupId: 'nature', imageUrl: null },
          { id: 3, emoji: '🏔️', title: '雪山风光', date: '2025-01-20', groupId: 'nature', imageUrl: null },
          { id: 4, emoji: '🌊', title: '海边日落', date: '2025-07-10', groupId: 'cityscape', imageUrl: null },
          { id: 5, emoji: '🌌', title: '星空下的思考', date: '2025-08-05', groupId: 'nature', imageUrl: null },
          { id: 6, emoji: '🍂', title: '秋叶', date: '2025-10-20', groupId: 'nature', imageUrl: null }
        ])
      },
      // 电影
      {
        id: 'culture-movies',
        type: 'array',
        title: '文化区 - 电影',
        page: 'culture',
        section: 'movies',
        sort_order: 6,
        content: JSON.stringify([
          { id: 1, title: '星际穿越', year: 2014, director: '克里斯托弗·诺兰', rating: 9.3, genre: '科幻', review: '一部关于爱、时间和探索的史诗巨作。视觉震撼，情感深刻。', tags: ['科幻', '经典', '诺兰'] },
          { id: 2, title: '千与千寻', year: 2001, director: '宫崎骏', rating: 9.4, genre: '动画', review: '宫崎骏的巅峰之作，充满想象力的奇幻冒险。', tags: ['动画', '奇幻', '治愈'] },
          { id: 3, title: '肖申克的救赎', year: 1994, director: '弗兰克·德拉邦特', rating: 9.7, genre: '剧情', review: '关于希望、自由和友谊的不朽经典。', tags: ['剧情', '励志', '经典'] },
          { id: 4, title: '霸王别姬', year: 1993, director: '陈凯歌', rating: 9.6, genre: '剧情', review: '华语电影的巅峰之作，深刻展现人性和历史。', tags: ['剧情', '文艺', '经典'] }
        ])
      },
      // 音乐
      {
        id: 'culture-music',
        type: 'array',
        title: '文化区 - 音乐',
        page: 'culture',
        section: 'music',
        sort_order: 7,
        content: JSON.stringify([
          { id: 1, title: 'Lemon Tree', artist: "Fool's Garden", genre: '流行', duration: '3:12', review: '一首轻快的德国民谣流行歌曲，旋律朗朗上口，歌词充满诗意。', tags: ['流行', '经典', '治愈'] },
          { id: 2, title: 'Bohemian Rhapsody', artist: 'Queen', genre: '摇滚', duration: '5:55', review: 'Queen乐队的代表作，融合了歌剧、硬摇滚和流行乐的杰作。', tags: ['摇滚', '经典', 'Queen'] },
          { id: 3, title: '晴天', artist: '周杰伦', genre: '流行', duration: '4:29', review: '周杰伦的经典情歌，充满青春回忆的旋律。', tags: ['华语流行', '经典', '周杰伦'] },
          { id: 4, title: '夜空中最亮的星', artist: '逃跑计划', genre: '摇滚', duration: '4:08', review: '充满希望和力量的歌曲，激励着每一个追梦的人。', tags: ['华语摇滚', '励志', '经典'] }
        ])
      }
    ];

    for (const item of cultureContents) {
      const existing = await require('./db').dbGet('SELECT id FROM content_items WHERE id = ?', [item.id]);
      if (!existing) {
        await dbRun(
          `INSERT INTO content_items (id, type, title, content, page, section, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [item.id, item.type, item.title, item.content, item.page, item.section, item.sort_order]
        );
      }
    }

    console.log('✅ 已导入默认页面内容');
  } catch (error) {
    console.warn('⚠️ 导入默认内容失败:', error.message);
  }
};

module.exports = {
  createDefaultAdmin,
  seedDefaultContent
};