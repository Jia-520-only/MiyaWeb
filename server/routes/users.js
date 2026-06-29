const express = require('express');
const bcrypt = require('bcryptjs');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate } = require('../utils/jwt');
const { validateUserRegistration, sanitizeObject } = require('../utils/validation');

const router = express.Router();

// 获取用户列表（需要管理员权限）
router.get('/', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        id, username, email, role, display_name, avatar, bio, 
        is_active, created_at, last_login, updated_at
      FROM users
      WHERE 1=1
    `;
    
    const params = [];
    
    // 过滤条件
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND (username LIKE ? OR email LIKE ? OR display_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countResult = await dbGet(countQuery, params);
    const total = countResult.total;
    
    // 添加排序和分页
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    // 执行查询
    const users = await dbAll(query, params);
    
    // 格式化时间
    const formattedUsers = users.map(user => ({
      ...user,
      created_at: new Date(user.created_at).toISOString(),
      updated_at: user.updated_at ? new Date(user.updated_at).toISOString() : null,
      last_login: user.last_login ? new Date(user.last_login).toISOString() : null
    }));
    
    res.json({
      users: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取单个用户（需要管理员权限）
router.get('/:id', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await dbGet(
      `SELECT 
        id, username, email, role, display_name, avatar, bio, 
        is_active, created_at, last_login, updated_at
      FROM users 
      WHERE id = ?`,
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 安全信息：不返回密码哈希
    delete user.password_hash;
    
    // 格式化时间
    user.created_at = new Date(user.created_at).toISOString();
    user.updated_at = user.updated_at ? new Date(user.updated_at).toISOString() : null;
    user.last_login = user.last_login ? new Date(user.last_login).toISOString() : null;
    
    res.json({ user });
    
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({ error: '获取用户失败' });
  }
});

// 创建用户（需要管理员权限）
router.post('/', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    // 验证输入
    const validation = validateUserRegistration(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // 检查用户名和邮箱是否已存在
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [req.body.username, req.body.email]
    );
    
    if (existingUser) {
      return res.status(409).json({ 
        error: '用户名或邮箱已被注册' 
      });
    }
    
    const sanitizedData = sanitizeObject(req.body);
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(sanitizedData.password, salt);
    
    // 创建用户
    const result = await dbRun(
      `INSERT INTO users (
        username, email, password_hash, role, display_name, bio, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizedData.username,
        sanitizedData.email,
        passwordHash,
        sanitizedData.role || 'user',
        sanitizedData.displayName || sanitizedData.username,
        sanitizedData.bio || null,
        1 // 默认激活
      ]
    );
    
    // 获取新创建的用户信息
    const newUser = await dbGet(
      'SELECT id, username, email, role, display_name, avatar, bio, is_active, created_at FROM users WHERE id = ?',
      [result.id]
    );
    
    res.status(201).json({
      message: '用户创建成功',
      user: {
        ...newUser,
        created_at: new Date(newUser.created_at).toISOString()
      }
    });
    
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ error: '创建用户失败' });
  }
});

// 更新用户（需要管理员权限）
router.put('/:id', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, displayName, bio, avatar, isActive } = req.body;
    
    // 检查用户是否存在
    const existingUser = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 检查用户名和邮箱是否与其他用户冲突
    if (username) {
      const conflict = await dbGet(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );
      if (conflict) {
        return res.status(409).json({ error: '用户名已被其他用户使用' });
      }
    }
    
    if (email) {
      const conflict = await dbGet(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (conflict) {
        return res.status(409).json({ error: '邮箱已被其他用户使用' });
      }
    }
    
    // 构建更新字段
    const updates = [];
    const params = [];
    
    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    
    if (displayName !== undefined) {
      updates.push('display_name = ?');
      params.push(displayName);
    }
    
    if (bio !== undefined) {
      updates.push('bio = ?');
      params.push(bio);
    }
    
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(isActive ? 1 : 0);
    }
    
    // 添加更新时间
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    // 如果没有更新字段
    if (updates.length === 0) {
      return res.status(400).json({ error: '没有提供更新数据' });
    }
    
    // 执行更新
    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    await dbRun(query, params);
    
    // 获取更新后的用户信息
    const updatedUser = await dbGet(
      'SELECT id, username, email, role, display_name, avatar, bio, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    // 格式化时间
    updatedUser.created_at = new Date(updatedUser.created_at).toISOString();
    updatedUser.updated_at = updatedUser.updated_at ? new Date(updatedUser.updated_at).toISOString() : null;
    
    res.json({
      message: '用户更新成功',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ error: '更新用户失败' });
  }
});

// 删除用户（需要管理员权限）
router.delete('/:id', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查用户是否存在
    const existingUser = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 防止删除管理员自己
    if (parseInt(id) === parseInt(req.user.userId)) {
      return res.status(400).json({ error: '不能删除自己的账户' });
    }
    
    // 删除用户（级联删除相关数据）
    await dbRun('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: '用户已删除' });
    
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 获取用户统计（需要管理员权限）
router.get('/stats/overview', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    const stats = await Promise.all([
      // 总用户数
      dbGet('SELECT COUNT(*) as total FROM users'),
      
      // 活跃用户数（最近30天登录）
      dbGet(`SELECT COUNT(*) as active FROM users 
             WHERE last_login > datetime('now', '-30 days')`),
      
      // 按角色统计
      dbGet('SELECT role, COUNT(*) as count FROM users GROUP BY role'),
      
      // 每日注册趋势（最近7天）
      dbAll(`SELECT 
               date(created_at) as date,
               COUNT(*) as registrations
             FROM users
             WHERE created_at > datetime('now', '-7 days')
             GROUP BY date(created_at)
             ORDER BY date`)
    ]);
    
    const [total, active, roles, trends] = stats;
    
    // 格式化角色统计
    const roleStats = {};
    if (roles && roles.role) {
      roleStats[roles.role] = roles.count;
    } else if (Array.isArray(roles)) {
      roles.forEach(r => {
        roleStats[r.role] = r.count;
      });
    }
    
    res.json({
      total: total.total,
      active: active.active,
      roles: roleStats,
      trends: trends || []
    });
    
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({ error: '获取用户统计失败' });
  }
});

// 搜索用户（需要管理员权限）
router.get('/search/suggestions', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const suggestions = await dbAll(`
      SELECT 
        id, username, email, display_name, avatar, role
      FROM users
      WHERE username LIKE ? OR email LIKE ? OR display_name LIKE ?
      LIMIT 10
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({ error: '搜索用户失败' });
  }
});

module.exports = router;