import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Alert, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import BookCount from './BookCount';
import BookDescription from './BookDescription.js';
import Nav from './Nav';
import './Books.css';



function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId] = useState(localStorage.getItem('userId')); // Ensure this is set during login
  const [user, setUser] = useState(null); // State for user data
  const [error, setError] = useState(null); // For displaying errors
  const [loading, setLoading] = useState(true); // Loading state
  const [bookCount, setBookCount] = useState(0); // State for book count
  const [selectedBookId, setSelectedBookId] = useState(null); // Track selected book ID
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Clear userId on logout
    navigate('/login');
  };
  const handleAddBook = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/books', { title, author, user_id: userId });
  
      // Re-fetch the list of books
      const response = await axios.get(`http://localhost:3000/api/books/${userId}`);
      setBooks(response.data); // Update the books state with the latest data
  
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
        setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId)); // Remove deleted book
        setBookCount(response.data.bookCount); // Update the book count
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      setError('Failed to delete book. Please try again.'); // Display error
    }
  };

  const toggleDescription = (bookId) => {
    setSelectedBookId(selectedBookId === bookId ? null : bookId); // Toggle visibility
  };

  return (
    <Container>
      <Nav/>
      <Button variant="danger" className="mt-3" onClick={handleLogout}>Logout</Button>
      <h2 className="username-color">
  Welcome {user ? `${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1)}` : "Loading..."}
</h2>


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

     
<h2 className="mt-4">
  Total Books you have read: 
  {user ? (
    <span className="username-color">
      {`${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1)}`}
    </span>
  ) : 'Loading...'}
</h2>

      
      {/* Use BookCount component */}
      <BookCount count={bookCount || books.length} />

      {loading ? (
        <Spinner animation="border" className="mt-3" />
      ) : (
        <>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

          <Row className="mt-3">
            {books.map((book) => (
              <Col sm={4} md={3} lg={2} key={book.book_id} className="mb-3">
                <Card onClick={() => toggleDescription(book.book_id)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">By {book.author}</Card.Subtitle>
                    {book.image_link && <Card.Img variant="top" src={book.image_link} alt={book.title} />}
                    {selectedBookId === book.book_id && (
                      <BookDescription description={book.description_book} />
                    )}
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
