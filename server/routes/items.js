const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, hasPermission } = require('../utils/jwt');
const { upload } = require('../utils/fileUpload');

const router = express.Router();

// ========================================
// 内容项管理（图书 / 伴侣卡片）
// ========================================

// 获取所有自动导入的条目（source_file 不为空）
router.get('/imported/list', authenticate(), async (req, res) => {
  try {
    const items = await dbAll(
      `SELECT i.*, c.name as collection_name, c.slug as collection_slug
       FROM items i
       LEFT JOIN collections c ON i.collection_id = c.id
       WHERE i.source_file IS NOT NULL
       ORDER BY i.updated_at DESC`
    );
    res.json({ items });
  } catch (error) {
    console.error('获取导入条目失败:', error);
    res.status(500).json({ error: '获取导入条目失败' });
  }
});

// 获取单个项详情（公开）
router.get('/:id', async (req, res) => {
  try {
    const item = await dbGet('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    // 获取卷列表
    const volumes = await dbAll(
      'SELECT * FROM volumes WHERE item_id = ? ORDER BY sort_order ASC',
      [item.id]
    );

    // 获取没有卷的章节
    const orphanChapters = await dbAll(
      'SELECT * FROM chapters WHERE item_id = ? AND volume_id IS NULL ORDER BY sort_order ASC',
      [item.id]
    );

    // 获取卷下的章节
    const chaptersWithVolume = await dbAll(
      'SELECT c.*, v.title as volume_title FROM chapters c LEFT JOIN volumes v ON c.volume_id = v.id WHERE c.item_id = ? AND c.volume_id IS NOT NULL ORDER BY c.sort_order ASC',
      [item.id]
    );

    res.json({
      item,
      volumes,
      orphanChapters,
      chaptersWithVolume
    });
  } catch (error) {
    console.error('获取内容项详情失败:', error);
    res.status(500).json({ error: '获取内容项详情失败' });
  }
});

// 获取项的目录结构（公开）
router.get('/:id/toc', async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await dbGet('SELECT id, title, type FROM items WHERE id = ?', [itemId]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    const [volumes, allChapters, allArticles] = await Promise.all([
      dbAll('SELECT * FROM volumes WHERE item_id = ? ORDER BY sort_order ASC', [itemId]),
      dbAll('SELECT * FROM chapters WHERE item_id = ? ORDER BY sort_order ASC', [itemId]),
      dbAll('SELECT id, title, content_type, summary, sort_order, chapter_id, item_id FROM articles_v2 WHERE item_id = ? ORDER BY sort_order ASC', [itemId])
    ]);

    const articlesByChapter = new Map();
    const directArticles = [];
    for (const article of allArticles) {
      if (article.chapter_id) {
        const list = articlesByChapter.get(article.chapter_id) || [];
        list.push(article);
        articlesByChapter.set(article.chapter_id, list);
      } else {
        directArticles.push(article);
      }
    }

    const chaptersByVolume = new Map();
    const orphanChapters = [];
    for (const ch of allChapters) {
      if (ch.volume_id) {
        const list = chaptersByVolume.get(ch.volume_id) || [];
        list.push({ ...ch, articles: articlesByChapter.get(ch.id) || [] });
        chaptersByVolume.set(ch.volume_id, list);
      } else {
        orphanChapters.push({ ...ch, articles: articlesByChapter.get(ch.id) || [] });
      }
    }

    const volumesWithChapters = volumes.map(vol => ({
      ...vol,
      chapters: chaptersByVolume.get(vol.id) || []
    }));

    res.json({
      item,
      volumes: volumesWithChapters,
      orphanChapters,
      directArticles
    });
  } catch (error) {
    console.error('获取目录结构失败:', error);
    res.status(500).json({ error: '获取目录结构失败' });
  }
});

