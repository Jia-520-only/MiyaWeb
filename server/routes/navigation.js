const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, hasPermission } = require('../utils/jwt');

const router = express.Router();

// ========================================
// 导航配置管理
// ========================================

// 获取导航树（公开）
router.get('/', async (req, res) => {
  try {
    // 获取所有可见的导航项
    const allItems = await dbAll(
      'SELECT * FROM nav_items WHERE is_visible = 1 ORDER BY sort_order ASC'
    );

    // 构建树形结构
    const navTree = buildNavTree(allItems);

    res.json({ navigation: navTree });
  } catch (error) {
    console.error('获取导航失败:', error);
    res.status(500).json({ error: '获取导航失败' });
  }
});

// 获取所有导航项（管理用，包含隐藏项）
router.get('/all', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const allItems = await dbAll(
      'SELECT * FROM nav_items ORDER BY sort_order ASC'
    );

    const navTree = buildNavTree(allItems);
    res.json({ navigation: navTree, flat: allItems });
  } catch (error) {
    console.error('获取导航失败:', error);
    res.status(500).json({ error: '获取导航失败' });
  }
});

// 创建导航项（管理员）
router.post('/', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { title, icon, link, link_type, parent_id, is_visible, open_in_new_tab, sort_order } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title 为必填字段' });
    }

    const result = await dbRun(
      `INSERT INTO nav_items (title, icon, link, link_type, parent_id, is_visible, open_in_new_tab, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        icon || null,
        link || null,
        link_type || 'internal',
        parent_id || null,
        is_visible !== undefined ? (is_visible ? 1 : 0) : 1,
        open_in_new_tab ? 1 : 0,
        sort_order || 0
      ]
    );

    const navItem = await dbGet('SELECT * FROM nav_items WHERE id = ?', [result.id]);
    res.status(201).json({ navItem, message: '导航项创建成功' });
  } catch (error) {
    console.error('创建导航项失败:', error);
    res.status(500).json({ error: '创建导航项失败' });
  }
});

// 更新导航项（管理员）
router.put('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { title, icon, link, link_type, parent_id, is_visible, open_in_new_tab, sort_order } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
    if (link !== undefined) { fields.push('link = ?'); values.push(link); }
    if (link_type !== undefined) { fields.push('link_type = ?'); values.push(link_type); }
    if (parent_id !== undefined) { fields.push('parent_id = ?'); values.push(parent_id); }
    if (is_visible !== undefined) { fields.push('is_visible = ?'); values.push(is_visible ? 1 : 0); }
    if (open_in_new_tab !== undefined) { fields.push('open_in_new_tab = ?'); values.push(open_in_new_tab ? 1 : 0); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    await dbRun(`UPDATE nav_items SET ${fields.join(', ')} WHERE id = ?`, values);

    const navItem = await dbGet('SELECT * FROM nav_items WHERE id = ?', [req.params.id]);
    if (!navItem) {
      return res.status(404).json({ error: '导航项不存在' });
    }

    res.json({ navItem, message: '导航项更新成功' });
  } catch (error) {
    console.error('更新导航项失败:', error);
    res.status(500).json({ error: '更新导航项失败' });
  }
});

// 删除导航项（管理员）
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    await dbRun('DELETE FROM nav_items WHERE id = ?', [req.params.id]);
    res.json({ message: '导航项删除成功' });
  } catch (error) {
    console.error('删除导航项失败:', error);
    res.status(500).json({ error: '删除导航项失败' });
  }
});

// 批量更新导航排序（管理员）
router.put('/batch/sort', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'admin')) {
      return res.status(403).json({ error: '需要管理员权限' });
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items 必须为数组' });
    }

    for (const item of items) {
      await dbRun(
        'UPDATE nav_items SET sort_order = ?, parent_id = ? WHERE id = ?',
        [item.sort_order, item.parent_id || null, item.id]
      );
    }

    res.json({ message: '导航排序更新成功' });
  } catch (error) {
    console.error('批量更新导航排序失败:', error);
    res.status(500).json({ error: '批量更新导航排序失败' });
  }
});

// 辅助函数：构建树形结构
function buildNavTree(items) {
  const map = {};
  const roots = [];

  items.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });

  items.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });

  return roots;
}

module.exports = router;
