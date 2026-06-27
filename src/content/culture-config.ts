export const cultureConfig = {
  tabs: [
    { id: 'diary', name: '日记' },
    { id: 'novel', name: '小说' },
    { id: 'books', name: '书单' },
    { id: 'gallery', name: '美图库' },
    { id: 'audiovisual', name: '视听分享' }
  ],
  diaryEntries: [
    {
      id: 1,
      date: '2025-12-20',
      weather: '☀️ 晴',
      title: '新项目启动的第一天',
      content: '今天正式开始了 jiaandmiya 网站的项目搭建。选择 Vue 3 + Tailwind CSS 的技术栈，希望能够打造一个简约而有温度的个人网站。Miya 也说要好好当管家呢！'
    },
    {
      id: 2,
      date: '2025-12-18',
      weather: '🌧️ 小雨',
      title: '雨天的思考',
      content: '下雨天适合思考。在想技术笔记的内容规划，希望能分享一些真正有用的知识。从 Linux 开始吧，这是我最熟悉的技术领域。'
    }
  ],
  novels: [
    {
      id: 1,
      title: '星辰大海的约定',
      description: '一段跨越星际的冒险故事，讲述少年追寻梦想的旅程。',
      status: '连载中',
      chapters: 12
    },
    {
      id: 2,
      title: '代码与咖啡',
      description: '程序员的日常故事，温暖治愈的职场轻小说。',
      status: '已完成',
      chapters: 24
    }
  ],
  books: [
    {
      id: 1,
      title: '黑客与画家',
      author: 'Paul Graham',
      review: '关于创造力、编程和创业的经典之作，值得反复阅读。',
      tags: ['技术', '随笔']
    },
    {
      id: 2,
      title: '深度学习',
      author: 'Ian Goodfellow',
      review: 'AI 领域的圣经，系统性强，适合深入学习。',
      tags: ['AI', '教程']
    }
  ],
  gallery: [
    { id: 1, emoji: '🌅', title: '清晨的阳光', date: '2025-12-01' },
    { id: 2, emoji: '🌸', title: '春日樱花', date: '2025-03-15' },
    { id: 3, emoji: '🏔️', title: '雪山风光', date: '2025-01-20' },
    { id: 4, emoji: '🌊', title: '海边日落', date: '2025-07-10' },
    { id: 5, emoji: '🌌', title: '星空下的思考', date: '2025-08-05' },
    { id: 6, emoji: '🍂', title: '秋叶', date: '2025-10-20' }
  ],
  movies: [
    {
      id: 1,
      title: '星际穿越',
      year: 2014,
      director: '克里斯托弗·诺兰',
      rating: 9.3,
      genre: '科幻',
      review: '一部关于爱、时间和探索的史诗巨作。视觉震撼,情感深刻。',
      tags: ['科幻', '经典', '诺兰']
    },
    {
      id: 2,
      title: '千与千寻',
      year: 2001,
      director: '宫崎骏',
      rating: 9.4,
      genre: '动画',
      review: '宫崎骏的巅峰之作,充满想象力的奇幻冒险。',
      tags: ['动画', '奇幻', '治愈']
    },
    {
      id: 3,
      title: '肖申克的救赎',
      year: 1994,
      director: '弗兰克·德拉邦特',
      rating: 9.7,
      genre: '剧情',
      review: '关于希望、自由和友谊的不朽经典。',
      tags: ['剧情', '励志', '经典']
    },
    {
      id: 4,
      title: '盗梦空间',
      year: 2010,
      director: '克里斯托弗·诺兰',
      rating: 9.2,
      genre: '科幻',
      review: '层层梦境,烧脑神作,诺兰的又一力作。',
      tags: ['科幻', '悬疑', '诺兰']
    },
    {
      id: 5,
      title: '霸王别姬',
      year: 1993,
      director: '陈凯歌',
      rating: 9.6,
      genre: '剧情',
      review: '华语电影的巅峰之作,深刻展现人性和历史。',
      tags: ['剧情', '文艺', '经典']
    },
    {
      id: 6,
      title: '疯狂动物城',
      year: 2016,
      director: '拜伦·霍华德',
      rating: 9.1,
      genre: '动画',
      review: '表面是动物世界,实则是现实社会的隐喻。',
      tags: ['动画', '喜剧', '深度']
    }
  ],
  music: [
    {
      id: 1,
      title: 'Lemon Tree',
      artist: 'Fool\'s Garden',
      genre: '流行',
      duration: '3:12',
      review: '一首轻快的德国民谣流行歌曲，旋律朗朗上口，歌词充满诗意。',
      tags: ['流行', '经典', '治愈']
    },
    {
      id: 2,
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      genre: '摇滚',
      duration: '5:55',
      review: 'Queen乐队的代表作，融合了歌剧、硬摇滚和流行乐的杰作。',
      tags: ['摇滚', '经典', 'Queen']
    },
    {
      id: 3,
      title: 'River Flows in You',
      artist: 'Yiruma',
      genre: '钢琴曲',
      duration: '3:37',
      review: '韩国钢琴家Yiruma的代表作品，温柔浪漫的旋律让人沉醉。',
      tags: ['钢琴', '轻音乐', '治愈']
    },
    {
      id: 4,
      title: '晴天',
      artist: '周杰伦',
      genre: '流行',
      duration: '4:29',
      review: '周杰伦的经典情歌，充满青春回忆的旋律。',
      tags: ['华语流行', '经典', '周杰伦']
    },
    {
      id: 5,
      title: 'Hotel California',
      artist: 'Eagles',
      genre: '摇滚',
      duration: '6:30',
      review: '老鹰乐队的传奇作品，吉他独奏堪称经典。',
      tags: ['摇滚', '经典', 'Eagles']
    },
    {
      id: 6,
      title: '夜空中最亮的星',
      artist: '逃跑计划',
      genre: '摇滚',
      duration: '4:08',
      review: '充满希望和力量的歌曲，激励着每一个追梦的人。',
      tags: ['华语摇滚', '励志', '经典']
    }
  ]
};
