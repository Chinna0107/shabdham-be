const pool = require('./db');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10),
      ADD COLUMN IF NOT EXISTS reset_code_expires_at TIMESTAMP;
    `);
    console.log('✅ Added reset_code columns to admin_users');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