// 创建项（需要编辑权限）
router.post('/', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { collection_id, title, slug, description, cover_image, type, tags, custom_data, sort_order, content, content_type } = req.body;

    if (!collection_id || !title || !slug || !type) {
      return res.status(400).json({ error: 'collection_id, title, slug, type 为必填字段' });
    }

    if (!['book', 'companion', 'post'].includes(type)) {
      return res.status(400).json({ error: 'type 必须为 book, companion 或 post' });
    }

    // 检查 slug 是否重复
    const existing = await dbGet('SELECT id FROM items WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(409).json({ error: 'slug 已存在' });
    }

    // 检查集合是否存在
    const collection = await dbGet('SELECT * FROM collections WHERE id = ?', [collection_id]);
    if (!collection) {
      return res.status(404).json({ error: '集合不存在' });
    }

    const result = await dbRun(
      `INSERT INTO items (collection_id, title, slug, description, cover_image, type, author_id, tags, custom_data, sort_order, content, content_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        collection_id, title, slug, description || null, cover_image || null,
        type, req.user.userId,
        tags ? JSON.stringify(tags) : null,
        custom_data ? JSON.stringify(custom_data) : null,
        sort_order || 0,
        content || '',
        content_type || 'markdown'
      ]
    );

    const item = await dbGet('SELECT * FROM items WHERE id = ?', [result.id]);
    res.status(201).json({ item, message: '内容项创建成功' });
  } catch (error) {
    console.error('创建内容项失败:', error);
    res.status(500).json({ error: '创建内容项失败' });
  }
});

// 更新项（需要编辑权限）
router.put('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { title, slug, description, cover_image, tags, custom_data, sort_order, is_visible, content, content_type } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (slug !== undefined) { fields.push('slug = ?'); values.push(slug); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
    if (tags !== undefined) { fields.push('tags = ?'); values.push(typeof tags === 'string' ? tags : JSON.stringify(tags)); }
    if (custom_data !== undefined) { fields.push('custom_data = ?'); values.push(typeof custom_data === 'string' ? custom_data : JSON.stringify(custom_data)); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (is_visible !== undefined) { fields.push('is_visible = ?'); values.push(is_visible ? 1 : 0); }
    if (content !== undefined) { fields.push('content = ?'); values.push(content); }
    if (content_type !== undefined) { fields.push('content_type = ?'); values.push(content_type); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    await dbRun(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`, values);

    const item = await dbGet('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    res.json({ item, message: '内容项更新成功' });
  } catch (error) {
    console.error('更新内容项失败:', error);
    res.status(500).json({ error: '更新内容项失败' });
  }
});

// 删除项（需要编辑权限）
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const item = await dbGet('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    await dbRun('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: '内容项删除成功' });
  } catch (error) {
    console.error('删除内容项失败:', error);
    res.status(500).json({ error: '删除内容项失败' });
  }
});

// ========================================
// 卷管理
// ========================================

// 创建卷
router.post('/:itemId/volumes', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { title, description, sort_order } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title 为必填字段' });
    }

    const result = await dbRun(
      'INSERT INTO volumes (item_id, title, description, sort_order) VALUES (?, ?, ?, ?)',
      [req.params.itemId, title, description || null, sort_order || 0]
    );

    const volume = await dbGet('SELECT * FROM volumes WHERE id = ?', [result.id]);
    res.status(201).json({ volume, message: '卷创建成功' });
  } catch (error) {
    console.error('创建卷失败:', error);
    res.status(500).json({ error: '创建卷失败' });
  }
});

// 更新卷
router.put('/:itemId/volumes/:volumeId', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { title, description, sort_order } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.volumeId);

    await dbRun(`UPDATE volumes SET ${fields.join(', ')} WHERE id = ? AND item_id = ?`, [...values, req.params.itemId]);

    const volume = await dbGet('SELECT * FROM volumes WHERE id = ? AND item_id = ?', [req.params.volumeId, req.params.itemId]);
    if (!volume) {
      return res.status(404).json({ error: '卷不存在' });
    }

    res.json({ volume, message: '卷更新成功' });
  } catch (error) {
    console.error('更新卷失败:', error);
    res.status(500).json({ error: '更新卷失败' });
  }
});

// 删除卷
router.delete('/:itemId/volumes/:volumeId', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    await dbRun('DELETE FROM volumes WHERE id = ? AND item_id = ?', [req.params.volumeId, req.params.itemId]);
    res.json({ message: '卷删除成功' });
  } catch (error) {
    console.error('删除卷失败:', error);
    res.status(500).json({ error: '删除卷失败' });
  }
});

