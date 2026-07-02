const router = require('express').Router();
const pool = require('../db');

// Public: GET all active ads
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM advertisements WHERE is_active = true ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: GET all ads (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM advertisements ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: CREATE ad
router.post('/', async (req, res) => {
  try {
    const { title, image_url, link_url, position = 'sidebar', is_active = true } = req.body;
    const result = await pool.query(
      `INSERT INTO advertisements (title, image_url, link_url, position, is_active)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, image_url, link_url, position, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: UPDATE ad
router.put('/:id', async (req, res) => {
  try {
    const { title, image_url, link_url, position, is_active } = req.body;
    const result = await pool.query(
      `UPDATE advertisements SET title=$1, image_url=$2, link_url=$3, position=$4, is_active=$5
       WHERE id=$6 RETURNING *`,
      [title, image_url, link_url, position, is_active, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: DELETE ad
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM advertisements WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
