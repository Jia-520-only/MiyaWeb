const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, optionalAuthenticate, hasPermission } = require('../utils/jwt');
const { validateArticle, sanitizeObject } = require('../utils/validation');

const router = express.Router();

// 获取文章列表（公开接口）
router.get('/', optionalAuthenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tag, 
      search, 
      featured,
      author
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const currentUser = req.user;
    
    let query = `
      SELECT 
        a.id, a.title, a.slug, a.category_id, a.author_id,
        a.summary, a.cover_image, a.read_time, a.tags,
        a.view_count, a.like_count, a.comment_count,
        a.is_published, a.is_featured, a.published_at,
        a.created_at, a.updated_at,
        u.username as author_username,
        u.display_name as author_display_name,
        u.avatar as author_avatar,
        c.name as category_name,
        c.icon as category_icon
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // 如果用户不是编辑者或管理员，只显示已发布的文章
    if (!currentUser || !hasPermission(currentUser, 'editor')) {
      query += ' AND a.is_published = 1';
    }
    
    // 过滤条件
    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    
    if (tag) {
      query += ' AND a.tags LIKE ?';
      params.push(`%"${tag}"%`);
    }
    
    if (search) {
      query += ' AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (featured === 'true') {
      query += ' AND a.is_featured = 1';
    }
    
    if (author) {
      query += ' AND u.username = ?';
      params.push(author);
    }
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countResult = await dbGet(countQuery, params);
    const total = countResult.total;
    
    // 添加排序和分页
    query += ' ORDER BY a.published_at DESC, a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    // 执行查询
    const articles = await dbAll(query, params);
    
    // 解析标签
    const parsedArticles = articles.map(article => {
      const parsed = { ...article };
      
      // 解析标签
      try {
        parsed.tags = article.tags ? JSON.parse(article.tags) : [];
      } catch (e) {
        parsed.tags = [];
      }
      
      // 格式化时间
      parsed.created_at = new Date(parsed.created_at).toISOString();
      parsed.updated_at = new Date(parsed.updated_at).toISOString();
      if (parsed.published_at) {
        parsed.published_at = new Date(parsed.published_at).toISOString();
      }
      
      // 作者信息
      parsed.author = {
        id: article.author_id,
        username: article.author_username,
        displayName: article.author_display_name,
        avatar: article.author_avatar
      };
      
      // 分类信息
      if (article.category_id) {
        parsed.category = {
          id: article.category_id,
          name: article.category_name,
          icon: article.category_icon
        };
      }
      
      // 清理字段
      delete parsed.author_id;
      delete parsed.author_username;
      delete parsed.author_display_name;
      delete parsed.author_avatar;
      delete parsed.category_name;
      delete parsed.category_icon;
      
      return parsed;
    });
    
    res.json({
      articles: parsedArticles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// 获取单个文章（公开接口）
router.get('/:slug', optionalAuthenticate, async (req, res) => {
  try {
    const { slug } = req.params;
    const currentUser = req.user;
    
    let query = `
      SELECT 
        a.*,
        u.username as author_username,
        u.display_name as author_display_name,
        u.avatar as author_avatar,
        c.name as category_name,
        c.icon as category_icon
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.slug = ?
    `;
    
    const params = [slug];
    
    // 如果用户不是编辑者或管理员，只显示已发布的文章
    if (!currentUser || !hasPermission(currentUser, 'editor')) {
      query += ' AND a.is_published = 1';
    }
    
    const article = await dbGet(query, params);
    
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 增加阅读计数
    await dbRun(
      'UPDATE articles SET view_count = view_count + 1 WHERE id = ?',
      [article.id]
    );
    
    // 解析标签
    let tags = [];
    try {
      if (article.tags) {
        tags = JSON.parse(article.tags);
      }
    } catch (e) {
      console.warn('解析标签失败:', e);
    }
    
    // 格式化响应
    const response = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      summary: article.summary,
      coverImage: article.cover_image,
      readTime: article.read_time,
      tags,
      viewCount: article.view_count + 1, // 包含本次访问
      likeCount: article.like_count,
      commentCount: article.comment_count,
      isPublished: Boolean(article.is_published),
      isFeatured: Boolean(article.is_featured),
      createdAt: new Date(article.created_at).toISOString(),
      updatedAt: new Date(article.updated_at).toISOString(),
      publishedAt: article.published_at ? new Date(article.published_at).toISOString() : null,
      author: {
        id: article.author_id,
        username: article.author_username,
        displayName: article.author_display_name,
        avatar: article.author_avatar
      }
    };
    
    if (article.category_id) {
      response.category = {
        id: article.category_id,
        name: article.category_name,
        icon: article.category_icon,
        slug: article.category_slug
      };
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 创建新文章（需要编辑者权限）
router.post('/', authenticate(), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    // 验证输入
    const validation = validateArticle(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const sanitizedData = sanitizeObject(req.body);
    
    // 生成slug（如果未提供）
    let slug = sanitizedData.slug;
    if (!slug) {
      slug = sanitizedData.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      // 确保slug唯一
      let counter = 1;
      let uniqueSlug = slug;
      
      while (true) {
        const existing = await dbGet('SELECT id FROM articles WHERE slug = ?', [uniqueSlug]);
        if (!existing) break;
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      slug = uniqueSlug;
    }
    
    // 计算阅读时间（约200字/分钟）
    const wordCount = sanitizedData.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    // 插入新文章
    const result = await dbRun(
      `INSERT INTO articles (
        title, slug, category_id, author_id, content, summary, 
        cover_image, read_time, tags, is_published, is_featured, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitizedData.title,
        slug,
        sanitizedData.category_id || null,
        req.user.userId,
        sanitizedData.content,
        sanitizedData.summary || null,
        sanitizedData.cover_image || null,
        readTime,
        sanitizedData.tags ? JSON.stringify(sanitizedData.tags) : '[]',
        sanitizedData.is_published ? 1 : 0,
        sanitizedData.is_featured ? 1 : 0,
        sanitizedData.is_published ? new Date().toISOString() : null
      ]
    );
    
    // 获取新创建的文章
    const newArticle = await dbGet(
      'SELECT * FROM articles WHERE id = ?',
      [result.id]
    );
    
    res.status(201).json({
      message: '文章创建成功',
      article: {
        id: newArticle.id,
        title: newArticle.title,
        slug: newArticle.slug,
        isPublished: Boolean(newArticle.is_published)
      }
    });
    
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({ error: '创建文章失败' });
  }
});

