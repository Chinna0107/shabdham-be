const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const existing = await pool.query('SELECT id FROM admin_users WHERE email=$1', ['admin@balagamtv.com']);
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO admin_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Admin', 'admin@balagamtv.com', hash, 'superadmin']
    );
    console.log('✅ Default admin created → admin@balagamtv.com / admin123');
  } else {
    console.log('ℹ️  Admin already exists, skipping seed');
  }

  console.log('✅ admin_users table ready');
  process.exit(0);
}

seedAdmin().catch(err => { console.error('❌', err.message); process.exit(1); });
