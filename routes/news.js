const router = require('express').Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

async function resolveCategoryId(categoryName) {
  if (!categoryName) return null;
  const existing = await pool.query('SELECT id FROM categories WHERE name=$1', [categoryName]);
  if (existing.rows.length) return existing.rows[0].id;
  const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  const created = await pool.query(
    'INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id',
    [categoryName, slug]
  );
  return created.rows[0].id;
}

// Admin: dashboard stats
router.get('/admin/stats', authMiddleware, async (req, res) => {
  try {
    const [total, published, drafts, cats, breaking, pending] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM news'),
      pool.query('SELECT COUNT(*) FROM news WHERE is_published=true AND status=\'approved\''),
      pool.query('SELECT COUNT(*) FROM news WHERE is_published=false'),
      pool.query('SELECT COUNT(*) FROM categories'),
      pool.query('SELECT COUNT(*) FROM breaking_news WHERE is_active=true'),
      pool.query('SELECT COUNT(*) FROM news WHERE status=\'pending\''),
    ]);
    const recent = await pool.query(
      `SELECT n.title, n.slug, n.image, n.created_at, c.name AS category
       FROM news n LEFT JOIN categories c ON n.category_id=c.id
       ORDER BY n.created_at DESC LIMIT 5`
    );
    const topAuthors = await pool.query(
      `SELECT author, COUNT(*) AS posts FROM news
       WHERE author IS NOT NULL AND author != ''
       GROUP BY author ORDER BY posts DESC LIMIT 5`
    );
    res.json({
      total: parseInt(total.rows[0].count),
      published: parseInt(published.rows[0].count),
      drafts: parseInt(drafts.rows[0].count),
      categories: parseInt(cats.rows[0].count),
      activeBreaking: parseInt(breaking.rows[0].count),
      pending: parseInt(pending.rows[0].count),
      recentNews: recent.rows,
      topAuthors: topAuthors.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: all news including unpublished
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, c.name AS category FROM news n
       LEFT JOIN categories c ON n.category_id=c.id
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: pending news
router.get('/admin/pending', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, c.name AS category, u.name AS creator_name FROM news n
       LEFT JOIN categories c ON n.category_id=c.id
       LEFT JOIN admin_users u ON n.created_by=u.id
       WHERE n.status='pending'
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employee: my news
router.get('/employee/my-news', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, c.name AS category FROM news n
       LEFT JOIN categories c ON n.category_id=c.id
       WHERE n.created_by=$1
       ORDER BY n.created_at DESC`,
      [req.admin.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: all trending
router.get('/admin/trending', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, c.name AS category FROM news n
       LEFT JOIN categories c ON n.category_id=c.id
       WHERE n.is_trending=true ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: trending news
router.get('/trending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, c.name AS category FROM news n
       LEFT JOIN categories c ON n.category_id=c.id
       WHERE n.is_trending=true AND n.is_published=true AND n.status='approved' ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: all published news
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT n.*, c.name AS category, c.slug AS category_slug
      FROM news n LEFT JOIN categories c ON n.category_id=c.id
      WHERE n.is_published=true AND n.status='approved'
    `;
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND (
        c.slug=$${params.length} OR c.name=$${params.length}
        OR c.parent_id IN (SELECT id FROM categories WHERE slug=$${params.length} OR name=$${params.length})
      )`;
    }
    params.push(limit, offset);
    query += ` ORDER BY n.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, c.name AS category, c.slug AS category_slug
       FROM news n LEFT JOIN categories c ON n.category_id=c.id
       WHERE n.slug=$1 AND n.is_published=true AND n.status='approved'`,
      [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Article not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create news (Admin or Employee)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, slug, content, excerpt, image, author, category, is_published = true, is_trending = false, created_at } = req.body;
    const category_id = await resolveCategoryId(category);
    
    // Determine status based on role
    const status = (req.admin.role === 'employee') ? 'pending' : 'approved';
    const created_by = req.admin.id;

    let result;
    if (created_at) {
      result = await pool.query(
        `INSERT INTO news (title, slug, content, excerpt, image, author, category_id, is_published, is_trending, created_at, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [title, slug, content, excerpt, image, author, category_id, is_published, is_trending, created_at, status, created_by]
      );
    } else {
      result = await pool.query(
        `INSERT INTO news (title, slug, content, excerpt, image, author, category_id, is_published, is_trending, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [title, slug, content, excerpt, image, author, category_id, is_published, is_trending, status, created_by]
      );
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/Employee: update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, slug, content, excerpt, image, author, category, is_published, is_trending = false, created_at } = req.body;
    const category_id = await resolveCategoryId(category);
    
    let result;
    if (created_at) {
      result = await pool.query(
        `UPDATE news SET title=$1, slug=$2, content=$3, excerpt=$4, image=$5,
         author=$6, category_id=$7, is_published=$8, is_trending=$9, created_at=$10, updated_at=NOW()
         WHERE id=$11 RETURNING *`,
        [title, slug, content, excerpt, image, author, category_id, is_published, is_trending, created_at, req.params.id]
      );
    } else {
      result = await pool.query(
        `UPDATE news SET title=$1, slug=$2, content=$3, excerpt=$4, image=$5,
         author=$6, category_id=$7, is_published=$8, is_trending=$9, updated_at=NOW()
         WHERE id=$10 RETURNING *`,
        [title, slug, content, excerpt, image, author, category_id, is_published, is_trending, req.params.id]
      );
    }
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role === 'employee') return res.status(403).json({ error: 'Forbidden' });
    
    const { status, rejection_reason } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE news SET status=$1, rejection_reason=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
      [status, status === 'rejected' ? rejection_reason : null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM news WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
