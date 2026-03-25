const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate } = require('../utils/jwt');
const { sanitizeObject } = require('../utils/validation');

const router = express.Router();

// ==================== 伴侣设定管理 ====================

// 获取所有伴侣列表（分页）
router.get('/companions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const type = req.query.type || ''; // 伴侣类型筛选

    let query = `
      SELECT c.*, u.username, u.display_name as author_name,
             COUNT(DISTINCT cc.id) as chapter_count,
             COUNT(DISTINCT cd.id) as dialogue_count,
             COUNT(DISTINCT cf.id) as favorite_count
      FROM companions c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN companion_chapters cc ON c.id = cc.companion_id
      LEFT JOIN companion_dialogues cd ON c.id = cd.companion_id
      LEFT JOIN companion_favorites cf ON c.id = cf.companion_id
      WHERE c.is_public = 1
    `;

    const params = [];

    if (search) {
      query += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      query += ` AND c.type = ?`;
      params.push(type);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const companions = await dbAll(query, params);

    // 获取总数
    let countQuery = `SELECT COUNT(DISTINCT c.id) as total FROM companions c WHERE c.is_public = 1`;
    const countParams = [];
    if (search) {
      countQuery += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (type) {
      countQuery += ` AND c.type = ?`;
      countParams.push(type);
    }
    const countResult = await dbGet(countQuery, countParams);

    res.json({
      companions,
      total: countResult.total,
      page,
      limit,
      totalPages: Math.ceil(countResult.total / limit)
    });
  } catch (error) {
    console.error('获取伴侣列表失败:', error);
    res.status(500).json({ error: '获取伴侣列表失败' });
  }
});

// 获取单个伴侣详情
router.get('/companions/:id', async (req, res) => {
  try {
    const companion = await dbGet(`
      SELECT c.*, u.username, u.display_name as author_name, u.avatar as author_avatar
      FROM companions c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (!companion) {
      return res.status(404).json({ error: '伴侣不存在' });
    }

    // 获取章节列表
    const chapters = await dbAll(`
      SELECT id, title, summary, chapter_number, created_at
      FROM companion_chapters
      WHERE companion_id = ?
      ORDER BY chapter_number
    `, [req.params.id]);

    // 获取对话记录
    const dialogues = await dbAll(`
      SELECT id, content, emotion, tags, created_at
      FROM companion_dialogues
      WHERE companion_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [req.params.id]);

    res.json({
      companion,
      chapters,
      dialogues
    });
  } catch (error) {
    console.error('获取伴侣详情失败:', error);
    res.status(500).json({ error: '获取伴侣详情失败' });
  }
});

// 创建伴侣设定
router.post('/companions', authenticate(), async (req, res) => {
  try {
    const { name, type, description, avatar, personality, background, tags, isPublic } = req.body;

    if (!name || !type || !description) {
      return res.status(400).json({ error: '名称、类型和描述为必填项' });
    }

    const result = await dbRun(`
      INSERT INTO companions (user_id, name, type, description, avatar, personality, background, tags, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.userId,
      name,
      type,
      description,
      avatar || null,
      personality || null,
      background || null,
      tags ? JSON.stringify(tags) : null,
      isPublic !== false
    ]);

    res.status(201).json({
      message: '伴侣创建成功',
      companionId: result.id
    });
  } catch (error) {
    console.error('创建伴侣失败:', error);
    res.status(500).json({ error: '创建伴侣失败' });
  }
});

// 更新伴侣设定
router.put('/companions/:id', authenticate(), async (req, res) => {
  try {
    const companion = await dbGet('SELECT user_id FROM companions WHERE id = ?', [req.params.id]);

    if (!companion) {
      return res.status(404).json({ error: '伴侣不存在' });
    }

    if (companion.user_id !== req.user.userId) {
      return res.status(403).json({ error: '无权修改此伴侣' });
    }

    const { name, type, description, avatar, personality, background, tags, isPublic } = req.body;

    await dbRun(`
      UPDATE companions
      SET name = ?, type = ?, description = ?, avatar = ?, personality = ?, background = ?, tags = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name,
      type,
      description,
      avatar || null,
      personality || null,
      background || null,
      tags ? JSON.stringify(tags) : null,
      isPublic !== false,
      req.params.id
    ]);

    res.json({ message: '伴侣更新成功' });
  } catch (error) {
    console.error('更新伴侣失败:', error);
    res.status(500).json({ error: '更新伴侣失败' });
  }
});

