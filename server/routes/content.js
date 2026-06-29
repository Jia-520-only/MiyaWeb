const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, hasPermission } = require('../utils/jwt');
const { validateContentItem, sanitizeObject } = require('../utils/validation');

const router = express.Router();

// 获取所有内容项（需要认证）
router.get('/', authenticate(), async (req, res) => {
  try {
    const { page, section, type, search } = req.query;
    
    let query = 'SELECT * FROM content_items WHERE is_active = 1';
    const params = [];
    
    // 过滤条件
    if (page && page !== 'all') {
      query += ' AND page = ?';
      params.push(page);
    }
    
    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    // 排序
    query += ' ORDER BY page, section, sort_order, id';
    
    const contents = await dbAll(query, params);
    
    // 解析JSON内容
    const parsedContents = contents.map(content => {
      const parsed = { ...content };
      if (content.type === 'array' || content.type === 'object') {
        try {
          parsed.parsedContent = JSON.parse(content.content);
        } catch (e) {
          parsed.parsedContent = null;
        }
      }
      
      // 格式化时间
      parsed.created_at = new Date(parsed.created_at).toLocaleString('zh-CN');
      parsed.updated_at = new Date(parsed.updated_at).toLocaleString('zh-CN');
      
      return parsed;
    });
    
    res.json({
      items: parsedContents,
      total: parsedContents.length
    });
    
  } catch (error) {
    console.error('获取内容项失败:', error);
    res.status(500).json({ error: '获取内容失败' });
  }
});

// 获取指定页面的所有内容（公开接口）
router.get('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const { section } = req.query;
    
    let query = 'SELECT * FROM content_items WHERE page = ? AND is_active = 1';
    const params = [page];
    
    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }
    
    query += ' ORDER BY section, sort_order';
    
    const contents = await dbAll(query, params);
    
    // 将内容按section分组
    const grouped = {};
    contents.forEach(content => {
      if (!grouped[content.section]) {
        grouped[content.section] = [];
      }
      
      // 解析内容
      let parsedContent;
      if (content.type === 'array' || content.type === 'object') {
        try {
          parsedContent = JSON.parse(content.content);
        } catch (e) {
          parsedContent = null;
        }
      } else {
        parsedContent = content.content;
      }
      
      grouped[content.section].push({
        id: content.id,
        type: content.type,
        title: content.title,
        content: parsedContent,
        page: content.page,
        section: content.section,
        metadata: content.metadata ? JSON.parse(content.metadata) : null,
        updatedAt: content.updated_at
      });
    });
    
    res.json({
      page,
      sections: grouped
    });
    
  } catch (error) {
    console.error('获取页面内容失败:', error);
    res.status(500).json({ error: '获取页面内容失败' });
  }
});

// 获取单个内容项
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await dbGet(
      'SELECT * FROM content_items WHERE id = ? AND is_active = 1',
      [id]
    );
    
    if (!content) {
      return res.status(404).json({ error: '内容项不存在' });
    }
    
    // 解析JSON内容
    let parsedContent;
    if (content.type === 'array' || content.type === 'object') {
      try {
        parsedContent = JSON.parse(content.content);
      } catch (e) {
        parsedContent = null;
      }
    } else {
      parsedContent = content.content;
    }
    
    res.json({
      ...content,
      parsedContent,
      metadata: content.metadata ? JSON.parse(content.metadata) : null
    });
    
  } catch (error) {
    console.error('获取内容项失败:', error);
    res.status(500).json({ error: '获取内容项失败' });
  }
});

