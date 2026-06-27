const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, hasPermission } = require('../utils/jwt');

const router = express.Router();

// ========================================
// 用户资料管理（弥娅 / 个人中心）
// ========================================

// 获取用户资料（公开） - 必须放在 /me/profile 之后
router.get('/user/:userId', async (req, res) => {
  try {
    const profile = await dbGet(
      'SELECT p.*, u.username, u.role FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
      [req.params.userId]
    );

    if (!profile) {
      return res.status(404).json({ error: '用户资料不存在' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('获取用户资料失败:', error);
    res.status(500).json({ error: '获取用户资料失败' });
  }
});

// 获取自己的资料
router.get('/me/profile', authenticate(), async (req, res) => {
  try {
    let profile = await dbGet(
      'SELECT p.*, u.username, u.role, u.email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
      [req.user.userId]
    );

    if (!profile) {
      // 如果没有资料，创建默认资料
      await dbRun(
        'INSERT INTO profiles (user_id, display_name) VALUES (?, ?)',
        [req.user.userId, req.user.username || '']
      );

      profile = await dbGet(
        'SELECT p.*, u.username, u.role, u.email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
        [req.user.userId]
      );
    }

    res.json({ profile });
  } catch (error) {
    console.error('获取个人资料失败:', error);
    res.status(500).json({ error: '获取个人资料失败' });
  }
});

// 更新自己的资料
router.put('/me/profile', authenticate(), async (req, res) => {
  try {
    const { display_name, bio, bio_type, avatar, cover_image, background_image, social_links, custom_data } = req.body;
    const fields = [];
    const values = [];

    if (display_name !== undefined) { fields.push('display_name = ?'); values.push(display_name); }
    if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
    if (bio_type !== undefined) {
      if (!['markdown', 'txt'].includes(bio_type)) {
        return res.status(400).json({ error: 'bio_type 必须为 markdown 或 txt' });
      }
      fields.push('bio_type = ?');
      values.push(bio_type);
    }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }
    if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
    if (background_image !== undefined) { fields.push('background_image = ?'); values.push(background_image); }
    if (social_links !== undefined) {
      fields.push('social_links = ?');
      values.push(typeof social_links === 'string' ? social_links : JSON.stringify(social_links));
    }
    if (custom_data !== undefined) {
      fields.push('custom_data = ?');
      values.push(typeof custom_data === 'string' ? custom_data : JSON.stringify(custom_data));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.userId);

    await dbRun(`UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`, values);

    const profile = await dbGet(
      'SELECT p.*, u.username, u.role FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
      [req.user.userId]
    );

    res.json({ profile, message: '资料更新成功' });
  } catch (error) {
    console.error('更新个人资料失败:', error);
    res.status(500).json({ error: '更新个人资料失败' });
  }
});

// 管理员更新任意用户资料
router.put('/user/:userId/profile', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { display_name, bio, bio_type, avatar, cover_image, background_image, social_links, custom_data } = req.body;
    const fields = [];
    const values = [];

    if (display_name !== undefined) { fields.push('display_name = ?'); values.push(display_name); }
    if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
    if (bio_type !== undefined) { fields.push('bio_type = ?'); values.push(bio_type); }
    if (avatar !== undefined) { fields.push('avatar = ?'); values.push(avatar); }
    if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
    if (background_image !== undefined) { fields.push('background_image = ?'); values.push(background_image); }
    if (social_links !== undefined) {
      fields.push('social_links = ?');
      values.push(typeof social_links === 'string' ? social_links : JSON.stringify(social_links));
    }
    if (custom_data !== undefined) {
      fields.push('custom_data = ?');
      values.push(typeof custom_data === 'string' ? custom_data : JSON.stringify(custom_data));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.userId);

    await dbRun(`UPDATE profiles SET ${fields.join(', ')} WHERE user_id = ?`, values);

    const profile = await dbGet(
      'SELECT p.*, u.username, u.role FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?',
      [req.params.userId]
    );

    res.json({ profile, message: '资料更新成功' });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    res.status(500).json({ error: '更新用户资料失败' });
  }
});

module.exports = router;
