const router = require('express').Router();
const pool = require('../db');

// Public: GET all active epapers (latest first)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM epapers WHERE is_active = true ORDER BY published_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: GET epaper by date (YYYY-MM-DD)
router.get('/date/:date', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM epapers WHERE published_date = $1 AND is_active = true`,
      [req.params.date]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'No edition found for this date' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: GET all epapers (including inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM epapers ORDER BY published_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: CREATE epaper
router.post('/', async (req, res) => {
  try {
    const { title = 'Main Edition', published_date, cover_image, pdf_url, pages = 1, is_active = true } = req.body;
    const result = await pool.query(
      `INSERT INTO epapers (title, published_date, cover_image, pdf_url, pages, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, published_date, cover_image, pdf_url, pages, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: UPDATE epaper
router.put('/:id', async (req, res) => {
  try {
    const { title, published_date, cover_image, pdf_url, pages, is_active } = req.body;
    const result = await pool.query(
      `UPDATE epapers SET title=$1, published_date=$2, cover_image=$3, pdf_url=$4, pages=$5, is_active=$6
       WHERE id=$7 RETURNING *`,
      [title, published_date, cover_image, pdf_url, pages, is_active, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: DELETE epaper
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM epapers WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
