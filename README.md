# jiaandmiya.com - 个人分享平台

> **简约 · 技术 · 二次元 · 社区**

一个基于 Vue 3 + Express + SQLite 的全栈个人网站，集成 CMS 内容管理、AI 伴侣社区、图书管理系统、文化区等功能模块。

- **域名**: jiaandmiya.com
- **备案号**: 黔ICP备2026003662号-1
- **许可证**: MIT

---

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [生产部署](#生产部署)
  - [快速部署（推荐）](#快速部署推荐)
  - [手动部署](#手动部署)
  - [Nginx 配置](#nginx-配置)
  - [PM2 进程管理](#pm2-进程管理)
- [环境变量配置](#环境变量配置)
- [数据库](#数据库)
- [API 接口](#api-接口)
- [用户权限体系](#用户权限体系)
- [安全注意事项](#安全注意事项)

---

## 功能特性

### 前台功能
| 模块 | 功能 |
|------|------|
| **首页** | 特性展示、最新动态、快速导航 |
| **图书馆** | 图书组/伴侣组浏览、图书详情、卷/章节/文章目录、Markdown/TXT 阅读器 |
| **伴侣社区** | AI 伴侣创建/编辑、幻想书创作（章节管理）、对话记录、收藏 |
| **文化区** | 日记、小说、书单、美图画廊（分组管理+图片上传）、视听分享（电影+音乐） |
| **免费资源** | 分类资源分享、链接管理 |
| **关于页面** | 个人介绍、网站信息、Miya 介绍，CMS 可编辑 |
| **深色模式** | Tailwind CSS `class` 策略，一键切换 |

### 后台管理（CMS）
| 功能 | 说明 |
|------|------|
| **图书组管理** | 创建/编辑/删除图书组和伴侣组 |
| **内容项管理** | 目录结构（卷→章节→文章）CRUD |
| **在线编辑器** | Markdown/TXT 编辑、富文本 WYSIWYG（Tiptap）、图片粘贴上传 |
| **书籍导出** | ZIP（Markdown/TXT）、EPUB、PDF（浏览器打印） |
| **EPUB 导入** | 上传 .epub 文件自动解析为章节结构 |
| **页面内容管理** | 关于页面、文化区等所有页面内容，通过"页面"Tab 统一管理 |
| **图片管理器** | 已上传图片的选择和插入 |
| **导航管理** | 导航项排序、显示/隐藏 |
| **用户管理** | 管理员可创建/编辑/删除用户 |

### 编辑器增强
- **粘贴图片上传**: Ctrl+V 粘贴截图自动上传
- **文件导入**: 导入 .md / .txt 文件
- **文件导出**: 导出为 .md / .txt
- **整书 ZIP 导出**: 包含完整目录结构（卷/章节/文章）
- **EPUB 导出**: 生成标准 EPUB 电子书
- **PDF 导出**: 生成可打印 HTML，浏览器 Ctrl+P 另存 PDF

---

## 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 前端框架（Composition API） |
| TypeScript | ~5.9 | 类型安全 |
| Vite | ^7.3 | 构建工具 |
| Vue Router | ^5.0 | SPA 路由 |
| Pinia | ^3.0 | 状态管理 |
| Tailwind CSS | ^3.4 | 样式框架 |
| Tiptap | ^3.20 | 富文本编辑器 |
| Marked | ^17.0 | Markdown 渲染 |
| @iconify/vue | ^5.0 | 图标库 |
| archiver / epub-gen-memory / adm-zip | - | 书籍导出 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >=18 | 运行时 |
| Express | ^4.18 | Web 框架 |
| SQLite3 | ^6.0 | 数据库 |
| JWT (jsonwebtoken) | ^9.0 | 认证 |
| bcryptjs | ^2.4 | 密码加密 |
| Multer | ^1.4 | 文件上传 |
| Sharp | ^0.33 | 图片处理（缩略图/压缩） |
| express-rate-limit | ^7.1 | 速率限制 |
| CORS | ^2.8 | 跨域支持 |
| dotenv | ^16.3 | 环境变量 |

---

## 项目结构

```
jiaandmiya.com/
├── index.html                      # SPA 入口 HTML
├── package.json                    # 前端依赖和脚本
├── vite.config.ts                  # Vite 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── postcss.config.js               # PostCSS 配置
├── tsconfig.json                   # TypeScript 主配置
├── .env.example                    # 前端环境变量模板
│
├── public/                         # 静态资源
│   ├── favicon.ico
│   └── beian-icon.png
│
├── dist/                           # 前端构建输出（npm run build 生成）
│
├── src/                            # 前端源码
│   ├── main.ts                     # 应用入口
│   ├── App.vue                     # 根组件
│   ├── router/index.ts             # 路由配置
│   ├── stores/                     # Pinia 状态
│   │   ├── auth.ts                 # 认证状态
│   │   ├── chat.ts                 # AI 聊天状态
│   │   └── theme.ts                # 主题（暗色模式）
│   ├── views/                      # 页面视图（17个）
│   │   ├── HomeView.vue            # 首页
│   │   ├── LibraryView.vue         # 图书馆
│   │   ├── LibraryCollectionView.vue
│   │   ├── LibraryItemView.vue     # 图书详情/阅读器
│   │   ├── CompanionsView.vue      # 伴侣社区
│   │   ├── CompanionDetailView.vue
│   │   ├── CultureView.vue         # 文化区（5个Tab）
│   │   ├── ResourcesView.vue       # 免费资源
│   │   ├── AboutView.vue           # 关于
│   │   ├── CMSView.vue             # CMS 管理面板
│   │   ├── EditorView.vue          # 编辑器
│   │   └── ...
│   ├── components/                 # 组件
│   │   ├── ui/                     # 基础 UI（GlassCard, Icon, Button）
│   │   ├── cms/                    # CMS 子组件
│   │   └── TextEditor.vue          # 通用文本编辑器
│   ├── utils/
│   │   └── apiClient.ts            # 后端 API 客户端
│   ├── config/waline.ts            # Waline 评论配置
│   └── content/                    # 静态内容（Markdown, 配置）
│
├── server/                         # 后端源码
│   ├── package.json                # 后端依赖（独立）
│   ├── index.js                    # 服务器入口
│   ├── .env.example                # 后端环境变量模板
│   ├── ecosystem.config.js         # PM2 配置
│   ├── install.sh                  # 一键安装脚本
│   ├── database/
│   │   ├── db.js                   # SQLite 连接池
│   │   ├── migrations.js           # 数据库迁移（7张表）
│   │   ├── schema-cms.js           # CMS 表结构（8张表）
│   │   ├── schema-companions.js    # 伴侣表结构（4张表）
│   │   ├── seeds.js                # 种子数据（管理员+分类+内容）
│   │   └── jiaandmiya.db           # SQLite 数据库文件
│   ├── routes/                     # API 路由（11个模块）
│   │   ├── auth.js                 # /api/auth
│   │   ├── articles.js             # /api/articles
│   │   ├── content.js              # /api/content
│   │   ├── users.js                # /api/users
│   │   ├── upload.js               # /api/upload
│   │   ├── companions.js           # /api/companions
│   │   ├── collections.js          # /api/collections
│   │   ├── items.js                # /api/items
│   │   ├── navigation.js           # /api/navigation
│   │   ├── resources.js            # /api/resources
│   │   └── profiles.js             # /api/profiles
│   ├── utils/
│   │   ├── jwt.js                  # JWT 签发/验证
│   │   ├── fileUpload.js           # 文件上传/图片处理
│   │   └── validation.js           # 输入验证
│   └── uploads/                    # 上传文件目录
│       └── thumbnails/             # 缩略图目录
│
└── deploy-bt.sh                    # 宝塔面板部署脚本
```

---

## 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | >=18.0 | 20.x LTS |
| npm | >=8.0 | 10.x |
| SQLite3 | - | 系统自带 |
| Nginx | - | 最新稳定版 |
| PM2 | - | 全局安装 (`npm i -g pm2`) |

> **服务器推荐配置**: 1核2G 及以上云服务器（腾讯云/阿里云等），Ubuntu 22.04 / CentOS 8+

---

## 本地开发

### 1. 克隆项目

```bash
git clone <你的仓库地址> jiaandmiya.com
cd jiaandmiya.com
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 安装后端依赖

```bash
cd server
npm install
cd ..
```

### 4. 配置环境变量

```bash
# 前端
cp .env.example .env

# 后端
cp server/.env.example server/.env
# 编辑 server/.env 修改 JWT_SECRET、ADMIN_PASSWORD 等
```

### 5. 启动后端服务

```bash
cd server
node index.js
# 或使用 nodemon 开发模式
npm run dev
```

后端默认运行在 `http://localhost:3000`

### 6. 启动前端开发服务器

```bash
# 在项目根目录
npm run dev
```

前端默认运行在 `http://localhost:5173`

### 7. 访问

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000/api
- 默认管理员: 用户名 `admin`，密码见 `server/.env` 中的 `ADMIN_PASSWORD`（默认 `admin123`）

---

## 生产部署

### 快速部署（推荐）

项目提供了自动化安装脚本和宝塔部署脚本。

#### 方法一：一键安装脚本

```bash
# 在服务器上
cd /www/wwwroot/jiaandmiya.com
cd server
chmod +x install.sh
./install.sh
```

脚本会自动：
1. 检查 Node.js 版本（>=18）
2. 创建 `.env` 文件并生成随机 JWT_SECRET 和管理员密码
3. 安装后端依赖
4. 初始化数据库并创建管理员
5. 配置 PM2 并启动服务

#### 方法二：宝塔面板部署

```bash
# 本地构建并部署
./deploy-bt.sh <服务器IP> <域名>
```

### 手动部署

#### 第一步：上传代码

```bash
# 在服务器上
mkdir -p /www/wwwroot/jiaandmiya.com
cd /www/wwwroot/jiaandmiya.com

# 通过 git 或 scp 上传代码
git clone <仓库地址> .
```

#### 第二步：配置后端环境

```bash
cd /www/wwwroot/jiaandmiya.com/server

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
vi .env  # 编辑以下关键配置：
```

**必须修改的配置**：
```env
# 生产环境
NODE_ENV=production

# JWT 密钥（务必修改为随机长字符串！）
JWT_SECRET=你的随机密钥至少32位

# 管理员密码（务必修改！）
ADMIN_PASSWORD=你的强密码

# CORS 允许的前端域名
CORS_ORIGIN=https://jiaandmiya.com

# 数据库路径
DATABASE_PATH=/www/wwwroot/jiaandmiya.com/server/database/jiaandmiya.db

# 上传目录
UPLOAD_DIR=/www/wwwroot/jiaandmiya.com/server/uploads
```

#### 第三步：初始化数据库

```bash
# 首次启动会自动创建数据库、运行迁移、导入种子数据
node index.js
# 看到 "✅ 已创建默认管理员账户" 即成功
# Ctrl+C 停止
```

#### 第四步：构建前端

```bash
# 回到项目根目录
cd /www/wwwroot/jiaandmiya.com

# 安装前端依赖
npm install

# 构建生产版本
npm run build
# 输出到 dist/ 目录
```

#### 第五步：配置 Nginx

```bash
# 创建 Nginx 站点配置
sudo vi /etc/nginx/sites-available/jiaandmiya.com
```

写入以下内容（参考 [Nginx 配置](#nginx-配置) 章节）：

```nginx
server {
    listen 80;
    server_name jiaandmiya.com www.jiaandmiya.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name jiaandmiya.com www.jiaandmiya.com;

    # SSL 证书（宝塔面板可自动配置）
    ssl_certificate     /www/server/ssl/jiaandmiya.com/fullchain.pem;
    ssl_certificate_key /www/server/ssl/jiaandmiya.com/privkey.pem;

    # 前端静态文件
    root /www/wwwroot/jiaandmiya.com/dist;
    index index.html;

    # Vue Router History 模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 上传文件代理
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_cache_valid 200 30d;
        expires 30d;
    }

    # 上传大小限制
    client_max_body_size 50m;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 禁止访问敏感文件
    location ~ /\. {
        deny all;
    }
    location ~ \.(log|sql|bak|tar\.gz)$ {
        deny all;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # 备案号
    location = /beian {
        return 200 '';
    }
}
```

```bash
# 测试配置
sudo nginx -t

# 启用站点
sudo ln -s /etc/nginx/sites-available/jiaandmiya.com /etc/nginx/sites-enabled/
sudo nginx -s reload
```

#### 第六步：启动后端（PM2）

```bash
cd /www/wwwroot/jiaandmiya.com/server

# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs jiaandmiya-api

# 设置开机自启
pm2 save
pm2 startup
```

### Nginx 配置

#### 关键配置说明

| 配置项 | 说明 |
|--------|------|
| `try_files $uri $uri/ /index.html` | Vue Router History 模式，所有未匹配路径回退到 index.html |
| `proxy_pass http://127.0.0.1:3000` | API 反向代理到后端 |
| `client_max_body_size 50m` | 允许最大 50MB 上传（EPUB 文件等） |
| `expires 1y` + `immutable` | Vite 构建的静态资源带 hash，可长期缓存 |
| `gzip on` | 启用 Gzip 压缩减少传输体积 |

#### 多域名配置

如果需要 `www.jiaandmiya.com` 和 `jiaandmiya.com` 统一访问：

```nginx
server {
    listen 80;
    server_name jiaandmiya.com www.jiaandmiya.com;
    return 301 https://jiaandmiya.com$request_uri;
}
```

### PM2 进程管理

项目提供了 `server/ecosystem.config.js` 配置文件：

```javascript
{
  apps: [{
    name: 'jiaandmiya-api',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

**常用命令**：

```bash
pm2 start ecosystem.config.js   # 启动
pm2 stop jiaandmiya-api          # 停止
pm2 restart jiaandmiya-api       # 重启
pm2 reload jiaandmiya-api        # 平滑重载
pm2 logs jiaandmiya-api          # 查看日志
pm2 monit                        # 实时监控
pm2 save                         # 保存当前进程列表
pm2 startup                      # 设置开机自启
```

---

## 环境变量配置

### 前端 `.env`

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3000/api` |
| `VITE_AI_API_KEY` | AI API Key（可选） | - |
| `VITE_AI_API_ENDPOINT` | AI API 端点（可选） | `https://api.openai.com/v1/chat/completions` |
| `VITE_AI_MODEL` | AI 模型名称（可选） | `gpt-3.5-turbo` |

> **生产环境注意**: `VITE_API_BASE_URL` 应改为 `/api`（通过 Nginx 反向代理），无需暴露后端端口。

### 后端 `server/.env`

| 变量 | 说明 | 默认值 | **生产环境** |
|------|------|--------|-------------|
| `PORT` | 服务端口 | `3000` | `3000` |
| `NODE_ENV` | 运行环境 | `development` | **`production`** |
| `JWT_SECRET` | JWT 签名密钥 | 内置默认值 | **必须修改为随机长字符串** |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` | `7d` |
| `DATABASE_PATH` | SQLite 数据库路径 | `./database/jiaandmiya.db` | 绝对路径 |
| `UPLOAD_DIR` | 上传文件目录 | `./uploads` | 绝对路径 |
| `MAX_FILE_SIZE` | 最大文件大小(字节) | `5242880` (5MB) | 按需调整 |
| `ALLOWED_EXTENSIONS` | 允许的文件类型 | `jpg,jpeg,png,gif,webp,pdf,md,txt` | 按需调整 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` | 按需修改 |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@jiaandmiya.com` | 按需修改 |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` | **必须修改为强密码** |
| `CORS_ORIGIN` | CORS 允许的源 | `http://localhost:5173` | **改为你的域名** |

---

## 数据库

### SQLite

项目使用 SQLite 作为数据库，零配置，单文件存储。

| 项目 | 说明 |
|------|------|
| **文件位置** | `server/database/jiaandmiya.db` |
| **连接模式** | WAL (Write-Ahead Logging)，支持并发读 |
| **表数量** | 19 张表 |
| **备份方式** | 直接复制 `.db` 文件 |

### 数据库表一览

| 分类 | 表名 | 说明 |
|------|------|------|
| 核心系统 | `users` | 用户表（用户名/密码/角色） |
| | `categories` | 文章分类 |
| | `articles` | 旧版文章（保留兼容） |
| | `content_items` | 页面可编辑内容（关于页/文化区等） |
| | `uploads` | 文件上传记录 |
| | `comments` | 评论 |
| | `analytics` | 访客统计 |
| 伴侣社区 | `companions` | AI 伴侣 |
| | `companion_chapters` | 幻想书章节 |
| | `companion_dialogues` | 对话记录 |
| | `companion_favorites` | 伴侣收藏 |
| CMS 系统 | `collections` | 图书组/伴侣组 |
| | `items` | 内容项（图书/伴侣卡片） |
| | `volumes` | 卷 |
| | `chapters` | 章节 |
| | `articles_v2` | 文章（Markdown/TXT） |
| | `nav_items` | 导航配置 |
| | `resource_links` | 免费资源链接 |
| | `profiles` | 用户资料扩展 |

### 种子数据

首次启动自动导入：
- 1 个管理员账户
- 5 个默认分类（技术笔记、文章分享、文化区、免费资源、社区动态）
- 4 条关于页面内容
- 7 条文化区内容（日记、小说、书单、美图分组、美图、电影、音乐）

### 数据库迁移

数据库变更通过 `server/database/migrations.js` 管理，服务器启动时自动执行。

如需手动运行迁移：

```bash
cd server
npm run migrate
```

---

## API 接口

所有 API 以 `/api` 为前缀。

### 认证 `/api/auth`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/auth/register` | 无 | 用户注册 |
| POST | `/auth/login` | 无 | 登录（返回 JWT Token） |
| GET | `/auth/me` | 是 | 获取当前用户信息 |
| POST | `/auth/change-password` | 是 | 修改密码 |
| PUT | `/auth/profile` | 是 | 更新用户资料 |

### 内容管理 `/api/content`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/content/page/:page` | 无 | 获取指定页面内容（公开） |
| GET | `/content` | 是 | 获取所有内容项 |
| POST | `/content` | 编辑 | 创建内容项 |
| PUT | `/content/:id` | 编辑 | 更新内容项 |
| DELETE | `/content/:id` | 管理员 | 删除内容项 |

### CMS `/api/collections` + `/api/items`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/collections` | 无 | 获取集合列表 |
| POST | `/collections` | 编辑 | 创建集合 |
| GET | `/items/:id/toc` | 无 | 获取完整目录结构 |
| GET | `/items/:id/export` | 无 | 导出整本书为 ZIP |
| GET | `/items/:id/export/epub` | 无 | 导出 EPUB |
| POST | `/items/:id/import/epub` | 编辑 | 导入 EPUB |

### 文件上传 `/api/upload`

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/upload/single` | 编辑 | 单文件上传 |
| POST | `/upload/multiple` | 编辑 | 多文件上传 |
| GET | `/upload/gallery/images` | 无 | 图片库（公开图片） |

### 其他

- `/api/companions` — 伴侣社区 CRUD
- `/api/articles` — 旧版文章 CRUD
- `/api/users` — 用户管理（管理员）
- `/api/navigation` — 导航管理
- `/api/resources` — 免费资源
- `/api/profiles` — 用户资料
- `/api/health` — 健康检查

---

## 用户权限体系

| 角色 | 等级 | 权限范围 |
|------|------|---------|
| `admin` | 3 | 全部权限 + 用户管理 + 内容删除 |
| `editor` | 2 | 编辑内容、上传文件、CMS 管理 |
| `user` | 1 | 浏览内容、创建伴侣、评论 |

Token 通过 `Authorization: Bearer <token>` 请求头传递。

---

## 安全注意事项

1. **修改默认密码**: 首次部署务必修改 `ADMIN_PASSWORD` 和 `JWT_SECRET`
2. **HTTPS**: 生产环境必须使用 HTTPS，宝塔面板可一键申请 Let's Encrypt 证书
3. **CORS 限制**: `CORS_ORIGIN` 只填写你的域名，不要用 `*`
4. **数据库备份**: 定期备份 `server/database/jiaandmiya.db` 文件
5. **上传目录**: 确保 `uploads/` 目录有正确的写入权限
6. **日志文件**: PM2 日志在 `server/logs/`，定期清理
7. **速率限制**: 已内置 express-rate-limit（15分钟内每 IP 100 请求）
8. **敏感文件**: Nginx 已配置禁止访问 `.env`、`.log`、`.sql` 等文件

---

## 常见问题

### Q: 前端构建时 VITE_API_BASE_URL 应该填什么？

生产环境填 `/api`（Nginx 会将 `/api/` 反向代理到后端）。本地开发填 `http://localhost:3000/api`。

### Q: 数据库文件太大怎么办？

```bash
# 压缩数据库
cd server
sqlite3 database/jiaandmiya.db "VACUUM;"
```

### Q: 如何重置管理员密码？

修改 `server/.env` 中的 `ADMIN_PASSWORD`，然后删除数据库重新初始化：

```bash
rm server/database/jiaandmiya.db*
node server/index.js
```

> 注意：这会清空所有数据。

### Q: 如何更新部署？

```bash
git pull
npm install
npm run build
pm2 restart jiaandmiya-api
```

### Q: 端口被占用怎么办？

修改 `server/.env` 中的 `PORT`，同时更新 Nginx 配置中 `proxy_pass` 的端口号。