// 更新文章（需要编辑者权限）
router.put('/:id', authenticate(), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    const { id } = req.params;
    
    // 验证输入
    const validation = validateArticle(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // 检查文章是否存在
    const existing = await dbGet('SELECT * FROM articles WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 检查权限：非管理员只能编辑自己的文章
    if (req.user.role !== 'admin' && existing.author_id !== req.user.userId) {
      return res.status(403).json({ error: '只能编辑自己的文章' });
    }
    
    const sanitizedData = sanitizeObject(req.body);
    
    // 重新计算阅读时间
    const wordCount = sanitizedData.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    
    // 如果文章从未发布过，现在是第一次发布，设置发布时间
    let publishedAt = existing.published_at;
    if (!existing.is_published && sanitizedData.is_published) {
      publishedAt = new Date().toISOString();
    }
    
    // 更新文章
    await dbRun(
      `UPDATE articles SET
        title = ?, category_id = ?, content = ?, summary = ?,
        cover_image = ?, read_time = ?, tags = ?, 
        is_published = ?, is_featured = ?, published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        sanitizedData.title,
        sanitizedData.category_id || null,
        sanitizedData.content,
        sanitizedData.summary || null,
        sanitizedData.cover_image || null,
        readTime,
        sanitizedData.tags ? JSON.stringify(sanitizedData.tags) : '[]',
        sanitizedData.is_published ? 1 : 0,
        sanitizedData.is_featured ? 1 : 0,
        publishedAt,
        id
      ]
    );
    
    // 获取更新后的文章
    const updatedArticle = await dbGet(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    );
    
    res.json({
      message: '文章更新成功',
      article: updatedArticle
    });
    
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除文章（需要编辑者权限）
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    const { id } = req.params;
    
    // 检查文章是否存在
    const existing = await dbGet('SELECT * FROM articles WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 检查权限：非管理员只能删除自己的文章
    if (req.user.role !== 'admin' && existing.author_id !== req.user.userId) {
      return res.status(403).json({ error: '只能删除自己的文章' });
    }
    
    // 删除文章（级联删除评论）
    await dbRun('DELETE FROM articles WHERE id = ?', [id]);
    
    res.json({ message: '文章已删除' });
    
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ error: '删除文章失败' });
  }
});

// 获取所有分类（公开接口）
router.get('/categories/all', async (req, res) => {
  try {
    const categoriesWithCount = await dbAll(
      `SELECT c.id, c.name, c.slug, c.description, c.icon,
              COUNT(a.id) as articleCount
       FROM categories c
       LEFT JOIN articles a ON a.category_id = c.id AND a.is_published = 1
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order, c.name`
    );
    
    res.json({ categories: categoriesWithCount });
    
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

// 获取热门文章（公开接口）
router.get('/popular/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const popularArticles = await dbAll(`
      SELECT 
        a.id, a.title, a.slug, a.summary, a.cover_image, a.view_count,
        u.username as author_username,
        u.display_name as author_display_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.is_published = 1
      ORDER BY a.view_count DESC, a.like_count DESC
      LIMIT ?
    `, [limit]);
    
    res.json({ articles: popularArticles });
    
  } catch (error) {
    console.error('获取热门文章失败:', error);
    res.status(500).json({ error: '获取热门文章失败' });
  }
});

// 搜索文章（公开接口）
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const suggestions = await dbAll(`
      SELECT 
        id, title, slug, summary
      FROM articles
      WHERE is_published = 1 
        AND (title LIKE ? OR summary LIKE ? OR tags LIKE ?)
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1
          WHEN summary LIKE ? THEN 2
          ELSE 3
        END
      LIMIT 10
    `, [
      `%${q}%`, `%${q}%`, `%"${q}"%`,
      `${q}%`, `${q}%`
    ]);
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('搜索建议失败:', error);
    res.status(500).json({ error: '搜索建议失败' });
  }
});

module.exports = router;