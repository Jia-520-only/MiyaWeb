const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const { dbRun, dbGet, dbAll } = require('../database/db');
const { authenticate } = require('../utils/jwt');

const uploadDir = path.join(__dirname, '..', 'uploads', 'banner-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `banner_${timestamp}_${random}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only jpg/png/gif/webp allowed'));
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});

const stripHost = (str) => {
  if (!str) return str;
  return str.replace(/^https?:\/\/[^/]+/, '');
};

// List
router.get('/', async (req, res) => {
  try {
    const images = await dbAll('SELECT * FROM banner_images ORDER BY id ASC');
    const cleaned = (images || []).map(img => ({
      ...img,
      path: stripHost(img.path),
      thumb_path: stripHost(img.thumb_path)
    }));
    res.json({ images: cleaned });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 从已有上传分发
router.post('/distribute', authenticate(), async (req, res) => {
  try {
    const { upload_id } = req.body
    if (!upload_id) return res.status(400).json({ error: 'upload_id required' })

    const upload = await dbGet('SELECT * FROM uploads WHERE id = ?', [upload_id])
    if (!upload) return res.status(404).json({ error: 'Upload not found' })

    const srcPath = path.join(__dirname, '..', upload.path)
    if (!fs.existsSync(srcPath)) return res.status(404).json({ error: 'Source file not found' })

    const ext = path.extname(upload.filename).toLowerCase()
    const newFilename = `banner_${Date.now()}_${Math.random().toString(36).substring(2,8)}${ext}`
    const destPath = path.join(uploadDir, newFilename)
    fs.copyFileSync(srcPath, destPath)

    const maxOrder = await dbGet('SELECT MAX(sort_order) as max FROM banner_images')
    const sortOrder = (maxOrder?.max ?? -1) + 1

    const result = await dbRun(
      `INSERT INTO banner_images (filename, original_name, path, mime_type, size, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [newFilename, upload.original_name, `/uploads/banner-images/${newFilename}`, upload.mime_type, upload.size, sortOrder]
    )
    res.json({ image: await dbGet('SELECT * FROM banner_images WHERE id = ?', [result.id]) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
});

// Upload
router.post('/', authenticate(), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    const filePath = req.file.path;
    const ext = path.extname(req.file.filename).toLowerCase();
    const thumbFilename = `thumb_${path.basename(req.file.filename, ext)}.webp`;
    const thumbPath = path.join(uploadDir, thumbFilename);

    let metadata = {};
    try {
      const info = await sharp(filePath).metadata();
      metadata = { width: info.width, height: info.height };
      await sharp(filePath).resize(400, 400, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toFile(thumbPath);
    } catch (e) { /* skip */ }

    let finalSize = fs.statSync(filePath).size;
    if (finalSize > 500 * 1024) {
      try {
        const tmpPath = filePath + '.tmp';
        await sharp(filePath).resize(1920, 1920, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(tmpPath);
        fs.unlinkSync(filePath);
        fs.renameSync(tmpPath, filePath);
        finalSize = fs.statSync(filePath).size;
      } catch (e) { /* keep original */ }
    }

    const maxOrder = await dbGet('SELECT MAX(sort_order) as max FROM banner_images');
    const sortOrder = (maxOrder?.max ?? -1) + 1;

    const result = await dbRun(
      `INSERT INTO banner_images (filename, original_name, path, thumb_path, mime_type, size, width, height, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.file.filename, req.file.originalname, `/uploads/banner-images/${req.file.filename}`, `/uploads/banner-images/${thumbFilename}`, req.file.mimetype, finalSize, metadata.width || null, metadata.height || null, sortOrder]
    );

    const image = await dbGet('SELECT * FROM banner_images WHERE id = ?', [result.id]);
    res.json({ image });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    const image = await dbGet('SELECT * FROM banner_images WHERE id = ?', [req.params.id]);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    const filePath = path.join(uploadDir, image.filename);
    let thumbPath = null;
    if (image.thumb_path) thumbPath = path.join(__dirname, '..', image.thumb_path);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) { }
    try { if (thumbPath && fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath); } catch (e) { }

    await dbRun('DELETE FROM banner_images WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Sort
router.put('/sort', authenticate(), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids required' });
    for (let idx = 0; idx < ids.length; idx++) {
      await dbRun('UPDATE banner_images SET sort_order = ? WHERE id = ?', [idx, ids[idx]]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
