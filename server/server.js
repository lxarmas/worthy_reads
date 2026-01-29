const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 🔒 Session secret (Render env if available)
const secretKey =
  process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  crypto.randomBytes(32).toString('hex');

// 🌐 Allowed frontends (add your Vercel/Amplify URLs)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://main.d1hr2gomzak89g.amplifyapp.com',
  'https://worthy-reads.vercel.app',
  'https://worthy-reads.onrender.com',
];

// Handle ALL preflight requests first (optimizes CORS)
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// CORS middleware (optimized origin check)
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
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing + static (10MB limit for book images/descriptions)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (optimized for production)
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// 🔥 Optimized Neon pool (higher max, tuned timeouts for serverless)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20, // Increased for concurrent requests
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // Query timeout prevents hangs
      query_timeout: 5000,
    })
  : new Pool({
      host: 'ep-holy-fog-afyq354l-pooler.c-2.us-west-2.aws.neon.tech',
      port: 5432,
      user: 'neondb_owner',
      password: 'npg_eQyJvGLPMj15',
      database: 'neondb',
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      query_timeout: 5000,
    });

// Test connection (async, non-blocking)
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Neon PostgreSQL connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// Utility error handler (logs + generic response)
function handleError(res, error) {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

// =======================
// AUTH ROUTES (unchanged, works with restored users schema)
// =======================
app.post('/api/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Optimized: single query with INSERT ... ON CONFLICT
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, first_name, last_name`,
      [email, await bcrypt.hash(password, saltRounds), first_name || null, last_name || null]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = result.rows[0];
    req.session.userId = user.id;

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0 || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    req.session.userId = result.rows[0].id;
    res.json({
      message: 'Login successful',
      user: { id: result.rows[0].id, email: result.rows[0].email },
    });
  } catch (error) {
    handleError(res, error);
  }
});

// =======================
// BOOK ROUTES (optimized for restored schema: book_id PK + rich fields)
// =======================
app.get('/api/books/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT book_id as id, title, author, image_link, description_book, categories, preview_link, rating, created_at
       FROM books WHERE user_id = $1 ORDER BY book_id DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, image_link, description_book, categories, preview_link, user_id, rating = 0 } = req.body;

  if (!title || !author || !user_id) {
    return res.status(400).json({ error: 'Title, author, and user_id required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO books (user_id, title, author, image_link, description_book, categories, preview_link, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING book_id as id`,
      [user_id, title, author, image_link || null, description_book || null, categories || '{}', preview_link || null, rating]
    );

    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/api/books/:bookId', async (req, res) => {
  const { bookId } = req.params;

  try {
    const bookRes = await pool.query('SELECT user_id FROM books WHERE book_id = $1', [bookId]);

    if (bookRes.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    await pool.query('DELETE FROM books WHERE book_id = $1', [bookId]);

    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS count FROM books WHERE user_id = $1',
      [bookRes.rows[0].user_id]
    );

    res.json({ success: true, bookCount: countRes.rows[0].count });
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/api/books/:bookId/rating', async (req, res) => {
  const { bookId } = req.params;
  const { rating } = req.body;

  try {
    const result = await pool.query(
      'UPDATE books SET rating = $1 WHERE book_id = $2 RETURNING book_id',
      [rating, bookId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

// =======================
// START SERVER (graceful shutdown optimized)
// =======================
const server = app.listen(port, () => {
  console.log(`📡 Server live on port ${port} (${process.env.NODE_ENV || 'development'})`);
});

process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown');
  server.close(() => {
    pool.end().then(() => console.log('✅ Pool closed'));
  });
});
