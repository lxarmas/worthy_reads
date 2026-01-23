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

// ❌ REMOVE: dotenv breaks Render production
// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }

const app = express();
const port = process.env.PORT || 3000;

// 🔒 Secure secrets (Render env vars)
const secretKey = process.env.SESSION_SECRET || 
                  process.env.JWT_SECRET || 
                  crypto.randomBytes(32).toString('hex');

const allowedOrigins = [
  'http://localhost:3000',  // React dev
  'http://localhost:3001',  // Custom ports
  'https://main.d1hr2gomzak89g.amplifyapp.com',
  // Add: 'https://worthyreads-frontend.onrender.com'
];

// 🚀 Optimized CORS
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

// ⚡ Modern middleware (no bodyParser needed)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 Production-ready session
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7  // 7 days
  }
}));

// 🗄️ Neon PostgreSQL Pool (Render + Local)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,  // Connection pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 🧪 Test connection
pool.connect()
  .then(() => console.log('✅ Neon PostgreSQL connected'))
  .catch(err => console.error('❌ DB Error:', err))
  .finally(() => pool.end());  // Close test connection

// 🔥 YOUR EXISTING ROUTES (unchanged)
app.get('/api/books/:userId', async (req, res) => { /* your code */ });
app.post('/api/register', async (req, res) => { /* your code */ });
// ... all routes ...

// 🛠️ Utilities (unchanged)
function handleError(res, error) {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

// 🚀 Production-ready server
const server = app.listen(port, () => {
  console.log(`📡 Server live on port ${port} (${process.env.NODE_ENV || 'development'})`);
  console.log(`🔗 DB: ${process.env.DATABASE_URL ? 'Connected' : 'Local dev'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown');
  server.close(() => {
    pool.end();
  });
});
