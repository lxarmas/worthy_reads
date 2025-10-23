const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Secure session secret
const secretKey = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// ✅ Allowed origins for both local + AWS
const allowedOrigins = [
  'http://localhost:3001',
  'https://main.d1hr2gomzak89g.amplifyapp.com'
];

// ✅ CORS setup with better handling
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
      secure: process.env.NODE_ENV === 'production', // ✅ Secure cookies only in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// ✅ PostgreSQL setup
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'book_notes_db',
  password: process.env.DB_PASSWORD || 'new_password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // ✅ Fix for AWS
});

client
  .connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
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
    const result = await client.query('SELECT * FROM books WHERE user_id = $1', [req.params.userId]);
    res.json(mapToApiFormat(result.rows));
  } catch (error) {
    handleError(res, error);
  }
});

// Get user details
app.get('/api/users/:userId', async (req, res) => {
  try {
    const result = await client.query('SELECT first_name FROM users WHERE user_id = $1', [req.params.userId]);
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.status(404).json({ error: 'User not found' });
  } catch (error) {
    handleError(res, error);
  }
});

// Get books by category
app.get('/api/books/category/:category', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM books WHERE $1 = ANY(categories)', [req.params.category]);
    res.json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  const { username, password, first_name, last_name } = req.body;
  try {
    const checkUser = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await client.query(
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
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Check if password is hashed (starts with $2b$)
    let match = false;
    if (user.password.startsWith('$2b$')) {
      match = await bcrypt.compare(password, user.password);
    } else {
      match = password === user.password; // plain text fallback
    }

    if (!match) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    req.session.user_id = user.user_id;
    res.json({ user_id: user.user_id });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Password reset (request)
app.post('/api/request-password-reset', async (req, res) => {
  const { username } = req.body;
  try {
    const userResult = await client.query('SELECT user_id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const userId = userResult.rows[0].user_id;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await client.query('INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)', [
      userId,
      token,
      expiresAt,
    ]);

    // TODO: Send email here
    res.json({ message: 'Password reset link sent if user exists' });
  } catch (error) {
    handleError(res, error);
  }
});

// Add new book
app.post('/api/books', async (req, res) => {
  const { title, author, user_id } = req.body;
  try {
    const bookData = await fetchBookData(title, author);
    if (!bookData) return res.status(404).json({ error: 'Book not found' });

    await client.query(
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

    const result = await client.query('SELECT * FROM books WHERE user_id = $1', [user_id]);
    res.status(201).json(result.rows);
  } catch (error) {
    handleError(res, error);
  }
});

// Update rating
app.put('/api/books/:id/rating', async (req, res) => {
  try {
    const result = await client.query(
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
    await client.query('DELETE FROM books WHERE book_id = $1', [req.params.book_id]);
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
