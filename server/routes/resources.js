const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, hasPermission } = require('../utils/jwt');

const router = express.Router();

// ========================================
// 免费资源链接管理
// ========================================

// 获取所有资源链接（公开，只返回可见的）
router.get('/', async (req, res) => {
  try {
    const { category, visible } = req.query;
    let query = 'SELECT * FROM resource_links WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (visible !== undefined) {
      query += ' AND is_visible = ?';
      params.push(visible === 'true' ? 1 : 0);
    } else {
      query += ' AND is_visible = 1';
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';
    const resources = await dbAll(query, params);

    res.json({ resources });
  } catch (error) {
    console.error('获取资源链接失败:', error);
    res.status(500).json({ error: '获取资源链接失败' });
  }
});

// 获取所有分类（公开）
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbAll(
      'SELECT DISTINCT category FROM resource_links WHERE is_visible = 1 AND category IS NOT NULL ORDER BY category'
    );
    res.json({ categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 获取单个资源链接（公开）
router.get('/:id', async (req, res) => {
  try {
    const resource = await dbGet('SELECT * FROM resource_links WHERE id = ? AND is_visible = 1', [req.params.id]);
    if (!resource) {
      return res.status(404).json({ error: '资源链接不存在' });
    }

    // 增加下载计数
    await dbRun('UPDATE resource_links SET download_count = download_count + 1 WHERE id = ?', [resource.id]);

    res.json({ resource: { ...resource, download_count: resource.download_count + 1 } });
  } catch (error) {
    console.error('获取资源链接失败:', error);
    res.status(500).json({ error: '获取资源链接失败' });
  }
});

// 创建资源链接（管理员）
router.post('/', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { title, description, url, icon, category, cover_image, sort_order } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'title, url 为必填字段' });
    }

    const result = await dbRun(
      `INSERT INTO resource_links (title, description, url, icon, category, cover_image, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        url,
        icon || null,
        category || null,
        cover_image || null,
        sort_order || 0
      ]
    );

    const resource = await dbGet('SELECT * FROM resource_links WHERE id = ?', [result.id]);
    res.status(201).json({ resource, message: '资源链接创建成功' });
  } catch (error) {
    console.error('创建资源链接失败:', error);
    res.status(500).json({ error: '创建资源链接失败' });
  }
});

// 更新资源链接（管理员）
router.put('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { title, description, url, icon, category, cover_image, sort_order, is_visible } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (url !== undefined) { fields.push('url = ?'); values.push(url); }
    if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
    if (category !== undefined) { fields.push('category = ?'); values.push(category); }
    if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (is_visible !== undefined) { fields.push('is_visible = ?'); values.push(is_visible ? 1 : 0); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    await dbRun(`UPDATE resource_links SET ${fields.join(', ')} WHERE id = ?`, values);

    const resource = await dbGet('SELECT * FROM resource_links WHERE id = ?', [req.params.id]);
    if (!resource) {
      return res.status(404).json({ error: '资源链接不存在' });
    }

    res.json({ resource, message: '资源链接更新成功' });
  } catch (error) {
    console.error('更新资源链接失败:', error);
    res.status(500).json({ error: '更新资源链接失败' });
  }
});

// 删除资源链接（管理员）
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    await dbRun('DELETE FROM resource_links WHERE id = ?', [req.params.id]);
    res.json({ message: '资源链接删除成功' });
  } catch (error) {
    console.error('删除资源链接失败:', error);
    res.status(500).json({ error: '删除资源链接失败' });
  }
});

module.exports = router;
