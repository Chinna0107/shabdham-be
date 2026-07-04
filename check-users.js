require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function check() {
  try {
    const res = await pool.query('SELECT id, email, role FROM admin_users');
    console.log(res.rows);
  } finally {
    pool.end();
  }
}
check();
