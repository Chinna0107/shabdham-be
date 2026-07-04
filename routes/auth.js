const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM admin_users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, allowed_categories: user.allowed_categories || [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me  (verify token + return current user)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, allowed_categories, created_at FROM admin_users WHERE id=$1',
      [req.admin.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password (reset own password)
router.post('/reset-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    const userId = req.admin.id;
    const result = await pool.query('SELECT password_hash FROM admin_users WHERE id=$1', [userId]);
    const user = result.rows[0];
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect present password' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admin_users SET password_hash=$1 WHERE id=$2', [newHash, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-password
router.post('/verify-password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const userId = req.admin.id;
    const result = await pool.query('SELECT password_hash FROM admin_users WHERE id=$1', [userId]);
    const user = result.rows[0];
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect present password' });

    res.json({ success: true, message: 'Password verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password (generates code and sends email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const result = await pool.query('SELECT * FROM admin_users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.json({ message: 'If an account with that email exists, we have sent a reset code.' });
    }

    // Generate 6 digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.query(
      'UPDATE admin_users SET reset_code=$1, reset_code_expires_at=$2 WHERE id=$3',
      [resetCode, expiresAt, user.id]
    );

    // Send email (mock or real)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });
      await transporter.sendMail({
        from: '"Shabdham TV" <no-reply@shabdhamtv.com>',
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}. It expires in 15 minutes.`,
      });
    } else {
      console.log('=============================================');
      console.log(`MOCK EMAIL SENT TO: ${email}`);
      console.log(`RESET CODE: ${resetCode}`);
      console.log('=============================================');
    }

    res.json({ message: 'If an account with that email exists, we have sent a reset code.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password-with-code
router.post('/reset-password-with-code', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    const result = await pool.query(
      'SELECT id, reset_code, reset_code_expires_at FROM admin_users WHERE email=$1',
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset code' });

    if (user.reset_code !== code) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    if (new Date() > new Date(user.reset_code_expires_at)) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE admin_users SET password_hash=$1, reset_code=NULL, reset_code_expires_at=NULL WHERE id=$2',
      [newHash, user.id]
    );

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
