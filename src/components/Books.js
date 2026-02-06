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

function Books() {
  const [books, setBooks] = useState([]); // always treat as array
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId] = useState(localStorage.getItem('userId'));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookCount, setBookCount] = useState(0);

  // Small helper to normalize API data into an array
  const normalizeBooks = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.books)) return data.books;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError('No user found. Please log in again.');
      return;
    }

    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchBooks(userId);
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

      // Reload books after adding
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
    try {
      setError(null);
      const response = await deleteBook(bookId);

      if (response.data?.success) {
        setBooks((prev) => prev.filter((book) => book.id !== bookId));

        if (typeof response.data.bookCount === 'number') {
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
        book.id === bookId ? { ...book, rating: rate } : book
      )
    );
    // later you can call an updateBookRating API here
  };

  return (
    <Container className="px-3">
      <h2 className="username-color">Welcome User</h2>

      {/* Add Book Form */}
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

      {/* Book Count + List */}
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
                <Col
                  sm={12}
                  md={6}
                  lg={4}
                  key={book.id || book.book_id}
                  className="mb-3"
                >
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

                          {/* GOOGLE IMAGE + PREVIEW */}
                          <Card.Img
                            variant="top"
                            src={
                              book.image_link ||
                              'https://via.placeholder.com/300'
                            }
                            alt={book.title}
                            className="img-fluid mt-2 mb-2 clickable-image"
                            onClick={() =>
                              book.preview_link &&
                              window.open(book.preview_link, '_blank')
                            }
                          />

                          {/* GOOGLE DESCRIPTION */}
                          {book.description_book && (
                            <p className="mt-2 small">
                              {book.description_book}
                            </p>
                          )}

                          {/* GOOGLE CATEGORIES */}
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
                                handleRatingChange(book.id, rate)
                              }
                            />
                          </div>

                          <div className="button-group mt-2">
                            <Button
                              className="custom-button custom-button-primary"
                              onClick={() => handleDeleteBook(book.id)}
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