// ========================================
// 章节管理
// ========================================

// 创建章节
router.post('/:itemId/chapters', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { title, description, volume_id, sort_order } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title 为必填字段' });
    }

    const result = await dbRun(
      'INSERT INTO chapters (item_id, volume_id, title, description, sort_order) VALUES (?, ?, ?, ?, ?)',
      [req.params.itemId, volume_id || null, title, description || null, sort_order || 0]
    );

    const chapter = await dbGet('SELECT * FROM chapters WHERE id = ?', [result.id]);
    res.status(201).json({ chapter, message: '章节创建成功' });
  } catch (error) {
    console.error('创建章节失败:', error);
    res.status(500).json({ error: '创建章节失败' });
  }
});

// 更新章节
router.put('/:itemId/chapters/:chapterId', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { title, description, volume_id, sort_order } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (volume_id !== undefined) { fields.push('volume_id = ?'); values.push(volume_id); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.chapterId);

    await dbRun(`UPDATE chapters SET ${fields.join(', ')} WHERE id = ? AND item_id = ?`, [...values, req.params.itemId]);

    const chapter = await dbGet('SELECT * FROM chapters WHERE id = ? AND item_id = ?', [req.params.chapterId, req.params.itemId]);
    if (!chapter) {
      return res.status(404).json({ error: '章节不存在' });
    }

    res.json({ chapter, message: '章节更新成功' });
  } catch (error) {
    console.error('更新章节失败:', error);
    res.status(500).json({ error: '更新章节失败' });
  }
});

// 删除章节
router.delete('/:itemId/chapters/:chapterId', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    await dbRun('DELETE FROM chapters WHERE id = ? AND item_id = ?', [req.params.chapterId, req.params.itemId]);
    res.json({ message: '章节删除成功' });
  } catch (error) {
    console.error('删除章节失败:', error);
    res.status(500).json({ error: '删除章节失败' });
  }
});

// ========================================
// 文章管理（articles_v2）
// ========================================