// 创建内容项（需要编辑者权限）
router.post('/', authenticate(), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    // 验证输入
    const validation = validateContentItem(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const sanitizedData = sanitizeObject(req.body);
    
    // 检查ID是否已存在
    const existing = await dbGet('SELECT id FROM content_items WHERE id = ?', [sanitizedData.id]);
    if (existing) {
      return res.status(409).json({ error: '内容ID已存在' });
    }
    
    // 插入新内容
    await dbRun(
      `INSERT INTO content_items (id, type, title, content, metadata, page, section, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizedData.id,
        sanitizedData.type,
        sanitizedData.title,
        sanitizedData.content,
        sanitizedData.metadata ? JSON.stringify(sanitizedData.metadata) : null,
        sanitizedData.page,
        sanitizedData.section,
        sanitizedData.sort_order || 0,
        1 // 默认激活
      ]
    );
    
    // 获取新创建的内容
    const newContent = await dbGet(
      'SELECT * FROM content_items WHERE id = ?',
      [sanitizedData.id]
    );
    
    res.status(201).json({
      message: '内容创建成功',
      content: newContent
    });
    
  } catch (error) {
    console.error('创建内容失败:', error);
    res.status(500).json({ error: '创建内容失败' });
  }
});

// 更新内容项（需要编辑者权限）
router.put('/:id', authenticate(), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    const { id } = req.params;
    
    // 验证输入
    const validation = validateContentItem(req.body);
    if (!validation.isValid) {
      console.warn('内容PUT验证失败:', JSON.stringify(validation.errors), 'body keys:', Object.keys(req.body));
      return res.status(400).json({ errors: validation.errors });
    }
    
    // 检查内容是否存在
    const existing = await dbGet('SELECT id FROM content_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '内容项不存在' });
    }
    
    const sanitizedData = sanitizeObject(req.body);
    
    // 更新内容
    await dbRun(
      `UPDATE content_items 
       SET type = ?, title = ?, content = ?, metadata = ?, page = ?, section = ?, 
           sort_order = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        sanitizedData.type,
        sanitizedData.title,
        sanitizedData.content,
        sanitizedData.metadata ? JSON.stringify(sanitizedData.metadata) : null,
        sanitizedData.page,
        sanitizedData.section,
        sanitizedData.sort_order || 0,
        id
      ]
    );
    
    // 获取更新后的内容
    const updatedContent = await dbGet(
      'SELECT * FROM content_items WHERE id = ?',
      [id]
    );
    
    res.json({
      message: '内容更新成功',
      content: updatedContent
    });
    
  } catch (error) {
    console.error('更新内容失败:', error);
    res.status(500).json({ error: '更新内容失败' });
  }
});

// 删除内容项（需要管理员权限）
router.delete('/:id', authenticate({ requireAdmin: true }), async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查内容是否存在
    const existing = await dbGet('SELECT id FROM content_items WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '内容项不存在' });
    }
    
    // 软删除（标记为不活跃）
    await dbRun(
      'UPDATE content_items SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    res.json({ message: '内容已删除' });
    
  } catch (error) {
    console.error('删除内容失败:', error);
    res.status(500).json({ error: '删除内容失败' });
  }
});

// 批量更新内容项排序
router.post('/reorder', authenticate(), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: '无效的数据格式' });
    }
    
    // 批量更新排序
    const updates = items.map(item => {
      return dbRun(
        'UPDATE content_items SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [item.sort_order, item.id]
      );
    });
    
    await Promise.all(updates);
    
    res.json({ message: '排序更新成功' });
    
  } catch (error) {
    console.error('更新排序失败:', error);
    res.status(500).json({ error: '更新排序失败' });
  }
});

// 获取所有页面标识列表
router.get('/pages/list', async (req, res) => {
  try {
    const pages = await dbAll(
      'SELECT DISTINCT page FROM content_items WHERE is_active = 1 ORDER BY page'
    );
    
    const pageList = pages.map(p => p.page);
    
    // 默认页面列表（确保所有页面都有）
    const defaultPages = ['global', 'home', 'about', 'community', 'culture', 'free-resources'];
    const allPages = [...new Set([...defaultPages, ...pageList])];
    
    res.json({ pages: allPages });
    
  } catch (error) {
    console.error('获取页面列表失败:', error);
    res.status(500).json({ error: '获取页面列表失败' });
  }
});

module.exports = router;