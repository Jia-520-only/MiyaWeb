# 🌸 MiyaWeb — 个人创作 & 分享平台

> 基于 Vue 3 + Express + SQLite 的全栈个人网站，集成 CMS 内容管理、OC 社区、创作系统、人文画廊等功能。

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TS">
  <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Express-4.18-000000?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT">
</p>

---

## ✨ 功能特性

### 🏠 前台
| 模块 | 功能 |
|------|------|
| **首页** | Banner 轮播 + Ken Burns 缓动、水波动画、功能卡片、画廊条、滚动透明导航 |
| **技术笔记** | 博客列表、Markdown 渲染、字体缩放、阅读进度、上一篇/下一篇 |
| **创作** | 图书组管理、完整阅读器（目录+进度+字体控制）、导出 EPUB/ZIP/PDF |
| **OC 社区** | 原创角色展示、文章/图廊双标签、全站 OC 图墙瀑布流 |
| **人文** | 美图瀑布流画廊（灯箱）、日记、书单、视听分享，创作联动 |
| **免费资源** | 封面大卡 + 分类筛选 + 详情页 |
| **关于** | 自定义卡片式 Markdown 编辑 |

### 🎨 视觉体验
- **OKLCH 单 hue 配色** — 改一个值全站换肤，色调选择器实时调节
- **玻璃拟态** — backdrop-blur 卡片系统，暗色清晰、亮色通透
- **粒子背景** — 暗色萤火虫/星光，亮色樱花/星光
- **点击涟漪** — Canvas 光环扩散
- **启动闪屏** — 首次访问系统初始化动画
- **水波 SVG** — Banner 底部三层浮动波浪
- **卡片光斑** — hover 浮现模糊彩色光晕

### 🛠 CMS 管理后台
| 功能 | 说明 |
|------|------|
| **内容创作** | 集合 → 条目 → 文章，三步创建，Markdown/TXT 编辑器 |
| **OC 图片管理** | 上传 + 分发 + 图廊预览 |
| **资源中心** | 图片上传/分发，支持 14 种分发目标，批量分发 |
| **首页卡片** | 6 张功能卡封面独立设置 |
| **Banner/侧栏图/背景图** | 独立图池，资源中心一键分发 |
| **侧栏链接/公告** | 自定义推荐链接 + 网站公告编辑 |
| **关于页面** | 自由增删卡片，标题 + Markdown |

---

## 📦 技术栈

| 层 | 技术 |
|----|------|
| **前端** | Vue 3 (Composition API) · TypeScript · Tailwind CSS 3 · Vite 7 · Pinia · Vue Router 5 |
| **编辑器** | Tiptap (富文本) · Marked (Markdown 渲染) |
| **图标** | @iconify/vue (Solar 图标集) |
| **后端** | Express 4 · SQLite3 (WAL 模式, 19 张表) · JWT 认证 · bcryptjs |
| **文件** | Multer · Sharp (缩略图/压缩) |
| **安全** | Helmet · express-rate-limit · CORS |
| **导出** | archiver (ZIP) · epub-gen-memory · adm-zip |
| **进程** | PM2 (cluster 模式) |

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 1. 克隆 & 安装

```bash
git clone https://github.com/Jia-520-only/MiyaWeb.git
cd MiyaWeb

# 前端
npm install

# 后端
cd server
npm install
cd ..
```

### 2. 配置环境变量

```bash
# 后端配置
cp server/.env.example server/.env
# 编辑 server/.env — 修改 JWT_SECRET 和 ADMIN_PASSWORD
```

### 3. 启动开发环境

```bash
# 终端 1：启动后端 (localhost:3000)
cd server && node index.js

# 终端 2：启动前端 (localhost:5173)
npm run dev
```

### 4. 初始管理员

首次启动自动创建：
- 用户名：`admin`
- 密码：`.env` 中 `ADMIN_PASSWORD` 的值（默认 `admin123`）

---

## 📁 项目结构

```
├── src/                    # 前端源码
│   ├── views/              # 页面 (20+)
│   ├── components/         # 组件
│   │   ├── ui/             # 基础组件 (GlassCard, Button, Icon)
│   │   ├── cms/            # CMS 面板 (资源管理, 侧栏图, Banner...)
│   │   └── layout/         # 布局 (Header, Footer, Sidebar)
│   ├── stores/             # Pinia 状态 (auth, theme, readerState)
│   ├── utils/              # API 客户端、工具函数
│   └── config/             # 站点配置
│
├── server/                 # 后端源码
│   ├── index.js            # Express 入口
│   ├── routes/             # API 路由 (15 个模块)
│   ├── database/           # SQLite 数据库 & 迁移
│   ├── utils/              # JWT, 文件上传, 媒体监视器
│   └── uploads/            # 上传文件目录
│
├── public/                 # 静态资源
├── dist/                   # 构建输出
└── content/                # 自动导入目录 (丢文件即导入)
```

---

## 🏗 生产部署

### 构建前端

```bash
npm run build    # 输出到 dist/
```

### PM2 启动后端

```bash
cd server
pm2 start ecosystem.config.js
pm2 save
```

### Nginx 配置要点

```nginx
# Vue Router History 模式
location / {
    try_files $uri $uri/ /index.html;
}

# API 反向代理
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# 静态资源缓存
location ~* \.(js|css|png|jpg|gif|ico|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔐 权限体系

| 角色 | 权限 |
|------|------|
| `admin` | 全部权限 + 用户管理 |
| `editor` | 编辑内容、上传文件、CMS 管理 |
| `user` | 浏览、收藏、评论 |

---

## 📡 API 概览

| 路径 | 说明 |
|------|------|
| `/api/auth` | 注册/登录/Token |
| `/api/collections` | 集合管理 (图书组/OC 组/博客) |
| `/api/items` | 条目/卷/章/文章 CRUD |
| `/api/content` | 页面可编辑内容 |
| `/api/upload` | 文件上传/管理 |
| `/api/sidebar-images` | 侧栏图/Banner 图池 |
| `/api/banner-images` | Banner 轮播图池 |
| `/api/oc-images` | OC 图片关联 |
| `/api/sidebar-links` | 推荐链接管理 |
| `/api/resources` | 免费资源链接 |
| `/api/analytics` | 访问统计 |
| `/api/health` | 健康检查 |

---

## 📄 开源协议

MIT License © jiaandmiya

---

## 💡 灵感来源

本项目设计语言受到 [Firefly](https://github.com/CuteLeaf/Firefly)、[Mizuki](https://github.com/LyraVoid/Mizuki)、[XingHuiSamaBlogs](https://github.com/XingHuiSama/XingHuiSamaBlogs) 启发，在此致谢。