// 获取单篇文章
router.get('/:itemId/articles/:articleId', async (req, res) => {
  try {
    const article = await dbGet(
      'SELECT * FROM articles_v2 WHERE id = ? AND item_id = ?',
      [req.params.articleId, req.params.itemId]
    );
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 增加阅读次数
    await dbRun('UPDATE articles_v2 SET view_count = view_count + 1 WHERE id = ?', [article.id]);

    res.json({ article: { ...article, view_count: article.view_count + 1 } });
  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// 创建文章
router.post('/:itemId/articles', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { title, content, content_type, chapter_id, summary, cover_image, attachments, is_downloadable, sort_order } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title 为必填字段' });
    }

    const contentType = content_type || 'markdown';
    if (!['markdown', 'txt'].includes(contentType)) {
      return res.status(400).json({ error: 'content_type 必须为 markdown 或 txt' });
    }

    // 计算字数
    const wordCount = content ? content.length : 0;

    const result = await dbRun(
      `INSERT INTO articles_v2 (chapter_id, item_id, title, content, content_type, summary, cover_image, attachments, is_downloadable, sort_order, word_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chapter_id || null,
        req.params.itemId,
        title,
        content || '',
        contentType,
        summary || null,
        cover_image || null,
        attachments ? JSON.stringify(attachments) : null,
        is_downloadable !== undefined ? (is_downloadable ? 1 : 0) : 1,
        sort_order || 0,
        wordCount
      ]
    );

    const article = await dbGet('SELECT * FROM articles_v2 WHERE id = ?', [result.id]);
    res.status(201).json({ article, message: '文章创建成功' });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({ error: '创建文章失败' });
  }
});

// 更新文章
router.put('/:itemId/articles/:articleId', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const { title, content, content_type, chapter_id, summary, cover_image, attachments, is_downloadable, sort_order } = req.body;
    const fields = [];
    const values = [];

    if (title !== undefined) { fields.push('title = ?'); values.push(title); }
    if (content !== undefined) {
      fields.push('content = ?');
      values.push(content);
      fields.push('word_count = ?');
      values.push(content.length);
    }
    if (content_type !== undefined) { fields.push('content_type = ?'); values.push(content_type); }
    if (chapter_id !== undefined) { fields.push('chapter_id = ?'); values.push(chapter_id); }
    if (summary !== undefined) { fields.push('summary = ?'); values.push(summary); }
    if (cover_image !== undefined) { fields.push('cover_image = ?'); values.push(cover_image); }
    if (attachments !== undefined) { fields.push('attachments = ?'); values.push(typeof attachments === 'string' ? attachments : JSON.stringify(attachments)); }
    if (is_downloadable !== undefined) { fields.push('is_downloadable = ?'); values.push(is_downloadable ? 1 : 0); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }

    if (fields.length === 0) {
      return res.status(400).json({ error: '没有需要更新的字段' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.articleId);

    await dbRun(`UPDATE articles_v2 SET ${fields.join(', ')} WHERE id = ? AND item_id = ?`, [...values, req.params.itemId]);

    const article = await dbGet('SELECT * FROM articles_v2 WHERE id = ? AND item_id = ?', [req.params.articleId, req.params.itemId]);
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }

    res.json({ article, message: '文章更新成功' });
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({ error: '更新文章失败' });
  }
});

// 删除文章
router.delete('/:itemId/articles/:articleId', authenticate(), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    await dbRun('DELETE FROM articles_v2 WHERE id = ? AND item_id = ?', [req.params.articleId, req.params.itemId]);
    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({ error: '删除文章失败' });
  }
});

// 下载文章（作为文件下载）
router.get('/:itemId/articles/:articleId/download', async (req, res) => {
  try {
    const article = await dbGet(
      'SELECT * FROM articles_v2 WHERE id = ? AND item_id = ? AND is_downloadable = 1',
      [req.params.articleId, req.params.itemId]
    );
    if (!article) {
      return res.status(404).json({ error: '文章不存在或不可下载' });
    }

    const ext = article.content_type === 'markdown' ? 'md' : 'txt';
    const filename = `${article.title}.${ext}`;
    const mimeType = article.content_type === 'markdown' ? 'text/markdown' : 'text/plain';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(article.content);
  } catch (error) {
    console.error('下载文章失败:', error);
    res.status(500).json({ error: '下载文章失败' });
  }
});

// 下载整本书为 ZIP
router.get('/:id/export', async (req, res) => {
  try {
    const item = await dbGet('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    const { default: Archiver } = await import('archiver');

    // 获取所有卷、章节、文章
    const volumes = await dbAll('SELECT * FROM volumes WHERE item_id = ? ORDER BY sort_order', [item.id]);
    const chapters = await dbAll('SELECT * FROM chapters WHERE item_id = ? ORDER BY sort_order', [item.id]);
    const articles = await dbAll('SELECT * FROM articles_v2 WHERE item_id = ? ORDER BY sort_order', [item.id]);

    const format = (req.query.format || 'markdown') === 'txt' ? 'txt' : 'markdown';
    const ext = format === 'markdown' ? 'md' : 'txt';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.title || 'export')}.zip"`);

    const archive = Archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // TOC index file
    let tocLines = [`# ${item.title}\n\n`];

    if (volumes.length > 0) {
      for (const vol of volumes) {
        const volChapters = chapters.filter(c => c.volume_id === vol.id);
        tocLines.push(`## ${vol.title}\n`);
        for (const ch of volChapters) {
          const chArticles = articles.filter(a => a.chapter_id === ch.id);
          for (const art of chArticles) {
            const filePath = `${vol.title}/${ch.title}/${art.title}.${ext}`;
            tocLines.push(`- [${art.title}](${filePath})`);
            archive.append(art.content || '', { name: filePath });
          }
          // standalone chapters (no articles)
          if (chArticles.length === 0) {
            const filePath = `${vol.title}/${ch.title}/README.${ext}`;
            tocLines.push(`- [${ch.title}](${filePath})`);
            archive.append(`${ch.title}\n${ch.description || ''}`, { name: filePath });
          }
        }
        tocLines.push('');
      }
    } else {
      // No volumes - flat structure by chapters
      for (const ch of chapters) {
        const chArticles = articles.filter(a => a.chapter_id === ch.id);
        for (const art of chArticles) {
          const filePath = `${ch.title}/${art.title}.${ext}`;
          tocLines.push(`- [${art.title}](${filePath})`);
          archive.append(art.content || '', { name: filePath });
        }
        if (chArticles.length === 0) {
          const filePath = `${ch.title}/README.${ext}`;
          tocLines.push(`- [${ch.title}](${filePath})`);
          archive.append(`${ch.title}\n${ch.description || ''}`, { name: filePath });
        }
      }

      // Orphan articles (no chapter)
      const orphanArticles = articles.filter(a => !a.chapter_id);
      if (orphanArticles.length > 0) {
        tocLines.push('\n## 未分类\n');
        for (const art of orphanArticles) {
          const filePath = `未分类/${art.title}.${ext}`;
          tocLines.push(`- [${art.title}](${filePath})`);
          archive.append(art.content || '', { name: filePath });
        }
      }
    }

    archive.append(tocLines.join('\n'), { name: `目录.${ext}` });
    await archive.finalize();
  } catch (error) {
    console.error('导出整书失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '导出失败' });
    }
  }
});

