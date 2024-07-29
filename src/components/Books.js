import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Book() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId, setUserId] = useState(localStorage.getItem('userId')); // Assuming user ID is stored in local storage
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data and books
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books');
        setBooks(response.data.books);
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleAddBook = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/books', { title, author, user_id: userId });
      setBooks(response.data.dbData); // Update the books list with the new book
      setTitle('');
      setAuthor('');
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const response = await axios.delete(`/api/books/${bookId}`);
      setBooks(response.data.dbData); // Update the books list after deletion
    } catch (error) {
      console.error('Error deleting book:', error);
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
