import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import {
  fetchBooks,
  addBook,
  deleteBook,
  // fetchBooksByCategory, // use later if needed
} from '../api';

import Rating from './Rating';
import BookCount from './BookCount';
import BookDescription from './BookDescription';
import './Books.css';

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId] = useState(localStorage.getItem('userId'));
  const [user, setUser] = useState(null); // requires /api/users/:id route
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookCount, setBookCount] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState(null);

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
        setBooks(response.data);
        setBookCount(response.data.length || 0);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Optional: only if you implement /api/users/:userId
    const loadUser = async () => {
      try {
        // TODO: implement a getUser(userId) in api.js and use it here
        // const response = await getUser(userId);
        // setUser(response.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    loadBooks();
    loadUser();
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

      // Refresh book list
      const response = await fetchBooks(userId);
      setBooks(response.data);
      setBookCount(response.data.length || 0);

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
        setBooks((prevBooks) => prevBooks.filter((book) => book.book_id !== bookId));
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

  const handleRatingChange = async (bookId, rate) => {
    try {
      setError(null);
      // If you add updateBookRating in api.js, call it here
      // await updateBookRating(bookId, rate);

      // For now, optimistic UI update only
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.book_id === bookId ? { ...book, rating: rate } : book
        )
      );
    } catch (err) {
      console.error('Error updating rating:', err);
    }
  };

  const toggleDescription = (bookId) => {
    setSelectedBookId((prev) => (prev === bookId ? null : bookId));
  };

  return (
    <Container className="px-3">
      <h2 className="username-color">
        Welcome{' '}
        {user
          ? `${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1)}`
          : 'User'}
      </h2>

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
            {books.map((book) => (
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
                          <Button
                            className="question-button"
                            onClick={() => toggleDescription(book.book_id)}
                            style={{ all: 'unset' }}
                          >
                            ?
                          </Button>
                        </div>

                        <img
                          srcSet={`
                            ${book.image_link}-small.jpg 500w,
                            ${book.image_link}-medium.jpg 1000w,
                            ${book.image_link}-large.jpg 1500w,
                            ${book.image_link}-xlarge.jpg 3000w
                          `}
                          sizes="(max-width: 600px) 500px, (max-width: 1200px) 1000px, 1500px"
                          src={`${book.image_link}-x-large.jpg`}
                          alt={book.title}
                          className="img-fluid clickable-image"
                          onClick={() =>
                            book.previewLink && window.open(book.previewLink, '_blank')
                          }
                        />

                        <div className="rating-title-author mt-2">
                          <Rating
                            initialRating={book.rating || 0}
                            onChange={(rate) => handleRatingChange(book.book_id, rate)}
                          />
                        </div>

                        {book.categories?.length > 0 && (
                          <div className="book-categories">
                            <strong>Categories: </strong>
                            {book.categories.map((category, index) => (
                              <React.Fragment key={category}>
                                <Link to={`/category/${category}`}>{category}</Link>
                                {index < book.categories.length - 1 && ', '}
                              </React.Fragment>
                            ))}
                          </div>
                        )}

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

                    {selectedBookId === book.book_id && (
                      <div
                        className="book-description-wrapper"
                        key={`description-${book.book_id}`}
                      >
                        <BookDescription
                          description={book.description_book}
                          onClick={() => toggleDescription(book.book_id)}
                        />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default Books;
