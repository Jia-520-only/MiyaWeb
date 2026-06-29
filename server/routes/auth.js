const express = require('express');
const bcrypt = require('bcryptjs');
const { dbGet, dbRun } = require('../database/db');
const { generateToken, authenticate } = require('../utils/jwt');
const { validateLogin, validateUserRegistration, sanitizeObject } = require('../utils/validation');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    // 验证输入
    const validation = validateUserRegistration(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // 检查用户名是否已存在
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [req.body.username, req.body.email]
    );
    
    if (existingUser) {
      return res.status(409).json({ 
        error: '用户名或邮箱已被注册' 
      });
    }
    
    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(req.body.password, salt);
    
    // 创建用户
    const sanitizedData = sanitizeObject(req.body);
    const result = await dbRun(
      `INSERT INTO users (username, email, password_hash, display_name, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        sanitizedData.username,
        sanitizedData.email,
        passwordHash,
        sanitizedData.displayName || sanitizedData.username,
        'user' // 默认角色
      ]
    );
    
    // 获取新创建的用户信息
    const newUser = await dbGet(
      'SELECT id, username, email, role, display_name, avatar, created_at FROM users WHERE id = ?',
      [result.id]
    );
    
    // 生成JWT令牌
    const token = generateToken(newUser);
    
    res.status(201).json({
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        displayName: newUser.display_name,
        avatar: newUser.avatar
      },
      token
    });
    
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    // 验证输入
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // 查找用户（支持用户名或邮箱登录）
    const user = await dbGet(
      `SELECT id, username, email, password_hash, role, display_name, avatar, is_active 
       FROM users 
       WHERE (username = ? OR email = ?) AND is_active = 1`,
      [req.body.username, req.body.username]
    );
    
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(req.body.password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 更新最后登录时间
    await dbRun(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    
    // 生成JWT令牌
    const token = generateToken(user);
    
    // 移除密码哈希
    delete user.password_hash;
    
    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.display_name,
        avatar: user.avatar,
        lastLogin: user.last_login
      },
      token
    });
    
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败，请稍后重试', detail: error.message, stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined });
  }
});

// 获取当前用户信息
router.get('/me', authenticate(), async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, username, email, role, display_name, avatar, bio, created_at, last_login FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        displayName: user.display_name,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 修改密码
router.post('/change-password', authenticate(), async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: '所有字段都是必填的' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: '新密码和确认密码不一致' });
    }
    
    // 获取当前用户密码
    const user = await dbGet(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: '当前密码错误' });
    }
    
    // 验证新密码强度
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ error: '新密码至少8位，需包含字母和数字' });
    }
    
    // 加密新密码
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // 更新密码
    await dbRun(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, req.user.userId]
    );
    
    res.json({ message: '密码修改成功' });
    
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// 更新用户资料
router.put('/profile', authenticate(), async (req, res) => {
  try {
    const { displayName, bio, avatar } = req.body;
    
    // 验证显示名称
    if (displayName && displayName.trim().length > 100) {
      return res.status(400).json({ error: '显示名称不能超过100个字符' });
    }
    
    // 更新用户资料
    await dbRun(
      'UPDATE users SET display_name = ?, bio = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [displayName || null, bio || null, avatar || null, req.user.userId]
    );
    
    // 获取更新后的用户信息
    const updatedUser = await dbGet(
      'SELECT id, username, email, role, display_name, avatar, bio FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    res.json({
      message: '资料更新成功',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        displayName: updatedUser.display_name,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio
      }
    });
    
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({ error: '更新用户资料失败' });
  }
});

// 修改账户（用户名 + 密码，需验证当前密码）
router.put('/account', authenticate(), async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error: '请输入当前密码' });
    }

    const user = await dbGet(
      'SELECT id, username, password_hash FROM users WHERE id = ?',
      [req.user.userId]
    );
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) return res.status(401).json({ error: '当前密码错误' });

    const updates = [];
    const params = [];

    if (newUsername && newUsername !== user.username) {
      if (newUsername.length < 2 || newUsername.length > 50) {
        return res.status(400).json({ error: '用户名需 2-50 个字符' });
      }
      if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(newUsername)) {
        return res.status(400).json({ error: '用户名只能包含字母、数字、下划线和中文' });
      }
      const existing = await dbGet('SELECT id FROM users WHERE username = ? AND id != ?', [newUsername, req.user.userId]);
      if (existing) return res.status(400).json({ error: '该用户名已被使用' });
      updates.push('username = ?');
      params.push(newUsername);
    }

    if (newPassword) {
      if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
        return res.status(400).json({ error: '新密码至少8位，需包含字母和数字' });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      updates.push('password_hash = ?');
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有需要修改的内容' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.user.userId);
    await dbRun(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await dbGet('SELECT id, username, role FROM users WHERE id = ?', [req.user.userId]);
    res.json({ message: '账户修改成功', user: { id: updated.id, username: updated.username, role: updated.role } });

  } catch (error) {
    console.error('修改账户失败:', error);
    res.status(500).json({ error: '修改账户失败' });
  }
});

// 退出登录（客户端需要删除本地token）
router.post('/logout', authenticate(), (req, res) => {
  res.json({ message: '已退出登录' });
});

module.exports = router;