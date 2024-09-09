import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Alert, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import Rating from 'react-rating';
import BookCount from './BookCount';
import BookDescription from './BookDescription.js';
import Nav from './Nav';
import './Books.css';
import { motion } from "framer-motion";

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId] = useState(localStorage.getItem('userId')); 
  const [user, setUser] = useState(null); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [bookCount, setBookCount] = useState(0); 
  const [selectedBookId, setSelectedBookId] = useState(null); 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/books/${userId}`);
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Failed to fetch books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user data. Please try again.');
      }
    };

    if (userId) {
      fetchBooks();
      fetchUser();
    }
  }, [userId]);

  const handleAddBook = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/books', { title, author, user_id: userId });
      const response = await axios.get(`http://localhost:3000/api/books/${userId}`);
      setBooks(response.data);
      setTitle('');
      setAuthor('');
    } catch (error) {
      console.error('Error adding book:', error);
      setError('Failed to add book. Please try again.');
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/books/${bookId}`);
      if (response.data.success) {
        setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId));
        setBookCount(response.data.bookCount);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      setError('Failed to delete book. Please try again.');
    }
  };

  const handleRatingChange = async (bookId, rate) => {
    console.log(`Book ID: ${bookId}, Rating: ${rate}`); // Log bookId and rate

    try {
      await axios.put(`http://localhost:3000/api/books/${bookId}/rating`, { rating: rate });
      
      setBooks(books.map(book => 
        book.book_id === bookId ? { ...book, rating: rate } : book
      ));
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  const toggleDescription = (bookId) => {
    setSelectedBookId(selectedBookId === bookId ? null : bookId);
  };

  return (
    <Container>
      <Nav />
      <h2 className="username-color">
        Welcome {user ? `${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1)}` : "Loading..."}
      </h2>

      <Form className="book-card" onSubmit={handleAddBook}>
        <Form.Group controlId="formTitle">
          <Form.Label>Title:</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formAuthor" className="mt-2">
          <Form.Label>Author:</Form.Label>
          <Form.Control
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">Add Book</Button>
      </Form>

      <BookCount count={bookCount || books.length} />

      {loading ? (
        <Spinner animation="border" className="mt-3" />
      ) : (
        <>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          <Row className="mt-3">
            {books.map((book) => (
              <Col sm={6} md={4} lg={3} key={book.book_id} className="mb-3">
                <Card className="book-container">
                  <div className="book-details">
                    <Card.Body onClick={() => toggleDescription(book.book_id)} style={{ cursor: 'pointer' }}>
                      <Card.Title>{book.title}</Card.Title>
                      <Card.Subtitle className="author-name">By {book.author}</Card.Subtitle>

                      {/* Display categories */}
                      {book.categories && book.categories.length > 0 && (
                        <div className="book-categories">
                          <strong>Categories: </strong>
                          {book.categories.join(', ')}
                        </div>
                      )}

                      {book.image_link && (
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
                          className="img-fluid"
                          style={{ width: '70%', height: 'auto', objectFit: 'cover' }}
                        />
                      )}

                      <Button variant="danger" onClick={() => handleDeleteBook(book.book_id)}>Delete</Button>

                      {/* Add Rating Component */}
                    </Card.Body>
                      <Rating
                        initialRating={book.rating || 0}
                        onChange={(rate) => {
                          console.log('Selected Rating:', rate); // Debugging: Log the selected rating
                          handleRatingChange(book.book_id, rate);
                        }}
                        emptySymbol={
                          <motion.i
                            className="fa fa-star-o fa-2x shaded-star"
                            whileHover={{ scale: 1.3, rotate: 15, boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.5)" }}
                            whileTap={{ scale: 1.5, rotate: 0 }}
                            style={{ color: "lightgray" }}
                          />
                        }
                        fullSymbol={
                          <motion.i
                            className="fa fa-star fa-2x shaded-star"
                            whileHover={{ scale: 1.3, rotate: 15, boxShadow: "0px 6px 12px rgba(255, 204, 0, 0.8)" }}
                            whileTap={{ scale: 1.5, rotate: 0 }}
                            style={{ color: "gold" }}
                          />
                        }
                      />
                  </div>
                  {selectedBookId === book.book_id && (
                    <div className="book-description-wrapper">
                      <BookDescription description={book.description_book} />
                    </div>
                  )}
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
