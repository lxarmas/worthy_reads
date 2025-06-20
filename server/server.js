const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const session = require( 'express-session' );
const crypto = require( 'crypto' );
const axios = require( 'axios' );
const { Client } = require( 'pg' );
const cors = require( 'cors' );
const path = require( 'path' );

const app = express();
const port = process.env.PORT || 3000;

// Secure session secret
const secretKey = crypto.randomBytes( 32 ).toString( 'hex' );

// CORS setup
const allowedOrigins = [
  'http://localhost:3001',
  'https://main.d1hr2gomzak89g.amplifyapp.com'
];

app.use( cors( {
  origin: ( origin, callback ) => {
    if ( !origin || allowedOrigins.includes( origin ) ) {
      callback( null, true );
    } else {
      callback( new Error( 'Not allowed by CORS' ) );
    }
  },
  credentials: true
} ) );

// Middleware
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( session( {
  secret: secretKey,
  resave: false,
  saveUninitialized: false
} ) );

// PostgreSQL setup
const client = new Client( {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'book_notes_db',
  password: process.env.DB_PASSWORD || 'new_password',
  port: process.env.DB_PORT || 5432
} );

client.connect()
  .then( () => console.log( '✅ Connected to PostgreSQL' ) )
  .catch( err => console.error( '❌ PostgreSQL connection error:', err ) );

// Utility mappers
function mapToDatabaseFormat( apiData ) {
  return {
    title: apiData.volumeInfo.title,
    author: apiData.volumeInfo.authors ? apiData.volumeInfo.authors.join( ', ' ) : 'Unknown Author',
    image_link: apiData.volumeInfo.imageLinks?.thumbnail || null,
    description_book: apiData.volumeInfo.description || '',
    categories: apiData.volumeInfo.categories || ['Uncategorized'],
    preview_link: apiData.volumeInfo.previewLink || ''
  };
}

function mapToApiFormat( dbData ) {
  return dbData.map( book => ( {
    ...book,
    previewLink: book.preview_link
  } ) );
}

// API routes

//  Get all books for a user
app.get( '/api/books/:userId', async ( req, res ) => {
  try {
    const books = await fetchDataFromDatabase( req.params.userId );
    res.json( mapToApiFormat( books ) );
  } catch ( error ) {
    handleError( res, error );
  }
} );

//  Get user details
app.get( '/api/users/:userId', async ( req, res ) => {
  try {
    const result = await client.query( 'SELECT first_name FROM users WHERE user_id = $1', [req.params.userId] );
    result.rows.length > 0
      ? res.json( result.rows[0] )
      : res.status( 404 ).json( { error: 'User not found' } );
  } catch ( error ) {
    handleError( res, error );
  }
} );

//  Get books by category
app.get( '/api/books/category/:category', async ( req, res ) => {
  try {
    const books = await client.query( 'SELECT * FROM books WHERE $1 = ANY(categories)', [req.params.category] );
    res.json( books.rows );
  } catch ( error ) {
    console.error( 'Error fetching books by category:', error );
    res.status( 500 ).json( { error: 'Failed to fetch books by category' } );
  }
} );

//  Register user
app.post( '/api/register', async ( req, res ) => {
  const { username, password, first_name, last_name } = req.body;
  try {
    const checkUser = await client.query( 'SELECT * FROM users WHERE username = $1', [username] );
    if ( checkUser.rows.length > 0 ) {
      return res.status( 400 ).json( { error: 'Username already exists' } );
    }

    const result = await client.query(
      'INSERT INTO users (username, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [username, password, first_name, last_name]
    );
    res.json( { user_id: result.rows[0].user_id } );
  } catch ( error ) {
    handleError( res, error );
  }
} );

//  Login user
app.post( '/api/login', async ( req, res ) => {
  const { username, password } = req.body;
  try {
    const result = await client.query( 'SELECT * FROM users WHERE username = $1', [username] );
    if ( result.rows.length === 0 ) {
      return res.status( 400 ).json( { error: 'User not found' } );
    }

    const user = result.rows[0];
    if ( password !== user.password ) {
      return res.status( 400 ).json( { error: 'Incorrect password' } );
    }

    req.session.user_id = user.user_id;
    res.json( { user_id: user.user_id } );
  } catch ( error ) {
    handleError( res, error );
  }
} );

//  Add new book
app.post( '/api/books', async ( req, res ) => {
  const { title, author, user_id } = req.body;
  try {
    const bookData = await fetchBookData( title, author );
    if ( !bookData ) return res.status( 404 ).json( { error: 'Book not found' } );

    await client.query(
      'INSERT INTO books (title, author, image_link, user_id, description_book, categories, preview_link) VALUES ($1, $2, $3, $4, $5, $6::text[], $7)',
      [
        bookData.title,
        bookData.author,
        bookData.image_link,
        user_id,
        bookData.description_book,
        `{${bookData.categories.join( ',' )}}`,
        bookData.preview_link
      ]
    );

    const updatedBooks = await fetchDataFromDatabase( user_id );
    res.status( 201 ).json( updatedBooks );
  } catch ( error ) {
    handleError( res, error );
  }
} );

//  Update book rating
app.put( '/api/books/:id/rating', async ( req, res ) => {
  try {
    const result = await client.query(
      'UPDATE books SET rating = $1 WHERE book_id = $2 RETURNING *',
      [parseInt( req.body.rating ), req.params.id]
    );
    result.rows.length > 0
      ? res.json( result.rows[0] )
      : res.status( 404 ).json( { error: 'Book not found' } );
  } catch ( error ) {
    handleError( res, error );
  }
} );

//  Delete book
app.delete( '/api/books/:book_id', async ( req, res ) => {
  try {
    await client.query( 'DELETE FROM books WHERE book_id = $1', [req.params.book_id] );
    const bookCount = await fetchBookCount( req.session.user_id );
    res.json( { success: true, message: 'Book deleted', bookCount } );
  } catch ( error ) {
    handleError( res, error );
  }
} );

//  Helper Functions

async function fetchDataFromDatabase( user_id ) {
  const result = await client.query( 'SELECT * FROM books WHERE user_id = $1', [user_id] );
  return result.rows;
}

async function fetchBookData( title, author ) {
  const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent( title )}+inauthor:${encodeURIComponent( author )}`;
  try {
    const response = await axios.get( apiUrl );
    return response.data.items?.length > 0 ? mapToDatabaseFormat( response.data.items[0] ) : null;
  } catch ( error ) {
    console.error( 'Google Books API error:', error );
    return null;
  }
}

async function fetchBookCount( user_id ) {
  const result = await client.query( 'SELECT COUNT(*) FROM books WHERE user_id = $1', [user_id] );
  return result.rows[0].count;
}

function handleError( res, error ) {
  console.error( 'Server Error:', error );
  res.status( 500 ).json( { error: 'Internal Server Error' } );
}

// Start server
app.listen( port, () => {
  console.log( `📡 Server running at http://localhost:${port}` );
} );
