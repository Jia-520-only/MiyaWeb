const express = require('express');
const fs = require('fs');
const { dbAll, dbGet, dbRun } = require('../database/db');
const { authenticate, hasPermission } = require('../utils/jwt');
const { 
  upload, 
  generateThumbnail, 
  compressImage,
  getFileInfo, 
  cleanupTempFiles,
  getRelativePath 
} = require('../utils/fileUpload');

const router = express.Router();

// 单个文件上传
router.post('/single', authenticate(), upload.single('file'), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      cleanupTempFiles(req.file);
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }
    
    // 获取文件信息
    const fileInfo = await getFileInfo(req.file.path);

    // 自动压缩大图
    let compressedPath = req.file.path;
    try {
      const result = await compressImage(req.file.path);
      if (result.compressed && result.newPath) {
        compressedPath = result.newPath;
        const newInfo = await getFileInfo(compressedPath);
        if (newInfo) Object.assign(fileInfo, newInfo);
      }
    } catch (compressErr) {
      console.warn('自动压缩失败:', compressErr.message);
    }

    // 生成缩略图
    let thumbPath = null;
    try {
      thumbPath = await generateThumbnail(compressedPath, req.file.filename);
    } catch (thumbError) {
      console.warn('生成缩略图失败:', thumbError.message);
    }
    
    // 保存到数据库
    const result = await dbRun(
      `INSERT INTO uploads (
        user_id, filename, original_name, path, mime_type, size, 
        width, height, thumb_path, alt_text, description, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        req.file.filename,
        req.file.originalname,
        getRelativePath(compressedPath),
        fileInfo.mimeType,
        fileInfo.size,
        fileInfo.width || null,
        fileInfo.height || null,
        thumbPath ? getRelativePath(thumbPath) : null,
        req.body.altText || null,
        req.body.description || null,
        req.body.isPublic !== 'false' ? 1 : 0
      ]
    );
    
    // 获取上传的文件信息
    const uploadedFile = await dbGet(
      'SELECT * FROM uploads WHERE id = ?',
      [result.id]
    );
    
    const fileUrl = uploadedFile.path;
    let thumbUrl = null;
    
    if (uploadedFile.thumb_path) {
      thumbUrl = uploadedFile.thumb_path;
    }
    
    res.status(201).json({
      message: '文件上传成功',
      file: {
        id: uploadedFile.id,
        filename: uploadedFile.filename,
        originalName: uploadedFile.original_name,
        url: fileUrl,
        thumbUrl: thumbUrl,
        mimeType: uploadedFile.mime_type,
        size: uploadedFile.size,
        width: uploadedFile.width,
        height: uploadedFile.height,
        altText: uploadedFile.alt_text,
        description: uploadedFile.description,
        isPublic: Boolean(uploadedFile.is_public),
        createdAt: uploadedFile.created_at
      }
    });
    
  } catch (error) {
    console.error('[UPLOAD ERROR]', error.message, error.code || '');
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 多个文件上传
router.post('/multiple', authenticate(), upload.array('files', 10), async (req, res) => {
  try {
    // 检查权限
    if (!hasPermission(req.user, 'editor')) {
      cleanupTempFiles(req.files);
      return res.status(403).json({ error: '需要编辑者权限' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }
    
    const uploadedFiles = [];
    
    // 处理每个文件
    for (const file of req.files) {
      try {
        // 获取文件信息
        const fileInfo = await getFileInfo(file.path);
        
        // 生成缩略图
        let thumbPath = null;
        try {
          thumbPath = await generateThumbnail(file.path, file.filename);
        } catch (thumbError) {
          console.warn('生成缩略图失败:', thumbError.message);
        }
        
        // 保存到数据库
        const result = await dbRun(
          `INSERT INTO uploads (
            user_id, filename, original_name, path, mime_type, size, 
            width, height, thumb_path, is_public
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.userId,
            file.filename,
            file.originalname,
            getRelativePath(file.path),
            fileInfo.mimeType,
            fileInfo.size,
            fileInfo.width || null,
            fileInfo.height || null,
            thumbPath ? getRelativePath(thumbPath) : null,
            1 // 默认公开
          ]
        );
        
        // 获取上传的文件信息
        const uploadedFile = await dbGet(
          'SELECT * FROM uploads WHERE id = ?',
          [result.id]
        );
        
        const fileUrl = uploadedFile.path;
        let thumbUrl = null;
        
        if (uploadedFile.thumb_path) {
          thumbUrl = uploadedFile.thumb_path;
        }
        
        uploadedFiles.push({
          id: uploadedFile.id,
          filename: uploadedFile.filename,
          originalName: uploadedFile.original_name,
          url: fileUrl,
          thumbUrl: thumbUrl,
          mimeType: uploadedFile.mime_type,
          size: uploadedFile.size,
          width: uploadedFile.width,
          height: uploadedFile.height,
          createdAt: uploadedFile.created_at
        });
        
      } catch (fileError) {
        console.error(`处理文件 ${file.originalname} 失败:`, fileError);
        // 继续处理其他文件
      }
    }
    
    if (uploadedFiles.length === 0) {
      cleanupTempFiles(req.files);
      return res.status(500).json({ error: '所有文件上传都失败了' });
    }
    
    res.status(201).json({
      message: `${uploadedFiles.length} 个文件上传成功`,
      files: uploadedFiles,
      total: req.files.length,
      success: uploadedFiles.length,
      failed: req.files.length - uploadedFiles.length
    });
    
  } catch (error) {
    console.error('批量文件上传失败:', error);
    cleanupTempFiles(req.files);
    res.status(500).json({ error: '批量文件上传失败' });
  }
});

