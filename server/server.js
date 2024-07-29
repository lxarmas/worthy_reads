const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Generate a random secret key for sessions
const secretKey = crypto.randomBytes(32).toString('hex');

// Configure express-session middleware
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies

// Set view engine (if using EJS for server-side rendering)
app.set('view engine', 'ejs');

// PostgreSQL client setup
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

// Routes
app.get('/', async (req, res) => {
  try {
    const user_id = req.session.user_id; // Retrieve user ID from session
    const dbData = await fetchDataFromDatabase(user_id);
    res.render('HomPage.js', { user_id, dbData }); // Render home page with data
  } catch (error) {
    handleError(res, error);
  }
});

// User registration
app.post('/api/register', async (req, res) => {
  const { username, password, first_name, last_name } = req.body;

  console.log('Received data:', { username, first_name, last_name });

  try {
    const checkResult = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (checkResult.rows.length > 0) {
      return res.status(400).send('Username already exists. Try logging in.');
    }

    const result = await client.query('INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id', [username, password, first_name, last_name]);
    const user_id = result.rows[0].user_id;

    // Return success response
    res.status(201).json({ message: 'User registered successfully', user_id });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

// User login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (password === user.password) { // Compare passwords
                req.session.user_id = user.user_id; // Store user ID in session
                return res.json({ message: 'Login successful', user_id: user.user_id });
            }
            return res.status(400).send('Incorrect password');
        }
        return res.status(404).send('User not found');
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});


// User logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/'); // Redirect after logout
  });
});

// Add a new book
app.post('/api/books', async (req, res) => {
  const { title, author, user_id } = req.body;
  try {
    const bookData = await fetchBookData(title, author);
    if (!bookData) {
      return res.status(404).send('Book not found');
    }
    
    const thumbnailUrl = bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.thumbnail : null;
    const descriptionBook = bookData.volumeInfo.description || '';

    await client.query('INSERT INTO books (title, author, image_link, user_id, description_book) VALUES ($1, $2, $3, $4, $5)', [title, author, thumbnailUrl, user_id, descriptionBook]);

    const dbData = await fetchDataFromDatabase(user_id);
    res.status(201).json({ message: 'Book added successfully', dbData });
  } catch (error) {
    handleError(res, error);
  }
});

// Delete a book
app.delete('/api/books/:book_id', async (req, res) => {
  const bookId = req.params.book_id;
  const user_id = req.session.user_id; // Get user ID from session
  try {
    await client.query('DELETE FROM books WHERE book_id = $1', [bookId]);
    const updatedBookCount = await fetchBookCount(user_id);
    res.status(200).json({ success: true, message: 'Book deleted successfully', bookCount: updatedBookCount });
  } catch (error) {
    handleError(res, error);
  }
});

// Fetch data from the database
async function fetchDataFromDatabase(user_id) {
  try {
    const { rows: dbData } = await client.query('SELECT * FROM books WHERE user_id = $1', [user_id]);
    return dbData;
  } catch (error) {
    console.error('Error fetching data from database:', error);
    throw error;
  }
}

// Fetch book data from an external API
async function fetchBookData(title, author) {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
  try {
    const response = await axios.get(apiUrl);
    const items = response.data.items;
    if (!items || items.length === 0) {
      console.error('No books found for the given search criteria');
      return null;
    }
    return items[0]; // Return the first book found
  } catch (error) {
    console.error('Error fetching book data:', error);
    return null;
  }
}

// Fetch the count of books for a user
async function fetchBookCount(user_id) {
  try {
    const result = await client.query('SELECT COUNT(*) FROM books WHERE user_id = $1', [user_id]);
    return result.rows[0].count;
  } catch (error) {
    throw error;
  }
}

// General error handling
function handleError(res, error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
