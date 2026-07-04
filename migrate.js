const pool = require('./db');

async function migrate() {
  try {
    console.log('Running migration...');
    
    // Add allowed_categories to admin_users if it doesn't exist
    await pool.query(`
      ALTER TABLE admin_users 
      ADD COLUMN IF NOT EXISTS allowed_categories INTEGER[] DEFAULT '{}';
    `);
    console.log('✅ Added allowed_categories to admin_users');

    // Add status and created_by to news if they don't exist
    await pool.query(`
      ALTER TABLE news 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved',
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL;
    `);
    
    // Update existing news to have 'approved' status (if any are null due to altering)
    await pool.query(`
      UPDATE news SET status = 'approved' WHERE status IS NULL;
    `);
    console.log('✅ Added status and created_by to news');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
