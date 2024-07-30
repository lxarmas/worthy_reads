import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Alert, Card, Container, Row, Col, Spinner } from 'react-bootstrap';

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId] = useState(localStorage.getItem('userId')); // Ensure this is set during login
  const [error, setError] = useState(null); // For displaying errors
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/books/${userId}`);
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Failed to fetch books. Please try again.');
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (userId) {
      fetchBooks();
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Clear userId on logout
    navigate('/login');
  };

  const handleAddBook = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/books', { title, author, user_id: userId });
      setBooks(prevBooks => [...prevBooks, response.data]); // Add the new book to the list
      setTitle('');
      setAuthor('');
    } catch (error) {
      console.error('Error adding book:', error);
      setError('Failed to add book. Please try again.'); // Display error
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`http://localhost:3000/api/books/${bookId}`);
      setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId)); // Remove deleted book
    } catch (error) {
      console.error('Error deleting book:', error);
      setError('Failed to delete book. Please try again.'); // Display error
    }
  };

  return (
    <Container>
      <Button variant="danger" className="mt-3" onClick={handleLogout}>Logout</Button>
      <h2 className="mt-3">Welcome User</h2>

      <Form className="mt-3" onSubmit={handleAddBook}>
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

      <h2 className="mt-4">Your Books</h2>

      {loading ? (
        <Spinner animation="border" className="mt-3" />
      ) : (
        <>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <Row className="mt-3">
            {books.map((book) => (
              <Col sm={12} md={6} lg={4} key={book.book_id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">By {book.author}</Card.Subtitle>
                    {book.image_link && <Card.Img variant="top" src={book.image_link} alt={book.title} />}
                    <Card.Text>{book.description_book}</Card.Text>
                    <Button variant="danger" onClick={() => handleDeleteBook(book.book_id)}>Delete</Button>
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
