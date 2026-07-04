require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Connecting to database...');
    
    // Add rejection_reason column to news table
    await pool.query(`
      ALTER TABLE news 
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL;
    `);
    console.log('Added rejection_reason column to news table.');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

runMigration();
