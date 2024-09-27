const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Added PORT environment variable for deployment flexibility

// Secret key for sessions
const secretKey = crypto.randomBytes(32).toString('hex');

// Session middleware configuration
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3001', // Local frontend
  'https://main.d1hr2gomzak89g.amplifyapp.com' // Deployed frontend
];

// CORS setup
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// PostgreSQL client setup
const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'book_notes_db',
  password: process.env.DB_PASSWORD || 'new_password',
  port: process.env.DB_PORT || 5432
});

// Connect to PostgreSQL
client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(error => console.error('Error connecting to PostgreSQL database:', error));

// Utility functions for mapping data between API and database formats
function mapToDatabaseFormat(apiData) {
  return {
    title: apiData.volumeInfo.title,
    author: apiData.volumeInfo.authors ? apiData.volumeInfo.authors.join(', ') : 'Unknown Author',
    image_link: apiData.volumeInfo.imageLinks ? apiData.volumeInfo.imageLinks.thumbnail : null,
    description_book: apiData.volumeInfo.description || '',
    categories: apiData.volumeInfo.categories || ['Uncategorized'],
    preview_link: apiData.volumeInfo.previewLink || ''
  };
}

function mapToApiFormat(dbData) {
  return dbData.map(book => ({
    ...book,
    previewLink: book.preview_link // Convert snake_case to camelCase
  }));
}

// Get all books for a user
app.get('/api/books/:userId', async (req, res) => {
  try {
    const user_id = req.params.userId;
    const dbData = await fetchDataFromDatabase(user_id);
    const responseData = mapToApiFormat(dbData);
    res.json(responseData);
  } catch (error) {
    handleError(res, error);
  }
});

// Get user details by userId
app.get('/api/users/:userId', async (req, res) => {
  try {
    const result = await client.query('SELECT first_name FROM users WHERE user_id = $1', [req.params.userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
});

// Get books by category
app.get('/api/books/category/:category', async (req, res) => {
  try {
    const books = await client.query('SELECT * FROM books WHERE $1 = ANY(categories)', [req.params.category]);
    res.json(books.rows);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).send('Error fetching books by category');
  }
});

// Register new user
app.post('/api/register', async (req, res) => {
  const { username, password, first_name, last_name } = req.body;
  try {
    const checkResult = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (checkResult.rows.length > 0) {
      res.status(400).json({ message: 'Username already exists' });
    } else {
      const result = await client.query('INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id', [username, password, first_name, last_name]);
      res.json({ user_id: result.rows[0].user_id });
    }
  } catch (error) {
    handleError(res, error);
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (password === user.password) {
        req.session.user_id = user.user_id;
        res.json({ user_id: user.user_id });
      } else {
        res.status(400).json({ message: 'Incorrect password' });
      }
    } else {
      res.status(400).json({ message: 'User not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
});

// Add new book
app.post('/api/books', async (req, res) => {
  const { title, author, user_id } = req.body;
  try {
    const bookData = await fetchBookData(title, author);
    if (!bookData) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
   await client.query(
  'INSERT INTO books (title, author, image_link, user_id, description_book, categories, preview_link) VALUES ($1, $2, $3, $4, $5, $6::text[], $7)',
  [bookData.title, bookData.author, bookData.image_link, user_id, bookData.description_book, `{${bookData.categories.join(',')}}`, bookData.preview_link]
);

    const dbData = await fetchDataFromDatabase(user_id);
    res.status(201).json(dbData);
  } catch (error) {
    handleError(res, error);
  }
});

// Update book rating
app.put('/api/books/:id/rating', async (req, res) => {
  try {
    const result = await client.query('UPDATE books SET rating = $1 WHERE book_id = $2 RETURNING *', [parseInt(req.body.rating), req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    handleError(res, error);
  }
});

// Delete book
app.delete('/api/books/:book_id', async (req, res) => {
  try {
    await client.query('DELETE FROM books WHERE book_id = $1', [req.params.book_id]);
    const bookCount = await fetchBookCount(req.session.user_id);
    res.status(200).json({ success: true, message: 'Book deleted', bookCount });
  } catch (error) {
    handleError(res, error);
  }
});

// Helper functions
async function fetchDataFromDatabase(user_id) {
  try {
    const result = await client.query('SELECT * FROM books WHERE user_id = $1', [user_id]);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

async function fetchBookData(title, author) {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
  try {
    const response = await axios.get(apiUrl);
    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }
    return mapToDatabaseFormat(response.data.items[0]);
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
}

async function fetchBookCount(user_id) {
  try {
    const result = await client.query('SELECT COUNT(*) FROM books WHERE user_id = $1', [user_id]);
    return result.rows[0].count;
  } catch (error) {
    throw error;
  }
}

function handleError(res, error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
