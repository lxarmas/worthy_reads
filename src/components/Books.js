import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Alert,
  Card,
  Container,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';
import { fetchBooks, addBook, deleteBook } from '../api';
import Rating from './Rating';
import BookCount from './BookCount';
import './Books.css';

const API_URL =
  process.env.REACT_APP_API_URL || 'https://worthy-reads.onrender.com';

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookCount, setBookCount] = useState(0);

  const normalizeBooks = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.books)) return data.books;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  // Step 1: get userId from session OR localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userId');
    if (stored) {
      console.log('userId from localStorage:', stored);
      setUserId(stored);
      return;
    }

    // fallback: ask the backend who is logged in
    fetch(`${API_URL}/api/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        console.log('/api/me response:', data);
        if (data?.userId) {
          localStorage.setItem('userId', String(data.userId));
          setUserId(String(data.userId));
        } else {
          setError('No user found. Please log in again.');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('/api/me error:', err);
        setError('Could not verify session. Please log in again.');
        setLoading(false);
      });
  }, []);

  // Step 2: fetch books once userId is known
  useEffect(() => {
    if (!userId) return;

    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching books for userId:', userId);
        const response = await fetchBooks(userId);
        console.log('BOOKS FROM API:', response.data);
        const rows = normalizeBooks(response.data);
        setBooks(rows);
        setBookCount(rows.length);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please try again.');
        setBooks([]);
        setBookCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [userId]);

  const handleAddBook = async (event) => {
    event.preventDefault();
    if (!userId) {
      setError('No user found. Please log in again.');
      return;
    }
    try {
      setError(null);
      await addBook({ title, author, user_id: userId });
      const response = await fetchBooks(userId);
      const rows = normalizeBooks(response.data);
      setBooks(rows);
      setBookCount(rows.length);
      setTitle('');
      setAuthor('');
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Failed to add book. Please try again.');
    }
  };

  const handleDeleteBook = async (bookId) => {
    console.log('Deleting bookId:', bookId);
    try {
      setError(null);
      const response = await deleteBook(bookId);
      const okStatus = response?.status === 200 || response?.status === 204;
      const okFlag = response?.data?.success === true;
      if (okStatus || okFlag) {
        setBooks((prev) => prev.filter((book) => book.book_id !== bookId));
        if (typeof response?.data?.bookCount === 'number') {
          setBookCount(response.data.bookCount);
        } else {
          setBookCount((prev) => Math.max(prev - 1, 0));
        }
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book. Please try again.');
    }
  };

  const handleRatingChange = (bookId, rate) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.book_id === bookId ? { ...book, rating: rate } : book
      )
    );
  };

  return (
    <Container className="px-3">
      <h2 className="username-color">Welcome User</h2>

      <Form className="book-card" onSubmit={handleAddBook}>
        <Form.Group controlId="formTitle" className="w-100">
          <Form.Label>Title:</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formAuthor" className="mt-2 w-100">
          <Form.Label>Author:</Form.Label>
          <Form.Control
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Add Book
        </Button>
      </Form>

      <BookCount count={bookCount || books.length} />

      {loading ? (
        <Spinner animation="border" className="mt-3" />
      ) : (
        <>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <Row className="mt-3 book-list justify-content-center">
            {!Array.isArray(books) || books.length === 0 ? (
              <Col xs={12} className="text-center">
                <p>No books found. Add your first book above.</p>
              </Col>
            ) : (
              books.map((book) => (
                <Col sm={12} md={6} lg={4} key={book.book_id} className="mb-3">
                  <Card className="book-container">
                    <Card.Body className="card-body">
                      <div className="book-info">
                        <div className="book-details">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="title-author">
                              <Card.Title>{book.title}</Card.Title>
                              <Card.Subtitle className="author-name">
                                By {book.author}
                              </Card.Subtitle>
                            </div>
                          </div>

                          <Card.Img
                            variant="top"
                            src={
                              book.image_link
                                ? book.image_link.replace(/^http:/, 'https:')
                                : 'https://placehold.co/300x450?text=No+Cover'
                            }
                            alt={book.title}
                            className="img-fluid mt-2 mb-2 clickable-image"
                            onClick={() =>
                              book.preview_link &&
                              window.open(book.preview_link, '_blank')
                            }
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://placehold.co/300x450?text=No+Cover';
                            }}
                          />

                          {book.description_book && (
                            <p className="mt-2 small">{book.description_book}</p>
                          )}

                          {book.categories && (
                            <div className="book-categories mt-2">
                              <strong>Categories: </strong>
                              {Array.isArray(book.categories)
                                ? book.categories.join(', ')
                                : book.categories}
                            </div>
                          )}

                          <div className="rating-title-author mt-2">
                            <Rating
                              initialRating={book.rating || 0}
                              onChange={(rate) =>
                                handleRatingChange(book.book_id, rate)
                              }
                            />
                          </div>

                          <div className="button-group mt-2">
                            <Button
                              className="custom-button custom-button-primary"
                              onClick={() => handleDeleteBook(book.book_id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        </>
      )}
    </Container>
  );
}

export default Books;
