const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = ['http://localhost:5173', 'https://shabdham-news.vercel.app', process.env.FRONTEND_URL].filter(Boolean);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/general', require('./routes/general'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/breaking-news', require('./routes/breakingNews'));
app.use('/api/epaper', require('./routes/epaper'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/advertisements', require('./routes/advertisements'));

app.get('/', (req, res) => res.json({ message: '🎵 Shabdham API is running' }));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