// 删除伴侣
router.delete('/companions/:id', authenticate(), async (req, res) => {
  try {
    const companion = await dbGet('SELECT user_id FROM companions WHERE id = ?', [req.params.id]);

    if (!companion) {
      return res.status(404).json({ error: '伴侣不存在' });
    }

    if (companion.user_id !== req.user.userId) {
      return res.status(403).json({ error: '无权删除此伴侣' });
    }

    // 删除相关数据
    await dbRun('DELETE FROM companion_chapters WHERE companion_id = ?', [req.params.id]);
    await dbRun('DELETE FROM companion_dialogues WHERE companion_id = ?', [req.params.id]);
    await dbRun('DELETE FROM companion_favorites WHERE companion_id = ?', [req.params.id]);
    await dbRun('DELETE FROM companions WHERE id = ?', [req.params.id]);

    res.json({ message: '伴侣删除成功' });
  } catch (error) {
    console.error('删除伴侣失败:', error);
    res.status(500).json({ error: '删除伴侣失败' });
  }
});

// ==================== 幻想书（章节管理） ====================

// 获取伴侣的所有章节
router.get('/companions/:id/chapters', async (req, res) => {
  try {
    const chapters = await dbAll(`
      SELECT * FROM companion_chapters
      WHERE companion_id = ?
      ORDER BY chapter_number
    `, [req.params.id]);

    res.json({ chapters });
  } catch (error) {
    console.error('获取章节列表失败:', error);
    res.status(500).json({ error: '获取章节列表失败' });
  }
});

// 获取单个章节内容
router.get('/companions/:id/chapters/:chapterId', async (req, res) => {
  try {
    const chapter = await dbGet(`
      SELECT cc.*, c.name as companion_name
      FROM companion_chapters cc
      JOIN companions c ON cc.companion_id = c.id
      WHERE cc.id = ? AND cc.companion_id = ?
    `, [req.params.chapterId, req.params.id]);

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    res.json({ chapter });
  } catch (error) {
    console.error('获取章节内容失败:', error);
    res.status(500).json({ error: '获取章节内容失败' });
  }
});

// 创建新章节
router.post('/companions/:id/chapters', authenticate(), async (req, res) => {
  try {
    const companion = await dbGet('SELECT user_id FROM companions WHERE id = ?', [req.params.id]);

    if (!companion) {
      return res.status(404).json({ error: '伴侣不存在' });
    }

    if (companion.user_id !== req.user.userId) {
      return res.status(403).json({ error: '无权为此伴侣创建章节' });
    }

    const { title, summary, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容为必填项' });
    }

    // 获取最大章节号
    const maxChapter = await dbGet(
      'SELECT MAX(chapter_number) as max_num FROM companion_chapters WHERE companion_id = ?',
      [req.params.id]
    );
    const chapterNumber = (maxChapter.max_num || 0) + 1;

    const result = await dbRun(`
      INSERT INTO companion_chapters (companion_id, title, summary, content, chapter_number)
      VALUES (?, ?, ?, ?, ?)
    `, [req.params.id, title, summary || null, content, chapterNumber]);

    res.status(201).json({
      message: '章节创建成功',
      chapterId: result.id
    });
  } catch (error) {
    console.error('创建章节失败:', error);
    res.status(500).json({ error: '创建章节失败' });
  }
});

// 更新章节
router.put('/companions/:id/chapters/:chapterId', authenticate(), async (req, res) => {
  try {
    const chapter = await dbGet(`
      SELECT cc.*, c.user_id as companion_user_id
      FROM companion_chapters cc
      JOIN companions c ON cc.companion_id = c.id
      WHERE cc.id = ? AND cc.companion_id = ?
    `, [req.params.chapterId, req.params.id]);

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    if (chapter.companion_user_id !== req.user.userId) {
      return res.status(403).json({ error: '无权修改此章节' });
    }

    const { title, summary, content } = req.body;

    await dbRun(`
      UPDATE companion_chapters
      SET title = ?, summary = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, summary || null, content, req.params.chapterId]);

    res.json({ message: '章节更新成功' });
  } catch (error) {
    console.error('更新章节失败:', error);
    res.status(500).json({ error: '更新章节失败' });
  }
});

// 删除章节
router.delete('/companions/:id/chapters/:chapterId', authenticate(), async (req, res) => {
  try {
    const chapter = await dbGet(`
      SELECT cc.*, c.user_id as companion_user_id
      FROM companion_chapters cc
      JOIN companions c ON cc.companion_id = c.id
      WHERE cc.id = ? AND cc.companion_id = ?
    `, [req.params.chapterId, req.params.id]);

    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    if (chapter.companion_user_id !== req.user.userId) {
      return res.status(403).json({ error: '无权删除此章节' });
    }

    await dbRun('DELETE FROM companion_chapters WHERE id = ?', [req.params.chapterId]);

    res.json({ message: '章节删除成功' });
  } catch (error) {
    console.error('删除章节失败:', error);
    res.status(500).json({ error: '删除章节失败' });
  }
});

// ==================== 一人的小说（对话记录） ====================

// 获取伴侣的对话记录
router.get('/companions/:id/dialogues', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const dialogues = await dbAll(`
      SELECT * FROM companion_dialogues
      WHERE companion_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [req.params.id, limit, offset]);

    res.json({ dialogues });
  } catch (error) {
    console.error('获取对话记录失败:', error);
    res.status(500).json({ error: '获取对话记录失败' });
  }
});

