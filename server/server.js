const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

const secretKey = crypto.randomBytes(32).toString('hex');

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const client = new Client({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'book_notes_db',
  password: process.env.DB_PASSWORD || 'new_password',
  port: process.env.DB_PORT || 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(error => console.error('Error connecting to PostgreSQL database:', error));

app.get('/api/books/:userId', async (req, res) => {
  try {
    const user_id = req.params.userId;
    const dbData = await fetchDataFromDatabase(user_id);
    console.log ("testing",dbData)
    res.json(dbData);
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await client.query('SELECT first_name FROM users WHERE user_id = $1', [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
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
        req.session.user_id = user_id;
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
    const bookData = await fetchBookData(title, author);
    if (!bookData) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }
    
    const thumbnailUrl = bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.thumbnail : null;
    const descriptionBook = bookData.volumeInfo.description ? bookData.volumeInfo.description : '';
    const categories = bookData.categories.length ? bookData.categories : ['Uncategorized']; // Handle case if no categories are returned

    // Insert into the database
    await client.query(
      'INSERT INTO books (title, author, image_link, user_id, description_book, categories) VALUES ($1, $2, $3, $4, $5, $6)',
      [title, author, thumbnailUrl, user_id, descriptionBook, categories]
    );

    const dbData = await fetchDataFromDatabase(user_id);
    res.status(201).json(dbData);
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/api/books/:id/rating', async (req, res) => {
  const { id } = req.params;  // Check if the `id` param is correctly parsed
  const { rating } = req.body;  // Ensure `rating` is passed in the request body

  try {
    const result = await client.query(
      'UPDATE books SET rating = $1 WHERE book_id = $2 RETURNING *',
      [rating, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).send('Error updating rating');
  }
});



app.delete('/api/books/:book_id', async (req, res) => {
  const bookId = req.params.book_id;
  const user_id = req.session.user_id; // Retrieve the user_id from the session
  try {
    await client.query('DELETE FROM books WHERE book_id = $1', [bookId]);
    const updatedBookCount = await fetchBookCount(user_id); // Fetch updated book count
    res.status(200).json({ success: true, message: 'Book deleted successfully', bookCount: updatedBookCount });
  } catch (error) {
    handleError(res, error);
  }
});

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

async function fetchDataFromDatabase(user_id) {
  try {
    const { rows: dbData } = await client.query('SELECT * FROM books WHERE user_id = $1', [user_id]);
    return dbData;
  } catch (error) {
    console.error('Error fetching data from database:', error);
    throw error;
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
    const bookData = items[0];
    return {
      ...bookData,
      categories: bookData.volumeInfo.categories || []
    };
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
}



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
