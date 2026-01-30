const bcrypt = require('bcrypt'); // Keep for future, not used now
const saltRounds = 10;
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Session secret
const secretKey = process.env.SESSION_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173',
  'https://main.d1hr2gomzak89g.amplifyapp.com',
  'https://worthy-reads.vercel.app', 'https://worthy-reads.onrender.com',
];

// Preflight CORS
app.options('*', cors({ origin: allowedOrigins, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));

// CORS middleware
app.use(cors({
  origin: (origin, cb) => allowedOrigins.includes(origin || '') ? cb(null, true) : cb(new Error('CORS blocked')),
  credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: secretKey, resave: false, saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 1000*60*60*24*7 }
}));

// Neon pool (optimized)
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000
}) : new Pool({
  host: 'ep-holy-fog-afyq354l-pooler.c-2.us-west-2.aws.neon.tech', port: 5432,
  user: 'neondb_owner', password: 'npg_eQyJvGLPMj15', database: 'neondb',
  ssl: { rejectUnauthorized: false }, max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000
});

pool.query('SELECT NOW()').then(() => console.log('✅ Neon connected')).catch(e => console.error('❌ DB Error:', e));

function handleError(res, error) {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

// ======================= AUTH ROUTES (matches backup: username/password/user_id) =======================
app.post('/api/register', async (req, res) => {
  const { username, password, first_name, last_name } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const result = await pool.query(
      `INSERT INTO users (username, password, first_name, last_name)
       VALUES ($1, $2, $3, $4) RETURNING user_id, username
       ON CONFLICT (username) DO NOTHING`,
      [username, password, first_name || '', last_name || '']
    );

    if (result.rows.length === 0) return res.status(400).json({ error: 'Username exists' });
    req.session.userId = result.rows[0].user_id;
    res.status(201).json({ message: 'Registered', user: result.rows[0] });
  } catch (error) { handleError(res, error); }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT user_id, username, password FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    req.session.userId = result.rows[0].user_id;
    res.json({ message: 'Login successful', user: { id: result.rows[0].user_id, username: result.rows[0].username } });
  } catch (error) { handleError(res, error); }
});

// ======================= BOOK ROUTES (matches backup: book_id/image_link/etc) =======================
app.get('/api/books/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT book_id, title, author, image_link, description_book, categories, preview_link, rating, created_at FROM books WHERE user_id = $1 ORDER BY book_id DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) { handleError(res, error); }
});

app.post('/api/books', async (req, res) => {
  const { title, author, image_link, description_book, categories, preview_link, user_id, rating = 0 } = req.body;
  if (!title || !author || !user_id) return res.status(400).json({ error: 'Title, author, user_id required' });

  try {
    const result = await pool.query(
      `INSERT INTO books (user_id, title, author, image_link, description_book, categories, preview_link, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING book_id`,
      [user_id, title, author, image_link||null, description_book||null, categories||'{}', preview_link||null, rating]
    );
    res.status(201).json({ success: true, id: result.rows[0].book_id });
  } catch (error) { handleError(res, error); }
});

app.delete('/api/books/:bookId', async (req, res) => {
  try {
    const book = await pool.query('SELECT user_id FROM books WHERE book_id = $1', [req.params.bookId]);
    if (book.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    
    await pool.query('DELETE FROM books WHERE book_id = $1', [req.params.bookId]);
    const count = await pool.query('SELECT COUNT(*)::int AS count FROM books WHERE user_id = $1', [book.rows[0].user_id]);
    
    res.json({ success: true, bookCount: count.rows[0].count });
  } catch (error) { handleError(res, error); }
});

app.put('/api/books/:bookId/rating', async (req, res) => {
  try {
    await pool.query('UPDATE books SET rating = $1 WHERE book_id = $2', [req.body.rating, req.params.bookId]);
    res.json({ success: true });
  } catch (error) { handleError(res, error); }
});

// Start server
const server = app.listen(port, () => console.log(`📡 Server on ${port}`));
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down');
  server.close(() => pool.end().then(() => console.log('✅ Closed')));
});
