// Waline 评论系统配置

export const walineConfig = {
  // Waline 服务器地址
  // 部署完成后，将你的服务器地址填写在这里
  // 示例：
  // - Vercel: 'https://your-waline-app.vercel.app'
  // - 自建: 'https://waline.your-domain.com'
  serverURL: '',

  // 语言
  lang: 'zh-CN',

  // 暗黑模式支持（已在组件中动态切换）
  dark: false,

  // 是否启用搜索
  search: false,

  // 必填项：nick(昵称), mail(邮箱), link(网址)
  requiredMeta: ['nick'],

  // 表情包（微博 + Bilibili）
  emoji: [
    'https://unpkg.com/@waline/emojis@1.2.0/weibo',
    'https://unpkg.com/@waline/emojis@1.2.0/bilibili'
  ],

  // 上传图片功能（false = 禁用）
  imageUploader: false,

  // 自定义文案 - Miya 主题
  locale: {
    admin: 'jiaandmiya',
    placeholder: '欢迎留言！',
    submit: '发送评论',
    sofa: '快来发表评论吧~',
    reaction: '表情',
    emoji: '表情',
    preview: '预览',
    comment: '评论',
    refresh: '刷新',
    more: '加载更多...',
    date: '日期',
    uploaded: '上传中',
    uploading: '上传中...',
    uploadFail: '上传失败',
    waitingReview: '正在审核中',
    reply: '回复',
    floor: '楼',
    replyCount: '条回复',
    nick: '昵称',
    nickError: '昵称不能少于3个字符',
    mail: '邮箱',
    mailError: '请填写正确的邮件地址',
    link: '网址',
    optional: '选填',
    login: '登录',
    logout: '退出',
    submitError: '提交失败',
    again: '再试一次',
    sure: '确定',
    cancel: '取消',
    confirmDelete: '确定要删除这条评论吗？',
    previewPanel: '预览面板',
    editorPanel: '编辑器'
  }
}

// 获取笔记路径（用于区分不同笔记的评论）
export function getNotePath(noteId: string | number): string {
  return `/notes/${noteId}`
}
