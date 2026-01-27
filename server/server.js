const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 🔒 Secure secrets - use JWT_SECRET from Render
const secretKey = process.env.SESSION_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://main.d1hr2gomzak89g.amplifyapp.com',
  'https://worthy-reads.vercel.app',      // ← YOUR VERCEL URL
  'https://worthy-reads.onrender.com'
];

// Handle ALL preflight requests FIRST
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// 🔥 FIXED PG CONNECTION - explicit params bypass connectionString parsing bug
const pool = new Pool({
  host: 'ep-holy-fog-afyq354l-pooler.c-2.us-west-2.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_eQyJvGLPMj15',
  database: 'neondb',
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ✅ Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Neon PostgreSQL connected'))
  .catch(err => console.error('❌ DB Error:', err));

app.get('/api/books/:userId', async (req, res) => { /* existing code */ });
app.post('/api/register', async (req, res) => { /* existing code */ });
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔍 Login attempt:', { email, password_length: password?.length });

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    console.log('👤 Found users:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('❌ No user found for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    console.log('🔑 Hash preview:', user.password_hash.substring(0, 20));

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('✅ bcrypt match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    console.log('🎉 Login success for user:', user.id);
    res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


function handleError(res, error) {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

const server = app.listen(port, () => {
  console.log(`📡 Server live on port ${port} (${process.env.NODE_ENV || 'development'})`);
});

process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown');
  server.close(() => {
    pool.end();
  });
});



