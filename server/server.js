const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 🔒 Secure secrets
const secretKey = process.env.SESSION_SECRET || 
                  process.env.JWT_SECRET || 
                  crypto.randomBytes(32).toString('hex');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://main.d1hr2gomzak89g.amplifyapp.com',
  'https://worthy-reads.onrender.com'  // 👈 ADD YOUR FRONTEND
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// 🗄️ Neon PostgreSQL Pool (FIXED - no test close)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ✅ Test ONCE on startup (don't close pool!)
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Neon PostgreSQL connected'))
  .catch(err => console.error('❌ DB Error:', err));

// 🔥 ALL YOUR ROUTES HERE (unchanged)
app.get('/api/books/:userId', async (req, res) => { /* existing code */ });
app.post('/api/register', async (req, res) => { /* existing code */ });
// ... rest of routes ...

function handleError(res, error) {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

const server = app.listen(port, () => {
  console.log(`📡 Server live on port ${port} (${process.env.NODE_ENV || 'development'})`);
  console.log(`🔗 DB: ${process.env.DATABASE_URL ? 'Connected' : 'Local dev'}`);
});

process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown');
  server.close(() => {
    pool.end();
  });
});
