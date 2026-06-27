const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
});
app.use('/api/', limiter);

// Alist 文件分享代理 (必须在 API 路由之前，避免 /share/api 被拦截)
app.use('/share', createProxyMiddleware({
  target: 'http://localhost:5244',
  changeOrigin: true,
  pathRewrite: { '^/share': '' },
  on: {
    proxyReq: (proxyReq, req, res) => {
      if (req.url.startsWith('/share')) {
        proxyReq.path = req.url.replace('/share', '') || '/';
      }
    }
  }
}));

// MiyaWeb 前端静态文件
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// 静态文件服务（后端自身的 uploads/public）
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// 数据库初始化
const db = require('./database/db');
const { initDatabase, safeMigrations } = require('./database/migrations');
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
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
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
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
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

    // 创建默认管理员账户
    await require('./database/seeds').createDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log(`✅ 服务器启动成功`);
      console.log(`📡 监听地址: http://localhost:${PORT}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  数据库: ${process.env.DATABASE_PATH || './database/jiaandmiya.db'}`);
      console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;