#!/bin/bash

# jiaandmiya.com 完整CMS系统安装脚本
# 适用于宝塔面板部署

set -e

echo "========================================"
echo "jiaandmiya.com 完整CMS系统安装"
echo "========================================"

# 检查Node.js版本
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2)
if [ -z "$NODE_VERSION" ]; then
    echo "❌ Node.js 未安装"
    echo "请先安装 Node.js 18.x 或更高版本"
    exit 1
fi

NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo "❌ Node.js 版本过低: $NODE_VERSION"
    echo "需要 Node.js 18.x 或更高版本"
    exit 1
fi

echo "✅ Node.js 版本: $NODE_VERSION"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在 server 目录下运行此脚本"
    exit 1
fi

# 创建环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
    
    # 生成随机JWT密钥
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "default_secret_key_$(date +%s)")
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    
    # 生成随机管理员密码
    ADMIN_PASSWORD=$(openssl rand -base64 12 2>/dev/null | tr -dc 'a-zA-Z0-9' | head -c 12)
    sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASSWORD|" .env
    
    echo "✅ 环境变量文件已创建"
    echo "🔑 默认管理员密码: $ADMIN_PASSWORD"
    echo "⚠️  请修改 .env 文件中的配置"
else
    echo "✅ 环境变量文件已存在"
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 确保上传目录存在
echo "📁 创建上传目录..."
mkdir -p uploads
mkdir -p database

# 设置目录权限
chmod -R 755 uploads
chmod -R 755 database

# 初始化数据库
echo "🗄️  初始化数据库..."
node -e "require('./database/migrations').runMigrations()"

# 创建默认管理员账户
echo "👤 创建默认管理员账户..."
node -e "require('./database/seeds').createDefaultAdmin()"

# 测试服务器启动
echo "🚀 测试启动服务器..."
node index.js &
SERVER_PID=$!

# 等待服务器启动
sleep 3

# 检查服务器是否运行
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 服务器启动成功 (PID: $SERVER_PID)"
    
    # 测试健康检查
    echo "🔍 测试API连接..."
    curl -s http://localhost:3000/api/health | grep -q "ok"
    if [ $? -eq 0 ]; then
        echo "✅ API连接正常"
    else
        echo "❌ API连接失败"
    fi
    
    # 停止测试服务器
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ 服务器启动失败"
    exit 1
fi

# 创建PM2配置文件
echo "⚙️  创建PM2配置文件..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'jiaandmiya-api',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
EOF

# 创建日志目录
mkdir -p logs

echo ""
echo "========================================"
echo "✅ 安装完成!"
echo "========================================"
echo ""
echo "下一步："
echo "1. 编辑 .env 文件配置你的设置"
echo "2. 启动服务: pm2 start ecosystem.config.js"
echo "3. 设置开机自启: pm2 startup && pm2 save"
echo ""
echo "📝 环境变量文件位置: $(pwd)/.env"
echo "🗄️  数据库文件位置: $(pwd)/database/jiaandmiya.db"
echo "📁 上传目录位置: $(pwd)/uploads"
echo "📋 日志目录位置: $(pwd)/logs"
echo ""
echo "🔑 默认管理员账户："
echo "   用户名: admin"
echo "   密码: 查看 .env 文件中的 ADMIN_PASSWORD"
echo ""
echo "🌐 测试API: http://localhost:3000/api/health"
echo "📖 完整文档: 查看 ../DEPLOYMENT.md"
echo ""
echo "========================================"