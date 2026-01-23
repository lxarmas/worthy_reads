const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
const { Pool } = require('pg');  // ✅ CHANGED: Pool instead of Client
const cors = require('cors');
const path = require('path');


const app = express();
const port = process.env.PORT || 3000;

// Secure session secret
const secretKey = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// ✅ Allowed origins for both local + AWS
const allowedOrigins = [
  'http://localhost:3001',
  'https://main.d1hr2gomzak89g.amplifyapp.com'
];

// ✅ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ✅ Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// ✅ PostgreSQL setup (Neon serverless + Pool)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(() => console.log('✅ Connected to Neon PostgreSQL'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));

// Utility functions
function mapToDatabaseFormat(apiData) {
  return {
    title: apiData.volumeInfo.title,
    author: apiData.volumeInfo.authors ? apiData.volumeInfo.authors.join(', ') : 'Unknown Author',
    image_link: apiData.volumeInfo.imageLinks?.thumbnail || null,
    description_book: apiData.volumeInfo.description || '',
    categories: apiData.volumeInfo.categories || ['Uncategorized'],
    preview_link: apiData.volumeInfo.previewLink || '',
  };
}

function mapToApiFormat(dbData) {
  return dbData.map((book) => ({
    ...book,
    previewLink: book.preview_link,
  }));
}

// ✅ ROUTES

// Get all books for a user
app.get('/api/books/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE user_id = $1', [req.params.userId]);  // ✅ pool.query
    res.json(mapToApiFormat(result.rows));
  } catch (error) {
    handleError(res, error);
  }
});

// Get user details
app.get('/api/users/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT first_name FROM users WHERE user_id = $1', [req.params.userId]);  // ✅ pool.query
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.status(404).json({ error: 'User not found' });
  } catch (error) {
    handleError(res, error);
  }
});

// Get books by category
app.get('/api/books/category/:category', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE $1 = ANY(categories)', [req.params.category]);  // ✅ pool.query
    res.json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password, first_name, last_name } = req.body;
  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);  // ✅ pool.query
    if (checkUser.rows.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(  // ✅ pool.query
      'INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [username, hashedPassword, first_name, last_name]
    );

    res.json({ user_id: result.rows[0].user_id });
  } catch (error) {
    handleError(res, error);
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);  // ✅ pool.query
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = result.rows[0];
    const match = user.password.startsWith('$2b$')
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    if (!match) return res.status(400).json({ error: 'Incorrect password' });

    req.session.user_id = user.user_id;
    res.json({ user_id: user.user_id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
app.post('/api/request-password-reset', async (req, res) => {
  const { username } = req.body;
  try {
    const userResult = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);  // ✅ pool.query
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const userId = userResult.rows[0].user_id;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await pool.query('INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)', [  // ✅ pool.query
      userId,
      token,
      expiresAt,
    ]);

    res.json({ message: 'Password reset link sent if user exists' });
  } catch (error) {
    handleError(res, error);
  }
});

// ✅ Forgot Password - Generate Temporary Password
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [email]);  // ✅ pool.query
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'If that email exists, a reset password has been sent.' });
    }

    const user = result.rows[0];
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, email]);  // ✅ pool.query

    console.log(`Temporary password for ${email}: ${tempPassword}`);

    res.json({ message: 'Temporary password generated and sent (check server logs).' });
  } catch (error) {
    console.error('Error in /api/forgot-password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new book
app.post('/api/books', async (req, res) => {
  const { title, author, user_id } = req.body;
  try {
    const bookData = await fetchBookData(title, author);
    if (!bookData) return res.status(404).json({ error: 'Book not found' });

    await pool.query(  // ✅ pool.query
      'INSERT INTO books (title, author, image_link, user_id, description_book, categories, preview_link) VALUES ($1, $2, $3, $4, $5, $6::text[], $7)',
      [
        bookData.title,
        bookData.author,
        bookData.image_link,
        user_id,
        bookData.description_book,
        `{${bookData.categories.join(',')}}`,
        bookData.preview_link,
      ]
    );

    const result = await pool.query('SELECT * FROM books WHERE user_id = $1', [user_id]);  // ✅ pool.query
    res.status(201).json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

// Update rating
app.put('/api/books/:id/rating', async (req, res) => {
  try {
    const result = await pool.query(  // ✅ pool.query
      'UPDATE books SET rating = $1 WHERE book_id = $2 RETURNING *',
      [parseInt(req.body.rating), req.params.id]
    );
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.status(404).json({ error: 'Book not found' });
  } catch (error) {
    handleError(res, error);
  }
});

// Delete book
app.delete('/api/books/:book_id', async (req, res) => {
  try {
    await pool.query('DELETE FROM books WHERE book_id = $1', [req.params.book_id]);  // ✅ pool.query
    res.json({ success: true, message: 'Book deleted' });
  } catch (error) {
    handleError(res, error);
  }
});

// Helper functions
async function fetchBookData(title, author) {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
    title
  )}+inauthor:${encodeURIComponent(author)}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.items?.length > 0 ? mapToDatabaseFormat(response.data.items[0]) : null;
  } catch (error) {
    console.error('Google Books API error:', error);
    return null;
  }
}

function handleError(res, error) {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

// ✅ Start server
app.listen(port, () => {
  console.log(`📡 Server running on port ${port} (${process.env.NODE_ENV || 'development'})`);
});
