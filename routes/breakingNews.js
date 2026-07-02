const router = require('express').Router();
const pool = require('../db');

// Public: GET active breaking news
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, n.slug AS article_slug
       FROM breaking_news b
       LEFT JOIN news n ON b.article_id = n.id
       WHERE b.is_active = true
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: GET all breaking news
router.get('/admin/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, n.slug AS article_slug, n.title AS article_title
       FROM breaking_news b
       LEFT JOIN news n ON b.article_id = n.id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: CREATE breaking news
router.post('/', async (req, res) => {
  try {
    const { title, article_id = null, is_active = true } = req.body;
    const result = await pool.query(
      `INSERT INTO breaking_news (title, article_id, is_active) VALUES ($1, $2, $3) RETURNING *`,
      [title, article_id, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: UPDATE breaking news (toggle active or edit)
router.put('/:id', async (req, res) => {
  try {
    const { title, article_id, is_active } = req.body;
    const result = await pool.query(
      `UPDATE breaking_news SET title=$1, article_id=$2, is_active=$3 WHERE id=$4 RETURNING *`,
      [title, article_id, is_active, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: DELETE breaking news
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM breaking_news WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
