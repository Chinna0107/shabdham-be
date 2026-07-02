const router = require('express').Router();
const pool = require('../db');

// Public + Admin: GET all categories with parent name
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, p.name AS parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: CREATE category
router.post('/', async (req, res) => {
  try {
    const { name, slug, parent_id = null, sort_order = 0, show_in_header = false } = req.body;
    const result = await pool.query(
      `INSERT INTO categories (name, slug, parent_id, sort_order, show_in_header)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, slug, parent_id, sort_order, show_in_header]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: UPDATE category
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, parent_id, sort_order, show_in_header } = req.body;
    const result = await pool.query(
      `UPDATE categories SET name=$1, slug=$2, parent_id=$3, sort_order=$4, show_in_header=$5
       WHERE id=$6 RETURNING *`,
      [name, slug, parent_id, sort_order, show_in_header, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: DELETE category
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
