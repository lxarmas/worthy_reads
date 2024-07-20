const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001; // Ensure this matches your backend port

// Use CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true // if you need to allow cookies or authentication headers
}));

// Generate a random secret key
const secretKey = crypto.randomBytes(32).toString('hex');

// Configure express-session middleware with the secret key
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Define routes for API endpoints
app.post('/api/register', async (req, res) => {
  const { username, password, first_name, last_name } = req.body;

  try {
    const checkResult = await client.query("SELECT * FROM users WHERE username = $1", [username]);

    if (checkResult.rows.length > 0) {
      res.status(400).send("Username already exists. Try logging in.");
    } else {
      const result = await client.query("INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id", [username, password, first_name, last_name]);
      const user_id = result.rows[0].user_id;
      res.status(201).json({ user_id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
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
        res.json({ user_id });
      } else {
        res.status(400).send("Incorrect Password");
      }
    } else {
      res.status(400).send("User not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Catch-all handler for any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