// 导出整本书为 EPUB
router.get('/:id/export/epub', async (req, res) => {
  try {
    const item = await dbGet('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    const { default: EPub } = await import('epub-gen-memory');
    const marked = (await import('marked')).marked;

    const volumes = await dbAll('SELECT * FROM volumes WHERE item_id = ? ORDER BY sort_order', [item.id]);
    const chapters = await dbAll('SELECT * FROM chapters WHERE item_id = ? ORDER BY sort_order', [item.id]);
    const articles = await dbAll('SELECT * FROM articles_v2 WHERE item_id = ? ORDER BY sort_order', [item.id]);

    // Build content array for epub-gen
    const content = [];

    if (volumes.length > 0) {
      for (const vol of volumes) {
        const volChapters = chapters.filter(c => c.volume_id === vol.id);
        content.push({ title: vol.title, data: `<h1>${vol.title}</h1>` });
        for (const ch of volChapters) {
          const chArticles = articles.filter(a => a.chapter_id === ch.id);
          content.push({ title: ch.title, data: `<h2>${ch.title}</h2>${ch.description ? `<p>${ch.description}</p>` : ''}` });
          for (const art of chArticles) {
            const html = art.content_type === 'markdown' && art.content ? marked(art.content) : (art.content || '').replace(/\n/g, '<br>');
            content.push({ title: art.title, data: html });
          }
        }
      }
    } else {
      for (const ch of chapters) {
        const chArticles = articles.filter(a => a.chapter_id === ch.id);
        content.push({ title: ch.title, data: `<h2>${ch.title}</h2>${ch.description ? `<p>${ch.description}</p>` : ''}` });
        for (const art of chArticles) {
          const html = art.content_type === 'markdown' && art.content ? marked(art.content) : (art.content || '').replace(/\n/g, '<br>');
          content.push({ title: art.title, data: html });
        }
      }
      const orphanArticles = articles.filter(a => !a.chapter_id);
      if (orphanArticles.length > 0) {
        for (const art of orphanArticles) {
          const html = art.content_type === 'markdown' && art.content ? marked(art.content) : (art.content || '').replace(/\n/g, '<br>');
          content.push({ title: art.title, data: html });
        }
      }
    }

    if (content.length === 0) {
      content.push({ title: '空内容', data: '<p>此书暂无内容。</p>' });
    }

    const epub = await new EPub({
      title: item.title || '未命名',
      author: 'jiaandmiya.com',
      publisher: 'jiaandmiya.com',
      content: content,
      css: `
        body { font-family: "Georgia", serif; line-height: 1.8; margin: 1em; color: #333; }
        h1 { color: #1a1a2e; border-bottom: 2px solid #0d9488; padding-bottom: 0.5em; }
        h2 { color: #16213e; margin-top: 1.5em; }
        h3 { color: #1a1a2e; }
        p { margin: 0.8em 0; text-indent: 2em; }
        blockquote { border-left: 4px solid #0d9488; padding-left: 1em; color: #666; margin: 1em 0; }
        pre { background: #f4f4f4; padding: 1em; border-radius: 0.3em; overflow-x: auto; font-size: 0.9em; }
        code { background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 0.2em; font-size: 0.9em; }
        img { max-width: 100%; }
      `
    });

    res.setHeader('Content-Type', 'application/epub+zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.title || 'export')}.epub"`);
    res.send(epub);
  } catch (error) {
    console.error('导出EPUB失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '导出EPUB失败', detail: error.message });
    }
  }
});

// 导出整本书为 PDF
router.get('/:id/export/pdf', async (req, res) => {
  try {
    const item = await dbGet('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    const marked = (await import('marked')).marked;

    const volumes = await dbAll('SELECT * FROM volumes WHERE item_id = ? ORDER BY sort_order', [item.id]);
    const chapters = await dbAll('SELECT * FROM chapters WHERE item_id = ? ORDER BY sort_order', [item.id]);
    const articles = await dbAll('SELECT * FROM articles_v2 WHERE item_id = ? ORDER BY sort_order', [item.id]);

    // Build full HTML
    let htmlParts = [];

    htmlParts.push(`<h1 style="color:#1a1a2e;border-bottom:3px solid #0d9488;padding-bottom:0.5em;">${item.title || '未命名'}</h1>`);
    if (item.description) {
      htmlParts.push(`<p style="color:#666;margin-bottom:2em;">${item.description}</p>`);
    }

    if (volumes.length > 0) {
      for (const vol of volumes) {
        htmlParts.push(`<div style="page-break-before:always;"><h2 style="color:#16213e;border-bottom:1px solid #ddd;padding-bottom:0.3em;">${vol.title}</h2></div>`);
        const volChapters = chapters.filter(c => c.volume_id === vol.id);
        for (const ch of volChapters) {
          htmlParts.push(`<h3 style="color:#1a1a2e;margin-top:1.5em;">${ch.title}</h3>`);
          if (ch.description) htmlParts.push(`<p style="color:#666;">${ch.description}</p>`);
          const chArticles = articles.filter(a => a.chapter_id === ch.id);
          for (const art of chArticles) {
            const body = art.content_type === 'markdown' && art.content ? marked(art.content) : (art.content || '').replace(/\n/g, '<br>');
            htmlParts.push(`<div style="margin:1em 0;">${body}</div>`);
          }
        }
      }
    } else {
      for (const ch of chapters) {
        htmlParts.push(`<div style="page-break-before:always;"><h2 style="color:#16213e;margin-top:1.5em;">${ch.title}</h2></div>`);
        if (ch.description) htmlParts.push(`<p style="color:#666;">${ch.description}</p>`);
        const chArticles = articles.filter(a => a.chapter_id === ch.id);
        for (const art of chArticles) {
          const body = art.content_type === 'markdown' && art.content ? marked(art.content) : (art.content || '').replace(/\n/g, '<br>');
          htmlParts.push(`<div style="margin:1em 0;">${body}</div>`);
        }
      }
      const orphanArticles = articles.filter(a => !a.chapter_id);
      if (orphanArticles.length > 0) {
        htmlParts.push(`<h2 style="margin-top:2em;">未分类</h2>`);
        for (const art of orphanArticles) {
          const body = art.content_type === 'markdown' && art.content ? marked(art.content) : (art.content || '').replace(/\n/g, '<br>');
          htmlParts.push(`<div style="margin:1em 0;">${body}</div>`);
        }
      }
    }

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body { font-family: "Georgia", "Source Han Serif SC", "Songti SC", "Noto Serif SC", "SimSun", serif; line-height: 1.8; margin: 2em; color: #333; max-width: 700px; }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.2em; }
      p { margin: 0.6em 0; text-indent: 2em; }
      blockquote { border-left: 4px solid #0d9488; padding-left: 1em; color: #666; margin: 1em 0; font-style: italic; }
      pre { background: #f4f4f4; padding: 1em; border-radius: 0.3em; overflow-x: auto; font-size: 0.85em; white-space: pre-wrap; }
      code { background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 0.2em; font-size: 0.9em; }
      img { max-width: 100%; }
      a { color: #0d9488; }
    </style></head><body>${htmlParts.join('\n')}</body></html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.title || 'export')}.html"`);
    // Return printable HTML - browser can print-to-PDF natively
    res.send(fullHtml);
  } catch (error) {
    console.error('导出PDF失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '导出PDF失败', detail: error.message });
    }
  }
});

// EPUB 导入（上传 .epub 文件，解析并创建内容结构）
router.post('/:id/import/epub', authenticate(), upload.single('file'), async (req, res) => {
  try {
    if (!hasPermission(req.user, 'editor')) {
      return res.status(403).json({ error: '需要编辑者权限' });
    }

    const item = await dbGet('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: '内容项不存在' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '请上传 EPUB 文件' });
    }

    const AdmZip = (await import('adm-zip')).default;
    const path = require('path');

    let zip;
    try {
      zip = new AdmZip(req.file.path);
    } catch {
      return res.status(400).json({ error: '无法解析 EPUB 文件，请确保文件格式正确' });
    }

    // Find and parse content.opf
    const opfEntry = zip.getEntry('OEBPS/content.opf') || zip.getEntry('content.opf');
    if (!opfEntry) {
      // Try to find any .opf file
      const opfFiles = zip.getEntries().filter((e) => e.entryName.endsWith('.opf'));
      if (opfFiles.length === 0) {
        return res.status(400).json({ error: '无法找到 EPUB 内容描述文件' });
      }
    }

    // Extract all HTML/XHTML files and parse them
    const htmlEntries = zip.getEntries().filter((e) =>
      !e.isDirectory && (e.entryName.endsWith('.html') || e.entryName.endsWith('.xhtml') || e.entryName.endsWith('.htm'))
    );

    // Sort by filename for reading order
    htmlEntries.sort((a, b) => a.entryName.localeCompare(b.entryName));

    const { cleanupTempFiles: _cleanupTempFiles } = require('../utils/fileUpload');
    let createdChapters = 0;
    let createdArticles = 0;

    for (const entry of htmlEntries) {
      const content = zip.readAsText(entry, 'utf-8');

      // Extract title from HTML
      const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i) || content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
      let title = titleMatch ? titleMatch[1].trim() : path.basename(entry.entryName, path.extname(entry.entryName));

      // Strip HTML tags to get plain text
      const plainText = content
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

      if (!plainText || plainText.length < 10) continue;

      // Determine content type: keep as markdown if it looks like it
      const contentType = 'txt';

      // Create chapter for each major section (simplified: one chapter per file)
      const chapterResult = await dbRun(
        'INSERT INTO chapters (item_id, title, sort_order) VALUES (?, ?, ?)',
        [item.id, title, createdChapters]
      );

      // Create article with the content
      await dbRun(
        `INSERT INTO articles_v2 (chapter_id, item_id, title, content, content_type, sort_order, word_count)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [chapterResult.id, item.id, title, plainText, contentType, 0, plainText.length]
      );

      createdChapters++;
      createdArticles++;
    }

    // Cleanup temp file
    try { require('fs').unlinkSync(req.file.path); } catch {}

    res.json({
      message: 'EPUB 导入成功',
      imported: { chapters: createdChapters, articles: createdArticles }
    });
  } catch (error) {
    console.error('导入EPUB失败:', error);
    try { if (req.file) require('fs').unlinkSync(req.file.path); } catch {}
    res.status(500).json({ error: '导入EPUB失败', detail: error.message });
  }
});

// ─── 发布 / 取消发布 ───
router.put('/:id/publish', authenticate(), async (req, res) => {
  if (!hasPermission(req.user, 'editor')) return res.status(403).json({ error: '权限不足' })
  try {
    const { status } = req.body
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'status 必须为 draft 或 published' })
    }
    await dbRun('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id])
    res.json({ success: true, status })
  } catch (error) {
    res.status(500).json({ error: '更新发布状态失败', detail: error.message })
  }
})

router.put('/articles/:articleId/publish', authenticate(), async (req, res) => {
  if (!hasPermission(req.user, 'editor')) return res.status(403).json({ error: '权限不足' })
  try {
    const { status } = req.body
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'status 必须为 draft 或 published' })
    }
    await dbRun('UPDATE articles_v2 SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.articleId])
    res.json({ success: true, status })
  } catch (error) {
    res.status(500).json({ error: '更新发布状态失败', detail: error.message })
  }
})

module.exports = router;