// 创建对话记录
router.post('/companions/:id/dialogues', authenticate(), async (req, res) => {
  try {
    const companion = await dbGet('SELECT user_id FROM companions WHERE id = ?', [req.params.id]);

    if (!companion) {
      return res.status(404).json({ error: '伴侣不存在' });
    }

    if (companion.user_id !== req.user.userId) {
      return res.status(403).json({ error: '无权为此伴侣添加对话' });
    }

    const { content, emotion, tags } = req.body;

    if (!content) {
      return res.status(400).json({ error: '对话内容为必填项' });
    }

    const result = await dbRun(`
      INSERT INTO companion_dialogues (companion_id, content, emotion, tags)
      VALUES (?, ?, ?, ?)
    `, [
      req.params.id,
      content,
      emotion || null,
      tags ? JSON.stringify(tags) : null
    ]);

    res.status(201).json({
      message: '对话记录创建成功',
      dialogueId: result.id
    });
  } catch (error) {
    console.error('创建对话记录失败:', error);
    res.status(500).json({ error: '创建对话记录失败' });
  }
});

// ==================== 收藏功能 ====================

// 收藏/取消收藏伴侣
router.post('/companions/:id/favorite', authenticate(), async (req, res) => {
  try {
    const companion = await dbGet('SELECT id FROM companions WHERE id = ?', [req.params.id]);

    if (!companion) {
      return res.status(404).json({ error: '伴侣不存在' });
    }

    // 检查是否已收藏
    const existing = await dbGet(
      'SELECT id FROM companion_favorites WHERE companion_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (existing) {
      // 取消收藏
      await dbRun('DELETE FROM companion_favorites WHERE id = ?', [existing.id]);
      res.json({ message: '已取消收藏', favorited: false });
    } else {
      // 添加收藏
      await dbRun('INSERT INTO companion_favorites (companion_id, user_id) VALUES (?, ?)', [
        req.params.id,
        req.user.userId
      ]);
      res.json({ message: '收藏成功', favorited: true });
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    res.status(500).json({ error: '收藏操作失败' });
  }
});

// 获取用户收藏的伴侣
router.get('/user/favorites', authenticate(), async (req, res) => {
  try {
    const favorites = await dbAll(`
      SELECT c.*, u.username, u.display_name as author_name, cf.created_at as favorited_at
      FROM companion_favorites cf
      JOIN companions c ON cf.companion_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE cf.user_id = ?
      ORDER BY cf.created_at DESC
    `, [req.user.userId]);

    res.json({ favorites });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

// 获取用户创建的伴侣
router.get('/user/companions', authenticate(), async (req, res) => {
  try {
    const companions = await dbAll(`
      SELECT c.*,
             COUNT(DISTINCT cc.id) as chapter_count,
             COUNT(DISTINCT cd.id) as dialogue_count,
             COUNT(DISTINCT cf.id) as favorite_count
      FROM companions c
      LEFT JOIN companion_chapters cc ON c.id = cc.companion_id
      LEFT JOIN companion_dialogues cd ON c.id = cd.companion_id
      LEFT JOIN companion_favorites cf ON c.id = cf.companion_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [req.user.userId]);

    res.json({ companions });
  } catch (error) {
    console.error('获取用户伴侣列表失败:', error);
    res.status(500).json({ error: '获取用户伴侣列表失败' });
  }
});

module.exports = router;
