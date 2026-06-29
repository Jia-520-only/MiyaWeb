const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('❌ 未捕获异常 (uncaughtException):', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error('❌ 未处理的 Promise 拒绝 (unhandledRejection):', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟窗口
  max: 200, // 每分钟200个请求，CMS页面多API调用需要较高限制
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Alist 文件分享代理 (必须在 API 路由之前，避免 /share/api 被拦截)
app.use('/share', createProxyMiddleware({
  target: 'http://localhost:5244',
  changeOrigin: true,
  pathRewrite: { '^/share': '' },
  on: {
    proxyReq: (proxyReq, req, _res) => {
      if (req.url.startsWith('/share')) {
        proxyReq.path = req.url.replace('/share', '') || '/';
      }
    },
    error: (err, req, res) => {
      console.error('🔌 Alist 代理错误:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: '文件服务暂时不可用' });
      }
    }
  }
}));

// MiyaWeb 前端静态文件（index.html 不能缓存，其他资源长期缓存）
const distPath = path.join(__dirname, '..', 'dist');
app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true, etag: true }));
app.use(express.static(distPath, {
  maxAge: '1y',
  immutable: true,
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  }
}));

// 静态文件服务（后端自身的 uploads/public）
app.use('/uploads', express.static('uploads', { maxAge: '7d', etag: true }));
app.use('/public', express.static('public', { maxAge: '7d', etag: true }));

// 数据库初始化
const db = require('./database/db');
const { initDatabase, safeMigrations, runLateMigrations } = require('./database/migrations');
const { createCompanionsTables } = require('./database/schema-companions');
const { createCMSTables } = require('./database/schema-cms');

// 路由
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const companionRoutes = require('./routes/companions');
const collectionRoutes = require('./routes/collections');
const itemRoutes = require('./routes/items');
const navigationRoutes = require('./routes/navigation');
const resourceRoutes = require('./routes/resources');
const profileRoutes = require('./routes/profiles');
const sidebarImageRoutes = require('./routes/sidebar-images');
const ocImageRoutes = require('./routes/oc-images');
const sidebarLinkRoutes = require('./routes/sidebar-links');
const bannerImageRoutes = require('./routes/banner-images');
const analyticsRoutes = require('./routes/analytics');

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/companions', companionRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/sidebar-images', sidebarImageRoutes);
app.use('/api/oc-images', ocImageRoutes);
app.use('/api/sidebar-links', sidebarLinkRoutes);
app.use('/api/banner-images', bannerImageRoutes);
app.use('/api/analytics', analyticsRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// SPA fallback - 所有非 API/非静态路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, _next) => {
  console.error('服务器错误:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: '文件大小超过限制' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ error: '文件数量超过限制' });
    }
    return res.status(413).json({ error: '文件上传错误' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: '验证错误', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: '未授权访问' 
    });
  }
  
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 请求超时（导出端点需要更长时间）
app.use((req, res, next) => {
  const timeout = req.path.startsWith('/api/items/') && (req.path.endsWith('/export/zip') || req.path.endsWith('/export/epub') || req.path.endsWith('/export/pdf'))
    ? 120000
    : 30000;
  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: '请求超时' });
    }
  });
  next();
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();

    // 创建伴侣分享社区表（旧版，后续迁移后移除）
    await createCompanionsTables();

    // 创建 CMS 内容管理系统表（新版统一架构）
    await createCMSTables();

    // 安全迁移（添加新字段，已存在则跳过）
    await safeMigrations();

    // 延迟索引迁移（CMS/伴侣表创建完成后）
    await runLateMigrations();

    // 创建默认管理员账户
    await require('./database/seeds').createDefaultAdmin();
    
    // 启动文件监视器（自动导入 Markdown/TXT）
    // 可通过环境变量 DISABLE_CONTENT_WATCH=true 禁用
    let stopWatcher = () => {}
    if (process.env.DISABLE_CONTENT_WATCH !== 'true') {
      const watcher = require('./utils/watcher')
      stopWatcher = watcher.stopWatcher
      watcher.startWatcher(db)
    }

    // 启动图片自动导入监视器
    // 可通过环境变量 DISABLE_MEDIA_WATCH=true 禁用
    let stopMediaWatcher = () => {}
    if (process.env.DISABLE_MEDIA_WATCH !== 'true') {
      const media = require('./utils/mediaWatcher')
      stopMediaWatcher = media.stopMediaWatcher
      media.startMediaWatcher(db)
    }

    const server = app.listen(PORT, () => {
      console.log(`✅ 服务器启动成功`);
      console.log(`📡 监听地址: http://localhost:${PORT}`);
      console.log(`📁 内容导入: content/incoming/ (投放 .md / .txt 文件自动导入)`);
      console.log(`🖼  图片导入: content/incoming-images/ (投放 jpg/png/gif/webp 自动导入)`);
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  数据库: ${process.env.DATABASE_PATH || './database/jiaandmiya.db'}`);
      console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`);
    });

    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 收到 ${signal} 信号，正在优雅关闭...`);
      stopWatcher();
      stopMediaWatcher();
      server.close(() => {
        const { closeDB } = require('./database/db');
        closeDB().then(() => {
          console.log('✅ 服务器已安全关闭');
          process.exit(0);
        }).catch(() => process.exit(0));
      });
      setTimeout(() => {
        console.error('❌ 强制关闭（超时）');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;