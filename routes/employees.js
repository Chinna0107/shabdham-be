const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.admin.role !== 'admin' && req.admin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Admins only' });
  }
  next();
};

// GET /api/employees - List all employees (and admins)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, allowed_categories, created_at FROM admin_users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees - Create a new user
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role, allowed_categories } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required' });

    const existing = await pool.query('SELECT id FROM admin_users WHERE email=$1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const userRole = role || 'employee';
    const categories = allowed_categories || [];

    const result = await pool.query(
      `INSERT INTO admin_users (name, email, password_hash, role, allowed_categories) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, allowed_categories`,
      [name, email, hash, userRole, categories]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/employees/:id - Update an employee
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, allowed_categories, password } = req.body;
    
    // First check if user exists
    const existing = await pool.query('SELECT id FROM admin_users WHERE id=$1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    let query = 'UPDATE admin_users SET name=$1, email=$2, role=$3, allowed_categories=$4';
    let params = [name, email, role, allowed_categories || []];

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query += ', password_hash=$5 WHERE id=$6';
      params.push(hash, id);
    } else {
      query += ' WHERE id=$5';
      params.push(id);
    }

    query += ' RETURNING id, name, email, role, allowed_categories';
    
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/employees/:id - Delete an employee
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const result = await pool.query('DELETE FROM admin_users WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
