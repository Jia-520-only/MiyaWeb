const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, hasPermission } = require('../utils/jwt');

const router = express.Router();

// ========================================
// 集合管理（图书组 / 伴侣组）
// ========================================

// 获取所有集合（公开）
router.get('/', async (req, res) => {
  try {
    const { type, visible } = req.query;
    let query = `SELECT c.*, COUNT(i.id) as itemCount FROM collections c
      LEFT JOIN items i ON i.collection_id = c.id AND i.is_visible = 1 AND i.status = 'published'
      WHERE 1=1`;
    const params = [];

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }
    if (visible !== undefined) {
      query += ' AND c.is_visible = ?';
      params.push(visible === 'true' ? 1 : 0);
    }

    query += ' GROUP BY c.id ORDER BY c.sort_order ASC, c.created_at DESC';
    const collections = await dbAll(query, params);

    res.json({ collections });
  } catch (error) {
    console.error('获取集合列表失败:', error);
    res.status(500).json({ error: '获取集合列表失败' });
  }
});

// 获取单个集合详情（公开）
router.get('/:id', async (req, res) => {
  try {
    const collection = await dbGet('SELECT * FROM collections WHERE id = ?', [req.params.id]);
    if (!collection) {
      return res.status(404).json({ error: '集合不存在' });
    }

    // 获取集合下的所有项
    const items = await dbAll(
      'SELECT * FROM items WHERE collection_id = ? AND status = \'published\' ORDER BY sort_order ASC, created_at DESC',
      [req.params.id]
    );

    res.json({ collection, items });
  } catch (error) {
    console.error('获取集合详情失败:', error);
    res.status(500).json({ error: '获取集合详情失败' });
  }
});

// 获取集合下的所有项（公开）
router.get('/:id/items', async (req, res) => {
  try {
    const { page = 1, limit = 20, visible } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM items WHERE collection_id = ? AND status = \'published\'';
    const params = [req.params.id];

    if (visible !== undefined) {
      query += ' AND is_visible = ?';
      params.push(visible === 'true' ? 1 : 0);
    }

    const countResult = await dbGet(`SELECT COUNT(*) as total FROM (${query})`, params);
    const total = countResult?.total || 0;

    query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const items = await dbAll(query, params);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取项列表失败:', error);
    res.status(500).json({ error: '获取项列表失败' });
  }
});

// 创建集合（需要管理员权限）
router.post('/', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { name, slug, description, cover_image, type, icon, sort_order } = req.body;

    if (!name || !slug || !type) {
      return res.status(400).json({ error: 'name, slug, type 为必填字段' });
    }

    if (!['book_group', 'companion_group', 'blog'].includes(type)) {
      return res.status(400).json({ error: 'type 必须为 book_group, companion_group 或 blog' });
    }

    // 检查 slug 是否重复
    const existing = await dbGet('SELECT id FROM collections WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(409).json({ error: 'slug 已存在' });
    }

    const result = await dbRun(
      `INSERT INTO collections (name, slug, description, cover_image, type, icon, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || null, cover_image || null, type, icon || null, sort_order || 0]
    );

    const collection = await dbGet('SELECT * FROM collections WHERE id = ?', [result.id]);
    res.status(201).json({ collection, message: '集合创建成功' });
  } catch (error) {
    console.error('创建集合失败:', error);
    res.status(500).json({ error: '创建集合失败' });
  }
});

// 更新集合（需要管理员权限）
router.put('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { name, slug, description, cover_image, icon, sort_order, is_visible } = req.body;
    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
    if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (is_visible !== undefined) { fields.push('is_visible = ?'); values.push(is_visible ? 1 : 0); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    await dbRun(`UPDATE collections SET ${fields.join(', ')} WHERE id = ?`, values);

    const collection = await dbGet('SELECT * FROM collections WHERE id = ?', [req.params.id]);
    if (!collection) {
      return res.status(404).json({ error: '集合不存在' });
    }

    res.json({ collection, message: '集合更新成功' });
  } catch (error) {
    console.error('更新集合失败:', error);
    res.status(500).json({ error: '更新集合失败' });
  }
});

// 删除集合（需要管理员权限）
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const collection = await dbGet('SELECT * FROM collections WHERE id = ?', [req.params.id]);
    if (!collection) {
      return res.status(404).json({ error: '集合不存在' });
    }

    await dbRun('DELETE FROM collections WHERE id = ?', [req.params.id]);
    res.json({ message: '集合删除成功' });
  } catch (error) {
    console.error('删除集合失败:', error);
    res.status(500).json({ error: '删除集合失败' });
  }
});

module.exports = router;
