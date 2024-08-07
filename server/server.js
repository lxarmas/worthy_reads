const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); 
const crypto = require('crypto'); 
const axios = require('axios');
const { Client } = require('pg');
const cors = require('cors');  // Add this line
const path = require('path');

const app = express();
const port = 3000;

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');

// Configure express-session middleware with the secret key
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));  // Add this line
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Add this line to handle JSON payloads

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'book_notes_db',
  password: process.env.DB_PASSWORD || '12345aa',
  port: process.env.DB_PORT || 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(error => console.error('Error connecting to PostgreSQL database:', error));

app.get('/api/books/:userId', async (req, res) => {
  try {
    const user_id = req.params.userId;
    const dbData = await fetchDataFromDatabase(user_id);
    res.json(dbData);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password, first_name, last_name } = req.body;
  try {
    const checkResult = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    if (checkResult.rows.length > 0) {
      res.status(400).json({ message: 'Username already exists. Try logging in.' });
    } else {
      const result = await client.query("INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id", [username, password, first_name, last_name]);
      const user_id = result.rows[0].user_id;
      res.json({ user_id });
    }
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;
      if (password === storedPassword) {
        const user_id = user.user_id;
        req.session.user_id = user_id;  // Set the session user_id
        res.json({ user_id });
      } else {
        res.status(400).json({ message: 'Incorrect Password' });
      }
    } else {
      res.status(400).json({ message: 'User not found' });
    }
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, user_id } = req.body;
  try {
    const bookData = await fetchBookData(title, author, user_id);
    if (!bookData) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    const thumbnailUrl = bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.thumbnail : null;
    const descriptionBook = bookData.volumeInfo.description ? bookData.volumeInfo.description : '';
    await client.query('INSERT INTO books (title, author, image_link, user_id, description_book) VALUES ($1, $2, $3, $4, $5)', [title, author, thumbnailUrl, user_id, descriptionBook]);
    const dbData = await fetchDataFromDatabase(user_id);
    res.status(201).json(dbData);
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/api/books/:book_id', async (req, res) => {
  const bookId = req.params.book_id;
  try {
    await client.query('DELETE FROM books WHERE book_id = $1', [bookId]);
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

async function fetchDataFromDatabase(user_id) {
  try {
    const { rows: dbData } = await client.query('SELECT * FROM books WHERE user_id = $1', [user_id]);
    return dbData;
  } catch (error) {
    console.error('Error fetching data from database:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

async function fetchBookData(title, author) {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
  try {
    const response = await axios.get(apiUrl);
    const items = response.data.items;
    if (!items || items.length === 0) {
      console.error('No books found for the given search criteria');
      return null;
    }
    return items[0];
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
}

function handleError(res, error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
