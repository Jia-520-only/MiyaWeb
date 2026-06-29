const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database/db');
const { authenticate } = require('../utils/jwt');

const stripHost = (str) => {
  if (!str) return str;
  return str.replace(/^https?:\/\/[^/]+/, '');
};

// Get all OC images (for community gallery)
router.get('/', async (req, res) => {
  try {
    const images = await dbAll(`
      SELECT oi.id, oi.item_id, oi.sort_order, oi.created_at,
             u.id as upload_id, u.path, u.thumb_path, u.original_name, u.width, u.height,
             i.title as item_title, i.cover_image as item_cover
      FROM oc_images oi
      JOIN uploads u ON oi.upload_id = u.id
      JOIN items i ON oi.item_id = i.id
      WHERE i.status = 'published'
      ORDER BY oi.sort_order ASC, oi.created_at DESC
    `);
    const cleaned = (images || []).map(img => ({
      ...img,
      path: stripHost(img.path),
      thumb_path: stripHost(img.thumb_path),
      item_cover: stripHost(img.item_cover)
    }));
    res.json({ images: cleaned });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get images for a specific OC
router.get('/item/:itemId', async (req, res) => {
  try {
    const images = await dbAll(`
      SELECT oi.id, oi.item_id, oi.sort_order, oi.created_at,
             u.id as upload_id, u.path, u.thumb_path, u.original_name, u.width, u.height
      FROM oc_images oi
      JOIN uploads u ON oi.upload_id = u.id
      WHERE oi.item_id = ?
      ORDER BY oi.sort_order ASC, oi.created_at DESC
    `, [req.params.itemId]);
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

// Assign upload to OC (from existing uploads)
router.post('/', authenticate(), async (req, res) => {
  try {
    const { item_id, upload_id } = req.body;
    if (!item_id || !upload_id) return res.status(400).json({ error: 'item_id 和 upload_id 必填' });

    const existing = await dbGet('SELECT id FROM oc_images WHERE item_id = ? AND upload_id = ?', [item_id, upload_id]);
    if (existing) return res.status(409).json({ error: '该图片已关联到此 OC' });

    const maxOrder = await dbGet('SELECT MAX(sort_order) as max FROM oc_images WHERE item_id = ?', [item_id]);
    const sortOrder = (maxOrder?.max ?? -1) + 1;

    const result = await dbRun(
      'INSERT INTO oc_images (item_id, upload_id, sort_order) VALUES (?, ?, ?)',
      [item_id, upload_id, sortOrder]
    );
    res.json({ id: result.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    await dbRun('DELETE FROM oc_images WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