// 获取文件列表（需要认证）
router.get('/', authenticate(), async (req, res) => {
  try {
    const { page = 1, limit = 20, mimeType, search, userOnly } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        u.*,
        usr.username as uploader_username,
        usr.display_name as uploader_display_name
      FROM uploads u
      LEFT JOIN users usr ON u.user_id = usr.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // 如果用户不是管理员，只能看到自己的文件或公开文件
    if (!hasPermission(req.user, 'admin')) {
      if (userOnly === 'true') {
        query += ' AND u.user_id = ?';
        params.push(req.user.userId);
      } else {
        query += ' AND (u.user_id = ? OR u.is_public = 1)';
        params.push(req.user.userId);
      }
    }
    
    // 过滤条件
    if (mimeType) {
      query += ' AND u.mime_type LIKE ?';
      params.push(`%${mimeType}%`);
    }
    
    if (search) {
      query += ' AND (u.original_name LIKE ? OR u.filename LIKE ? OR u.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    const countResult = await dbGet(countQuery, params);
    const total = countResult.total;
    
    // 添加排序和分页
    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    // 执行查询
    const files = await dbAll(query, params);
    
    const parsedFiles = files.map(file => {
      const fileUrl = file.path;
      let thumbUrl = null;
      
      if (file.thumb_path) {
        thumbUrl = file.thumb_path;
      }
      
      return {
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        url: fileUrl,
        thumbUrl: thumbUrl,
        mimeType: file.mime_type,
        size: file.size,
        width: file.width,
        height: file.height,
        altText: file.alt_text,
        description: file.description,
        isPublic: Boolean(file.is_public),
        uploader: {
          id: file.user_id,
          username: file.uploader_username,
          displayName: file.uploader_display_name
        },
        createdAt: file.created_at
      };
    });
    
    res.json({
      files: parsedFiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

// 获取单个文件信息
router.get('/:id', authenticate(), async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await dbGet(`
      SELECT 
        u.*,
        usr.username as uploader_username,
        usr.display_name as uploader_display_name
      FROM uploads u
      LEFT JOIN users usr ON u.user_id = usr.id
      WHERE u.id = ?
    `, [id]);
    
    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 检查权限：非管理员只能访问自己的文件或公开文件
    if (!hasPermission(req.user, 'admin') && 
        file.user_id !== req.user.userId && 
        !file.is_public) {
      return res.status(403).json({ error: '无权访问此文件' });
    }
    
    const fileUrl = file.path;
    let thumbUrl = null;
    
    if (file.thumb_path) {
      thumbUrl = file.thumb_path;
    }
    
    res.json({
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      url: fileUrl,
      thumbUrl: thumbUrl,
      mimeType: file.mime_type,
      size: file.size,
      width: file.width,
      height: file.height,
      altText: file.alt_text,
      description: file.description,
      isPublic: Boolean(file.is_public),
      uploader: {
        id: file.user_id,
        username: file.uploader_username,
        displayName: file.uploader_display_name
      },
      createdAt: file.created_at
    });
    
  } catch (error) {
    console.error('获取文件信息失败:', error);
    res.status(500).json({ error: '获取文件信息失败' });
  }
});

// 更新文件信息
router.put('/:id', authenticate(), async (req, res) => {
  try {
    const { id } = req.params;
    const { altText, description, isPublic } = req.body;
    
    // 检查文件是否存在
    const file = await dbGet('SELECT * FROM uploads WHERE id = ?', [id]);
    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 检查权限：只能更新自己的文件，或管理员可以更新任何文件
    if (!hasPermission(req.user, 'admin') && file.user_id !== req.user.userId) {
      return res.status(403).json({ error: '只能更新自己的文件' });
    }
    
    // 更新文件信息
    await dbRun(
      'UPDATE uploads SET alt_text = ?, description = ?, is_public = ? WHERE id = ?',
      [altText || null, description || null, isPublic ? 1 : 0, id]
    );
    
    res.json({ message: '文件信息更新成功' });
    
  } catch (error) {
    console.error('更新文件信息失败:', error);
    res.status(500).json({ error: '更新文件信息失败' });
  }
});

// 删除文件
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查文件是否存在
    const file = await dbGet('SELECT * FROM uploads WHERE id = ?', [id]);
    if (!file) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 检查权限：只能删除自己的文件，或管理员可以删除任何文件
    if (!hasPermission(req.user, 'admin') && file.user_id !== req.user.userId) {
      return res.status(403).json({ error: '只能删除自己的文件' });
    }
    
    // 从磁盘删除文件
    const path = require('path');
    
    try {
      if (file.path && fs.existsSync(path.join(process.cwd(), file.path))) {
        fs.unlinkSync(path.join(process.cwd(), file.path));
      }
      
      if (file.thumb_path && fs.existsSync(path.join(process.cwd(), file.thumb_path))) {
        fs.unlinkSync(path.join(process.cwd(), file.thumb_path));
      }
    } catch (fsError) {
      console.warn('删除磁盘文件失败:', fsError.message);
    }
    
    // 从数据库删除记录
    await dbRun('DELETE FROM uploads WHERE id = ?', [id]);
    
    res.json({ message: '文件删除成功' });
    
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
});

// 获取图片库（公开接口，只返回公开的图片）
router.get('/gallery/images', async (req, res) => {
  try {
    const { limit = 20, category } = req.query;
    
    let query = `
      SELECT 
        id, filename, original_name, path, thumb_path,
        width, height, alt_text, description, created_at
      FROM uploads
      WHERE is_public = 1 
        AND mime_type LIKE 'image/%'
    `;
    
    const params = [];
    
    // 可以按描述内容分类（简单实现）
    if (category) {
      query += ' AND (description LIKE ? OR alt_text LIKE ?)';
      const searchTerm = `%${category}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const images = await dbAll(query, params);
    
    const parsedImages = images.map(img => {
      const imageUrl = img.path;
      let thumbUrl = null;
      
      if (img.thumb_path) {
        thumbUrl = img.thumb_path;
      }
      
      return {
        id: img.id,
        originalName: img.original_name,
        url: imageUrl,
        thumbUrl: thumbUrl,
        width: img.width,
        height: img.height,
        altText: img.alt_text,
        description: img.description,
        createdAt: img.created_at
      };
    });
    
    res.json({ images: parsedImages });
    
  } catch (error) {
    console.error('获取图片库失败:', error);
    res.status(500).json({ error: '获取图片库失败' });
  }
});

module.exports = router;