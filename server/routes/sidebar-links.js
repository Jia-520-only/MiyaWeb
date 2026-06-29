const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database/db');
const { authenticate } = require('../utils/jwt');

// Public: list all links
router.get('/', async (req, res) => {
  try {
    const links = await dbAll('SELECT * FROM sidebar_links ORDER BY sort_order ASC');
    res.json({ links: links || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create (auth required)
router.post('/', authenticate(), async (req, res) => {
  try {
    const { label, url } = req.body;
    if (!label || !url) return res.status(400).json({ error: 'label 和 url 必填' });
    const maxOrder = await dbGet('SELECT MAX(sort_order) as max FROM sidebar_links');
    await dbRun('INSERT INTO sidebar_links (label, url, sort_order) VALUES (?, ?, ?)',
      [label, url, (maxOrder?.max ?? -1) + 1]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete (auth required)
router.delete('/:id', authenticate(), async (req, res) => {
  try {
    await dbRun('DELETE FROM sidebar_links WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Reorder (auth required)
router.put('/sort', authenticate(), async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids 必须是数组' });
    for (let i = 0; i < ids.length; i++) {
      await dbRun('UPDATE sidebar_links SET sort_order = ? WHERE id = ?', [i, ids[i]]);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
