// ========= CORE & SECURITY =========
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const crypto = require('crypto');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const NodeCache = require('node-cache');
// const bcrypt = require('bcrypt'); // keep for future secure passwords

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ========= CACHES =========
const homeBooksCache = new NodeCache({ stdTTL: 60 * 10 }); // 10 minutes

// ========= SESSION SECRET =========
const secretKey =
  process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  crypto.randomBytes(32).toString('hex');

// ========= TRUST PROXY (Render / reverse proxies) =========
app.set('trust proxy', 1);

// ========= CORS =========
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://main.d1hr2gomzak89g.amplifyapp.com',
  'https://worthy-reads.vercel.app',
  'https://worthy-reads.onrender.com',
];

app.options(
  '*',
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ========= SECURITY & PERFORMANCE MIDDLEWARE =========
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(compression());

// ========= BODY & STATIC =========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ========= SESSIONS (memorystore) =========
app.use(
  session({
    store: new MemoryStore({
      checkPeriod: 1000 * 60 * 60 * 24, // prune expired entries every 24h
    }),
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProd,
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// ========= DB (NEON) =========
const pool =
  process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
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
      });

pool
  .query('SELECT NOW()')
  .then(() => console.log('✅ Neon PostgreSQL connected'))
  .catch((err) => console.error('❌ DB Error:', err));

// ========= ERROR HELPER =========
function handleError(res, error, status = 500) {
  console.error('Server Error:', error);
  res.status(status).json({ error: 'Internal Server Error' });
}

// ========= HEALTH CHECK =========
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ========= HOME BOOKS (Google Books via Express, cached) =========
app.get('/api/home-books', async (req, res) => {
  try {
    const cacheKey = 'home-books';
    const cached = homeBooksCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const searchKeywords = [
      'new',
      'bestsellers',
      'fiction',
      'history',
      'science',
      'fantasy',
      'romance',
      'computers',
    ];
    const randomKeyword =
      searchKeywords[Math.floor(Math.random() * searchKeywords.length)];

    const gbRes = await axios.get(
      'https://www.googleapis.com/books/v1/volumes',
      {
        params: {
          q: randomKeyword,
          maxResults: 4,
          key: process.env.GOOGLE_BOOKS_API_KEY,
        },
        timeout: 5000,
      }
    );

    const items = gbRes.data.items || [];

    homeBooksCache.set(cacheKey, items);

    res.json(items);
  } catch (err) {
    console.error(
      'Home-books Google API error:',
      err.response?.status,
      err.message
    );
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Google Books rate limit hit' });
    }
    return res.status(500).json({ error: 'Failed to fetch home books' });
  }
});

// =======================
// AUTH ROUTES
// =======================

// REGISTER
app.post('/api/register', async (req, res) => {
  console.log('🔍 /api/register body:', req.body);
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE username = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 👇 store password directly (simple mode)
    const result = await pool.query(
      `INSERT INTO users (username, password, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, first_name, last_name`,
      [email, password, first_name || null, last_name || null]
    );

    const user = result.rows[0];
    req.session.userId = user.user_id;

    res.status(201).json({
      message: 'User registered successfully',
      user_id: user.user_id,
      user: {
        id: user.user_id,
        email: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error('💥 Register error:', error);
    return handleError(res, error);
  }
});


// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔍 Login attempt:', {
    email,
    password_length: password?.length,
  });

  try {
    const result = await pool.query(
      'SELECT user_id, username, password FROM users WHERE username = $1',
      [email]
    );
    console.log('👤 Found users:', result.rows.length);

    if (result.rows.length === 0) {
      console.log('❌ No user found for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    const isMatch = password === user.password;
    console.log('✅ password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.user_id;
    console.log('🎉 Login success for user:', user.user_id);

    res.json({
      message: 'Login successful',
      user: { id: user.user_id, email: user.username },
    });
  } catch (error) {
    console.error('💥 Login error:', error);
    return handleError(res, error);
  }
});

// Current session info
app.get('/api/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ user: null });
  }
  res.json({ userId: req.session.userId });
});

// =======================
// BOOK ROUTES
// =======================

// GET books by user
app.get('/api/books/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         book_id,
         title,
         author,
         image_link,
         user_id,
         description_book,
         categories,
         preview_link,
         rating
       FROM books
       WHERE user_id = $1
       ORDER BY book_id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

// ADD book (still calls Google Books once per add)
app.post('/api/books', async (req, res) => {
  const { title, author, user_id } = req.body;

  if (!title || !author || !user_id) {
    return res
      .status(400)
      .json({ error: 'Title, author, and user_id are required' });
  }

  try {
    let image_link = null;
    let categories = null;
    let description_book = null;
    let preview_link = null;

    try {
      const googleRes = await axios.get(
        'https://www.googleapis.com/books/v1/volumes',
        {
          params: {
            q: `${title} ${author}`,
            maxResults: 1,
            key: process.env.GOOGLE_BOOKS_API_KEY,
          },
          timeout: 5000,
        }
      );

   const item = googleRes.data.items?.[0];
if (item) {
  const info = item.volumeInfo || {};

  // normalize Google image URL to HTTPS to avoid mixed-content errors
  const rawImage =
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail ||
    null;

  image_link = rawImage
    ? rawImage.replace(/^http:/, 'https:')
    : null;

  categories = info.categories || null;
  description_book = info.description || null;
  preview_link = info.previewLink || null;
}

    } catch (gbError) {
      console.warn(
        'Google Books fetch failed, continuing without extra data:',
        gbError.message
      );
    }

    const result = await pool.query(
      `INSERT INTO books
         (title, author, image_link, user_id, description_book, categories, preview_link, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING book_id`,
      [
        title,
        author,
        image_link,
        user_id,
        description_book,
        categories,
        preview_link,
        0,
      ]
    );

    res.status(201).json({
      success: true,
      book_id: result.rows[0].book_id,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE book
app.delete('/api/books/:bookId', async (req, res) => {
  const { bookId } = req.params;

  try {
    const bookRes = await pool.query(
      'SELECT user_id FROM books WHERE book_id = $1',
      [bookId]
    );

    if (bookRes.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const userId = bookRes.rows[0].user_id;

    await pool.query('DELETE FROM books WHERE book_id = $1', [bookId]);

    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS count FROM books WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      bookCount: countRes.rows[0].count,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// UPDATE rating
app.put('/api/books/:bookId/rating', async (req, res) => {
  const { bookId } = req.params;
  const { rating } = req.body;

  try {
    await pool.query('UPDATE books SET rating = $1 WHERE book_id = $2', [
      rating,
      bookId,
    ]);

    res.json({ success: true });
  } catch (error) {
    handleError(res, error);
  }
});

// ========= 404 & ERROR HANDLERS =========
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error middleware:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// =======================
// START SERVER
// =======================
const server = app.listen(port, () => {
  console.log(
    `📡 Server live on port ${port} (${process.env.NODE_ENV || 'development'})`
  );
});

process.on('SIGTERM', () => {
  console.log('🛑 Graceful shutdown');
  server.close(() => {
    pool.end();
  });
});
