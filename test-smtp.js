require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: process.env.SMTP_USER,
  subject: 'Test Email',
  text: 'Testing SMTP connection',
}).then(info => {
  console.log('✅ Mail sent successfully:', info.messageId);
}).catch(err => {
  console.error('❌ Mail error:', err);
});
