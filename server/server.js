// ========= CORE & SECURITY =========
require('dotenv').config();
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

const prisma = require('./prismaClient');
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getPendingRequests,
} = require('./services/friends');

const app = express();
const port = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ========= ENV GUARDS =========
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Exiting.');
  process.exit(1);
}

if (!process.env.GOOGLE_BOOKS_API_KEY) {
  console.warn('⚠️ GOOGLE_BOOKS_API_KEY is not set — Google Books enrichment may fail.');
}

// ========= CACHES =========
const homeBooksCache = new NodeCache({ stdTTL: 60 * 10 });

// ========= SESSION SECRET =========
const secretKey =
  process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  crypto.randomBytes(32).toString('hex');

// ========= TRUST PROXY =========
app.set('trust proxy', 1);

// ========= CORS =========
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://main.d1hr2gomzak89g.amplifyapp.com',
  'https://worthy-reads.vercel.app',
  'https://worthy-reads-1.onrender.com',
  'https://worthy-reads-bjik73y1j-lxarmas-projects.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ========= SECURITY & PERFORMANCE =========
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// ========= BODY & STATIC =========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ========= SESSIONS =========
app.use(
  session({
    store: new MemoryStore({
      checkPeriod: 1000 * 60 * 60 * 24,
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

// ========= DB (NEON via pg) =========
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// ========= HELPERS =========
function handleError(res, error, status = 500) {
  console.error('Server Error:', error);
  return res.status(status).json({
    error: error.message || 'Internal Server Error',
  });
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ========= HEALTH CHECK =========
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ========= DEBUG SESSION =========
app.get('/api/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    userId: req.session?.userId || null,
    session: req.session,
  });
});

// ========= HOME BOOKS =========
app.get('/api/home-books', async (req, res) => {
  try {
    const cacheKey = 'home-books';
    const cached = homeBooksCache.get(cacheKey);
    if (cached) return res.json(cached);

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

    const gbRes = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: randomKeyword,
        maxResults: 4,
        key: process.env.GOOGLE_BOOKS_API_KEY,
      },
      timeout: 5000,
    });

    const items = gbRes.data.items || [];
    homeBooksCache.set(cacheKey, items);
    return res.json(items);
  } catch (err) {
    console.error('Home-books error:', err.response?.status, err.message);
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
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE email = $1 OR username = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const result = await pool.query(
      `INSERT INTO users (email, username, password, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING user_id, email, username, first_name, last_name`,
      [email, email, password, first_name || null, last_name || null]
    );

    const user = result.rows[0];
    req.session.userId = user.user_id;

    return res.status(201).json({
      message: 'User registered successfully',
      user_id: user.user_id,
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
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

  try {
    const result = await pool.query(
      'SELECT user_id, email, username, password FROM users WHERE email = $1 OR username = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.user_id;

    return res.json({
      message: 'Login successful',
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// LOGOUT
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

// CURRENT SESSION
app.get('/api/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ user: null });
  }

  try {
    const result = await pool.query(
      'SELECT user_id, email, username, first_name, last_name FROM users WHERE user_id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ user: null });
    }

    const user = result.rows[0];
    return res.json({
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
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
         rating,
         status,
         created_at
       FROM books
       WHERE user_id = $1
       ORDER BY book_id DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error);
  }
});

// GET books by category
app.get('/api/books/category/:category', async (req, res) => {
  const { category } = req.params;

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
         rating,
         status,
         created_at
       FROM books
       WHERE $1 = ANY(categories)
       ORDER BY book_id DESC`,
      [decodeURIComponent(category)]
    );

    return res.json(result.rows);
  } catch (error) {
    return handleError(res, error);
  }
});

// ADD book
app.post('/api/books', requireAuth, async (req, res) => {
  const { title, author, user_id } = req.body;

  if (!title || !author || !user_id) {
    return res.status(400).json({ error: 'Title, author, and user_id are required' });
  }

  if (Number(user_id) !== Number(req.session.userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    let image_link = null;
    let categories = null;
    let description_book = null;
    let preview_link = null;
    let status = null;
    let rating = 0;

    try {
      const normalizedTitle = title.trim();
      const normalizedAuthor = author.trim();

      const googleRes = await axios.get(
        'https://www.googleapis.com/books/v1/volumes',
        {
          params: {
            q: `intitle:${normalizedTitle} inauthor:${normalizedAuthor}`,
            maxResults: 1,
            key: process.env.GOOGLE_BOOKS_API_KEY,
          },
          timeout: 5000,
        }
      );

      const item = googleRes.data.items?.[0];

      if (item) {
        const info = item.volumeInfo || {};
        const rawImage =
          info.imageLinks?.thumbnail ||
          info.imageLinks?.smallThumbnail ||
          null;

        image_link = rawImage ? rawImage.replace(/^http:/, 'https:') : null;
        categories = info.categories || null;
        description_book = info.description || null;
        preview_link = info.previewLink || null;
        status = 'found';

        if (typeof info.averageRating === 'number') {
          rating = Math.round(info.averageRating);
        }
      } else {
        status = 'not_found';
      }
    } catch (gbError) {
      console.warn(
        'Google Books fetch failed, continuing without enrichment:',
        gbError.message
      );
    }

    const result = await pool.query(
      `INSERT INTO books
         (title, author, image_link, user_id, description_book, categories, preview_link, rating, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING book_id`,
      [
        title,
        author,
        image_link,
        user_id,
        description_book,
        categories,
        preview_link,
        rating,
        status,
      ]
    );

    return res.status(201).json({
      success: true,
      book_id: result.rows[0].book_id,
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// DELETE book
app.delete('/api/books/:bookId', requireAuth, async (req, res) => {
  const { bookId } = req.params;

  try {
    const bookRes = await pool.query(
      'SELECT user_id FROM books WHERE book_id = $1',
      [bookId]
    );

    if (bookRes.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const ownerId = bookRes.rows[0].user_id;

    if (Number(ownerId) !== Number(req.session.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await pool.query('DELETE FROM books WHERE book_id = $1', [bookId]);

    const countRes = await pool.query(
      'SELECT COUNT(*)::int AS count FROM books WHERE user_id = $1',
      [ownerId]
    );

    return res.json({ success: true, bookCount: countRes.rows[0].count });
  } catch (error) {
    return handleError(res, error);
  }
});

// UPDATE rating
app.put('/api/books/:bookId/rating', requireAuth, async (req, res) => {
  const { bookId } = req.params;
  const { rating } = req.body;

  if (rating === undefined || rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 0 and 5' });
  }

  try {
    const bookRes = await pool.query(
      'SELECT user_id FROM books WHERE book_id = $1',
      [bookId]
    );

    if (bookRes.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (Number(bookRes.rows[0].user_id) !== Number(req.session.userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await pool.query(
      'UPDATE books SET rating = $1 WHERE book_id = $2',
      [rating, bookId]
    );

    return res.json({ success: true });
  } catch (error) {
    return handleError(res, error);
  }
});

// =======================
// FRIEND ROUTES
// =======================

app.post('/api/friends/request', requireAuth, async (req, res) => {
  try {
    const senderId = Number(req.session.userId);
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: 'receiverId is required' });
    }

    const result = await sendFriendRequest(senderId, Number(receiverId));
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/friends', requireAuth, async (req, res) => {
  try {
    const result = await getFriends(Number(req.session.userId));
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

app.get('/api/friends/requests', requireAuth, async (req, res) => {
  try {
    const result = await getPendingRequests(Number(req.session.userId));
    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
});

app.post('/api/friends/accept/:requestId', requireAuth, async (req, res) => {
  try {
    const requestId = Number(req.params.requestId);
    const currentUserId = Number(req.session.userId);

    const request = await prisma.friendRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.receiver_id !== currentUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await acceptFriendRequest(requestId);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/friends/reject/:requestId', requireAuth, async (req, res) => {
  try {
    const requestId = Number(req.params.requestId);
    const currentUserId = Number(req.session.userId);

    const request = await prisma.friendRequest.findUnique({
      where: { request_id: requestId },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.receiver_id !== currentUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await rejectFriendRequest(requestId);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// =======================
// FORGOT PASSWORD
// =======================
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await pool.query(
      'SELECT user_id FROM users WHERE email = $1 OR username = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    return handleError(res, error);
  }
});

// ========= 404 =========
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ========= ERROR HANDLER =========
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// =======================
// START SERVER
// =======================
let server;

pool
  .query('SELECT NOW()')
  .then(() => {
    console.log('✅ Neon PostgreSQL connected');
    server = app.listen(port, () => {
      console.log(`📡 Server live on port ${port} (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  });

// ========= SHUTDOWN =========
process.on('SIGTERM', async () => {
  console.log('🛑 Graceful shutdown');
  if (server) {
    server.close(async () => {
      try {
        await pool.end();
        await prisma.$disconnect();
      } catch (err) {
        console.error('Shutdown error:', err);
      }
    });
  } else {
    try {
      await pool.end();
      await prisma.$disconnect();
    } catch (err) {
      console.error('Shutdown error:', err);
    }
    process.exit(0);
  }
});