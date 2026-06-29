const express = require('express');
const router = express.Router();
const { dbRun, dbGet } = require('../database/db');

// Get total site views
router.get('/', async (req, res) => {
  try {
    const row = await dbGet('SELECT SUM(count) as total FROM analytics');
    res.json({ total: row?.total || 0 });
  } catch (e) {
    res.json({ total: 0 });
  }
});

// Increment page view
router.post('/hit', async (req, res) => {
  try {
    const { page } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const existing = await dbGet('SELECT count FROM analytics WHERE page = ? AND date = ?', [page || '/', today]);
    if (existing) {
      await dbRun('UPDATE analytics SET count = count + 1 WHERE page = ? AND date = ?', [page || '/', today]);
    } else {
      await dbRun('INSERT INTO analytics (page, date, count) VALUES (?, ?, 1)', [page || '/', today]);
    }
    const total = await dbGet('SELECT SUM(count) as total FROM analytics');
    res.json({ total: total?.total || 0 });
  } catch (e) {
    res.json({ total: 0 });
  }
});

module.exports = router;
