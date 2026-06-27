// 使用固定密钥派生，避免每次重启 token 失效
// 部署时请设置 JWT_SECRET 环境变量
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const DEFAULT_SECRET = 'jiaandmiya-cms-2026-secret-key-' + 'persistent';
const JWT_SECRET = process.env.JWT_SECRET || crypto.createHash('sha256').update(DEFAULT_SECRET).digest('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 生成JWT令牌
const generateToken = (user) => {
  if (!user || !user.id) {
    throw new Error('无效的用户数据');
  }
  
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    displayName: user.display_name || user.username
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'jiaandmiya-cms',
    audience: 'web-client'
  });
};

// 验证JWT令牌
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'jiaandmiya-cms',
      audience: 'web-client'
    });
  } catch (error) {
    return null;
  }
};

// 解析请求头中的令牌
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

// 认证中间件
const authenticate = (options = {}) => {
  const { requireAdmin = false } = options;
  
  return (req, res, next) => {
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: '令牌无效或已过期' });
    }
    
    // 将用户信息附加到请求对象
    req.user = decoded;
    
    // 如果需要管理员权限，检查用户角色
    if (requireAdmin && !hasPermission(decoded, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }
    
    next();
  };
};

// 可选认证中间件（不强制要求认证）
const optionalAuthenticate = (req, res, next) => {
  const token = getTokenFromHeader(req);
  
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
};

// 检查用户权限
const hasPermission = (user, requiredRole) => {
  if (!user) return false;
  
  const roleHierarchy = {
    'admin': 3,
    'editor': 2,
    'user': 1
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuthenticate,
  hasPermission,
  getTokenFromHeader
};