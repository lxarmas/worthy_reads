import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Book() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId')); // Ensure this is set during login
  const [user, setUser] = useState({});
  const [error, setError] = useState(null); // For displaying errors
  const navigate = useNavigate();

useEffect(() => {
  const fetchBooks = async () => {
    if (!userId) return; // Don't fetch if userId is not set
    try {
      const response = await axios.get(`http://localhost:3000/api/books/${userId}`); // Fetch books for the specific user
      setBooks(response.data); // Set the fetched books to state
    } catch (error) {
      console.error('Error fetching books:', error);
      setError('Failed to fetch books. Please try again.'); // Display error
    }
  };

  fetchBooks();
}, [userId]); // Re-run if userId changes

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
    <div>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <h2 className="welcomeName">Welcome {user.first_name}</h2>

      <form className="book-card" onSubmit={handleAddBook}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="author">Author:</label>
        <input
          type="text"
          id="author"
          name="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <button type="submit">Add Book</button>
      </form>

      {error && <p className="text-danger">{error}</p>} {/* Display error message */}

      <h2 className="countBook">You have read <span id="bookCount">{books.length}</span> books, keep up the good work, friend!</h2>

      <ul className="book-list">
        {books.length > 0 ? (
          books.map((book) => (
            <li key={book.book_id} className="book">
              <button
                className="deleteButton"
                onClick={() => handleDeleteBook(book.book_id)}
              >
                Delete
              </button>
              <div className="book-cover">
                {book.image_link ? (
                  <img src={book.image_link} alt="Book Cover" className="book-image" />
                ) : (
                  <span className="error-message">Cover image not available</span>
                )}
              </div>
              <div className="book-details">
                <div className="description-container">
                  {book.description_book.trim() !== '' ? (
                    <span className="description">{book.description_book}</span>
                  ) : (
                    <span className="description">Worthy Reads apologizes, no information about this book at the moment</span>
                  )}
                </div>
                <span className="book-title">Book Title: {book.title}</span>
                <span className="author">Author: {book.author}</span>
              </div>
            </li>
          ))
        ) : (
          <li>No books found</li>
        )}
      </ul>
    </div>
  );
}

export default Book;
